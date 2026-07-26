import { AviationStackProvider } from "./aviationstack";
import { MockFlightStatusProvider } from "./mock";
import { FlightStatusProvider } from "./provider";

export * from "./provider";

let instance: FlightStatusProvider | undefined;

/**
 * Point d'entrée unique du produit vers le statut de vol. Pour changer de
 * fournisseur, écrire une nouvelle classe implémentant FlightStatusProvider
 * et la brancher ici — rien d'autre dans le produit ne doit changer.
 *
 * Hors production et sans clé AviationStack configurée, on retombe sur un
 * fournisseur de démonstration déterministe (voir mock.ts) pour pouvoir
 * faire tourner /check en local. En production, l'absence de clé reste une
 * vraie erreur : on ne masque jamais un problème de configuration derrière
 * de fausses données.
 */
export function getFlightStatusProvider(): FlightStatusProvider {
  if (!instance) {
    const cleApi = process.env.AVIATIONSTACK_API_KEY;
    instance =
      !cleApi && process.env.NODE_ENV !== "production"
        ? new MockFlightStatusProvider()
        : new AviationStackProvider(cleApi ?? "");
  }
  return instance;
}
