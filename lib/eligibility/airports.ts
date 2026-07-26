/**
 * Base d'aéroports minimale pour la V1.
 * A étendre au fil de l'eau (OpenFlights ou l'API de statut de vol peuvent fournir lat/lon).
 * "region" détermine le champ d'application territorial EU261 / UK261.
 */
export type Region = "EU_EEE_CH" | "UK" | "AUTRE";

export interface Aeroport {
  iata: string;
  nom: string;
  paysCode: string; // ISO 3166-1 alpha-2
  region: Region;
  lat: number;
  lon: number;
}

export const AEROPORTS: Record<string, Aeroport> = {
  CDG: { iata: "CDG", nom: "Paris Charles de Gaulle", paysCode: "FR", region: "EU_EEE_CH", lat: 49.0097, lon: 2.5479 },
  ORY: { iata: "ORY", nom: "Paris Orly", paysCode: "FR", region: "EU_EEE_CH", lat: 48.7233, lon: 2.3794 },
  FRA: { iata: "FRA", nom: "Frankfurt", paysCode: "DE", region: "EU_EEE_CH", lat: 50.0379, lon: 8.5622 },
  MAD: { iata: "MAD", nom: "Madrid Barajas", paysCode: "ES", region: "EU_EEE_CH", lat: 40.4936, lon: -3.5668 },
  BCN: { iata: "BCN", nom: "Barcelona El Prat", paysCode: "ES", region: "EU_EEE_CH", lat: 41.2971, lon: 2.0785 },
  FCO: { iata: "FCO", nom: "Roma Fiumicino", paysCode: "IT", region: "EU_EEE_CH", lat: 41.8003, lon: 12.2389 },
  AMS: { iata: "AMS", nom: "Amsterdam Schiphol", paysCode: "NL", region: "EU_EEE_CH", lat: 52.3105, lon: 4.7683 },
  BRU: { iata: "BRU", nom: "Brussels", paysCode: "BE", region: "EU_EEE_CH", lat: 50.9014, lon: 4.4844 },
  ZRH: { iata: "ZRH", nom: "Zurich", paysCode: "CH", region: "EU_EEE_CH", lat: 47.4647, lon: 8.5492 },
  VIE: { iata: "VIE", nom: "Vienna", paysCode: "AT", region: "EU_EEE_CH", lat: 48.1103, lon: 16.5697 },
  LIS: { iata: "LIS", nom: "Lisbon", paysCode: "PT", region: "EU_EEE_CH", lat: 38.7813, lon: -9.1359 },
  ATH: { iata: "ATH", nom: "Athens", paysCode: "GR", region: "EU_EEE_CH", lat: 37.9364, lon: 23.9445 },
  WAW: { iata: "WAW", nom: "Warsaw Chopin", paysCode: "PL", region: "EU_EEE_CH", lat: 52.1657, lon: 20.9671 },
  CPH: { iata: "CPH", nom: "Copenhagen", paysCode: "DK", region: "EU_EEE_CH", lat: 55.6180, lon: 12.6560 },
  DUB: { iata: "DUB", nom: "Dublin", paysCode: "IE", region: "EU_EEE_CH", lat: 53.4264, lon: -6.2499 },
  RUN: { iata: "RUN", nom: "La Réunion Roland Garros", paysCode: "FR", region: "EU_EEE_CH", lat: -20.8871, lon: 55.5103 },
  IST: { iata: "IST", nom: "Istanbul Airport", paysCode: "TR", region: "AUTRE", lat: 41.2753, lon: 28.7519 },
  LHR: { iata: "LHR", nom: "London Heathrow", paysCode: "GB", region: "UK", lat: 51.4700, lon: -0.4543 },
  LGW: { iata: "LGW", nom: "London Gatwick", paysCode: "GB", region: "UK", lat: 51.1537, lon: -0.1821 },
  MAN: { iata: "MAN", nom: "Manchester", paysCode: "GB", region: "UK", lat: 53.3537, lon: -2.2750 },
  EDI: { iata: "EDI", nom: "Edinburgh", paysCode: "GB", region: "UK", lat: 55.9500, lon: -3.3725 },
  JFK: { iata: "JFK", nom: "New York JFK", paysCode: "US", region: "AUTRE", lat: 40.6413, lon: -73.7781 },
  LAX: { iata: "LAX", nom: "Los Angeles", paysCode: "US", region: "AUTRE", lat: 33.9416, lon: -118.4085 },
  DXB: { iata: "DXB", nom: "Dubai", paysCode: "AE", region: "AUTRE", lat: 25.2532, lon: 55.3657 },
  BKK: { iata: "BKK", nom: "Bangkok Suvarnabhumi", paysCode: "TH", region: "AUTRE", lat: 13.6900, lon: 100.7501 },
  SIN: { iata: "SIN", nom: "Singapore Changi", paysCode: "SG", region: "AUTRE", lat: 1.3644, lon: 103.9915 },
  GIG: { iata: "GIG", nom: "Rio de Janeiro Galeão", paysCode: "BR", region: "AUTRE", lat: -22.8100, lon: -43.2506 },
  YUL: { iata: "YUL", nom: "Montreal Trudeau", paysCode: "CA", region: "AUTRE", lat: 45.4706, lon: -73.7408 },
};

export function getAeroport(iata: string): Aeroport | undefined {
  return AEROPORTS[iata.toUpperCase()];
}
