import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { applyPlusCheckout, applyPlusSubscriptionEvent } from "@/server/billing/plus";
import { applyStripeEvent, startPaidMission } from "@/server/billing/service";
import { billingConfig, verifyStripeSignature } from "@/server/billing/stripe";
import { getAgentDeps } from "@/server/deps";

/**
 * Stripe webhook. Authenticated by Stripe's signature (not by a session),
 * so it bypasses the same-origin check on purpose. Answers fast; the paid
 * dossier then starts in the background of this server process.
 */
export async function POST(req: Request) {
  const cfg = billingConfig();
  if (!cfg) return NextResponse.json({ error: "Paiement non activé." }, { status: 503 });
  const raw = await req.text();
  if (!verifyStripeSignature(raw, req.headers.get("stripe-signature"), cfg.webhookSecret)) {
    return NextResponse.json({ error: "Signature invalide." }, { status: 400 });
  }
  let event: Parameters<typeof applyStripeEvent>[2];
  try {
    event = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "Corps invalide." }, { status: 400 });
  }
  let paid: Awaited<ReturnType<typeof applyStripeEvent>>;
  try {
    // A dossier's own session (paid, saved card…) and an Atlas Plus session
    // never share metadata: each call is a no-op for the other's event.
    paid = await applyStripeEvent(getDb(), cfg, event);
    await applyPlusCheckout(getDb(), cfg, event.data?.object ?? {});
    await applyPlusSubscriptionEvent(getDb(), event);
  } catch (e) {
    // Stripe retries on a non-2xx answer: a transient failure is not lost.
    console.error("[atlas] stripe event failed", e);
    return NextResponse.json({ error: "Traitement impossible pour le moment." }, { status: 500 });
  }
  if (paid) void startPaidMission(getAgentDeps(), paid.missionId, paid.userId);
  return NextResponse.json({ received: true });
}
