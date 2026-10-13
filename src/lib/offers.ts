/**
 * What Nimbrel sells to construction companies: a fixed price per case, paid
 * upfront, never a share of the money recovered. Prices are excluding VAT
 * (B2B). Starting hypotheses from the 30-day test plan, to adjust with data.
 */
export type Offer = { id: string; title: string; includes: string[]; priceCentsHT: number; unit: string };

export const OFFERS: Offer[] = [
  {
    id: "retenue",
    title: "Récupération de retenue de garantie",
    includes: ["Vérification du procès-verbal de réception et du délai d'un an", "Demande de libération en recommandé", "Dossier de déconsignation si la retenue est à la Caisse des Dépôts"],
    priceCentsHT: 4900,
    unit: "le dossier",
  },
  {
    id: "public",
    title: "Intérêts de retard sur marché public",
    includes: ["Calcul des intérêts moratoires et de l'indemnité de 40 €", "Demande à l'acheteur public avec le détail du calcul"],
    priceCentsHT: 3900,
    unit: "le dossier",
  },
  {
    id: "facture",
    title: "Situation ou facture de chantier impayée",
    includes: ["Relance, puis mise en demeure en recommandé", "Pénalités et indemnité de 40 € calculées", "Requête en injonction de payer prête à déposer"],
    priceCentsHT: 7900,
    unit: "le dossier",
  },
  {
    id: "sous",
    title: "Dossier sous-traitant",
    includes: ["Mise en demeure de l'entreprise principale, copie au maître d'ouvrage", "Action directe ou paiement direct au bon moment", "Trois recommandés inclus"],
    priceCentsHT: 14900,
    unit: "le dossier",
  },
];

export const FOLLOW_UP = {
  title: "Suivi de vos chantiers",
  text: "Toutes vos réceptions et factures suivies en continu, avec une alerte avant chaque date limite. Proposé à partir du deuxième dossier.",
  priceCentsHT: 3900,
  unit: "par mois",
};

export const eurosHT = (cents: number) => `${(cents / 100).toLocaleString("fr-FR", { maximumFractionDigits: 2 })} € HT`;
