import { and, count, eq, gte, inArray, lt } from "drizzle-orm";
import type { Db } from "@/db";
import { executionLogs, missionRuns, missions, missionSteps, type MissionRun } from "@/db/schema";
import { conflict, tooMany, unavailable } from "@/server/errors";
import { LlmError, type LlmProvider } from "@/server/llm/types";
import { addMessage, getOwnedMission, refreshMissionStatus } from "@/server/missions/service";
import type { PageFetcher } from "@/server/search/fetch-page";
import type { SearchProvider } from "@/server/search/providers";
import { analyzeMission } from "./analyze";
import { executeMission, type RunLimits } from "./orchestrator";
import type { Capabilities } from "./prompts";

export type AgentDeps = {
  db: Db;
  llm: LlmProvider | null;
  search: SearchProvider | null;
  fetchPage: PageFetcher;
  limits: RunLimits & { runsPerDay: number; analysesPerDay: number; staleRunSeconds: number };
};

export function capabilitiesOf(deps: AgentDeps): Capabilities {
  return { webSearch: Boolean(deps.search), searchProvider: deps.search?.name ?? null };
}

// In-process abort controllers so a cancel request interrupts in-flight calls.
const g = globalThis as unknown as { __atlasRuns?: Map<string, AbortController> };
const controllers = (g.__atlasRuns ??= new Map());

const LLM_MISSING =
  "Aucun fournisseur de modèle de langage n'est configuré (variable ANTHROPIC_API_KEY absente). L'analyse et l'exécution automatiques sont indisponibles.";

async function assertNoActiveRun(db: Db, missionId: string, staleSeconds: number) {
  await recoverStaleRuns(db, missionId, staleSeconds);
  const active = await db.query.missionRuns.findFirst({
    where: and(eq(missionRuns.missionId, missionId), eq(missionRuns.status, "RUNNING")),
  });
  if (active) throw conflict("Atlas travaille déjà sur cette mission.");
}

async function assertQuota(db: Db, userId: string, kind: "analysis" | "execution", max: number) {
  const since = new Date(Date.now() - 86_400_000);
  const [{ n }] = await db
    .select({ n: count() })
    .from(missionRuns)
    .where(and(eq(missionRuns.userId, userId), eq(missionRuns.kind, kind), gte(missionRuns.startedAt, since)));
  if (n >= max) {
    throw tooMany(
      kind === "analysis"
        ? `Limite quotidienne d'analyses atteinte (${max} par 24 h).`
        : `Limite quotidienne d'exécutions atteinte (${max} par 24 h).`,
    );
  }
}

/**
 * Marks runs whose process died (no heartbeat) as interrupted so the mission
 * can be resumed, and reopens steps left "in progress".
 */
export async function recoverStaleRuns(db: Db, missionId: string, staleSeconds = 180) {
  const threshold = new Date(Date.now() - staleSeconds * 1000);
  const stale = await db
    .update(missionRuns)
    .set({ status: "INTERRUPTED", finishedAt: new Date(), stopReason: "Exécution interrompue (serveur redémarré ou délai dépassé)." })
    .where(and(eq(missionRuns.missionId, missionId), eq(missionRuns.status, "RUNNING"), lt(missionRuns.heartbeatAt, threshold)))
    .returning();
  if (!stale.length) return false;
  // Scoped to the steps owned by the run(s) just marked stale — never a step
  // a different, genuinely still-running run currently owns.
  await db
    .update(missionSteps)
    .set({ status: "PENDING", activeRunId: null })
    .where(
      and(
        eq(missionSteps.missionId, missionId),
        eq(missionSteps.status, "IN_PROGRESS"),
        inArray(
          missionSteps.activeRunId,
          stale.map((r) => r.id),
        ),
      ),
    );
  await addMessage(
    db,
    missionId,
    "event",
    "Le travail d'Atlas a été interrompu avant la fin. Ce qui avait été réalisé est conservé ; vous pouvez reprendre la mission.",
    { kind: "run_interrupted" },
  );
  await refreshMissionStatus(db, missionId);
  return true;
}

async function createRun(db: Db, userId: string, missionId: string, kind: "analysis" | "execution") {
  let run: MissionRun;
  try {
    [run] = await db.insert(missionRuns).values({ userId, missionId, kind, status: "RUNNING" }).returning();
  } catch (e) {
    // Unique partial index: another request started a run concurrently.
    if ((e as { cause?: { code?: string }; code?: string }).cause?.code === "23505" || (e as { code?: string }).code === "23505") {
      throw conflict("Atlas travaille déjà sur cette mission.");
    }
    throw e;
  }
  await db.update(missions).set({ status: "IN_PROGRESS" }).where(eq(missions.id, missionId));
  return run;
}

function track(runId: string) {
  const ctrl = new AbortController();
  controllers.set(runId, ctrl);
  return ctrl;
}

export type StartedRun = { run: MissionRun; done: Promise<void> };

/** Starts the understanding / planning phase in the background. */
export async function startAnalysis(deps: AgentDeps, userId: string, missionId: string): Promise<StartedRun> {
  await getOwnedMission(deps.db, userId, missionId);
  if (!deps.llm) {
    await addMessage(deps.db, missionId, "event", LLM_MISSING, { kind: "llm_unavailable" });
    throw unavailable(LLM_MISSING);
  }
  await assertNoActiveRun(deps.db, missionId, deps.limits.staleRunSeconds);
  await assertQuota(deps.db, userId, "analysis", deps.limits.analysesPerDay);
  const run = await createRun(deps.db, userId, missionId, "analysis");
  const ctrl = track(run.id);
  const llm = deps.llm;

  const done = (async () => {
    // Keeps the heartbeat fresh during the (single, possibly long) model call.
    const beat = setInterval(() => {
      void deps.db.update(missionRuns).set({ heartbeatAt: new Date() }).where(eq(missionRuns.id, run.id));
    }, 20_000);
    try {
      await analyzeMission({ db: deps.db, llm, capabilities: capabilitiesOf(deps) }, missionId, run.id, ctrl.signal);
      await deps.db
        .update(missionRuns)
        .set({ status: "SUCCEEDED", finishedAt: new Date(), iterations: 1 })
        .where(eq(missionRuns.id, run.id));
      await refreshMissionStatus(deps.db, missionId);
    } catch (e) {
      const err = e instanceof LlmError ? e : null;
      const cancelled = err?.kind === "aborted";
      const message = err?.message ?? "Erreur interne pendant l'analyse.";
      await deps.db
        .update(missionRuns)
        .set({ status: cancelled ? "CANCELLED" : "FAILED", finishedAt: new Date(), stopReason: message })
        .where(eq(missionRuns.id, run.id));
      await deps.db.update(missions).set({ lastError: cancelled ? null : message }).where(eq(missions.id, missionId));
      await addMessage(
        deps.db,
        missionId,
        "event",
        cancelled
          ? "Analyse interrompue."
          : `L'analyse n'a pas abouti : ${message}${err?.retryable ? " Vous pouvez relancer l'analyse." : ""}`,
        { kind: "analysis_failed", retryable: err?.retryable ?? false },
      );
      await refreshMissionStatus(deps.db, missionId);
      if (!err) console.error("[atlas] analysis crashed", e);
    } finally {
      clearInterval(beat);
      controllers.delete(run.id);
    }
  })();
  return { run, done };
}

/** Starts (or resumes) the execution of the plan in the background. */
export async function startExecution(deps: AgentDeps, userId: string, missionId: string): Promise<StartedRun> {
  const mission = await getOwnedMission(deps.db, userId, missionId);
  if (!deps.llm) throw unavailable(LLM_MISSING);
  await assertNoActiveRun(deps.db, missionId, deps.limits.staleRunSeconds);
  if (mission.missingInfo.some((m) => m.blocking)) {
    throw conflict("Des informations indispensables manquent encore. Répondez aux questions d'Atlas avant de lancer l'exécution.");
  }
  const steps = await deps.db.select().from(missionSteps).where(eq(missionSteps.missionId, missionId));
  const runnable = steps.filter((s) => !["DONE", "SKIPPED"].includes(s.status) && s.kind !== "user_action");
  if (!steps.length) throw conflict("Aucun plan n'a encore été établi pour cette mission.");
  if (!runnable.length) throw conflict("Il ne reste aucune étape qu'Atlas puisse exécuter. Les étapes restantes vous reviennent.");
  await assertQuota(deps.db, userId, "execution", deps.limits.runsPerDay);

  const run = await createRun(deps.db, userId, missionId, "execution");
  const ctrl = track(run.id);
  const llm = deps.llm;
  await addMessage(deps.db, missionId, "event", "Atlas commence l'exécution du plan.", { kind: "run_started", runId: run.id });

  const done = (async () => {
    const beat = setInterval(() => {
      void deps.db.update(missionRuns).set({ heartbeatAt: new Date() }).where(eq(missionRuns.id, run.id));
    }, 20_000);
    try {
      await executeMission(
        { db: deps.db, llm, search: deps.search, fetchPage: deps.fetchPage, capabilities: capabilitiesOf(deps), limits: deps.limits },
        { runId: run.id, missionId, userId, signal: ctrl.signal },
      );
    } catch (e) {
      console.error("[atlas] execution crashed", e);
      await deps.db
        .update(missionRuns)
        .set({ status: "FAILED", finishedAt: new Date(), stopReason: "Erreur interne." })
        .where(and(eq(missionRuns.id, run.id), eq(missionRuns.status, "RUNNING")));
      // Scoped to this run's own steps: a step another, still-active run
      // owns must not be reopened by this run's crash handler.
      await deps.db
        .update(missionSteps)
        .set({ status: "PENDING", activeRunId: null })
        .where(and(eq(missionSteps.missionId, missionId), eq(missionSteps.status, "IN_PROGRESS"), eq(missionSteps.activeRunId, run.id)));
      await addMessage(deps.db, missionId, "event", "Une erreur interne a interrompu l'exécution. Le travail déjà réalisé est conservé.", {
        kind: "run_crashed",
      });
      await refreshMissionStatus(deps.db, missionId, { lastRunFailed: true });
    } finally {
      clearInterval(beat);
      controllers.delete(run.id);
    }
  })();
  return { run, done };
}

export async function cancelRun(db: Db, userId: string, missionId: string) {
  await getOwnedMission(db, userId, missionId);
  const runs = await db
    .update(missionRuns)
    .set({ cancelRequested: true })
    .where(and(eq(missionRuns.missionId, missionId), eq(missionRuns.status, "RUNNING")))
    .returning({ id: missionRuns.id });
  for (const r of runs) controllers.get(r.id)?.abort();
  return runs.length > 0;
}

/** Aggregated real usage for one mission (from execution logs). */
export async function missionUsage(db: Db, missionId: string) {
  const logs = await db.select().from(executionLogs).where(eq(executionLogs.missionId, missionId));
  let cost = 0;
  let costKnown = logs.some((l) => l.kind.startsWith("llm:"));
  for (const l of logs) {
    if (l.kind.startsWith("llm:") && l.status === "ok") {
      if (l.estimatedCostUsd === null) costKnown = false;
      else cost += Number(l.estimatedCostUsd);
    }
  }
  return {
    llmCalls: logs.filter((l) => l.kind.startsWith("llm:")).length,
    toolCalls: logs.filter((l) => l.kind.startsWith("tool:")).length,
    errors: logs.filter((l) => l.status !== "ok").length,
    inputTokens: logs.reduce((a, l) => a + (l.inputTokens ?? 0), 0),
    outputTokens: logs.reduce((a, l) => a + (l.outputTokens ?? 0), 0),
    totalDurationMs: logs.reduce((a, l) => a + l.durationMs, 0),
    estimatedCostUsd: costKnown ? cost : null,
  };
}
