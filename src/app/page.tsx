import { currentUser } from "@/lib/http";
import { LegalFooter } from "@/components/legal-footer";
import { Photo } from "@/components/illustrations";
import { LinkButton, Logo, Reveal } from "@/components/ui";
import { describeFee, eurosShort } from "@/lib/fee";
import { unsplash } from "@/lib/photos";
import { billingConfig } from "@/server/billing/stripe";

const examples = [
  {
    title: "Un colis jamais arrivé",
    text: "Le vendeur ne rembourse pas, le transporteur renvoie vers le vendeur.",
    photo: "ICaUOZ0PL70",
  },
  {
    title: "Une facture contestée",
    text: "Frais injustifiés, régularisation énorme, erreur de facturation.",
    photo: "zR7nFjjIAWE",
  },
  {
    title: "Une caution non rendue",
    text: "Le délai est dépassé et le bailleur ne répond plus.",
    photo: "3HfGnyPfWqQ",
  },
  {
    title: "Un abonnement impossible à arrêter",
    text: "Les prélèvements continuent malgré la résiliation.",
    photo: "JSk0OT2Klac",
  },
  {
    title: "Un remboursement qui n'arrive pas",
    text: "Vol annulé, commande annulée, avoir imposé au lieu d'un remboursement.",
    photo: "mqvE1ctiW6Y",
  },
  {
    title: "Une réclamation sans réponse",
    text: "Service client muet, relances ignorées, médiateur à saisir.",
    photo: "WEmqaN6eh8o",
  },
];

const how = [
  { n: "1", title: "Vous décrivez le problème", text: "En quelques phrases, avec vos documents (factures, e-mails, contrat)." },
  { n: "2", title: "Atlas vous dit s'il peut s'en occuper", text: "Analyse gratuite. Il vous dit ce qu'il va demander, à qui, et pourquoi." },
  { n: "3", title: "Atlas prépare et vérifie tout", text: "Courriers relus et vérifiés : chaque montant et chaque date sont contrôlés dans vos pièces." },
  { n: "4", title: "Vous envoyez en un clic, Atlas suit", text: "Il reprend le dossier seul à l'échéance : relance, médiateur, jusqu'au bout." },
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
        <section className="relative grid gap-10 py-10 sm:py-16 lg:grid-cols-[1.05fr_0.95fr] lg:items-stretch">
          <Reveal className="flex flex-col justify-center">
            <p className="mb-3 text-sm text-muted">Nimbrel · votre agent, Atlas</p>
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
            <div className="mt-8 flex flex-wrap items-center gap-5">
              <LinkButton href={cta.href} variant="primary" className="px-5 py-2.5 text-base">
                {cta.label}
              </LinkButton>
              <a href="#fonctionnement" className="text-sm text-muted hover:text-fg">
                Comment ça marche ↓
              </a>
            </div>
          </Reveal>
          <Reveal delay={150} className="min-h-[320px] lg:min-h-0">
            <Photo
              src={unsplash("EahB9XZt310", 1200)}
              alt="Courrier en cours de rédaction"
              wipeIn
              delay={150}
              className="h-full w-full rounded-2xl"
            />
          </Reveal>
        </section>

        <section aria-labelledby="exemples" className="pb-16">
          <h2 id="exemples" className="mb-5 text-lg font-medium">
            Ce qu&apos;on confie à Atlas
          </h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {examples.map((e) => (
              <article key={e.title} className="photo-card group">
                <Photo src={unsplash(e.photo, 640)} alt="" className="aspect-[4/3] w-full rounded-xl" />
                <span className="rule mt-3 block h-px w-full bg-border-strong" aria-hidden />
                <h3 className="mt-3 font-medium">{e.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{e.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="fonctionnement" aria-labelledby="fonctionnement-titre" className="pb-16">
          <h2 id="fonctionnement-titre" className="mb-8 text-lg font-medium">
            Fonctionnement
          </h2>
          <ol className="grid gap-x-6 gap-y-8 sm:grid-cols-2 lg:grid-cols-4">
            {how.map((h) => (
              <li key={h.n}>
                <span className="font-display text-4xl text-accent">{h.n}</span>
                <span className="mt-2 block h-px w-10 bg-border-strong" aria-hidden />
                <h3 className="mt-3 font-medium">{h.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{h.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="relative mb-20 overflow-hidden rounded-2xl border border-line bg-surface/60 p-6 sm:p-8">
          <h2 className="text-lg font-semibold">Ce qu&apos;Atlas ne fait pas</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted">
            Atlas ne donne pas de conseil juridique, ne vous représente pas en justice et ne garantit pas le résultat. Il n&apos;envoie
            rien à votre place : c&apos;est vous qui envoyez, en un clic, les courriers qu&apos;il a préparés. Il ne se connecte à aucun de
            vos comptes. Un dossier n&apos;est marqué réglé que lorsque vous le confirmez.
          </p>
          <LinkButton href={cta.href} variant="primary" className="mt-5">
            {cta.label}
          </LinkButton>
        </section>
      </main>

      <LegalFooter />
    </div>
  );
}
