import { and, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { z } from "zod";
import type { Db } from "@/db";
import { missions, missionSteps, users } from "@/db/schema";
import { startExecution, type AgentDeps } from "@/server/agent/runner";
import { AppError, badRequest, conflict } from "@/server/errors";
import { notifyUser } from "@/server/mail/notify";
import { addMessage, getOwnedMission, hasActiveRun, refreshMissionStatus } from "@/server/missions/service";
import {
  chargeSavedCard,
  computeSuccessFee,
  createCheckoutSession,
  createCustomer,
  createSetupSession,
  setupIntentPaymentMethod,
  type BillingConfig,
} from "./stripe";

const euros = (cents: number) => `${(cents / 100).toFixed(2).replace(".", ",")} €`;

export const checkoutSchema = z.object({
  acceptTerms: z.literal(true, "Vous devez accepter les conditions générales de vente."),
  immediateExecution: z.literal(true, "Vous devez demander l'exécution immédiate du service."),
});

/**
 * Starts the paid handling of a dossier, once Atlas has said it can handle it.
 * Upfront mode: a Checkout for the fixed price. Success mode: nothing is
 * charged now; a card is saved once (Checkout in setup mode) and later
 * dossiers start right away with the card already on file.
 */
export async function startCheckout(db: Db, cfg: BillingConfig, userId: string, missionId: string, fetchImpl?: typeof fetch) {
  const mission = await getOwnedMission(db, userId, missionId);
  if (mission.payment?.paidAt || mission.payment?.authorizedAt) throw conflict("Ce dossier est déjà pris en charge.");
  if (mission.missingInfo.some((m) => m.blocking)) throw conflict("Répondez d'abord aux questions d'Atlas : il vous dira ensuite s'il peut prendre votre dossier en charge.");
  // Never take money (or a card) for a dossier Atlas has not said it can handle.
  if (mission.eligibility?.canHandle !== true) {
    throw conflict(mission.eligibility?.reason ? `Atlas ne peut pas prendre ce dossier en charge : ${mission.eligibility.reason}` : "Atlas n'a pas encore dit s'il peut prendre ce dossier en charge.");
  }
  const steps = await db.select({ id: missionSteps.id }).from(missionSteps).where(eq(missionSteps.missionId, missionId));
  if (!steps.length) throw conflict("Atlas n'a pas encore analysé ce dossier.");
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  if (!user) throw badRequest("Compte introuvable.");
  const consent = { consentAt: new Date().toISOString(), termsVersion: cfg.termsVersion };

  if (cfg.mode === "success") {
    if (user.stripeCustomerId && user.stripePaymentMethodId) {
      await db.update(missions).set({ payment: { ...consent, authorizedAt: consent.consentAt } }).where(eq(missions.id, missionId));
      return { url: null, started: true as const };
    }
    const customerId = user.stripeCustomerId ?? (await createCustomer(cfg, { userId, email: user.email }, fetchImpl));
    if (!user.stripeCustomerId) await db.update(users).set({ stripeCustomerId: customerId }).where(eq(users.id, userId));
    const session = await createSetupSession(cfg, { customerId, missionId, userId }, fetchImpl);
    await db.update(missions).set({ payment: { ...consent, checkoutSessionId: session.id } }).where(eq(missions.id, missionId));
    return { url: session.url, started: false as const };
  }

  const session = await createCheckoutSession(cfg, { missionId, userId, email: user.email, title: mission.title }, fetchImpl);
  await db.update(missions).set({ payment: { ...consent, checkoutSessionId: session.id } }).where(eq(missions.id, missionId));
  return { url: session.url, started: false as const };
}

type CheckoutSession = {
  id?: string;
  mode?: string;
  payment_status?: string;
  status?: string;
  amount_total?: number;
  currency?: string;
  client_reference_id?: string;
  setup_intent?: string;
  customer?: string;
  metadata?: Record<string, string>;
};

/**
 * Applies a verified Stripe event. Idempotent: Stripe may deliver the same
 * event several times. Returns the mission that Atlas may now start, if any.
 */
export async function applyStripeEvent(
  db: Db,
  cfg: BillingConfig,
  event: { type?: string; data?: { object?: CheckoutSession } },
  fetchImpl?: typeof fetch,
): Promise<{ missionId: string; userId: string } | null> {
  if (event.type !== "checkout.session.completed" && event.type !== "checkout.session.async_payment_succeeded") return null;
  const s = event.data?.object ?? {};
  const missionId = s.metadata?.missionId ?? s.client_reference_id;
  if (!missionId || !s.id) return null;
  const mission = await db.query.missions.findFirst({ where: eq(missions.id, missionId) });
  if (!mission?.payment) return null;

  // A card saved (success mode): Atlas may start, nothing is charged.
  if (s.mode === "setup") {
    if (mission.payment.authorizedAt || mission.payment.checkoutSessionId !== s.id || s.status !== "complete" || !s.setup_intent) return null;
    const user = await db.query.users.findFirst({ where: eq(users.id, mission.userId) });
    if (!user?.stripeCustomerId || (s.customer && s.customer !== user.stripeCustomerId)) return null;
    const paymentMethodId = await setupIntentPaymentMethod(cfg, s.setup_intent, fetchImpl);
    const now = new Date().toISOString();
    await db.update(users).set({ stripePaymentMethodId: paymentMethodId, cardSavedAt: new Date(now) }).where(eq(users.id, user.id));
    await db.update(missions).set({ payment: { ...mission.payment, authorizedAt: now } }).where(eq(missions.id, missionId));
    await addMessage(db, missionId, "event", "Carte enregistrée, aucun débit. Atlas prend votre dossier en charge.", { kind: "card_saved" });
    return { missionId, userId: mission.userId };
  }

  if (s.payment_status !== "paid") return null;
  if (mission.payment.paidAt) return null;

  // The success fee, paid on the page sent when the saved card failed.
  if (s.metadata?.kind === "success_fee") {
    const due = mission.payment.feeDueCents ?? 0;
    if (!due || mission.payment.feeCheckoutSessionId !== s.id || (s.amount_total ?? 0) < due || s.currency !== cfg.currency) return null;
    await db
      .update(missions)
      .set({ payment: { ...mission.payment, paidAt: new Date().toISOString(), amountCents: s.amount_total, currency: s.currency, payLinkUrl: undefined, failure: undefined } })
      .where(eq(missions.id, missionId));
    await addMessage(db, missionId, "event", `Commission réglée (${euros(s.amount_total ?? 0)}). Merci !`, { kind: "fee_paid" });
    return null;
  }

  // Upfront mode: only the session Atlas opened for this dossier, at the full price, counts.
  if (cfg.mode !== "upfront") return null;
  if (!mission.payment.checkoutSessionId || mission.payment.checkoutSessionId !== s.id) return null;
  if ((s.amount_total ?? 0) < cfg.priceCents || s.currency !== cfg.currency) return null;
  await db
    .update(missions)
    .set({ payment: { ...mission.payment, paidAt: new Date().toISOString(), amountCents: s.amount_total, currency: s.currency } })
    .where(eq(missions.id, missionId));
  await addMessage(db, missionId, "event", `Paiement reçu (${euros(s.amount_total ?? 0)}). Atlas prend votre dossier en charge.`, {
    kind: "payment_received",
  });
  return { missionId, userId: mission.userId };
}

export const outcomeSchema = z.object({
  resolved: z.boolean(),
  /** Money recovered or saved, in euros. Absent or 0 for a non-monetary result. */
  recoveredEuros: z.number().min(0).max(1_000_000).optional(),
  note: z.string().trim().max(1000).optional(),
});

/**
 * The user closes the dossier and says whether the problem is solved.
 * Success mode: the fee is charged on the saved card only when it is; a
 * card that needs the bank's approval gets a payment page instead.
 */
export async function declareOutcome(
  db: Db,
  cfg: BillingConfig | null,
  userId: string,
  missionId: string,
  input: z.infer<typeof outcomeSchema>,
  fetchImpl?: typeof fetch,
) {
  const mission = await getOwnedMission(db, userId, missionId);
  if (mission.outcome) throw conflict("Vous avez déjà clôturé ce dossier.");
  if (await hasActiveRun(db, missionId)) throw conflict("Atlas travaille encore sur ce dossier. Attendez la fin avant de le clôturer.");
  const recoveredCents = input.resolved ? Math.round((input.recoveredEuros ?? 0) * 100) : 0;
  const outcome = { resolved: input.resolved, recoveredCents, ...(input.note ? { note: input.note } : {}), declaredAt: new Date().toISOString() };

  // Claim the dossier first, so two clicks can never charge twice.
  const claimed = await db
    .update(missions)
    .set({ outcome, nextFollowUpAt: null, followUpReason: null })
    .where(and(eq(missions.id, missionId), sql`${missions.outcome} is null`))
    .returning({ id: missions.id });
  if (!claimed.length) throw conflict("Vous avez déjà clôturé ce dossier.");
  await addMessage(
    db,
    missionId,
    "event",
    input.resolved
      ? `Vous avez indiqué que le problème est réglé${recoveredCents ? ` (${euros(recoveredCents)} récupérés)` : ""}.`
      : "Vous avez clôturé le dossier sans succès. Aucune commission n'est due.",
    { kind: "outcome_declared" },
  );
  // The dossier is closed: what was still open is no longer to be done.
  await db
    .update(missionSteps)
    .set({ status: "SKIPPED", completedBy: "user", result: "Dossier clôturé par l'utilisateur." })
    .where(and(eq(missionSteps.missionId, missionId), inArray(missionSteps.status, ["PENDING", "WAITING_USER", "BLOCKED", "FAILED"])));
  await refreshMissionStatus(db, missionId);

  const charge = { feeCents: 0, status: "none" as "none" | "charged" | "payment_page" | "failed", payUrl: null as string | null };
  const authorized = mission.payment?.authorizedAt && !mission.payment.paidAt;
  if (!input.resolved || !cfg || cfg.mode !== "success" || !authorized) return { outcome, charge };

  const feeCents = computeSuccessFee(cfg.fee, recoveredCents);
  charge.feeCents = feeCents;
  const user = await db.query.users.findFirst({ where: eq(users.id, userId) });
  const payment = { ...mission.payment!, feeDueCents: feeCents };
  const description = `Atlas — commission : ${mission.title}`;
  try {
    if (user?.stripeCustomerId && user.stripePaymentMethodId) {
      const r = await chargeSavedCard(
        cfg,
        { customerId: user.stripeCustomerId, paymentMethodId: user.stripePaymentMethodId, amountCents: feeCents, missionId, description },
        fetchImpl,
      );
      if (r.status === "succeeded") {
        await db
          .update(missions)
          .set({ payment: { ...payment, paidAt: new Date().toISOString(), amountCents: feeCents, currency: cfg.currency, paymentIntentId: r.paymentIntentId } })
          .where(eq(missions.id, missionId));
        await addMessage(db, missionId, "event", `Commission prélevée : ${euros(feeCents)}.`, { kind: "fee_charged" });
        charge.status = "charged";
        return { outcome, charge };
      }
      payment.failure = r.reason;
      if (r.paymentIntentId) payment.paymentIntentId = r.paymentIntentId;
    }
    const page = await createCheckoutSession(
      cfg,
      { missionId, userId, email: user?.email ?? "", title: mission.title, amountCents: feeCents, kind: "success_fee" },
      fetchImpl,
    );
    await db
      .update(missions)
      .set({ payment: { ...payment, feeCheckoutSessionId: page.id, payLinkUrl: page.url } })
      .where(eq(missions.id, missionId));
    await addMessage(db, missionId, "event", `Commission de ${euros(feeCents)} à régler : votre carte n'a pas pu être débitée directement${payment.failure ? ` (${payment.failure})` : ""}.`, {
      kind: "fee_payment_page",
    });
    charge.status = "payment_page";
    charge.payUrl = page.url;
  } catch (e) {
    // The outcome stays recorded; the fee is kept as due and can be collected later.
    await db
      .update(missions)
      .set({ payment: { ...payment, failure: e instanceof Error ? e.message : "erreur de paiement" } })
      .where(eq(missions.id, missionId));
    charge.status = "failed";
    console.error("[atlas] success fee charge failed", e);
  }
  return { outcome, charge };
}

/** What Atlas obtained for this user, across all their closed dossiers. */
export async function userResults(db: Db, userId: string) {
  const rows = await db
    .select({ outcome: missions.outcome })
    .from(missions)
    .where(and(eq(missions.userId, userId), isNotNull(missions.outcome)));
  const resolved = rows.filter((r) => r.outcome?.resolved);
  return {
    resolvedCount: resolved.length,
    recoveredCents: resolved.reduce((sum, r) => sum + (r.outcome?.recoveredCents ?? 0), 0),
  };
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
