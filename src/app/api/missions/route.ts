import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { parseJson, requireUser, route } from "@/lib/http";
import { startAnalysis } from "@/server/agent/runner";
import { getAgentDeps } from "@/server/deps";
import { AppError } from "@/server/errors";
import { createMission, listMissions, missionRequestSchema, type MissionFilter } from "@/server/missions/service";

export const GET = route(async (req) => {
  const user = await requireUser();
  const url = new URL(req.url);
  const filter = (["all", "active", "needs_action", "done"].includes(url.searchParams.get("filter") ?? "")
    ? url.searchParams.get("filter")
    : "all") as MissionFilter;
  const missions = await listMissions(getDb(), user.id, { filter, q: url.searchParams.get("q")?.slice(0, 200) });
  return NextResponse.json({ missions });
});

export const POST = route(async (req) => {
  const user = await requireUser();
  const { request } = await parseJson(req, missionRequestSchema);
  const deps = getAgentDeps();
  const mission = await createMission(deps.db, user.id, request);
  let analysis: "started" | "unavailable" | "refused" = "started";
  let notice: string | null = null;
  try {
    await startAnalysis(deps, user.id, mission.id);
  } catch (e) {
    // The mission exists anyway; the reason is recorded in its timeline.
    if (!(e instanceof AppError)) throw e;
    analysis = e.status === 503 ? "unavailable" : "refused";
    notice = e.message;
  }
  return NextResponse.json({ mission: { id: mission.id }, analysis, notice }, { status: 201 });
});
