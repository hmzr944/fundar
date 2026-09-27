import { eq, sql } from "drizzle-orm";
import type { Db } from "@/db";
import { type PlusSubscription, users } from "@/db/schema";
import { badRequest, conflict } from "@/server/errors";
import type { Mailer } from "@/server/mail/mailer";
import {
  applyPlusDiscount,
  cancelPlusSubscription,
  createCustomer,
  createPlusCheckoutSession,
  fetchSubscription,
  type BillingConfig,
} from "./stripe";

/**
 * A subscription earns its place only if it is worth more than what it
 * costs the subscriber — otherwise it is Homejoy's mistake with an extra
 * step (a discount nobody uses). "Atlas Plus" pays for itself from a
 * client's *second* dossier of the year onward (the discount on that
 * dossier's commission alone can exceed a month's subscription), and access
 * always runs to the end of the period already paid for, cancel anytime.
 */
export function isPlusActive(plus: PlusSubscription | null | undefined, now = new Date()) {
  return Boolean(plus && plus.status !== "canceled" && new Date(plus.currentPeriodEnd) > now);
}

/** Opens the subscription checkout. A customer is created on first use, same as for the success fee. */
export async function startPlusCheckout(db: Db, cfg: BillingConfig, userId: string, fetchImpl?: typeof fetch) {
  if (!cfg.plus) throw conflict("Atlas Plus n'est pas activé sur cette instance.");
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw badRequest("Compte introuvable.");
  if (isPlusActive(user.plus)) throw conflict("Vous êtes déjà abonné à Atlas Plus.");
  const customerId = user.stripeCustomerId ?? (await createCustomer(cfg, { userId, email: user.email }, fetchImpl));
  if (!user.stripeCustomerId) await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, userId));
  const session = await createPlusCheckoutSession(cfg, { customerId, userId, returnPath: "/app/settings" }, fetchImpl);
  return { url: session.url };
}

/** Applies the "checkout.session.completed" event for a Plus subscription (mode "subscription"). Idempotent. */
export async function applyPlusCheckout(
  db: Db,
  cfg: BillingConfig,
  session: { id?: string; mode?: string; status?: string; subscription?: string; metadata?: Record<string, string> },
  fetchImpl?: typeof fetch,
) {
  if (session.mode !== "subscription" || session.status !== "complete" || !session.subscription) return null;
  const userId = session.metadata?.userId;
  if (!userId) return null;
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user || user.plus?.stripeSubscriptionId === session.subscription) return null;
  const sub = await fetchSubscription(cfg, session.subscription, fetchImpl);
  const plus: PlusSubscription = {
    stripeSubscriptionId: sub.id,
    status: sub.status === "active" || sub.status === "trialing" ? "active" : "past_due",
    currentPeriodEnd: sub.currentPeriodEnd,
    startedAt: new Date().toISOString(),
  };
  await db.update(users).set({ plus }).where(eq(users.id, userId));
  return { userId };
}

/**
 * A subscription's status or renewal date changing outside checkout
 * (renewal, failed payment, cancellation taking effect) — Stripe's
 * "customer.subscription.updated" and "customer.subscription.deleted".
 */
export async function applyPlusSubscriptionEvent(
  db: Db,
  event: { type?: string; data?: { object?: { id?: string; status?: string; current_period_end?: number } } },
) {
  if (event.type !== "customer.subscription.updated" && event.type !== "customer.subscription.deleted") return null;
  const sub = event.data?.object;
  if (!sub?.id) return null;
  const user = await db.query.users.findFirst({ where: sql`${users.plus}->>'stripeSubscriptionId' = ${sub.id}` });
  if (!user?.plus) return null;
  const status: PlusSubscription["status"] =
    event.type === "customer.subscription.deleted" || sub.status === "canceled"
      ? "canceled"
      : sub.status === "active" || sub.status === "trialing"
        ? "active"
        : "past_due";
  const currentPeriodEnd = sub.current_period_end ? new Date(sub.current_period_end * 1000).toISOString() : user.plus.currentPeriodEnd;
  if (status === user.plus.status && currentPeriodEnd === user.plus.currentPeriodEnd) return null;
  await db.update(users).set({ plus: { ...user.plus, status, currentPeriodEnd } }).where(eq(users.id, user.id));
  return { userId: user.id, status };
}

/**
 * Cancels at the end of the period already paid for. Sends a confirmation
 * e-mail (the "notification de la résiliation" on a durable medium required
 * by décret n° 2023-417, taken with code de la consommation art. L215-1-1 —
 * the "résiliation en 3 clics" law: an online subscription must be
 * cancellable online, with a confirmation the client can keep).
 */
export async function cancelPlus(db: Db, cfg: BillingConfig, userId: string, mailer: Mailer | null | undefined, fetchImpl?: typeof fetch) {
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user?.plus || !isPlusActive(user.plus)) throw conflict("Vous n'êtes pas abonné à Atlas Plus.");
  if (user.plus.canceledAt) throw conflict("La résiliation est déjà enregistrée.");
  await cancelPlusSubscription(cfg, user.plus.stripeSubscriptionId, fetchImpl);
  await db
    .update(users)
    .set({ plus: { ...user.plus, canceledAt: new Date().toISOString() } })
    .where(eq(users.id, userId));
  if (mailer) {
    const until = new Date(user.plus.currentPeriodEnd).toLocaleDateString("fr-FR");
    await mailer
      .send({
        to: user.email,
        subject: "Résiliation d'Atlas Plus enregistrée",
        text: `Nous confirmons la réception de votre demande de résiliation d'Atlas Plus.\n\nElle prend effet le ${until} : vous gardez l'avantage (commission réduite, budget d'IA plus élevé) jusqu'à cette date, sans nouveau prélèvement ensuite.\n\n— Atlas`,
      })
      .catch(() => undefined);
  }
}

/** The fee an active subscriber actually pays, and the per-dossier AI budget available to them. */
export function plusBenefitsFor(cfg: BillingConfig, plusActive: boolean, baseFeeCents: number, baseCostCapUsd: number | undefined) {
  if (!plusActive || !cfg.plus) return { feeCents: baseFeeCents, costCapUsd: baseCostCapUsd };
  return {
    feeCents: applyPlusDiscount(cfg.plus, baseFeeCents),
    costCapUsd: baseCostCapUsd ? baseCostCapUsd * cfg.plus.costMultiplier : baseCostCapUsd,
  };
}
