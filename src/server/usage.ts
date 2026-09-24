import { randomBytes } from "node:crypto";
import { and, count, eq, gte, inArray, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { missionRuns, missions, usageRecords } from "@/db/schema";
import { PRICING_VERSION } from "@/server/llm/types";

/**
 * Usage ledger (one row per analysis or execution run). It is independent of
 * missions: deleting a mission neither frees quota nor erases the costs needed
 * to measure the pilot. It never stores content (no titles, requests, queries,
 * URLs or file names), only dates, counters and costs.
 */

type Executor = Pick<Db, "insert" | "execute">;

/** Opens the ledger row of a run. Called in the same transaction as the run creation. */
export async function openUsageRecord(
  db: Executor,
  p: { userId: string; missionId: string; runId: string; kind: "analysis" | "execution"; model: string | null; searchProvider: string | null },
) {
  await db.insert(usageRecords).values({
    userId: p.userId,
    missionRef: sql`(select ${missions.usageRef} from ${missions} where ${missions.id} = ${p.missionId})`,
    runId: p.runId,
    kind: p.kind,
    model: p.model,
    searchProvider: p.searchProvider,
    pricingVersion: PRICING_VERSION,
  });
}

/**
 * Closes the ledger rows of finished runs with totals taken from the execution
 * logs. With `force`, runs still marked RUNNING are closed as INTERRUPTED (used
 * right before their mission is deleted, when the logs are about to disappear).
 */
export async function closeUsageRecords(db: Db, runIds: string[], opts: { force?: boolean } = {}) {
  if (!runIds.length) return;
  const ids = sql.join(
    runIds.map((id) => sql`${id}::uuid`),
    sql`, `,
  );
  await db.execute(sql`
    update usage_records u set
      ended_at = coalesce(r.finished_at, now()),
      duration_ms = (extract(epoch from (coalesce(r.finished_at, now()) - r.started_at)) * 1000)::int,
      outcome = case when r.status = 'RUNNING' then 'INTERRUPTED'::run_status else r.status end,
      model = coalesce(a.model, u.model),
      llm_calls = a.llm_calls,
      tool_calls = a.tool_calls,
      web_searches = a.web_searches,
      pages_fetched = a.pages_fetched,
      errors = a.errors,
      input_tokens = a.input_tokens,
      output_tokens = a.output_tokens,
      estimated_cost_usd = a.cost
    from mission_runs r
    cross join lateral (
      select
        max(l.details->>'model') as model,
        (count(*) filter (where l.kind like 'llm:%'))::int as llm_calls,
        (count(*) filter (where l.kind like 'tool:%'))::int as tool_calls,
        (count(*) filter (where l.kind = 'tool:web_search'))::int as web_searches,
        (count(*) filter (where l.kind = 'tool:fetch_page' and l.status = 'ok'))::int as pages_fetched,
        (count(*) filter (where l.status <> 'ok'))::int as errors,
        coalesce(sum(l.input_tokens), 0)::int as input_tokens,
        coalesce(sum(l.output_tokens), 0)::int as output_tokens,
        case when bool_or(l.kind like 'llm:%' and l.status = 'ok' and l.estimated_cost_usd is null) then null
             else coalesce(sum(l.estimated_cost_usd) filter (where l.kind like 'llm:%' and l.status = 'ok'), 0) end as cost
      from execution_logs l where l.run_id = r.id
    ) a
    where u.run_id = r.id
      and u.ended_at is null
      and r.id in (${ids})
      and (r.status <> 'RUNNING' ${opts.force ? sql`or true` : sql``})
  `);
}

/** Closes the ledger rows of every run of these missions (call before deleting them). */
export async function closeUsageForMissions(db: Db, missionIds: string[]) {
  if (!missionIds.length) return;
  const runs = await db.select({ id: missionRuns.id }).from(missionRuns).where(inArray(missionRuns.missionId, missionIds));
  await closeUsageRecords(
    db,
    runs.map((r) => r.id),
    { force: true },
  );
}

/**
 * Anonymizes the ledger rows of a deleted account: no user id, no run id,
 * dates truncated to the day, and mission references replaced by values derived
 * from a one-off random salt that is never stored. Rows of the same mission stay
 * grouped, but nothing links them back to the account or its missions.
 */
export async function anonymizeUsage(db: Db, userId: string) {
  const salt = randomBytes(32).toString("hex");
  await db.execute(sql`
    update usage_records set
      user_id = null,
      run_id = null,
      mission_ref = md5(mission_ref::text || ${salt})::uuid,
      started_at = date_trunc('day', started_at),
      ended_at = date_trunc('day', ended_at),
      anonymized_at = date_trunc('day', now())
    where user_id = ${userId}
  `);
}

/** Runs of a given kind started by the user in the last 24 h (quota), including deleted missions. */
export async function runsInLastDay(db: Db, userId: string, kind: "analysis" | "execution") {
  const since = new Date(Date.now() - 86_400_000);
  const [{ n }] = await db
    .select({ n: count() })
    .from(usageRecords)
    .where(and(eq(usageRecords.userId, userId), eq(usageRecords.kind, kind), gte(usageRecords.startedAt, since)));
  return n;
}

/** Usage summary for the settings page, from the ledger (survives mission deletion). */
export async function usageSummary(db: Db, userId: string, sinceDays = 30) {
  const since = new Date(Date.now() - sinceDays * 86_400_000);
  const [row] = await db
    .select({
      runs: sql<number>`count(*)::int`,
      llmCalls: sql<number>`coalesce(sum(${usageRecords.llmCalls}),0)::int`,
      toolCalls: sql<number>`coalesce(sum(${usageRecords.toolCalls}),0)::int`,
      errors: sql<number>`coalesce(sum(${usageRecords.errors}),0)::int`,
      inputTokens: sql<number>`coalesce(sum(${usageRecords.inputTokens}),0)::int`,
      outputTokens: sql<number>`coalesce(sum(${usageRecords.outputTokens}),0)::int`,
      // Null as soon as one closed run has an unknown cost: never display a partial total as complete.
      estimatedCostUsd: sql<string | null>`case when bool_or(${usageRecords.endedAt} is not null and ${usageRecords.estimatedCostUsd} is null) then null else sum(${usageRecords.estimatedCostUsd})::text end`,
    })
    .from(usageRecords)
    .where(and(eq(usageRecords.userId, userId), gte(usageRecords.startedAt, since)));
  return row;
}
