import { describe, expect, it } from "vitest";
import { comparer, repartir, type OffreComparee } from "./commission";

describe("repartir", () => {
  it("sépare commission et net sur un montant du barème", () => {
    expect(repartir(600, 0.22)).toEqual({ commission: 132, net: 468 });
  });

  it("garde commission + net égal au montant, malgré les arrondis", () => {
    // 0,22 x 250,55 = 55,121 : c'est le cas où un arrondi naïf des deux
    // parts ferait apparaître un centime venu de nulle part.
    const { commission, net } = repartir(250.55, 0.22);
    expect(Math.round((commission + net) * 100) / 100).toBe(250.55);
  });

  it("rend zéro des deux côtés sur un montant nul", () => {
    expect(repartir(0, 0.22)).toEqual({ commission: 0, net: 0 });
  });
});

describe("comparer", () => {
  it("chiffre l'écart en euros, pas en points de pourcentage", () => {
    const lignes = comparer(600, 0.22);
    const airhelp = lignes.find((l) => l.nom === "AirHelp");
    expect(airhelp?.net).toBe(390);
    expect(airhelp?.ecart).toBe(78);
  });

  it("classe le plus gros écart en premier", () => {
    const lignes = comparer(600, 0.22);
    expect(lignes[0].ecart).toBeGreaterThanOrEqual(lignes[1].ecart);
  });

  it("écarte un concurrent moins cher que nous plutôt que de le flatter", () => {
    const offres: OffreComparee[] = [
      { nom: "MoinsCher", taux: 0.15 },
      { nom: "PlusCher", taux: 0.35 },
    ];
    const lignes = comparer(600, 0.22, offres);
    expect(lignes.map((l) => l.nom)).toEqual(["PlusCher"]);
  });

  it("ne compare rien si notre taux cesse d'être le meilleur", () => {
    // Garde-fou : si un jour le taux monte, le comparatif doit disparaître
    // de lui-même au lieu de continuer à affirmer un avantage disparu.
    expect(comparer(600, 0.4)).toEqual([]);
  });

  it("écarte un concurrent au taux strictement égal", () => {
    expect(comparer(600, 0.35, [{ nom: "Egal", taux: 0.35 }])).toEqual([]);
  });
});
