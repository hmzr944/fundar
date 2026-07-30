import { Resend } from "resend";

const EXPEDITEUR = process.env.RESEND_FROM_EMAIL ?? "dossiers@refundradar.example";

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
      `Kind regards,\nRefund Radar, on behalf of the passenger`,
    attachments,
  });

  if (reponse.error) {
    throw new Error(`Envoi à la compagnie refusé : ${reponse.error.message}`);
  }

  return reponse.data?.id ?? null;
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
