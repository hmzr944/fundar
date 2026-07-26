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
    subject: `Confirmation de votre dossier — vol ${params.numeroVol}`,
    text:
      "Nous avons bien reçu votre mandat signé. Vous trouverez une copie en pièce jointe. " +
      "Nous engageons la réclamation auprès de la compagnie et vous tiendrons informé depuis votre tableau de bord.",
    attachments: [
      {
        filename: `mandat-${params.numeroVol}.pdf`,
        content: Buffer.from(params.pdfMandat),
      },
    ],
  });
}

export async function envoyerLettreReclamation(params: {
  destinataire: string;
  numeroVol: string;
  pdfLettre: Uint8Array;
}) {
  await client().emails.send({
    from: EXPEDITEUR,
    to: params.destinataire,
    subject: `Lettre de réclamation envoyée — vol ${params.numeroVol}`,
    text: "La lettre de réclamation formelle a été envoyée à la compagnie aérienne. Copie ci-jointe.",
    attachments: [
      {
        filename: `reclamation-${params.numeroVol}.pdf`,
        content: Buffer.from(params.pdfLettre),
      },
    ],
  });
}
