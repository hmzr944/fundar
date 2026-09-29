import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { config } from "@/lib/config";
import { clientKey, parseJson, route, setSessionCookie } from "@/lib/http";
import { sendVerificationEmail } from "@/server/account-links";
import { checkAuthRateLimit, createSession, createUser, signupSchema, toPublicUser } from "@/server/auth";
import { mailContext } from "@/server/deps";

export const POST = route(async (req) => {
  checkAuthRateLimit(await clientKey("signup"), 10);
  const input = await parseJson(req, signupSchema);
  const db = getDb();
  const user = await createUser(db, input);
  const { mailer, appUrl } = mailContext();
  // A failed verification e-mail must not block the signup: it can be re-sent from the app.
  await sendVerificationEmail(db, mailer, appUrl, user).catch((e) => console.error("[nimbrel] verification mail failed", e));
  const { token, expiresAt } = await createSession(db, user.id, config.sessionDays);
  await setSessionCookie(token, expiresAt);
  return NextResponse.json({ user: toPublicUser(user) }, { status: 201 });
});
