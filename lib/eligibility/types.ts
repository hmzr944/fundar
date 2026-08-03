export type Devise = "EUR" | "GBP";

export type TypePerturbation =
  | "RETARD"
  | "ANNULATION"
  | "REFUS_EMBARQUEMENT"
  | "AUCUNE";

export interface Reacheminement {
  /** Heures avant l'horaire de départ prévu auxquelles le vol de remplacement part. */
  departAvantHeuresPrevues: number;
  /** Heures après l'horaire d'arrivée prévu auxquelles le vol de remplacement arrive. */
  arriveeApresHeuresPrevues: number;
}

export interface DemandeVerification {
  numeroVol: string;
  /** Date du vol, ISO 8601 (YYYY-MM-DD). */
  dateVol: string;
  aeroportDepart: string;
  aeroportArrivee: string;
  /** Code IATA compagnie, ex: "AF", "BA". */
  compagnie: string;
  typePerturbation: TypePerturbation;
  /** Retard à l'ARRIVEE (pas au départ), en minutes. */
  retardArriveeMinutes?: number;
  /** Préavis de l'annonce d'annulation, en jours avant le vol. */
  preavisAnnulationJours?: number;
  reacheminement?: Reacheminement;
  /**
   * Motif déclaré de la perturbation, en langage libre ou code.
   * Sert à détecter une possible "circonstance extraordinaire".
   */
  motifDeclare?: string;
  /** Date à laquelle la vérification est faite. Défaut: aujourd'hui. ISO 8601. */
  dateVerification?: string;
}

export type StatutVerification =
  | "ELIGIBLE"
  | "INELIGIBLE"
  | "REVIEW_MANUEL"
  | "WAITLIST";

export interface ResultatVerification {
  statut: StatutVerification;
  montantEstime: number | null;
  devise: Devise;
  /** Code machine, ex: "INELIGIBLE_HORS_CHAMP". */
  motif: string;
  /** Une phrase, langage clair, destinée à l'utilisateur. */
  explication: string;
  /**
   * Dernier jour pour réclamer (ISO), quand le dossier est encore vivant et
   * que la juridiction est identifiée. C'est une information que le passager
   * ne trouve nulle part ailleurs, et la seule urgence honnête du produit.
   */
  dateLimiteReclamation?: string;
  /** Jours restants avant cette date limite. */
  joursAvantPrescription?: number;
}
