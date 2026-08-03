/**
 * Choix des dossiers à relancer pour savoir s'ils ont été payés.
 *
 * Fonction pure, testée : c'est elle qui décide qui reçoit un email, et une
 * erreur ici se traduit par des clients relancés trois fois la même semaine
 * — le reproche exact que nous adressons au reste du secteur.
 */

/** Jours après l'envoi de la réclamation où l'on prend des nouvelles. */
export const JALONS_RELANCE = [30, 60, 120] as const;

/** Jamais deux relances à moins de trois semaines d'intervalle. */
export const ECART_MINIMUM_JOURS = 21;

export interface DossierRelancable {
  id: string;
  reclamationEnvoyeeLe: string | null;
  /** Non nul dès que le dossier est clos, dans un sens ou dans l'autre. */
  recupereLe: string | null;
  paiementDeclareLe: string | null;
  statutDossier: string;
  derniereRelancePaiementLe: string | null;
  nombreRelancesPaiement: number;
}

function joursEntre(depuis: string, jusqua: Date): number {
  const debut = Date.parse(depuis);
  if (Number.isNaN(debut)) return -1;
  return Math.floor((jusqua.getTime() - debut) / 86_400_000);
}

/**
 * Dossiers méritant une relance aujourd'hui.
 *
 * Sont écartés : ceux qui ne sont pas partis, ceux déjà réglés ou refusés,
 * ceux dont le client a déjà déclaré un paiement, ceux relancés trop
 * récemment, et ceux ayant épuisé les jalons — passé le dernier, insister
 * n'apporte plus rien et abîme la relation.
 */
export function dossiersARelancer(
  dossiers: DossierRelancable[],
  aujourdhui: Date = new Date()
): DossierRelancable[] {
  return dossiers.filter((dossier) => {
    if (!dossier.reclamationEnvoyeeLe) return false;
    if (dossier.recupereLe || dossier.paiementDeclareLe) return false;
    if (dossier.statutDossier === "PAYE" || dossier.statutDossier === "REFUSE") {
      return false;
    }
    if (dossier.nombreRelancesPaiement >= JALONS_RELANCE.length) return false;

    if (dossier.derniereRelancePaiementLe) {
      const depuisDerniere = joursEntre(dossier.derniereRelancePaiementLe, aujourdhui);
      if (depuisDerniere < ECART_MINIMUM_JOURS) return false;
    }

    const depuisEnvoi = joursEntre(dossier.reclamationEnvoyeeLe, aujourdhui);
    const jalon = JALONS_RELANCE[dossier.nombreRelancesPaiement];
    return depuisEnvoi >= jalon;
  });
}

/** Jours écoulés depuis l'envoi, pour le corps de l'email. */
export function joursDepuisEnvoi(
  dossier: DossierRelancable,
  aujourdhui: Date = new Date()
): number {
  if (!dossier.reclamationEnvoyeeLe) return 0;
  return Math.max(0, joursEntre(dossier.reclamationEnvoyeeLe, aujourdhui));
}
