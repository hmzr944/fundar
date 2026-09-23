import { getDb } from "@/db";
import { requireUser, route } from "@/lib/http";
import { exportArtifact, type ExportFormat } from "@/server/artifacts/service";
import { badRequest } from "@/server/errors";

type Ctx = { params: Promise<{ id: string }> };

export const GET = route(async (req, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const format = new URL(req.url).searchParams.get("format") ?? "md";
  if (!["md", "txt", "docx", "csv"].includes(format)) throw badRequest("Format inconnu.");
  const file = await exportArtifact(getDb(), user.id, id, format as ExportFormat);
  return new Response(new Uint8Array(file.body), {
    headers: {
      "content-type": file.mime,
      "content-disposition": `attachment; filename*=UTF-8''${encodeURIComponent(file.filename)}`,
      "x-content-type-options": "nosniff",
      "cache-control": "private, no-store",
    },
  });
});
