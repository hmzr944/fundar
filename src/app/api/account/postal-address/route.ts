import { NextResponse } from "next/server";
import { getDb } from "@/db";
import { parseJson, requireUser, route } from "@/lib/http";
import { postalAddressSchema, setPostalAddress } from "@/server/postal/service";

/** Saves the user's return address, asked for once when they first request a registered letter. */
export const POST = route(async (req) => {
  const user = await requireUser();
  const input = await parseJson(req, postalAddressSchema);
  await setPostalAddress(getDb(), user.id, input);
  return NextResponse.json({ ok: true });
});
