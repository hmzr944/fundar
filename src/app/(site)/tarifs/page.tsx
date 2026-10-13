import type { Metadata } from "next";
import { InkField } from "@/components/landing/ink-field";
import { CtaLink, TextLink, mainCta } from "@/components/ui";
import { currentUser } from "@/lib/http";
import { FOLLOW_UP, OFFERS, eurosHT } from "@/lib/offers";

export const metadata: Metadata = {
  title: "Tarifs",
  description: "Un prix fixe par dossier, payé d'avance. Aucune commission sur les sommes récupérées.",
};

/* The price list is laid out as the document the trade knows best: a quote. */
export default async function Pricing() {
  const cta = mainCta(Boolean(await currentUser()));

  return (
    <div className="space-y-20 lg:space-y-28">
      <section className="max-w-3xl">
        <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-[-0.035em] sm:text-6xl xl:text-7xl">
          <span className="line-mask">
            <span>Un prix par dossier.</span>
          </span>{" "}
          <span className="line-mask">
            <span style={{ ["--reveal-delay" as string]: "90ms" }}>Pas de commission.</span>
          </span>
        </h1>
        <p className="hero-in mt-7 max-w-xl text-lg text-muted" style={{ ["--reveal-delay" as string]: "300ms" }}>
          Vous savez ce que vous payez avant de commencer. Ce que vous récupérez vous est versé directement, en entier.
        </p>
      </section>

      {/* The quote. */}
      <section aria-labelledby="devis" className="hero-in" style={{ ["--reveal-delay" as string]: "200ms" }}>
        <div className="relative overflow-hidden rounded-2xl border border-line-strong bg-elev shadow-[0_30px_60px_-40px_color-mix(in_srgb,var(--sky-strong)_60%,transparent)]">
          <header className="flex flex-wrap items-end justify-between gap-4 border-b border-line px-5 py-5 sm:px-8">
            <div>
              <h2 id="devis" className="font-display text-2xl font-bold">
                Devis type
              </h2>
              <p className="text-sm text-muted">Prix hors taxes, recommandés avec accusé de réception compris.</p>
            </div>
            <span aria-hidden className="stamp rounded-md border-2 border-accent px-2.5 py-1 text-sm font-semibold text-accent">
              Prix fixe
            </span>
          </header>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="text-muted">
                <tr className="border-b border-line">
                  <th scope="col" className="px-5 py-3 font-medium sm:px-8">
                    Désignation
                  </th>
                  <th scope="col" className="px-5 py-3 text-right font-medium sm:px-8">
                    Prix
                  </th>
                </tr>
              </thead>
              <tbody>
                {OFFERS.map((o, i) => (
                  <tr key={o.id} className="write-in border-b border-line align-top" style={{ ["--i" as string]: i }}>
                    <th scope="row" className="px-5 py-5 font-normal sm:px-8">
                      <span className="block font-display text-lg font-bold">{o.title}</span>
                      <ul className="mt-2 space-y-1 text-muted">
                        {o.includes.map((x) => (
                          <li key={x} className="flex gap-2">
                            <span aria-hidden className="mt-2 h-1 w-1 shrink-0 rounded-full bg-accent" />
                            {x}
                          </li>
                        ))}
                      </ul>
                    </th>
                    <td className="whitespace-nowrap px-5 py-5 text-right sm:px-8">
                      <span className="font-sans text-xl font-semibold tabular-nums">{eurosHT(o.priceCentsHT)}</span>
                      <span className="block text-muted">{o.unit}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="write-in bg-sky-strong text-white">
                  <th scope="row" className="px-5 py-5 font-display text-lg font-bold sm:px-8">
                    Commission sur les sommes récupérées
                  </th>
                  <td className="px-5 py-5 text-right font-sans text-2xl font-semibold tabular-nums sm:px-8">0 €</td>
                </tr>
              </tfoot>
            </table>
          </div>
        </div>
      </section>

      {/* The recurring option, and what is free. */}
      <section aria-label="Options" className="grid gap-4 md:grid-cols-5">
        <article className="glass view-in shine rounded-2xl p-7 md:col-span-3">
          <h2 className="font-display text-2xl font-bold">{FOLLOW_UP.title}</h2>
          <p className="mt-1 font-sans text-lg">
            {eurosHT(FOLLOW_UP.priceCentsHT)} {FOLLOW_UP.unit}, sans engagement
          </p>
          <p className="mt-3 max-w-lg text-muted">{FOLLOW_UP.text}</p>
        </article>
        <article className="view-in rounded-2xl bg-accent p-7 text-accent-contrast md:col-span-2">
          <h2 className="font-display text-2xl font-bold">Diagnostic gratuit</h2>
          <p className="mt-3 opacity-85">La liste de ce que vous pouvez réclamer, et avant quelle date. Sans inscription.</p>
          <TextLink href="/diagnostic" className="mt-5 inline-block text-sm text-accent-contrast! [background-image:none]! underline underline-offset-4">
            Faire mon diagnostic
          </TextLink>
        </article>
      </section>

      <section className="relative isolate overflow-hidden rounded-3xl border border-line">
        <InkField className="absolute inset-0 -z-10" />
        <div className="flex flex-col items-start justify-between gap-8 px-6 py-16 sm:px-10 md:flex-row md:items-end lg:py-20">
          <div>
            <p className="max-w-xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">Combien dort dans vos chantiers ?</p>
            <p className="mt-4 text-sm text-muted">
              Une question sur les tarifs ? <TextLink href="/faq">Consultez les questions fréquentes</TextLink>.
            </p>
          </div>
          <CtaLink href={cta.href} size="lg">
            {cta.label}
          </CtaLink>
        </div>
      </section>
    </div>
  );
}
