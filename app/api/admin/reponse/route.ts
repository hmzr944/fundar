import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { exigerAdmin } from "@/lib/admin/garde";
import type { NatureReponse } from "@/lib/stats/dossiers";

const NATURES: NatureReponse[] = [
  "ACCUSE_RECEPTION",
  "DEMANDE_INFO",
  "REFUS",
  "BON_ACHAT",
  "PAIEMENT_ANNONCE",
];

interface CorpsRequete {
  claimId: string;
  recueLe: string;
  nature: NatureReponse;
  motifInvoque?: string;
  montantPropose?: number | null;
  deviseProposee?: "EUR" | "GBP" | null;
  notes?: string;
}

/**
 * Enregistre une réponse de compagnie sur un dossier.
 *
 * La base refuse une réponse antérieure à l'envoi, ou sur un dossier jamais
 * transmis (trigger maj_premiere_reponse_claim) : ces erreurs remontent ici
 * telles quelles plutôt que d'être avalées, parce qu'une date fausse
 * fausserait durablement les délais médians affichés aux clients.
 */
export async function POST(request: NextRequest) {
  const garde = await exigerAdmin();
  if (!garde.autorise) {
    return NextResponse.json(
      { erreur: garde.statut === 401 ? "Non authentifié." : "Accès refusé." },
      { status: garde.statut }
    );
  }

  const body: CorpsRequete = await request.json();

  if (!body.claimId || !body.recueLe) {
    return NextResponse.json(
      { erreur: "Dossier et date de réception sont obligatoires." },
      { status: 400 }
    );
  }

  if (!NATURES.includes(body.nature)) {
    return NextResponse.json(
      { erreur: "Nature de réponse inconnue." },
      { status: 400 }
    );
  }

  const admin = createAdminClient();
  const { error } = await admin.from("reponses_compagnie").insert({
    claim_id: body.claimId,
    recue_le: body.recueLe,
    nature: body.nature,
    motif_invoque: body.motifInvoque?.trim() || null,
    montant_propose: body.montantPropose ?? null,
    devise_proposee: body.deviseProposee ?? null,
    notes: [body.notes?.trim(), `saisi par ${garde.email}`]
      .filter(Boolean)
      .join(" — "),
  });

  if (error) {
    return NextResponse.json({ erreur: error.message }, { status: 400 });
  }

  return NextResponse.json({ ok: true });
}
