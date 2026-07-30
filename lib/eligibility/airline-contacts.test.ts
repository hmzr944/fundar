import { describe, expect, it } from "vitest";
import {
  CONTACTS_COMPAGNIES,
  resoudreContactCompagnie,
} from "@/config/airline-contacts";

/**
 * Ces tests protègent la règle la plus importante du chemin critique :
 * on ne doit JAMAIS considérer une réclamation comme envoyable si l'on n'a
 * pas une vraie adresse email de compagnie. Sinon le dossier passe en
 * "En cours" et le client attend un virement qui ne viendra jamais.
 */
describe("resoudreContactCompagnie", () => {
  it("refuse l'envoi pour une compagnie non configurée", () => {
    const r = resoudreContactCompagnie("AF");
    expect(r.envoyable).toBe(false);
    expect(r.raison).toBe("CONTACT_NON_CONFIGURE");
  });

  it("refuse l'envoi pour une compagnie totalement inconnue", () => {
    const r = resoudreContactCompagnie("ZZ");
    expect(r.envoyable).toBe(false);
    expect(r.raison).toBe("CONTACT_NON_CONFIGURE");
  });

  it("est insensible à la casse du code compagnie", () => {
    CONTACTS_COMPAGNIES.XX = {
      mode: "EMAIL",
      email: "claims@exemple-compagnie.test",
      langue: "en",
    };
    expect(resoudreContactCompagnie("xx").envoyable).toBe(true);
    delete CONTACTS_COMPAGNIES.XX;
  });

  it("autorise l'envoi quand un email valide est configuré", () => {
    CONTACTS_COMPAGNIES.XX = {
      mode: "EMAIL",
      email: "claims@exemple-compagnie.test",
      langue: "en",
    };
    const r = resoudreContactCompagnie("XX");
    expect(r.envoyable).toBe(true);
    expect(r.contact?.email).toBe("claims@exemple-compagnie.test");
    delete CONTACTS_COMPAGNIES.XX;
  });

  it("refuse l'envoi automatique si la compagnie n'accepte qu'un formulaire web", () => {
    CONTACTS_COMPAGNIES.XX = {
      mode: "FORMULAIRE_WEB",
      urlFormulaire: "https://exemple-compagnie.test/claims",
      langue: "en",
    };
    const r = resoudreContactCompagnie("XX");
    expect(r.envoyable).toBe(false);
    expect(r.raison).toBe("ENVOI_MANUEL_REQUIS");
    // L'URL reste exposée pour permettre l'envoi manuel.
    expect(r.contact?.urlFormulaire).toContain("https://");
    delete CONTACTS_COMPAGNIES.XX;
  });

  it("refuse l'envoi automatique pour un envoi postal", () => {
    CONTACTS_COMPAGNIES.XX = {
      mode: "COURRIER",
      adressePostale: "Service réclamations, exemple",
      langue: "fr",
    };
    const r = resoudreContactCompagnie("XX");
    expect(r.envoyable).toBe(false);
    expect(r.raison).toBe("ENVOI_MANUEL_REQUIS");
    delete CONTACTS_COMPAGNIES.XX;
  });

  it("refuse l'envoi si le mode est EMAIL mais l'adresse manquante", () => {
    CONTACTS_COMPAGNIES.XX = { mode: "EMAIL", langue: "en" };
    const r = resoudreContactCompagnie("XX");
    expect(r.envoyable).toBe(false);
    expect(r.raison).toBe("CONTACT_INCOMPLET");
    delete CONTACTS_COMPAGNIES.XX;
  });

  it("refuse l'envoi si l'adresse configurée n'est pas un email", () => {
    CONTACTS_COMPAGNIES.XX = {
      mode: "EMAIL",
      email: "pas-une-adresse",
      langue: "en",
    };
    const r = resoudreContactCompagnie("XX");
    expect(r.envoyable).toBe(false);
    expect(r.raison).toBe("CONTACT_INCOMPLET");
    delete CONTACTS_COMPAGNIES.XX;
  });

  it("le registre est livré vide : aucun envoi possible avant configuration", () => {
    expect(Object.keys(CONTACTS_COMPAGNIES)).toHaveLength(0);
  });
});
