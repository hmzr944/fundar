import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import EnvoyerLettreButton from "@/components/EnvoyerLettreButton";
import SupprimerCompteButton from "@/components/SupprimerCompteButton";

const LIBELLE_STATUT: Record<string, string> = {
  SOUMIS: "Soumis",
  EN_COURS: "En cours",
  PAYE: "Payé",
  REFUSE: "Refusé",
};

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
    <main className="page">
      <h1>Mes dossiers</h1>

      {(!dossiers || dossiers.length === 0) && (
        <p>
          Aucun dossier pour l&apos;instant. <a href="/check">Vérifiez un vol</a>{" "}
          pour commencer.
        </p>
      )}

      {dossiers?.map((dossier) => (
        <div key={dossier.id} className="verdict">
          <p>
            <strong>
              Vol {dossier.numero_vol} — {dossier.aeroport_depart} →{" "}
              {dossier.aeroport_arrivee}
            </strong>
          </p>
          <p>{dossier.date_vol}</p>
          {dossier.montant_estime !== null && (
            <p>
              Estimation : {dossier.montant_estime} {dossier.devise}
            </p>
          )}
          <p>Statut : {LIBELLE_STATUT[dossier.statut_dossier] ?? dossier.statut_dossier}</p>
          {dossier.statut_dossier === "SOUMIS" && (
            <EnvoyerLettreButton claimId={dossier.id} />
          )}
        </div>
      ))}

      <hr />
      <SupprimerCompteButton />
    </main>
  );
}
