import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { claimDueFollowUps, runFollowUps } from "@/server/agent/follow-ups";
import { getAgentDeps } from "@/server/deps";

/**
 * Triggers the follow-ups that are due. Meant for a scheduler (cron), not a
 * browser: authenticated by a shared secret, so no session cookie and no
 * same-origin check. The work runs in the background of this long-lived
 * server process; the response lists the missions picked up.
 */
export async function POST(req: Request) {
  const secret = process.env.ATLAS_CRON_SECRET;
  if (!secret || secret.length < 24) {
    return NextResponse.json({ error: "Reprises programmées désactivées (ATLAS_CRON_SECRET absent ou trop court)." }, { status: 503 });
  }
  const given = Buffer.from(req.headers.get("authorization")?.replace(/^Bearer /, "") ?? "");
  const expected = Buffer.from(secret);
  if (given.length !== expected.length || !timingSafeEqual(given, expected)) {
    return NextResponse.json({ error: "Non autorisé." }, { status: 401 });
  }
  const deps = getAgentDeps();
  const claimed = await claimDueFollowUps(deps);
  void runFollowUps(deps, claimed).catch((e) => console.error("[atlas] follow-ups crashed", e));
  return NextResponse.json({ started: claimed.map((m) => m.id) }, { status: 202 });
}
