/**
 * Délais de prescription indicatifs par juridiction (§3.2 étape 5).
 *
 * VALEURS INDICATIVES — À FAIRE VALIDER PAR UN JURISTE AVANT MISE EN PROD.
 * L'Allemagne décompte le délai à partir de la FIN DE L'ANNÉE CIVILE du vol,
 * pas de la date du vol elle-même.
 */
export type CodeJuridiction =
  | "GB_ENG_WALES"
  | "GB_SCOT"
  | "FR"
  | "ES"
  | "DE"
  | "IT"
  | "NL"
  | "BE";

export interface ReglePrescription {
  delaiAns: number;
  decompteFinAnneeCivile?: boolean;
}

export const PRESCRIPTION: Record<CodeJuridiction, ReglePrescription> = {
  GB_ENG_WALES: { delaiAns: 6 },
  GB_SCOT: { delaiAns: 5 },
  FR: { delaiAns: 5 },
  ES: { delaiAns: 5 },
  DE: { delaiAns: 3, decompteFinAnneeCivile: true },
  IT: { delaiAns: 2 },
  NL: { delaiAns: 2 },
  BE: { delaiAns: 1 },
};

/** Aéroports écossais connus, pour distinguer GB_SCOT de GB_ENG_WALES. */
const AEROPORTS_ECOSSE = new Set(["EDI", "GLA", "ABZ", "INV", "PIK"]);

const PAYS_VERS_JURIDICTION: Record<string, CodeJuridiction> = {
  FR: "FR",
  ES: "ES",
  DE: "DE",
  IT: "IT",
  NL: "NL",
  BE: "BE",
};

export function resoudreJuridiction(
  paysCode: string,
  aeroportIata?: string
): CodeJuridiction | undefined {
  if (paysCode === "GB") {
    if (aeroportIata && AEROPORTS_ECOSSE.has(aeroportIata.toUpperCase())) {
      return "GB_SCOT";
    }
    return "GB_ENG_WALES";
  }
  return PAYS_VERS_JURIDICTION[paysCode];
}

/**
 * Dernier jour pour agir, ou null si la juridiction n'est pas connue.
 *
 * Exposée séparément parce qu'elle n'intéresse pas que le refus : entre
 * « réclamable » et « prescrit » il y a une information que le passager n'a
 * nulle part ailleurs, et qui est souvent la vraie raison d'agir maintenant
 * plutôt que dans six mois.
 */
export function dateLimiteReclamation(
  juridiction: CodeJuridiction | undefined,
  dateVol: Date
): Date | null {
  if (!juridiction) return null;
  const regle = PRESCRIPTION[juridiction];

  // L'Allemagne fait courir le délai depuis la fin de l'année civile du
  // vol : un vol de janvier y gagne presque douze mois de plus qu'un vol
  // de décembre de la même année.
  const pointDepart = regle.decompteFinAnneeCivile
    ? new Date(Date.UTC(dateVol.getUTCFullYear(), 11, 31, 23, 59, 59))
    : dateVol;

  const limite = new Date(pointDepart);
  limite.setUTCFullYear(limite.getUTCFullYear() + regle.delaiAns);
  return limite;
}

/**
 * Indique si la date de vérification tombe hors du délai de prescription
 * applicable. Une juridiction inconnue ne bloque pas le dossier : on ne
 * peut pas affirmer une prescription qu'on ne sait pas calculer.
 */
export function estPrescrit(
  juridiction: CodeJuridiction | undefined,
  dateVol: Date,
  dateVerification: Date
): boolean {
  const limite = dateLimiteReclamation(juridiction, dateVol);
  if (!limite) return false;
  return dateVerification.getTime() > limite.getTime();
}

/**
 * Jours restants avant prescription. Négatif si le délai est dépassé,
 * null si la juridiction est inconnue.
 */
export function joursAvantPrescription(
  juridiction: CodeJuridiction | undefined,
  dateVol: Date,
  dateVerification: Date
): number | null {
  const limite = dateLimiteReclamation(juridiction, dateVol);
  if (!limite) return null;
  return Math.floor(
    (limite.getTime() - dateVerification.getTime()) / 86_400_000
  );
}
