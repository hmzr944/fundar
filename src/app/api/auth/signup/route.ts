import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { config } from "@/lib/config";
import { clientKey, parseJson, route, setSessionCookie } from "@/lib/http";
import { checkAuthRateLimit, createSession, createUser, signupSchema, toPublicUser } from "@/server/auth";

export const POST = route(async (req) => {
  checkAuthRateLimit(await clientKey("signup"), 10);
  const input = await parseJson(req, signupSchema);
  const db = getDb();
  const user = await createUser(db, input);
  const { token, expiresAt } = await createSession(db, user.id, config.sessionDays);
  await setSessionCookie(token, expiresAt);
  return NextResponse.json({ user: toPublicUser(user) }, { status: 201 });
});
