import { AviationStackProvider } from "./aviationstack";
import { FlightStatusProvider } from "./provider";

export * from "./provider";

let instance: FlightStatusProvider | undefined;

/**
 * Point d'entrée unique du produit vers le statut de vol. Pour changer de
 * fournisseur, écrire une nouvelle classe implémentant FlightStatusProvider
 * et la brancher ici — rien d'autre dans le produit ne doit changer.
 */
export function getFlightStatusProvider(): FlightStatusProvider {
  if (!instance) {
    instance = new AviationStackProvider(
      process.env.AVIATIONSTACK_API_KEY ?? ""
    );
  }
  return instance;
}
