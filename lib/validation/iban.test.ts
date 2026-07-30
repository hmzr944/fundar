import { describe, expect, it } from "vitest";
import { formaterIban, normaliserIban, validerIban } from "./iban";

describe("validerIban", () => {
  it("accepte un IBAN français valide", () => {
    expect(validerIban("FR1420041010050500013M02606").valide).toBe(true);
  });

  it("accepte un IBAN allemand valide", () => {
    expect(validerIban("DE89370400440532013000").valide).toBe(true);
  });

  it("accepte un IBAN britannique valide", () => {
    expect(validerIban("GB82WEST12345698765432").valide).toBe(true);
  });

  it("accepte un IBAN belge valide", () => {
    expect(validerIban("BE68539007547034").valide).toBe(true);
  });

  it("tolère les espaces de saisie", () => {
    const r = validerIban("FR14 2004 1010 0505 0001 3M02 606");
    expect(r.valide).toBe(true);
    expect(r.normalise).toBe("FR1420041010050500013M02606");
  });

  it("tolère les minuscules", () => {
    expect(validerIban("de89370400440532013000").valide).toBe(true);
  });

  it("rejette une saisie vide", () => {
    const r = validerIban("");
    expect(r.valide).toBe(false);
    expect(r.erreur).toBe("VIDE");
  });

  it("rejette null et undefined sans lever d'exception", () => {
    expect(validerIban(null).valide).toBe(false);
    expect(validerIban(undefined).valide).toBe(false);
  });

  it("rejette un format qui ne commence pas par deux lettres puis deux chiffres", () => {
    const r = validerIban("1234567890123456");
    expect(r.valide).toBe(false);
    expect(r.erreur).toBe("FORMAT");
  });

  it("rejette un code pays inexistant", () => {
    const r = validerIban("ZZ8937040044053201");
    expect(r.valide).toBe(false);
    expect(r.erreur).toBe("PAYS_INCONNU");
  });

  it("rejette une longueur incorrecte pour le pays", () => {
    // Un IBAN français fait 27 caractères, pas 20.
    const r = validerIban("FR142004101005050001");
    expect(r.valide).toBe(false);
    expect(r.erreur).toBe("LONGUEUR");
  });

  it("détecte un chiffre modifié (le cas réel : la faute de frappe)", () => {
    // Dernier chiffre changé sur un IBAN par ailleurs valide.
    const r = validerIban("DE89370400440532013001");
    expect(r.valide).toBe(false);
    expect(r.erreur).toBe("CLE_INVALIDE");
  });

  it("détecte une inversion de deux chiffres", () => {
    // 0532013000 -> 0532013 0 0 0 avec deux chiffres permutés.
    const r = validerIban("DE89370400440532010300");
    expect(r.valide).toBe(false);
    expect(r.erreur).toBe("CLE_INVALIDE");
  });

  it("fournit un message lisible pour chaque refus", () => {
    for (const mauvais of ["", "1234", "ZZ8937040044053201", "FR142004101005050001", "DE89370400440532013001"]) {
      const r = validerIban(mauvais);
      expect(r.valide).toBe(false);
      expect(r.message).toBeTruthy();
    }
  });
});

describe("normaliserIban", () => {
  it("retire espaces, points et tirets", () => {
    expect(normaliserIban("fr14-2004.1010 0505 0001 3M02 606")).toBe(
      "FR1420041010050500013M02606"
    );
  });
});

describe("formaterIban", () => {
  it("regroupe par blocs de quatre", () => {
    expect(formaterIban("DE89370400440532013000")).toBe(
      "DE89 3704 0044 0532 0130 00"
    );
  });
});
