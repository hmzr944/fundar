import { describe, expect, it } from "vitest";
import { verifierEligibilite } from "./engine";
import { DemandeVerification } from "./types";

const base: DemandeVerification = {
  numeroVol: "AF1234",
  dateVol: "2026-01-15",
  aeroportDepart: "CDG",
  aeroportArrivee: "FRA",
  compagnie: "AF",
  typePerturbation: "RETARD",
  retardArriveeMinutes: 300,
  dateVerification: "2026-01-20",
};

describe("verifierEligibilite — étape 1 : champ d'application territorial", () => {
  it("est éligible au départ de l'UE quelle que soit la compagnie (test territorial, hors filtre trésorerie)", () => {
    const r = verifierEligibilite({
      ...base,
      aeroportDepart: "CDG",
      aeroportArrivee: "JFK",
      compagnie: "LH",
      retardArriveeMinutes: 300,
    });
    expect(r.statut).toBe("ELIGIBLE");
    expect(r.devise).toBe("EUR");
  });

  it("est hors champ à l'arrivée dans l'UE avec une compagnie non UE/UK", () => {
    const r = verifierEligibilite({
      ...base,
      aeroportDepart: "JFK",
      aeroportArrivee: "CDG",
      compagnie: "AA",
    });
    expect(r.statut).toBe("INELIGIBLE");
    expect(r.motif).toBe("INELIGIBLE_HORS_CHAMP");
  });

  it("est éligible à l'arrivée dans l'UE avec une compagnie immatriculée UE/UK", () => {
    const r = verifierEligibilite({
      ...base,
      aeroportDepart: "JFK",
      aeroportArrivee: "CDG",
      compagnie: "AF",
    });
    expect(r.statut).not.toBe("INELIGIBLE");
    expect(r.devise).toBe("EUR");
  });

  it("est hors champ si ni départ ni arrivée ne sont UE/EEE/Suisse/UK", () => {
    const r = verifierEligibilite({
      ...base,
      aeroportDepart: "JFK",
      aeroportArrivee: "LAX",
      compagnie: "AF",
    });
    expect(r.statut).toBe("INELIGIBLE");
    expect(r.motif).toBe("INELIGIBLE_HORS_CHAMP");
  });

  it("est éligible au départ du UK quelle que soit la compagnie (devise GBP)", () => {
    const r = verifierEligibilite({
      ...base,
      aeroportDepart: "LHR",
      aeroportArrivee: "JFK",
      compagnie: "BA",
      retardArriveeMinutes: 300,
    });
    expect(r.statut).toBe("ELIGIBLE");
    expect(r.devise).toBe("GBP");
  });

  it("est hors champ à l'arrivée au UK avec une compagnie non UE/UK", () => {
    const r = verifierEligibilite({
      ...base,
      aeroportDepart: "JFK",
      aeroportArrivee: "LHR",
      compagnie: "AA",
    });
    expect(r.statut).toBe("INELIGIBLE");
    expect(r.motif).toBe("INELIGIBLE_HORS_CHAMP");
  });

  it("traite une compagnie inconnue comme non immatriculée UE/UK", () => {
    const r = verifierEligibilite({
      ...base,
      aeroportDepart: "JFK",
      aeroportArrivee: "LAX",
      compagnie: "ZZ",
    });
    expect(r.statut).toBe("INELIGIBLE");
    expect(r.motif).toBe("INELIGIBLE_HORS_CHAMP");
  });

  it("renvoie une erreur explicite si un aéroport est inconnu", () => {
    const r = verifierEligibilite({ ...base, aeroportDepart: "ZZZ" });
    expect(r.statut).toBe("INELIGIBLE");
    expect(r.motif).toBe("DONNEES_AEROPORT_INCONNUES");
  });
});

describe("verifierEligibilite — étape 2 : type de perturbation et seuils", () => {
  it("refuse un retard de 2h59 (juste sous le seuil de 3h)", () => {
    const r = verifierEligibilite({ ...base, retardArriveeMinutes: 179 });
    expect(r.statut).toBe("INELIGIBLE");
    expect(r.motif).toBe("INELIGIBLE_SEUIL_NON_ATTEINT");
  });

  it("accepte un retard de pile 3h (180 minutes)", () => {
    const r = verifierEligibilite({ ...base, retardArriveeMinutes: 180 });
    expect(r.statut).toBe("ELIGIBLE");
  });

  it("refuse quand aucune perturbation éligible n'est constatée", () => {
    const r = verifierEligibilite({
      ...base,
      typePerturbation: "AUCUNE",
      retardArriveeMinutes: undefined,
    });
    expect(r.statut).toBe("INELIGIBLE");
    expect(r.motif).toBe("INELIGIBLE_SEUIL_NON_ATTEINT");
  });

  it("un refus d'embarquement est éligible sans condition de retard", () => {
    const r = verifierEligibilite({
      ...base,
      typePerturbation: "REFUS_EMBARQUEMENT",
      retardArriveeMinutes: undefined,
    });
    expect(r.statut).toBe("ELIGIBLE");
    expect(r.montantEstime).toBe(250);
  });
});

describe("verifierEligibilite — étape 3 : barème selon la distance", () => {
  it("applique le palier court (≤1500km) : CDG → FRA", () => {
    const r = verifierEligibilite({ ...base, aeroportDepart: "CDG", aeroportArrivee: "FRA" });
    expect(r.statut).toBe("ELIGIBLE");
    expect(r.montantEstime).toBe(250);
    expect(r.devise).toBe("EUR");
  });

  it("applique le palier moyen (1500-3500km, non intra) : CDG → IST", () => {
    const r = verifierEligibilite({ ...base, aeroportDepart: "CDG", aeroportArrivee: "IST" });
    expect(r.statut).toBe("ELIGIBLE");
    expect(r.montantEstime).toBe(400);
  });

  it("applique le palier long (>3500km, non intra) sans réduction si retard ≥4h : CDG → JFK", () => {
    const r = verifierEligibilite({
      ...base,
      aeroportDepart: "CDG",
      aeroportArrivee: "JFK",
      retardArriveeMinutes: 300,
    });
    expect(r.statut).toBe("ELIGIBLE");
    expect(r.montantEstime).toBe(600);
  });

  it("plafonne au palier moyen un vol intra-UE de plus de 3500km (DOM-TOM) : CDG → RUN", () => {
    const r = verifierEligibilite({ ...base, aeroportDepart: "CDG", aeroportArrivee: "RUN" });
    expect(r.statut).toBe("ELIGIBLE");
    expect(r.montantEstime).toBe(400);
  });

  it("réduit de 50% un long-courrier avec retard entre 3h et 4h : CDG → JFK, retard 3h59", () => {
    const r = verifierEligibilite({
      ...base,
      aeroportDepart: "CDG",
      aeroportArrivee: "JFK",
      retardArriveeMinutes: 239,
    });
    expect(r.statut).toBe("ELIGIBLE");
    expect(r.montantEstime).toBe(300);
  });

  it("n'applique pas la réduction à pile 4h de retard (240 minutes)", () => {
    const r = verifierEligibilite({
      ...base,
      aeroportDepart: "CDG",
      aeroportArrivee: "JFK",
      retardArriveeMinutes: 240,
    });
    expect(r.statut).toBe("ELIGIBLE");
    expect(r.montantEstime).toBe(600);
  });
});

describe("verifierEligibilite — étape 4 : fenêtre de préavis d'annulation", () => {
  const annulationBase: DemandeVerification = {
    ...base,
    typePerturbation: "ANNULATION",
    retardArriveeMinutes: undefined,
  };

  it("refuse si le préavis est de pile 14 jours", () => {
    const r = verifierEligibilite({ ...annulationBase, preavisAnnulationJours: 14 });
    expect(r.statut).toBe("INELIGIBLE");
    expect(r.motif).toBe("INELIGIBLE_PREAVIS");
  });

  it("refuse aussi au-delà de 14 jours (15 jours)", () => {
    const r = verifierEligibilite({ ...annulationBase, preavisAnnulationJours: 15 });
    expect(r.statut).toBe("INELIGIBLE");
    expect(r.motif).toBe("INELIGIBLE_PREAVIS");
  });

  it("accepte à 13 jours de préavis sans réacheminement compensatoire", () => {
    const r = verifierEligibilite({ ...annulationBase, preavisAnnulationJours: 13 });
    expect(r.statut).toBe("ELIGIBLE");
  });

  it("refuse entre 7 et 14 jours si le réacheminement respecte les seuils (≤2h avant / <4h après)", () => {
    const r = verifierEligibilite({
      ...annulationBase,
      preavisAnnulationJours: 10,
      reacheminement: { departAvantHeuresPrevues: 2, arriveeApresHeuresPrevues: 3 },
    });
    expect(r.statut).toBe("INELIGIBLE");
    expect(r.motif).toBe("INELIGIBLE_PREAVIS");
  });

  it("accepte entre 7 et 14 jours si le réacheminement dépasse les seuils", () => {
    const r = verifierEligibilite({
      ...annulationBase,
      preavisAnnulationJours: 10,
      reacheminement: { departAvantHeuresPrevues: 3, arriveeApresHeuresPrevues: 5 },
    });
    expect(r.statut).toBe("ELIGIBLE");
  });

  it("refuse sous 7 jours si le réacheminement respecte les seuils stricts (≤1h avant / <2h après)", () => {
    const r = verifierEligibilite({
      ...annulationBase,
      preavisAnnulationJours: 5,
      reacheminement: { departAvantHeuresPrevues: 1, arriveeApresHeuresPrevues: 1 },
    });
    expect(r.statut).toBe("INELIGIBLE");
    expect(r.motif).toBe("INELIGIBLE_PREAVIS");
  });

  it("accepte sous 7 jours si le réacheminement dépasse les seuils stricts", () => {
    const r = verifierEligibilite({
      ...annulationBase,
      preavisAnnulationJours: 5,
      reacheminement: { departAvantHeuresPrevues: 1.5, arriveeApresHeuresPrevues: 3 },
    });
    expect(r.statut).toBe("ELIGIBLE");
  });

  it("part en révision manuelle si le préavis d'annulation est inconnu", () => {
    const r = verifierEligibilite({ ...annulationBase, preavisAnnulationJours: undefined });
    expect(r.statut).toBe("REVIEW_MANUEL");
    expect(r.montantEstime).toBeNull();
  });
});

describe("verifierEligibilite — étape 5 : prescription", () => {
  it("refuse un dossier français au-delà de 5 ans", () => {
    const r = verifierEligibilite({
      ...base,
      aeroportDepart: "CDG",
      aeroportArrivee: "FRA",
      dateVol: "2018-01-01",
      dateVerification: "2025-01-02",
    });
    expect(r.statut).toBe("INELIGIBLE");
    expect(r.motif).toBe("INELIGIBLE_PRESCRIT");
  });

  it("distingue l'Écosse (5 ans) de l'Angleterre/Pays de Galles (6 ans)", () => {
    const commun = {
      ...base,
      aeroportArrivee: "JFK",
      compagnie: "BA",
      retardArriveeMinutes: 300,
      dateVol: "2020-01-01",
      dateVerification: "2025-06-01",
    };
    const ecosse = verifierEligibilite({ ...commun, aeroportDepart: "EDI" });
    const angleterre = verifierEligibilite({ ...commun, aeroportDepart: "LHR" });

    expect(ecosse.statut).toBe("INELIGIBLE");
    expect(ecosse.motif).toBe("INELIGIBLE_PRESCRIT");
    expect(angleterre.statut).toBe("ELIGIBLE");
  });

  it("décompte le délai allemand à partir de la fin de l'année civile du vol", () => {
    const r = verifierEligibilite({
      ...base,
      aeroportDepart: "FRA",
      aeroportArrivee: "CDG",
      compagnie: "LH",
      dateVol: "2021-01-05",
      dateVerification: "2024-06-01",
    });
    expect(r.statut).toBe("ELIGIBLE");
  });

  it("applique la prescription allemande une fois le délai de 3 ans (fin d'année civile) dépassé", () => {
    const r = verifierEligibilite({
      ...base,
      aeroportDepart: "FRA",
      aeroportArrivee: "CDG",
      compagnie: "LH",
      dateVol: "2021-01-05",
      dateVerification: "2025-01-05",
    });
    expect(r.statut).toBe("INELIGIBLE");
    expect(r.motif).toBe("INELIGIBLE_PRESCRIT");
  });
});

describe("verifierEligibilite — étape 6 : circonstances extraordinaires et trésorerie", () => {
  it("part en révision manuelle sur un motif de circonstance extraordinaire (grève ATC)", () => {
    const r = verifierEligibilite({ ...base, motifDeclare: "grève des contrôleurs aériens (ATC)" });
    expect(r.statut).toBe("REVIEW_MANUEL");
    expect(r.motif).toBe("REVIEW_CIRCONSTANCE_EXTRAORDINAIRE");
    expect(r.montantEstime).toBeNull();
  });

  it("ne considère pas une grève du personnel de la compagnie comme extraordinaire", () => {
    const r = verifierEligibilite({ ...base, motifDeclare: "grève du personnel navigant de la compagnie" });
    expect(r.statut).toBe("ELIGIBLE");
  });

  it("ne considère pas un problème technique appareil comme extraordinaire", () => {
    const r = verifierEligibilite({ ...base, motifDeclare: "problème technique avion" });
    expect(r.statut).toBe("ELIGIBLE");
  });

  it("met en liste d'attente une compagnie au paiement lent (Ryanair)", () => {
    const r = verifierEligibilite({ ...base, compagnie: "FR", numeroVol: "FR1234" });
    expect(r.statut).toBe("WAITLIST");
    expect(r.motif).toBe("WAITLIST_COMPAGNIE");
    expect(r.montantEstime).toBeNull();
  });

  it("refuse une compagnie hors périmètre même si le vol part de l'UE", () => {
    const r = verifierEligibilite({ ...base, compagnie: "AA" });
    expect(r.statut).toBe("INELIGIBLE");
    expect(r.motif).toBe("INELIGIBLE_COMPAGNIE_HORS_PERIMETRE");
  });
});
