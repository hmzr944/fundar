import { describe, expect, it } from "vitest";
import { estEmailPlausible } from "./email";

describe("estEmailPlausible", () => {
  it("accepte les adresses courantes", () => {
    expect(estEmailPlausible("jean.dupont@gmail.com")).toBe(true);
    expect(estEmailPlausible("a@b.fr")).toBe(true);
    expect(estEmailPlausible("nom+etiquette@sous.domaine.co.uk")).toBe(true);
  });

  it("accepte une adresse aux caractères inhabituels mais licites", () => {
    // Une règle trop stricte rejette de vraies adresses : c'est plus grave
    // que d'en laisser passer une fausse, que l'email de connexion filtrera.
    expect(estEmailPlausible("o'brien@exemple.ie")).toBe(true);
    expect(estEmailPlausible("prenom_nom-123@exemple.com")).toBe(true);
  });

  it("refuse ce qui ne peut pas être une adresse", () => {
    expect(estEmailPlausible("")).toBe(false);
    expect(estEmailPlausible("sansarobase.com")).toBe(false);
    expect(estEmailPlausible("deux@@exemple.com")).toBe(false);
    expect(estEmailPlausible("avec espace@exemple.com")).toBe(false);
    expect(estEmailPlausible("@exemple.com")).toBe(false);
    expect(estEmailPlausible("sansdomaine@")).toBe(false);
  });

  it("refuse un domaine sans point ni extension crédible", () => {
    expect(estEmailPlausible("jean@localhost")).toBe(false);
    expect(estEmailPlausible("jean@exemple.")).toBe(false);
    expect(estEmailPlausible("jean@.com")).toBe(false);
    expect(estEmailPlausible("jean@exemple..com")).toBe(false);
    expect(estEmailPlausible("jean@exemple.123")).toBe(false);
  });

  it("refuse une adresse démesurée", () => {
    expect(estEmailPlausible(`${"a".repeat(250)}@exemple.com`)).toBe(false);
  });

  it("ignore les espaces autour", () => {
    expect(estEmailPlausible("  jean@exemple.com  ")).toBe(true);
  });
});
