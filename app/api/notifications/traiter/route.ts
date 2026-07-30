import { NextRequest, NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { composerNotification, envoyerNotification } from "@/lib/email/notifications";

/** Au-delà de ce nombre d'échecs, on arrête de réessayer et on alerte. */
const TENTATIVES_MAX = 4;
const LOT = 25;

/**
 * Vide la file des notifications de changement de statut.
 *
 * Les fondateurs mettant le statut à jour à la main dans Supabase, un
 * trigger dépose une ligne dans `notifications_email` et cet endpoint
 * l'envoie réellement. Le découplage sert à deux choses :
 *   - un échec d'envoi n'est plus perdu silencieusement, il est réessayé ;
 *   - la mise à jour du statut ne dépend pas de la disponibilité de Resend.
 *
 * À appeler périodiquement (Vercel Cron, ou à la main au début).
 * Protégé par CRON_SECRET : sans lui, n'importe qui pourrait déclencher
 * l'envoi d'emails à vos clients.
 */
export async function POST(request: NextRequest) {
  const secretAttendu = process.env.CRON_SECRET;

  if (!secretAttendu) {
    return NextResponse.json(
      { erreur: "CRON_SECRET n'est pas configuré : endpoint désactivé." },
      { status: 503 }
    );
  }

  const fourni =
    request.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    request.headers.get("x-cron-secret");

  if (fourni !== secretAttendu) {
    return NextResponse.json({ erreur: "Non autorisé." }, { status: 401 });
  }

  const admin = createAdminClient();

  const { data: enAttente, error } = await admin
    .from("notifications_email")
    .select("id, claim_id, destinataire, type_notification, tentatives")
    .eq("statut", "EN_ATTENTE")
    .lt("tentatives", TENTATIVES_MAX)
    .order("creee_le", { ascending: true })
    .limit(LOT);

  if (error) {
    return NextResponse.json(
      { erreur: "Lecture de la file impossible." },
      { status: 500 }
    );
  }

  if (!enAttente || enAttente.length === 0) {
    return NextResponse.json({ traitees: 0, envoyees: 0, echecs: 0 });
  }

  let envoyees = 0;
  let echecs = 0;
  let ignorees = 0;

  for (const notification of enAttente) {
    // Le dossier est relu au moment de l'envoi : le montant a pu être saisi
    // après le changement de statut.
    const { data: dossier } = await admin
      .from("claims")
      .select("numero_vol, devise, montant_recupere, commission_due")
      .eq("id", notification.claim_id)
      .single();

    if (!dossier) {
      // Dossier supprimé entre-temps : rien à envoyer.
      await admin
        .from("notifications_email")
        .update({ statut: "ECHEC", derniere_erreur: "Dossier introuvable." })
        .eq("id", notification.id);
      echecs += 1;
      continue;
    }

    const contenu = composerNotification(notification.type_notification, {
      numeroVol: dossier.numero_vol,
      montantRecupere: dossier.montant_recupere,
      devise: dossier.devise,
      commissionDue: dossier.commission_due,
    });

    // Certains changements de statut ne méritent pas d'email.
    if (!contenu) {
      await admin
        .from("notifications_email")
        .update({ statut: "ENVOYEE", envoyee_le: new Date().toISOString() })
        .eq("id", notification.id);
      ignorees += 1;
      continue;
    }

    try {
      await envoyerNotification({
        destinataire: notification.destinataire,
        contenu,
      });

      await admin
        .from("notifications_email")
        .update({
          statut: "ENVOYEE",
          envoyee_le: new Date().toISOString(),
          tentatives: notification.tentatives + 1,
        })
        .eq("id", notification.id);

      envoyees += 1;
    } catch (erreur) {
      const tentatives = notification.tentatives + 1;
      const message = erreur instanceof Error ? erreur.message : String(erreur);

      await admin
        .from("notifications_email")
        .update({
          // Reste EN_ATTENTE tant qu'il reste des tentatives : la prochaine
          // exécution réessaiera au lieu de perdre l'email.
          statut: tentatives >= TENTATIVES_MAX ? "ECHEC" : "EN_ATTENTE",
          tentatives,
          derniere_erreur: message,
        })
        .eq("id", notification.id);

      console.error(
        `[notification ${notification.id}] échec ${tentatives}/${TENTATIVES_MAX} :`,
        message
      );
      echecs += 1;
    }
  }

  return NextResponse.json({
    traitees: enAttente.length,
    envoyees,
    ignorees,
    echecs,
  });
}
