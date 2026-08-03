import {
  FlightStatusProvider,
  FlightStatusQuery,
  FlightStatusResult,
  StatutVol,
} from "./provider";

/**
 * HTTPS imposé, jamais HTTP.
 *
 * Le tier gratuit d'AviationStack ne sert qu'en HTTP : la clé d'API et
 * l'itinéraire du passager transiteraient alors en clair. Plutôt que de
 * dégrader silencieusement, on garde le HTTPS et on laisse l'appel échouer
 * si le plan ne le permet pas — un fournisseur indisponible bascule sur le
 * parcours déclaratif, ce qui est préférable à une fuite de données.
 *
 * À noter avant de souscrire : l'historique d'AviationStack est une fenêtre
 * glissante de trois mois, alors qu'une réclamation EU261 se prescrit en un
 * à six ans. Ce fournisseur ne couvre donc qu'une minorité des dossiers ;
 * le parcours déclaratif n'est pas un repli exceptionnel mais le chemin
 * principal (voir lib/eligibility/verification.ts).
 */
const BASE_URL = "https://api.aviationstack.com/v1/flights";

function mapStatut(statutBrut: string | undefined): StatutVol {
  switch (statutBrut) {
    case "scheduled":
      return "PROGRAMME";
    case "active":
      return "ACTIF";
    case "landed":
      return "ATTERRI";
    case "cancelled":
      return "ANNULE";
    case "diverted":
      return "DEROUTE";
    default:
      return "INCONNU";
  }
}

/** Implémentation AviationStack de FlightStatusProvider (tier gratuit). */
export class AviationStackProvider implements FlightStatusProvider {
  constructor(private readonly apiKey: string) {}

  async recupererStatut(
    query: FlightStatusQuery
  ): Promise<FlightStatusResult> {
    const url = new URL(BASE_URL);
    url.searchParams.set("access_key", this.apiKey);
    url.searchParams.set("flight_iata", query.numeroVol);
    url.searchParams.set("flight_date", query.dateVol);

    const reponse = await fetch(url.toString(), { cache: "no-store" });
    if (!reponse.ok) {
      throw new Error(`AviationStack a répondu ${reponse.status}`);
    }

    const corps = await reponse.json();
    const vol = corps?.data?.[0];

    if (!vol) {
      return {
        trouve: false,
        numeroVol: query.numeroVol,
        dateVol: query.dateVol,
        compagnie: null,
        aeroportDepart: null,
        aeroportArrivee: null,
        statut: "INCONNU",
        retardArriveeMinutes: null,
      };
    }

    return {
      trouve: true,
      numeroVol: query.numeroVol,
      dateVol: query.dateVol,
      compagnie: vol.airline?.iata_code ?? null,
      aeroportDepart: vol.departure?.iata ?? null,
      aeroportArrivee: vol.arrival?.iata ?? null,
      statut: mapStatut(vol.flight_status),
      retardArriveeMinutes: vol.arrival?.delay ?? null,
    };
  }
}
