import { createHmac, timingSafeEqual } from "node:crypto";
import type { FeeTerms } from "@/lib/fee";

/**
 * Billing through Stripe (plain HTTPS calls, no SDK): a success fee charged
 * on a saved card, or a fixed price paid upfront.
 * Billing is active only when every setting is present, including the
 * seller's legal identity: Atlas never charges without the legal notices a
 * paid consumer service requires.
 */
export type SuccessFee = FeeTerms;

export type BillingConfig = {
  /**
   * "success" (default): nothing to pay upfront, the user saves a card once
   * and a fee is charged only when they declare the problem solved.
   * "upfront": a fixed price paid before Atlas starts.
   */
  mode: "success" | "upfront";
  priceCents: number;
  fee: SuccessFee;
  currency: "eur";
  secretKey: string;
  webhookSecret: string;
  appUrl: string;
  termsVersion: string;
};

const intEnv = (v: string | undefined, fallback: number) => {
  const n = Number(v);
  return v !== undefined && v !== "" && Number.isInteger(n) && n >= 0 ? n : fallback;
};

export function billingConfig(env: Record<string, string | undefined> = process.env): BillingConfig | null {
  const mode = env.ATLAS_BILLING_MODE?.trim() === "upfront" ? "upfront" : "success";
  const priceCents = intEnv(env.ATLAS_PRICE_CENTS, 0);
  const secretKey = env.STRIPE_SECRET_KEY?.trim();
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET?.trim();
  const appUrl = env.ATLAS_APP_URL?.trim().replace(/\/+$/, "");
  if (!secretKey || !webhookSecret || !appUrl) return null;
  if (mode === "upfront" && priceCents <= 0) return null;
  if (!legalIdentity(env).complete) return null;
  const fee: SuccessFee = {
    ratePct: intEnv(env.ATLAS_SUCCESS_FEE_PCT, 20),
    minCents: intEnv(env.ATLAS_SUCCESS_FEE_MIN_CENTS, 500),
    maxCents: intEnv(env.ATLAS_SUCCESS_FEE_MAX_CENTS, 3000),
    flatCents: intEnv(env.ATLAS_SUCCESS_FEE_FLAT_CENTS, 500),
  };
  return { mode, priceCents, fee, currency: "eur", secretKey, webhookSecret, appUrl, termsVersion: env.ATLAS_TERMS_VERSION?.trim() || "1" };
}

/**
 * The success fee: a share of what was recovered, bounded, or a flat fee for
 * a result with no money involved (a cancellation obtained, a service back).
 */
export function computeSuccessFee(fee: SuccessFee, recoveredCents: number) {
  if (recoveredCents <= 0) return fee.flatCents;
  const share = Math.round((recoveredCents * fee.ratePct) / 100);
  return Math.min(fee.maxCents, Math.max(fee.minCents, share));
}

/** Seller identity shown in the legal pages (mentions légales, CGV). */
export function legalIdentity(env: Record<string, string | undefined> = process.env) {
  const id = {
    name: env.ATLAS_LEGAL_NAME?.trim() || null,
    siret: env.ATLAS_LEGAL_SIRET?.trim() || null,
    address: env.ATLAS_LEGAL_ADDRESS?.trim() || null,
    email: env.ATLAS_LEGAL_EMAIL?.trim() || null,
    host: env.ATLAS_LEGAL_HOST?.trim() || null,
    mediator: env.ATLAS_LEGAL_MEDIATOR?.trim() || null,
  };
  return { ...id, complete: Object.values(id).every(Boolean) };
}

export class StripeError extends Error {}

type StripeObject = Record<string, unknown> & { id?: string; error?: { message?: string; code?: string; payment_intent?: { id?: string } } };

async function stripeCall(cfg: BillingConfig, method: "GET" | "POST", path: string, form: URLSearchParams | null, fetchImpl: typeof fetch) {
  let res: Response;
  try {
    res = await fetchImpl(`https://api.stripe.com/v1/${path}`, {
      method,
      headers: { authorization: `Bearer ${cfg.secretKey}`, ...(form ? { "content-type": "application/x-www-form-urlencoded" } : {}) },
      ...(form ? { body: form } : {}),
    });
  } catch {
    throw new StripeError("Le service de paiement est injoignable. Réessayez dans quelques instants.");
  }
  const data = (await res.json().catch(() => ({}))) as StripeObject;
  return { ok: res.ok, status: res.status, data };
}

async function stripePost(cfg: BillingConfig, path: string, form: URLSearchParams, fetchImpl: typeof fetch) {
  const { ok, data } = await stripeCall(cfg, "POST", path, form, fetchImpl);
  if (!ok || !data.id) throw new StripeError(`Le service de paiement a refusé la demande${data.error?.message ? ` : ${data.error.message}` : "."}`);
  return data;
}

/** Creates a Checkout Session for a one-off payment (upfront price, or a success fee the card could not cover). */
export async function createCheckoutSession(
  cfg: BillingConfig,
  p: { missionId: string; userId: string; email: string; title: string; amountCents?: number; kind?: "upfront" | "success_fee" },
  fetchImpl: typeof fetch = fetch,
): Promise<{ id: string; url: string }> {
  const kind = p.kind ?? "upfront";
  const form = new URLSearchParams({
    mode: "payment",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": cfg.currency,
    "line_items[0][price_data][unit_amount]": String(p.amountCents ?? cfg.priceCents),
    "line_items[0][price_data][product_data][name]":
      kind === "success_fee" ? "Atlas — commission sur votre dossier réglé" : "Atlas — prise en charge de votre dossier",
    "line_items[0][price_data][product_data][description]": p.title.slice(0, 200),
    customer_email: p.email,
    client_reference_id: p.missionId,
    "metadata[missionId]": p.missionId,
    "metadata[userId]": p.userId,
    "metadata[kind]": kind,
    "payment_intent_data[metadata][missionId]": p.missionId,
    success_url: `${cfg.appUrl}/app/missions/${p.missionId}?paiement=ok`,
    cancel_url: `${cfg.appUrl}/app/missions/${p.missionId}?paiement=annule`,
  });
  const data = await stripePost(cfg, "checkout/sessions", form, fetchImpl);
  if (typeof data.url !== "string") throw new StripeError("Le service de paiement n'a pas renvoyé de page de paiement.");
  return { id: data.id!, url: data.url };
}

/** A Stripe customer for this user (created once). */
export async function createCustomer(cfg: BillingConfig, p: { userId: string; email: string }, fetchImpl: typeof fetch = fetch) {
  const data = await stripePost(cfg, "customers", new URLSearchParams({ email: p.email, "metadata[userId]": p.userId }), fetchImpl);
  return data.id!;
}

/** Checkout in "setup" mode: the user saves a card, nothing is charged. */
export async function createSetupSession(
  cfg: BillingConfig,
  p: { customerId: string; missionId: string; userId: string },
  fetchImpl: typeof fetch = fetch,
): Promise<{ id: string; url: string }> {
  const form = new URLSearchParams({
    mode: "setup",
    currency: cfg.currency,
    customer: p.customerId,
    "payment_method_types[0]": "card",
    client_reference_id: p.missionId,
    "metadata[missionId]": p.missionId,
    "metadata[userId]": p.userId,
    "metadata[kind]": "card_setup",
    "setup_intent_data[metadata][missionId]": p.missionId,
    success_url: `${cfg.appUrl}/app/missions/${p.missionId}?paiement=ok`,
    cancel_url: `${cfg.appUrl}/app/missions/${p.missionId}?paiement=annule`,
  });
  const data = await stripePost(cfg, "checkout/sessions", form, fetchImpl);
  if (typeof data.url !== "string") throw new StripeError("Le service de paiement n'a pas renvoyé de page d'enregistrement de carte.");
  return { id: data.id!, url: data.url };
}

/** The card saved by a completed setup. */
export async function setupIntentPaymentMethod(cfg: BillingConfig, setupIntentId: string, fetchImpl: typeof fetch = fetch) {
  const { ok, data } = await stripeCall(cfg, "GET", `setup_intents/${encodeURIComponent(setupIntentId)}`, null, fetchImpl);
  if (!ok || typeof data.payment_method !== "string") throw new StripeError("Carte enregistrée introuvable.");
  return data.payment_method;
}

export type ChargeResult =
  | { status: "succeeded"; paymentIntentId: string }
  | { status: "needs_payment_page"; reason: string; paymentIntentId?: string };

/**
 * Charges the saved card without the user present (their consent was given
 * when saving it). A card that needs authentication or is declined is not
 * an error: the caller then sends a payment page.
 */
export async function chargeSavedCard(
  cfg: BillingConfig,
  p: { customerId: string; paymentMethodId: string; amountCents: number; missionId: string; description: string },
  fetchImpl: typeof fetch = fetch,
): Promise<ChargeResult> {
  const form = new URLSearchParams({
    amount: String(p.amountCents),
    currency: cfg.currency,
    customer: p.customerId,
    payment_method: p.paymentMethodId,
    off_session: "true",
    confirm: "true",
    description: p.description.slice(0, 200),
    "metadata[missionId]": p.missionId,
    "metadata[kind]": "success_fee",
  });
  const { ok, data } = await stripeCall(cfg, "POST", "payment_intents", form, fetchImpl);
  if (ok && data.status === "succeeded" && data.id) return { status: "succeeded", paymentIntentId: data.id };
  const reason =
    data.error?.code === "authentication_required"
      ? "votre banque demande une validation"
      : data.error?.message ?? (typeof data.status === "string" ? `paiement ${data.status}` : "paiement refusé");
  return { status: "needs_payment_page", reason, paymentIntentId: data.error?.payment_intent?.id ?? data.id };
}

/**
 * Verifies a Stripe webhook signature header ("t=…,v1=…") against the raw
 * body, with a replay window.
 */
export function verifyStripeSignature(rawBody: string, header: string | null, secret: string, nowMs = Date.now(), toleranceSec = 300) {
  if (!header) return false;
  const parts = Object.fromEntries(
    header.split(",").map((kv) => {
      const i = kv.indexOf("=");
      return [kv.slice(0, i).trim(), kv.slice(i + 1).trim()];
    }),
  );
  const t = Number(parts.t);
  if (!Number.isFinite(t) || Math.abs(nowMs / 1000 - t) > toleranceSec) return false;
  const expected = createHmac("sha256", secret).update(`${parts.t}.${rawBody}`).digest("hex");
  const signatures = header
    .split(",")
    .filter((kv) => kv.trim().startsWith("v1="))
    .map((kv) => kv.trim().slice(3));
  return signatures.some((sig) => sig.length === expected.length && timingSafeEqual(Buffer.from(sig), Buffer.from(expected)));
}

/** Signs a payload the way Stripe does (tests and local checks). */
export function signStripePayload(rawBody: string, secret: string, t = Math.floor(Date.now() / 1000)) {
  return `t=${t},v1=${createHmac("sha256", secret).update(`${t}.${rawBody}`).digest("hex")}`;
}
