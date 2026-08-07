import { describe, expect, it } from "vitest";
import {
  destinataireEnregistrable,
  validerDateEnvoi,
} from "./envoi-manuel";

const CREE_LE = "2026-03-01T10:00:00Z";
const MAINTENANT = new Date("2026-03-10T12:00:00Z");

describe("validerDateEnvoi", () => {
  it("accepte le jour même", () => {
    expect(
      validerDateEnvoi({ envoyeLe: "2026-03-10", creeLe: CREE_LE, maintenant: MAINTENANT })
        .valide
    ).toBe(true);
  });

  it("accepte une date entre la création et aujourd'hui", () => {
    expect(
      validerDateEnvoi({ envoyeLe: "2026-03-05", creeLe: CREE_LE, maintenant: MAINTENANT })
        .valide
    ).toBe(true);
  });

  it("refuse une date future", () => {
    // Une date d'envoi future avancerait le calendrier des relances et
    // ferait écrire à la compagnie avant même qu'elle ait reçu le dossier.
    const r = validerDateEnvoi({
      envoyeLe: "2026-03-20",
      creeLe: CREE_LE,
      maintenant: MAINTENANT,
    });
    expect(r.valide).toBe(false);
    expect(r.message).toContain("à venir");
  });

  it("refuse une date antérieure au dossier", () => {
    // On ne transmet pas une réclamation avant que le mandat existe :
    // c'est une saisie fautive, et elle fausserait les délais mesurés
    // par compagnie, qui sont la seule preuve publiable du service.
    const r = validerDateEnvoi({
      envoyeLe: "2026-02-20",
      creeLe: CREE_LE,
      maintenant: MAINTENANT,
    });
    expect(r.valide).toBe(false);
    expect(r.message).toContain("avant");
  });

  it("refuse une date illisible", () => {
    expect(
      validerDateEnvoi({ envoyeLe: "hier", creeLe: CREE_LE, maintenant: MAINTENANT })
        .valide
    ).toBe(false);
  });

  it("refuse une date absente", () => {
    expect(
      validerDateEnvoi({ envoyeLe: "", creeLe: CREE_LE, maintenant: MAINTENANT }).valide
    ).toBe(false);
  });
});

describe("destinataireEnregistrable", () => {
  it("retient l'URL du formulaire", () => {
    expect(
      destinataireEnregistrable({
        mode: "FORMULAIRE_WEB",
        urlFormulaire: "https://exemple.com/claim",
        langue: "fr",
      })
    ).toEqual({ mode: "FORMULAIRE_WEB", destinataire: "https://exemple.com/claim" });
  });

  it("retient l'adresse postale", () => {
    expect(
      destinataireEnregistrable({
        mode: "COURRIER",
        adressePostale: "PO Box 1126, Uxbridge",
        langue: "en",
      })
    ).toEqual({ mode: "COURRIER", destinataire: "PO Box 1126, Uxbridge" });
  });

  it("retient l'email quand l'envoi a été fait à la main", () => {
    expect(
      destinataireEnregistrable({
        mode: "EMAIL",
        email: "claims@exemple.com",
        langue: "en",
      })
    ).toEqual({ mode: "EMAIL", destinataire: "claims@exemple.com" });
  });

  it("rend null si le contact ne porte aucune coordonnée", () => {
    // Sans destinataire, la trace ne prouverait rien : on préfère refuser
    // l'enregistrement que garder une ligne qui dit « envoyé quelque part ».
    expect(
      destinataireEnregistrable({ mode: "FORMULAIRE_WEB", langue: "fr" })
    ).toBeNull();
  });

  it("rend null sur un contact absent", () => {
    expect(destinataireEnregistrable(undefined)).toBeNull();
  });
});
