import { NextResponse } from "next/server";
import { getDb } from "@/db";
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
  const paid = await applyStripeEvent(getDb(), cfg, event);
  if (paid) void startPaidMission(getAgentDeps(), paid.missionId, paid.userId);
  return NextResponse.json({ received: true });
}
