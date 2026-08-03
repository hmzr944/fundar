import type { SupabaseClient } from "@supabase/supabase-js";
import { genererFacturePdf } from "@/lib/pdf/facture";
import { creerLienPaiement } from "@/lib/paiement/stripe";
import { envoyerFacture } from "@/lib/email/resend";
import { identiteIncomplete } from "@/config/entreprise";

export interface ResultatEmission {
  emise: boolean;
  numero?: string;
  lienPaiement?: string | null;
  raison?: "IDENTITE_INCOMPLETE" | "DEJA_FACTUREE" | "MONTANT_MANQUANT" | "ECHEC";
  detail?: string;
}

/**
 * Émet la facture de commission d'un dossier payé.
 *
 * L'ordre est celui du risque : on écrit la facture en base AVANT de
 * l'envoyer, parce qu'une facture envoyée mais non enregistrée est
 * ingérable — on ne saurait plus quel numéro a été attribué, et la
 * numérotation comptable doit rester continue.
 *
 * Le lien de paiement est optionnel et n'est jamais bloquant : si Stripe
 * échoue ou n'est pas configuré, la facture part quand même avec les
 * coordonnées bancaires. Une facture qui n'arrive pas ne sera jamais réglée.
 */
export async function emettreFacture(
  admin: SupabaseClient,
  claimId: string,
  options: { urlSite: string }
): Promise<ResultatEmission> {
  const manquants = identiteIncomplete();
  if (manquants.length > 0) {
    return {
      emise: false,
      raison: "IDENTITE_INCOMPLETE",
      detail: `Facture non émise : ${manquants.join(", ")} à renseigner dans les variables d'environnement. Une facture incomplète n'est pas opposable.`,
    };
  }

  const { data: dossier } = await admin
    .from("claims")
    .select(
      "id, user_id, numero_vol, date_vol, compagnie, montant_recupere, devise, devise_recuperee, taux_commission, commission_due"
    )
    .eq("id", claimId)
    .single();

  if (!dossier) return { emise: false, raison: "ECHEC", detail: "Dossier introuvable." };

  if (dossier.montant_recupere === null || !dossier.commission_due) {
    return {
      emise: false,
      raison: "MONTANT_MANQUANT",
      detail: "Aucun montant récupéré enregistré : rien à facturer.",
    };
  }

  const { data: facturesExistantes } = await admin
    .from("factures")
    .select("numero")
    .eq("claim_id", claimId)
    .maybeSingle();

  if (facturesExistantes) {
    return {
      emise: false,
      raison: "DEJA_FACTUREE",
      numero: facturesExistantes.numero,
      detail: "Ce dossier a déjà été facturé.",
    };
  }

  const devise = dossier.devise_recuperee ?? dossier.devise ?? "EUR";

  const { data: profil } = await admin
    .from("profiles")
    .select("nom, prenom, adresse")
    .eq("id", dossier.user_id)
    .single();

  // Insertion d'abord : le numéro est attribué par la base, jamais ici.
  const { data: facture, error: erreurInsertion } = await admin
    .from("factures")
    .insert({
      claim_id: claimId,
      user_id: dossier.user_id,
      montant: dossier.commission_due,
      devise,
      montant_indemnisation: dossier.montant_recupere,
      taux_commission: dossier.taux_commission,
    })
    .select("id, numero, emise_le")
    .single();

  if (erreurInsertion || !facture) {
    return {
      emise: false,
      raison: "ECHEC",
      detail: erreurInsertion?.message ?? "Insertion de la facture impossible.",
    };
  }

  let lienPaiement: string | null = null;
  try {
    lienPaiement = await creerLienPaiement({
      montant: Number(dossier.commission_due),
      devise,
      libelle: `Commission Volia — vol ${dossier.numero_vol}`,
      reference: facture.numero,
      emailClient: await emailUtilisateur(admin, dossier.user_id),
      urlRetour: `${options.urlSite}/dashboard`,
    });
    if (lienPaiement) {
      await admin
        .from("factures")
        .update({ lien_paiement: lienPaiement })
        .eq("id", facture.id);
    }
  } catch (erreur) {
    // Non bloquant : la facture partira avec les coordonnées bancaires.
    console.error(`[facture ${facture.numero}] lien de paiement indisponible :`, erreur);
  }

  const pdf = await genererFacturePdf({
    numero: facture.numero,
    emiseLe: new Date(facture.emise_le),
    clientNom: profil?.nom ?? "",
    clientPrenom: profil?.prenom ?? "",
    clientAdresse: profil?.adresse ?? "",
    numeroVol: dossier.numero_vol,
    dateVol: dossier.date_vol,
    compagnie: dossier.compagnie,
    montantIndemnisation: Number(dossier.montant_recupere),
    tauxCommission: Number(dossier.taux_commission),
    montantCommission: Number(dossier.commission_due),
    devise,
    lienPaiement,
  });

  const chemin = `${dossier.user_id}/${claimId}/facture-${facture.numero}.pdf`;
  await admin.storage
    .from("documents")
    .upload(chemin, Buffer.from(pdf), { contentType: "application/pdf", upsert: true });
  await admin.from("factures").update({ storage_path: chemin }).eq("id", facture.id);

  try {
    await envoyerFacture({
      destinataire: await emailUtilisateur(admin, dossier.user_id),
      numero: facture.numero,
      numeroVol: dossier.numero_vol,
      montant: Number(dossier.commission_due),
      devise,
      lienPaiement,
      pdfFacture: pdf,
    });
  } catch (erreur) {
    console.error(`[facture ${facture.numero}] envoi email échoué :`, erreur);
    return {
      emise: true,
      numero: facture.numero,
      lienPaiement,
      detail:
        "Facture créée mais l'email n'est pas parti. Renvoyez-la à la main : le client ne sait pas encore qu'il doit régler.",
    };
  }

  return { emise: true, numero: facture.numero, lienPaiement };
}

async function emailUtilisateur(
  admin: SupabaseClient,
  userId: string
): Promise<string> {
  const { data } = await admin.auth.admin.getUserById(userId);
  return data.user?.email ?? "";
}
