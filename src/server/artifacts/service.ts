import { and, eq } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "@/db";
import { artifacts, missions, missionSteps } from "@/db/schema";
import { badRequest, conflict, notFound } from "@/server/errors";
import { addMessage, hasActiveRun, refreshMissionStatus, updateStepByUser, uuidSchema } from "@/server/missions/service";
import { markdownTableToCsv, markdownToDocx, slugify } from "./render";
import { sendInfoOf } from "./send";

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
      ...(input.content !== undefined
        ? {
            content: input.content,
            editedByUser: true,
            // The stored review applied to the previous text.
            ...(art.metadata.review ? { metadata: { ...art.metadata, review: { ...(art.metadata.review as object), stale: true } } } : {}),
          }
        : {}),
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

/**
 * The user sent a deliverable themselves (one click from their mailbox).
 * Records it, tells Atlas in the conversation, closes the matching
 * "send it" step and schedules Atlas' own follow-up when one was planned.
 */
export async function markArtifactSent(db: Db, userId: string, artifactId: string, now = new Date()) {
  const art = await getOwnedArtifact(db, userId, artifactId);
  if (typeof art.metadata.sentAt === "string") throw conflict("Ce courrier est déjà marqué comme envoyé.");
  if (await hasActiveRun(db, art.missionId)) {
    throw conflict("Atlas travaille sur cette mission. Attendez la fin de son exécution pour marquer l'envoi.");
  }
  const send = sendInfoOf(art.metadata);
  const day = now.toLocaleDateString("fr-FR");
  await db
    .update(artifacts)
    .set({ metadata: { ...art.metadata, sentAt: now.toISOString() } })
    .where(eq(artifacts.id, art.id));
  await addMessage(db, art.missionId, "user", `J'ai envoyé « ${art.name} »${send ? ` à ${send.to}` : ""} le ${day}.`, {
    kind: "artifact_sent",
    artifactId: art.id,
  });

  let followUpAt: Date | null = null;
  if (send?.followUpDays) {
    followUpAt = new Date(now.getTime() + send.followUpDays * 86_400_000);
    followUpAt.setHours(9, 0, 0, 0);
    await db
      .update(missions)
      .set({
        nextFollowUpAt: followUpAt,
        followUpReason: `Réponse à « ${art.name} » (envoyé le ${day}) : vérifier si elle est arrivée, puis relancer ou escalader si besoin.`,
      })
      .where(eq(missions.id, art.missionId));
  }

  // Close the "send it" step that follows the step which produced this deliverable.
  let closedStepId: string | null = null;
  if (art.stepId) {
    const steps = await db.select().from(missionSteps).where(eq(missionSteps.missionId, art.missionId));
    const source = steps.find((s) => s.id === art.stepId);
    const candidates = source
      ? steps.filter((s) => s.kind === "user_action" && !["DONE", "SKIPPED"].includes(s.status) && s.dependsOn.includes(source.key))
      : [];
    if (candidates.length === 1) {
      await updateStepByUser(db, userId, art.missionId, candidates[0].id, { status: "DONE", note: `Envoyé le ${day}${send ? ` à ${send.to}` : ""}.` });
      closedStepId = candidates[0].id;
    }
  }
  await refreshMissionStatus(db, art.missionId);
  return { sentAt: now.toISOString(), followUpAt: followUpAt?.toISOString() ?? null, closedStepId };
}
