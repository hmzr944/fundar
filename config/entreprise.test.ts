import { describe, expect, it } from "vitest";
import { identiteIncomplete } from "./entreprise";

describe("identiteIncomplete", () => {
  it("signale les mentions manquantes tant que rien n'est renseigné", () => {
    // Aucune variable d'environnement n'est définie dans les tests : c'est
    // exactement l'état d'un déploiement fraîchement créé, et le cas où une
    // facture ne doit surtout pas être émise.
    const manquants = identiteIncomplete();
    expect(manquants).toContain("raison sociale");
    expect(manquants).toContain("SIREN");
    expect(manquants).toContain("adresse du siège");
    expect(manquants).toContain("forme juridique");
  });

  it("bloque donc l'émission par défaut", () => {
    // Une facture sans SIREN ni raison sociale n'est pas opposable : le
    // client peut légitimement refuser de la régler, ce qui est précisément
    // le risque que toute cette chaîne cherche à couvrir.
    expect(identiteIncomplete().length).toBeGreaterThan(0);
  });
});
