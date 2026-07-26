import { AEROPORTS } from "@/lib/eligibility/airports";
import { COMPAGNIES } from "@/lib/eligibility/airlines";
import {
  FlightStatusProvider,
  FlightStatusQuery,
  FlightStatusResult,
  StatutVol,
} from "./provider";

function hashSimple(texte: string): number {
  let h = 0;
  for (let i = 0; i < texte.length; i++) {
    h = (h * 31 + texte.charCodeAt(i)) >>> 0;
  }
  return h;
}

const CODES_AEROPORTS = Object.keys(AEROPORTS);
const CODES_COMPAGNIES = Object.keys(COMPAGNIES);

/**
 * Fournisseur de démonstration, sans clé API : déterministe par numéro de
 * vol + date, pour permettre de faire tourner /check en local sans compte
 * AviationStack. N'est jamais sélectionné en production (voir index.ts).
 */
export class MockFlightStatusProvider implements FlightStatusProvider {
  async recupererStatut(
    query: FlightStatusQuery
  ): Promise<FlightStatusResult> {
    const graine = hashSimple(`${query.numeroVol.toUpperCase()}|${query.dateVol}`);

    const prefixeCompagnie = query.numeroVol.trim().slice(0, 2).toUpperCase();
    const compagnie = CODES_COMPAGNIES.includes(prefixeCompagnie)
      ? prefixeCompagnie
      : CODES_COMPAGNIES[graine % CODES_COMPAGNIES.length];

    const depart = CODES_AEROPORTS[graine % CODES_AEROPORTS.length];
    let indexArrivee = (Math.floor(graine / 16)) % CODES_AEROPORTS.length;
    if (CODES_AEROPORTS[indexArrivee] === depart) {
      indexArrivee = (indexArrivee + 1) % CODES_AEROPORTS.length;
    }
    const arrivee = CODES_AEROPORTS[indexArrivee];

    let statut: StatutVol = "ATTERRI";
    let retardArriveeMinutes: number | null = 0;

    switch (graine % 5) {
      case 0: // gros retard : éligible
        retardArriveeMinutes = 180 + (graine % 180);
        break;
      case 1: // petit retard : sous le seuil de 3h
        retardArriveeMinutes = 20 + (graine % 90);
        break;
      case 2: // annulation : déclenche la question de préavis
        statut = "ANNULE";
        retardArriveeMinutes = null;
        break;
      case 3: // vol à l'heure
        retardArriveeMinutes = graine % 15;
        break;
      case 4: // long-courrier entre 3h et 4h : réduction de 50%
        retardArriveeMinutes = 190 + (graine % 40);
        break;
    }

    return {
      trouve: true,
      numeroVol: query.numeroVol,
      dateVol: query.dateVol,
      compagnie,
      aeroportDepart: depart,
      aeroportArrivee: arrivee,
      statut,
      retardArriveeMinutes,
    };
  }
}
