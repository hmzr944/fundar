/**
 * Registre des grèves réellement survenues.
 *
 * C'est la tête de pont commerciale (voir docs/POSITIONNEMENT.md) : une
 * grève est un événement daté, massif et public, dont la quasi-totalité des
 * victimes croit à tort n'avoir droit à rien.
 *
 * VOLONTAIREMENT VIDE. Chaque entrée doit être ajoutée à la main, après
 * vérification, avec sa source de presse. Une grève inventée ou mal datée
 * produirait des pages qui affirment à des milliers de personnes qu'elles
 * ont droit à une indemnisation — sans qu'aucune ne l'ait.
 *
 * Tant que ce registre est vide, aucune page /greve/... n'est générée.
 */

/**
 * Qui a cessé le travail. C'est la seule donnée qui décide de
 * l'indemnisation, et c'est celle que les passagers ignorent.
 *
 * La CJUE a jugé qu'une grève du personnel de la compagnie — y compris
 * suivie et annoncée par un syndicat — relève de la gestion normale de
 * l'entreprise et n'exonère donc pas le transporteur. Une grève externe
 * (contrôle aérien, personnel d'aéroport tiers) est en revanche
 * généralement retenue comme circonstance extraordinaire.
 */
export type OrigineGreve =
  | "PERSONNEL_COMPAGNIE"
  | "CONTROLE_AERIEN"
  | "PERSONNEL_AEROPORT"
  | "AUTRE";

export interface Greve {
  slug: string;
  /** Intitulé factuel, sans qualificatif. Ex. "Grève des pilotes Air France". */
  titre: string;
  /** Dates incluses, format ISO. Un vol du dernier jour est concerné. */
  dateDebut: string;
  dateFin: string;
  origine: OrigineGreve;
  /** Codes IATA des compagnies touchées. Vide = toutes. */
  compagnies: string[];
  /** Codes IATA des aéroports touchés. Vide = tous. */
  aeroports: string[];
  /** URL de presse ou communiqué. Obligatoire : sans source, pas de page. */
  source: string;
}

export const GREVES: Greve[] = [];

export type PerspectiveIndemnisation = "DUE" | "A_VERIFIER";

/**
 * Ce qu'on peut affirmer publiquement à partir de la seule origine.
 *
 * Deux valeurs seulement, et jamais "NON" : refuser en bloc sur une page
 * SEO dissuaderait des passagers dont le dossier mérite l'examen du
 * moteur. Le verdict définitif reste celui de lib/eligibility.
 */
export function perspectiveIndemnisation(
  origine: OrigineGreve
): PerspectiveIndemnisation {
  return origine === "PERSONNEL_COMPAGNIE" ? "DUE" : "A_VERIFIER";
}

export function trouverGreve(slug: string): Greve | undefined {
  return GREVES.find((greve) => greve.slug === slug);
}

/** Vrai si le vol tombe dans la fenêtre de la grève, bornes incluses. */
export function volConcerne(greve: Greve, dateVol: string): boolean {
  return dateVol >= greve.dateDebut && dateVol <= greve.dateFin;
}

/**
 * Grèves encore réclamables, de la plus récente à la plus ancienne.
 *
 * Le délai retenu est le plus court d'Europe (Belgique, 1 an) : mieux vaut
 * retirer trop tôt une page dont la moitié des visiteurs serait prescrite
 * que d'en garder une qui promet un droit éteint.
 */
export function grevesEncoreReclamables(
  aujourdhui: Date = new Date(),
  greves: Greve[] = GREVES
): Greve[] {
  const limite = new Date(aujourdhui);
  limite.setUTCFullYear(limite.getUTCFullYear() - 1);
  const borne = limite.toISOString().slice(0, 10);

  return greves
    .filter((greve) => greve.dateFin >= borne)
    .sort((a, b) => b.dateDebut.localeCompare(a.dateDebut));
}
