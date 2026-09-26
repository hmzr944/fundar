import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { parseJson, requireUser, route } from "@/lib/http";
import { checkoutSchema, startCheckout } from "@/server/billing/service";
import { billingConfig, StripeError } from "@/server/billing/stripe";
import { AppError, unavailable } from "@/server/errors";

type Ctx = { params: Promise<{ id: string }> };

/** Opens the payment page for this dossier (after the free analysis). */
export const POST = route(async (req, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  await parseJson(req, checkoutSchema);
  const cfg = billingConfig();
  if (!cfg) throw unavailable("Le paiement n'est pas activé sur cette instance.");
  try {
    return NextResponse.json(await startCheckout(getDb(), cfg, user.id, id));
  } catch (e) {
    if (e instanceof StripeError) throw new AppError(502, e.message, "payment_provider");
    throw e;
  }
});
