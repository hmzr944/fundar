import { describe, expect, it } from "vitest";
import {
  GREVES,
  grevesEncoreReclamables,
  perspectiveIndemnisation,
  trouverGreve,
  volConcerne,
  type Greve,
} from "./greves";

function greve(partiel: Partial<Greve> = {}): Greve {
  return {
    slug: "greve-test",
    titre: "Grève de test",
    dateDebut: "2026-03-10",
    dateFin: "2026-03-12",
    origine: "PERSONNEL_COMPAGNIE",
    compagnies: ["AF"],
    aeroports: ["CDG"],
    source: "https://exemple.test/article",
    ...partiel,
  };
}

describe("registre des grèves", () => {
  it("est vide tant que rien n'a été vérifié à la main", () => {
    // Ce test échouera dès qu'une grève sera ajoutée : ce sera le moment
    // de vérifier que sa source est réelle et ses dates exactes.
    expect(GREVES).toEqual([]);
  });

  it("exige une source sur chaque entrée", () => {
    for (const g of GREVES) {
      expect(g.source).toMatch(/^https?:\/\//);
    }
  });

  it("n'a pas de slug en double", () => {
    const slugs = GREVES.map((g) => g.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it("n'a aucune grève dont la fin précède le début", () => {
    for (const g of GREVES) {
      expect(g.dateFin >= g.dateDebut).toBe(true);
    }
  });
});

describe("perspectiveIndemnisation", () => {
  it("annonce l'indemnisation due pour une grève du personnel de la compagnie", () => {
    expect(perspectiveIndemnisation("PERSONNEL_COMPAGNIE")).toBe("DUE");
  });

  it("reste prudente sur une grève externe à la compagnie", () => {
    expect(perspectiveIndemnisation("CONTROLE_AERIEN")).toBe("A_VERIFIER");
    expect(perspectiveIndemnisation("PERSONNEL_AEROPORT")).toBe("A_VERIFIER");
    expect(perspectiveIndemnisation("AUTRE")).toBe("A_VERIFIER");
  });

  it("ne dit jamais non", () => {
    // Un refus affiché sur une page publique dissuaderait des passagers
    // dont le dossier mérite l'examen du moteur.
    const origines = [
      "PERSONNEL_COMPAGNIE",
      "CONTROLE_AERIEN",
      "PERSONNEL_AEROPORT",
      "AUTRE",
    ] as const;
    for (const origine of origines) {
      expect(["DUE", "A_VERIFIER"]).toContain(perspectiveIndemnisation(origine));
    }
  });
});

describe("volConcerne", () => {
  it("inclut les deux bornes", () => {
    const g = greve();
    expect(volConcerne(g, "2026-03-10")).toBe(true);
    expect(volConcerne(g, "2026-03-12")).toBe(true);
  });

  it("exclut la veille et le lendemain", () => {
    const g = greve();
    expect(volConcerne(g, "2026-03-09")).toBe(false);
    expect(volConcerne(g, "2026-03-13")).toBe(false);
  });
});

describe("grevesEncoreReclamables", () => {
  it("retire une grève au-delà du délai le plus court d'Europe", () => {
    const ancienne = greve({ slug: "vieille", dateDebut: "2024-01-01", dateFin: "2024-01-02" });
    const resultat = grevesEncoreReclamables(new Date("2026-08-03"), [ancienne]);
    expect(resultat).toEqual([]);
  });

  it("garde une grève encore dans la fenêtre d'un an", () => {
    const recente = greve({ slug: "recente", dateDebut: "2026-06-01", dateFin: "2026-06-02" });
    const resultat = grevesEncoreReclamables(new Date("2026-08-03"), [recente]);
    expect(resultat.map((g) => g.slug)).toEqual(["recente"]);
  });

  it("classe de la plus récente à la plus ancienne", () => {
    const a = greve({ slug: "mars", dateDebut: "2026-03-01", dateFin: "2026-03-02" });
    const b = greve({ slug: "juin", dateDebut: "2026-06-01", dateFin: "2026-06-02" });
    const resultat = grevesEncoreReclamables(new Date("2026-08-03"), [a, b]);
    expect(resultat.map((g) => g.slug)).toEqual(["juin", "mars"]);
  });
});

describe("trouverGreve", () => {
  it("rend undefined sur un slug inconnu plutôt que de deviner", () => {
    expect(trouverGreve("inexistante")).toBeUndefined();
  });
});
