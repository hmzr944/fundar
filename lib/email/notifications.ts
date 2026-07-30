import { Resend } from "resend";

const EXPEDITEUR = process.env.RESEND_FROM_EMAIL ?? "dossiers@refundradar.example";

function client() {
  return new Resend(process.env.RESEND_API_KEY ?? "");
}

export interface ContenuNotification {
  sujet: string;
  texte: string;
}

/**
 * Contenu des emails de suivi de dossier.
 *
 * Règle de ton : on ne promet rien qui ne soit pas déjà vrai, on rappelle
 * systématiquement que le client n'a aucune démarche à faire, et on dit
 * explicitement qu'il ne doit rien en cas de refus. C'est ce qui évite les
 * relances anxieuses sur un processus qui dure plusieurs mois.
 */
export function composerNotification(
  type: string,
  contexte: { numeroVol: string; montantRecupere?: number | null; devise?: string | null; commissionDue?: number | null }
): ContenuNotification | null {
  const vol = contexte.numeroVol;

  switch (type) {
    case "STATUT_EN_COURS":
      return {
        sujet: `Réclamation transmise à la compagnie — vol ${vol}`,
        texte:
          `Votre réclamation pour le vol ${vol} a été transmise à la compagnie, accompagnée de votre mandat signé.\n\n` +
          "Les délais de réponse varient beaucoup d'une compagnie à l'autre, de quelques semaines à plusieurs mois. " +
          "Vous n'avez aucune démarche à faire : nous relançons si nécessaire et nous vous écrivons à chaque évolution.\n\n" +
          "Si la compagnie vous contacte directement, transmettez-nous simplement son message.",
      };

    case "STATUT_PAYE": {
      const montant =
        contexte.montantRecupere != null
          ? `${contexte.montantRecupere} ${contexte.devise ?? ""}`.trim()
          : null;
      const commission =
        contexte.commissionDue != null
          ? `${contexte.commissionDue} ${contexte.devise ?? ""}`.trim()
          : null;

      return {
        sujet: `Indemnisation obtenue — vol ${vol}`,
        texte:
          `Bonne nouvelle : la compagnie a accepté d'indemniser votre vol ${vol}` +
          (montant ? `, pour ${montant}` : "") +
          ".\n\n" +
          "Le versement est effectué directement sur votre compte par la compagnie. " +
          "Si vous ne l'avez pas encore reçu, il peut être en cours de traitement bancaire.\n\n" +
          (commission
            ? `Notre commission de service s'élève à ${commission}. Vous recevrez une facture séparée, à régler sous 14 jours à compter de la réception effective des fonds.\n\n`
            : "") +
          "Merci de votre confiance.",
      };
    }

    case "STATUT_REFUSE":
      return {
        sujet: `Réclamation refusée par la compagnie — vol ${vol}`,
        texte:
          `La compagnie a rejeté la réclamation concernant le vol ${vol}.\n\n` +
          "Vous ne nous devez rien : notre rémunération dépend uniquement d'une indemnisation effectivement obtenue.\n\n" +
          "Un refus de la compagnie ne signifie pas nécessairement que votre droit n'existe pas. " +
          "Vous restez libre de saisir l'autorité nationale compétente ou de consulter un professionnel du droit. " +
          "Écrivez-nous si vous souhaitez que nous vous transmettions l'ensemble des pièces de votre dossier.",
      };

    // Retour à "dossier reçu" : pas d'email, cela n'apporte rien au client.
    case "STATUT_SOUMIS":
      return null;

    default:
      return null;
  }
}

/** Envoie une notification. Laisse remonter l'erreur pour que la file puisse réessayer. */
export async function envoyerNotification(params: {
  destinataire: string;
  contenu: ContenuNotification;
}) {
  const reponse = await client().emails.send({
    from: EXPEDITEUR,
    to: params.destinataire,
    subject: params.contenu.sujet,
    text: params.contenu.texte,
  });

  if (reponse.error) {
    throw new Error(reponse.error.message);
  }

  return reponse.data?.id ?? null;
}
