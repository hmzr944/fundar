import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "@/db";
import { artifacts, missions, postalLetters, users, type PostalAddress } from "@/db/schema";
import { createCheckoutSession, type BillingConfig } from "@/server/billing/stripe";
import { getOwnedArtifact } from "@/server/artifacts/service";
import { reviewFromMetadata, isReadyToSend } from "@/server/agent/review";
import { AppError, badRequest, conflict } from "@/server/errors";
import type { Mailer } from "@/server/mail/mailer";
import { addMessage } from "@/server/missions/service";
import type { PostalConfig } from "./config";
import type { PostalProvider } from "./provider";

export const postalAddressSchema = z.object({
  name: z.string().trim().min(1, "Nom requis.").max(140),
  address1: z.string().trim().min(1, "Adresse requise.").max(140),
  address2: z.string().trim().max(140).optional(),
  postalCode: z.string().trim().min(2, "Code postal requis.").max(12),
  city: z.string().trim().min(1, "Ville requise.").max(80),
  country: z.string().trim().min(2, "Pays requis.").max(56).default("France"),
});

/** Saves the user's own return address — asked for once, only when they first use the registered-mail option. */
export async function setPostalAddress(db: Db, userId: string, input: z.infer<typeof postalAddressSchema>) {
  await db.update(users).set({ postalAddress: input }).where(eq(users.id, userId));
}

const ACTIVE_STATUSES = ["PENDING_PAYMENT", "PAID", "SENT"] as const;

/** Opens the Checkout for a registered letter (LRAR), paid upfront — independent of the dossier's own success fee. */
export async function requestLrar(
  db: Db,
  cfg: BillingConfig,
  postal: PostalConfig,
  userId: string,
  artifactId: string,
  recipient: PostalAddress,
  fetchImpl?: typeof fetch,
) {
  const artifact = await getOwnedArtifact(db, userId, artifactId);
  if (!isReadyToSend(reviewFromMetadata(artifact.metadata), artifact.content)) {
    throw conflict("Ce courrier n'est pas encore « Prêt à envoyer » : la relecture doit d'abord être terminée.");
  }
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw badRequest("Compte introuvable.");
  if (!user.postalAddress) {
    throw new AppError(409, "Renseignez d'abord votre adresse postale d'expéditeur.", "postal_address_missing");
  }
  const existing = await db
    .select({ id: postalLetters.id })
    .from(postalLetters)
    .where(and(eq(postalLetters.artifactId, artifactId), inArray(postalLetters.status, ACTIVE_STATUSES)))
    .limit(1);
  if (existing.length) throw conflict("Une lettre recommandée est déjà en cours pour ce courrier.");

  const [letter] = await db
    .insert(postalLetters)
    .values({ missionId: artifact.missionId, artifactId, userId, recipientAddress: recipient, priceCents: postal.priceCents })
    .returning();
  const mission = await db.query.missions.findFirst({ where: eq(missions.id, artifact.missionId) });
  const session = await createCheckoutSession(
    cfg,
    { missionId: artifact.missionId, userId, email: user.email, title: mission?.title ?? artifact.name, amountCents: postal.priceCents, kind: "lrar" },
    fetchImpl,
  );
  await db.update(postalLetters).set({ checkoutSessionId: session.id }).where(eq(postalLetters.id, letter.id));
  return { url: session.url };
}

type CheckoutSession = { id?: string; payment_status?: string; amount_total?: number; currency?: string; metadata?: Record<string, string> };

/** Applies a verified "checkout.session.completed" event for an LRAR session. Idempotent. Returns the letter to send, if any. */
export async function applyLrarCheckout(db: Db, cfg: BillingConfig, session: CheckoutSession) {
  if (session.metadata?.kind !== "lrar" || !session.id) return null;
  if (session.payment_status !== "paid" || session.currency !== cfg.currency) return null;
  const letter = await db.query.postalLetters.findFirst({ where: eq(postalLetters.checkoutSessionId, session.id) });
  if (!letter || letter.status !== "PENDING_PAYMENT") return null;
  // Only this letter's own session, at its own price, counts.
  if ((session.amount_total ?? 0) < letter.priceCents) return null;
  await db.update(postalLetters).set({ status: "PAID", paidAt: new Date() }).where(eq(postalLetters.id, letter.id));
  await addMessage(db, letter.missionId, "event", "Lettre recommandée réglée : envoi en cours.", { kind: "lrar_paid" });
  return letter.id;
}

const plainText = (markdown: string) =>
  markdown
    .replace(/^#+\s*/gm, "")
    .replace(/\*\*([^*]+)\*\*/g, "$1")
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, "$1 ($2)")
    .trim();

/** Actually sends the paid letter through the configured provider. Never throws: failure is recorded, not raised. */
export async function sendLetter(db: Db, provider: PostalProvider | null, mailer: Mailer | null | undefined, postalLetterId: string) {
  const letter = await db.query.postalLetters.findFirst({ where: eq(postalLetters.id, postalLetterId) });
  if (!letter || letter.status !== "PAID") return;
  try {
    if (!provider) throw new Error("Aucun prestataire de courrier configuré.");
    const [artifact, user] = await Promise.all([
      db.query.artifacts.findFirst({ where: eq(artifacts.id, letter.artifactId) }),
      db.query.users.findFirst({ where: eq(users.id, letter.userId) }),
    ]);
    if (!artifact || !user?.postalAddress) throw new Error("Courrier ou adresse d'expéditeur introuvable.");
    const result = await provider.send({
      sender: user.postalAddress,
      recipient: letter.recipientAddress,
      subject: artifact.name,
      bodyText: plainText(artifact.content),
      mode: "lrar",
    });
    await db.update(postalLetters).set({ status: "SENT", providerId: result.providerId, trackingUrl: result.trackingUrl ?? null }).where(eq(postalLetters.id, letter.id));
    await addMessage(db, letter.missionId, "event", "Lettre recommandée envoyée par La Poste.", { kind: "lrar_sent" });
    if (mailer) {
      await mailer
        .send({
          to: user.email,
          subject: "Votre lettre recommandée a été envoyée",
          text: `Atlas a envoyé votre lettre recommandée avec accusé de réception.${result.trackingUrl ? ` Suivi : ${result.trackingUrl}` : ""}\n\n— Atlas`,
        })
        .catch(() => undefined);
    }
  } catch (e) {
    const message = e instanceof Error ? e.message : "erreur inconnue";
    await db.update(postalLetters).set({ status: "FAILED", failure: message }).where(eq(postalLetters.id, letter.id));
    await addMessage(db, letter.missionId, "event", `L'envoi de la lettre recommandée a échoué : ${message}. Contactez le support : elle est payée mais pas encore envoyée.`, {
      kind: "lrar_failed",
    });
    console.error("[atlas] LRAR send failed", e);
  }
}
