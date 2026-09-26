import "server-only";
import { eq } from "drizzle-orm";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { missionUsage, recoverStaleRuns } from "@/server/agent/runner";
import { getAgentDeps, integrationStatus } from "@/server/deps";
import { getMissionDetail, getOwnedMission } from "./service";

/** Full mission workspace payload (shared by the page and the polling API). */
export async function loadMissionPayload(userId: string, missionId: string) {
  const db = getDb();
  await getOwnedMission(db, userId, missionId);
  await recoverStaleRuns(db, missionId, getAgentDeps().limits.staleRunSeconds);
  const detail = await getMissionDetail(db, userId, missionId);
  const usage = await missionUsage(db, missionId);
  const activeRun = detail.runs.find((r) => r.status === "RUNNING") ?? null;
  const user = await db.query.users.findFirst({ where: eq(users.id, userId), columns: { stripePaymentMethodId: true } });
  const account = { cardSaved: Boolean(user?.stripePaymentMethodId) };
  return { ...detail, usage, activeRun, account, integrations: integrationStatus() };
}
