import { currentUser } from "@/lib/http";
import { LegalFooter } from "@/components/legal-footer";
import { Photo } from "@/components/illustrations";
import { HowItWorks } from "@/components/landing/how-it-works";
import { ParallaxBand } from "@/components/landing/parallax-band";
import { LinkButton, Logo, cx } from "@/components/ui";
import { describeFee, eurosShort } from "@/lib/fee";
import { unsplash } from "@/lib/photos";
import { billingConfig } from "@/server/billing/stripe";

type Case = { title: string; text: string } & ({ photo: string } | { tone: "accent" | "ink" });

// Bento: six cells for six cases; the big tile and two colour tiles break the grid's rhythm.
const cases: (Case & { cell: string })[] = [
  {
    title: "Un colis jamais arrivé",
    text: "Le vendeur ne rembourse pas, le transporteur renvoie vers le vendeur.",
    photo: "ICaUOZ0PL70",
    cell: "lg:col-span-3 lg:row-span-2",
  },
  {
    title: "Une facture contestée",
    text: "Frais injustifiés, régularisation énorme, erreur de facturation.",
    photo: "zR7nFjjIAWE",
    cell: "lg:col-span-3",
  },
  {
    title: "Une caution non rendue",
    text: "Le délai est dépassé et le bailleur ne répond plus.",
    tone: "accent",
    cell: "lg:col-span-3",
  },
  {
    title: "Un abonnement impossible à arrêter",
    text: "Les prélèvements continuent malgré la résiliation.",
    photo: "JSk0OT2Klac",
    cell: "lg:col-span-2",
  },
  {
    title: "Un remboursement qui n'arrive pas",
    text: "Vol annulé, commande annulée, avoir imposé au lieu d'un remboursement.",
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

      <main>
        {/* 1. Split hero; the photo bleeds off the right edge on large screens. */}
        <section className="mx-auto grid max-w-7xl items-center gap-10 px-4 pb-16 pt-8 sm:px-6 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-12 lg:gap-0 lg:px-10 lg:pb-12 lg:pt-4">
          <div className="lg:col-span-6 lg:pr-12">
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
              <LinkButton href={cta.href} variant="primary" className="px-6 py-3 text-base">
                {cta.label}
              </LinkButton>
              <a href="#fonctionnement" className="text-sm font-medium text-fg underline decoration-line-strong underline-offset-4 hover:decoration-accent">
                Voir comment ça marche
              </a>
            </div>
          </div>
          <div className="relative h-[52vh] min-h-[340px] lg:col-span-6 lg:-mr-[max(2.5rem,calc((100vw_-_80rem)/2_+_2.5rem))] lg:h-[78vh]">
            <Photo
              src={unsplash("EahB9XZt310", 1600)}
              alt="Une personne rédige un courrier à son bureau"
              wipeIn
              delay={120}
              className="h-full w-full rounded-2xl lg:rounded-r-none"
            />
          </div>
        </section>

        {/* 2. Bento of real cases: mixed sizes, photos and two colour tiles. */}
        <section aria-labelledby="exemples" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-10 lg:py-28">
          <h2 id="exemples" className="max-w-xl font-display text-3xl font-bold tracking-tight sm:text-4xl">
            Ce qu&apos;on confie à Atlas
          </h2>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:auto-rows-[15rem] lg:grid-cols-6">
            {cases.map((c) => (
              <article key={c.title} className={cx("group relative overflow-hidden rounded-2xl", c.cell, "photo" in c ? "photo-card min-h-64" : "")}>
                {"photo" in c ? (
                  <>
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
                  </>
                ) : (
                  <div
                    className={cx(
                      "flex h-full min-h-48 flex-col justify-end p-6",
                      c.tone === "accent" ? "bg-accent text-accent-contrast" : "bg-sky-strong text-white",
                    )}
                  >
                    <h3 className="font-display text-2xl font-bold leading-tight">{c.title}</h3>
                    <p className="mt-2 max-w-sm text-sm opacity-85">{c.text}</p>
                  </div>
                )}
              </article>
            ))}
          </div>
        </section>

        {/* 3. The one pinned, scroll-driven story: the four steps. */}
        <section id="fonctionnement" aria-labelledby="fonctionnement-titre" className="mx-auto max-w-7xl px-4 pb-24 sm:px-6 lg:px-10 lg:pb-32">
          <h2 id="fonctionnement-titre" className="mb-12 font-display text-3xl font-bold tracking-tight sm:text-4xl lg:mb-8">
            Fonctionnement
          </h2>
          <HowItWorks steps={steps} />
        </section>

        {/* 4. Full-bleed band: one statement, scale shift. */}
        <ParallaxBand src={unsplash("rimgdHH0I_E", 1920)}>
          <div className="mx-auto max-w-7xl px-4 py-28 sm:px-6 lg:px-10 lg:py-40">
            <p className="max-w-3xl font-display text-4xl font-bold leading-[1.05] tracking-tight text-white sm:text-6xl">
              Les délais, c&apos;est Atlas qui les surveille.
            </p>
            <p className="mt-6 max-w-md text-lg text-white/80">
              Il reprend votre dossier seul à l&apos;échéance et relance jusqu&apos;à obtenir une réponse.
            </p>
          </div>
        </ParallaxBand>

        {/* 5. Limits and transparency: a statement grid, no cards. */}
        <section className="mx-auto max-w-7xl px-4 py-24 sm:px-6 lg:px-10 lg:py-32">
          <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Ce qu&apos;Atlas ne fait pas</h2>
          <dl className="mt-12 grid gap-x-12 gap-y-10 sm:grid-cols-2">
            {limits.map((l) => (
              <div key={l.title} className="border-t-2 border-fg pt-5">
                <dt className="font-display text-xl font-bold">{l.title}</dt>
                <dd className="mt-2 max-w-md text-muted">{l.text}</dd>
              </div>
            ))}
          </dl>
          <p className="mt-14 max-w-2xl text-sm text-muted">
            Atlas est une intelligence artificielle. Analyse gratuite.{pricing}
          </p>
        </section>

        {/* 6. Closing call to action. */}
        <section className="border-t border-line bg-surface-2/60">
          <div className="mx-auto flex max-w-7xl flex-col items-start justify-between gap-8 px-4 py-20 sm:px-6 md:flex-row md:items-end lg:px-10">
            <p className="max-w-2xl font-display text-4xl font-bold leading-[1.05] tracking-tight sm:text-5xl">
              Un problème qui traîne ? Décrivez-le.
            </p>
            <LinkButton href={cta.href} variant="primary" className="px-6 py-3 text-base">
              {cta.label}
            </LinkButton>
          </div>
        </section>
      </main>

      <LegalFooter />
    </div>
  );
}
