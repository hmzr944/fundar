import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface CorpsRequete {
  numeroVol: string;
  dateVol: string;
  aeroportDepart: string;
  aeroportArrivee: string;
  compagnie: string;
  statutEligibilite: "ELIGIBLE" | "REVIEW_MANUEL";
  montantEstime: number | null;
  devise: "EUR" | "GBP";
  motif: string;
  explication: string;
}

/** Crée un dossier (F2, étape 1). Le mandat est signé dans un second appel. */
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }

  const body: CorpsRequete = await request.json();

  const { data, error } = await supabase
    .from("claims")
    .insert({
      user_id: user.id,
      numero_vol: body.numeroVol,
      date_vol: body.dateVol,
      aeroport_depart: body.aeroportDepart,
      aeroport_arrivee: body.aeroportArrivee,
      compagnie: body.compagnie,
      statut_eligibilite: body.statutEligibilite,
      montant_estime: body.montantEstime,
      devise: body.devise,
      motif: body.motif,
      explication: body.explication,
      modele_juridique: "MANDAT",
    })
    .select("id")
    .single();

  if (error || !data) {
    return NextResponse.json(
      { erreur: "Impossible de créer le dossier." },
      { status: 500 }
    );
  }

  return NextResponse.json({ id: data.id });
}
