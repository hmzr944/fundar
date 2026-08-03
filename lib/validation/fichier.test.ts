import { describe, expect, it } from "vitest";
import {
  nomFichierSur,
  TAILLE_MAX_OCTETS,
  validerFichier,
} from "./fichier";

function fichier(partiel: Partial<{ name: string; size: number; type: string }> = {}) {
  return {
    name: "carte.pdf",
    size: 500_000,
    type: "application/pdf",
    ...partiel,
  };
}

describe("validerFichier", () => {
  it("accepte une photo de carte d'embarquement", () => {
    expect(validerFichier(fichier({ name: "photo.jpg", type: "image/jpeg" })).valide).toBe(true);
  });

  it("refuse un fichier au-delà de la limite", () => {
    const resultat = validerFichier(fichier({ size: TAILLE_MAX_OCTETS + 1 }));
    expect(resultat.valide).toBe(false);
    expect(resultat.message).toContain("trop lourd");
  });

  it("accepte un fichier exactement à la limite", () => {
    expect(validerFichier(fichier({ size: TAILLE_MAX_OCTETS })).valide).toBe(true);
  });

  it("refuse un fichier vide", () => {
    expect(validerFichier(fichier({ size: 0 })).valide).toBe(false);
  });

  it("refuse un exécutable déguisé en justificatif", () => {
    const resultat = validerFichier(
      fichier({ name: "virus.exe", type: "application/x-msdownload" })
    );
    expect(resultat.valide).toBe(false);
  });

  it("accepte un HEIC dont le navigateur n'a pas donné le type", () => {
    // Cas réel sur d'anciens iOS : type MIME vide. Rejeter reviendrait à
    // refuser une photo prise avec un iPhone.
    expect(validerFichier(fichier({ name: "IMG_0042.HEIC", type: "" })).valide).toBe(true);
  });

  it("refuse un fichier sans type ni extension connue", () => {
    expect(validerFichier(fichier({ name: "sansextension", type: "" })).valide).toBe(false);
  });
});

describe("nomFichierSur", () => {
  it("garde un nom déjà sain", () => {
    expect(nomFichierSur("carte-embarquement.pdf")).toBe("carte-embarquement.pdf");
  });

  it("neutralise les slashs, qui déplaceraient le fichier dans le bucket", () => {
    expect(nomFichierSur("../../secret.pdf")).toBe("secret.pdf");
    expect(nomFichierSur("dossier/carte.pdf")).toBe("dossier-carte.pdf");
  });

  it("retire les accents et les espaces", () => {
    expect(nomFichierSur("Carte d'embarquement été.PDF")).toBe(
      "Carte-d-embarquement-ete.pdf"
    );
  });

  it("tronque un nom démesuré sans perdre l'extension", () => {
    const resultat = nomFichierSur(`${"a".repeat(300)}.pdf`);
    expect(resultat.endsWith(".pdf")).toBe(true);
    expect(resultat.length).toBeLessThanOrEqual(64);
  });

  it("donne un nom de repli quand il ne reste rien d'exploitable", () => {
    expect(nomFichierSur("///.pdf")).toBe("justificatif.pdf");
    expect(nomFichierSur("...")).toBe("justificatif");
  });

  it("normalise la casse de l'extension", () => {
    expect(nomFichierSur("photo.JPG")).toBe("photo.jpg");
  });
});
