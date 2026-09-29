import type { Metadata } from "next";
import type { CSSProperties } from "react";
import { eq } from "drizzle-orm";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { users } from "@/db/schema";
import { cx, formatDate, LinkButton, SectionTitle } from "@/components/ui";
import { requirePageUser } from "@/lib/http";
import { paymentHistory, type PaymentLine } from "@/server/billing/history";
import { isPlusActive } from "@/server/billing/plus";
import { integrationStatus } from "@/server/deps";
import { PortalButton } from "./portal-button";

export const metadata: Metadata = { title: "Paiements" };

const euros = (cents: number) => `${(cents / 100).toFixed(2).replace(".", ",")} €`;
const tile = (i: number) => ({ ["--i" as string]: i }) as CSSProperties;

const STATE: Record<PaymentLine["state"], { label: string; className: string }> = {
  paid: { label: "Réglé", className: "border-sky/30 bg-sky/10 text-sky" },
  due: { label: "À régler", className: "border-accent/40 bg-accent/10 text-accent" },
  authorized: { label: "Carte enregistrée", className: "border-line-strong bg-surface-2 text-muted" },
  pending: { label: "Non finalisé", className: "border-line bg-surface-2 text-faint" },
};

function describe(l: PaymentLine) {
  if (l.kind === "lrar") return l.state === "paid" ? "Lettre recommandée" : `Lettre recommandée non envoyée${l.failure ? ` : ${l.failure}` : ""}`;
  switch (l.state) {
    case "paid":
      return l.creditAppliedCents > 0 ? `Commission, dont ${euros(l.creditAppliedCents)} de crédit déduit` : "Commission de réussite";
    case "due":
      return l.failure ? `Commission à régler : ${l.failure}` : "Commission à régler";
    case "authorized":
      return "Rien à payer tant que le problème n'est pas réglé";
    case "pending":
      return "Paiement commencé puis abandonné";
  }
}

export default async function Payments() {
  const user = await requirePageUser();
  const billing = integrationStatus().billing;
  if (!billing.enabled) notFound();
  const db = getDb();
  const [history, account] = await Promise.all([
    paymentHistory(db, user.id),
    db.query.users.findFirst({ where: eq(users.id, user.id), columns: { cardSavedAt: true, stripeCustomerId: true, creditCents: true, plus: true } }),
  ]);
  const plusActive = isPlusActive(account?.plus);

  return (
    <div className="space-y-6">
      <div className="hero-in">
        <p className="text-sm text-muted">Votre compte</p>
        <h1 className="font-display text-3xl font-bold tracking-tight">Paiements</h1>
      </div>

      <div className="grid gap-4 md:grid-cols-6">
        <section className="glass-ink tile-in shine flex flex-col justify-between gap-6 rounded-3xl p-6 md:col-span-3 md:row-span-2" style={tile(0)} aria-labelledby="total-paid">
          <div>
            <h2 id="total-paid" className="text-sm text-elev/70">
              Total réglé
            </h2>
            <p className="mt-2 font-sans text-5xl font-semibold tracking-tight">{euros(history.paidCents)}</p>
          </div>
          <p className="max-w-sm text-sm text-elev/80">
            Vous ne payez une commission que sur un problème réglé. Tant qu&apos;Atlas n&apos;a pas obtenu de résultat, votre carte n&apos;est pas débitée.
          </p>
        </section>

        <section className="glass tile-in rounded-3xl p-6 md:col-span-3" style={tile(1)} aria-labelledby="card">
          <h2 id="card" className="font-display text-lg font-bold">
            Moyen de paiement
          </h2>
          <p className="mt-1 text-sm text-muted">
            {account?.cardSavedAt
              ? `Carte enregistrée le ${formatDate(account.cardSavedAt)}. Changez-la ou téléchargez vos factures sur la page sécurisée de notre prestataire.`
              : "Aucune carte enregistrée. Elle vous sera demandée quand vous confierez un dossier à Atlas."}
          </p>
          {account?.stripeCustomerId && <PortalButton className="mt-4" />}
        </section>

        <section className="glass tile-in rounded-3xl p-6 md:col-span-3 lg:col-span-1 lg:col-start-4" style={tile(2)} aria-labelledby="due">
          <h2 id="due" className="text-sm text-muted">
            À régler
          </h2>
          <p className={cx("mt-1 font-sans text-2xl font-semibold", history.dueCents > 0 && "text-accent")}>{euros(history.dueCents)}</p>
        </section>

        <section className="glass tile-in rounded-3xl p-6 md:col-span-3 lg:col-span-1" style={tile(3)} aria-labelledby="credit">
          <h2 id="credit" className="text-sm text-muted">
            Crédit disponible
          </h2>
          <p className="mt-1 font-sans text-2xl font-semibold">{euros(account?.creditCents ?? 0)}</p>
        </section>

        <section className="glass tile-in rounded-3xl p-6 md:col-span-6 lg:col-span-1" style={tile(4)} aria-labelledby="plus">
          <h2 id="plus" className="text-sm text-muted">
            Atlas Plus
          </h2>
          <p className="mt-1 font-medium">{plusActive ? "Actif" : "Inactif"}</p>
          {billing.plus && (
            <Link href="/app/settings" className="mt-1 inline-block text-sm text-sky hover:underline">
              {plusActive ? "Gérer" : "Découvrir"}
            </Link>
          )}
        </section>
      </div>

      <section className="glass tile-in rounded-3xl p-2 sm:p-3" style={tile(5)} aria-labelledby="history">
        <div className="px-4 pt-3">
          <SectionTitle id="history">Historique</SectionTitle>
        </div>
        {history.lines.length === 0 ? (
          <div className="px-4 pb-5">
            <p className="text-sm text-muted">Aucun paiement pour l&apos;instant. Ils apparaîtront ici, dossier par dossier.</p>
            <LinkButton href="/app" className="mt-4">
              Décrire un problème
            </LinkButton>
          </div>
        ) : (
          <ul className="divide-y divide-line" data-testid="payment-history">
            {history.lines.map((l) => (
              <li key={`${l.kind}-${l.id}`} className="flex flex-col gap-2 rounded-2xl px-4 py-3.5 transition-colors hover:bg-surface-2/60 sm:flex-row sm:items-center sm:gap-4">
                <div className="min-w-0 flex-1">
                  <Link href={`/app/missions/${l.missionId}`} className="block truncate font-medium hover:underline">
                    {l.title}
                  </Link>
                  <p className="text-sm text-muted">
                    {describe(l)} · {formatDate(l.date)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  {l.amountCents !== null && <span className="font-sans font-semibold tabular-nums">{euros(l.amountCents)}</span>}
                  <span className={cx("rounded-full border px-2.5 py-0.5 text-xs", STATE[l.state].className)}>{STATE[l.state].label}</span>
                  {l.state === "due" && l.payLinkUrl && (
                    <a href={l.payLinkUrl} className="text-sm font-medium text-accent hover:underline">
                      Régler
                    </a>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
