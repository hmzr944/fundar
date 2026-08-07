import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { estAdmin } from "@/config/admin";
import { resoudreContactCompagnie } from "@/config/airline-contacts";
import {
  destinataireEnregistrable,
  validerDateEnvoi,
} from "@/lib/claims/envoi-manuel";

interface CorpsRequete {
  claimId: string;
  /** AAAA-MM-JJ. */
  envoyeLe: string;
  /** Numéro de dossier rendu par la compagnie, s'il y en a un. */
  referenceExterne?: string;
}

/**
 * Enregistre une réclamation transmise à la main.
 *
 * Les compagnies configurées n'acceptent que leur formulaire web : le
 * fondateur le remplit lui-même, puis vient le déclarer ici. Cette route
 * est le seul moyen de faire passer un dossier en « En cours » sans envoi
 * automatique, et elle applique exactement les mêmes refus que la route
 * d'envoi par email — sans quoi elle deviendrait la porte dérobée par
 * laquelle on annonce au client un envoi qui n'a pas eu lieu.
 *
 * Le passage à EN_COURS suffit à prévenir le client : le trigger
 * file_notification_changement_statut met l'email en file d'attente.
 */
export async function POST(request: NextRequest) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user || !estAdmin(user.email)) {
    // 404 et non 403 : un non-administrateur n'apprend pas que la route existe.
    return NextResponse.json({ erreur: "Introuvable." }, { status: 404 });
  }

  let body: CorpsRequete;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  }

  if (!body.claimId) {
    return NextResponse.json({ erreur: "Dossier manquant." }, { status: 400 });
  }

  const admin = createAdminClient();
  const { data: dossier, error: erreurDossier } = await admin
    .from("claims")
    .select("id, user_id, compagnie, numero_vol, reclamation_envoyee_le, created_at")
    .eq("id", body.claimId)
    .single();

  if (erreurDossier || !dossier) {
    return NextResponse.json({ erreur: "Dossier introuvable." }, { status: 404 });
  }

  // Idempotence, comme pour l'envoi automatique : une compagnie qui reçoit
  // deux fois le même dossier le traite comme un doublon suspect.
  if (dossier.reclamation_envoyee_le) {
    return NextResponse.json(
      {
        erreur: `Cette réclamation est déjà enregistrée comme transmise le ${dossier.reclamation_envoyee_le.slice(0, 10)}.`,
        code: "DEJA_ENVOYEE",
      },
      { status: 409 }
    );
  }

  const verdict = validerDateEnvoi({
    envoyeLe: body.envoyeLe,
    creeLe: dossier.created_at,
    maintenant: new Date(),
  });
  if (!verdict.valide) {
    return NextResponse.json({ erreur: verdict.message }, { status: 400 });
  }

  // Le mandat signé conditionne l'envoi automatique ; il conditionne aussi
  // celui-ci. Une compagnie rejette une réclamation présentée par un tiers
  // sans mandat, et déclarer l'envoi masquerait ce rejet annoncé.
  const { data: mandat } = await admin
    .from("documents")
    .select("id")
    .eq("claim_id", dossier.id)
    .eq("type", "MANDAT_SIGNE")
    .maybeSingle();

  if (!mandat) {
    return NextResponse.json(
      {
        erreur:
          "Aucun mandat signé n'est archivé pour ce dossier. La compagnie rejetterait la réclamation : l'envoi ne peut pas être enregistré.",
        code: "MANDAT_MANQUANT",
      },
      { status: 409 }
    );
  }

  const contact = resoudreContactCompagnie(dossier.compagnie);
  const coordonnee = destinataireEnregistrable(contact.contact);

  if (!coordonnee) {
    return NextResponse.json(
      {
        erreur: `Aucune coordonnée n'est configurée pour ${dossier.compagnie}. Renseignez-la dans config/airline-contacts.ts avant de déclarer l'envoi.`,
        code: "CONTACT_NON_CONFIGURE",
      },
      { status: 409 }
    );
  }

  const envoyeLeIso = new Date(body.envoyeLe).toISOString();

  const { error: erreurTrace } = await admin.from("envois_reclamation").insert({
    claim_id: dossier.id,
    mode: coordonnee.mode,
    destinataire: coordonnee.destinataire,
    envoye_le: envoyeLeIso,
    envoi_manuel: true,
    reference_externe: body.referenceExterne?.trim() || null,
  });

  if (erreurTrace) {
    return NextResponse.json(
      { erreur: "La trace d'envoi n'a pas pu être enregistrée." },
      { status: 500 }
    );
  }

  // La trace existe déjà : si cette mise à jour échoue, le dossier
  // paraîtrait non transmis et pourrait être déclaré une seconde fois.
  const { error: erreurStatut } = await admin
    .from("claims")
    .update({
      statut_dossier: "EN_COURS",
      reclamation_envoyee_le: envoyeLeIso,
      updated_at: new Date().toISOString(),
    })
    .eq("id", dossier.id);

  if (erreurStatut) {
    console.error(
      `[claim ${dossier.id}] trace d'envoi manuel écrite mais statut non mis à jour :`,
      erreurStatut
    );
    return NextResponse.json(
      {
        erreur:
          "L'envoi a été tracé mais le statut n'a pas suivi. Ne redéclarez pas : corrigez le statut à la main.",
        code: "TRACE_SANS_STATUT",
      },
      { status: 500 }
    );
  }

  return NextResponse.json({
    statut: "ENVOI_MANUEL_ENREGISTRE",
    mode: coordonnee.mode,
    destinataire: coordonnee.destinataire,
    envoyeLe: envoyeLeIso,
  });
}
