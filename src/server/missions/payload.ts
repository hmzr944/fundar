import "server-only";
import { getDb } from "@/db";
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
  return { ...detail, usage, activeRun, integrations: integrationStatus() };
}
