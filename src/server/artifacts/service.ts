import { and, eq } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "@/db";
import { artifacts, missions } from "@/db/schema";
import { badRequest, notFound } from "@/server/errors";
import { uuidSchema } from "@/server/missions/service";
import { markdownTableToCsv, markdownToDocx, slugify } from "./render";

export const artifactEditSchema = z.object({
  name: z.string().trim().min(1).max(150).optional(),
  content: z.string().max(200_000, "Contenu trop long.").optional(),
});

export async function getOwnedArtifact(db: Db, userId: string, artifactId: string) {
  if (!uuidSchema.safeParse(artifactId).success) throw notFound("Livrable");
  const rows = await db
    .select({ artifact: artifacts })
    .from(artifacts)
    .innerJoin(missions, eq(missions.id, artifacts.missionId))
    .where(and(eq(artifacts.id, artifactId), eq(missions.userId, userId)))
    .limit(1);
  if (!rows[0]) throw notFound("Livrable");
  return rows[0].artifact;
}

export async function editArtifact(db: Db, userId: string, artifactId: string, input: z.infer<typeof artifactEditSchema>) {
  const art = await getOwnedArtifact(db, userId, artifactId);
  if (!input.name && input.content === undefined) throw badRequest("Aucune modification.");
  const [updated] = await db
    .update(artifacts)
    .set({
      ...(input.name ? { name: input.name } : {}),
      ...(input.content !== undefined ? { content: input.content, editedByUser: true } : {}),
    })
    .where(eq(artifacts.id, art.id))
    .returning();
  return updated;
}

export type ExportFormat = "md" | "txt" | "docx" | "csv";

/** Renders a real downloadable file from the stored artifact. */
export async function exportArtifact(db: Db, userId: string, artifactId: string, format: ExportFormat) {
  const art = await getOwnedArtifact(db, userId, artifactId);
  const base = slugify(art.name);
  switch (format) {
    case "md":
      return { body: Buffer.from(`# ${art.name}\n\n${art.content}\n`, "utf-8"), mime: "text/markdown; charset=utf-8", filename: `${base}.md` };
    case "txt":
      return { body: Buffer.from(`${art.name}\n\n${art.content}\n`, "utf-8"), mime: "text/plain; charset=utf-8", filename: `${base}.txt` };
    case "docx":
      return {
        body: await markdownToDocx(art.name, art.content),
        mime: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
        filename: `${base}.docx`,
      };
    case "csv": {
      const csv = markdownTableToCsv(art.content);
      if (!csv) throw badRequest("Ce livrable ne contient pas de tableau exportable en CSV.");
      return { body: Buffer.from("﻿" + csv, "utf-8"), mime: "text/csv; charset=utf-8", filename: `${base}.csv` };
    }
  }
}
