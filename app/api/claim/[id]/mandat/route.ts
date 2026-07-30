import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { genererMandatPdf } from "@/lib/pdf/mandat";
import { sha256Hex } from "@/lib/crypto/hash";
import { envoyerConfirmationMandat } from "@/lib/email/resend";
import { VERSION_CGV } from "@/config/legal";

interface CorpsRequete {
  nom: string;
  prenom: string;
  adresse: string;
  email: string;
  iban: string;
  signatureDataUrl: string;
}

/**
 * F2, étape finale : identité + signature -> génération du mandat PDF,
 * hash + horodatage de preuve, email de confirmation.
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

  const body: CorpsRequete = await request.json();
  if (!body.signatureDataUrl) {
    return NextResponse.json({ erreur: "Signature manquante." }, { status: 400 });
  }

  const { data: dossier, error: erreurDossier } = await supabase
    .from("claims")
    .select(
      "id, numero_vol, date_vol, aeroport_depart, aeroport_arrivee, compagnie, montant_estime, devise, modele_juridique"
    )
    .eq("id", params.id)
    .single();

  if (erreurDossier || !dossier) {
    return NextResponse.json({ erreur: "Dossier introuvable." }, { status: 404 });
  }

  await supabase.from("profiles").upsert({
    id: user.id,
    nom: body.nom,
    prenom: body.prenom,
    adresse: body.adresse,
    iban: body.iban,
  });

  const signeLe = new Date();
  const pdfBytes = await genererMandatPdf({
    nom: body.nom,
    prenom: body.prenom,
    adresse: body.adresse,
    email: body.email,
    iban: body.iban,
    numeroVol: dossier.numero_vol,
    dateVol: dossier.date_vol,
    aeroportDepart: dossier.aeroport_depart,
    aeroportArrivee: dossier.aeroport_arrivee,
    compagnie: dossier.compagnie,
    montantEstime: dossier.montant_estime,
    devise: dossier.devise,
    modeleJuridique: dossier.modele_juridique,
    signatureDataUrl: body.signatureDataUrl,
    signeLe,
  });

  const hash = sha256Hex(pdfBytes);
  const cheminStorage = `${user.id}/${dossier.id}/mandat-signe.pdf`;

  const { error: erreurUpload } = await supabase.storage
    .from("documents")
    .upload(cheminStorage, Buffer.from(pdfBytes), {
      contentType: "application/pdf",
      upsert: true,
    });

  if (erreurUpload) {
    return NextResponse.json(
      { erreur: "Impossible d'enregistrer le mandat signé." },
      { status: 500 }
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null;

  await supabase.from("documents").insert({
    claim_id: dossier.id,
    type: "MANDAT_SIGNE",
    storage_path: cheminStorage,
  });

  await supabase.from("signatures").insert({
    claim_id: dossier.id,
    hash_sha256: hash,
    signed_at: signeLe.toISOString(),
    ip_address: ip,
  });

  // La version du texte accepté est enregistrée : un consentement qui ne
  // renvoie à aucun document daté n'a quasiment aucune valeur probante.
  await supabase.from("consentements").insert([
    {
      user_id: user.id,
      claim_id: dossier.id,
      type: "CGV",
      ip_address: ip,
      version_document: VERSION_CGV,
    },
    {
      user_id: user.id,
      claim_id: dossier.id,
      type: "MANDAT",
      ip_address: ip,
      version_document: VERSION_CGV,
    },
  ]);

  try {
    await envoyerConfirmationMandat({
      destinataire: body.email,
      numeroVol: dossier.numero_vol,
      pdfMandat: pdfBytes,
    });
  } catch {
    // L'email de confirmation n'est pas bloquant : le dossier est déjà enregistré.
  }

  return NextResponse.json({ statut: "MANDAT_SIGNE", hash });
}
