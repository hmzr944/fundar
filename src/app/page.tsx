import { currentUser } from "@/lib/http";
import { LegalFooter } from "@/components/legal-footer";
import { CloudWisp, SkyBurst, StepGlow } from "@/components/illustrations";
import { LinkButton, Logo, Reveal } from "@/components/ui";
import { describeFee, eurosShort } from "@/lib/fee";
import { billingConfig } from "@/server/billing/stripe";

const examples = [
  {
    title: "Un colis jamais arrivé",
    text: "Le vendeur ne rembourse pas, le transporteur renvoie vers le vendeur.",
    icon: "M4 8.5 12 4l8 4.5V17L12 21l-8-4V8.5Zm0 0 8 4.2m0 0 8-4.2M12 12.7V21",
  },
  {
    title: "Une facture contestée",
    text: "Frais injustifiés, régularisation énorme, erreur de facturation.",
    icon: "M7 3h10v18l-2.5-1.5L12 21l-2.5-1.5L7 21V3Zm2.5 6h5M9.5 12h5",
  },
  {
    title: "Une caution non rendue",
    text: "Le délai est dépassé et le bailleur ne répond plus.",
    icon: "M12 3 4 6v6c0 5 3.4 8.4 8 9 4.6-.6 8-4 8-9V6l-8-3Zm-2.2 9.3 1.6 1.6L15.5 10",
  },
  {
    title: "Un abonnement impossible à arrêter",
    text: "Les prélèvements continuent malgré la résiliation.",
    icon: "M4 12a8 8 0 0 1 13.66-5.66M20 12a8 8 0 0 1-13.66 5.66M17.5 3v4h-4M6.5 21v-4h4",
  },
  {
    title: "Un remboursement qui n'arrive pas",
    text: "Vol annulé, commande annulée, avoir imposé au lieu d'un remboursement.",
    icon: "M4 7h16v11a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7Zm0 0 2-3h12l2 3M9 12h6",
  },
  {
    title: "Une réclamation sans réponse",
    text: "Service client muet, relances ignorées, médiateur à saisir.",
    icon: "M4 5h16v10H8l-4 4V5Zm3 4h10m-10 3h6",
  },
];

const how = [
  { n: "1", title: "Vous décrivez le problème", text: "En quelques phrases, avec vos documents (factures, e-mails, contrat)." },
  { n: "2", title: "Atlas vous dit s'il peut s'en occuper", text: "Analyse gratuite. Il vous dit ce qu'il va demander, à qui, et pourquoi." },
  { n: "3", title: "Atlas prépare et vérifie tout", text: "Courriers relus et vérifiés : chaque montant et chaque date sont contrôlés dans vos pièces." },
  { n: "4", title: "Vous envoyez en un clic, Atlas suit", text: "Il reprend le dossier seul à l'échéance : relance, médiateur, jusqu'au bout." },
];

function Glyph({ path }: { path: string }) {
  return (
    <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="var(--accent)" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
      <path d={path} />
    </svg>
  );
}

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
      <header className="mx-auto flex max-w-6xl items-center justify-between px-4 py-5 sm:px-6">
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

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="relative grid gap-10 py-14 sm:py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <Reveal>
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-line-strong bg-surface/60 px-3 py-1 text-xs font-medium text-muted">
              <span className="h-1.5 w-1.5 rounded-full bg-accent" aria-hidden />
              Nimbrel · votre agent, Atlas
            </p>
            <h1 className="max-w-2xl font-display text-4xl font-semibold leading-[1.05] tracking-tight sm:text-6xl">
              Règle ça pour moi.
            </h1>
            <p className="mt-5 max-w-xl text-lg text-muted">
              Un problème avec une entreprise ou une organisation, et pas l&apos;envie ou le temps de vous en occuper ? Décrivez-le.
              Atlas prépare les démarches, les vérifie, les suit et relance jusqu&apos;au bout.
            </p>
            <p className="mt-3 max-w-xl text-sm text-faint">
              Atlas est une intelligence artificielle. Analyse gratuite.{pricing} Aucun mot de passe demandé.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <LinkButton href={cta.href} variant="primary" className="px-5 py-2.5 text-base">
                {cta.label}
              </LinkButton>
              <a href="#fonctionnement" className="inline-flex items-center px-3 py-2.5 text-sm text-muted hover:text-fg">
                Comment ça marche ↓
              </a>
            </div>
          </Reveal>
          <Reveal delay={200} className="relative mx-auto aspect-square w-full max-w-md lg:max-w-none">
            <SkyBurst className="h-full w-full" />
          </Reveal>
        </section>

        <section aria-labelledby="exemples" className="pb-16">
          <Reveal>
            <h2 id="exemples" className="mb-5 text-sm font-semibold uppercase tracking-wide text-muted">
              Ce qu&apos;on confie à Atlas
            </h2>
          </Reveal>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {examples.map((e, i) => (
              <Reveal key={e.title} delay={i * 60}>
                <article className="hover-lift h-full rounded-2xl border border-line bg-surface/60 p-5">
                  <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-accent/10">
                    <Glyph path={e.icon} />
                  </span>
                  <h3 className="mt-3 font-medium">{e.title}</h3>
                  <p className="mt-2 text-sm text-muted">{e.text}</p>
                </article>
              </Reveal>
            ))}
          </div>
        </section>

        <div className="flex justify-center pb-16 text-muted/40">
          <CloudWisp className="h-10 w-48" />
        </div>

        <section id="fonctionnement" aria-labelledby="fonctionnement-titre" className="pb-16">
          <Reveal>
            <h2 id="fonctionnement-titre" className="mb-8 text-sm font-semibold uppercase tracking-wide text-muted">
              Fonctionnement
            </h2>
          </Reveal>
          <ol className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {how.map((h, i) => (
              <Reveal key={h.n} delay={i * 90}>
                <li className="relative">
                  {i < how.length - 1 && (
                    <span
                      aria-hidden
                      className="absolute left-5 top-5 hidden h-px w-full bg-gradient-to-r from-line-strong to-transparent lg:block"
                    />
                  )}
                  <span className="relative block h-10 w-10">
                    <StepGlow n={h.n} className="absolute inset-0" />
                  </span>
                  <h3 className="mt-3 font-medium">{h.title}</h3>
                  <p className="mt-1.5 text-sm text-muted">{h.text}</p>
                </li>
              </Reveal>
            ))}
          </ol>
        </section>

        <Reveal className="mb-20">
          <section className="relative overflow-hidden rounded-2xl border border-line bg-surface/60 p-6 sm:p-8">
            <div
              aria-hidden
              className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full opacity-30"
              style={{ background: "radial-gradient(circle, var(--sky), transparent 70%)" }}
            />
            <h2 className="text-lg font-semibold">Ce qu&apos;Atlas ne fait pas</h2>
            <p className="relative mt-2 max-w-3xl text-sm text-muted">
              Atlas ne donne pas de conseil juridique, ne vous représente pas en justice et ne garantit pas le résultat. Il n&apos;envoie
              rien à votre place : c&apos;est vous qui envoyez, en un clic, les courriers qu&apos;il a préparés. Il ne se connecte à aucun de
              vos comptes. Un dossier n&apos;est marqué réglé que lorsque vous le confirmez.
            </p>
            <LinkButton href={cta.href} variant="primary" className="relative mt-5">
              {cta.label}
            </LinkButton>
          </section>
        </Reveal>
      </main>

      <LegalFooter />
    </div>
  );
}
