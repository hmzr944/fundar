import { and, count, eq, gte, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { artifacts, documents, executionLogs, messages, missions, sources } from "@/db/schema";
import { logExecution } from "@/server/agent/log";
import { reviewDeliverable, type Review } from "@/server/agent/review";
import { tooMany, unavailable } from "@/server/errors";
import type { LlmProvider } from "@/server/llm/types";
import { getOwnedArtifact } from "./service";

/** What the reviewer checks a deliverable against: the mission's own material. */
export async function reviewMaterial(db: Db, missionId: string) {
  const mission = await db.query.missions.findFirst({ where: eq(missions.id, missionId) });
  const [docs, srcs, msgs] = await Promise.all([
    db
      .select({ name: documents.name, text: documents.extractedText })
      .from(documents)
      .where(and(eq(documents.missionId, missionId), eq(documents.status, "READY"))),
    db.select({ title: sources.title, url: sources.url, excerpt: sources.excerpt }).from(sources).where(eq(sources.missionId, missionId)),
    db
      .select({ content: messages.content })
      .from(messages)
      .where(and(eq(messages.missionId, missionId), eq(messages.role, "user")))
      .orderBy(messages.createdAt),
  ]);
  const missionContext = [
    `Objectif : ${mission?.objective ?? mission?.description ?? "-"}`,
    `Demande initiale : ${mission?.description ?? "-"}`,
    `Messages de l'utilisateur :\n${msgs.map((m) => `- ${m.content.slice(0, 2000)}`).join("\n") || "(aucun)"}`,
  ].join("\n");
  return {
    missionContext,
    documents: docs.filter((d): d is { name: string; text: string } => Boolean(d.text)),
    sources: srcs,
  };
}

/**
 * Reviews the current content of a stored deliverable on demand (e.g. after
 * the user edited it) and stores the result. Outside of any run.
 */
export async function reviewStoredArtifact(
  db: Db,
  llm: LlmProvider | null,
  userId: string,
  artifactId: string,
  opts: { maxPerDay: number } = { maxPerDay: 150 },
): Promise<Review> {
  if (!llm) throw unavailable("Aucun modèle n'est configuré : la relecture automatique est indisponible.");
  const art = await getOwnedArtifact(db, userId, artifactId);
  // Each on-demand review is a paid model call: cap them per user and per day.
  const [{ n }] = await db
    .select({ n: count() })
    .from(executionLogs)
    .innerJoin(missions, eq(missions.id, executionLogs.missionId))
    .where(
      and(
        eq(missions.userId, userId),
        eq(executionLogs.kind, "llm:review"),
        sql`${executionLogs.details}->>'onDemand' = 'true'`,
        gte(executionLogs.createdAt, new Date(Date.now() - 86_400_000)),
      ),
    );
  if (n >= opts.maxPerDay) throw tooMany(`Limite quotidienne de relectures atteinte (${opts.maxPerDay} par 24 h).`);
  const t0 = Date.now();
  const material = await reviewMaterial(db, art.missionId);
  const { review, usage, model } = await reviewDeliverable(llm, { type: art.type, title: art.name, content: art.content, ...material });
  await logExecution(db, {
    missionId: art.missionId,
    kind: "llm:review",
    status: review.status === "done" ? "ok" : "error",
    durationMs: Date.now() - t0,
    model: model ?? undefined,
    usage: usage ?? undefined,
    details: { artifactId: art.id, verdict: review.verdict, issues: review.issues.length, onDemand: true },
  });
  await db
    .update(artifacts)
    .set({ metadata: { ...art.metadata, review } })
    .where(eq(artifacts.id, art.id));
  return review;
}
