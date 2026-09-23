import { NextResponse } from "next/server";
import { z } from "zod";
import { getDb } from "@/db";
import { clearSessionCookie, parseJson, requireUser, route } from "@/lib/http";
import { deleteAccount } from "@/server/account";
import { getStorage } from "@/server/documents/storage";

export const DELETE = route(async (req) => {
  const user = await requireUser();
  const { password } = await parseJson(req, z.object({ password: z.string().min(1, "Mot de passe requis.").max(200) }));
  await deleteAccount(getDb(), getStorage(), user.id, password);
  await clearSessionCookie();
  return NextResponse.json({ ok: true });
});
