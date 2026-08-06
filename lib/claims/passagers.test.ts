import { describe, expect, it } from "vitest";
import { MAX_PASSAGERS, montantTotal, validerPassagers } from "./passagers";

describe("montantTotal", () => {
  it("multiplie le montant unitaire par le nombre de passagers", () => {
    expect(montantTotal(600, 4)).toBe(2400);
  });

  it("rend null quand il n'y a pas de montant unitaire", () => {
    // Un dossier en revue manuelle n'a pas de montant : le multiplier
    // afficherait « 0 € » au lieu de « nous ne savons pas encore ».
    expect(montantTotal(null, 4)).toBeNull();
  });

  it("traite un nombre absurde comme un seul passager", () => {
    expect(montantTotal(600, 0)).toBe(600);
    expect(montantTotal(600, -3)).toBe(600);
    expect(montantTotal(600, Number.NaN)).toBe(600);
  });

  it("ignore une fraction de passager", () => {
    expect(montantTotal(250, 2.9)).toBe(500);
  });
});

describe("validerPassagers", () => {
  const p = (nom: string, prenom = "Alex") => ({ nom, prenom });

  it("accepte un passager unique", () => {
    expect(validerPassagers([p("Durand")]).valide).toBe(true);
  });

  it("accepte le nombre maximum", () => {
    const pleine = Array.from({ length: MAX_PASSAGERS }, (_, i) => p(`Nom${i}`));
    expect(validerPassagers(pleine).valide).toBe(true);
  });

  it("refuse une liste vide", () => {
    expect(validerPassagers([]).valide).toBe(false);
  });

  it("refuse au-delà du plafond", () => {
    // Au-delà de neuf, la compagnie exige une procédure de groupe et
    // rejette le dossier tel quel.
    const trop = Array.from({ length: MAX_PASSAGERS + 1 }, (_, i) => p(`Nom${i}`));
    const r = validerPassagers(trop);
    expect(r.valide).toBe(false);
    expect(r.message).toContain("groupe");
  });

  it("refuse un nom vide ou fait d'espaces", () => {
    expect(validerPassagers([{ nom: "  ", prenom: "Alex" }]).valide).toBe(false);
    expect(validerPassagers([{ nom: "Durand", prenom: "" }]).valide).toBe(false);
  });

  it("refuse deux fois le même passager", () => {
    expect(validerPassagers([p("Durand"), p("Durand")]).valide).toBe(false);
  });

  it("ignore la casse et les espaces pour détecter un doublon", () => {
    const liste = [
      { nom: "Durand", prenom: "Alex" },
      { nom: " durand ", prenom: "ALEX" },
    ];
    const r = validerPassagers(liste);
    expect(r.valide).toBe(false);
    expect(r.message).toContain("deux fois");
  });

  it("laisse passer deux homonymes de prénoms différents", () => {
    // Deux frères sur le même vol : c'est le cas normal d'une famille.
    const liste = [
      { nom: "Durand", prenom: "Alex" },
      { nom: "Durand", prenom: "Camille" },
    ];
    expect(validerPassagers(liste).valide).toBe(true);
  });
});
