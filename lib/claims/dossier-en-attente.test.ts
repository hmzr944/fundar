import { describe, expect, it } from "vitest";
import {
  DUREE_VALIDITE_MS,
  effacerDossier,
  enregistrerDossier,
  lireDossier,
  type DossierEnAttente,
} from "./dossier-en-attente";

/** Stockage en mémoire : le vrai localStorage n'existe pas sous Node. */
function stockageFactice(): Storage {
  const donnees = new Map<string, string>();
  return {
    get length() {
      return donnees.size;
    },
    clear: () => donnees.clear(),
    getItem: (c: string) => donnees.get(c) ?? null,
    key: (i: number) => Array.from(donnees.keys())[i] ?? null,
    removeItem: (c: string) => void donnees.delete(c),
    setItem: (c: string, v: string) => void donnees.set(c, v),
  };
}

const dossier: DossierEnAttente = {
  identite: {
    nom: "Durand",
    prenom: "Alex",
    adresse: "1 rue de la Paix, Paris",
    email: "alex@exemple.fr",
    iban: "FR7630006000011234567890189",
  },
  signatureDataUrl: "data:image/png;base64,AAAA",
  compagnons: [{ nom: "Durand", prenom: "Camille" }],
};

describe("dossier en attente de vérification email", () => {
  it("relit ce qui a été enregistré", () => {
    const s = stockageFactice();
    enregistrerDossier(s, dossier, 1000);
    expect(lireDossier(s, 1000)).toEqual(dossier);
  });

  it("survit à un nouvel onglet", () => {
    // Le lien de connexion s'ouvre dans un onglet neuf : c'est tout
    // l'intérêt de ne pas utiliser sessionStorage, qui serait vide et
    // ferait tout ressaisir — identité, signature et passagers compris.
    const s = stockageFactice();
    enregistrerDossier(s, dossier, 1000);
    const autreOnglet = lireDossier(s, 1000);
    expect(autreOnglet?.signatureDataUrl).toBe(dossier.signatureDataUrl);
    expect(autreOnglet?.compagnons).toHaveLength(1);
  });

  it("oublie un dossier trop ancien", () => {
    // Une signature et un IBAN ne restent pas indéfiniment sur la machine :
    // un poste partagé les exposerait au visiteur suivant.
    const s = stockageFactice();
    enregistrerDossier(s, dossier, 1000);
    expect(lireDossier(s, 1000 + DUREE_VALIDITE_MS + 1)).toBeNull();
  });

  it("efface le contenu périmé au lieu de le laisser traîner", () => {
    const s = stockageFactice();
    enregistrerDossier(s, dossier, 1000);
    lireDossier(s, 1000 + DUREE_VALIDITE_MS + 1);
    expect(s.length).toBe(0);
  });

  it("rend null quand il n'y a rien", () => {
    expect(lireDossier(stockageFactice(), 1000)).toBeNull();
  });

  it("rend null et nettoie sur un contenu illisible", () => {
    const s = stockageFactice();
    s.setItem("clearto:dossier-en-attente", "{ceci n'est pas du json");
    expect(lireDossier(s, 1000)).toBeNull();
    expect(s.length).toBe(0);
  });

  it("efface à la demande", () => {
    const s = stockageFactice();
    enregistrerDossier(s, dossier, 1000);
    effacerDossier(s);
    expect(lireDossier(s, 1000)).toBeNull();
  });

  it("ne relit pas un dossier sans signature", () => {
    // Un enregistrement tronqué ferait signer un mandat vide.
    const s = stockageFactice();
    s.setItem(
      "clearto:dossier-en-attente",
      JSON.stringify({ enregistreLe: 1000, identite: dossier.identite })
    );
    expect(lireDossier(s, 1000)).toBeNull();
  });
});
