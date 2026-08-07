/**
 * Étape franchie par un dossier, de 0 à 3.
 *
 * Cette fonction vivait dans FriseDossier.tsx, qui porte « use client ».
 * Un composant serveur qui importe depuis un module client ne reçoit pas
 * les fonctions mais des références client — des objets. Le tableau de
 * bord plantait donc à l'affichage sur « etapeDuDossier is not a
 * function », alors que le typecheck et le build passaient : la page est
 * dynamique et protégée, donc jamais rendue à la compilation.
 *
 * Le calcul n'a besoin ni du navigateur ni de React. Il vit ici, sans
 * directive, et les deux côtés peuvent l'importer.
 */
export interface EtatDossier {
  statut_dossier: string;
  reclamation_envoyee_le: string | null;
  montant_recupere: number | null;
}

export function etapeDuDossier(dossier: EtatDossier): number {
  if (dossier.statut_dossier === "PAYE" || dossier.montant_recupere !== null) {
    return 3;
  }
  if (dossier.reclamation_envoyee_le) return 2;
  // Un dossier n'existe pas sans justificatif : la deuxième étape est
  // franchie dès sa création.
  return 1;
}
