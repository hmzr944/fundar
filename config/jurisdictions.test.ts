import { describe, expect, it } from "vitest";
import {
  dateLimiteReclamation,
  estPrescrit,
  joursAvantPrescription,
  resoudreJuridiction,
} from "./jurisdictions";

function jour(iso: string) {
  return new Date(`${iso}T00:00:00Z`);
}

describe("dateLimiteReclamation", () => {
  it("ajoute le délai à la date du vol dans le cas général", () => {
    // France : 5 ans à compter du vol.
    expect(dateLimiteReclamation("FR", jour("2026-03-11"))?.toISOString()).toContain(
      "2031-03-11"
    );
  });

  it("part de la fin de l'année civile en Allemagne", () => {
    // Un vol de janvier 2026 y reste réclamable jusqu'à fin 2029, soit près
    // d'un an de plus qu'un décompte naïf depuis la date du vol.
    const limite = dateLimiteReclamation("DE", jour("2026-01-05"));
    expect(limite?.getUTCFullYear()).toBe(2029);
    expect(limite?.getUTCMonth()).toBe(11);
    expect(limite?.getUTCDate()).toBe(31);
  });

  it("donne bien un an à la Belgique, le délai le plus court", () => {
    expect(dateLimiteReclamation("BE", jour("2026-03-11"))?.toISOString()).toContain(
      "2027-03-11"
    );
  });

  it("rend null sur une juridiction inconnue plutôt qu'une date inventée", () => {
    expect(dateLimiteReclamation(undefined, jour("2026-03-11"))).toBeNull();
  });
});

describe("estPrescrit", () => {
  it("laisse passer un dossier encore dans les délais", () => {
    expect(estPrescrit("BE", jour("2026-03-11"), jour("2027-03-10"))).toBe(false);
  });

  it("n'exclut pas le dernier jour", () => {
    expect(estPrescrit("BE", jour("2026-03-11"), jour("2027-03-11"))).toBe(false);
  });

  it("exclut le lendemain de l'échéance", () => {
    expect(estPrescrit("BE", jour("2026-03-11"), jour("2027-03-12"))).toBe(true);
  });

  it("ne prescrit jamais sur une juridiction inconnue", () => {
    // On ne peut pas affirmer un délai qu'on ne sait pas calculer : refuser
    // un dossier valable coûte plus cher que de le faire vérifier.
    expect(estPrescrit(undefined, jour("2000-01-01"), jour("2026-08-03"))).toBe(false);
  });
});

describe("joursAvantPrescription", () => {
  it("compte les jours restants", () => {
    expect(joursAvantPrescription("BE", jour("2026-03-11"), jour("2027-03-01"))).toBe(10);
  });

  it("devient négatif une fois le délai passé", () => {
    const restant = joursAvantPrescription("BE", jour("2026-03-11"), jour("2027-04-11"));
    expect(restant).toBeLessThan(0);
  });

  it("rend null sur une juridiction inconnue", () => {
    expect(joursAvantPrescription(undefined, jour("2026-03-11"), jour("2026-08-03"))).toBeNull();
  });
});

describe("resoudreJuridiction", () => {
  it("distingue l'Écosse du reste du Royaume-Uni", () => {
    // 5 ans en Écosse contre 6 en Angleterre et au pays de Galles.
    expect(resoudreJuridiction("GB", "EDI")).toBe("GB_SCOT");
    expect(resoudreJuridiction("GB", "LHR")).toBe("GB_ENG_WALES");
  });

  it("retombe sur l'Angleterre quand l'aéroport britannique est inconnu", () => {
    expect(resoudreJuridiction("GB")).toBe("GB_ENG_WALES");
  });

  it("rend undefined hors des juridictions couvertes", () => {
    expect(resoudreJuridiction("US", "JFK")).toBeUndefined();
  });
});
