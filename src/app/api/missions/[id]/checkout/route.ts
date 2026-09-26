import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { parseJson, requireUser, route } from "@/lib/http";
import { checkoutSchema, startCheckout, startPaidMission } from "@/server/billing/service";
import { billingConfig, StripeError } from "@/server/billing/stripe";
import { getAgentDeps } from "@/server/deps";
import { AppError, unavailable } from "@/server/errors";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Hands the dossier to Atlas after the free analysis: opens the payment page
 * (upfront mode) or the card-saving page (success mode, first dossier), or
 * starts right away when a card is already saved.
 */
export const POST = route(async (req, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  await parseJson(req, checkoutSchema);
  const cfg = billingConfig();
  if (!cfg) throw unavailable("Le paiement n'est pas activé sur cette instance.");
  try {
    const result = await startCheckout(getDb(), cfg, user.id, id);
    // Card already on file (success mode): Atlas starts right away.
    if (result.started) void startPaidMission(getAgentDeps(), id, user.id);
    return NextResponse.json(result);
  } catch (e) {
    if (e instanceof StripeError) throw new AppError(502, e.message, "payment_provider");
    throw e;
  }
});
