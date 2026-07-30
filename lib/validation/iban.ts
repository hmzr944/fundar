/**
 * Validation d'IBAN.
 *
 * Enjeu concret : l'IBAN est recopié tel quel dans le mandat, et c'est le
 * compte sur lequel la compagnie versera l'indemnisation. Une faute de
 * frappe n'est découverte qu'au moment du virement, soit potentiellement
 * plusieurs mois après la signature. La clé de contrôle mod-97 détecte
 * l'immense majorité des erreurs de saisie et ne coûte rien.
 */

/** Longueurs officielles par pays (SEPA + quelques pays fréquents). */
const LONGUEURS: Record<string, number> = {
  AD: 24, AE: 23, AL: 28, AT: 20, AZ: 28,
  BA: 20, BE: 16, BG: 22, BH: 22, BR: 29,
  CH: 21, CR: 22, CY: 28, CZ: 24,
  DE: 22, DK: 18, DO: 28,
  EE: 20, EG: 29, ES: 24,
  FI: 18, FO: 18, FR: 27,
  GB: 22, GE: 22, GI: 23, GL: 18, GR: 27, GT: 28,
  HR: 21, HU: 28,
  IE: 22, IL: 23, IS: 26, IT: 27,
  JO: 30,
  KW: 30, KZ: 20,
  LB: 28, LC: 32, LI: 21, LT: 20, LU: 20, LV: 21,
  MC: 27, MD: 24, ME: 22, MK: 19, MR: 27, MT: 31, MU: 30,
  NL: 18, NO: 15,
  PK: 24, PL: 28, PS: 29, PT: 25,
  QA: 29,
  RO: 24, RS: 22,
  SA: 24, SE: 24, SI: 19, SK: 24, SM: 27, SV: 28,
  TL: 23, TN: 24, TR: 26,
  UA: 29,
  VA: 22, VG: 24,
  XK: 20,
};

export type ErreurIban =
  | "VIDE"
  | "FORMAT"
  | "PAYS_INCONNU"
  | "LONGUEUR"
  | "CLE_INVALIDE";

export interface ResultatIban {
  valide: boolean;
  /** IBAN normalisé (majuscules, sans espaces), utilisable pour stockage. */
  normalise: string;
  erreur?: ErreurIban;
  /** Message prêt à afficher à l'utilisateur. */
  message?: string;
}

const MESSAGES: Record<ErreurIban, string> = {
  VIDE: "Renseignez votre IBAN.",
  FORMAT:
    "Cet IBAN n'a pas un format valide. Il commence par deux lettres de pays, puis deux chiffres.",
  PAYS_INCONNU: "Le code pays de cet IBAN n'est pas reconnu.",
  LONGUEUR: "Cet IBAN n'a pas la longueur attendue pour ce pays.",
  CLE_INVALIDE:
    "Cet IBAN semble comporter une erreur de saisie. Vérifiez chaque caractère.",
};

/** Supprime espaces et séparateurs, passe en majuscules. */
export function normaliserIban(valeur: string): string {
  return valeur.replace(/[\s.-]/g, "").toUpperCase();
}

/**
 * Calcule la clé de contrôle mod-97 (norme ISO 13616 / ISO 7064).
 * Les 4 premiers caractères passent à la fin, les lettres deviennent des
 * nombres (A=10 ... Z=35), et le reste modulo 97 doit valoir 1.
 */
function cleMod97Valide(iban: string): boolean {
  const reorganise = iban.slice(4) + iban.slice(0, 4);

  let reste = 0;
  for (const caractere of reorganise) {
    const code = caractere.charCodeAt(0);
    let morceau: string;

    if (code >= 48 && code <= 57) {
      morceau = caractere; // chiffre
    } else if (code >= 65 && code <= 90) {
      morceau = String(code - 55); // A=10 ... Z=35
    } else {
      return false;
    }

    // Calcul progressif : évite de manipuler un entier de 30+ chiffres.
    for (const chiffre of morceau) {
      reste = (reste * 10 + Number(chiffre)) % 97;
    }
  }

  return reste === 1;
}

export function validerIban(valeur: string | null | undefined): ResultatIban {
  const normalise = normaliserIban(valeur ?? "");

  if (normalise.length === 0) {
    return { valide: false, normalise, erreur: "VIDE", message: MESSAGES.VIDE };
  }

  if (!/^[A-Z]{2}[0-9]{2}[A-Z0-9]+$/.test(normalise)) {
    return { valide: false, normalise, erreur: "FORMAT", message: MESSAGES.FORMAT };
  }

  const pays = normalise.slice(0, 2);
  const longueurAttendue = LONGUEURS[pays];

  if (!longueurAttendue) {
    return {
      valide: false,
      normalise,
      erreur: "PAYS_INCONNU",
      message: MESSAGES.PAYS_INCONNU,
    };
  }

  if (normalise.length !== longueurAttendue) {
    return {
      valide: false,
      normalise,
      erreur: "LONGUEUR",
      message: MESSAGES.LONGUEUR,
    };
  }

  if (!cleMod97Valide(normalise)) {
    return {
      valide: false,
      normalise,
      erreur: "CLE_INVALIDE",
      message: MESSAGES.CLE_INVALIDE,
    };
  }

  return { valide: true, normalise };
}

/** Formate par groupes de 4 pour la lecture (affichage uniquement). */
export function formaterIban(valeur: string): string {
  return normaliserIban(valeur).replace(/(.{4})/g, "$1 ").trim();
}
