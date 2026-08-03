import { Resend } from "resend";

const EXPEDITEUR = process.env.RESEND_FROM_EMAIL ?? "dossiers@volia.example";

function client() {
  return new Resend(process.env.RESEND_API_KEY ?? "");
}

export async function envoyerConfirmationMandat(params: {
  destinataire: string;
  numeroVol: string;
  pdfMandat: Uint8Array;
}) {
  await client().emails.send({
    from: EXPEDITEUR,
    to: params.destinataire,
    subject: `Votre mandat signé — vol ${params.numeroVol}`,
    // Formulation volontairement prudente : à ce stade la réclamation n'est
    // pas encore partie. Ne rien affirmer qui ne soit pas déjà vrai.
    text:
      "Nous avons bien reçu votre mandat signé, dont une copie est en pièce jointe.\n\n" +
      "Prochaine étape : nous préparons la réclamation auprès de la compagnie. " +
      "Vous recevrez un email dès qu'elle sera effectivement transmise, et vous " +
      "pouvez suivre l'état de votre dossier depuis votre tableau de bord.",
    attachments: [
      {
        filename: `mandat-${params.numeroVol}.pdf`,
        content: Buffer.from(params.pdfMandat),
      },
    ],
  });
}

/**
 * Envoie la réclamation à la COMPAGNIE (et non au client).
 *
 * Le mandat signé est joint : sans lui, une compagnie rejette une
 * réclamation présentée par un tiers. Le client est en reply-to pour que
 * toute réponse de la compagnie lui soit également accessible.
 *
 * Ne capture pas les erreurs : l'appelant doit savoir si l'envoi a échoué,
 * sinon on risque d'annoncer au client une transmission qui n'a pas eu lieu.
 */
export async function envoyerReclamationCompagnie(params: {
  emailCompagnie: string;
  emailClient: string;
  compagnieNom: string;
  numeroVol: string;
  dateVol: string;
  pdfLettre: Uint8Array;
  pdfMandat?: Uint8Array;
}) {
  const attachments = [
    {
      filename: `claim-${params.numeroVol}-${params.dateVol}.pdf`,
      content: Buffer.from(params.pdfLettre),
    },
  ];

  if (params.pdfMandat) {
    attachments.push({
      filename: `letter-of-authority-${params.numeroVol}.pdf`,
      content: Buffer.from(params.pdfMandat),
    });
  }

  const reponse = await client().emails.send({
    from: EXPEDITEUR,
    to: params.emailCompagnie,
    replyTo: params.emailClient,
    subject: `EU261/UK261 compensation claim — flight ${params.numeroVol} on ${params.dateVol}`,
    text:
      `Dear ${params.compagnieNom} Customer Relations,\n\n` +
      `Please find attached a formal claim for compensation under Regulation (EC) No 261/2004 ` +
      `(or its UK equivalent) concerning flight ${params.numeroVol} on ${params.dateVol}, ` +
      `together with the passenger's signed letter of authority appointing us to act on their behalf.\n\n` +
      `We would be grateful for your acknowledgement of receipt, and for settlement within 14 days.\n\n` +
      `Kind regards,\nVolia, on behalf of the passenger`,
    attachments,
  });

  if (reponse.error) {
    throw new Error(`Envoi à la compagnie refusé : ${reponse.error.message}`);
  }

  return reponse.data?.id ?? null;
}

/**
 * Facture de commission, envoyée dès que le client a été indemnisé.
 *
 * Le ton reste celui d'un remerciement, pas d'un recouvrement : à cet
 * instant le client vient de recevoir une somme qu'il avait souvent
 * abandonnée. C'est le moment où il est le plus disposé à régler, et le
 * seul levier dont on dispose — dans le modèle mandat, l'argent ne passe
 * jamais par nous et rien ne peut être prélevé.
 */
export async function envoyerFacture(params: {
  destinataire: string;
  numero: string;
  numeroVol: string;
  montant: number;
  devise: string;
  lienPaiement?: string | null;
  pdfFacture: Uint8Array;
}) {
  const reglement = params.lienPaiement
    ? `Régler en ligne (1 minute) : ${params.lienPaiement}`
    : "Les coordonnées de virement figurent sur la facture jointe.";

  const reponse = await client().emails.send({
    from: EXPEDITEUR,
    to: params.destinataire,
    subject: `Votre indemnisation est arrivée — facture ${params.numero}`,
    text:
      `Bonne nouvelle : votre indemnisation pour le vol ${params.numeroVol} a bien été versée.\n\n` +
      `Comme convenu dans votre mandat, notre commission n'est due que maintenant, ` +
      `sur ce que vous avez réellement reçu : ${params.montant} ${params.devise}.\n\n` +
      `${reglement}\n\n` +
      "Facture en pièce jointe, à régler sous 14 jours. Merci de nous avoir fait confiance " +
      "sur un dossier que beaucoup auraient laissé tomber.",
    attachments: [
      {
        filename: `facture-${params.numero}.pdf`,
        content: Buffer.from(params.pdfFacture),
      },
    ],
  });

  if (reponse.error) {
    throw new Error(`Envoi de la facture refusé : ${reponse.error.message}`);
  }
}

/**
 * Demande au client si la compagnie l'a payé.
 *
 * Dans le modèle mandat, la compagnie verse directement au passager : sans
 * cette question, on n'apprend jamais qu'un dossier a abouti. Le message
 * doit rester une prise de nouvelles — un client non payé qui reçoit une
 * relance à tonalité comptable se sent harcelé pour rien.
 */
export async function envoyerRelancePaiement(params: {
  destinataire: string;
  numeroVol: string;
  compagnieNom: string;
  joursDepuisEnvoi: number;
  urlDashboard: string;
}) {
  const reponse = await client().emails.send({
    from: EXPEDITEUR,
    to: params.destinataire,
    subject: `Vol ${params.numeroVol} : ${params.compagnieNom} vous a-t-elle payé ?`,
    text:
      `Votre réclamation a été transmise à ${params.compagnieNom} il y a ${params.joursDepuisEnvoi} jours.\n\n` +
      "Ces compagnies versent l'indemnisation directement sur le compte du passager, " +
      "souvent sans nous prévenir : nous n'avons donc aucun moyen de le savoir de notre côté.\n\n" +
      `Avez-vous reçu quelque chose ? Un clic suffit à nous le dire : ${params.urlDashboard}\n\n` +
      "Si vous n'avez rien reçu, ne faites rien : nous relançons la compagnie et " +
      "nous continuons à suivre le dossier. Vous ne nous devez rien tant que vous n'avez pas été indemnisé.",
  });

  if (reponse.error) {
    throw new Error(`Relance refusée : ${reponse.error.message}`);
  }
}

/** Informe le client que sa réclamation est réellement partie. */
export async function envoyerCopieReclamationClient(params: {
  destinataire: string;
  numeroVol: string;
  compagnieNom: string;
  pdfLettre: Uint8Array;
}) {
  await client().emails.send({
    from: EXPEDITEUR,
    to: params.destinataire,
    subject: `Réclamation transmise à ${params.compagnieNom} — vol ${params.numeroVol}`,
    text:
      `Votre réclamation vient d'être transmise à ${params.compagnieNom}, avec votre mandat signé.\n\n` +
      "Copie de la lettre en pièce jointe. Les délais de réponse varient fortement " +
      "d'une compagnie à l'autre : nous vous tenons informé à chaque évolution, et " +
      "vous n'avez aucune démarche à faire de votre côté.",
    attachments: [
      {
        filename: `reclamation-${params.numeroVol}.pdf`,
        content: Buffer.from(params.pdfLettre),
      },
    ],
  });
}
