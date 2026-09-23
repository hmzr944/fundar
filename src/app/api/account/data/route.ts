import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { requireUser, route } from "@/lib/http";
import { deleteAllUserData } from "@/server/account";
import { getStorage } from "@/server/documents/storage";

/** Deletes all missions, documents and generated content of the current user. */
export const DELETE = route(async () => {
  const user = await requireUser();
  const res = await deleteAllUserData(getDb(), getStorage(), user.id);
  return NextResponse.json({ ok: true, ...res });
});
