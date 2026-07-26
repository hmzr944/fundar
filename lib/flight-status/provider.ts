export interface FlightStatusQuery {
  numeroVol: string;
  /** ISO 8601 (YYYY-MM-DD). */
  dateVol: string;
}

export type StatutVol =
  | "PROGRAMME"
  | "ACTIF"
  | "ATTERRI"
  | "ANNULE"
  | "DEROUTE"
  | "INCONNU";

export interface FlightStatusResult {
  trouve: boolean;
  numeroVol: string;
  dateVol: string;
  compagnie: string | null; // code IATA
  aeroportDepart: string | null; // code IATA
  aeroportArrivee: string | null; // code IATA
  statut: StatutVol;
  /** Retard à l'ARRIVEE, en minutes. null si non déterminable. */
  retardArriveeMinutes: number | null;
}

/**
 * Interface à respecter par tout fournisseur de statut de vol.
 * Objectif : pouvoir changer de fournisseur (AviationStack, FlightAware
 * AeroAPI, OAG...) en une journée quand le quota gratuit explose, sans
 * toucher au reste du produit.
 */
export interface FlightStatusProvider {
  recupererStatut(query: FlightStatusQuery): Promise<FlightStatusResult>;
}
