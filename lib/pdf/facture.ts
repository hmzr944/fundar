import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { ENTREPRISE } from "@/config/entreprise";

export interface DonneesFacture {
  numero: string;
  emiseLe: Date;
  clientNom: string;
  clientPrenom: string;
  clientAdresse: string;
  numeroVol: string;
  dateVol: string;
  compagnie: string;
  montantIndemnisation: number;
  tauxCommission: number;
  montantCommission: number;
  devise: string;
  lienPaiement?: string | null;
}

const MARGE = 50;
const LARGEUR_A4 = 595.28;
const HAUTEUR_A4 = 841.89;

function formaterDate(date: Date): string {
  return date.toLocaleDateString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Facture de commission.
 *
 * Le détail du calcul est imprimé en toutes lettres — indemnisation reçue,
 * taux, commission — parce que c'est la première chose que le client
 * vérifiera, et que la moindre ambiguïté à ce moment-là transforme un
 * règlement en litige. Le taux imprimé est celui du dossier, pas le taux
 * courant : c'est celui qui figure sur le mandat qu'il a signé.
 */
export async function genererFacturePdf(d: DonneesFacture): Promise<Uint8Array> {
  const doc = await PDFDocument.create();
  const page = doc.addPage([LARGEUR_A4, HAUTEUR_A4]);
  const police = await doc.embedFont(StandardFonts.Helvetica);
  const policeGrasse = await doc.embedFont(StandardFonts.HelveticaBold);

  let y = 780;

  function ligne(
    texte: string,
    options?: { gras?: boolean; taille?: number; interligne?: number; x?: number }
  ) {
    const taille = options?.taille ?? 11;
    page.drawText(texte, {
      x: options?.x ?? MARGE,
      y,
      size: taille,
      font: options?.gras ? policeGrasse : police,
      color: rgb(0, 0, 0),
    });
    y -= options?.interligne ?? taille + 8;
  }

  function saut(hauteur = 14) {
    y -= hauteur;
  }

  function trait() {
    page.drawLine({
      start: { x: MARGE, y: y + 6 },
      end: { x: LARGEUR_A4 - MARGE, y: y + 6 },
      thickness: 0.7,
      color: rgb(0.8, 0.8, 0.8),
    });
    y -= 12;
  }

  ligne("FACTURE", { gras: true, taille: 20 });
  ligne(`N° ${d.numero}`, { taille: 11 });
  ligne(`Émise le ${formaterDate(d.emiseLe)}`, { taille: 11 });
  saut();

  ligne("Émetteur", { gras: true, taille: 10 });
  ligne(`${ENTREPRISE.raisonSociale} — ${ENTREPRISE.formeJuridique}`, { taille: 10 });
  ligne(ENTREPRISE.adresse, { taille: 10 });
  ligne(`SIREN ${ENTREPRISE.siren}`, { taille: 10 });
  if (ENTREPRISE.tvaIntracom) {
    ligne(`TVA intracommunautaire ${ENTREPRISE.tvaIntracom}`, { taille: 10 });
  }
  ligne(ENTREPRISE.email, { taille: 10 });
  saut();

  ligne("Facturé à", { gras: true, taille: 10 });
  ligne(`${d.clientPrenom} ${d.clientNom}`, { taille: 10 });
  ligne(d.clientAdresse, { taille: 10 });
  saut(20);

  trait();
  ligne("Prestation", { gras: true, taille: 12 });
  ligne(
    `Recouvrement amiable de l'indemnisation du vol ${d.numeroVol} du ${d.dateVol} (${d.compagnie}),`,
    { taille: 10 }
  );
  ligne("au titre du règlement (CE) n° 261/2004 ou de son équivalent britannique.", {
    taille: 10,
  });
  saut(10);

  ligne(
    `Indemnisation obtenue : ${d.montantIndemnisation} ${d.devise}`,
    { taille: 11 }
  );
  ligne(
    `Commission contractuelle : ${Math.round(d.tauxCommission * 100)} % du montant récupéré`,
    { taille: 11 }
  );
  saut(6);
  trait();

  ligne(`Total à régler : ${d.montantCommission} ${d.devise}`, {
    gras: true,
    taille: 14,
  });
  ligne(ENTREPRISE.mentionTva, { taille: 9 });
  saut();

  ligne("Règlement", { gras: true, taille: 10 });
  ligne(
    "À régler dans un délai de quatorze (14) jours à compter de la réception de votre indemnisation.",
    { taille: 10 }
  );

  if (d.lienPaiement) {
    ligne("Paiement en ligne :", { taille: 10 });
    ligne(d.lienPaiement, { taille: 9 });
  } else if (ENTREPRISE.iban) {
    ligne(`Par virement — IBAN ${ENTREPRISE.iban}`, { taille: 10 });
    if (ENTREPRISE.bic) ligne(`BIC ${ENTREPRISE.bic}`, { taille: 10 });
    ligne(`Référence à indiquer : ${d.numero}`, { taille: 10 });
  }

  saut();
  ligne(
    "Pénalités de retard : taux d'intérêt légal majoré. Indemnité forfaitaire",
    { taille: 8 }
  );
  ligne("pour frais de recouvrement : 40 € (art. L441-10 du Code de commerce).", {
    taille: 8,
  });

  return doc.save();
}
