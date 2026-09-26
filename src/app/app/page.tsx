import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/db";
import { MissionComposer } from "@/components/mission-composer";
import { MissionList } from "@/components/mission-list";
import { SectionTitle } from "@/components/ui";
import { requirePageUser } from "@/lib/http";
import { integrationStatus } from "@/server/deps";
import { userResults } from "@/server/billing/service";
import { listMissions } from "@/server/missions/service";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function Dashboard() {
  const user = await requirePageUser();
  const db = getDb();
  const [needsAction, active, recent] = await Promise.all([
    listMissions(db, user.id, { filter: "needs_action", limit: 6 }),
    listMissions(db, user.id, { filter: "active", limit: 6 }),
    listMissions(db, user.id, { limit: 6 }),
  ]);
  const llm = integrationStatus().llm;
  const results = await userResults(db, user.id);
  return (
    <div className="space-y-10">
      <div>
        <h1 className="mb-4 text-2xl font-semibold tracking-tight">Bonjour{user.name ? ` ${user.name}` : ""}</h1>
        {results.resolvedCount > 0 && (
          <p className="mb-4 rounded-2xl border border-line bg-surface/60 px-5 py-3 text-sm" data-testid="results-counter">
            {results.recoveredCents > 0 ? (
              <>
                Atlas vous a fait récupérer <strong>{(results.recoveredCents / 100).toFixed(2).replace(".", ",")} €</strong>
                {` sur ${results.resolvedCount} dossier${results.resolvedCount > 1 ? "s" : ""} réglé${results.resolvedCount > 1 ? "s" : ""}.`}
              </>
            ) : (
              `${results.resolvedCount} problème${results.resolvedCount > 1 ? "s" : ""} réglé${results.resolvedCount > 1 ? "s" : ""} avec Atlas.`
            )}{" "}
            Un autre problème ? Décrivez-le ci-dessous.
          </p>
        )}
        <MissionComposer disabled={!llm.available} />
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="needs-action">
          <SectionTitle id="needs-action">Nécessitent votre attention</SectionTitle>
          <MissionList missions={needsAction} empty="Aucune mission n'attend votre action." />
        </section>
        <section aria-labelledby="active">
          <SectionTitle id="active">En cours</SectionTitle>
          <MissionList missions={active} empty="Aucune mission en cours." />
        </section>
      </div>

      <section aria-labelledby="recent">
        <SectionTitle
          id="recent"
          action={
            <Link href="/app/history" className="text-sm text-accent hover:underline">
              Tout l&apos;historique →
            </Link>
          }
        >
          Missions récentes
        </SectionTitle>
        <MissionList missions={recent} empty="Vous n'avez pas encore de mission. Décrivez votre premier objectif ci-dessus." />
      </section>
    </div>
  );
}
