import { eq } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "@/db";
import { missions, missionSteps, users } from "@/db/schema";
import { startExecution, type AgentDeps } from "@/server/agent/runner";
import { AppError, badRequest, conflict } from "@/server/errors";
import { notifyUser } from "@/server/mail/notify";
import { addMessage, getOwnedMission, refreshMissionStatus } from "@/server/missions/service";
import { createCheckoutSession, type BillingConfig } from "./stripe";

export const checkoutSchema = z.object({
  acceptTerms: z.literal(true, "Vous devez accepter les conditions générales de vente."),
  immediateExecution: z.literal(true, "Vous devez demander l'exécution immédiate du service."),
});

/** Opens a Stripe Checkout for one dossier, once Atlas has said it can handle it. */
export async function startCheckout(db: Db, cfg: BillingConfig, userId: string, missionId: string, fetchImpl?: typeof fetch) {
  const mission = await getOwnedMission(db, userId, missionId);
  if (mission.payment?.paidAt) throw conflict("Ce dossier est déjà payé.");
  if (mission.missingInfo.some((m) => m.blocking)) throw conflict("Répondez d'abord aux questions d'Atlas : il vous dira ensuite s'il peut prendre votre dossier en charge.");
  const steps = await db.select({ id: missionSteps.id }).from(missionSteps).where(eq(missionSteps.missionId, missionId));
  if (!steps.length) throw conflict("Atlas n'a pas encore analysé ce dossier.");
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw badRequest("Compte introuvable.");
  const session = await createCheckoutSession(cfg, { missionId, userId, email: user.email, title: mission.title }, fetchImpl);
  await db
    .update(missions)
    .set({ payment: { consentAt: new Date().toISOString(), termsVersion: cfg.termsVersion, checkoutSessionId: session.id } })
    .where(eq(missions.id, missionId));
  return { url: session.url };
}

type CheckoutSession = {
  id?: string;
  payment_status?: string;
  amount_total?: number;
  currency?: string;
  client_reference_id?: string;
  metadata?: Record<string, string>;
};

/**
 * Applies a verified Stripe event. Idempotent: Stripe may deliver the same
 * event several times. Returns the mission newly marked as paid, if any.
 */
export async function applyStripeEvent(db: Db, cfg: BillingConfig, event: { type?: string; data?: { object?: CheckoutSession } }) {
  if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded") return null;
  const s = event.data?.object ?? {};
  if (s.payment_status !== "paid") return null;
  const missionId = s.metadata?.missionId ?? s.client_reference_id;
  if (!missionId) return null;
  const mission = await db.query.missions.findFirst({ where: eq(missions.id, missionId) });
  if (!mission) return null;
  if (mission.payment?.paidAt) return null;
  // Only the session Atlas opened for this dossier, at the full price, counts.
  if (!mission.payment?.checkoutSessionId || mission.payment.checkoutSessionId !== s.id) return null;
  if ((s.amount_total ?? 0) < cfg.priceCents || s.currency !== cfg.currency) return null;
  await db
    .update(missions)
    .set({ payment: { ...mission.payment, paidAt: new Date().toISOString(), amountCents: s.amount_total, currency: s.currency } })
    .where(eq(missions.id, missionId));
  await addMessage(db, missionId, "event", `Paiement reçu (${((s.amount_total ?? 0) / 100).toFixed(2).replace(".", ",")} €). Atlas prend votre dossier en charge.`, {
    kind: "payment_received",
  });
  return { missionId, userId: mission.userId };
}

/** After payment: Atlas starts right away, then tells the user what comes next. */
export async function startPaidMission(deps: AgentDeps, missionId: string, userId: string) {
  try {
    const { done } = await startExecution(deps, userId, missionId);
    await done;
  } catch (e) {
    const message = e instanceof AppError ? e.message : "erreur interne";
    await addMessage(deps.db, missionId, "event", `Atlas n'a pas pu démarrer automatiquement : ${message}`, { kind: "paid_start_failed" });
    await refreshMissionStatus(deps.db, missionId);
    if (!(e instanceof AppError)) console.error("[atlas] paid start failed", e);
  }
  await notifyUser(deps.db, deps.mailer, deps.appUrl, missionId);
}
