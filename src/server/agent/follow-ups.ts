import { and, asc, eq, isNotNull, lte } from "drizzle-orm";
import { missions } from "@/db/schema";
import { addMessage, hasActiveRun, refreshMissionStatus } from "@/server/missions/service";
import { continueMission, type AgentDeps, type ContinueOutcome } from "./runner";

export type FollowUpResult = { missionId: string; outcome: ContinueOutcome | "error"; error?: string };

/**
 * Claims the missions whose follow-up date has passed. Each mission is
 * claimed atomically (its date is cleared in the same statement), so two
 * overlapping calls never pick the same mission twice.
 */
export async function claimDueFollowUps(deps: AgentDeps, now = new Date(), limit = 20) {
  const due = await deps.db
    .select({ id: missions.id })
    .from(missions)
    .where(and(isNotNull(missions.nextFollowUpAt), lte(missions.nextFollowUpAt, now)))
    .orderBy(asc(missions.nextFollowUpAt))
    .limit(limit);
  const claimed: { id: string; userId: string; reason: string | null }[] = [];
  for (const { id } of due) {
    const current = await deps.db.query.missions.findFirst({ where: eq(missions.id, id) });
    if (!current?.nextFollowUpAt || current.nextFollowUpAt > now) continue;
    // Atlas is already working on it: leave it for the next call.
    if (await hasActiveRun(deps.db, id)) continue;
    const [row] = await deps.db
      .update(missions)
      .set({ nextFollowUpAt: null, followUpReason: null })
      .where(and(eq(missions.id, id), eq(missions.nextFollowUpAt, current.nextFollowUpAt)))
      .returning({ id: missions.id, userId: missions.userId });
    if (row) claimed.push({ ...row, reason: current.followUpReason });
  }
  return claimed;
}

/** Runs the claimed follow-ups one after the other. Never throws. */
export async function runFollowUps(deps: AgentDeps, claimed: { id: string; userId: string; reason: string | null }[]) {
  const results: FollowUpResult[] = [];
  for (const m of claimed) {
    await addMessage(
      deps.db,
      m.id,
      "event",
      `Reprise programmée du dossier${m.reason ? ` : ${m.reason}` : ""}. Atlas reprend le dossier. Si vous avez reçu une réponse, ajoutez-la à la conversation.`,
      { kind: "follow_up_due", reason: m.reason },
    );
    try {
      results.push({ missionId: m.id, outcome: await continueMission(deps, m.userId, m.id) });
    } catch (e) {
      const message = e instanceof Error ? e.message : "erreur inconnue";
      results.push({ missionId: m.id, outcome: "error", error: message });
      await addMessage(deps.db, m.id, "event", `La reprise programmée n'a pas pu aboutir : ${message}`, { kind: "follow_up_failed" });
      await refreshMissionStatus(deps.db, m.id);
    }
  }
  return results;
}
