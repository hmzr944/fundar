import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { parseJson, requireUser, route } from "@/lib/http";
import { artifactEditSchema, editArtifact } from "@/server/artifacts/service";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = route(async (req, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const input = await parseJson(req, artifactEditSchema);
  const artifact = await editArtifact(getDb(), user.id, id, input);
  return NextResponse.json({ artifact: { id: artifact.id, name: artifact.name, content: artifact.content, editedByUser: artifact.editedByUser } });
});
