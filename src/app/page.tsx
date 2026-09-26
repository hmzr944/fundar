import { currentUser } from "@/lib/http";
import { LegalFooter } from "@/components/legal-footer";
import { LinkButton, Logo } from "@/components/ui";
import { describeFee, eurosShort } from "@/lib/fee";
import { billingConfig } from "@/server/billing/stripe";

const examples = [
  { title: "Un colis jamais arrivé", text: "Le vendeur ne rembourse pas, le transporteur renvoie vers le vendeur." },
  { title: "Une facture contestée", text: "Frais injustifiés, régularisation énorme, erreur de facturation." },
  { title: "Une caution non rendue", text: "Le délai est dépassé et le bailleur ne répond plus." },
  { title: "Un abonnement impossible à arrêter", text: "Les prélèvements continuent malgré la résiliation." },
  { title: "Un remboursement qui n'arrive pas", text: "Vol annulé, commande annulée, avoir imposé au lieu d'un remboursement." },
  { title: "Une réclamation sans réponse", text: "Service client muet, relances ignorées, médiateur à saisir." },
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
      ? ` Vous ne payez que si votre problème est réglé : ${describeFee(billing.fee)}. Sinon, rien.`
      : ` Prise en charge du dossier : ${eurosShort(billing.priceCents)} € TTC, paiement unique.`;
  const cta = user ? { href: "/app", label: "Ouvrir mon espace" } : { href: "/signup", label: "Commencer" };
  return (
    <div className="min-h-dvh">
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
        <section className="py-14 sm:py-24">
          <p className="mb-4 text-sm font-medium text-accent">Atlas</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">Règle ça pour moi.</h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            Un problème avec une entreprise ou une organisation, et pas l&apos;envie ou le temps de vous en occuper ? Décrivez-le.
            Atlas prépare les démarches, les vérifie, les suit et relance jusqu&apos;au bout.
          </p>
          <p className="mt-3 max-w-2xl text-sm text-muted">
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
        </section>

        <section aria-labelledby="exemples" className="pb-16">
          <h2 id="exemples" className="mb-5 text-sm font-semibold uppercase tracking-wide text-muted">
            Ce qu&apos;on confie à Atlas
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {examples.map((e) => (
              <article key={e.title} className="rounded-2xl border border-line bg-surface/60 p-5">
                <h3 className="font-medium">{e.title}</h3>
                <p className="mt-2 text-sm text-muted">{e.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="fonctionnement" aria-labelledby="fonctionnement-titre" className="pb-16">
          <h2 id="fonctionnement-titre" className="mb-5 text-sm font-semibold uppercase tracking-wide text-muted">
            Fonctionnement
          </h2>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {how.map((h) => (
              <li key={h.n} className="rounded-2xl border border-line bg-elev p-5">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-accent/15 text-sm font-semibold text-accent">
                  {h.n}
                </span>
                <h3 className="mt-3 font-medium">{h.title}</h3>
                <p className="mt-1.5 text-sm text-muted">{h.text}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="mb-20 rounded-2xl border border-line bg-surface/60 p-6 sm:p-8">
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
