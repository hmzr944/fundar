import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { config } from "@/lib/config";
import { clientKey, parseJson, route, setSessionCookie } from "@/lib/http";
import { resetPassword } from "@/server/account-links";
import { checkAuthRateLimit, createSession } from "@/server/auth";

const schema = z.object({ token: z.string().min(1).max(200), password: z.string().max(200) });

export const POST = route(async (req) => {
  checkAuthRateLimit(await clientKey("reset"), 10);
  const { token, password } = await parseJson(req, schema);
  const db = getDb();
  const user = await resetPassword(db, token, password);
  const session = await createSession(db, user.id, config.sessionDays);
  await setSessionCookie(session.token, session.expiresAt);
  return NextResponse.json({ ok: true });
});
