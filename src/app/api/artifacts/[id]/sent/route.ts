import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireUser, route } from "@/lib/http";
import { markArtifactSent } from "@/server/artifacts/service";

type Ctx = { params: Promise<{ id: string }> };

/** The user confirms they sent this deliverable from their own mailbox. */
export const POST = route(async (_req, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  return NextResponse.json(await markArtifactSent(getDb(), user.id, id));
});
