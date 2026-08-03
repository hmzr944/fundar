import { ResultatVerification } from "./types";

/**
 * D'où viennent les faits sur lesquels le verdict est rendu.
 *
 * AUTOMATIQUE : le fournisseur de statut de vol a confirmé la perturbation.
 * DECLARATIF  : c'est le passager qui l'affirme, sans confirmation externe.
 *
 * La distinction n'est pas cosmétique. Les bases publiques de statut de vol
 * ne remontent que quelques mois, alors qu'une réclamation EU261 se prescrit
 * en un à six ans selon la juridiction : la majorité des dossiers légitimes
 * porte donc sur des vols que l'API ne connaît plus. Refuser ces passagers
 * reviendrait à ne servir que la petite minorité qui réclame tout de suite.
 */
export type SourceVerification = "AUTOMATIQUE" | "DECLARATIF";

const EXPLICATION_NON_VERIFIE =
  "Cette estimation repose sur ce que vous nous avez indiqué : nous n'avons " +
  "pas pu confirmer ce vol auprès des bases publiques, qui ne remontent que " +
  "quelques mois. Un humain vérifiera vos justificatifs avant tout envoi à " +
  "la compagnie, et nous vous dirons franchement si le dossier ne tient pas.";

/**
 * Empêche un verdict déclaratif de s'afficher comme une certitude.
 *
 * Seul ELIGIBLE est dégradé, et uniquement vers REVIEW_MANUEL : c'est le
 * seul statut qui promette quelque chose. Un INELIGIBLE reste INELIGIBLE
 * — ne rien promettre sur des données non vérifiées n'engage personne, et
 * transformer un refus en « à vérifier » ferait espérer inutilement.
 *
 * Le montant est conservé : il reste utile au passager pour décider s'il
 * vaut la peine de rassembler ses justificatifs. Il est simplement présenté
 * comme une estimation, ce qu'il est.
 */
export function ajusterSelonSource(
  resultat: ResultatVerification,
  source: SourceVerification
): ResultatVerification {
  if (source === "AUTOMATIQUE" || resultat.statut !== "ELIGIBLE") {
    return resultat;
  }

  return {
    ...resultat,
    statut: "REVIEW_MANUEL",
    motif: "REVIEW_DECLARATIF_NON_VERIFIE",
    explication: `${resultat.explication} ${EXPLICATION_NON_VERIFIE}`,
  };
}

/**
 * Code IATA de la compagnie déduit du numéro de vol ("AF1380" -> "AF").
 *
 * Utilisé uniquement dans le parcours déclaratif, où l'API n'a pas pu nous
 * donner la compagnie. Rend null plutôt qu'un code douteux : les numéros à
 * préfixe numérique (ex. "4U", "2L") existent, mais un préfixe purement
 * numérique n'est jamais un code compagnie exploitable ici.
 */
export function codeCompagnieDepuisNumeroVol(
  numeroVol: string
): string | null {
  const normalise = numeroVol.trim().toUpperCase().replace(/\s+/g, "");
  const correspondance = normalise.match(/^([A-Z0-9]{2,3}?)\s*\d{1,4}[A-Z]?$/);
  if (!correspondance) return null;

  const code = correspondance[1];
  // Un préfixe entièrement numérique signifie qu'on a mal découpé.
  if (!/[A-Z]/.test(code)) return null;

  return code;
}
