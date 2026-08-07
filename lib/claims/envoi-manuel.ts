import type { ContactCompagnie, ModeEnvoi } from "@/config/airline-contacts";

/**
 * Enregistrement d'une réclamation transmise à la main.
 *
 * Trois compagnies sur trois n'acceptent aujourd'hui que leur formulaire
 * web : aucun dossier ne peut donc partir automatiquement. Jusqu'ici rien
 * ne permettait de dire au système qu'on l'avait fait soi-même — le
 * dossier restait « Soumis » à vie, le client n'était jamais prévenu, et
 * le cron de relance, qui exige une date d'envoi, ne se déclenchait
 * jamais. Toute la chaîne aval était morte.
 *
 * La date saisie n'est pas un détail d'affichage : elle démarre le
 * calendrier des relances et alimente les délais mesurés par compagnie,
 * qui sont la seule preuve publiable que le service vaut sa commission.
 * Elle est donc bornée des deux côtés.
 */
export interface VerdictDate {
  valide: boolean;
  message?: string;
}

export function validerDateEnvoi({
  envoyeLe,
  creeLe,
  maintenant,
}: {
  /** Date saisie, au format AAAA-MM-JJ. */
  envoyeLe: string;
  /** Création du dossier, ISO. */
  creeLe: string;
  maintenant: Date;
}): VerdictDate {
  if (!envoyeLe) {
    return { valide: false, message: "Indiquez la date d'envoi." };
  }

  const date = new Date(envoyeLe);
  if (Number.isNaN(date.getTime())) {
    return { valide: false, message: "Cette date n'est pas lisible." };
  }

  // Fin de journée : une date saisie « aujourd'hui » ne doit pas être
  // refusée parce qu'elle vaut minuit et qu'il est midi.
  const finDeJournee = new Date(date);
  finDeJournee.setUTCHours(23, 59, 59, 999);

  if (finDeJournee.getTime() > maintenant.getTime() + 24 * 3600 * 1000) {
    return {
      valide: false,
      message: "Cette date est à venir. Un envoi ne se déclare pas d'avance.",
    };
  }

  const creation = new Date(creeLe);
  if (!Number.isNaN(creation.getTime()) && finDeJournee.getTime() < creation.getTime()) {
    return {
      valide: false,
      message: "Cette date est avant la création du dossier.",
    };
  }

  return { valide: true };
}

/**
 * Coordonnée à consigner dans la trace d'envoi.
 *
 * Sans destinataire, la ligne ne prouve rien : elle dirait « envoyé
 * quelque part », ce qui est pire qu'une absence de ligne le jour où il
 * faut démontrer qu'on a bien réclamé.
 */
export function destinataireEnregistrable(
  contact: ContactCompagnie | undefined
): { mode: ModeEnvoi; destinataire: string } | null {
  if (!contact) return null;

  const destinataire =
    contact.mode === "EMAIL"
      ? contact.email
      : contact.mode === "COURRIER"
        ? contact.adressePostale
        : contact.urlFormulaire;

  if (!destinataire) return null;

  return { mode: contact.mode, destinataire };
}
