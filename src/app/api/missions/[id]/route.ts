import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { parseJson, requireUser, route } from "@/lib/http";
import { missionUsage, recoverStaleRuns } from "@/server/agent/runner";
import { getAgentDeps, integrationStatus } from "@/server/deps";
import { getStorage } from "@/server/documents/storage";
import { deleteMission, getMissionDetail, getOwnedMission, renameMission } from "@/server/missions/service";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route(async (_req, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const db = getDb();
  await getOwnedMission(db, user.id, id);
  await recoverStaleRuns(db, id, getAgentDeps().limits.staleRunSeconds);
  const detail = await getMissionDetail(db, user.id, id);
  const usage = await missionUsage(db, id);
  const activeRun = detail.runs.find((r) => r.status === "RUNNING") ?? null;
  return NextResponse.json({ ...detail, usage, activeRun, integrations: integrationStatus() });
});

export const PATCH = route(async (req, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const { title } = await parseJson(req, z.object({ title: z.string() }));
  await renameMission(getDb(), user.id, id, title);
  return NextResponse.json({ ok: true });
});

export const DELETE = route(async (_req, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  await deleteMission(getDb(), getStorage(), user.id, id);
  return NextResponse.json({ ok: true });
});
