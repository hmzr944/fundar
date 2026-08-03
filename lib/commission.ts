/**
 * Ce que le passager garde réellement, chez nous et ailleurs.
 *
 * C'est le geste Wise : plutôt que d'affirmer « moins cher », on publie le
 * calcul et on laisse le client conclure. Un pourcentage est abstrait ;
 * « vous gardez 468 € au lieu de 390 € » ne l'est pas.
 *
 * Deux règles à ne jamais assouplir ici :
 *   - on ne compare que des taux publics et vérifiables, datés ;
 *   - on affiche le taux le PLUS FAVORABLE du concurrent, jamais son taux
 *     aggravé. AirHelp monte à 50 % en contentieux : le mentionner en note
 *     est honnête, le prendre comme base de comparaison ne le serait pas.
 */

/**
 * Date de dernier relevé des taux concurrents. À rafraîchir avant toute
 * publication : une comparaison périmée est une comparaison fausse, et
 * c'est exactement le reproche qu'on adresse au secteur.
 */
export const TAUX_CONCURRENTS_RELEVES_LE = "2026-08-03";

export interface OffreComparee {
  nom: string;
  taux: number;
  /** Précision affichée sous le nom. Vide si le taux est inconditionnel. */
  note?: string;
}

export const CONCURRENTS: OffreComparee[] = [
  { nom: "AirHelp", taux: 0.35, note: "jusqu'à 50 % en cas de contentieux" },
  { nom: "Flightright", taux: 0.36, note: "TTC, majoration avocat incluse" },
];

export interface Part {
  commission: number;
  net: number;
}

/** Arrondi au centime, pour que commission + net retombe sur le montant. */
export function repartir(montant: number, taux: number): Part {
  const commission = Math.round(montant * taux * 100) / 100;
  return { commission, net: Math.round((montant - commission) * 100) / 100 };
}

export interface LigneComparaison {
  nom: string;
  taux: number;
  note?: string;
  net: number;
  /** Écart en faveur du client par rapport à cette offre. Positif = on est moins cher. */
  ecart: number;
}

/**
 * Construit le tableau comparatif pour un montant donné.
 *
 * Renvoie une liste vide si notre taux n'est pas le meilleur : afficher un
 * comparatif qui nous dessert n'aurait aucun sens, mais le fabriquer quand
 * même — plutôt que de masquer le cas — évite qu'un changement de tarif
 * produise silencieusement un argumentaire mensonger.
 */
export function comparer(
  montant: number,
  notreTaux: number,
  concurrents: OffreComparee[] = CONCURRENTS
): LigneComparaison[] {
  const nous = repartir(montant, notreTaux);

  return concurrents
    .filter((offre) => offre.taux > notreTaux)
    .map((offre) => {
      const eux = repartir(montant, offre.taux);
      return {
        nom: offre.nom,
        taux: offre.taux,
        note: offre.note,
        net: eux.net,
        ecart: Math.round((nous.net - eux.net) * 100) / 100,
      };
    })
    .sort((a, b) => b.ecart - a.ecart);
}
