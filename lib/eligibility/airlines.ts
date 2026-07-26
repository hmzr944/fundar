/**
 * Registre minimal des compagnies aériennes pour la V1.
 * "immatriculeeUeUk" conditionne l'éligibilité étape 1 quand seul
 * l'aéroport d'arrivée est en UE/EEE/Suisse/UK.
 */
export interface Compagnie {
  code: string; // code IATA, ex: "AF"
  nom: string;
  immatriculeeUeUk: boolean;
}

export const COMPAGNIES: Record<string, Compagnie> = {
  AF: { code: "AF", nom: "Air France", immatriculeeUeUk: true },
  LH: { code: "LH", nom: "Lufthansa", immatriculeeUeUk: true },
  KL: { code: "KL", nom: "KLM", immatriculeeUeUk: true },
  IB: { code: "IB", nom: "Iberia", immatriculeeUeUk: true },
  BA: { code: "BA", nom: "British Airways", immatriculeeUeUk: true },
  FR: { code: "FR", nom: "Ryanair", immatriculeeUeUk: true },
  U2: { code: "U2", nom: "easyJet", immatriculeeUeUk: true },
  VY: { code: "VY", nom: "Vueling", immatriculeeUeUk: true },
  LX: { code: "LX", nom: "Swiss", immatriculeeUeUk: true },
  TP: { code: "TP", nom: "TAP Air Portugal", immatriculeeUeUk: true },
  EI: { code: "EI", nom: "Aer Lingus", immatriculeeUeUk: true },
  W6: { code: "W6", nom: "Wizz Air", immatriculeeUeUk: true },
  AA: { code: "AA", nom: "American Airlines", immatriculeeUeUk: false },
  DL: { code: "DL", nom: "Delta Air Lines", immatriculeeUeUk: false },
  UA: { code: "UA", nom: "United Airlines", immatriculeeUeUk: false },
  EK: { code: "EK", nom: "Emirates", immatriculeeUeUk: false },
  QR: { code: "QR", nom: "Qatar Airways", immatriculeeUeUk: false },
  SQ: { code: "SQ", nom: "Singapore Airlines", immatriculeeUeUk: false },
  TG: { code: "TG", nom: "Thai Airways", immatriculeeUeUk: false },
  LA: { code: "LA", nom: "LATAM Airlines", immatriculeeUeUk: false },
};

export function getCompagnie(code: string): Compagnie | undefined {
  return COMPAGNIES[code.toUpperCase()];
}
