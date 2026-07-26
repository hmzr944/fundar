import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getAeroport } from "@/lib/eligibility/airports";
import { getCompagnie } from "@/lib/eligibility/airlines";
import { resoudreJuridiction } from "@/config/jurisdictions";
import { genererLettreReclamationPdf } from "@/lib/pdf/lettre-reclamation";
import { envoyerLettreReclamation } from "@/lib/email/resend";

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

/** F3 : génère et envoie la lettre de réclamation formelle à la compagnie. */
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

  const { data: dossier, error: erreurDossier } = await supabase
    .from("claims")
    .select(
      "id, numero_vol, date_vol, aeroport_depart, aeroport_arrivee, compagnie, montant_estime, devise, statut_dossier"
    )
    .eq("id", params.id)
    .single();

  if (erreurDossier || !dossier) {
    return NextResponse.json({ erreur: "Dossier introuvable." }, { status: 404 });
  }

  const { data: profil } = await supabase
    .from("profiles")
    .select("nom, prenom, adresse")
    .eq("id", user.id)
    .single();

  const depart = getAeroport(dossier.aeroport_depart);
  const arrivee = getAeroport(dossier.aeroport_arrivee);
  const compagnie = getCompagnie(dossier.compagnie);

  const codeJuridiction =
    (depart && resoudreJuridiction(depart.paysCode, depart.iata)) ??
    (arrivee && resoudreJuridiction(arrivee.paysCode, arrivee.iata));

  const pdfBytes = await genererLettreReclamationPdf({
    compagnieNom: compagnie?.nom ?? dossier.compagnie,
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

  if (dossier.statut_dossier === "SOUMIS") {
    await supabase
      .from("claims")
      .update({ statut_dossier: "EN_COURS", updated_at: new Date().toISOString() })
      .eq("id", dossier.id);
  }

  try {
    const { data: authUser } = await supabase.auth.getUser();
    if (authUser.user?.email) {
      await envoyerLettreReclamation({
        destinataire: authUser.user.email,
        numeroVol: dossier.numero_vol,
        pdfLettre: pdfBytes,
      });
    }
  } catch {
    // Non bloquant : la lettre est déjà enregistrée et le statut mis à jour.
  }

  return NextResponse.json({ statut: "LETTRE_ENVOYEE" });
}
