import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { verifierEligibilite } from "@/lib/eligibility/engine";
import {
  ajusterSelonSource,
  type SourceVerification,
} from "@/lib/eligibility/verification";
import { TypePerturbation } from "@/lib/eligibility/types";

interface CorpsRequete {
  numeroVol: string;
  dateVol: string;
  aeroportDepart: string;
  aeroportArrivee: string;
  compagnie: string;
  typePerturbation: TypePerturbation;
  retardArriveeMinutes?: number;
  preavisAnnulationJours?: number;
  source?: SourceVerification;
}

const PERTURBATIONS: TypePerturbation[] = [
  "RETARD",
  "ANNULATION",
  "REFUS_EMBARQUEMENT",
  "AUCUNE",
];

/**
 * Crée un dossier (F2, étape 1). Le mandat est signé dans un second appel.
 *
 * Le verdict est RECALCULÉ ici à partir des faits ; il n'est jamais repris
 * du navigateur. La version précédente enregistrait le statut et le montant
 * envoyés par la page : n'importe qui pouvait ouvrir un dossier à 600 € sur
 * un vol arrivé à l'heure, et ce montant se retrouvait tel quel dans le
 * mandat signé, puis dans la lettre adressée à la compagnie.
 *
 * Effet de bord voulu : un dossier issu du parcours déclaratif est
 * enregistré en REVIEW_MANUEL, exactement comme annoncé au passager, et
 * non en ELIGIBLE.
 */
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }

  let body: CorpsRequete;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  }

  if (
    !body.numeroVol ||
    !body.dateVol ||
    !body.aeroportDepart ||
    !body.aeroportArrivee ||
    !body.compagnie
  ) {
    return NextResponse.json(
      { erreur: "Informations de vol incomplètes." },
      { status: 400 }
    );
  }

  const typePerturbation = PERTURBATIONS.includes(body.typePerturbation)
    ? body.typePerturbation
    : "AUCUNE";

  const source: SourceVerification =
    body.source === "AUTOMATIQUE" ? "AUTOMATIQUE" : "DECLARATIF";

  const aeroportDepart = body.aeroportDepart.trim().toUpperCase();
  const aeroportArrivee = body.aeroportArrivee.trim().toUpperCase();
  const compagnie = body.compagnie.trim().toUpperCase();

  const resultat = ajusterSelonSource(
    verifierEligibilite({
      numeroVol: body.numeroVol,
      dateVol: body.dateVol,
      aeroportDepart,
      aeroportArrivee,
      compagnie,
      typePerturbation,
      retardArriveeMinutes: body.retardArriveeMinutes,
      preavisAnnulationJours: body.preavisAnnulationJours,
    }),
    source
  );

  // On n'ouvre pas de dossier sur un verdict négatif : le passager
  // signerait un mandat pour une réclamation qu'on sait perdue d'avance.
  if (resultat.statut === "INELIGIBLE" || resultat.statut === "WAITLIST") {
    return NextResponse.json(
      { erreur: resultat.explication, motif: resultat.motif },
      { status: 422 }
    );
  }

  const { data, error } = await supabase
    .from("claims")
    .insert({
      user_id: user.id,
      numero_vol: body.numeroVol,
      date_vol: body.dateVol,
      aeroport_depart: aeroportDepart,
      aeroport_arrivee: aeroportArrivee,
      compagnie,
      statut_eligibilite: resultat.statut,
      montant_estime: resultat.montantEstime,
      devise: resultat.devise,
      motif: resultat.motif,
      explication: resultat.explication,
      modele_juridique: "MANDAT",
    })
    .select("id")
    .single();

  if (error || !data) {
    // Un dossier existe déjà pour ce vol (index claims_dossier_unique) :
    // le signaler plutôt que d'échouer en 500, car en créer un second
    // enverrait deux réclamations à la compagnie pour un seul passager.
    if (error?.code === "23505") {
      return NextResponse.json(
        { erreur: "Un dossier existe déjà pour ce vol et cette date." },
        { status: 409 }
      );
    }
    return NextResponse.json(
      { erreur: "Impossible de créer le dossier." },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: data.id, resultat });
}
