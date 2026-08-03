import { AIRLINE_POLICY_DEFAUT, estCirconstanceExtraordinaireDeclaree, getAirlineTier } from "@/config/airline-policy";
import {
  dateLimiteReclamation,
  estPrescrit,
  joursAvantPrescription,
  resoudreJuridiction,
} from "@/config/jurisdictions";
import { getAeroport } from "./airports";
import { getCompagnie } from "./airlines";
import { BAREME, distanceKm, palierDistance } from "./distance";
import { DemandeVerification, Devise, ResultatVerification } from "./types";

function ineligible(
  motif: string,
  explication: string,
  devise: Devise = "EUR"
): ResultatVerification {
  return { statut: "INELIGIBLE", montantEstime: null, devise, motif, explication };
}

const SEUIL_RETARD_MINUTES = 180; // 3 heures

/**
 * Moteur d'éligibilité EU261 / UK261. Fonction pure : aucune I/O, aucun
 * accès réseau ou base de données. Voir §3 du prompt produit pour l'arbre
 * de décision détaillé.
 */
export function verifierEligibilite(
  demande: DemandeVerification
): ResultatVerification {
  const depart = getAeroport(demande.aeroportDepart);
  const arrivee = getAeroport(demande.aeroportArrivee);

  if (!depart || !arrivee) {
    return ineligible(
      "DONNEES_AEROPORT_INCONNUES",
      "Nous ne reconnaissons pas l'un des aéroports renseignés."
    );
  }

  const compagnie = getCompagnie(demande.compagnie);
  const compagnieImmatriculeeUeUk = compagnie?.immatriculeeUeUk ?? false;

  // Étape 1 — champ d'application territorial.
  let devise: Devise;
  let estIntra: boolean;
  if (depart.region === "EU_EEE_CH") {
    devise = "EUR";
    estIntra = arrivee.region === "EU_EEE_CH";
  } else if (depart.region === "UK") {
    devise = "GBP";
    estIntra = arrivee.region === "UK";
  } else if (arrivee.region === "EU_EEE_CH" && compagnieImmatriculeeUeUk) {
    devise = "EUR";
    estIntra = false;
  } else if (arrivee.region === "UK" && compagnieImmatriculeeUeUk) {
    devise = "GBP";
    estIntra = false;
  } else {
    return ineligible(
      "INELIGIBLE_HORS_CHAMP",
      "Ni le départ ni l'arrivée de ce vol ne relèvent d'EU261 ou UK261 avec cette compagnie."
    );
  }

  // Étape 2 — type de perturbation.
  const retardArriveeMinutes =
    demande.retardArriveeMinutes ??
    (demande.reacheminement
      ? demande.reacheminement.arriveeApresHeuresPrevues * 60
      : undefined);

  if (demande.typePerturbation === "AUCUNE") {
    return ineligible(
      "INELIGIBLE_SEUIL_NON_ATTEINT",
      "Aucune perturbation ouvrant droit à indemnisation n'a été constatée sur ce vol.",
      devise
    );
  }

  if (demande.typePerturbation === "RETARD") {
    if (
      retardArriveeMinutes === undefined ||
      retardArriveeMinutes < SEUIL_RETARD_MINUTES
    ) {
      return ineligible(
        "INELIGIBLE_SEUIL_NON_ATTEINT",
        "Le retard à l'arrivée est inférieur au seuil de 3 heures ouvrant droit à indemnisation.",
        devise
      );
    }
  }

  // Étape 3 — barème (calcul, la décision finale reste conditionnée aux
  // étapes 4/5/6 ci-dessous).
  const km = distanceKm(depart, arrivee);
  const palier = palierDistance(km, estIntra);
  let montant = BAREME[devise][palier];

  const reductionApplicable =
    palier === "LONG" &&
    demande.typePerturbation === "RETARD" &&
    retardArriveeMinutes !== undefined &&
    retardArriveeMinutes >= 180 &&
    retardArriveeMinutes < 240;

  if (reductionApplicable) {
    montant = montant / 2;
  }

  // Étape 4 — fenêtre de préavis (annulation uniquement).
  if (demande.typePerturbation === "ANNULATION") {
    const preavis = demande.preavisAnnulationJours;

    if (preavis === undefined) {
      return {
        statut: "REVIEW_MANUEL",
        montantEstime: null,
        devise,
        motif: "REVIEW_PREAVIS_INCONNU",
        explication:
          "Le préavis d'annulation n'est pas connu : ce dossier nécessite une vérification manuelle.",
      };
    }

    if (preavis >= 14) {
      return ineligible(
        "INELIGIBLE_PREAVIS",
        "L'annulation a été annoncée 14 jours ou plus à l'avance : aucune indemnisation n'est due.",
        devise
      );
    }

    const r = demande.reacheminement;
    const seuilDepart = preavis >= 7 ? 2 : 1;
    const seuilArrivee = preavis >= 7 ? 4 : 2;

    if (
      r &&
      r.departAvantHeuresPrevues <= seuilDepart &&
      r.arriveeApresHeuresPrevues < seuilArrivee
    ) {
      return ineligible(
        "INELIGIBLE_PREAVIS",
        "Le vol de remplacement proposé respecte les seuils de réacheminement autorisés : aucune indemnisation n'est due.",
        devise
      );
    }
  }

  // Étape 5 — prescription.
  const juridiction =
    resoudreJuridiction(depart.paysCode, depart.iata) ??
    resoudreJuridiction(arrivee.paysCode, arrivee.iata);
  const dateVol = new Date(`${demande.dateVol}T00:00:00Z`);
  const dateVerification = demande.dateVerification
    ? new Date(`${demande.dateVerification}T00:00:00Z`)
    : new Date();

  if (estPrescrit(juridiction, dateVol, dateVerification)) {
    return ineligible(
      "INELIGIBLE_PRESCRIT",
      "Le délai de prescription applicable à ce dossier est dépassé.",
      devise
    );
  }

  // Étape 6 — circonstances extraordinaires déclarées : jamais de montant
  // affiché tant qu'une vérification manuelle n'a pas tranché.
  if (estCirconstanceExtraordinaireDeclaree(demande.motifDeclare)) {
    return {
      statut: "REVIEW_MANUEL",
      montantEstime: null,
      devise,
      motif: "REVIEW_CIRCONSTANCE_EXTRAORDINAIRE",
      explication:
        "Le motif déclaré peut relever d'une circonstance extraordinaire : ce dossier nécessite une vérification manuelle avant toute estimation.",
    };
  }

  // Étape 6 — filtre de protection de trésorerie.
  const tier = getAirlineTier(demande.compagnie);
  if (tier === "REJECT") {
    return ineligible(
      "INELIGIBLE_COMPAGNIE_HORS_PERIMETRE",
      "Nous ne traitons pas les dossiers pour cette compagnie.",
      devise
    );
  }
  if (tier === "WAITLIST") {
    return {
      statut: "WAITLIST",
      montantEstime: null,
      devise,
      motif: "WAITLIST_COMPAGNIE",
      explication:
        "Nous ne traitons pas encore les dossiers pour cette compagnie. Laissez votre email, nous vous préviendrons.",
    };
  }

  const montantArrondi = Math.round(montant);
  const limite = dateLimiteReclamation(juridiction, dateVol);

  return {
    statut: "ELIGIBLE",
    montantEstime: montantArrondi,
    devise,
    motif: "ELIGIBLE",
    explication: `Vous êtes éligible à une indemnisation estimée à ${montantArrondi} ${devise}.`,
    ...(limite
      ? {
          dateLimiteReclamation: limite.toISOString().slice(0, 10),
          joursAvantPrescription: joursAvantPrescription(
            juridiction,
            dateVol,
            dateVerification
          )!,
        }
      : {}),
  };
}

export { AIRLINE_POLICY_DEFAUT };
