import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { clientKey, requireUser, route } from "@/lib/http";
import { sendVerificationEmail } from "@/server/account-links";
import { checkAuthRateLimit } from "@/server/auth";
import { mailContext } from "@/server/deps";
import { AppError } from "@/server/errors";

/** Re-sends the address verification link to the signed-in user. */
export const POST = route(async () => {
  const user = await requireUser();
  checkAuthRateLimit(await clientKey(`verify:${user.id}`), 3);
  const { mailer, appUrl } = mailContext();
  const sent = await sendVerificationEmail(getDb(), mailer, appUrl, user);
  if (!sent) throw new AppError(503, "L'envoi d'e-mails n'est pas encore configuré sur ce site.", "mail_unavailable");
  return NextResponse.json({ ok: true });
});
