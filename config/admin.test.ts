import { afterEach, describe, expect, it } from "vitest";
import { estAdmin } from "./admin";

const valeurInitiale = process.env.ADMIN_EMAILS;

afterEach(() => {
  if (valeurInitiale === undefined) delete process.env.ADMIN_EMAILS;
  else process.env.ADMIN_EMAILS = valeurInitiale;
});

describe("estAdmin", () => {
  it("refuse tout le monde quand la variable n'est pas configurée", () => {
    delete process.env.ADMIN_EMAILS;
    expect(estAdmin("fondateur@volia.fr")).toBe(false);
  });

  it("refuse tout le monde quand la liste est vide", () => {
    // Le piège classique : une liste vide qui autorise tout le monde
    // exposerait tous les dossiers clients au premier compte créé.
    process.env.ADMIN_EMAILS = "";
    expect(estAdmin("fondateur@volia.fr")).toBe(false);
    process.env.ADMIN_EMAILS = "  ,  ,";
    expect(estAdmin("fondateur@volia.fr")).toBe(false);
  });

  it("autorise un email listé", () => {
    process.env.ADMIN_EMAILS = "fondateur@volia.fr";
    expect(estAdmin("fondateur@volia.fr")).toBe(true);
  });

  it("ignore la casse et les espaces autour", () => {
    process.env.ADMIN_EMAILS = " Fondateur@Volia.fr , associe@volia.fr ";
    expect(estAdmin("FONDATEUR@volia.fr")).toBe(true);
    expect(estAdmin("  associe@volia.fr ")).toBe(true);
  });

  it("refuse un email non listé", () => {
    process.env.ADMIN_EMAILS = "fondateur@volia.fr";
    expect(estAdmin("curieux@exemple.com")).toBe(false);
  });

  it("refuse une session sans email", () => {
    process.env.ADMIN_EMAILS = "fondateur@volia.fr";
    expect(estAdmin(null)).toBe(false);
    expect(estAdmin(undefined)).toBe(false);
    expect(estAdmin("")).toBe(false);
  });

  it("ne se laisse pas avoir par un sous-domaine ressemblant", () => {
    process.env.ADMIN_EMAILS = "fondateur@volia.fr";
    expect(estAdmin("fondateur@volia.fr.attaquant.com")).toBe(false);
  });
});
