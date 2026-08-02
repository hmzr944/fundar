import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

export interface DonneesLettreReclamation {
  compagnieNom: string;
  numeroVol: string;
  dateVol: string;
  aeroportDepart: string;
  aeroportArrivee: string;
  montantReclame: number | null;
  devise: "EUR" | "GBP";
  passagerNom: string;
  passagerPrenom: string;
  passagerAdresse: string;
  /** Libellé humain de la juridiction applicable, ex: "France". */
  juridiction: string;
  /** V1 : anglais uniquement (§8, hors scope le multilingue). */
  langue: "en";
  envoyeeLe: Date;
}

const MARGE = 50;
const LARGEUR_A4 = 595.28;
const HAUTEUR_A4 = 841.89;

/**
 * Génère la lettre de réclamation formelle envoyée à la compagnie.
 * Template paramétré par {compagnie, juridiction, langue} — la langue est
 * fixée à l'anglais en V1.
 */
export async function genererLettreReclamationPdf(
  d: DonneesLettreReclamation
): Promise<Uint8Array> {
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

  ligne(d.envoyeeLe.toISOString().slice(0, 10), { interligne: 24 });
  ligne(`To: ${d.compagnieNom} — Customer Relations / Legal Department`, {
    interligne: 24,
  });

  ligne("FORMAL CLAIM FOR COMPENSATION", { gras: true, taille: 14, interligne: 28 });
  ligne(
    `Applicable jurisdiction: ${d.juridiction} — EU Regulation (EC) No 261/2004 / UK261`
  );
  y -= 12;

  ligne("Passenger", { gras: true, interligne: 18 });
  ligne(`${d.passagerPrenom} ${d.passagerNom}`);
  ligne(d.passagerAdresse, { interligne: 24 });

  ligne("Flight details", { gras: true, interligne: 18 });
  ligne(`Flight ${d.numeroVol}, ${d.dateVol}`);
  ligne(`${d.aeroportDepart} -> ${d.aeroportArrivee}`, { interligne: 24 });

  ligne(
    "This flight was subject to a disruption (delay, cancellation, or denied boarding)",
  );
  ligne(
    "giving rise to a right to compensation under the applicable Regulation."
  );
  if (d.montantReclame !== null) {
    ligne(`We hereby formally claim compensation of ${d.montantReclame} ${d.devise}.`, {
      interligne: 24,
    });
  } else {
    y -= 16;
  }

  ligne(
    "We request settlement within 14 days of receipt of this letter. Absent a response,",
  );
  ligne("we reserve the right to pursue this claim through all available means.", {
    interligne: 28,
  });

  ligne("Sincerely,", { interligne: 24 });
  ligne("Volia, on behalf of the passenger", { gras: true });

  return doc.save();
}
