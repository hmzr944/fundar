import { describe, expect, it } from "vitest";
import { BAREME, palierDistance } from "./distance";

describe("palierDistance", () => {
  it("est COURT à exactement 1500 km", () => {
    expect(palierDistance(1500, false)).toBe("COURT");
  });

  it("est MOYEN juste au-dessus de 1500 km (non intra)", () => {
    expect(palierDistance(1501, false)).toBe("MOYEN");
  });

  it("est MOYEN pour un vol intra-UE de 1600 km", () => {
    expect(palierDistance(1600, true)).toBe("MOYEN");
  });

  it("est MOYEN à exactement 3500 km (non intra)", () => {
    expect(palierDistance(3500, false)).toBe("MOYEN");
  });

  it("est LONG juste au-dessus de 3500 km (non intra)", () => {
    expect(palierDistance(3501, false)).toBe("LONG");
  });

  it("reste MOYEN au-delà de 3500 km si le vol est intra (ex: DOM-TOM)", () => {
    expect(palierDistance(9350, true)).toBe("MOYEN");
  });

  it("expose le bon barème EUR", () => {
    expect(BAREME.EUR).toEqual({ COURT: 250, MOYEN: 400, LONG: 600 });
  });

  it("expose le bon barème GBP", () => {
    expect(BAREME.GBP).toEqual({ COURT: 220, MOYEN: 350, LONG: 520 });
  });
});
