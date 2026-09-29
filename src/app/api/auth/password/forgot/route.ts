import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { clientKey, parseJson, route } from "@/lib/http";
import { requestPasswordReset } from "@/server/account-links";
import { checkAuthRateLimit } from "@/server/auth";
import { mailContext } from "@/server/deps";

const schema = z.object({ email: z.string().trim().toLowerCase().email("Adresse e-mail invalide.").max(254) });

export const POST = route(async (req) => {
  checkAuthRateLimit(await clientKey("forgot"), 5);
  const { email } = await parseJson(req, schema);
  const { mailer, appUrl } = mailContext();
  try {
    await requestPasswordReset(getDb(), mailer, appUrl, email);
  } catch (e) {
    // Same answer either way: never reveal whether the address has an account.
    console.error("[nimbrel] password reset mail failed", e);
  }
  return NextResponse.json({ ok: true });
});
