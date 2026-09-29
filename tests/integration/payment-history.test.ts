/** The Paiements page's ledger: one line per dossier with a payment, newest first. */
import { beforeEach, describe, expect, it } from "vitest";
import { missions } from "@/db/schema";
import { paymentHistory } from "@/server/billing/history";
import { createTestUser, db, resetDb } from "../helpers/db";

beforeEach(resetDb);

describe("paymentHistory", () => {
  it("classifies commissions and totals what was paid and what is due", async () => {
    const user = await createTestUser();
    const other = await createTestUser();
    const consent = { consentAt: "2026-01-01T10:00:00.000Z", termsVersion: "1" };
    await db.insert(missions).values([
      { userId: user.id, title: "Remboursement vol", description: "x", payment: { ...consent, authorizedAt: consent.consentAt, paidAt: "2026-02-01T10:00:00.000Z", amountCents: 3600, creditAppliedCents: 500 } },
      { userId: user.id, title: "Caution", description: "x", payment: { ...consent, authorizedAt: consent.consentAt, feeDueCents: 1200, payLinkUrl: "https://pay.test/1" } },
      { userId: user.id, title: "Box internet", description: "x", payment: { ...consent, authorizedAt: "2026-01-15T10:00:00.000Z" } },
      { userId: user.id, title: "Sans paiement", description: "x" },
      { userId: other.id, title: "Pas à moi", description: "x", payment: { ...consent, paidAt: "2026-03-01T10:00:00.000Z", amountCents: 9900 } },
    ]);

    const h = await paymentHistory(db, user.id);
    expect(h.lines.map((l) => [l.title, l.state])).toEqual([
      ["Remboursement vol", "paid"],
      ["Box internet", "authorized"],
      ["Caution", "due"],
    ]);
    expect(h.paidCents).toBe(3600);
    expect(h.dueCents).toBe(1200);
    expect(h.creditUsedCents).toBe(500);
    expect(h.lines.find((l) => l.state === "due")?.payLinkUrl).toBe("https://pay.test/1");
  });
});
