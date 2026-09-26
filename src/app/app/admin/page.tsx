import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getDb } from "@/db";
import { Card, SectionTitle } from "@/components/ui";
import { requirePageUser } from "@/lib/http";
import { isAdmin, loadEconomics, MIN_SAMPLE, UNCLOSED_AFTER_DAYS, type Economics } from "@/server/admin/economics";

export const metadata: Metadata = { title: "Économie" };

const eur = (cents: number) => `${(cents / 100).toFixed(2).replace(".", ",")} €`;
const pct = (x: number | null) => (x === null ? "—" : `${Math.round(x * 100)} %`);
const tone = { stop: "border-danger/40 bg-danger/5", watch: "border-warning/40 bg-warning/5", ok: "border-success/40 bg-success/5" };
const label = { stop: "À corriger", watch: "À surveiller", ok: "Bon signe" };

export default async function Admin() {
  const user = await requirePageUser();
  if (!isAdmin(user.email)) notFound();
  const db = getDb();
  const [month, all] = await Promise.all([loadEconomics(db, 30), loadEconomics(db, null)]);
  return (
    <div className="max-w-5xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Économie d&apos;Atlas</h1>
        <p className="mt-1 text-sm text-muted">
          Chaque dossier rapporte-t-il plus qu&apos;il ne coûte ? Homejoy et Magic ont grandi avant de le savoir. Chiffres tirés de ce
          qu&apos;Atlas a enregistré ; coûts IA, frais Stripe et cotisations estimés. Stripe fait foi pour l&apos;argent encaissé. Les dossiers
          supprimés ne sont pas comptés.
        </p>
      </div>

      <Card data-testid="economics-alerts">
        <SectionTitle>Leçons des autres : où en est Atlas (depuis le début)</SectionTitle>
        {all.alerts.length === 0 ? (
          <p className="text-sm text-muted">Aucune alerte.</p>
        ) : (
          <ul className="space-y-2">
            {all.alerts.map((a) => (
              <li key={a.lesson + a.message} className={`rounded-lg border p-3 text-sm ${tone[a.level]}`} data-level={a.level}>
                <p className="font-medium">
                  {label[a.level]} — {a.lesson}
                </p>
                <p className="mt-1">{a.message}</p>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        <Figures title="30 derniers jours" e={month} />
        <Figures title="Depuis le début" e={all} />
      </div>
    </div>
  );
}

function Figures({ title, e }: { title: string; e: Economics }) {
  const rows: [string, string][] = [
    ["Demandes analysées", String(e.analysed)],
    ["Dont acceptables par Atlas", String(e.eligible)],
    ["Dossiers pris en charge", `${e.taken} (${pct(e.takeRate)} des acceptables)`],
    ["Réglés / sans succès / en cours", `${e.resolved} / ${e.failed} / ${e.open}`],
    ["Taux de réussite (dossiers clôturés)", pct(e.successRate)],
    [`Jamais clôturés après ${UNCLOSED_AFTER_DAYS} j`, `${e.neverClosed} (${pct(e.neverClosedRate)})`],
    ["Dossiers avec échec ou arrêt", pct(e.troubledRate)],
    ["Clients revenus avec un 2e dossier", `${e.returning} sur ${e.customers}`],
    ["Récupéré par les clients (déclaré)", eur(e.recoveredCents)],
  ];
  const money: [string, string][] = [
    ["Commissions encaissées", eur(e.revenueCents)],
    ["Commissions dues non réglées", eur(e.unpaidFeesCents)],
    ["− Frais Stripe (estimés)", eur(e.stripeCents)],
    ["− IA des dossiers pris en charge", eur(e.aiTakenCents)],
    ["− IA des analyses gratuites non suivies", eur(e.aiFreeCents)],
    ["− Cotisations sociales (≈ 21 %)", eur(e.chargesCents)],
  ];
  return (
    <Card>
      <SectionTitle>{title}</SectionTitle>
      <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 text-sm">
        {rows.map(([k, v]) => (
          <Row key={k} k={k} v={v} />
        ))}
      </dl>
      <dl className="mt-4 grid grid-cols-[1fr_auto] gap-x-4 gap-y-1.5 border-t border-line pt-4 text-sm">
        {money.map(([k, v]) => (
          <Row key={k} k={k} v={v} />
        ))}
        <dt className="font-medium">Reste pour vous (hors frais fixes)</dt>
        <dd className={`text-right font-semibold ${e.marginCents < 0 ? "text-danger" : ""}`} data-testid="economics-margin">
          {eur(e.marginCents)}
        </dd>
        <dt className="text-muted">Par dossier pris en charge</dt>
        <dd className="text-right">{e.marginPerTakenCents === null ? "—" : eur(e.marginPerTakenCents)}</dd>
      </dl>
      {!e.enoughData && <p className="mt-3 text-xs text-muted">Moins de {MIN_SAMPLE} dossiers clôturés : ces taux ne permettent pas encore de conclure.</p>}
    </Card>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  return (
    <>
      <dt className="text-muted">{k}</dt>
      <dd className="text-right tabular-nums">{v}</dd>
    </>
  );
}
