"use client";

import { useMemo, useState } from "react";
import { CtaLink, TextLink, cx } from "@/components/ui";
import {
  FLAT_INDEMNITY_CENTS,
  PUBLIC_LATE_RATE_PCT,
  actionDirecte,
  euros,
  factureImpayee,
  frDate,
  interetsMoratoires,
  retenueDeGarantie,
  type PublicBuyer,
} from "@/lib/btp";

type Kind = "retenue" | "public" | "sous" | "facture";
type Row = { id: number; a: string; b: string; c: string; buyer: PublicBuyer };

const SECTIONS: { kind: Kind; title: string; help: string; a: string; b: string; c?: string; price: string }[] = [
  { kind: "retenue", title: "Retenues de garantie", help: "Un chantier réceptionné dont les 5 % ne vous ont pas été rendus.", a: "Date de réception", b: "Montant des travaux (€ TTC)", price: "49 € HT" },
  { kind: "public", title: "Factures de marchés publics payées en retard", help: "Mairie, département, hôpital, office HLM…", a: "Facture reçue par l'acheteur le", b: "Montant (€ TTC)", c: "Payée le (vide si pas encore)", price: "39 € HT" },
  { kind: "sous", title: "Sous-traitance non payée", help: "L'entreprise principale ne vous paie pas.", a: "Mise en demeure envoyée le (vide si pas encore)", b: "Montant dû (€ TTC)", price: "149 € HT" },
  { kind: "facture", title: "Situations ou factures impayées", help: "Un client professionnel en retard de paiement.", a: "Échéance de paiement", b: "Montant dû (€ TTC)", price: "79 € HT" },
];

type Line = { kind: Kind; label: string; amountCents: number; when: Date | null; note: string; urgent: boolean; ready: boolean };

const cents = (v: string) => Math.max(0, Math.round(Number(v.replace(/\s/g, "").replace(",", ".")) * 100) || 0);
const date = (v: string) => (v ? new Date(`${v}T00:00:00Z`) : null);

let nextId = 1;
const blank = (a = "", b = ""): Row => ({ id: nextId++, a, b, c: "", buyer: "etat" });

/** Inventory of the money blocked on the visitor's sites, deadline by deadline. Nothing leaves the browser. */
export function Diagnostic({ initialReception, initialWorks, today }: { initialReception?: string; initialWorks?: string; today: string }) {
  const [rows, setRows] = useState<Record<Kind, Row[]>>(() => ({
    retenue: [blank(initialReception ?? "", initialWorks ?? "")],
    public: [],
    sous: [],
    facture: [],
  }));
  const now = useMemo(() => new Date(`${today}T00:00:00Z`), [today]);

  const lines = useMemo(() => {
    const out: Line[] = [];
    for (const r of rows.retenue) {
      const rec = date(r.a);
      if (!rec || !cents(r.b)) continue;
      const x = retenueDeGarantie({ receptionDate: rec, worksCents: cents(r.b), today: now });
      out.push({
        kind: "retenue",
        label: `Retenue, chantier réceptionné le ${frDate(rec)}`,
        amountCents: x.maxAmountCents,
        when: x.releaseDate,
        note: x.claimable ? "à réclamer maintenant" : `à réclamer dans ${x.daysLeft} jours`,
        urgent: x.claimable,
        ready: x.claimable,
      });
    }
    for (const r of rows.public) {
      const rec = date(r.a);
      if (!rec || !cents(r.b)) continue;
      const x = interetsMoratoires({ receivedDate: rec, amountCents: cents(r.b), buyer: r.buyer, paidDate: date(r.c), today: now });
      if (!x.daysLate) {
        out.push({ kind: "public", label: `Marché public, échéance du ${frDate(x.dueDate)}`, amountCents: 0, when: x.dueDate, note: "pas encore en retard", urgent: false, ready: false });
        continue;
      }
      const unpaid = r.c ? 0 : cents(r.b);
      out.push({
        kind: "public",
        label: `Marché public, ${x.daysLate} jours de retard`,
        amountCents: unpaid + x.interestCents + x.indemnityCents,
        when: x.dueDate,
        note: `dont ${euros(x.interestCents + x.indemnityCents)} d'intérêts et d'indemnité`,
        urgent: true,
        ready: true,
      });
    }
    for (const r of rows.sous) {
      if (!cents(r.b)) continue;
      const notice = date(r.a);
      if (!notice) {
        out.push({ kind: "sous", label: "Sous-traitance impayée", amountCents: cents(r.b), when: null, note: "mise en demeure à envoyer à l'entreprise principale", urgent: true, ready: true });
        continue;
      }
      const x = actionDirecte({ noticeDate: notice, today: now });
      out.push({
        kind: "sous",
        label: "Sous-traitance impayée",
        amountCents: cents(r.b),
        when: x.openDate,
        note: x.open ? "action directe possible contre le maître d'ouvrage" : `action directe possible dans ${x.daysLeft} jours`,
        urgent: x.open,
        ready: true,
      });
    }
    for (const r of rows.facture) {
      const due = date(r.a);
      if (!due || !cents(r.b)) continue;
      const x = factureImpayee({ dueDate: due, amountCents: cents(r.b), today: now });
      out.push({
        kind: "facture",
        label: `Facture échue le ${frDate(due)}`,
        amountCents: cents(r.b) + x.indemnityCents,
        when: due,
        note: x.daysLate ? `${x.daysLate} jours de retard, indemnité de 40 € comprise` : "pas encore échue",
        urgent: x.daysLate > 0,
        ready: x.daysLate > 0,
      });
    }
    // Most urgent first, then by date.
    return out.sort((p, q) => Number(q.urgent) - Number(p.urgent) || (p.when?.getTime() ?? 0) - (q.when?.getTime() ?? 0));
  }, [rows, now]);

  const total = lines.reduce((s, l) => s + l.amountCents, 0);
  const ready = lines.filter((l) => l.ready).length;

  const update = (kind: Kind, id: number, patch: Partial<Row>) =>
    setRows((s) => ({ ...s, [kind]: s[kind].map((r) => (r.id === id ? { ...r, ...patch } : r)) }));

  return (
    <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
      <div className="space-y-4 lg:col-span-7">
        {SECTIONS.map((sec, si) => (
          <fieldset key={sec.kind} className="glass tile-in rounded-2xl p-5 sm:p-6" style={{ ["--i" as string]: si }}>
            <legend className="sr-only">{sec.title}</legend>
            <div className="flex flex-wrap items-baseline justify-between gap-2">
              <h2 className="font-display text-xl font-bold">{sec.title}</h2>
              <span className="text-sm text-muted">{sec.price} le dossier</span>
            </div>
            <p className="mt-1 text-sm text-muted">{sec.help}</p>

            {rows[sec.kind].map((r, i) => (
              <div key={r.id} className="msg-in mt-4 grid gap-3 border-t border-line pt-4 sm:grid-cols-2">
                <Input label={sec.a} type="date" value={r.a} max={today} onChange={(v) => update(sec.kind, r.id, { a: v })} />
                <Input label={sec.b} inputMode="decimal" value={r.b} onChange={(v) => update(sec.kind, r.id, { b: v.replace(/[^\d.,\s]/g, "") })} />
                {sec.c && <Input label={sec.c} type="date" value={r.c} max={today} onChange={(v) => update(sec.kind, r.id, { c: v })} />}
                {sec.kind === "public" && (
                  <label className="block text-sm">
                    <span className="mb-1.5 block font-medium">Acheteur</span>
                    <select
                      value={r.buyer}
                      onChange={(e) => update(sec.kind, r.id, { buyer: e.target.value as PublicBuyer })}
                      className="w-full rounded-lg border border-line-strong bg-elev px-3 py-2 outline-none focus:border-accent"
                    >
                      <option value="etat">État ou collectivité (30 jours)</option>
                      <option value="hopital">Établissement public de santé (50 jours)</option>
                      <option value="entreprisePublique">Entreprise publique (60 jours)</option>
                    </select>
                  </label>
                )}
                <button
                  type="button"
                  onClick={() => setRows((s) => ({ ...s, [sec.kind]: s[sec.kind].filter((x) => x.id !== r.id) }))}
                  className="justify-self-start text-sm text-muted underline-offset-4 hover:text-fg hover:underline sm:col-span-2"
                >
                  Retirer {sec.kind === "retenue" ? "ce chantier" : "cette ligne"}
                  <span className="sr-only"> {i + 1}</span>
                </button>
              </div>
            ))}

            <button
              type="button"
              onClick={() => setRows((s) => ({ ...s, [sec.kind]: [...s[sec.kind], blank()] }))}
              className="mt-4 inline-flex min-h-10 items-center rounded-full border border-line-strong px-4 text-sm font-medium transition-colors hover:border-accent hover:text-accent"
            >
              {rows[sec.kind].length ? "Ajouter une ligne" : "Ajouter"}
            </button>
          </fieldset>
        ))}
      </div>

      {/* The answer, always in view on large screens. */}
      <aside className="lg:sticky lg:top-24 lg:col-span-5" aria-labelledby="bilan">
        <div className="glass-ink rounded-3xl p-6 sm:p-7" aria-live="polite">
          <h2 id="bilan" className="text-sm text-white/70">
            Vous pouvez réclamer jusqu&apos;à
          </h2>
          <p key={total} className="tick mt-1 font-sans text-5xl font-semibold tabular-nums">
            {euros(total)}
          </p>
          <p className="mt-1 text-sm text-white/70">
            {lines.length ? `${ready} dossier${ready > 1 ? "s" : ""} prêt${ready > 1 ? "s" : ""} à lancer` : "Renseignez au moins une ligne."}
          </p>

          {lines.length > 0 && (
            <ol className="mt-6 space-y-3 border-t border-white/15 pt-5">
              {lines.map((l, i) => (
                <li key={i} className="msg-in grid grid-cols-[1fr_auto] gap-x-4 text-sm">
                  <span>{l.label}</span>
                  <span className="text-right font-medium tabular-nums">{l.amountCents ? euros(l.amountCents) : "à venir"}</span>
                  <span className={cx("col-span-2", l.urgent ? "text-[#f3b8b9]" : "text-white/60")}>
                    {l.note}
                    {l.when && !l.urgent ? `, le ${frDate(l.when, false)}` : ""}
                  </span>
                </li>
              ))}
            </ol>
          )}

          <div className="mt-7 flex flex-wrap items-center gap-5">
            <CtaLink href="/signup">Lancer mes dossiers</CtaLink>
            <TextLink href="/contact?sujet=diagnostic" className="text-sm text-white! [background-image:none]! underline underline-offset-4">
              Être rappelé
            </TextLink>
          </div>
        </div>
        <p className="mt-4 text-xs text-muted">
          Estimation à vérifier sur vos pièces : la retenue est au plus de 5 % ; les intérêts publics sont calculés au taux indicatif de{" "}
          {String(PUBLIC_LATE_RATE_PCT).replace(".", ",")} %, plus {euros(FLAT_INDEMNITY_CENTS)} d&apos;indemnité. Vos chiffres restent dans votre navigateur.
        </p>
      </aside>
    </div>
  );
}

function Input({ label, onChange, ...props }: Omit<React.ComponentProps<"input">, "onChange"> & { label: string; onChange: (v: string) => void }) {
  return (
    <label className="block text-sm">
      <span className="mb-1.5 block font-medium">{label}</span>
      <input
        {...props}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-line-strong bg-elev px-3 py-2 tabular-nums outline-none focus:border-accent"
      />
    </label>
  );
}
