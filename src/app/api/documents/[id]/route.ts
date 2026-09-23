import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireUser, route } from "@/lib/http";
import { deleteDocument, readDocumentFile } from "@/server/documents/service";
import { getStorage } from "@/server/documents/storage";

type Ctx = { params: Promise<{ id: string }> };

/** Downloads the original file (owner only). Always served as an attachment. */
export const GET = route(async (_req, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const { doc, data } = await readDocumentFile(getDb(), getStorage(), user.id, id);
  return new Response(new Uint8Array(data), {
    headers: {
      "content-type": doc.mimeType,
      "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(doc.name)}`,
      "x-content-type-options": "nosniff",
      "cache-control": "private, no-store",
    },
  });
});

export const DELETE = route(async (_req, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  await deleteDocument(getDb(), getStorage(), user.id, id);
  return NextResponse.json({ ok: true });
});
