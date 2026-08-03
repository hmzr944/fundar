/**
 * Registre des points de contact "réclamation" des compagnies.
 *
 * ┌─────────────────────────────────────────────────────────────────────┐
 * │ À REMPLIR À LA MAIN AVANT LA MISE EN PRODUCTION.                    │
 * │                                                                     │
 * │ Rien n'est envoyé à une compagnie dont le contact n'est pas          │
 * │ renseigné ici : le dossier reste explicitement "en préparation" et  │
 * │ l'utilisateur n'est jamais informé d'un envoi qui n'a pas eu lieu.  │
 * │                                                                     │
 * │ Où trouver l'information, compagnie par compagnie :                 │
 * │  - page "Customer Relations" / "Claims" du site officiel ;          │
 * │  - conditions générales de transport (section réclamations) ;       │
 * │  - formulaire EU261 dédié quand il existe (souvent obligatoire).    │
 * │                                                                     │
 * │ N'inventez jamais une adresse : un mauvais destinataire = fuite de  │
 * │ données personnelles (identité, itinéraire, carte d'embarquement).  │
 * └─────────────────────────────────────────────────────────────────────┘
 */

/**
 * Beaucoup de compagnies n'acceptent une réclamation EU261 que via leur
 * propre formulaire web. Dans ce cas l'envoi automatique est impossible :
 * on le déclare pour que le produit ne prétende pas l'avoir fait.
 */
export type ModeEnvoi = "EMAIL" | "FORMULAIRE_WEB" | "COURRIER";

export interface ContactCompagnie {
  mode: ModeEnvoi;
  /** Requis si mode === "EMAIL". */
  email?: string;
  /** Requis si mode === "FORMULAIRE_WEB" : URL du formulaire de réclamation. */
  urlFormulaire?: string;
  /** Requis si mode === "COURRIER" : adresse postale du service réclamations. */
  adressePostale?: string;
  /** Langue attendue par le service réclamations. */
  langue: "en" | "fr" | "de" | "es" | "it" | "nl";
  /** Note interne : particularités observées (délais, référence à citer...). */
  note?: string;
}

/**
 * Entrées en mode FORMULAIRE_WEB uniquement, pour l'instant.
 *
 * Ces URL ont été relevées sur les domaines officiels des compagnies. Elles
 * ne déclenchent AUCUN envoi automatique — un formulaire web ne peut pas
 * être rempli par email — mais elles évitent de rechercher l'adresse à
 * chaque dossier, et le tableau de bord les affiche directement.
 *
 * Aucune adresse EMAIL n'est renseignée, et c'est délibéré : une URL fausse
 * se voit immédiatement (404), tandis qu'un email faux envoie l'identité,
 * l'itinéraire et la carte d'embarquement d'un client à un inconnu, sans
 * que personne ne s'en aperçoive. Le risque n'est pas du même ordre.
 *
 * À vérifier une fois avant le premier dossier : les compagnies déplacent
 * ces pages régulièrement.
 */
export const CONTACTS_COMPAGNIES: Record<string, ContactCompagnie> = {
  AF: {
    mode: "FORMULAIRE_WEB",
    urlFormulaire: "https://wwws.airfrance.fr/claim",
    langue: "fr",
    note: "Espace « Réclamations et avis ». Suivi de dossier sur /claim/track-a-claim.",
  },
  KL: {
    mode: "FORMULAIRE_WEB",
    urlFormulaire: "https://www.klm.com/information/refund-compensation/compensation",
    langue: "en",
    note: "KLM propose d'abord un bon (EMD voucher) : exiger explicitement le versement en espèces, seul dû au titre du règlement.",
  },
  BA: {
    mode: "FORMULAIRE_WEB",
    urlFormulaire: "https://www.britishairways.com/travel/feedbackclaims/public/en_gb",
    langue: "en",
    note: "Portail « Feedback and Claims ». Voie postale existante : British Airways Customer Relations, EU Compensation Claims, PO Box 1126, Uxbridge UB8 9XS, Royaume-Uni.",
  },
};

export interface ResultatContact {
  /** true seulement si un envoi automatique est réellement possible. */
  envoyable: boolean;
  contact?: ContactCompagnie;
  /** Code machine expliquant pourquoi l'envoi est impossible. */
  raison?: "CONTACT_NON_CONFIGURE" | "ENVOI_MANUEL_REQUIS" | "CONTACT_INCOMPLET";
}

/**
 * Détermine si l'on peut réellement envoyer la réclamation par email.
 * Toute réponse autre que `envoyable: true` doit empêcher le passage du
 * dossier en "En cours".
 */
export function resoudreContactCompagnie(codeCompagnie: string): ResultatContact {
  const contact = CONTACTS_COMPAGNIES[codeCompagnie.toUpperCase()];

  if (!contact) {
    return { envoyable: false, raison: "CONTACT_NON_CONFIGURE" };
  }

  // Formulaire web et courrier postal ne peuvent pas partir automatiquement.
  if (contact.mode !== "EMAIL") {
    return { envoyable: false, contact, raison: "ENVOI_MANUEL_REQUIS" };
  }

  if (!contact.email || !contact.email.includes("@")) {
    return { envoyable: false, contact, raison: "CONTACT_INCOMPLET" };
  }

  return { envoyable: true, contact };
}
