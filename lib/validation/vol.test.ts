import { describe, expect, it } from "vitest";
import {
  normaliserNumeroVol,
  validerDateVol,
  validerNumeroVol,
} from "./vol";

const AUJOURDHUI = new Date("2026-08-03T12:00:00Z");

describe("validerNumeroVol", () => {
  it("accepte les formes courantes", () => {
    for (const v of ["AF1380", "BA117", "U21234", "W6789", "LH400A", "TAP123"]) {
      expect(validerNumeroVol(v).valide, v).toBe(true);
    }
  });

  it("tolère espaces et minuscules, comme sur une carte d'embarquement", () => {
    expect(validerNumeroVol(" af 1380 ").valide).toBe(true);
    expect(normaliserNumeroVol(" af 1380 ")).toBe("AF1380");
  });

  it("refuse une injection déguisée en numéro de vol", () => {
    // Avant ce contrôle, cette valeur produisait un verdict à 250 EUR et
    // se serait retrouvée dans le mandat signé puis dans la lettre à la
    // compagnie.
    expect(validerNumeroVol("<script>alert(1)</script>").valide).toBe(false);
  });

  it("refuse ce qui n'est pas un numéro de vol", () => {
    for (const v of ["", "   ", "AF", "1380", "AAAA1380", "AF12345", "AF-1380"]) {
      expect(validerNumeroVol(v).valide, v).toBe(false);
    }
  });

  it("explique où trouver l'information plutôt que de dire « invalide »", () => {
    expect(validerNumeroVol("bonjour").message).toContain("carte d'embarquement");
  });
});

describe("validerDateVol", () => {
  it("accepte une date passée plausible", () => {
    expect(validerDateVol("2026-06-05", AUJOURDHUI).valide).toBe(true);
    expect(validerDateVol("2022-05-14", AUJOURDHUI).valide).toBe(true);
  });

  it("accepte le jour même", () => {
    expect(validerDateVol("2026-08-03", AUJOURDHUI).valide).toBe(true);
  });

  it("refuse un vol qui n'a pas encore eu lieu", () => {
    // Un vol futur ne peut pas avoir été retardé. Le fournisseur rendait
    // pourtant un verdict chiffré pour 2099.
    const r = validerDateVol("2026-08-04", AUJOURDHUI);
    expect(r.valide).toBe(false);
    expect(r.message).toContain("pas encore eu lieu");
    expect(validerDateVol("2099-01-01", AUJOURDHUI).valide).toBe(false);
  });

  it("refuse un vol antérieur au règlement", () => {
    // Un vol de 1990 renvoyait « éligible, 600 EUR ».
    expect(validerDateVol("1990-01-01", AUJOURDHUI).valide).toBe(false);
    expect(validerDateVol("2005-02-16", AUJOURDHUI).valide).toBe(false);
    expect(validerDateVol("2005-02-17", AUJOURDHUI).valide).toBe(true);
  });

  it("refuse une date illisible", () => {
    for (const v of ["", "pas-une-date", "05/06/2026", "2026-6-5"]) {
      expect(validerDateVol(v, AUJOURDHUI).valide, v).toBe(false);
    }
  });

  it("refuse un jour qui n'existe pas dans le mois", () => {
    // Sans ce contrôle, Date reporte silencieusement au 3 mars.
    expect(validerDateVol("2026-02-31", AUJOURDHUI).valide).toBe(false);
    expect(validerDateVol("2026-13-01", AUJOURDHUI).valide).toBe(false);
  });

  it("accepte le 29 février d'une année bissextile", () => {
    expect(validerDateVol("2024-02-29", AUJOURDHUI).valide).toBe(true);
  });
});
