/**
 * Usage ledger: quotas and pilot costs must survive mission deletion, and
 * account deletion must leave only anonymous rows. The model is a scripted
 * test double; a known price is simulated by reporting a priced model name.
 */
import { eq, isNull, sql } from "drizzle-orm";
import { beforeEach, describe, expect, it } from "vitest";
import { missionRuns, missions, usageRecords } from "@/db/schema";
import { deleteAccount, purgeInactiveMissions } from "@/server/account";
import { analyzeMission } from "@/server/agent/analyze";
import type { Analysis } from "@/server/agent/analysis-schema";
import { recoverStaleRuns, startAnalysis, startExecution } from "@/server/agent/runner";
import { createUser } from "@/server/auth";
import { ScriptedProvider, textResult, toolCallsResult } from "@/server/llm/scripted";
import type { LlmProvider, LlmRequest } from "@/server/llm/types";
import { createMission, deleteMission } from "@/server/missions/service";
import { usageSummary } from "@/server/usage";
import { analysis } from "../helpers/agent";
import { createTestUser, db, makeDeps, MemoryStorage, resetDb } from "../helpers/db";

beforeEach(resetDb);

const step: Analysis["steps"][number] = { key: "a", title: "Organiser", description: "", kind: "planning", depends_on: [] };

/** Scripted model that reports a real, priced model name so costs are computed. */
function pricedModel(): LlmProvider {
  const inner = new ScriptedProvider((req) =>
    req.jsonSchema
      ? textResult(JSON.stringify(analysis({ steps: [step] })))
      : toolCallsResult([{ name: "finish_mission", input: { summary_markdown: "ok", remaining_actions: [], limitations: [] } }]),
  );
  return {
    name: "scripted",
    model: "claude-sonnet-5",
    isTestDouble: true,
    async complete(req: LlmRequest) {
      return { ...(await inner.complete(req)), model: "claude-sonnet-5" };
    },
  };
}

async function plannedMission(userId: string, request = "Mission confidentielle : contrat Dupont") {
  const m = await createMission(db, userId, request);
  await analyzeMission({ db, llm: pricedModel(), capabilities: { webSearch: false, searchProvider: null } }, m.id, null);
  return m;
}

const ledger = () => db.select().from(usageRecords);

describe("usage ledger", () => {
  it("records one row per run with counters and cost, and no content", async () => {
    const user = await createTestUser();
    const m = await plannedMission(user.id);
    const deps = makeDeps(pricedModel());
    await (await startExecution(deps, user.id, m.id)).done;

    const rows = await ledger();
    expect(rows).toHaveLength(1);
    const [row] = rows;
    const [mission] = await db.select().from(missions).where(eq(missions.id, m.id));
    expect(row).toMatchObject({
      userId: user.id,
      kind: "execution",
      outcome: "SUCCEEDED",
      model: "claude-sonnet-5",
      llmCalls: 1,
      inputTokens: 100,
      outputTokens: 50,
      missionRef: mission.usageRef,
      pricingVersion: expect.any(String),
    });
    expect(row.missionRef).not.toBe(m.id);
    expect(Number(row.estimatedCostUsd)).toBeGreaterThan(0);
    expect(row.endedAt).not.toBeNull();
    // Nothing from the mission content is stored.
    expect(JSON.stringify(row)).not.toMatch(/Dupont|confidentielle|Organiser/);
  });

  it("deleting a mission neither frees the daily quota nor erases its cost", async () => {
    const user = await createTestUser();
    const deps = makeDeps(pricedModel(), { limits: { ...makeDeps(null).limits, runsPerDay: 1, analysesPerDay: 1 } });

    const m1 = await createMission(db, user.id, "Première mission");
    await (await startAnalysis(deps, user.id, m1.id)).done;
    await (await startExecution(deps, user.id, m1.id)).done;
    const before = await usageSummary(db, user.id);
    expect(before.runs).toBe(2);

    await deleteMission(db, new MemoryStorage(), user.id, m1.id);

    const after = await usageSummary(db, user.id);
    expect(after).toEqual(before);
    expect(Number(after.estimatedCostUsd)).toBeGreaterThan(0);

    const m2 = await plannedMission(user.id, "Seconde mission");
    await expect(startAnalysis(deps, user.id, m2.id)).rejects.toMatchObject({ status: 429 });
    await expect(startExecution(deps, user.id, m2.id)).rejects.toMatchObject({ status: 429 });
  });

  it("closes the row of a run interrupted by a restart, and of a stale run whose mission is deleted", async () => {
    const user = await createTestUser();
    const m = await plannedMission(user.id);
    const deps = makeDeps(pricedModel());
    await (await startExecution(deps, user.id, m.id)).done;
    // Simulate a run whose process died, then its recovery.
    const [run] = await db.select().from(missionRuns).where(eq(missionRuns.missionId, m.id));
    await db.update(missionRuns).set({ status: "RUNNING", finishedAt: null, heartbeatAt: new Date(Date.now() - 600_000) }).where(eq(missionRuns.id, run.id));
    await db.update(usageRecords).set({ endedAt: null, outcome: null }).where(eq(usageRecords.runId, run.id));
    await recoverStaleRuns(db, m.id, 180);
    expect((await ledger())[0]).toMatchObject({ outcome: "INTERRUPTED", llmCalls: 1 });

    // Stale again, but the mission is purged before any recovery: totals are still recorded.
    await db.update(missionRuns).set({ status: "RUNNING", heartbeatAt: new Date(Date.now() - 600_000) }).where(eq(missionRuns.id, run.id));
    await db.update(usageRecords).set({ endedAt: null, outcome: null, llmCalls: 0 }).where(eq(usageRecords.runId, run.id));
    await db.update(missions).set({ updatedAt: new Date(Date.now() - 400 * 86_400_000), lastActivityAt: new Date(Date.now() - 400 * 86_400_000) }).where(eq(missions.id, m.id));
    expect((await purgeInactiveMissions(db, new MemoryStorage(), 365)).missions).toBe(1);
    expect((await ledger())[0]).toMatchObject({ outcome: "INTERRUPTED", llmCalls: 1 });
  });

  it("anonymizes the rows of a deleted account without losing aggregated costs", async () => {
    const gone = await createUser(db, { email: "gone@test.local", password: "motdepasse-solide" });
    const kept = await createTestUser();
    const deps = makeDeps(pricedModel());
    const m = await plannedMission(gone.id);
    await (await startExecution(deps, gone.id, m.id)).done;
    await (await startExecution(deps, gone.id, (await plannedMission(gone.id, "Autre")).id)).done;
    const other = await plannedMission(kept.id);
    await (await startExecution(deps, kept.id, other.id)).done;

    const [{ usageRef }] = await db.select({ usageRef: missions.usageRef }).from(missions).where(eq(missions.id, m.id));
    const runIds = (await db.select({ id: missionRuns.id }).from(missionRuns)).map((r) => r.id);
    const totalBefore = (await ledger()).reduce((a, r) => a + Number(r.estimatedCostUsd), 0);
    const keptBefore = await db.select().from(usageRecords).where(eq(usageRecords.userId, kept.id));

    await deleteAccount(db, new MemoryStorage(), gone.id, "motdepasse-solide");

    const anon = await db.select().from(usageRecords).where(isNull(usageRecords.userId));
    expect(anon).toHaveLength(2);
    for (const r of anon) {
      expect(r.runId).toBeNull();
      expect(runIds).not.toContain(r.missionRef);
      expect(r.missionRef).not.toBe(usageRef);
      expect(r.anonymizedAt).not.toBeNull();
    }
    // Dates are kept only to the day.
    const precise = await db.execute(
      sql`select count(*)::int as n from usage_records where user_id is null and (started_at <> date_trunc('day', started_at) or ended_at <> date_trunc('day', ended_at) or anonymized_at <> date_trunc('day', anonymized_at))`,
    );
    expect(precise.rows[0]).toEqual({ n: 0 });
    // The two missions of the deleted account keep distinct (re-randomized) references.
    expect(new Set(anon.map((r) => r.missionRef)).size).toBe(2);
    // Costs are unchanged overall, and the other account is untouched.
    expect((await ledger()).reduce((a, r) => a + Number(r.estimatedCostUsd), 0)).toBeCloseTo(totalBefore, 6);
    expect(await db.select().from(usageRecords).where(eq(usageRecords.userId, kept.id))).toEqual(keptBefore);
  });
});
