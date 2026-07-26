/**
 * Filtre de protection de trésorerie (§3.2 étape 6).
 *
 * Le no-win-no-fee finance le travail avant l'encaissement : on refuse
 * volontairement des dossiers gagnables mais lents à payer.
 *
 * A AJUSTER A LA MAIN CHAQUE SEMAINE selon le comportement de paiement
 * RÉEL observé sur nos dossiers. Ne pas essayer de rendre ça "intelligent" :
 * c'est un tableau de bord de risque, pas un modèle.
 */
export type AirlineTier = "ACCEPT" | "WAITLIST" | "REJECT";

export const AIRLINE_POLICY: Record<string, AirlineTier> = {
  // Paiement spontané rapide, observé ou réputé fiable -> traités immédiatement.
  AF: "ACCEPT",
  LH: "ACCEPT",
  KL: "ACCEPT",
  IB: "ACCEPT",
  LX: "ACCEPT",
  TP: "ACCEPT",
  EI: "ACCEPT",
  BA: "ACCEPT",

  // Payeurs lents ou contentieux fréquent -> on capte l'email, on ne
  // promet rien, on traite plus tard.
  FR: "WAITLIST", // Ryanair
  U2: "WAITLIST", // easyJet
  VY: "WAITLIST",
  W6: "WAITLIST", // Wizz Air

  // Hors périmètre V1 (hors UE/UK, pas de retour d'expérience de paiement).
  AA: "REJECT",
  DL: "REJECT",
  UA: "REJECT",
  EK: "REJECT",
  QR: "REJECT",
  SQ: "REJECT",
  TG: "REJECT",
  LA: "REJECT",
};

/** Tier par défaut pour une compagnie non encore répertoriée : prudence. */
export const AIRLINE_POLICY_DEFAUT: AirlineTier = "WAITLIST";

export function getAirlineTier(code: string): AirlineTier {
  return AIRLINE_POLICY[code.toUpperCase()] ?? AIRLINE_POLICY_DEFAUT;
}

/**
 * Détection grossière de "circonstance extraordinaire" déclarée (météo
 * extrême, grève ATC externe, sécurité, décision d'autorité). Un problème
 * technique appareil ou une grève du personnel de la compagnie n'en fait
 * PAS partie et reste ACCEPT.
 *
 * Volontairement conservateur : en cas de doute, on part en REVIEW_MANUEL
 * plutôt que d'afficher un montant qu'on ne pourra pas obtenir.
 */
const MOTIFS_CIRCONSTANCE_EXTRAORDINAIRE = [
  "meteo",
  "weather",
  "atc",
  "controle aerien",
  "controleur aerien",
  "controleurs aeriens",
  "air traffic control",
  "securite",
  "security",
  "ordre autorite",
  "authority order",
  "attentat",
  "terrorisme",
];

function sansAccents(texte: string): string {
  return texte
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase();
}

export function estCirconstanceExtraordinaireDeclaree(
  motifDeclare: string | undefined
): boolean {
  if (!motifDeclare) return false;
  const normalise = sansAccents(motifDeclare);
  return MOTIFS_CIRCONSTANCE_EXTRAORDINAIRE.some((mot) => {
    const motif = sansAccents(mot);
    const regex = new RegExp(`\\b${motif.replace(/\s+/g, "\\s+")}\\b`, "i");
    return regex.test(normalise);
  });
}
