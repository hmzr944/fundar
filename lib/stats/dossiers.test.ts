import { describe, expect, it } from "vitest";
import {
  EFFECTIF_MIN_POUR_PUBLIER,
  estRefusDIndemnisation,
  joursEntre,
  mediane,
  statistiquesGlobales,
  statistiquesParCompagnie,
  type DossierMesure,
} from "./dossiers";

function dossier(partiel: Partial<DossierMesure> = {}): DossierMesure {
  return {
    compagnie: "FR",
    reclamationEnvoyeeLe: "2026-01-01",
    premiereReponseLe: null,
    premiereReponseNature: null,
    recupereLe: null,
    montantRecupere: null,
    ...partiel,
  };
}

describe("joursEntre", () => {
  it("compte les jours entiers entre deux dates", () => {
    expect(joursEntre("2026-01-01", "2026-01-31")).toBe(30);
  });

  it("rend null si une date manque", () => {
    expect(joursEntre(null, "2026-01-31")).toBeNull();
    expect(joursEntre("2026-01-01", null)).toBeNull();
  });

  it("rend null sur une date illisible plutôt qu'un NaN", () => {
    expect(joursEntre("pas-une-date", "2026-01-31")).toBeNull();
  });

  it("reste juste malgré un changement d'heure d'été", () => {
    // 29 mars 2026 : passage à l'heure d'été en Europe. Un calcul naïf
    // en heures locales renverrait 30,96 jours puis 30 après troncature.
    expect(joursEntre("2026-03-15", "2026-04-15")).toBe(31);
  });
});

describe("mediane", () => {
  it("prend la valeur centrale sur un effectif impair", () => {
    expect(mediane([10, 90, 20])).toBe(20);
  });

  it("moyenne les deux valeurs centrales sur un effectif pair", () => {
    expect(mediane([10, 20, 30, 40])).toBe(25);
  });

  it("rend null sur une liste vide", () => {
    expect(mediane([])).toBeNull();
  });

  it("resiste a un dossier aberrant, contrairement a une moyenne", () => {
    // Moyenne = 106 jours, mediane = 20. C'est la raison d'etre du choix.
    expect(mediane([15, 20, 25, 365])).toBe(23);
  });
});

describe("estRefusDIndemnisation", () => {
  it("compte un bon d'achat comme un refus", () => {
    expect(estRefusDIndemnisation("BON_ACHAT")).toBe(true);
  });

  it("compte un refus comme un refus", () => {
    expect(estRefusDIndemnisation("REFUS")).toBe(true);
  });

  it("ne compte pas un accusé de réception comme un refus", () => {
    expect(estRefusDIndemnisation("ACCUSE_RECEPTION")).toBe(false);
    expect(estRefusDIndemnisation("PAIEMENT_ANNONCE")).toBe(false);
    expect(estRefusDIndemnisation(null)).toBe(false);
  });
});

describe("statistiquesParCompagnie", () => {
  it("ignore les dossiers jamais transmis", () => {
    const stats = statistiquesParCompagnie([
      dossier({ reclamationEnvoyeeLe: null }),
      dossier({ reclamationEnvoyeeLe: "2026-01-01" }),
    ]);
    expect(stats).toHaveLength(1);
    expect(stats[0].effectif).toBe(1);
  });

  it("calcule le taux de refus sur les dossiers ayant répondu, pas sur tous", () => {
    // Trois transmis, deux réponses dont un refus : 50 %, pas 33 %.
    // Un dossier sans réponse n'est pas une réponse positive.
    const stats = statistiquesParCompagnie([
      dossier({ premiereReponseNature: "REFUS", premiereReponseLe: "2026-02-01" }),
      dossier({ premiereReponseNature: "PAIEMENT_ANNONCE", premiereReponseLe: "2026-02-01" }),
      dossier(),
    ]);
    expect(stats[0].tauxRefusPremiereReponse).toBe(0.5);
    expect(stats[0].nombreReponses).toBe(2);
    expect(stats[0].effectif).toBe(3);
  });

  it("rend null plutôt que zéro quand aucune réponse n'est encore arrivée", () => {
    const stats = statistiquesParCompagnie([dossier(), dossier()]);
    expect(stats[0].tauxRefusPremiereReponse).toBeNull();
    expect(stats[0].delaiMedianPremiereReponse).toBeNull();
  });

  it("ne déclare publiable qu'au-delà de l'effectif minimum", () => {
    const neuf = Array.from({ length: EFFECTIF_MIN_POUR_PUBLIER - 1 }, () =>
      dossier()
    );
    expect(statistiquesParCompagnie(neuf)[0].publiable).toBe(false);

    const dix = Array.from({ length: EFFECTIF_MIN_POUR_PUBLIER }, () => dossier());
    expect(statistiquesParCompagnie(dix)[0].publiable).toBe(true);
  });

  it("regroupe les codes compagnie sans tenir compte de la casse", () => {
    const stats = statistiquesParCompagnie([
      dossier({ compagnie: "fr" }),
      dossier({ compagnie: "FR" }),
    ]);
    expect(stats).toHaveLength(1);
    expect(stats[0].compagnie).toBe("FR");
  });

  it("classe les compagnies les mieux documentées en premier", () => {
    const stats = statistiquesParCompagnie([
      dossier({ compagnie: "AF" }),
      dossier({ compagnie: "FR" }),
      dossier({ compagnie: "FR" }),
    ]);
    expect(stats.map((s) => s.compagnie)).toEqual(["FR", "AF"]);
  });

  it("mesure le délai de paiement depuis l'envoi, pas depuis la réponse", () => {
    const stats = statistiquesParCompagnie([
      dossier({
        reclamationEnvoyeeLe: "2026-01-01",
        premiereReponseLe: "2026-02-01",
        premiereReponseNature: "PAIEMENT_ANNONCE",
        recupereLe: "2026-04-01",
        montantRecupere: 600,
      }),
    ]);
    expect(stats[0].delaiMedianPremiereReponse).toBe(31);
    expect(stats[0].delaiMedianPaiement).toBe(90);
  });
});

describe("statistiquesGlobales", () => {
  it("ne compte que les dossiers réellement transmis", () => {
    const stats = statistiquesGlobales(
      [dossier({ reclamationEnvoyeeLe: null }), dossier()],
      0.22
    );
    expect(stats.dossiersTransmis).toBe(1);
  });

  it("calcule la commission sur le montant réellement récupéré", () => {
    const stats = statistiquesGlobales(
      [
        dossier({ recupereLe: "2026-03-01", montantRecupere: 600 }),
        dossier({ recupereLe: "2026-03-01", montantRecupere: 250 }),
        // Non payé : ne doit rien ajouter, même avec un montant estimé.
        dossier({ montantRecupere: 400 }),
      ],
      0.22
    );
    expect(stats.montantTotalRecupere).toBe(850);
    expect(stats.commissionTotale).toBe(187);
    expect(stats.payes).toBe(2);
  });

  it("compte comme en attente les dossiers transmis sans réponse", () => {
    const stats = statistiquesGlobales(
      [
        dossier(),
        dossier({ premiereReponseNature: "REFUS", premiereReponseLe: "2026-02-01" }),
      ],
      0.22
    );
    expect(stats.enAttenteDeReponse).toBe(1);
    expect(stats.refusesEnPremiereReponse).toBe(1);
  });
});
