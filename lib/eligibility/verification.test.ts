import { describe, expect, it } from "vitest";
import { ajusterSelonSource, codeCompagnieDepuisNumeroVol } from "./verification";
import { ResultatVerification } from "./types";

function resultat(
  partiel: Partial<ResultatVerification> = {}
): ResultatVerification {
  return {
    statut: "ELIGIBLE",
    montantEstime: 400,
    devise: "EUR",
    motif: "ELIGIBLE",
    explication: "Vous êtes éligible à une indemnisation estimée à 400 EUR.",
    ...partiel,
  };
}

describe("ajusterSelonSource", () => {
  it("laisse intact un verdict confirmé par l'API", () => {
    const initial = resultat();
    expect(ajusterSelonSource(initial, "AUTOMATIQUE")).toEqual(initial);
  });

  it("ne présente jamais un éligible déclaratif comme une certitude", () => {
    const ajuste = ajusterSelonSource(resultat(), "DECLARATIF");
    expect(ajuste.statut).toBe("REVIEW_MANUEL");
    expect(ajuste.motif).toBe("REVIEW_DECLARATIF_NON_VERIFIE");
  });

  it("conserve le montant, qui aide le passager à décider", () => {
    const ajuste = ajusterSelonSource(resultat(), "DECLARATIF");
    expect(ajuste.montantEstime).toBe(400);
    expect(ajuste.devise).toBe("EUR");
  });

  it("dit d'où vient l'estimation, sans effacer l'explication d'origine", () => {
    const ajuste = ajusterSelonSource(resultat(), "DECLARATIF");
    expect(ajuste.explication).toContain("estimée à 400 EUR");
    expect(ajuste.explication).toContain("vérifiera vos justificatifs");
  });

  it("laisse un refus être un refus", () => {
    // Transformer un INELIGIBLE en "à vérifier" ferait espérer pour rien.
    const refus = resultat({ statut: "INELIGIBLE", montantEstime: null });
    expect(ajusterSelonSource(refus, "DECLARATIF")).toEqual(refus);
  });

  it("ne touche ni à WAITLIST ni à un REVIEW déjà posé", () => {
    const attente = resultat({ statut: "WAITLIST" });
    expect(ajusterSelonSource(attente, "DECLARATIF")).toEqual(attente);

    const revue = resultat({ statut: "REVIEW_MANUEL", motif: "REVIEW_PREAVIS_INCONNU" });
    expect(ajusterSelonSource(revue, "DECLARATIF")).toEqual(revue);
  });
});

describe("codeCompagnieDepuisNumeroVol", () => {
  it("extrait un code à deux lettres", () => {
    expect(codeCompagnieDepuisNumeroVol("AF1380")).toBe("AF");
    expect(codeCompagnieDepuisNumeroVol("BA0117")).toBe("BA");
  });

  it("tolère espaces et minuscules", () => {
    expect(codeCompagnieDepuisNumeroVol(" af 1380 ")).toBe("AF");
  });

  it("gère un code alphanumérique", () => {
    expect(codeCompagnieDepuisNumeroVol("U21234")).toBe("U2");
    expect(codeCompagnieDepuisNumeroVol("W6789")).toBe("W6");
  });

  it("accepte un suffixe de lettre", () => {
    expect(codeCompagnieDepuisNumeroVol("LH400A")).toBe("LH");
  });

  it("rend null plutôt qu'un code inventé", () => {
    expect(codeCompagnieDepuisNumeroVol("")).toBeNull();
    expect(codeCompagnieDepuisNumeroVol("1380")).toBeNull();
    expect(codeCompagnieDepuisNumeroVol("bonjour")).toBeNull();
  });
});
