import { NextResponse } from "next/server";
import { requireUser, route } from "@/lib/http";
import { startPlusCheckout } from "@/server/billing/plus";
import { billingConfig, StripeError } from "@/server/billing/stripe";
import { AppError, unavailable } from "@/server/errors";
import { getDb } from "@/db";

/** Opens the "Atlas Plus" subscription checkout. */
export const POST = route(async () => {
  const user = await requireUser();
  const cfg = billingConfig();
  if (!cfg?.plus) throw unavailable("Atlas Plus n'est pas activé sur cette instance.");
  try {
    return NextResponse.json(await startPlusCheckout(getDb(), cfg, user.id));
  } catch (e) {
    if (e instanceof StripeError) throw new AppError(502, e.message, "payment_provider");
    throw e;
  }
});
