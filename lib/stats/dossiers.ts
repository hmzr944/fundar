/**
 * Statistiques de comportement des compagnies.
 *
 * Fonctions pures, calculées à partir des dossiers réels. Elles servent
 * deux usages qui n'ont pas les mêmes exigences :
 *
 *   - le tableau de bord interne, où toute donnée est bonne à voir, même
 *     sur trois dossiers ;
 *   - l'affichage public au moment du verdict ("sur nos dossiers Ryanair,
 *     8 sur 10 sont refusés en première réponse"), où publier un taux
 *     calculé sur trois dossiers serait un mensonge présenté comme un
 *     chiffre. D'où `publiable`, qui ne dépend que de l'effectif.
 */

export const EFFECTIF_MIN_POUR_PUBLIER = 10;

export type NatureReponse =
  | "ACCUSE_RECEPTION"
  | "DEMANDE_INFO"
  | "REFUS"
  | "BON_ACHAT"
  | "PAIEMENT_ANNONCE";

export interface DossierMesure {
  compagnie: string;
  /** Null tant que la réclamation n'est pas réellement partie. */
  reclamationEnvoyeeLe: string | null;
  premiereReponseLe: string | null;
  premiereReponseNature: NatureReponse | null;
  recupereLe: string | null;
  montantRecupere: number | null;
}

export interface StatistiquesCompagnie {
  compagnie: string;
  /** Dossiers réellement transmis : les autres ne mesurent rien. */
  effectif: number;
  /** Dossiers transmis ayant reçu au moins une réponse. */
  nombreReponses: number;
  nombreRefusPremiereReponse: number;
  nombrePayes: number;
  /** Null tant qu'aucune réponse n'est enregistrée. */
  tauxRefusPremiereReponse: number | null;
  tauxPaiement: number | null;
  delaiMedianPremiereReponse: number | null;
  delaiMedianPaiement: number | null;
  /** Faux tant que l'effectif ne permet pas d'annoncer un taux au public. */
  publiable: boolean;
}

/** Différence en jours entiers, ou null si l'une des deux dates manque. */
export function joursEntre(
  debut: string | null,
  fin: string | null
): number | null {
  if (!debut || !fin) return null;
  const d = Date.parse(debut);
  const f = Date.parse(fin);
  if (Number.isNaN(d) || Number.isNaN(f)) return null;
  return Math.round((f - d) / 86_400_000);
}

/**
 * Médiane, et non moyenne : sur de petits volumes, un seul dossier traité
 * six mois plus tard suffit à rendre une moyenne absurde.
 */
export function mediane(valeurs: number[]): number | null {
  const tries = valeurs.filter((v) => Number.isFinite(v)).sort((a, b) => a - b);
  if (tries.length === 0) return null;
  const milieu = Math.floor(tries.length / 2);
  return tries.length % 2 === 1
    ? tries[milieu]
    : Math.round((tries[milieu - 1] + tries[milieu]) / 2);
}

/**
 * Un bon d'achat compte comme un refus d'indemnisation.
 *
 * C'est le point le moins intuitif de tout ce module. Une compagnie qui
 * propose un voucher n'a pas accepté la réclamation : elle a proposé autre
 * chose, souvent d'une valeur inférieure, et l'accepter peut éteindre la
 * créance en espèces. Le compter comme une réponse positive donnerait un
 * taux de succès flatteur et faux.
 */
export function estRefusDIndemnisation(nature: NatureReponse | null): boolean {
  return nature === "REFUS" || nature === "BON_ACHAT";
}

export function statistiquesParCompagnie(
  dossiers: DossierMesure[]
): StatistiquesCompagnie[] {
  const parCompagnie = new Map<string, DossierMesure[]>();

  for (const dossier of dossiers) {
    // Un dossier jamais transmis ne dit rien du comportement de la
    // compagnie : il dit seulement que nous ne l'avons pas envoyé.
    if (!dossier.reclamationEnvoyeeLe) continue;
    const cle = dossier.compagnie.toUpperCase();
    const liste = parCompagnie.get(cle);
    if (liste) liste.push(dossier);
    else parCompagnie.set(cle, [dossier]);
  }

  const resultats: StatistiquesCompagnie[] = [];

  for (const [compagnie, liste] of parCompagnie) {
    const avecReponse = liste.filter((d) => d.premiereReponseNature !== null);
    const refus = avecReponse.filter((d) =>
      estRefusDIndemnisation(d.premiereReponseNature)
    );
    const payes = liste.filter((d) => d.recupereLe !== null);

    const delaisReponse = avecReponse
      .map((d) => joursEntre(d.reclamationEnvoyeeLe, d.premiereReponseLe))
      .filter((v): v is number => v !== null);

    const delaisPaiement = payes
      .map((d) => joursEntre(d.reclamationEnvoyeeLe, d.recupereLe))
      .filter((v): v is number => v !== null);

    resultats.push({
      compagnie,
      effectif: liste.length,
      nombreReponses: avecReponse.length,
      nombreRefusPremiereReponse: refus.length,
      nombrePayes: payes.length,
      tauxRefusPremiereReponse:
        avecReponse.length > 0 ? refus.length / avecReponse.length : null,
      tauxPaiement: liste.length > 0 ? payes.length / liste.length : null,
      delaiMedianPremiereReponse: mediane(delaisReponse),
      delaiMedianPaiement: mediane(delaisPaiement),
      publiable: liste.length >= EFFECTIF_MIN_POUR_PUBLIER,
    });
  }

  // Les compagnies les plus documentées d'abord : ce sont celles sur
  // lesquelles on peut décider quelque chose.
  return resultats.sort((a, b) => b.effectif - a.effectif);
}

export interface StatistiquesGlobales {
  dossiersTransmis: number;
  enAttenteDeReponse: number;
  refusesEnPremiereReponse: number;
  payes: number;
  delaiMedianPaiement: number | null;
  montantTotalRecupere: number;
  commissionTotale: number;
}

export function statistiquesGlobales(
  dossiers: DossierMesure[],
  tauxCommission: number
): StatistiquesGlobales {
  const transmis = dossiers.filter((d) => d.reclamationEnvoyeeLe !== null);
  const payes = transmis.filter((d) => d.recupereLe !== null);

  const montantTotalRecupere = payes.reduce(
    (total, d) => total + (d.montantRecupere ?? 0),
    0
  );

  return {
    dossiersTransmis: transmis.length,
    enAttenteDeReponse: transmis.filter((d) => d.premiereReponseNature === null)
      .length,
    refusesEnPremiereReponse: transmis.filter((d) =>
      estRefusDIndemnisation(d.premiereReponseNature)
    ).length,
    payes: payes.length,
    delaiMedianPaiement: mediane(
      payes
        .map((d) => joursEntre(d.reclamationEnvoyeeLe, d.recupereLe))
        .filter((v): v is number => v !== null)
    ),
    montantTotalRecupere: Math.round(montantTotalRecupere * 100) / 100,
    commissionTotale:
      Math.round(montantTotalRecupere * tauxCommission * 100) / 100,
  };
}
