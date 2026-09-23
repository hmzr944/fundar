import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { config } from "@/lib/config";
import { requireUser, route } from "@/lib/http";
import { uploadDocument } from "@/server/documents/service";
import { getStorage } from "@/server/documents/storage";
import { AppError, badRequest } from "@/server/errors";

type Ctx = { params: Promise<{ id: string }> };

export const POST = route(async (req, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const declared = Number(req.headers.get("content-length") ?? 0);
  if (declared > config.uploads.maxBytes + 64 * 1024) {
    throw new AppError(413, `Fichier trop volumineux (maximum ${config.uploads.maxBytes / 1024 / 1024} Mo).`, "too_large");
  }
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
