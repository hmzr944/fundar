import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import Icone, { type NomIcone } from "@/components/Icone";
import FriseDossier, { etapeDuDossier } from "@/components/motion/FriseDossier";
import EnvoyerLettreButton from "@/components/EnvoyerLettreButton";
import SupprimerCompteButton from "@/components/SupprimerCompteButton";
import DeclarerPaiementButton from "@/components/DeclarerPaiementButton";

/**
 * Le statut affiché distingue explicitement "dossier reçu" et "réclamation
 * réellement transmise à la compagnie". Sans cette distinction, un client
 * pouvait lire "En cours" alors que rien n'était parti.
 */
const STATUT_DOSSIER = {
  SOUMIS: {
    libelle: "Dossier reçu",
    detail: "Votre mandat est enregistré. Nous préparons la réclamation.",
    pilule: "pilule-revue",
    icone: "document",
  },
  EN_COURS: {
    libelle: "Réclamation transmise",
    detail: "La compagnie a reçu votre réclamation. Les délais de réponse varient.",
    pilule: "pilule-attente",
    icone: "sablier",
  },
  PAYE: {
    libelle: "Indemnisation reçue",
    detail: "La compagnie a payé.",
    pilule: "pilule-eligible",
    icone: "coche-cercle",
  },
  REFUSE: {
    libelle: "Refusé",
    detail: "La compagnie a rejeté la réclamation. Vous ne devez rien.",
    pilule: "pilule-ineligible",
    icone: "interdit",
  },
} as const;

function formaterDate(valeur: string | null) {
  if (!valeur) return null;
  return new Date(valeur).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default async function DashboardPage() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect("/login?next=/dashboard");
  }

  const { data: dossiers } = await supabase
    .from("claims")
    .select(
      "id, numero_vol, date_vol, aeroport_depart, aeroport_arrivee, compagnie, montant_estime, devise, statut_dossier, created_at, reclamation_envoyee_le, montant_recupere, commission_due, commission_encaissee_le, paiement_declare_le, montant_declare"
    )
    .order("created_at", { ascending: false });

  return (
    <main className="conteneur-etroit py-14 sm:py-20">
      <h1 className="titre text-[1.875rem] sm:text-[2.5rem]">Mes dossiers</h1>

      {(!dossiers || dossiers.length === 0) && (
        <div className="carte mt-8 p-8 text-center">
          <p className="text-[15px] text-[var(--texte-attenue)]">
            Aucun dossier pour l&apos;instant.
          </p>
          <a href="/check" className="bouton bouton-primaire mt-4 inline-flex">
            Vérifier un vol
          </a>
        </div>
      )}

      <div className="mt-8 flex flex-col gap-4">
        {dossiers?.map((dossier) => {
          const statut =
            STATUT_DOSSIER[dossier.statut_dossier as keyof typeof STATUT_DOSSIER] ??
            STATUT_DOSSIER.SOUMIS;
          const nomIcone = statut.icone as NomIcone;
          const envoyeeLe = formaterDate(dossier.reclamation_envoyee_le);

          return (
            <div key={dossier.id} className="carte p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="font-semibold">
                    Vol {dossier.numero_vol} · {dossier.aeroport_depart} →{" "}
                    {dossier.aeroport_arrivee}
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--texte-attenue)]">
                    {dossier.date_vol}
                  </p>
                </div>
                {dossier.montant_recupere !== null ? (
                  <div className="text-right">
                    <p className="chiffres text-xl font-bold text-[var(--color-succes-600)]">
                      {dossier.montant_recupere} {dossier.devise}
                    </p>
                    <p className="text-xs text-[var(--texte-attenue)]">reçus</p>
                  </div>
                ) : (
                  dossier.montant_estime !== null && (
                    <div className="text-right">
                      <p className="chiffres text-xl font-bold">
                        {dossier.montant_estime} {dossier.devise}
                      </p>
                      <p className="text-xs text-[var(--texte-attenue)]">estimés</p>
                    </div>
                  )
                )}
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-3">
                <span className={`pilule ${statut.pilule}`}>
                  <Icone nom={nomIcone} taille={15} />
                  {statut.libelle}
                </span>
                {envoyeeLe && (
                  <span className="text-sm text-[var(--texte-attenue)]">
                    Transmise le {envoyeeLe}
                  </span>
                )}
              </div>

              <p className="mt-3 text-sm leading-relaxed text-[var(--texte-attenue)]">
                {statut.detail}
              </p>

              <FriseDossier
                etapeCourante={etapeDuDossier(dossier)}
                refuse={dossier.statut_dossier === "REFUSE"}
              />

              {dossier.commission_due !== null && (
                <p className="mt-3 border-t border-[var(--bordure)] pt-3 text-sm text-[var(--texte-attenue)]">
                  Commission de service :{" "}
                  <span className="chiffres font-semibold text-[var(--texte)]">
                    {dossier.commission_due} {dossier.devise}
                  </span>
                  {dossier.commission_encaissee_le
                    ? " · réglée, dossier clos."
                    : " · à régler après réception de votre virement."}
                </p>
              )}

              {!dossier.reclamation_envoyee_le && (
                <div className="mt-4 flex justify-end">
                  <EnvoyerLettreButton claimId={dossier.id} />
                </div>
              )}

              {/* Transmise mais pas encore réglée : c'est le seul moment où
                  le client peut nous apprendre qu'il a été payé. */}
              {dossier.reclamation_envoyee_le &&
                dossier.statut_dossier === "EN_COURS" &&
                !dossier.paiement_declare_le && (
                  <div className="mt-4 flex justify-end">
                    <DeclarerPaiementButton
                      claimId={dossier.id}
                      devise={dossier.devise ?? "EUR"}
                    />
                  </div>
                )}

              {dossier.paiement_declare_le && dossier.statut_dossier !== "PAYE" && (
                <p className="mt-3 border-t border-[var(--bordure)] pt-3 text-sm text-[var(--texte-attenue)]">
                  Vous avez déclaré avoir reçu{" "}
                  <span className="chiffres font-semibold text-[var(--texte)]">
                    {dossier.montant_declare} {dossier.devise}
                  </span>{" "}
                  le {formaterDate(dossier.paiement_declare_le)}. Nous vérifions
                  et vous envoyons la facture correspondante.
                </p>
              )}
            </div>
          );
        })}
      </div>

      <div className="mt-10 border-t border-[var(--bordure)] pt-6">
        <SupprimerCompteButton />
      </div>
    </main>
  );
}
