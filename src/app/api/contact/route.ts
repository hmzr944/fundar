import { NextResponse } from "next/server";
import { clientKey, currentUser, parseJson, route } from "@/lib/http";
import { checkAuthRateLimit } from "@/server/auth";
import { legalIdentity } from "@/server/billing/stripe";
import { contactSchema, sendContactMessage } from "@/server/contact";
import { mailContext } from "@/server/deps";
import { AppError } from "@/server/errors";
import { MailError } from "@/server/mail/mailer";

export const POST = route(async (req) => {
  checkAuthRateLimit(await clientKey("contact"), 5);
  const input = await parseJson(req, contactSchema);
  const user = await currentUser();
  try {
    await sendContactMessage(mailContext().mailer, legalIdentity().email, input, user?.email);
  } catch (e) {
    if (e instanceof MailError) throw new AppError(502, "L'envoi a échoué. Réessayez dans un instant, ou écrivez-nous directement par e-mail.", "mail_error");
    throw e;
  }
  return NextResponse.json({ ok: true });
});
