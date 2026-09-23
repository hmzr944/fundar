import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { config } from "@/lib/config";
import { parseJson, requireUser, route, setSessionCookie } from "@/lib/http";
import { changePassword, createSession } from "@/server/auth";

export const POST = route(async (req) => {
  const user = await requireUser();
  const input = await parseJson(req, z.object({ current: z.string().min(1).max(200), next: z.string().max(200) }));
  const db = getDb();
  await changePassword(db, user.id, input.current, input.next);
  // All sessions were revoked; keep the current browser signed in with a fresh one.
  const { token, expiresAt } = await createSession(db, user.id, config.sessionDays);
  await setSessionCookie(token, expiresAt);
  return NextResponse.json({ ok: true });
});
