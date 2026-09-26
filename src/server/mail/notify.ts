import { and, eq } from "drizzle-orm";
import type { Db } from "@/db";
import { artifacts, messages, missions, users } from "@/db/schema";
import { isReadyToSend, reviewFromMetadata } from "@/server/agent/review";
import { sendInfoOf } from "@/server/artifacts/send";
import { addMessage } from "@/server/missions/service";
import type { Mailer } from "./mailer";

/**
 * Tells the user by e-mail when their dossier needs them (a question, a
 * letter ready to send) or is finished, after work done while they were
 * away (payment, scheduled follow-up). The same situation is never notified
 * twice. Never throws: a failed e-mail must not break the dossier.
 */
export async function notifyUser(db: Db, mailer: Mailer | null | undefined, appUrl: string | null | undefined, missionId: string) {
  if (!mailer || !appUrl) return null;
  try {
    const mission = await db.query.missions.findFirst({ where: eq(missions.id, missionId) });
    if (!mission) return null;
    const user = await db.query.users.findFirst({ where: eq(users.id, mission.userId) });
    if (!user) return null;
    const arts = await db.select().from(artifacts).where(eq(artifacts.missionId, missionId));
    const toSend = arts.filter((a) => sendInfoOf(a.metadata) && typeof a.metadata.sentAt !== "string" && isReadyToSend(reviewFromMetadata(a.metadata), a.content));
    const link = `${appUrl}/app/missions/${missionId}`;
    const questions = mission.missingInfo.filter((m) => m.blocking).map((m) => `- ${m.question}`);

    let subject: string;
    let body: string;
    if (mission.status === "NEEDS_INPUT") {
      subject = `Atlas a besoin d'une information — ${mission.title}`;
      body = `Pour continuer votre dossier, Atlas a besoin de votre réponse :\n\n${questions.join("\n")}\n\nRépondez ici : ${link}`;
    } else if (toSend.length) {
      subject = `Votre courrier est prêt à envoyer — ${mission.title}`;
      body = `Atlas a préparé et vérifié : ${toSend.map((a) => `« ${a.name} »`).join(", ")}.\n\nOuvrez votre dossier, cliquez sur « Envoyer depuis ma messagerie », puis sur « J'ai envoyé » : Atlas s'occupe de la suite.\n\n${link}`;
    } else if (mission.status === "WAITING_FOR_USER") {
      subject = `Une action vous attend — ${mission.title}`;
      body = `Votre dossier attend une action de votre part.\n\n${link}`;
    } else if (mission.status === "COMPLETED") {
      subject = `Votre dossier est terminé — ${mission.title}`;
      body = `Atlas a terminé votre dossier. Le compte rendu vous attend ici :\n\n${link}`;
    } else {
      return null;
    }
    const key = `${mission.status}:${toSend.map((a) => a.id).sort().join(",")}:${questions.join("|")}`;
    const recent = await db
      .select({ metadata: messages.metadata })
      .from(messages)
      .where(and(eq(messages.missionId, missionId), eq(messages.role, "event")));
    if (recent.some((m) => m.metadata?.kind === "notification" && m.metadata.key === key)) return null;

    await mailer.send({ to: user.email, subject, text: `${body}\n\n— Atlas` });
    await addMessage(db, missionId, "event", `Notification envoyée par e-mail : « ${subject} ».`, { kind: "notification", key });
    return subject;
  } catch (e) {
    console.error("[atlas] notification failed", e);
    return null;
  }
}
