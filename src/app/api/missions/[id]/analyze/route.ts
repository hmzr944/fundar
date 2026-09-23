import { NextResponse } from "next/server";
import { requireUser, route } from "@/lib/http";
import { startAnalysis } from "@/server/agent/runner";
import { getAgentDeps } from "@/server/deps";

type Ctx = { params: Promise<{ id: string }> };

/** Re-runs the understanding/planning phase (e.g. after a provider error). */
export const POST = route(async (_req, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const { run } = await startAnalysis(getAgentDeps(), user.id, id);
  return NextResponse.json({ runId: run.id }, { status: 202 });
});
