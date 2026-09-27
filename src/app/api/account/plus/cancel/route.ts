import { NextResponse } from "next/server";
import { requireUser, route } from "@/lib/http";
import { cancelPlus } from "@/server/billing/plus";
import { billingConfig, StripeError } from "@/server/billing/stripe";
import { AppError, unavailable } from "@/server/errors";
import { getDb } from "@/db";

/** Cancels the subscription at the end of the period already paid for. */
export const POST = route(async () => {
  const user = await requireUser();
  const cfg = billingConfig();
  if (!cfg?.plus) throw unavailable("Atlas Plus n'est pas activé sur cette instance.");
  try {
    await cancelPlus(getDb(), cfg, user.id);
    return NextResponse.json({ ok: true });
  } catch (e) {
    if (e instanceof StripeError) throw new AppError(502, e.message, "payment_provider");
    throw e;
  }
});
