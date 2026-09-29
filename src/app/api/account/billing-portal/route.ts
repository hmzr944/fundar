import { NextResponse } from "next/server";
import { requireUser, route } from "@/lib/http";
import { billingConfig, createPortalSession, StripeError } from "@/server/billing/stripe";
import { AppError, badRequest } from "@/server/errors";

/** Opens Stripe's customer portal for the signed-in user (card, invoices). */
export const POST = route(async () => {
  const user = await requireUser();
  const cfg = billingConfig();
  if (!cfg) throw new AppError(503, "Les paiements ne sont pas activés sur ce site.", "billing_disabled");
  if (!user.stripeCustomerId) throw badRequest("Aucun moyen de paiement enregistré pour l'instant.");
  try {
    const url = await createPortalSession(cfg, { customerId: user.stripeCustomerId, returnPath: "/app/paiements" });
    return NextResponse.json({ url });
  } catch (e) {
    if (e instanceof StripeError) throw new AppError(502, e.message, "stripe_error");
    throw e;
  }
});
