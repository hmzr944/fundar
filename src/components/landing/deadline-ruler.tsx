"use client";

import { useId, useMemo, useState } from "react";
import Link from "next/link";
import { CountUp } from "@/components/count-up";
import { addMonths, daysBetween, euros, frDate, retenueDeGarantie } from "@/lib/btp";

const fmtEuros = (c: number) => euros(c);

const MONTHS = ["janv.", "févr.", "mars", "avr.", "mai", "juin", "juil.", "août", "sept.", "oct.", "nov.", "déc."];

/**
 * A carpenter's rule graduated in months: the site's reception, today, and the
 * day the 5 % retenue de garantie can be claimed. The visitor types their own
 * dates; the stamp re-lands each time the answer changes.
 */
export function DeadlineRuler({ defaultReception, today }: { defaultReception: string; today: string }) {
  const id = useId();
  const [reception, setReception] = useState(defaultReception);
  const [works, setWorks] = useState("20000");

  const view = useMemo(() => {
    const now = new Date(`${today}T00:00:00Z`);
    const rec = new Date(`${reception || defaultReception}T00:00:00Z`);
    const worksCents = Math.max(0, Math.round(Number(works.replace(",", ".")) * 100) || 0);
    const r = retenueDeGarantie({ receptionDate: rec, worksCents, today: now });
    // The window always shows reception, release and today, with a month of margin.
    const first = new Date(Math.min(rec.getTime(), now.getTime()));
    const last = new Date(Math.max(r.releaseDate.getTime(), now.getTime()));
    const start = addMonths(new Date(Date.UTC(first.getUTCFullYear(), first.getUTCMonth(), 1)), -1);
    const end = addMonths(new Date(Date.UTC(last.getUTCFullYear(), last.getUTCMonth(), 1)), 2);
    const span = daysBetween(start, end);
    const at = (d: Date) => Math.min(100, Math.max(0, (daysBetween(start, d) / span) * 100));
    const months: { left: number; label: string; year: boolean }[] = [];
    for (let m = start; m < end; m = addMonths(m, 1)) {
      months.push({ left: at(m), label: MONTHS[m.getUTCMonth()], year: m.getUTCMonth() === 0 });
    }
    return { r, rec, now, months, pos: { rec: at(rec), release: at(r.releaseDate), today: at(now) } };
  }, [reception, works, today, defaultReception]);

  const { r } = view;
  const status = r.claimable
    ? r.daysLeft === 0
      ? "récupérable aujourd'hui"
      : `récupérable depuis ${-r.daysLeft} jour${-r.daysLeft > 1 ? "s" : ""}`
    : `récupérable dans ${r.daysLeft} jour${r.daysLeft > 1 ? "s" : ""}`;
  const query = new URLSearchParams({ reception, montant: works });

  return (
    <div className="glass rounded-3xl p-5 sm:p-7" data-testid="deadline-ruler">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block text-sm" htmlFor={`${id}-rec`}>
          <span className="mb-1.5 block font-medium">Réception du chantier</span>
          <input
            id={`${id}-rec`}
            type="date"
            value={reception}
            max={today}
            onChange={(e) => setReception(e.target.value)}
            className="w-full rounded-lg border border-line-strong bg-elev px-3 py-2 tabular-nums outline-none focus:border-accent"
          />
        </label>
        <label className="block text-sm" htmlFor={`${id}-works`}>
          <span className="mb-1.5 block font-medium">Montant des travaux (€ TTC)</span>
          <input
            id={`${id}-works`}
            inputMode="decimal"
            value={works}
            onChange={(e) => setWorks(e.target.value.replace(/[^\d.,]/g, ""))}
            className="w-full rounded-lg border border-line-strong bg-elev px-3 py-2 tabular-nums outline-none focus:border-accent"
          />
        </label>
      </div>

      {/* The rule itself */}
      <div className="relative mt-8 pb-8 pt-14" aria-hidden>
        <div className="ruler relative h-12 overflow-hidden rounded-md border border-line-strong">
          {view.months.map((m, i) => (
            <div key={i} className="absolute inset-y-0" style={{ left: `${m.left}%` }}>
              <span className="ruler-tick block h-5 w-px bg-fg" style={{ ["--i" as string]: i }} />
            </div>
          ))}
          {/* Waiting period, reception to release */}
          <span
            className="absolute bottom-0 h-1.5 bg-sky/70 transition-[left,width] duration-500"
            style={{ left: `${view.pos.rec}%`, width: `${Math.max(0, view.pos.release - view.pos.rec)}%` }}
          />
        </div>

        <Marker left={view.pos.rec} tone="ink" label="Réception" />
        {/* Month names sit above the marker lines, on a paper chip, so a line never crosses them. */}
        <div className="pointer-events-none absolute inset-x-0 top-[4.6rem]">
          {view.months.map((m, i) => (
            <span
              key={i}
              className={`absolute ml-1 rounded-sm bg-elev px-0.5 text-[0.65rem] leading-none tabular-nums max-sm:[&:nth-child(even)]:hidden ${m.year ? "font-semibold text-fg" : "text-muted"}`}
              style={{ left: `${m.left}%` }}
            >
              {m.label}
            </span>
          ))}
        </div>
        <Marker left={view.pos.today} tone="today" label="Aujourd'hui" />
        <span
          key={`${reception}-${r.claimable}`}
          className="stamp absolute top-0 -translate-x-1/2 whitespace-nowrap rounded-md border-2 border-accent px-2 py-1 text-xs font-semibold text-accent"
          style={{ left: `${view.pos.release}%` }}
        >
          Retenue récupérable
        </span>
        <span className="absolute top-8 h-[4.5rem] w-0.5 -translate-x-1/2 bg-accent transition-[left] duration-500" style={{ left: `${view.pos.release}%` }} />
      </div>

      <div className="mt-5 flex flex-col gap-4 border-t border-line pt-5 sm:flex-row sm:items-end sm:justify-between">
        <div aria-live="polite">
          <p className="text-sm text-muted">
            Le {frDate(r.releaseDate)}, {status}
          </p>
          <p className="font-sans text-3xl font-semibold tabular-nums">
            jusqu&apos;à <CountUp value={r.maxAmountCents} format={fmtEuros} className="inline-block" />
          </p>
        </div>
        <Link href={`/diagnostic?${query}`} className="text-link text-sm">
          Vérifier tous mes chantiers
        </Link>
      </div>
    </div>
  );
}

function Marker({ left, tone, label }: { left: number; tone: "ink" | "today"; label: string }) {
  // The line crosses the rule; its label sits underneath, clear of the stamp above.
  return (
    <span className="absolute top-14 -translate-x-1/2 transition-[left] duration-500" style={{ left: `${left}%` }}>
      <span className={`mx-auto block h-12 w-0 ${tone === "today" ? "border-l-2 border-dashed border-accent" : "border-l-2 border-fg"}`} />
      <span className={`mt-1 block whitespace-nowrap text-[0.7rem] font-medium ${tone === "today" ? "text-accent" : "text-fg"}`}>{label}</span>
    </span>
  );
}
