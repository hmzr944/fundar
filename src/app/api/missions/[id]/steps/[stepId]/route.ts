import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { parseJson, requireUser, route } from "@/lib/http";
import { stepUpdateSchema, updateStepByUser } from "@/server/missions/service";

type Ctx = { params: Promise<{ id: string; stepId: string }> };

export const PATCH = route(async (req, { params }: Ctx) => {
  const user = await requireUser();
  const { id, stepId } = await params;
  const input = await parseJson(req, stepUpdateSchema);
  const result = await updateStepByUser(getDb(), user.id, id, stepId, input);
  return NextResponse.json(result);
});
