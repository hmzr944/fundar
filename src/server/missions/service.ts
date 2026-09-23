import { and, desc, eq, ilike, inArray, or, gte, sql } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "@/db";
import {
  artifacts,
  documents,
  executionLogs,
  messages,
  missionRuns,
  missions,
  missionSteps,
  sources,
  type Mission,
  type MissionStatus,
  type StepStatus,
} from "@/db/schema";
import type { Analysis } from "@/server/agent/analysis-schema";
import { badRequest, conflict, notFound } from "@/server/errors";
import type { FileStorage } from "@/server/documents/storage";
import { mergePlan } from "./plan";
import { ACTIVE_STATUSES, deriveMissionStatus, NEEDS_ACTION_STATUSES } from "./status";

export const missionRequestSchema = z.object({
  request: z
    .string()
    .trim()
    .min(5, "Décrivez votre mission en quelques mots au moins.")
    .max(8000, "Demande trop longue (8 000 caractères maximum)."),
});

export const messageSchema = z.object({
  content: z.string().trim().min(1, "Message vide.").max(8000, "Message trop long (8 000 caractères maximum)."),
});

export const stepUpdateSchema = z.object({
  status: z.enum(["PENDING", "DONE", "SKIPPED", "WAITING_USER"]),
  note: z.string().trim().max(2000).optional(),
});

export const uuidSchema = z.string().uuid("Identifiant invalide.");

function assertUuid(id: string, what: string) {
  if (!uuidSchema.safeParse(id).success) throw notFound(what);
}

/** Loads a mission only if it belongs to the user. Missing and foreign missions look identical. */
export async function getOwnedMission(db: Db, userId: string, missionId: string): Promise<Mission> {
  assertUuid(missionId, "Mission");
  const mission = await db.query.missions.findFirst({
    where: and(eq(missions.id, missionId), eq(missions.userId, userId)),
  });
  if (!mission) throw notFound("Mission");
  return mission;
}

export type MissionFilter = "all" | "active" | "needs_action" | "done";

export async function listMissions(db: Db, userId: string, opts: { filter?: MissionFilter; q?: string; limit?: number } = {}) {
  const conds = [eq(missions.userId, userId)];
  if (opts.filter === "active") conds.push(inArray(missions.status, ["IN_PROGRESS", ...ACTIVE_STATUSES]));
  if (opts.filter === "needs_action") conds.push(inArray(missions.status, NEEDS_ACTION_STATUSES));
  if (opts.filter === "done") conds.push(inArray(missions.status, ["COMPLETED", "FAILED"]));
  if (opts.q?.trim()) {
    const q = `%${opts.q.trim().replace(/[%_\\]/g, (c) => `\\${c}`)}%`;
    conds.push(or(ilike(missions.title, q), ilike(missions.description, q), ilike(missions.objective, q))!);
  }
  const rows = await db
    .select({
      id: missions.id,
      title: missions.title,
      objective: missions.objective,
      status: missions.status,
      createdAt: missions.createdAt,
      updatedAt: missions.updatedAt,
      totalSteps: sql<number>`(select count(*)::int from ${missionSteps} s where s.mission_id = ${missions.id})`,
      doneSteps: sql<number>`(select count(*)::int from ${missionSteps} s where s.mission_id = ${missions.id} and s.status in ('DONE','SKIPPED'))`,
    })
    .from(missions)
    .where(and(...conds))
    .orderBy(desc(missions.updatedAt))
    .limit(Math.min(opts.limit ?? 100, 200));
  return rows;
}

export async function getMissionDetail(db: Db, userId: string, missionId: string) {
  const mission = await getOwnedMission(db, userId, missionId);
  const [steps, msgs, arts, srcs, docs, runs] = await Promise.all([
    db.select().from(missionSteps).where(eq(missionSteps.missionId, missionId)).orderBy(missionSteps.position),
    db.select().from(messages).where(eq(messages.missionId, missionId)).orderBy(messages.createdAt),
    db
      .select({
        id: artifacts.id,
        stepId: artifacts.stepId,
        type: artifacts.type,
        name: artifacts.name,
        content: artifacts.content,
        editedByUser: artifacts.editedByUser,
        createdAt: artifacts.createdAt,
        updatedAt: artifacts.updatedAt,
      })
      .from(artifacts)
      .where(eq(artifacts.missionId, missionId))
      .orderBy(artifacts.createdAt),
    db.select().from(sources).where(eq(sources.missionId, missionId)).orderBy(sources.retrievedAt),
    db
      .select({
        id: documents.id,
        name: documents.name,
        mimeType: documents.mimeType,
        sizeBytes: documents.sizeBytes,
        status: documents.status,
        extractedChars: documents.extractedChars,
        error: documents.error,
        createdAt: documents.createdAt,
      })
      .from(documents)
      .where(eq(documents.missionId, missionId))
      .orderBy(documents.createdAt),
    db.select().from(missionRuns).where(eq(missionRuns.missionId, missionId)).orderBy(desc(missionRuns.startedAt)).limit(10),
  ]);
  return { mission, steps, messages: msgs, artifacts: arts, sources: srcs, documents: docs, runs };
}

export async function createMission(db: Db, userId: string, request: string) {
  const title = request.split(/\n/)[0].slice(0, 80) + (request.length > 80 ? "…" : "");
  return db.transaction(async (tx) => {
    const [mission] = await tx
      .insert(missions)
      .values({ userId, title, description: request, status: "DRAFT" })
      .returning();
    await tx.insert(messages).values({ missionId: mission.id, role: "user", content: request });
    return mission;
  });
}

export async function addMessage(
  db: Db,
  missionId: string,
  role: "user" | "assistant" | "event",
  content: string,
  metadata: Record<string, unknown> = {},
) {
  const [msg] = await db.insert(messages).values({ missionId, role, content, metadata }).returning();
  await db.update(missions).set({ updatedAt: new Date() }).where(eq(missions.id, missionId));
  return msg;
}

export async function hasActiveRun(db: Db, missionId: string) {
  const run = await db.query.missionRuns.findFirst({
    where: and(eq(missionRuns.missionId, missionId), eq(missionRuns.status, "RUNNING")),
  });
  return Boolean(run);
}

/** Applies the result of an analysis: mission fields, plan merge and derived status. */
export async function applyAnalysis(db: Db, missionId: string, analysis: Analysis) {
  return db.transaction(async (tx) => {
    const existing = await tx.select().from(missionSteps).where(eq(missionSteps.missionId, missionId));
    const merge = mergePlan(existing, analysis.steps);
    if (merge.remove.length) await tx.delete(missionSteps).where(inArray(missionSteps.id, merge.remove));
    for (const u of merge.update) await tx.update(missionSteps).set(u.patch).where(eq(missionSteps.id, u.id));
    if (merge.insert.length) {
      await tx.insert(missionSteps).values(
        merge.insert.map((s) => ({
          missionId,
          key: s.key,
          title: s.title,
          description: s.description,
          kind: s.kind,
          dependsOn: s.depends_on,
          position: s.position,
        })),
      );
    }
    const steps = await tx.select().from(missionSteps).where(eq(missionSteps.missionId, missionId));
    const missingInfo = analysis.missing_info.slice(0, 8).map((m) => ({
      question: m.question.slice(0, 300),
      reason: m.reason.slice(0, 300),
      blocking: m.blocking,
    }));
    const status = deriveMissionStatus({
      steps,
      hasBlockingMissingInfo: missingInfo.some((m) => m.blocking),
    });
    const [mission] = await tx
      .update(missions)
      .set({
        title: analysis.title.slice(0, 120),
        objective: analysis.objective.slice(0, 600),
        reformulation: analysis.reformulation.slice(0, 1500),
        constraints: analysis.constraints.slice(0, 20).map((c) => ({ label: c.label.slice(0, 80), value: c.value.slice(0, 300) })),
        missingInfo,
        unsupported: analysis.unsupported.slice(0, 8),
        status,
        lastError: null,
      })
      .where(eq(missions.id, missionId))
      .returning();
    return mission;
  });
}

/** Recomputes and stores the mission status from the persisted facts. */
export async function refreshMissionStatus(db: Db, missionId: string, opts: { lastRunFailed?: boolean } = {}) {
  const mission = await db.query.missions.findFirst({ where: eq(missions.id, missionId) });
  if (!mission) return null;
  const [steps, active] = await Promise.all([
    db.select().from(missionSteps).where(eq(missionSteps.missionId, missionId)),
    hasActiveRun(db, missionId),
  ]);
  const status: MissionStatus = deriveMissionStatus({
    steps,
    hasBlockingMissingInfo: mission.missingInfo.some((m) => m.blocking),
    runActive: active,
    lastRunFailed: opts.lastRunFailed,
  });
  if (status !== mission.status) {
    await db.update(missions).set({ status }).where(eq(missions.id, missionId));
  }
  return status;
}

/**
 * Manual step update by the user. A step marked DONE this way is recorded as
 * declared by the user — Atlas never presents it as something it executed.
 */
export async function updateStepByUser(
  db: Db,
  userId: string,
  missionId: string,
  stepId: string,
  input: z.infer<typeof stepUpdateSchema>,
) {
  await getOwnedMission(db, userId, missionId);
  assertUuid(stepId, "Étape");
  if (await hasActiveRun(db, missionId)) {
    throw conflict("Une exécution est en cours. Attendez sa fin ou interrompez-la avant de modifier une étape.");
  }
  const step = await db.query.missionSteps.findFirst({
    where: and(eq(missionSteps.id, stepId), eq(missionSteps.missionId, missionId)),
  });
  if (!step) throw notFound("Étape");

  const status = input.status as StepStatus;
  if (status === "DONE" && step.kind !== "user_action") {
    throw badRequest(
      "Seule une étape « à réaliser par vous » peut être déclarée terminée directement. Pour les autres, laissez Atlas la terminer avec une preuve, ou ignorez-la.",
    );
  }
  const patch: Partial<typeof missionSteps.$inferInsert> = { status };
  if (status === "DONE" || status === "SKIPPED") {
    patch.completedBy = "user";
    patch.error = null;
    if (input.note) patch.result = input.note;
    else if (status === "DONE" && !step.result) patch.result = "Réalisée et déclarée par l'utilisateur.";
  } else {
    patch.completedBy = null;
  }
  await db.update(missionSteps).set(patch).where(eq(missionSteps.id, stepId));
  const label = { DONE: "terminée", SKIPPED: "ignorée", PENDING: "à refaire", WAITING_USER: "en attente" }[input.status];
  await addMessage(db, missionId, "event", `Vous avez marqué l'étape « ${step.title} » comme ${label}.${input.note ? `\n\n> ${input.note}` : ""}`, {
    kind: "step_update",
    stepId,
    declaredBy: "user",
  });
  const missionStatus = await refreshMissionStatus(db, missionId);
  return { stepId, status, missionStatus };
}

export async function deleteMission(db: Db, storage: FileStorage, userId: string, missionId: string) {
  await getOwnedMission(db, userId, missionId);
  if (await hasActiveRun(db, missionId)) {
    throw conflict("Interrompez l'exécution en cours avant de supprimer la mission.");
  }
  const docs = await db.select({ key: documents.storageKey }).from(documents).where(eq(documents.missionId, missionId));
  await db.delete(missions).where(and(eq(missions.id, missionId), eq(missions.userId, userId)));
  // Files are removed after the rows: an orphan file is harmless, a row pointing to a missing file is not.
  await Promise.allSettled(docs.map((d) => storage.delete(d.key)));
}

export async function renameMission(db: Db, userId: string, missionId: string, title: string) {
  const t = title.trim();
  if (!t || t.length > 120) throw badRequest("Titre invalide (1 à 120 caractères).");
  await getOwnedMission(db, userId, missionId);
  await db.update(missions).set({ title: t }).where(eq(missions.id, missionId));
}

/** Usage summary for the settings page (real numbers from the logs). */
export async function usageSummary(db: Db, userId: string, sinceDays = 30) {
  const since = new Date(Date.now() - sinceDays * 86_400_000);
  const [row] = await db
    .select({
      llmCalls: sql<number>`count(*) filter (where ${executionLogs.kind} like 'llm:%')::int`,
      toolCalls: sql<number>`count(*) filter (where ${executionLogs.kind} like 'tool:%')::int`,
      errors: sql<number>`count(*) filter (where ${executionLogs.status} <> 'ok')::int`,
      inputTokens: sql<number>`coalesce(sum(${executionLogs.inputTokens}),0)::int`,
      outputTokens: sql<number>`coalesce(sum(${executionLogs.outputTokens}),0)::int`,
      estimatedCostUsd: sql<string | null>`sum(${executionLogs.estimatedCostUsd})::text`,
    })
    .from(executionLogs)
    .innerJoin(missions, eq(missions.id, executionLogs.missionId))
    .where(and(eq(missions.userId, userId), gte(executionLogs.createdAt, since)));
  return row;
}
