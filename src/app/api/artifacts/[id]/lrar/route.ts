import { NextResponse } from "next/server";
import { parseJson, requireUser, route } from "@/lib/http";
import { getDb } from "@/db";
import { billingConfig, StripeError } from "@/server/billing/stripe";
import { postalConfig } from "@/server/postal/config";
import { postalAddressSchema, requestLrar } from "@/server/postal/service";
import { AppError, unavailable } from "@/server/errors";

type Ctx = { params: Promise<{ id: string }> };

/** Opens the payment page for a registered letter (LRAR) of this deliverable. */
export const POST = route(async (req, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const recipient = await parseJson(req, postalAddressSchema);
  const billing = billingConfig();
  const postal = postalConfig();
  if (!billing || !postal) throw unavailable("La lettre recommandée n'est pas activée sur cette instance.");
  try {
    return NextResponse.json(await requestLrar(getDb(), billing, postal, user.id, id, recipient));
  } catch (e) {
    if (e instanceof StripeError) throw new AppError(502, e.message, "payment_provider");
    throw e;
  }
});
