import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { parseJson, requireUser, route } from "@/lib/http";
import { declareOutcome, outcomeSchema } from "@/server/billing/service";
import { billingConfig } from "@/server/billing/stripe";
import { getAgentDeps } from "@/server/deps";
import { notifyFeePage } from "@/server/mail/notify";

type Ctx = { params: Promise<{ id: string }> };

/** The user closes the dossier: solved or not (and how much was recovered). */
export const POST = route(async (req, { params }: Ctx) => {
  const user = await requireUser();
  const { id } = await params;
  const input = await parseJson(req, outcomeSchema);
  const result = await declareOutcome(getDb(), billingConfig(), user.id, id, input);
  if (result.charge.status === "payment_page") {
    const deps = getAgentDeps();
    await notifyFeePage(getDb(), deps.mailer, id);
  }
  return NextResponse.json(result);
});
