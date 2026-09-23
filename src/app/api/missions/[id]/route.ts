import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { parseJson, requireUser, route } from "@/lib/http";
import { getStorage } from "@/server/documents/storage";
import { loadMissionPayload } from "@/server/missions/payload";
import { deleteMission, renameMission } from "@/server/missions/service";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route(async (_req, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  return NextResponse.json(await loadMissionPayload(user.id, id));
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
