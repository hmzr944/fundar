import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { clearSessionCookie, route } from "@/lib/http";
import { destroySession, SESSION_COOKIE } from "@/server/auth";

export const POST = route(async () => {
  const store = await cookies();
  await destroySession(getDb(), store.get(SESSION_COOKIE)?.value);
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
});
