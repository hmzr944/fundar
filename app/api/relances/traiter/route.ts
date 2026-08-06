import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getCompagnie } from "@/lib/eligibility/airlines";
import { envoyerRelancePaiement } from "@/lib/email/resend";
import {
  dossiersARelancer,
  joursDepuisEnvoi,
  type DossierRelancable,
} from "@/lib/facturation/relances";

/** Plafond par exécution : une erreur de sélection ne doit pas partir en masse. */
const LOT = 40;

/**
 * Demande aux clients dont la réclamation est partie s'ils ont été payés.
 *
 * Sans cet endpoint, on n'apprend jamais qu'un dossier a abouti : la
 * compagnie verse au passager sans nous prévenir, et le passager n'a aucune
 * raison spontanée de nous signaler qu'il nous doit une commission.
 *
 * À appeler une fois par jour (Vercel Cron, ou à la main au début).
 * Protégé par CRON_SECRET, comme l'envoi des notifications : sans lui,
 * n'importe qui pourrait déclencher une vague d'emails à vos clients.
 */
export async function POST(request: NextRequest) {
  const secretAttendu = process.env.CRON_SECRET;
  if (!secretAttendu) {
    return NextResponse.json(
      { erreur: "CRON_SECRET n'est pas configuré : endpoint désactivé." },
      { status: 503 }
    );
  }

  const fourni = request.headers.get("authorization")?.replace("Bearer ", "");
  if (fourni !== secretAttendu) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const admin = createAdminClient();
  const { data, error } = await admin
    .from("claims")
    .select(
      "id, user_id, numero_vol, compagnie, statut_dossier, reclamation_envoyee_le, recupere_le, paiement_declare_le, derniere_relance_paiement_le, nombre_relances_paiement"
    )
    .not("reclamation_envoyee_le", "is", null)
    .in("statut_dossier", ["EN_COURS", "SOUMIS"]);

  if (error) {
    return NextResponse.json({ erreur: error.message }, { status: 500 });
  }

  const lignes = data ?? [];
  const candidats: DossierRelancable[] = lignes.map((l) => ({
    id: l.id,
    reclamationEnvoyeeLe: l.reclamation_envoyee_le,
    recupereLe: l.recupere_le,
    paiementDeclareLe: l.paiement_declare_le,
    statutDossier: l.statut_dossier,
    derniereRelancePaiementLe: l.derniere_relance_paiement_le,
    nombreRelancesPaiement: l.nombre_relances_paiement ?? 0,
  }));

  const aRelancer = dossiersARelancer(candidats).slice(0, LOT);
  const urlSite = process.env.NEXT_PUBLIC_SITE_URL ?? "https://clearto.example";

  let envoyees = 0;
  const echecs: { id: string; detail: string }[] = [];

  for (const cible of aRelancer) {
    const ligne = lignes.find((l) => l.id === cible.id)!;

    try {
      const { data: utilisateur } = await admin.auth.admin.getUserById(ligne.user_id);
      const email = utilisateur.user?.email;
      if (!email) {
        echecs.push({ id: cible.id, detail: "Aucune adresse email." });
        continue;
      }

      await envoyerRelancePaiement({
        destinataire: email,
        numeroVol: ligne.numero_vol,
        compagnieNom: getCompagnie(ligne.compagnie)?.nom ?? ligne.compagnie,
        joursDepuisEnvoi: joursDepuisEnvoi(cible),
        urlDashboard: `${urlSite}/dashboard`,
      });

      // Incrémenté seulement après un envoi réussi : sinon un échec de
      // Resend consommerait un jalon et le client ne serait jamais relancé.
      await admin
        .from("claims")
        .update({
          derniere_relance_paiement_le: new Date().toISOString().slice(0, 10),
          nombre_relances_paiement: cible.nombreRelancesPaiement + 1,
        })
        .eq("id", cible.id);

      envoyees += 1;
    } catch (erreur) {
      echecs.push({
        id: cible.id,
        detail: erreur instanceof Error ? erreur.message : String(erreur),
      });
    }
  }

  return NextResponse.json({
    examines: candidats.length,
    selectionnes: aRelancer.length,
    envoyees,
    echecs,
  });
}

/** Vercel Cron n'émet que des GET (voir /api/notifications/traiter). */
export async function GET(request: NextRequest) {
  return POST(request);
}
