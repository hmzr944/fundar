import { createHmac, timingSafeEqual } from "node:crypto";

/**
 * Pay-per-dossier billing through Stripe Checkout (plain HTTPS calls, no SDK).
 * Billing is active only when every setting is present, including the
 * seller's legal identity: Atlas never charges without the legal notices a
 * paid consumer service requires.
 */
export type BillingConfig = {
  priceCents: number;
  currency: "eur";
  secretKey: string;
  webhookSecret: string;
  appUrl: string;
  termsVersion: string;
};

export function billingConfig(env: Record<string, string | undefined> = process.env): BillingConfig | null {
  const priceCents = Number(env.ATLAS_PRICE_CENTS ?? 0);
  const secretKey = env.STRIPE_SECRET_KEY?.trim();
  const webhookSecret = env.STRIPE_WEBHOOK_SECRET?.trim();
  const appUrl = env.ATLAS_APP_URL?.trim().replace(/\/+$/, "");
  if (!Number.isInteger(priceCents) || priceCents <= 0 || !secretKey || !webhookSecret || !appUrl) return null;
  if (!legalIdentity(env).complete) return null;
  return { priceCents, currency: "eur", secretKey, webhookSecret, appUrl, termsVersion: env.ATLAS_TERMS_VERSION?.trim() || "1" };
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

/** Creates a Checkout Session for one dossier. */
export async function createCheckoutSession(
  cfg: BillingConfig,
  p: { missionId: string; userId: string; email: string; title: string },
  fetchImpl: typeof fetch = fetch,
): Promise<{ id: string; url: string }> {
  const form = new URLSearchParams({
    mode: "payment",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": cfg.currency,
    "line_items[0][price_data][unit_amount]": String(cfg.priceCents),
    "line_items[0][price_data][product_data][name]": "Atlas — prise en charge de votre dossier",
    "line_items[0][price_data][product_data][description]": p.title.slice(0, 200),
    customer_email: p.email,
    client_reference_id: p.missionId,
    "metadata[missionId]": p.missionId,
    "metadata[userId]": p.userId,
    "payment_intent_data[metadata][missionId]": p.missionId,
    success_url: `${cfg.appUrl}/app/missions/${p.missionId}?paiement=ok`,
    cancel_url: `${cfg.appUrl}/app/missions/${p.missionId}?paiement=annule`,
  });
  let res: Response;
  try {
    res = await fetchImpl("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: { authorization: `Bearer ${cfg.secretKey}`, "content-type": "application/x-www-form-urlencoded" },
      body: form,
    });
  } catch {
    throw new StripeError("Le service de paiement est injoignable. Réessayez dans quelques instants.");
  }
  const data = (await res.json().catch(() => ({}))) as { id?: string; url?: string; error?: { message?: string } };
  if (!res.ok || !data.id || !data.url) {
    throw new StripeError(`Le service de paiement a refusé la demande${data.error?.message ? ` : ${data.error.message}` : "."}`);
  }
  return { id: data.id, url: data.url };
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
