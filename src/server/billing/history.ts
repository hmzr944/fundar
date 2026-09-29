import { and, desc, eq, isNotNull } from "drizzle-orm";
import type { Db } from "@/db";
import { missions, postalLetters } from "@/db/schema";

export type PaymentLine = {
  id: string;
  missionId: string;
  title: string;
  kind: "commission" | "lrar";
  state: "paid" | "due" | "authorized" | "pending";
  amountCents: number | null;
  creditAppliedCents: number;
  /** When the line last changed state (paid, authorized, consent). */
  date: string;
  payLinkUrl?: string;
  failure?: string;
};

/**
 * Everything money-related for one user, newest first: commissions per
 * dossier (from missions.payment) and registered letters.
 */
export async function paymentHistory(db: Db, userId: string) {
  const [rows, letters] = await Promise.all([
    db
      .select({ id: missions.id, title: missions.title, payment: missions.payment })
      .from(missions)
      .where(and(eq(missions.userId, userId), isNotNull(missions.payment)))
      .orderBy(desc(missions.updatedAt)),
    db
      .select({
        id: postalLetters.id,
        missionId: postalLetters.missionId,
        title: missions.title,
        status: postalLetters.status,
        priceCents: postalLetters.priceCents,
        paidAt: postalLetters.paidAt,
        createdAt: postalLetters.createdAt,
        failure: postalLetters.failure,
      })
      .from(postalLetters)
      .innerJoin(missions, eq(missions.id, postalLetters.missionId))
      .where(eq(postalLetters.userId, userId)),
  ]);

  const lines: PaymentLine[] = [];
  for (const m of rows) {
    const p = m.payment!;
    const base = { id: m.id, missionId: m.id, title: m.title, kind: "commission" as const, creditAppliedCents: p.creditAppliedCents ?? 0 };
    if (p.paidAt) lines.push({ ...base, state: "paid", amountCents: p.amountCents ?? null, date: p.paidAt });
    else if (p.feeDueCents !== undefined) lines.push({ ...base, state: "due", amountCents: p.feeDueCents, date: p.authorizedAt ?? p.consentAt, payLinkUrl: p.payLinkUrl, failure: p.failure });
    else if (p.authorizedAt) lines.push({ ...base, state: "authorized", amountCents: null, date: p.authorizedAt });
    else lines.push({ ...base, state: "pending", amountCents: null, date: p.consentAt });
  }
  for (const l of letters) {
    if (l.status === "PENDING_PAYMENT") continue;
    lines.push({
      id: l.id,
      missionId: l.missionId,
      title: l.title,
      kind: "lrar",
      state: l.status === "FAILED" && !l.paidAt ? "pending" : "paid",
      amountCents: l.priceCents,
      creditAppliedCents: 0,
      date: (l.paidAt ?? l.createdAt).toISOString(),
      failure: l.failure ?? undefined,
    });
  }
  lines.sort((a, b) => b.date.localeCompare(a.date));

  const paidCents = lines.filter((l) => l.state === "paid").reduce((s, l) => s + (l.amountCents ?? 0), 0);
  const dueCents = lines.filter((l) => l.state === "due").reduce((s, l) => s + (l.amountCents ?? 0), 0);
  const creditUsedCents = lines.reduce((s, l) => s + l.creditAppliedCents, 0);
  return { lines, paidCents, dueCents, creditUsedCents };
}
