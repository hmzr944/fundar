/**
 * Contrôle de plausibilité d'un numéro de vol et d'une date de vol.
 *
 * Ces deux champs ne sont pas seulement affichés : ils sont recopiés tels
 * quels dans le mandat signé et dans la lettre adressée à la compagnie.
 * Une saisie absurde acceptée ici ressort en document juridique.
 *
 * Le contrôle reste volontairement large. Il n'est pas là pour deviner si
 * le vol a existé — c'est le rôle du fournisseur de statut — mais pour
 * écarter ce qui ne peut pas être un vol.
 */

/** Aucune réclamation EU261 ne peut porter sur un vol antérieur au règlement. */
export const DATE_MIN_VOL = "2005-02-17";

export interface Verdict {
  valide: boolean;
  message?: string;
}

/**
 * Un numéro de vol IATA : deux ou trois caractères de compagnie, puis un à
 * quatre chiffres, avec un suffixe de lettre facultatif. Espaces tolérés,
 * puisque les cartes d'embarquement les impriment.
 */
export function validerNumeroVol(valeur: string): Verdict {
  const normalise = valeur.trim().toUpperCase().replace(/\s+/g, "");

  if (normalise.length === 0) {
    return { valide: false, message: "Indiquez votre numéro de vol." };
  }
  if (normalise.length > 8) {
    return { valide: false, message: "Ce numéro de vol est trop long." };
  }
  // Préfixe IATA sur deux caractères (AF, U2, 4U) ou code OACI sur trois
  // lettres (TAP). Un préfixe de trois caractères mêlant lettres et chiffres
  // n'existe pas, et l'autoriser laisserait passer "AF12345".
  const forme = normalise.match(/^([A-Z]{3}|[A-Z0-9]{2})(\d{1,4})([A-Z]?)$/);

  // Le préfixe doit contenir au moins une lettre : "1380" seul se découpe
  // en "13" + "80" et passerait pour un numéro de vol.
  if (!forme || !/[A-Z]/.test(forme[1])) {
    return {
      valide: false,
      message:
        "Numéro de vol non reconnu. Il figure sur votre carte d'embarquement, sous la forme AF1380.",
    };
  }
  return { valide: true };
}

export function normaliserNumeroVol(valeur: string): string {
  return valeur.trim().toUpperCase().replace(/\s+/g, "");
}

/**
 * Date de vol : format ISO, réellement existante, ni dans le futur ni
 * antérieure à l'entrée en vigueur du règlement.
 *
 * Le contrôle du futur n'est pas cosmétique : un vol qui n'a pas encore eu
 * lieu ne peut pas avoir été retardé, et le fournisseur de démonstration
 * répondait pourtant par un verdict chiffré.
 */
export function validerDateVol(
  valeur: string,
  aujourdhui: Date = new Date()
): Verdict {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(valeur.trim())) {
    return { valide: false, message: "Indiquez la date de votre vol." };
  }

  const date = new Date(`${valeur}T00:00:00Z`);
  if (Number.isNaN(date.getTime())) {
    return { valide: false, message: "Cette date n'existe pas." };
  }

  // Rejette 2026-02-31, que Date reporterait silencieusement au 3 mars.
  if (date.toISOString().slice(0, 10) !== valeur.trim()) {
    return { valide: false, message: "Cette date n'existe pas." };
  }

  const finDeJournee = new Date(aujourdhui);
  finDeJournee.setUTCHours(23, 59, 59, 999);
  if (date.getTime() > finDeJournee.getTime()) {
    return {
      valide: false,
      message:
        "Ce vol n'a pas encore eu lieu. Revenez une fois qu'il aura été effectué.",
    };
  }

  if (valeur.trim() < DATE_MIN_VOL) {
    return {
      valide: false,
      message:
        "Le règlement européen sur les droits des passagers ne s'applique qu'aux vols du 17 février 2005 et suivants.",
    };
  }

  return { valide: true };
}
