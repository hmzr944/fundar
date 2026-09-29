"use client";

import { useId, useState } from "react";
import { discountedFee, eurosShort, feeFor, type FeeTerms } from "@/lib/fee";

const euros = (cents: number) => `${eurosShort(cents)} €`;

/** Move the amount, see the commission: the pricing explained by using it. */
export function FeeSimulator({ fee, plusDiscountPct }: { fee: FeeTerms; plusDiscountPct?: number }) {
  const id = useId();
  const [amount, setAmount] = useState(150);
  const [money, setMoney] = useState(true);
  const [plus, setPlus] = useState(false);
  const base = feeFor(fee, money ? amount * 100 : 0);
  const due = plus && plusDiscountPct ? discountedFee(base, plusDiscountPct) : base;
  const kept = money ? amount * 100 - due : null;

  return (
    <div className="glass-ink shine rounded-3xl p-6 sm:p-8" data-testid="fee-simulator">
      <div role="radiogroup" aria-label="Type de résultat" className="inline-flex rounded-full bg-white/10 p-1 text-sm">
        {[
          { v: true, label: "Somme récupérée" },
          { v: false, label: "Autre résultat" },
        ].map((o) => (
          <button
            key={o.label}
            type="button"
            role="radio"
            aria-checked={money === o.v}
            onClick={() => setMoney(o.v)}
            className="whitespace-nowrap rounded-full px-3.5 py-1.5 transition-colors aria-checked:bg-elev aria-checked:text-fg"
          >
            {o.label}
          </button>
        ))}
      </div>

      {money ? (
        <div className="mt-7">
          <label htmlFor={id} className="flex items-baseline justify-between gap-4 text-sm text-elev/80">
            Montant récupéré
            <span className="font-sans text-2xl font-semibold text-elev tabular-nums">{euros(amount * 100)}</span>
          </label>
          <input
            id={id}
            type="range"
            min={10}
            max={2000}
            step={10}
            value={amount}
            onChange={(e) => setAmount(Number(e.target.value))}
            className="mt-3 w-full accent-[var(--accent)]"
          />
          <div className="mt-1 flex justify-between text-xs text-elev/60" aria-hidden>
            <span>10 €</span>
            <span>2 000 €</span>
          </div>
        </div>
      ) : (
        <p className="mt-7 text-sm text-elev/80">Un abonnement résilié, un service rétabli, une réponse obtenue : un forfait fixe.</p>
      )}

      <div className="mt-8 grid grid-cols-2 gap-4 border-t border-white/15 pt-6">
        <div>
          <p className="text-sm text-elev/70">Commission</p>
          <p key={due} className="tick mt-1 font-sans text-4xl font-semibold tabular-nums" aria-live="polite">
            {euros(due)}
          </p>
        </div>
        {kept !== null && (
          <div>
            <p className="text-sm text-elev/70">Vous gardez</p>
            <p key={kept} className="tick mt-1 font-sans text-4xl font-semibold tabular-nums">
              {euros(kept)}
            </p>
          </div>
        )}
      </div>

      {plusDiscountPct ? (
        <label className="mt-6 flex cursor-pointer items-center gap-3 text-sm text-elev/85">
          <input type="checkbox" checked={plus} onChange={(e) => setPlus(e.target.checked)} className="h-4 w-4 accent-[var(--accent)]" />
          Avec Atlas Plus ({plusDiscountPct} % de commission en moins)
        </label>
      ) : null}
      <p className="mt-6 text-sm text-elev/70">Et si le problème n&apos;est pas réglé : 0 €.</p>
    </div>
  );
}
