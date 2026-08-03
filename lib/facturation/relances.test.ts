import { describe, expect, it } from "vitest";
import {
  dossiersARelancer,
  joursDepuisEnvoi,
  JALONS_RELANCE,
  type DossierRelancable,
} from "./relances";

const AUJOURDHUI = new Date("2026-08-03T12:00:00Z");

function dossier(partiel: Partial<DossierRelancable> = {}): DossierRelancable {
  return {
    id: "d1",
    // 60 jours avant la date de référence.
    reclamationEnvoyeeLe: "2026-06-04",
    recupereLe: null,
    paiementDeclareLe: null,
    statutDossier: "EN_COURS",
    derniereRelancePaiementLe: null,
    nombreRelancesPaiement: 0,
    ...partiel,
  };
}

describe("dossiersARelancer", () => {
  it("relance un dossier transmis depuis plus de 30 jours", () => {
    expect(dossiersARelancer([dossier()], AUJOURDHUI)).toHaveLength(1);
  });

  it("ne relance pas avant le premier jalon", () => {
    const recent = dossier({ reclamationEnvoyeeLe: "2026-07-20" });
    expect(dossiersARelancer([recent], AUJOURDHUI)).toHaveLength(0);
  });

  it("ne relance jamais un dossier jamais transmis", () => {
    // Relancer sur une réclamation qu'on n'a pas envoyée serait mentir.
    const jamaisEnvoye = dossier({ reclamationEnvoyeeLe: null });
    expect(dossiersARelancer([jamaisEnvoye], AUJOURDHUI)).toHaveLength(0);
  });

  it("s'arrête dès que le client a déclaré un paiement", () => {
    const declare = dossier({ paiementDeclareLe: "2026-07-01" });
    expect(dossiersARelancer([declare], AUJOURDHUI)).toHaveLength(0);
  });

  it("s'arrête dès que le dossier est clos", () => {
    expect(dossiersARelancer([dossier({ statutDossier: "PAYE" })], AUJOURDHUI)).toHaveLength(0);
    expect(dossiersARelancer([dossier({ statutDossier: "REFUSE" })], AUJOURDHUI)).toHaveLength(0);
    expect(dossiersARelancer([dossier({ recupereLe: "2026-07-15" })], AUJOURDHUI)).toHaveLength(0);
  });

  it("respecte l'écart minimum entre deux relances", () => {
    const relanceHier = dossier({
      nombreRelancesPaiement: 1,
      derniereRelancePaiementLe: "2026-08-01",
    });
    expect(dossiersARelancer([relanceHier], AUJOURDHUI)).toHaveLength(0);
  });

  it("relance à nouveau une fois l'écart écoulé et le jalon atteint", () => {
    const pret = dossier({
      reclamationEnvoyeeLe: "2026-06-01",
      nombreRelancesPaiement: 1,
      derniereRelancePaiementLe: "2026-07-05",
    });
    expect(dossiersARelancer([pret], AUJOURDHUI)).toHaveLength(1);
  });

  it("cesse définitivement après le dernier jalon", () => {
    // Au-delà, insister n'apporte plus rien et abîme la relation.
    const epuise = dossier({
      reclamationEnvoyeeLe: "2024-01-01",
      nombreRelancesPaiement: JALONS_RELANCE.length,
      derniereRelancePaiementLe: "2025-01-01",
    });
    expect(dossiersARelancer([epuise], AUJOURDHUI)).toHaveLength(0);
  });

  it("ne relance pas au deuxième jalon tant qu'il n'est pas atteint", () => {
    // 40 jours d'envoi, une relance déjà passée : le jalon suivant est à 60.
    const entreDeux = dossier({
      reclamationEnvoyeeLe: "2026-06-24",
      nombreRelancesPaiement: 1,
      derniereRelancePaiementLe: "2026-07-01",
    });
    expect(dossiersARelancer([entreDeux], AUJOURDHUI)).toHaveLength(0);
  });

  it("ignore une date illisible plutôt que de relancer à tort", () => {
    const casse = dossier({ reclamationEnvoyeeLe: "pas-une-date" });
    expect(dossiersARelancer([casse], AUJOURDHUI)).toHaveLength(0);
  });
});

describe("joursDepuisEnvoi", () => {
  it("compte les jours depuis la transmission", () => {
    expect(joursDepuisEnvoi(dossier(), AUJOURDHUI)).toBe(60);
  });

  it("rend zéro plutôt qu'un négatif sur un dossier non transmis", () => {
    expect(joursDepuisEnvoi(dossier({ reclamationEnvoyeeLe: null }), AUJOURDHUI)).toBe(0);
  });
});
