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
 * Vide volontairement. Ajoutez une entrée par compagnie au fur et à mesure,
 * en commençant par celles en tier ACCEPT dans config/airline-policy.ts.
 *
 * Exemple de format attendu (à remplacer par une adresse RÉELLE vérifiée) :
 *
 *   AF: {
 *     mode: "EMAIL",
 *     email: "<adresse réelle du service réclamations>",
 *     langue: "fr",
 *     note: "Exige la référence du dossier dans l'objet.",
 *   },
 */
export const CONTACTS_COMPAGNIES: Record<string, ContactCompagnie> = {};

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
