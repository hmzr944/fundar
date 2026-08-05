import { notFound, redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { estAdmin } from "@/config/admin";
import { TAUX_COMMISSION } from "@/config/legal";
import {
  EFFECTIF_MIN_POUR_PUBLIER,
  statistiquesGlobales,
  statistiquesParCompagnie,
  type DossierMesure,
  type NatureReponse,
} from "@/lib/stats/dossiers";
import SaisieReponse from "@/components/admin/SaisieReponse";
import SaisieIssue from "@/components/admin/SaisieIssue";

/** Données vivantes : jamais de cache sur un tableau de bord d'exploitation. */
export const dynamic = "force-dynamic";

const LIBELLE_NATURE: Record<NatureReponse, string> = {
  ACCUSE_RECEPTION: "Accusé de réception",
  DEMANDE_INFO: "Demande d'information",
  REFUS: "Refus",
  BON_ACHAT: "Bon d'achat",
  PAIEMENT_ANNONCE: "Paiement annoncé",
};

interface LigneClaim {
  id: string;
  numero_vol: string;
  date_vol: string;
  compagnie: string;
  devise: string | null;
  montant_estime: number | null;
  statut_dossier: string;
  reclamation_envoyee_le: string | null;
  premiere_reponse_le: string | null;
  premiere_reponse_nature: NatureReponse | null;
  montant_recupere: number | null;
  recupere_le: string | null;
  paiement_declare_le: string | null;
  montant_declare: number | null;
}

function pourcentage(valeur: number | null) {
  return valeur === null ? "—" : `${Math.round(valeur * 100)} %`;
}

function jours(valeur: number | null) {
  return valeur === null ? "—" : `${valeur} j`;
}

export default async function AdminPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login?next=/admin");

  // 404 plutôt que 403 : un non-administrateur n'a pas à apprendre que
  // cette page existe.
  if (!estAdmin(user.email)) notFound();

  const admin = createAdminClient();
  const { data } = await admin
    .from("claims")
    .select(
      "id, numero_vol, date_vol, compagnie, devise, montant_estime, statut_dossier, reclamation_envoyee_le, premiere_reponse_le, premiere_reponse_nature, montant_recupere, recupere_le, paiement_declare_le, montant_declare"
    )
    .order("created_at", { ascending: false });

  const dossiers = (data ?? []) as LigneClaim[];

  const mesures: DossierMesure[] = dossiers.map((d) => ({
    compagnie: d.compagnie,
    reclamationEnvoyeeLe: d.reclamation_envoyee_le,
    premiereReponseLe: d.premiere_reponse_le,
    premiereReponseNature: d.premiere_reponse_nature,
    recupereLe: d.recupere_le,
    montantRecupere: d.montant_recupere,
  }));

  const global = statistiquesGlobales(mesures, TAUX_COMMISSION);
  const parCompagnie = statistiquesParCompagnie(mesures);

  const aRelancer = dossiers.filter(
    (d) => d.reclamation_envoyee_le && !d.premiere_reponse_le
  );

  // File la plus rentable du tableau de bord : chaque ligne est une
  // commission qui n'est pas encore facturée.
  const aFacturer = dossiers.filter(
    (d) => d.paiement_declare_le && d.statut_dossier !== "PAYE"
  );

  return (
    <main className="conteneur py-14 sm:py-20">
      <h1 className="titre text-[1.875rem] sm:text-[2.5rem]">
        Exploitation
      </h1>
      <p className="mt-3 max-w-[60ch] text-[15px] leading-relaxed text-[var(--texte-attenue)]">
        Ces chiffres sont la seule preuve que le service vaut sa commission.
        Un taux n&apos;est proposé à l&apos;affichage public qu&apos;à partir
        de {EFFECTIF_MIN_POUR_PUBLIER} dossiers transmis pour une compagnie.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { valeur: String(global.dossiersTransmis), libelle: "Réclamations transmises" },
          { valeur: String(global.enAttenteDeReponse), libelle: "Sans réponse à ce jour" },
          { valeur: String(global.refusesEnPremiereReponse), libelle: "Refusées d'entrée" },
          { valeur: jours(global.delaiMedianPaiement), libelle: "Délai médian de paiement" },
        ].map((tuile) => (
          <div key={tuile.libelle} className="carte p-5">
            <p className="chiffres text-3xl font-bold">{tuile.valeur}</p>
            <p className="mt-1 text-sm text-[var(--texte-attenue)]">
              {tuile.libelle}
            </p>
          </div>
        ))}
      </div>

      <div className="carte mt-4 p-5">
        <p className="text-sm text-[var(--texte-attenue)]">
          Récupéré pour les clients :{" "}
          <span className="chiffres font-semibold text-[var(--texte)]">
            {global.montantTotalRecupere} €
          </span>{" "}
          · commission correspondante :{" "}
          <span className="chiffres font-semibold text-[var(--texte)]">
            {global.commissionTotale} €
          </span>
        </p>
      </div>

      <h2 className="mt-12 titre text-[1.5rem]">
        Comportement par compagnie
      </h2>
      {parCompagnie.length === 0 ? (
        <p className="mt-3 text-[15px] text-[var(--texte-attenue)]">
          Aucune réclamation transmise pour l&apos;instant. Ce tableau se
          remplit au premier envoi.
        </p>
      ) : (
        <div className="carte mt-4 overflow-x-auto">
          <table className="w-full min-w-[46rem] text-left text-sm">
            <thead className="border-b border-[var(--bordure)] text-[var(--texte-attenue)]">
              <tr>
                <th className="p-4 font-medium">Compagnie</th>
                <th className="p-4 font-medium">Transmis</th>
                <th className="p-4 font-medium">Refus d&apos;entrée</th>
                <th className="p-4 font-medium">1re réponse</th>
                <th className="p-4 font-medium">Paiement</th>
                <th className="p-4 font-medium">Taux de paiement</th>
              </tr>
            </thead>
            <tbody>
              {parCompagnie.map((stat) => (
                <tr key={stat.compagnie} className="border-b border-[var(--bordure)] last:border-0">
                  <td className="p-4 font-semibold">
                    {stat.compagnie}
                    {!stat.publiable && (
                      <span className="ml-2 text-xs font-normal text-[var(--texte-attenue)]">
                        non publiable
                      </span>
                    )}
                  </td>
                  <td className="chiffres p-4">{stat.effectif}</td>
                  <td className="chiffres p-4">
                    {pourcentage(stat.tauxRefusPremiereReponse)}
                    <span className="ml-1 text-xs text-[var(--texte-attenue)]">
                      ({stat.nombreRefusPremiereReponse}/{stat.nombreReponses})
                    </span>
                  </td>
                  <td className="chiffres p-4">
                    {jours(stat.delaiMedianPremiereReponse)}
                  </td>
                  <td className="chiffres p-4">{jours(stat.delaiMedianPaiement)}</td>
                  <td className="chiffres p-4">{pourcentage(stat.tauxPaiement)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <h2 className="mt-12 titre text-[1.5rem]">
        Paiements déclarés, à vérifier et facturer ({aFacturer.length})
      </h2>
      <p className="mt-2 text-[15px] text-[var(--texte-attenue)]">
        Le client dit avoir été payé. Vérifiez le montant, puis clôturez :
        la facture part automatiquement. Chaque ligne ici est une commission
        non encaissée.
      </p>
      <div className="mt-4 flex flex-col gap-3">
        {aFacturer.map((dossier) => (
          <div key={dossier.id} className="carte p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold">
                {dossier.compagnie} · vol {dossier.numero_vol} du {dossier.date_vol}
              </p>
              <p className="chiffres text-sm font-semibold text-[var(--color-succes-600)]">
                {dossier.montant_declare} {dossier.devise} déclarés le{" "}
                {dossier.paiement_declare_le}
              </p>
            </div>
            <div className="mt-3">
              <SaisieIssue claimId={dossier.id} devise={dossier.devise ?? "EUR"} />
            </div>
          </div>
        ))}
      </div>

      <h2 className="mt-12 titre text-[1.5rem]">
        En attente de réponse ({aRelancer.length})
      </h2>
      <p className="mt-2 text-[15px] text-[var(--texte-attenue)]">
        Transmises, sans réponse enregistrée. C&apos;est ici que se fait le
        travail que le passager seul n&apos;aurait pas fait.
      </p>

      <div className="mt-4 flex flex-col gap-3">
        {aRelancer.map((dossier) => (
          <div key={dossier.id} className="carte p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold">
                {dossier.compagnie} · vol {dossier.numero_vol} du {dossier.date_vol}
              </p>
              <p className="text-sm text-[var(--texte-attenue)]">
                transmise le {dossier.reclamation_envoyee_le?.slice(0, 10)}
              </p>
            </div>
            <SaisieReponse claimId={dossier.id} />
          </div>
        ))}
      </div>

      <h2 className="mt-12 titre text-[1.5rem]">
        Tous les dossiers ({dossiers.length})
      </h2>
      <div className="mt-4 flex flex-col gap-3">
        {dossiers.map((dossier) => (
          <div key={dossier.id} className="carte p-5">
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <p className="font-semibold">
                {dossier.compagnie} · vol {dossier.numero_vol} du {dossier.date_vol}
              </p>
              <p className="text-sm text-[var(--texte-attenue)]">
                {dossier.statut_dossier}
                {dossier.montant_recupere !== null &&
                  ` · ${dossier.montant_recupere} ${dossier.devise ?? ""} reçus`}
              </p>
            </div>
            <p className="mt-1 text-sm text-[var(--texte-attenue)]">
              {dossier.reclamation_envoyee_le
                ? `Transmise le ${dossier.reclamation_envoyee_le.slice(0, 10)}`
                : "Non transmise"}
              {dossier.premiere_reponse_nature &&
                ` · 1re réponse le ${dossier.premiere_reponse_le} : ${
                  LIBELLE_NATURE[dossier.premiere_reponse_nature]
                }`}
            </p>
            <div className="mt-3 flex flex-wrap gap-2">
              {dossier.reclamation_envoyee_le && (
                <SaisieReponse claimId={dossier.id} />
              )}
              {dossier.statut_dossier !== "PAYE" && (
                <SaisieIssue claimId={dossier.id} devise={dossier.devise ?? "EUR"} />
              )}
            </div>
          </div>
        ))}
      </div>
    </main>
  );
}
