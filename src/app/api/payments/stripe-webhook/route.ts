import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { applyPlusCheckout, applyPlusSubscriptionEvent } from "@/server/billing/plus";
import { applyStripeEvent, startPaidMission } from "@/server/billing/service";
import { billingConfig, verifyStripeSignature } from "@/server/billing/stripe";
import { getAgentDeps, getPostalProvider } from "@/server/deps";
import { applyLrarCheckout, sendLetter } from "@/server/postal/service";

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
  let letterId: string | null = null;
  try {
    // A dossier's own session (paid, saved card…), an Atlas Plus session and
    // an LRAR session never share metadata: each call is a no-op for the others' events.
    paid = await applyStripeEvent(getDb(), cfg, event);
    await applyPlusCheckout(getDb(), cfg, event.data?.object ?? {});
    await applyPlusSubscriptionEvent(getDb(), event);
    letterId = await applyLrarCheckout(getDb(), cfg, event.data?.object ?? {});
  } catch (e) {
    // Stripe retries on a non-2xx answer: a transient failure is not lost.
    console.error("[atlas] stripe event failed", e);
    return NextResponse.json({ error: "Traitement impossible pour le moment." }, { status: 500 });
  }
  if (paid) void startPaidMission(getAgentDeps(), paid.missionId, paid.userId);
  if (letterId) void sendLetter(getDb(), getPostalProvider(), getAgentDeps().mailer, letterId);
  return NextResponse.json({ received: true });
}
