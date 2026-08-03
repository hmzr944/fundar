import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

interface CorpsRequete {
  montant?: number;
  recuLe?: string;
}

/**
 * Le client déclare avoir reçu son indemnisation.
 *
 * C'est le seul moyen d'apprendre qu'un dossier a abouti : dans le modèle
 * mandat, la compagnie verse directement au passager et ne nous prévient
 * pas. Sans cette déclaration, un dossier gagné reste indistinguable d'un
 * dossier perdu.
 *
 * La déclaration n'est PAS la facturation. Elle alimente
 * paiement_declare_le / montant_declare, jamais montant_recupere, qui reste
 * la valeur comptable et n'est écrite qu'après vérification. Un client de
 * bonne foi peut se tromper de montant, et une facture fondée sur un
 * chiffre erroné se transforme en litige.
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

  const montant = Number(body.montant);
  if (!Number.isFinite(montant) || montant <= 0) {
    return NextResponse.json(
      { erreur: "Indiquez le montant que vous avez reçu." },
      { status: 400 }
    );
  }

  // Borne haute de plausibilité : le barème plafonne à 600 par passager, et
  // un dossier peut en couvrir plusieurs. Au-delà, c'est une faute de saisie.
  if (montant > 10_000) {
    return NextResponse.json(
      { erreur: "Ce montant paraît inhabituel. Vérifiez, ou écrivez-nous." },
      { status: 400 }
    );
  }

  const recuLe = body.recuLe ?? new Date().toISOString().slice(0, 10);

  // RLS limite déjà la mise à jour au propriétaire du dossier, et le trigger
  // de la migration 0003 empêche ce même appel de toucher au statut ou au
  // montant comptable.
  const { error } = await supabase
    .from("claims")
    .update({ paiement_declare_le: recuLe, montant_declare: montant })
    .eq("id", params.id);

  if (error) {
    return NextResponse.json(
      { erreur: "Enregistrement impossible. Réessayez." },
      { status: 500 }
    );
  }

  return NextResponse.json({ statut: "PAIEMENT_DECLARE" });
}
