import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import type { Passager } from "@/lib/claims/passagers";

export interface DonneesMandat {
  nom: string;
  prenom: string;
  /**
   * Tous les passagers couverts. Le mandant reste `nom`/`prenom` — un seul
   * signataire — mais la compagnie doit savoir pour qui la réclamation est
   * portée, faute de quoi elle n'indemnise que le signataire.
   */
  passagers: Passager[];
  adresse: string;
  email: string;
  iban: string;
  numeroVol: string;
  dateVol: string;
  aeroportDepart: string;
  aeroportArrivee: string;
  compagnie: string;
  montantEstime: number | null;
  devise: "EUR" | "GBP";
  modeleJuridique: "MANDAT" | "CESSION";
  /** Data URL PNG issue de react-signature-canvas. */
  signatureDataUrl: string;
  signeLe: Date;
}

const MARGE = 50;
const LARGEUR_A4 = 595.28;
const HAUTEUR_A4 = 841.89;

export async function genererMandatPdf(d: DonneesMandat): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([LARGEUR_A4, HAUTEUR_A4]);
  const police = await doc.embedFont(StandardFonts.Helvetica);
  const policeGrasse = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = 780;

  function ligne(texte: string, options?: { gras?: boolean; taille?: number; interligne?: number }) {
    const taille = options?.taille ?? 11;
    page.drawText(texte, {
      x: MARGE,
      y,
      size: taille,
      font: options?.gras ? policeGrasse : police,
      color: rgb(0, 0, 0),
    });
    y -= options?.interligne ?? taille + 8;
  }

  ligne("MANDAT DE REPRÉSENTATION", { gras: true, taille: 16, interligne: 32 });

  ligne(
    d.modeleJuridique === "MANDAT"
      ? "Le mandant mandate Clearto pour engager, en son nom, une réclamation d'indemnisation"
      : "Le cédant cède à Clearto sa créance d'indemnisation",
    { interligne: 24 }
  );
  ligne("auprès de la compagnie aérienne concernée au titre du règlement EU261/UK261.", {
    interligne: 28,
  });

  ligne("Mandant", { gras: true, interligne: 20 });
  ligne(`${d.prenom} ${d.nom}`);
  ligne(d.adresse);
  ligne(d.email);
  ligne(`IBAN : ${d.iban}`, { interligne: 28 });

  // Un dossier à un seul passager n'a pas besoin d'une liste : le mandant
  // est déjà nommé juste au-dessus.
  if (d.passagers.length > 1) {
    ligne(`Passagers couverts (${d.passagers.length})`, {
      gras: true,
      interligne: 20,
    });
    d.passagers.forEach((p, i) => {
      ligne(`${i + 1}. ${p.prenom} ${p.nom}`);
    });
    ligne(
      "Le mandant agit pour l'ensemble des passagers ci-dessus, voyageant sur la même réservation.",
      { taille: 10, interligne: 28 }
    );
  }

  ligne("Vol concerné", { gras: true, interligne: 20 });
  ligne(`Vol ${d.numeroVol} du ${d.dateVol}`);
  ligne(`${d.aeroportDepart} -> ${d.aeroportArrivee}, compagnie ${d.compagnie}`);
  if (d.montantEstime !== null) {
    ligne(`Montant estimé : ${d.montantEstime} ${d.devise}`, { interligne: 28 });
  } else {
    y -= 20;
  }

  ligne("Rémunération", { gras: true, interligne: 20 });
  ligne("22 % du montant effectivement récupéré, exigible uniquement en cas de succès.", {
    interligne: 28,
  });

  ligne(
    "En signant ci-dessous, le mandant confirme avoir pris connaissance des",
    { interligne: 16 }
  );
  ligne(
    "conditions générales et de l'obligation de paiement de cette commission en cas de succès.",
    { interligne: 28 }
  );

  const base64 = d.signatureDataUrl.split(",")[1] ?? "";
  const octetsSignature = Buffer.from(base64, "base64");
  const imageSignature = await doc.embedPng(octetsSignature);
  const largeurSignature = 180;
  const hauteurSignature =
    (imageSignature.height / imageSignature.width) * largeurSignature;

  page.drawImage(imageSignature, {
    x: MARGE,
    y: y - hauteurSignature,
    width: largeurSignature,
    height: hauteurSignature,
  });
  y -= hauteurSignature + 16;

  ligne(`Signé électroniquement le ${d.signeLe.toISOString()}`, { taille: 9 });

  return doc.save();
}
