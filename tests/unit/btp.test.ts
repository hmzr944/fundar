import { describe, expect, it } from "vitest";
import { actionDirecte, addMonths, factureImpayee, interetsMoratoires, retenueDeGarantie } from "@/lib/btp";

const d = (s: string) => new Date(`${s}T00:00:00Z`);

describe("construction deadlines", () => {
  it("adds months and clamps to the end of shorter months", () => {
    expect(addMonths(d("2025-01-31"), 1).toISOString().slice(0, 10)).toBe("2025-02-28");
    expect(addMonths(d("2024-02-29"), 12).toISOString().slice(0, 10)).toBe("2025-02-28");
  });

  it("releases the retenue one year after reception, capped at 5 %", () => {
    const r = retenueDeGarantie({ receptionDate: d("2025-11-12"), worksCents: 2_000_000, today: d("2026-10-13") });
    expect(r.releaseDate.toISOString().slice(0, 10)).toBe("2026-11-12");
    expect(r.maxAmountCents).toBe(100_000);
    expect(r.daysLeft).toBe(30);
    expect(r.claimable).toBe(false);
    expect(retenueDeGarantie({ receptionDate: d("2025-01-10"), worksCents: 1, today: d("2026-10-13") }).claimable).toBe(true);
  });

  it("counts public late-payment interest from the end of the deadline", () => {
    const r = interetsMoratoires({ receivedDate: d("2026-01-01"), amountCents: 1_000_000, today: d("2026-03-02"), ratePct: 10 });
    expect(r.dueDate.toISOString().slice(0, 10)).toBe("2026-01-31");
    expect(r.daysLate).toBe(30);
    expect(r.interestCents).toBe(Math.round((1_000_000 * 0.1 * 30) / 365));
    expect(r.indemnityCents).toBe(4000);
    expect(interetsMoratoires({ receivedDate: d("2026-01-01"), amountCents: 1, buyer: "hopital", today: d("2026-02-15") }).daysLate).toBe(0);
  });

  it("opens the subcontractor's direct action one month after the notice", () => {
    const r = actionDirecte({ noticeDate: d("2026-09-20"), today: d("2026-10-13") });
    expect(r.openDate.toISOString().slice(0, 10)).toBe("2026-10-20");
    expect(r.open).toBe(false);
    expect(r.daysLeft).toBe(7);
  });

  it("adds the 40 € indemnity only once an invoice is late", () => {
    expect(factureImpayee({ dueDate: d("2026-10-01"), amountCents: 1, today: d("2026-10-13") })).toEqual({ daysLate: 12, indemnityCents: 4000 });
    expect(factureImpayee({ dueDate: d("2026-10-20"), amountCents: 1, today: d("2026-10-13") }).indemnityCents).toBe(0);
  });
});
