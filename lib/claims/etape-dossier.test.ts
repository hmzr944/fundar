import { describe, expect, it } from "vitest";
import { etapeDuDossier } from "./etape-dossier";

const base = {
  statut_dossier: "SOUMIS",
  reclamation_envoyee_le: null,
  montant_recupere: null,
};

describe("etapeDuDossier", () => {
  it("place un dossier neuf à l'étape du justificatif", () => {
    // Un dossier n'existe pas sans justificatif : la deuxième étape est
    // franchie dès sa création.
    expect(etapeDuDossier(base)).toBe(1);
  });

  it("avance quand la réclamation est partie", () => {
    expect(
      etapeDuDossier({ ...base, reclamation_envoyee_le: "2026-03-01" })
    ).toBe(2);
  });

  it("va au bout quand l'argent est arrivé", () => {
    expect(
      etapeDuDossier({
        ...base,
        reclamation_envoyee_le: "2026-03-01",
        montant_recupere: 600,
      })
    ).toBe(3);
  });

  it("va au bout sur le statut PAYE même sans montant saisi", () => {
    expect(etapeDuDossier({ ...base, statut_dossier: "PAYE" })).toBe(3);
  });

  it("ne redescend pas quand un dossier payé n'a pas de date d'envoi", () => {
    // Cas des dossiers repris à la main : l'étape atteinte prime sur
    // l'ordre chronologique des champs.
    expect(
      etapeDuDossier({ ...base, statut_dossier: "PAYE", montant_recupere: 250 })
    ).toBe(3);
  });

  it("traite un montant nul comme un montant reçu", () => {
    // 0 est une valeur saisie, pas une absence : la compagnie a répondu.
    expect(etapeDuDossier({ ...base, montant_recupere: 0 })).toBe(3);
  });

  it("reste à la première étape sur un dossier refusé sans envoi", () => {
    expect(etapeDuDossier({ ...base, statut_dossier: "REFUSE" })).toBe(1);
  });
});
