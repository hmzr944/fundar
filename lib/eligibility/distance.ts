import { Aeroport } from "./airports";

const RAYON_TERRE_KM = 6371;

function toRad(deg: number): number {
  return (deg * Math.PI) / 180;
}

/** Distance orthodromique (great-circle) entre deux aéroports, en km. */
export function distanceKm(a: Aeroport, b: Aeroport): number {
  const dLat = toRad(b.lat - a.lat);
  const dLon = toRad(b.lon - a.lon);
  const lat1 = toRad(a.lat);
  const lat2 = toRad(b.lat);

  const h =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(lat1) * Math.cos(lat2) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(h), Math.sqrt(1 - h));

  return RAYON_TERRE_KM * c;
}

export type PalierDistance = "COURT" | "MOYEN" | "LONG";

/**
 * Détermine le palier de distance applicable au barème (§3.2 étape 3).
 * Un trajet "intra" (intra-UE ou intra-UK) reste plafonné au palier MOYEN
 * même au-delà de 3500 km (territoires d'outre-mer notamment).
 */
export function palierDistance(km: number, estIntra: boolean): PalierDistance {
  if (km <= 1500) return "COURT";
  if (estIntra) return "MOYEN";
  if (km <= 3500) return "MOYEN";
  return "LONG";
}

export const BAREME: Record<"EUR" | "GBP", Record<PalierDistance, number>> = {
  EUR: { COURT: 250, MOYEN: 400, LONG: 600 },
  GBP: { COURT: 220, MOYEN: 350, LONG: 520 },
};
