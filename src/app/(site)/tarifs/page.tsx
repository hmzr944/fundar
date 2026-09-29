import type { Metadata } from "next";
import Link from "next/link";
import { InkField } from "@/components/landing/ink-field";
import { FeeSimulator } from "@/components/site/fee-simulator";
import { LinkButton } from "@/components/ui";
import { currentUser } from "@/lib/http";
import { eurosShort, feeFor } from "@/lib/fee";
import { integrationStatus } from "@/server/deps";

export const metadata: Metadata = {
  title: "Tarifs",
  description: "Analyse gratuite. Une commission seulement si votre problème est réglé.",
};


export default async function Pricing() {
  const [user, integ] = [await currentUser(), integrationStatus()];
  const billing = integ.billing;
  const cta = user ? { href: "/app", label: "Ouvrir mon espace" } : { href: "/signup", label: "Commencer" };

  return (
    <div className="space-y-24 lg:space-y-32">
      {billing.enabled && billing.mode === "success" ? (
        <>
          {/* Hero: the promise on the left, the simulator (the proof) on the right. */}
          <section className="grid items-center gap-10 lg:grid-cols-12 lg:gap-14">
            <div className="lg:col-span-6">
              <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-[-0.035em] sm:text-6xl xl:text-7xl">
                <span className="line-mask">
                  <span>Vous payez</span>
                </span>{" "}
                <span className="line-mask">
                  <span style={{ ["--reveal-delay" as string]: "90ms" }}>si ça marche.</span>
                </span>
              </h1>
              <p className="hero-in mt-7 max-w-md text-lg text-muted" style={{ ["--reveal-delay" as string]: "300ms" }}>
                L&apos;analyse et le premier courrier sont gratuits. Une commission seulement quand vous déclarez le problème réglé.
              </p>
            </div>
            <div className="hero-in lg:col-span-6" style={{ ["--reveal-delay" as string]: "200ms" }}>
              <FeeSimulator fee={billing.fee} plusDiscountPct={billing.plus?.feeDiscountPct} />
            </div>
          </section>

          {/* The terms, one tile each. */}
          <section aria-labelledby="conditions">
            <h2 id="conditions" className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Les conditions, en clair
            </h2>
            <div className="mt-10 grid gap-4 md:grid-cols-6 lg:auto-rows-[11rem]">
              <article className="tile-in view-in flex flex-col justify-between rounded-3xl bg-accent p-6 text-accent-contrast md:col-span-3 lg:row-span-2">
                <p className="font-sans text-7xl font-semibold tracking-tight sm:text-8xl">{billing.fee.ratePct} %</p>
                <div>
                  <h3 className="font-display text-xl font-bold">De ce que vous récupérez</h3>
                  <p className="mt-1 text-sm opacity-85">
                    Au moins {eurosShort(billing.fee.minCents)} €, au plus {eurosShort(billing.fee.maxCents)} € pour un litige courant.
                  </p>
                </div>
              </article>
              <article className="glass view-in rounded-3xl p-6 md:col-span-3">
                <h3 className="font-display text-xl font-bold">Analyse gratuite</h3>
                <p className="mt-2 text-sm text-muted">
                  Atlas lit votre dossier et vous dit s&apos;il peut s&apos;en occuper. Le premier courrier est rédigé sans carte bancaire.
                </p>
              </article>
              <article className="glass view-in rounded-3xl p-6 md:col-span-3 lg:col-span-2">
                <h3 className="font-display text-xl font-bold">Résultat sans argent</h3>
                <p className="mt-2 text-sm text-muted">
                  Résiliation obtenue, service rétabli : forfait de {eurosShort(billing.fee.flatCents)} €.
                </p>
              </article>
              <article className="glass-ink view-in rounded-3xl p-6 md:col-span-6 lg:col-span-1">
                <h3 className="text-sm text-elev/75">Plafond</h3>
                <p className="mt-1 font-sans text-3xl font-semibold">{eurosShort(Math.max(billing.fee.maxCents, billing.fee.tier2CapCents))} €</p>
                <p className="mt-1 text-xs text-elev/70">quel que soit le montant</p>
              </article>
            </div>
            {billing.fee.tier2CapCents > billing.fee.maxCents && (
              <p className="view-in mt-6 max-w-2xl text-sm text-muted">
                Au-delà de {eurosShort(Math.ceil((billing.fee.maxCents * 100) / billing.fee.ratePct))} € récupérés, la commission n&apos;augmente
                plus que de {billing.fee.tier2RatePct} % du surplus. Exemple : pour 1 500 € récupérés, {eurosShort(feeFor(billing.fee, 150_000))} €.
              </p>
            )}
          </section>

          {/* What is never charged: a statement grid, same family as the landing's limits. */}
          <section aria-labelledby="jamais">
            <h2 id="jamais" className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
              Ce qui n&apos;est jamais facturé
            </h2>
            <dl className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
              {[
                { t: "Un dossier qui n'aboutit pas", d: "Pas de résultat, pas de commission. Votre carte n'est pas débitée." },
                { t: "Les relances", d: "Atlas relance autant de fois que nécessaire, sans supplément." },
                { t: "Un abonnement imposé", d: "Aucun engagement. Vous payez dossier par dossier, seulement s'il est réglé." },
                { t: "La décision", d: "C'est vous qui déclarez le problème réglé, et le montant obtenu." },
              ].map((l) => (
                <div key={l.t} className="view-in relative pt-5">
                  <span aria-hidden className="absolute inset-x-0 top-0 h-0.5 bg-fg" />
                  <dt className="font-display text-xl font-bold">{l.t}</dt>
                  <dd className="mt-2 max-w-md text-muted">{l.d}</dd>
                </div>
              ))}
            </dl>
          </section>

          {(billing.plus || integ.postal.enabled) && (
            <section aria-labelledby="options" className={billing.plus && integ.postal.enabled ? "grid gap-4 md:grid-cols-2" : "grid gap-4 md:max-w-2xl"}>
              <h2 id="options" className="sr-only">
                Options
              </h2>
              {billing.plus && (
                <article className="glass view-in shine rounded-3xl p-7">
                  <h3 className="font-display text-2xl font-bold">Atlas Plus</h3>
                  <p className="mt-1 font-sans text-lg">{eurosShort(billing.plus.priceCents)} € par mois, sans engagement</p>
                  <p className="mt-3 text-sm text-muted">
                    {billing.plus.feeDiscountPct} % de commission en moins sur chaque dossier réglé, et {billing.plus.costMultiplier} fois plus de
                    recherche pour les dossiers complexes. Utile si vous avez plusieurs litiges en cours.
                  </p>
                </article>
              )}
              {integ.postal.enabled && (
                <article className="glass view-in shine rounded-3xl p-7">
                  <h3 className="font-display text-2xl font-bold">Lettre recommandée</h3>
                  <p className="mt-1 font-sans text-lg">{eurosShort(integ.postal.priceCents)} € par envoi</p>
                  <p className="mt-3 text-sm text-muted">
                    Imprimée et postée pour vous avec accusé de réception. Payée à l&apos;envoi, car elle coûte dès qu&apos;elle part, quel que
                    soit le résultat.
                  </p>
                </article>
              )}
            </section>
          )}
        </>
      ) : (
        <section className="grid items-end gap-10 lg:grid-cols-12">
          <div className="lg:col-span-7">
            <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-[-0.035em] sm:text-6xl xl:text-7xl">
              <span className="line-mask">
                <span>{billing.enabled ? "Un prix fixe," : "L'analyse"}</span>
              </span>{" "}
              <span className="line-mask">
                <span style={{ ["--reveal-delay" as string]: "90ms" }}>{billing.enabled ? "connu d'avance." : "est gratuite."}</span>
              </span>
            </h1>
            <p className="hero-in mt-7 max-w-md text-lg text-muted" style={{ ["--reveal-delay" as string]: "300ms" }}>
              {billing.enabled
                ? "Vous payez une fois, au moment où Atlas prend votre dossier en charge. Aucun supplément ensuite."
                : "Aucun paiement n'est demandé sur ce site pour le moment. Décrivez votre problème, Atlas vous dit ce qu'il peut faire."}
            </p>
          </div>
          <div className="glass-ink hero-in shine rounded-3xl p-8 lg:col-span-5" style={{ ["--reveal-delay" as string]: "200ms" }}>
            <p className="text-sm text-elev/75">{billing.enabled ? "Prise en charge d'un dossier" : "Pour l'instant"}</p>
            <p className="mt-2 font-sans text-6xl font-semibold">{billing.enabled ? `${eurosShort(billing.priceCents)} €` : "0 €"}</p>
            <p className="mt-2 text-sm text-elev/75">{billing.enabled ? "TTC, paiement unique" : "Analyse et courriers inclus"}</p>
          </div>
        </section>
      )}

      {/* Closing call to action over the ink field, as on the landing. */}
      <section className="relative isolate overflow-hidden rounded-3xl border border-line">
        <InkField className="absolute inset-0 -z-10" />
        <div className="flex flex-col items-start justify-between gap-8 px-6 py-16 sm:px-10 md:flex-row md:items-end lg:py-20">
          <div>
            <p className="max-w-xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">Un problème qui traîne ? Décrivez-le.</p>
            <p className="mt-4 text-sm text-muted">
              Une question sur les tarifs ?{" "}
              <Link href="/faq" className="text-sky underline underline-offset-4 hover:no-underline">
                Consultez les questions fréquentes
              </Link>
              .
            </p>
          </div>
          <LinkButton href={cta.href} variant="primary" className="px-6 py-3 text-base">
            {cta.label}
          </LinkButton>
        </div>
      </section>
    </div>
  );
}
