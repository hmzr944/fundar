import { describe, expect, it } from "vitest";
import { isAdmin, summarize, type MissionFacts } from "@/server/admin/economics";

const now = new Date("2026-09-26T12:00:00Z");
const old = new Date("2026-06-01T12:00:00Z");

function facts(over: Partial<MissionFacts> = {}): MissionFacts {
  return {
    userId: "u1",
    createdAt: old,
    updatedAt: old,
    status: "COMPLETED",
    analysed: true,
    canHandle: true,
    payment: { consentAt: old.toISOString(), termsVersion: "1", authorizedAt: old.toISOString() },
    outcome: null,
    aiCostUsd: 1,
    troubled: false,
    ...over,
  };
}
const resolved = (feeCents: number, recoveredCents = 10_000): Partial<MissionFacts> => ({
  outcome: { resolved: true, recoveredCents, declaredAt: old.toISOString() },
  payment: { consentAt: old.toISOString(), termsVersion: "1", authorizedAt: old.toISOString(), paidAt: old.toISOString(), amountCents: feeCents, feeDueCents: feeCents },
});
const failed: Partial<MissionFacts> = { outcome: { resolved: false, recoveredCents: 0, declaredAt: old.toISOString() } };

describe("owner economics", () => {
  it("counts what each dossier brings in and costs, free analyses included", () => {
    const e = summarize(
      [
        facts(resolved(2000)),
        facts({ ...failed, userId: "u2" }),
        facts({ userId: "u2", status: "IN_PROGRESS" }),
        // A free analysis that never became a dossier still costs money.
        facts({ userId: "u3", payment: null, aiCostUsd: 0.2 }),
      ],
      now,
    );
    expect(e).toMatchObject({ analysed: 4, eligible: 4, taken: 3, resolved: 1, failed: 1, open: 1, customers: 2, returning: 1 });
    expect(e.revenueCents).toBe(2000);
    expect(e.stripeCents).toBe(55);
    expect(e.aiTakenCents).toBe(270);
    expect(e.aiFreeCents).toBe(18);
    expect(e.chargesCents).toBe(420);
    expect(e.marginCents).toBe(2000 - 55 - 270 - 18 - 420);
    expect(e.successRate).toBe(0.5);
    expect(e.enoughData).toBe(false);
    expect(e.alerts[0]).toMatchObject({ level: "watch", lesson: expect.stringContaining("Homejoy") });
  });

  it("says stop when dossiers cost more than they bring in", () => {
    const rows = [...Array(2)].map(() => facts(resolved(500))).concat([...Array(18)].map(() => facts({ ...failed, aiCostUsd: 2.8 })));
    const e = summarize(rows, now);
    expect(e.enoughData).toBe(true);
    expect(e.marginPerTakenCents).toBeLessThan(0);
    const levels = e.alerts.filter((a) => a.level === "stop").map((a) => a.lesson);
    expect(levels.some((l) => l.includes("coûte plus qu'il ne rapporte"))).toBe(true);
    expect(levels.some((l) => l.includes("DoNotPay"))).toBe(true);
  });

  it("reports a healthy margin as the ceiling for acquiring a customer", () => {
    const rows = [...Array(12)].map(() => facts(resolved(2000))).concat([...Array(8)].map(() => facts(failed)));
    const e = summarize(rows, now);
    const margin = e.alerts.find((a) => a.lesson.includes("coûte plus"));
    expect(margin).toMatchObject({ level: "ok", message: expect.stringContaining("N'achetez pas un client plus cher") });
  });

  it("flags dossiers never closed, and dossiers where someone may have to step in", () => {
    const rows = [
      ...[...Array(4)].map(() => facts()),
      facts({ status: "COMPLETED", updatedAt: new Date("2026-09-20T00:00:00Z") }),
      ...[...Array(2)].map(() => facts({ ...resolved(1000), troubled: true })),
    ];
    const e = summarize(rows, now);
    expect(e.neverClosed).toBe(4);
    expect(e.alerts.some((a) => a.lesson.includes("servir sans être payé"))).toBe(true);
    expect(e.alerts.some((a) => a.lesson.includes("Facebook M"))).toBe(true);
  });

  it("lets only the configured owners in", () => {
    const env = { ATLAS_ADMIN_EMAILS: " Moi@Exemple.fr , autre@exemple.fr" };
    expect(isAdmin("moi@exemple.fr", env)).toBe(true);
    expect(isAdmin("intrus@exemple.fr", env)).toBe(false);
    expect(isAdmin("moi@exemple.fr", {})).toBe(false);
  });
});
