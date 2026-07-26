import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import {
  PaperPlaneTilt,
  HourglassMedium,
  CheckCircle,
  Prohibit,
} from "@phosphor-icons/react/dist/ssr";
import EnvoyerLettreButton from "@/components/EnvoyerLettreButton";
import SupprimerCompteButton from "@/components/SupprimerCompteButton";

const STATUT_DOSSIER = {
  SOUMIS: { libelle: "Soumis", pilule: "pilule-revue", icone: PaperPlaneTilt },
  EN_COURS: { libelle: "En cours", pilule: "pilule-attente", icone: HourglassMedium },
  PAYE: { libelle: "Payé", pilule: "pilule-eligible", icone: CheckCircle },
  REFUSE: { libelle: "Refusé", pilule: "pilule-ineligible", icone: Prohibit },
} as const;

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
      "id, numero_vol, date_vol, aeroport_depart, aeroport_arrivee, compagnie, montant_estime, devise, statut_dossier, created_at"
    )
    .order("created_at", { ascending: false });

  return (
    <main className="conteneur-etroit py-14 sm:py-20">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">Mes dossiers</h1>

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
          const Icone = statut.icone;

          return (
            <div key={dossier.id} className="carte p-6">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="text-sm font-bold">
                    Vol {dossier.numero_vol} · {dossier.aeroport_depart} →{" "}
                    {dossier.aeroport_arrivee}
                  </p>
                  <p className="mt-0.5 text-sm text-[var(--texte-attenue)]">{dossier.date_vol}</p>
                </div>
                {dossier.montant_estime !== null && (
                  <p className="text-xl font-extrabold tabular-nums text-[var(--color-accent-500)]">
                    {dossier.montant_estime} {dossier.devise}
                  </p>
                )}
              </div>

              <div className="mt-4 flex items-center justify-between gap-3">
                <span className={`pilule ${statut.pilule}`}>
                  <Icone size={14} weight="bold" />
                  {statut.libelle}
                </span>
                {dossier.statut_dossier === "SOUMIS" && (
                  <EnvoyerLettreButton claimId={dossier.id} />
                )}
              </div>
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
