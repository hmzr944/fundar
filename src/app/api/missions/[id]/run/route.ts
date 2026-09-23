import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireUser, route } from "@/lib/http";
import { cancelRun, startExecution } from "@/server/agent/runner";
import { getAgentDeps } from "@/server/deps";

type Ctx = { params: Promise<{ id: string }> };

/** Starts or resumes the execution of the plan. */
export const POST = route(async (_req, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const { run } = await startExecution(getAgentDeps(), user.id, id);
  return NextResponse.json({ runId: run.id }, { status: 202 });
});

/** Requests interruption of the active run. */
export const DELETE = route(async (_req, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const cancelled = await cancelRun(getDb(), user.id, id);
  return NextResponse.json({ cancelled });
});
