import type { Passager } from "@/lib/claims/passagers";

/**
 * Dossier mis de côté pendant la vérification de l'email.
 *
 * Le lien de connexion arrive par email et s'ouvre presque toujours dans
 * un ONGLET NEUF. sessionStorage y est vide : le passager retrouvait un
 * formulaire vierge et devait tout ressaisir — coordonnées, IBAN,
 * signature, passagers — au moment précis où il venait de faire l'effort.
 * D'où localStorage, qui traverse l'onglet.
 *
 * Ce que ça stocke n'est pas anodin : identité, adresse, IBAN et image de
 * signature. C'est pourquoi la durée est courte et la lecture destructive
 * dès qu'elle est dépassée — sur un poste partagé, ces données ne doivent
 * pas attendre le visiteur suivant.
 */
export interface DossierEnAttente {
  identite: {
    nom: string;
    prenom: string;
    adresse: string;
    email: string;
    iban: string;
  };
  signatureDataUrl: string;
  compagnons: Passager[];
}

export const CLE_DOSSIER = "clearto:dossier-en-attente";

/** Deux heures : bien au-delà du temps d'aller chercher un email, bien en
 *  deçà d'un oubli durable sur la machine. */
export const DUREE_VALIDITE_MS = 2 * 60 * 60 * 1000;

interface Enregistrement extends DossierEnAttente {
  enregistreLe: number;
}

export function enregistrerDossier(
  stockage: Storage,
  dossier: DossierEnAttente,
  maintenant: number = Date.now()
): void {
  const enregistrement: Enregistrement = { ...dossier, enregistreLe: maintenant };
  try {
    stockage.setItem(CLE_DOSSIER, JSON.stringify(enregistrement));
  } catch {
    // Navigation privée saturée, quota dépassé : on ne casse pas le
    // parcours pour autant. Le passager ressaisira, ce qui est le
    // comportement d'avant, pas une régression.
  }
}

export function lireDossier(
  stockage: Storage,
  maintenant: number = Date.now()
): DossierEnAttente | null {
  const brut = stockage.getItem(CLE_DOSSIER);
  if (!brut) return null;

  try {
    const e: Enregistrement = JSON.parse(brut);

    // Un enregistrement tronqué ferait signer un mandat sans signature,
    // ou avec une identité incomplète. On préfère repartir de zéro.
    if (!e || !e.identite || !e.signatureDataUrl || !e.enregistreLe) {
      effacerDossier(stockage);
      return null;
    }

    if (maintenant - e.enregistreLe > DUREE_VALIDITE_MS) {
      effacerDossier(stockage);
      return null;
    }

    return {
      identite: e.identite,
      signatureDataUrl: e.signatureDataUrl,
      compagnons: e.compagnons ?? [],
    };
  } catch {
    effacerDossier(stockage);
    return null;
  }
}

export function effacerDossier(stockage: Storage): void {
  try {
    stockage.removeItem(CLE_DOSSIER);
  } catch {
    // Sans conséquence : la lecture revalide de toute façon la fraîcheur.
  }
}
