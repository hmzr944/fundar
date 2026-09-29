import type { Metadata } from "next";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { FirstSteps } from "@/components/first-steps";
import { MissionComposer } from "@/components/mission-composer";
import { MissionList } from "@/components/mission-list";
import { ReferralCard } from "@/components/referral-card";
import { SectionTitle } from "@/components/ui";
import { requirePageUser } from "@/lib/http";
import { integrationStatus } from "@/server/deps";
import { userResults } from "@/server/billing/service";
import { listMissions } from "@/server/missions/service";

export const metadata: Metadata = { title: "Tableau de bord" };

export default async function Dashboard() {
  const user = await requirePageUser();
  const db = getDb();
  const billing = integrationStatus().billing;
  const [needsAction, active, recent, referral] = await Promise.all([
    listMissions(db, user.id, { filter: "needs_action", limit: 6 }),
    listMissions(db, user.id, { filter: "active", limit: 6 }),
    listMissions(db, user.id, { limit: 6 }),
    db.query.users.findFirst({ where: eq(users.id, user.id), columns: { referralCode: true, creditCents: true } }),
  ]);
  const llm = integrationStatus().llm;
  const results = await userResults(db, user.id);
  return (
    <div className="space-y-10">
      <div>
        <h1 className="mb-5 font-display text-3xl font-bold tracking-tight">Bonjour{user.name ? ` ${user.name}` : ""}</h1>
        {results.resolvedCount > 0 && (
          <p className="mb-4 rounded-2xl border border-line bg-surface/60 px-5 py-3 text-sm" data-testid="results-counter">
            {results.recoveredCents > 0 ? (
              <>
                Récupéré avec Atlas : <strong className="text-accent">{(results.recoveredCents / 100).toFixed(2).replace(".", ",")} €</strong>
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

      {billing.enabled && billing.referralCreditCents !== undefined && billing.referralCreditCents > 0 && referral && (
        <ReferralCard code={referral.referralCode} creditCents={referral.creditCents} rewardCents={billing.referralCreditCents} />
      )}

      {recent.length === 0 ? (
        <FirstSteps />
      ) : (
        <>
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
        </>
      )}
    </div>
  );
}
