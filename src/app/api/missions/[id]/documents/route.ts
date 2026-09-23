import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { config } from "@/lib/config";
import { assertDeclaredUploadSize, requireUser, route } from "@/lib/http";
import { uploadDocument } from "@/server/documents/service";
import { getStorage } from "@/server/documents/storage";
import { badRequest } from "@/server/errors";

type Ctx = { params: Promise<{ id: string }> };

export const POST = route(async (req, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  assertDeclaredUploadSize(req.headers.get("content-length"), config.uploads.maxBytes);
  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    throw badRequest("Envoi de fichier invalide.");
  }
  const file = form.get("file");
  if (!(file instanceof File)) throw badRequest("Aucun fichier reçu.");
  const data = Buffer.from(await file.arrayBuffer());
  const doc = await uploadDocument(getDb(), getStorage(), user.id, id, { name: file.name, data }, {
    maxBytes: config.uploads.maxBytes,
    maxPerMission: config.uploads.maxPerMission,
  });
  return NextResponse.json({ document: doc }, { status: doc.status === "READY" ? 201 : 422 });
});
