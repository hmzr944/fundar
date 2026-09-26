/** Plain-French wording of the success fee, shared by the pages and the dossier. */
export type FeeTerms = { ratePct: number; minCents: number; maxCents: number; flatCents: number };

export const eurosShort = (cents: number) => (cents / 100).toFixed(cents % 100 ? 2 : 0).replace(".", ",");

export function describeFee(fee: FeeTerms) {
  return `${fee.ratePct} % de ce que vous récupérez (entre ${eurosShort(fee.minCents)} et ${eurosShort(fee.maxCents)} €), ou ${eurosShort(fee.flatCents)} € si le résultat n'est pas une somme d'argent`;
}
