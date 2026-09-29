import { currentUser } from "@/lib/http";
import { LegalFooter } from "@/components/legal-footer";
import { Photo } from "@/components/illustrations";
import { HowItWorks } from "@/components/landing/how-it-works";
import { InkField } from "@/components/landing/ink-field";
import { LandingMotion } from "@/components/landing/landing-motion";
import { ParallaxBand } from "@/components/landing/parallax-band";
import { Ambient, LinkButton, Logo, LOGO_PATH, cx } from "@/components/ui";
import { describeFee, eurosShort } from "@/lib/fee";
import { unsplash } from "@/lib/photos";
import { billingConfig } from "@/server/billing/stripe";

// Bento: six cells for six cases, each with a photo of what the text describes.
// The big tile and the two colour/photo splits break the grid's rhythm.
const cases: { title: string; text: string; photo: string; tone?: "accent" | "ink"; cell: string }[] = [
  {
    title: "Un colis jamais arrivé",
    text: "Le vendeur ne rembourse pas, le transporteur renvoie vers le vendeur.",
    photo: "ICaUOZ0PL70",
    cell: "lg:col-span-3 lg:row-span-2",
  },
  {
    title: "Une facture contestée",
    text: "Frais injustifiés, régularisation énorme, erreur de facturation.",
    photo: "3CLPBgNuX40",
    cell: "lg:col-span-3",
  },
  {
    title: "Une caution non rendue",
    text: "Le délai est dépassé et le bailleur ne répond plus.",
    photo: "3HfGnyPfWqQ",
    tone: "accent",
    cell: "lg:col-span-3",
  },
  {
    title: "Un abonnement impossible à arrêter",
    text: "Les prélèvements continuent malgré la résiliation.",
    photo: "Q59HmzK38eQ",
    cell: "lg:col-span-2",
  },
  {
    title: "Un remboursement qui n'arrive pas",
    text: "Vol annulé, commande annulée, avoir imposé au lieu d'un remboursement.",
    photo: "mqvE1ctiW6Y",
    tone: "ink",
    cell: "lg:col-span-2",
  },
  {
    title: "Une réclamation sans réponse",
    text: "Service client muet, relances ignorées, médiateur à saisir.",
    photo: "WEmqaN6eh8o",
    cell: "lg:col-span-2",
  },
];

const steps = [
  { title: "Vous décrivez le problème", text: "En quelques phrases, avec vos documents (factures, e-mails, contrat)." },
  { title: "Atlas vous dit s'il peut s'en occuper", text: "Analyse gratuite. Il vous dit ce qu'il va demander, à qui, et pourquoi." },
  { title: "Atlas prépare et vérifie tout", text: "Courriers relus et vérifiés : chaque montant et chaque date sont contrôlés dans vos pièces." },
  { title: "Vous envoyez en un clic, Atlas suit", text: "Il reprend le dossier seul à l'échéance : relance, médiateur, jusqu'au bout." },
];

const limits = [
  { title: "Pas de conseil juridique", text: "Atlas ne vous représente pas en justice et ne garantit pas le résultat." },
  { title: "Rien ne part sans vous", text: "C'est vous qui envoyez, en un clic, les courriers qu'il a préparés." },
  { title: "Aucun accès à vos comptes", text: "Atlas ne se connecte à aucun de vos comptes. Aucun mot de passe demandé." },
  { title: "Réglé quand vous le dites", text: "Un dossier n'est marqué réglé que lorsque vous le confirmez." },
];

export default async function Landing() {
  const user = await currentUser();
  const billing = billingConfig();
  const pricing = !billing
    ? ""
    : billing.mode === "success"
      ? ` Premier courrier rédigé gratuitement, sans carte bancaire. Vous ne payez que si votre problème est réglé : ${describeFee(billing.fee)}. Sinon, rien.`
      : ` Prise en charge du dossier : ${eurosShort(billing.priceCents)} € TTC, paiement unique.`;
  const cta = user ? { href: "/app", label: "Ouvrir mon espace" } : { href: "/signup", label: "Commencer" };

  return (
    <div className="min-h-dvh overflow-x-clip">
      <Ambient />
      <div className="glass sticky top-0 z-40 rounded-none border-x-0 border-t-0">
      <header className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-10">
        <Logo className="text-lg" />
        <nav className="flex items-center gap-2">
          {!user && (
            <LinkButton href="/login" variant="ghost">
              Se connecter
            </LinkButton>
          )}
          <LinkButton href={cta.href} variant="primary">
            {cta.label}
          </LinkButton>
        </nav>
      </header>
      </div>

      <main>
        {/* 1. Split hero; the photo bleeds off the right edge on large screens. */}
        <section data-hero className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-8 sm:px-6 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-12 lg:gap-0 lg:px-10 lg:pb-12 lg:pt-4">
          <div data-hero-copy className="lg:col-span-6 lg:pr-12">
            <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-[-0.035em] sm:text-7xl xl:text-8xl">
              <span className="line-mask">
                <span>Règle ça</span>
              </span>{" "}
              <span className="line-mask">
                <span style={{ ["--reveal-delay" as string]: "90ms" }}>pour moi.</span>
              </span>
            </h1>
            <p className="hero-in mt-7 max-w-md text-lg text-muted sm:text-xl" style={{ ["--reveal-delay" as string]: "350ms" }}>
              Un litige avec une entreprise ? Décrivez-le. Atlas rédige les courriers, les vérifie et relance jusqu&apos;au bout.
            </p>
            <div className="hero-in mt-9 flex flex-wrap items-center gap-6" style={{ ["--reveal-delay" as string]: "500ms" }}>
              <LinkButton href={cta.href} variant="primary" className="px-6 py-3 text-base" data-magnetic>
                {cta.label}
              </LinkButton>
              <a href="#fonctionnement" className="text-sm font-medium text-fg underline decoration-line-strong underline-offset-4 hover:decoration-accent">
                Voir comment ça marche
              </a>
            </div>
          </div>
          <div data-hero-photo className="relative h-[52vh] min-h-[340px] origin-left lg:col-span-6 lg:-mr-[max(2.5rem,calc((100vw_-_80rem)/2_+_2.5rem))] lg:h-[78vh]">
            <Photo
              src={unsplash("EahB9XZt310", 1600)}
              alt="Une personne rédige un courrier à son bureau"
              wipeIn
              delay={120}
              className="h-full w-full rounded-2xl lg:rounded-r-none"
            />
            <div aria-hidden className="pointer-events-none absolute inset-0 hidden sm:block">
              <span className="glass float-a absolute left-6 top-8 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium lg:-left-10">
                <span className="h-2 w-2 rounded-full bg-sky" /> Courrier relu et vérifié
              </span>
              <span className="glass float-b absolute right-8 top-1/2 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium">
                <span className="h-2 w-2 rounded-full bg-accent animate-atlas-pulse" /> Relance programmée
              </span>
              <span className="glass-ink float-c absolute bottom-10 left-10 flex items-center gap-2 rounded-full px-4 py-2 text-sm font-medium lg:-left-6">
                Réponse reçue
              </span>
            </div>
          </div>
        </section>

        {/* Marquee (the only one): the kinds of problems Atlas takes on. */}
        <div className="border-y border-line/70 py-6" aria-label="Exemples de litiges">
          <div className="overflow-hidden">
            <div className="marquee">
              {[0, 1].map((copy) => (
                <ul key={copy} aria-hidden={copy === 1} className="flex shrink-0 font-display text-3xl font-bold tracking-tight text-sky sm:text-4xl">
                  <li className="flex items-center gap-10 pr-10">
                    <span>Colis perdu</span>
                    <svg viewBox="0 0 48 34" className="h-5 w-7 shrink-0 text-accent" fill="none" aria-hidden>
                      <path d={LOGO_PATH} stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </li>
                  <li className="flex items-center gap-10 pr-10">
                    <span>Facture abusive</span>
                    <svg viewBox="0 0 48 34" className="h-5 w-7 shrink-0 text-accent" fill="none" aria-hidden>
                      <path d={LOGO_PATH} stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </li>
                  <li className="flex items-center gap-10 pr-10">
                    <span>Caution retenue</span>
                    <svg viewBox="0 0 48 34" className="h-5 w-7 shrink-0 text-accent" fill="none" aria-hidden>
                      <path d={LOGO_PATH} stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </li>
                  <li className="flex items-center gap-10 pr-10">
                    <span>Abonnement fantôme</span>
                    <svg viewBox="0 0 48 34" className="h-5 w-7 shrink-0 text-accent" fill="none" aria-hidden>
                      <path d={LOGO_PATH} stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </li>
                  <li className="flex items-center gap-10 pr-10">
                    <span>Vol annulé</span>
                    <svg viewBox="0 0 48 34" className="h-5 w-7 shrink-0 text-accent" fill="none" aria-hidden>
                      <path d={LOGO_PATH} stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </li>
                  <li className="flex items-center gap-10 pr-10">
                    <span>Service client muet</span>
                    <svg viewBox="0 0 48 34" className="h-5 w-7 shrink-0 text-accent" fill="none" aria-hidden>
                      <path d={LOGO_PATH} stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </li>
                  <li className="flex items-center gap-10 pr-10">
                    <span>Frais injustifiés</span>
                    <svg viewBox="0 0 48 34" className="h-5 w-7 shrink-0 text-accent" fill="none" aria-hidden>
                      <path d={LOGO_PATH} stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </li>
                  <li className="flex items-center gap-10 pr-10">
                    <span>Remboursement bloqué</span>
                    <svg viewBox="0 0 48 34" className="h-5 w-7 shrink-0 text-accent" fill="none" aria-hidden>
                      <path d={LOGO_PATH} stroke="currentColor" strokeWidth="3.4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </li>
                </ul>
              ))}
            </div>
          </div>
        </div>

        {/* 2. Bento of real cases: mixed sizes, photos and two colour tiles. */}
        <section aria-labelledby="exemples" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
          <h2 id="exemples" data-split-heading className="max-w-xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Ce qu&apos;on confie à Atlas
          </h2>
          <div data-tiles className="mt-10 grid gap-4 [perspective:1400px] sm:grid-cols-2 lg:auto-rows-[15rem] lg:grid-cols-6">
            {cases.map((c) => (
              <article key={c.title} data-tile data-tilt className={cx("photo-card shine group relative overflow-hidden rounded-2xl will-change-transform", c.cell)}>
                {c.tone ? (
                  <div
                    className={cx(
                      "grid h-full min-h-64 grid-rows-[1fr_auto] sm:grid-cols-[1.35fr_1fr] sm:grid-rows-1",
                      c.tone === "accent" ? "bg-accent text-accent-contrast" : "bg-sky-strong text-white",
                    )}
                  >
                    <Photo src={unsplash(c.photo, 700)} alt="" className="min-h-36 sm:order-2 sm:h-full" />
                    <div lang="fr" className="flex flex-col justify-end p-5 sm:p-6">
                      <h3 className="hyphens-auto font-display text-xl font-bold leading-tight lg:text-2xl">{c.title}</h3>
                      <p className="mt-2 text-sm opacity-85">{c.text}</p>
                    </div>
                  </div>
                ) : (
                  <div className="relative h-full min-h-64">
                    <Photo src={unsplash(c.photo, 900)} alt="" className="absolute inset-0 h-full w-full" />
                    <div
                      aria-hidden
                      className="absolute inset-0"
                      style={{ background: "linear-gradient(to top, color-mix(in srgb, var(--sky-strong) 88%, transparent), transparent 62%)" }}
                    />
                    <div className="absolute inset-x-0 bottom-0 p-5 text-white sm:p-6">
                      <h3 className="font-display text-xl font-bold leading-tight">{c.title}</h3>
                      <p className="mt-1.5 max-w-sm text-sm text-white/80">{c.text}</p>
                    </div>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* 3. The one pinned, scroll-driven story: the four steps. */}
        <section id="fonctionnement" aria-labelledby="fonctionnement-titre" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-10 lg:pb-32">
          <h2 id="fonctionnement-titre" data-split-heading className="mb-12 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:mb-8">
            Fonctionnement
          </h2>
          <HowItWorks steps={steps} />
        </section>

        {/* 4. Full-bleed band: one statement, scale shift. */}
        <ParallaxBand src={unsplash("qIjGJgZOpsM", 1920)}>
          <div className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-10 lg:py-40">
            <p data-scrub-words className="max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
              Les délais, c&apos;est Atlas qui les surveille.
            </p>
            <p className="mt-6 max-w-md text-lg text-white/80">
              Il reprend votre dossier seul à l&apos;échéance et relance jusqu&apos;à obtenir une réponse.
            </p>
          </div>
        </ParallaxBand>

        {/* 5. Limits and transparency: a statement grid, no cards. */}
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
          <h2 data-split-heading className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Ce qu&apos;Atlas ne fait pas</h2>
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
            Atlas est une intelligence artificielle. Analyse gratuite.{pricing}
          </p>
        </section>

        {/* 6. Closing call to action over the WebGL ink field (the page's ambient layer). */}
        <section className="relative isolate overflow-hidden border-t border-line bg-bg">
          <InkField className="absolute inset-0 -z-10" />
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 py-24 sm:px-6 md:flex-row md:items-end lg:px-10 lg:py-32">
            <p className="max-w-xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
              Un problème qui traîne ? Décrivez-le.
            </p>
            <LinkButton href={cta.href} variant="primary" className="px-6 py-3 text-base" data-magnetic>
              {cta.label}
            </LinkButton>
          </div>
        </section>
      </main>

      <LegalFooter />
      <LandingMotion />
    </div>
  );
}
