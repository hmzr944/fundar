import { currentUser } from "@/lib/http";
import { LegalFooter } from "@/components/legal-footer";
import { SiteHeader } from "@/components/site-header";
import { DeadlineRuler } from "@/components/landing/deadline-ruler";
import { HowItWorks } from "@/components/landing/how-it-works";
import { InkField } from "@/components/landing/ink-field";
import { LandingMotion } from "@/components/landing/landing-motion";
import { Ambient, CtaLink, LOGO_PATH, TextLink, cx, mainCta } from "@/components/ui";
import { addMonths } from "@/lib/btp";

/*
 * Design plan. Subject: second-œuvre companies (1-20 people) owed money by
 * contractors, developers and public buyers. The page's one bold element is
 * the carpenter's rule in the hero: a real tool, graduated in months, where
 * the visitor sees the day their retenue de garantie can be claimed. Around
 * it, everything stays quiet: paper, ink, one seal red for what is owed.
 * Each kind of blocked money is shown as the document it lives on (the
 * reception report, the subcontracting contract, the public invoice), with
 * the rule and the deadline that make it claimable.
 */

const claims: { title: string; doc: string; rule: string; delay: string; price: string; tone?: "ink" | "seal"; cell: string; figure?: string }[] = [
  {
    title: "Retenue de garantie",
    doc: "Procès-verbal de réception",
    rule: "Les 5 % retenus doivent vous être rendus un an après la réception, sauf opposition motivée du client. Beaucoup ne sont jamais réclamés.",
    delay: "1 an après la réception",
    price: "49 € HT le dossier",
    tone: "ink",
    cell: "lg:col-span-7 lg:row-span-2",
    figure: "5 %",
  },
  {
    title: "Action directe du sous-traitant",
    doc: "Contrat de sous-traitance",
    rule: "L'entreprise principale ne paie pas ? Un mois après votre mise en demeure, vous pouvez réclamer au maître d'ouvrage.",
    delay: "1 mois après la mise en demeure",
    price: "149 € HT le dossier",
    tone: "seal",
    cell: "lg:col-span-5",
  },
  {
    title: "Intérêts des marchés publics",
    doc: "Facture sur marché public",
    rule: "Au-delà de 30 jours, l'acheteur public vous doit des intérêts de retard et 40 € d'indemnité, sans que vous ayez à les demander.",
    delay: "Dès le 31e jour",
    price: "39 € HT le dossier",
    cell: "lg:col-span-5",
  },
  {
    title: "Situation de travaux impayée",
    doc: "Situation ou facture de chantier",
    rule: "Relance, mise en demeure en recommandé, puis requête en injonction de payer prête à déposer.",
    delay: "Dès l'échéance dépassée",
    price: "79 € HT le dossier",
    cell: "lg:col-span-12",
  },
];

const steps = [
  { title: "Diagnostic de vos chantiers", text: "En 10 minutes, la liste de ce que vous pouvez réclamer, et avant quelle date." },
  { title: "Nimbrel prépare le dossier", text: "Courriers rédigés à partir de vos pièces, montants et dates vérifiés, délais calculés." },
  { title: "Vous validez et envoyez", text: "Sous votre nom, en recommandé avec accusé de réception, en un clic." },
  { title: "Nimbrel surveille la suite", text: "Relance à l'échéance, puis l'étape suivante : maître d'ouvrage, injonction de payer." },
];

const limits = [
  { title: "Vous restez l'expéditeur", text: "Chaque courrier part sous votre nom, après votre validation. Rien n'est envoyé sans vous." },
  { title: "L'argent vous est versé directement", text: "Nimbrel ne touche jamais les sommes récupérées et ne prend aucune commission." },
  { title: "Pas de conseil juridique", text: "Si votre client conteste le fond (malfaçon, avenant), on vous oriente vers un avocat." },
  { title: "Pas d'huissier", text: "La signification et l'exécution forcée restent l'affaire d'un commissaire de justice." },
];

const terms = ["Retenue de garantie", "Situation impayée", "Action directe", "Intérêts moratoires", "Paiement direct", "Décompte non soldé", "Mise en demeure", "Injonction de payer"];

export default async function Landing() {
  const user = await currentUser();
  const cta = mainCta(Boolean(user));
  const today = new Date();
  const iso = (d: Date) => d.toISOString().slice(0, 10);
  const todayIso = iso(today);
  const defaultReception = iso(addMonths(new Date(`${todayIso}T00:00:00Z`), -11));

  return (
    <div className="min-h-dvh overflow-x-clip">
      <Ambient />
      <SiteHeader signedIn={Boolean(user)} />

      <main>
        {/* 1. The promise, and the rule that proves it. */}
        <section data-hero className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-10 sm:px-6 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-12 lg:gap-12 lg:px-10 lg:pb-12 lg:pt-4">
          <div data-hero-copy className="lg:col-span-5">
            <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-[-0.035em] sm:text-6xl xl:text-[4.25rem]">
              <span className="line-mask">
                <span>L&apos;argent de vos chantiers</span>
              </span>{" "}
              <span className="line-mask">
                <span style={{ ["--reveal-delay" as string]: "90ms" }}>a une date limite.</span>
              </span>
            </h1>
            <p className="hero-in mt-7 max-w-md text-lg text-muted" style={{ ["--reveal-delay" as string]: "350ms" }}>
              Retenues de garantie, situations impayées, intérêts des marchés publics : Nimbrel prépare les courriers et surveille les délais. Vous
              envoyez, sous votre nom.
            </p>
            <div className="hero-in mt-9 flex flex-wrap items-center gap-6" style={{ ["--reveal-delay" as string]: "500ms" }}>
              <CtaLink href={cta.href} size="lg">
                {cta.label}
              </CtaLink>
              <TextLink href="/tarifs" className="text-sm">
                Voir les tarifs
              </TextLink>
            </div>
          </div>
          <div data-hero-photo className="hero-in lg:col-span-7" style={{ ["--reveal-delay" as string]: "200ms" }}>
            <DeadlineRuler defaultReception={defaultReception} today={todayIso} />
          </div>
        </section>

        {/* The one marquee: the words of the trade. */}
        <div className="border-y border-line/70 py-6" aria-label="Ce que Nimbrel récupère">
          <div className="overflow-hidden">
            <div className="marquee">
              {[0, 1].map((copy) => (
                <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 font-display text-3xl font-bold tracking-tight text-sky sm:text-4xl">
                  {terms.map((t) => (
                    <li key={t} className="flex items-center gap-10 pr-10">
                      <span>{t}</span>
                      <svg viewBox="0 0 48 34" className="h-5 w-7 shrink-0 text-accent" fill="none" aria-hidden>
                        <path d={LOGO_PATH} stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>

        {/* 2. What sleeps in the sites: each claim on the document it lives on. */}
        <section aria-labelledby="creances" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
          <h2 id="creances" data-split-heading className="max-w-2xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Ce qui dort dans vos chantiers
          </h2>
          <div data-tiles className="mt-10 grid gap-4 lg:auto-rows-[minmax(13rem,auto)] lg:grid-cols-12">
            {claims.map((c) => (
              <article
                key={c.title}
                data-tile
                className={cx(
                  "shine flex flex-col justify-between gap-6 rounded-2xl p-6 sm:p-7",
                  c.tone === "ink" ? "glass-ink" : c.tone === "seal" ? "bg-accent text-accent-contrast" : "glass",
                  c.cell,
                )}
              >
                <div>
                  <p className={cx("text-sm", c.tone ? "opacity-75" : "text-muted")}>{c.doc}</p>
                  <h3 className={cx("mt-1 font-display font-bold leading-tight", c.tone === "ink" ? "text-3xl sm:text-4xl" : "text-2xl")}>{c.title}</h3>
                  <p className={cx("mt-3 max-w-xl", c.tone ? "opacity-85" : "text-muted")}>{c.rule}</p>
                </div>
                {c.figure && (
                  <p aria-hidden className="font-sans text-[6rem] font-semibold leading-none tracking-tight text-white/90 sm:text-[9rem]">
                    {c.figure}
                  </p>
                )}
                <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                  <span className={cx("rounded-full border px-3 py-1", c.tone ? "border-current/30" : "border-line-strong")}>{c.delay}</span>
                  <span className="font-medium">{c.price}</span>
                </div>
              </article>
            ))}
          </div>
        </section>

        {/* 3. The real sequence, pinned. */}
        <section id="fonctionnement" aria-labelledby="fonctionnement-titre" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-10 lg:pb-32">
          <h2 id="fonctionnement-titre" data-split-heading className="mb-12 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:mb-8">
            Fonctionnement
          </h2>
          <HowItWorks steps={steps} />
        </section>

        {/* 4. One statement, read word by word. */}
        <section className="bg-sky-strong text-white">
          <div className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-10 lg:py-36">
            <p data-scrub-words className="max-w-4xl font-display text-4xl font-bold leading-[1.08] tracking-tight sm:text-6xl">
              Sur un chantier de <span className="font-sans">20 000 €</span>, la retenue de garantie, c&apos;est jusqu&apos;à <span className="font-sans">1 000 €</span> qui vous attendent.
            </p>
            <p className="mt-6 max-w-md text-lg text-white/75">Encore faut-il la réclamer au bon moment, au bon interlocuteur, avec les bonnes pièces.</p>
          </div>
        </section>

        {/* 5. What Nimbrel does not do: a statement grid, no cards. */}
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
          <h2 data-split-heading className="font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Ce que Nimbrel ne fait pas
          </h2>
          <dl className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {limits.map((l) => (
              <div key={l.title} className="relative pt-5">
                <span data-rule aria-hidden className="absolute inset-x-0 top-0 h-0.5 origin-left bg-fg" />
                <dt className="font-display text-xl font-bold">{l.title}</dt>
                <dd className="mt-2 max-w-md text-muted">{l.text}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-14 max-w-2xl text-sm text-muted">
            Nimbrel est un outil d&apos;aide à la rédaction et au suivi, propulsé par une intelligence artificielle. Prix fixe par dossier, payé
            d&apos;avance. Aucune commission sur les sommes récupérées.
          </p>
        </section>

        {/* 6. Closing call to action over the ink field. */}
        <section className="relative isolate overflow-hidden border-t border-line bg-bg">
          <InkField className="absolute inset-0 -z-10" />
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 py-24 sm:px-6 md:flex-row md:items-end lg:px-10 lg:py-32">
            <p className="max-w-xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">Combien dort dans vos chantiers ?</p>
            <CtaLink href={cta.href} size="lg">
              {cta.label}
            </CtaLink>
          </div>
        </section>
      </main>

      <LegalFooter />
      <LandingMotion />
    </div>
  );
}
