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

/**
 * The commission for a given result, in cents: ratePct bounded to
 * [minCents, maxCents], then tier2RatePct beyond the amount where the first
 * tier reaches maxCents, capped at tier2CapCents. flatCents for a result with
 * no money involved (a cancellation obtained, a service back).
 */
export function feeFor(fee: FeeTerms, recoveredCents: number) {
  if (recoveredCents <= 0) return fee.flatCents;
  const tier1ThresholdCents = Math.ceil((fee.maxCents * 100) / fee.ratePct);
  if (recoveredCents <= tier1ThresholdCents) {
    const share = Math.round((recoveredCents * fee.ratePct) / 100);
    return Math.min(fee.maxCents, Math.max(fee.minCents, share));
  }
  const beyond = Math.round(((recoveredCents - tier1ThresholdCents) * fee.tier2RatePct) / 100);
  return Math.min(fee.tier2CapCents, fee.maxCents + beyond);
}

/** The commission after the "Atlas Plus" discount, never below 1 €. */
export function discountedFee(feeCents: number, discountPct: number) {
  return Math.max(100, Math.round((feeCents * (100 - discountPct)) / 100));
}
