import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireUser, route } from "@/lib/http";
import { reviewStoredArtifact } from "@/server/artifacts/review";
import { getAgentDeps } from "@/server/deps";

type Ctx = { params: Promise<{ id: string }> };

/** Proofreads the current content of a deliverable (e.g. after a manual edit). */
export const POST = route(async (_req, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const deps = getAgentDeps();
  const review = await reviewStoredArtifact(getDb(), deps.llm, user.id, id, { maxPerDay: deps.limits.analysesPerDay });
  return NextResponse.json({ review });
});
