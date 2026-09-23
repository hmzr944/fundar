import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { config } from "@/lib/config";
import { clientKey, parseJson, route, setSessionCookie } from "@/lib/http";
import { checkAuthRateLimit, createSession, loginSchema, toPublicUser, verifyCredentials } from "@/server/auth";

export const POST = route(async (req) => {
  const input = await parseJson(req, loginSchema);
  checkAuthRateLimit(await clientKey(`login:${input.email}`), 10);
  const db = getDb();
  const user = await verifyCredentials(db, input);
  const { token, expiresAt } = await createSession(db, user.id, config.sessionDays);
  await setSessionCookie(token, expiresAt);
  return NextResponse.json({ user: toPublicUser(user) });
});
