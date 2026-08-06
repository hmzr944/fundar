/**
 * Passagers d'un dossier.
 *
 * L'indemnisation EU261 est due PAR PASSAGER : une famille de quatre sur
 * un Paris–New York vaut 2 400 € et non 600. Le moteur d'éligibilité
 * continue de répondre pour une personne — la multiplication vit ici,
 * pour que la règle de droit et la règle commerciale restent séparées et
 * testables indépendamment.
 */
export interface Passager {
  nom: string;
  prenom: string;
}

/**
 * Au-delà de neuf, une compagnie traite la demande comme un dossier de
 * groupe et exige une procédure distincte. Mieux vaut refuser que
 * d'envoyer un dossier qui sera rejeté en bloc.
 */
export const MAX_PASSAGERS = 9;

export interface VerdictPassagers {
  valide: boolean;
  message?: string;
}

function cle(p: Passager): string {
  return `${p.prenom.trim().toLowerCase()}|${p.nom.trim().toLowerCase()}`;
}

export function validerPassagers(liste: Passager[]): VerdictPassagers {
  if (liste.length === 0) {
    return { valide: false, message: "Indiquez au moins un passager." };
  }
  if (liste.length > MAX_PASSAGERS) {
    return {
      valide: false,
      message: `Au-delà de ${MAX_PASSAGERS} passagers, écrivez-nous : la compagnie exige une procédure de groupe.`,
    };
  }
  for (const p of liste) {
    if (!p.nom.trim() || !p.prenom.trim()) {
      return {
        valide: false,
        message: "Chaque passager a besoin d'un nom et d'un prénom.",
      };
    }
  }

  // Un doublon fait réclamer deux fois pour la même personne, et la
  // compagnie rejette alors le dossier entier — pas seulement la ligne
  // en double.
  const cles = liste.map(cle);
  if (new Set(cles).size !== cles.length) {
    return {
      valide: false,
      message:
        "Un passager apparaît deux fois. La compagnie rejetterait le dossier entier.",
    };
  }

  return { valide: true };
}

/**
 * Total réclamé pour le dossier.
 *
 * Un montant unitaire absent — dossier en revue manuelle — reste absent :
 * le multiplier afficherait « 0 € » au client là où la vérité est
 * « nous ne savons pas encore ».
 */
export function montantTotal(
  montantUnitaire: number | null,
  nombre: number
): number | null {
  if (montantUnitaire === null) return null;
  const n = Number.isFinite(nombre) && nombre > 0 ? Math.floor(nombre) : 1;
  return montantUnitaire * n;
}
