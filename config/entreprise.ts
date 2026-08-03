/**
 * Identité légale de l'émetteur des factures.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ À COMPLÉTER AVANT LA PREMIÈRE FACTURE.                              │
 * │                                                                     │
 * │ Une facture française doit porter la raison sociale, la forme       │
 * │ juridique, l'adresse du siège, le SIREN, et la mention de TVA —     │
 * │ y compris quand on n'en collecte pas (franchise en base).           │
 * │ Une facture incomplète n'est pas opposable : le client peut refuser │
 * │ de la régler, ce qui est précisément le risque qu'on cherche à      │
 * │ couvrir ici.                                                        │
 * └─────────────────────────────────────────────────────────────────────┘
 */
export interface IdentiteEntreprise {
  raisonSociale: string;
  formeJuridique: string;
  adresse: string;
  siren: string;
  /** Numéro de TVA intracommunautaire, ou null si franchise en base. */
  tvaIntracom: string | null;
  /** Mention légale de TVA imprimée sur la facture. */
  mentionTva: string;
  email: string;
  /** IBAN de règlement, utilisé quand aucun lien de paiement n'est disponible. */
  iban?: string;
  bic?: string;
}

export const ENTREPRISE: IdentiteEntreprise = {
  raisonSociale: process.env.ENTREPRISE_RAISON_SOCIALE ?? "[À COMPLÉTER]",
  formeJuridique: process.env.ENTREPRISE_FORME_JURIDIQUE ?? "[À COMPLÉTER]",
  adresse: process.env.ENTREPRISE_ADRESSE ?? "[À COMPLÉTER]",
  siren: process.env.ENTREPRISE_SIREN ?? "[À COMPLÉTER]",
  tvaIntracom: process.env.ENTREPRISE_TVA ?? null,
  mentionTva:
    process.env.ENTREPRISE_MENTION_TVA ??
    "TVA non applicable, article 293 B du CGI",
  email: process.env.RESEND_FROM_EMAIL ?? "[À COMPLÉTER]",
  iban: process.env.ENTREPRISE_IBAN,
  bic: process.env.ENTREPRISE_BIC,
};

/**
 * Vrai tant que l'identité n'est pas renseignée. Sert à refuser d'émettre
 * une facture invalide plutôt qu'à en produire une que le client pourra
 * légitimement contester.
 */
export function identiteIncomplete(): string[] {
  const manquants: string[] = [];
  if (ENTREPRISE.raisonSociale.includes("[")) manquants.push("raison sociale");
  if (ENTREPRISE.formeJuridique.includes("[")) manquants.push("forme juridique");
  if (ENTREPRISE.adresse.includes("[")) manquants.push("adresse du siège");
  if (ENTREPRISE.siren.includes("[")) manquants.push("SIREN");
  return manquants;
}
