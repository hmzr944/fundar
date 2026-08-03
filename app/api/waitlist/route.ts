import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { estEmailPlausible } from "@/lib/validation/email";

/** Bornes larges : elles n'existent que pour empêcher l'absurde. */
const LONGUEUR_MAX = { email: 254, compagnie: 8, numeroVol: 12 };

/**
 * Capture d'email pour les compagnies en liste d'attente.
 *
 * Endpoint public et non authentifié — la policy RLS l'autorise
 * explicitement, sinon un visiteur non connecté, qui est le cas normal
 * ici, ne pourrait jamais s'inscrire. En contrepartie, rien de ce qui
 * arrive ici n'est digne de confiance : tout est validé et borné avant
 * insertion, faute de quoi la table se remplit de n'importe quoi.
 */
export async function POST(request: NextRequest) {
  let corps: { email?: unknown; compagnie?: unknown; numeroVol?: unknown };
  try {
    corps = await request.json();
  } catch {
    return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  }

  const email = typeof corps.email === "string" ? corps.email.trim() : "";
  const compagnie =
    typeof corps.compagnie === "string" ? corps.compagnie.trim().toUpperCase() : "";
  const numeroVol =
    typeof corps.numeroVol === "string" ? corps.numeroVol.trim().toUpperCase() : "";

  if (!estEmailPlausible(email) || email.length > LONGUEUR_MAX.email) {
    return NextResponse.json(
      { erreur: "Cette adresse email ne semble pas valide." },
      { status: 400 }
    );
  }

  if (!compagnie || compagnie.length > LONGUEUR_MAX.compagnie) {
    return NextResponse.json({ erreur: "Compagnie requise." }, { status: 400 });
  }

  const supabase = createClient();
  const { error } = await supabase.from("waitlist").insert({
    email: email.toLowerCase(),
    compagnie,
    numero_vol: numeroVol.slice(0, LONGUEUR_MAX.numeroVol) || null,
  });

  if (error) {
    return NextResponse.json(
      { erreur: "Impossible d'enregistrer votre email pour le moment." },
      { status: 500 }
    );
  }

  return NextResponse.json({ statut: "ENREGISTRE" });
}
