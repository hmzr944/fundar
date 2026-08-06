import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { exigerAdmin } from "@/lib/admin/garde";
import { emettreFacture } from "@/lib/facturation/emettre";

interface CorpsRequete {
  claimId: string;
  statut?: "EN_COURS" | "PAYE" | "REFUSE";
  montantRecupere?: number | null;
  deviseRecuperee?: "EUR" | "GBP" | null;
  recupereLe?: string | null;
  commissionEncaisseeLe?: string | null;
}

/**
 * Clôture d'un dossier : issue, montant réellement reçu, encaissement.
 *
 * Remplace la saisie directe dans l'interface Supabase. Le gain n'est pas
 * le confort : passer par ici garantit que le trigger de notification part
 * avec les bonnes valeurs, et qu'on ne marque pas un dossier PAYE sans
 * montant — auquel cas le client verrait "indemnisation reçue" sans chiffre.
 */
export async function PATCH(request: NextRequest) {
  const garde = await exigerAdmin();
  if (!garde.autorise) {
    return NextResponse.json(
      { erreur: garde.statut === 401 ? "Non authentifié." : "Accès refusé." },
      { status: garde.statut }
    );
  }

  const body: CorpsRequete = await request.json();
  if (!body.claimId) {
    return NextResponse.json({ erreur: "Dossier manquant." }, { status: 400 });
  }

  if (body.statut === "PAYE" && (body.montantRecupere ?? null) === null) {
    return NextResponse.json(
      { erreur: "Un dossier payé exige le montant réellement reçu." },
      { status: 400 }
    );
  }

  const maj: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (body.statut) maj.statut_dossier = body.statut;
  if (body.montantRecupere !== undefined) maj.montant_recupere = body.montantRecupere;
  if (body.deviseRecuperee !== undefined) maj.devise_recuperee = body.deviseRecuperee;
  if (body.recupereLe !== undefined) maj.recupere_le = body.recupereLe;
  if (body.commissionEncaisseeLe !== undefined) {
    maj.commission_encaissee_le = body.commissionEncaisseeLe;
  }

  const admin = createAdminClient();
  const { error } = await admin.from("claims").update(maj).eq("id", body.claimId);

  if (error) {
    return NextResponse.json({ erreur: error.message }, { status: 400 });
  }

  // Marquer payé sans facturer laisserait la commission à réclamer plus
  // tard, à la main, au moment où le client est le moins disposé à régler.
  // On facture donc immédiatement, pendant qu'il vient de recevoir l'argent.
  if (body.statut === "PAYE") {
    const facturation = await emettreFacture(admin, body.claimId, {
      urlSite: process.env.NEXT_PUBLIC_SITE_URL ?? "https://clearto.example",
    });

    // Le dossier EST à jour : un échec de facturation ne doit pas faire
    // croire que la mise à jour a échoué. On le remonte tel quel pour que
    // l'écran d'exploitation le montre.
    return NextResponse.json({ ok: true, facturation });
  }

  return NextResponse.json({ ok: true });
}
