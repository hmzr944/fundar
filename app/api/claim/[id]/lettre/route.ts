import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAeroport } from "@/lib/eligibility/airports";
import { getCompagnie } from "@/lib/eligibility/airlines";
import { resoudreJuridiction } from "@/config/jurisdictions";
import { resoudreContactCompagnie } from "@/config/airline-contacts";
import { genererLettreReclamationPdf } from "@/lib/pdf/lettre-reclamation";
import {
  envoyerReclamationCompagnie,
  envoyerCopieReclamationClient,
} from "@/lib/email/resend";

const LIBELLE_JURIDICTION: Record<string, string> = {
  GB_ENG_WALES: "England & Wales",
  GB_SCOT: "Scotland",
  FR: "France",
  ES: "Spain",
  DE: "Germany",
  IT: "Italy",
  NL: "Netherlands",
  BE: "Belgium",
};

const EXPLICATION_BLOCAGE: Record<string, string> = {
  CONTACT_NON_CONFIGURE:
    "Aucune adresse de réclamation n'est configurée pour cette compagnie. Renseignez-la dans config/airline-contacts.ts avant d'envoyer.",
  ENVOI_MANUEL_REQUIS:
    "Cette compagnie n'accepte les réclamations que par formulaire web ou courrier postal. La lettre est prête : l'envoi doit être fait à la main.",
  CONTACT_INCOMPLET:
    "Le contact configuré pour cette compagnie est incomplet (email manquant ou invalide).",
};

/**
 * Génère la lettre de réclamation et la transmet à la COMPAGNIE.
 *
 * Règle non négociable : si l'envoi ne peut pas réellement avoir lieu, le
 * dossier NE passe PAS en "En cours" et le client n'est pas notifié. Mieux
 * vaut un dossier visiblement en attente qu'un client qui croit à tort que
 * sa réclamation est partie et attend un virement pendant des mois.
 */
export async function POST(
  _request: NextRequest,
  { params }: { params: { id: string } }
) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }

  // RLS restreint déjà la lecture au propriétaire du dossier.
  const { data: dossier, error: erreurDossier } = await supabase
    .from("claims")
    .select(
      "id, numero_vol, date_vol, aeroport_depart, aeroport_arrivee, compagnie, montant_estime, devise, statut_dossier, reclamation_envoyee_le"
    )
    .eq("id", params.id)
    .single();

  if (erreurDossier || !dossier) {
    return NextResponse.json({ erreur: "Dossier introuvable." }, { status: 404 });
  }

  // Idempotence : ne pas réclamer deux fois le même dossier auprès de la
  // compagnie, ce qui nuirait à la crédibilité du dossier.
  if (dossier.reclamation_envoyee_le) {
    return NextResponse.json(
      {
        statut: "DEJA_ENVOYEE",
        envoyeeLe: dossier.reclamation_envoyee_le,
      },
      { status: 409 }
    );
  }

  const compagnie = getCompagnie(dossier.compagnie);
  const compagnieNom = compagnie?.nom ?? dossier.compagnie;

  const { data: profil } = await supabase
    .from("profiles")
    .select("nom, prenom, adresse")
    .eq("id", user.id)
    .single();

  const depart = getAeroport(dossier.aeroport_depart);
  const arrivee = getAeroport(dossier.aeroport_arrivee);
  const codeJuridiction =
    (depart && resoudreJuridiction(depart.paysCode, depart.iata)) ??
    (arrivee && resoudreJuridiction(arrivee.paysCode, arrivee.iata));

  const pdfBytes = await genererLettreReclamationPdf({
    compagnieNom,
    numeroVol: dossier.numero_vol,
    dateVol: dossier.date_vol,
    aeroportDepart: dossier.aeroport_depart,
    aeroportArrivee: dossier.aeroport_arrivee,
    montantReclame: dossier.montant_estime,
    devise: dossier.devise,
    passagerNom: profil?.nom ?? "",
    passagerPrenom: profil?.prenom ?? "",
    passagerAdresse: profil?.adresse ?? "",
    juridiction: codeJuridiction ? LIBELLE_JURIDICTION[codeJuridiction] : "N/A",
    langue: "en",
    envoyeeLe: new Date(),
  });

  // La lettre est archivée dans tous les cas : elle sert aussi à l'envoi manuel.
  const cheminStorage = `${user.id}/${dossier.id}/lettre-reclamation.pdf`;
  const { error: erreurUpload } = await supabase.storage
    .from("documents")
    .upload(cheminStorage, Buffer.from(pdfBytes), {
      contentType: "application/pdf",
      upsert: true,
    });

  if (erreurUpload) {
    return NextResponse.json(
      { erreur: "Impossible d'enregistrer la lettre de réclamation." },
      { status: 500 }
    );
  }

  await supabase.from("documents").insert({
    claim_id: dossier.id,
    type: "LETTRE_RECLAMATION",
    storage_path: cheminStorage,
  });

  const contact = resoudreContactCompagnie(dossier.compagnie);

  if (!contact.envoyable) {
    // Point clé : on s'arrête ici SANS toucher au statut et SANS écrire
    // d'email au client. Le dossier reste honnêtement "Soumis".
    return NextResponse.json(
      {
        statut: "ENVOI_IMPOSSIBLE",
        raison: contact.raison,
        explication:
          EXPLICATION_BLOCAGE[contact.raison ?? ""] ??
          "L'envoi automatique n'est pas possible pour cette compagnie.",
        urlFormulaire: contact.contact?.urlFormulaire ?? null,
        adressePostale: contact.contact?.adressePostale ?? null,
        lettrePrete: true,
      },
      { status: 409 }
    );
  }

  // Le mandat signé est indispensable : sans lui la compagnie rejette une
  // réclamation présentée par un tiers.
  let pdfMandat: Uint8Array | undefined;
  const { data: fichierMandat } = await supabase.storage
    .from("documents")
    .download(`${user.id}/${dossier.id}/mandat-signe.pdf`);
  if (fichierMandat) {
    pdfMandat = new Uint8Array(await fichierMandat.arrayBuffer());
  }

  if (!pdfMandat) {
    return NextResponse.json(
      {
        statut: "MANDAT_MANQUANT",
        explication:
          "Le mandat signé est introuvable. Une compagnie rejette une réclamation présentée sans mandat : l'envoi est annulé.",
      },
      { status: 409 }
    );
  }

  let idEnvoi: string | null = null;
  try {
    idEnvoi = await envoyerReclamationCompagnie({
      emailCompagnie: contact.contact!.email!,
      emailClient: user.email!,
      compagnieNom,
      numeroVol: dossier.numero_vol,
      dateVol: dossier.date_vol,
      pdfLettre: pdfBytes,
      pdfMandat,
    });
  } catch (erreur) {
    // Échec d'envoi : on ne prétend surtout pas que c'est parti.
    return NextResponse.json(
      {
        statut: "ECHEC_ENVOI",
        explication:
          "La réclamation n'a pas pu être transmise à la compagnie. Le dossier reste en attente, rien n'a été annoncé au client.",
        detail: erreur instanceof Error ? erreur.message : String(erreur),
      },
      { status: 502 }
    );
  }

  // À partir d'ici seulement, l'envoi est confirmé : on l'enregistre.
  const envoyeLe = new Date().toISOString();
  const admin = createAdminClient();

  await admin.from("envois_reclamation").insert({
    claim_id: dossier.id,
    mode: "EMAIL",
    destinataire: contact.contact!.email!,
    envoye_le: envoyeLe,
    envoi_manuel: false,
    reference_externe: idEnvoi,
  });

  await admin
    .from("claims")
    .update({
      statut_dossier: "EN_COURS",
      reclamation_envoyee_le: envoyeLe,
      updated_at: envoyeLe,
    })
    .eq("id", dossier.id);

  try {
    await envoyerCopieReclamationClient({
      destinataire: user.email!,
      numeroVol: dossier.numero_vol,
      compagnieNom,
      pdfLettre: pdfBytes,
    });
  } catch (erreur) {
    // La réclamation EST partie : l'échec de la copie au client ne doit pas
    // annuler l'opération, mais il doit rester visible dans les logs.
    console.error(
      `[claim ${dossier.id}] réclamation transmise à ${compagnieNom} mais copie client non envoyée :`,
      erreur
    );
  }

  return NextResponse.json({
    statut: "RECLAMATION_ENVOYEE",
    destinataire: contact.contact!.email!,
    envoyeeLe: envoyeLe,
  });
}
