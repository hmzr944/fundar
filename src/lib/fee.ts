/** Plain-French wording of the success fee, shared by the pages and the dossier. */
export type FeeTerms = {
  ratePct: number;
  minCents: number;
  maxCents: number;
  flatCents: number;
  /** Rate applied beyond the amount where the first tier reaches maxCents. */
  tier2RatePct: number;
  /** Absolute ceiling on the commission, whatever is recovered. */
  tier2CapCents: number;
};

export const eurosShort = (cents: number) => (cents / 100).toFixed(cents % 100 ? 2 : 0).replace(".", ",");

export function describeFee(fee: FeeTerms) {
  const base = `${fee.ratePct} % de ce que vous récupérez (entre ${eurosShort(fee.minCents)} et ${eurosShort(fee.maxCents)} €)`;
  const beyond =
    fee.tier2CapCents > fee.maxCents
      ? `, puis ${fee.tier2RatePct} % au-delà, sans jamais dépasser ${eurosShort(fee.tier2CapCents)} €`
      : "";
  return `${base}${beyond}, ou ${eurosShort(fee.flatCents)} € si le résultat n'est pas une somme d'argent`;
}
