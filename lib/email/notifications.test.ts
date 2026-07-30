import { describe, expect, it } from "vitest";
import { composerNotification } from "./notifications";

const VOL = { numeroVol: "AF1380" };

describe("composerNotification", () => {
  it("annonce la transmission sans promettre de délai précis", () => {
    const n = composerNotification("STATUT_EN_COURS", VOL);
    expect(n).not.toBeNull();
    expect(n!.sujet).toContain("AF1380");
    expect(n!.texte).toContain("aucune démarche");
    // Ne doit pas annoncer un délai ferme qu'on ne maîtrise pas.
    expect(n!.texte).not.toMatch(/sous \d+ jours/);
  });

  it("indique le montant et la commission quand le dossier est payé", () => {
    const n = composerNotification("STATUT_PAYE", {
      ...VOL,
      montantRecupere: 600,
      devise: "EUR",
      commissionDue: 132,
    });
    expect(n!.texte).toContain("600 EUR");
    expect(n!.texte).toContain("132 EUR");
    expect(n!.texte).toContain("14 jours");
  });

  it("reste correct si le montant payé n'a pas encore été saisi", () => {
    const n = composerNotification("STATUT_PAYE", VOL);
    expect(n).not.toBeNull();
    // Pas de "undefined" ni de montant vide dans un email client.
    expect(n!.texte).not.toContain("undefined");
    expect(n!.texte).not.toContain("null");
  });

  it("dit explicitement que le client ne doit rien en cas de refus", () => {
    const n = composerNotification("STATUT_REFUSE", VOL);
    expect(n!.texte).toContain("ne nous devez rien");
    // Ne doit pas laisser croire que tout recours est fermé.
    expect(n!.texte).toContain("autorité nationale");
  });

  it("n'envoie pas d'email pour un retour à l'état initial", () => {
    expect(composerNotification("STATUT_SOUMIS", VOL)).toBeNull();
  });

  it("ignore un type de notification inconnu au lieu d'envoyer un email vide", () => {
    expect(composerNotification("STATUT_INEXISTANT", VOL)).toBeNull();
    expect(composerNotification("", VOL)).toBeNull();
  });

  it("n'emploie jamais le vocabulaire juridique interdit", () => {
    const interdits = /avocat|robot lawyer|IA juridique|garantie de gain/i;
    for (const type of ["STATUT_EN_COURS", "STATUT_PAYE", "STATUT_REFUSE"]) {
      const n = composerNotification(type, {
        ...VOL,
        montantRecupere: 250,
        devise: "EUR",
        commissionDue: 55,
      });
      expect(n!.sujet).not.toMatch(interdits);
      expect(n!.texte).not.toMatch(interdits);
    }
  });
});
