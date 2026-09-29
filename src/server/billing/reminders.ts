import { and, eq, inArray, isNotNull, isNull } from "drizzle-orm";
import type { Db } from "@/db";
import { messages, missions, users } from "@/db/schema";
import { FINISHED_STATUSES } from "@/server/admin/economics";
import type { Mailer } from "@/server/mail/mailer";
import { addMessage } from "@/server/missions/service";

/**
 * A dossier the user never closes earns Atlas nothing: the "Magic" lesson
 * (see docs/LANCEMENT.md) applied to the success-fee model — work done for
 * free because nobody asked to be paid. Atlas asks instead, twice, well
 * before the admin page's 60-day "never closed" alarm, so most of it is
 * caught rather than only measured after the fact.
 */
const STAGES = [
  { minDays: 35, key: "outcome_reminder:2" },
  { minDays: 10, key: "outcome_reminder:1" },
] as const;

/** Sends the reminder(s) that are due. Never throws: one failed e-mail must not stop the rest. */
export async function sendOutcomeReminders(db: Db, mailer: Mailer | null | undefined, appUrl: string | null | undefined, now = new Date()) {
  if (!mailer || !appUrl) return { sent: 0 };
  const candidates = await db
    .select()
    .from(missions)
    .where(and(isNull(missions.outcome), isNotNull(missions.payment), inArray(missions.status, FINISHED_STATUSES)));

  let sent = 0;
  for (const mission of candidates) {
    // Never a dossier that was only analysed for free: a card must have been on file.
    if (!mission.payment?.authorizedAt && !mission.payment?.paidAt) continue;
    const ageDays = (now.getTime() - mission.updatedAt.getTime()) / 86_400_000;
    const stage = STAGES.find((s) => ageDays >= s.minDays);
    if (!stage) continue;
    try {
      const already = await db
        .select({ metadata: messages.metadata })
        .from(messages)
        .where(and(eq(messages.missionId, mission.id), eq(messages.role, "event")));
      if (already.some((m) => m.metadata?.kind === "notification" && m.metadata.key === stage.key)) continue;

      const user = await db.query.users.findFirst({ where: eq(users.id, mission.userId) });
      if (!user?.emailVerifiedAt) continue;
      const link = `${appUrl}/app/missions/${mission.id}`;
      // A commission is only at stake when a card was saved and nothing charged yet.
      const feeAtStake = Boolean(mission.payment.authorizedAt) && !mission.payment.paidAt;
      const subject = `Votre dossier est-il réglé ? — ${mission.title}`;
      const text = feeAtStake
        ? `Votre dossier semble terminé du côté d'Atlas. Si l'entreprise vous a répondu, dites-le-lui : c'est ce qui déclenche la commission si le problème est réglé, ou clôt le dossier sans rien vous facturer sinon.\n\n${link}\n\nRien à faire si ce n'est pas encore réglé : Atlas vous redemandera plus tard.\n\n— Atlas`
        : `Votre dossier semble terminé du côté d'Atlas. Dites-lui si votre problème est réglé, pour que votre tableau de bord reflète ce que vous avez obtenu.\n\n${link}\n\n— Atlas`;
      await mailer.send({ to: user.email, subject, text });
      await addMessage(db, mission.id, "event", `Rappel envoyé par e-mail : « ${subject} ».`, { kind: "notification", key: stage.key });
      sent++;
    } catch (e) {
      console.error("[atlas] outcome reminder failed", e);
    }
  }
  return { sent };
}
