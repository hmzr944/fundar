import { currentUser } from "@/lib/http";
import { LinkButton, Logo } from "@/components/ui";

const plans = [
  {
    title: "Découverte",
    price: "Gratuit",
    period: "5 factures, sans carte bancaire",
    items: ["Atlas prend en charge vos 5 premières factures impayées", "Toutes les fonctions, sans limite de durée pour ces 5 factures"],
  },
  {
    title: "Solo",
    price: "19 € HT",
    period: "par mois, sans engagement",
    featured: true,
    items: ["Jusqu'à 30 factures suivies par mois", "Pour les indépendants, les TPE et les petits cabinets"],
  },
  {
    title: "Équipe",
    price: "49 € HT",
    period: "par mois, sans engagement",
    items: ["Jusqu'à 150 factures suivies par mois", "Pour les PME, les cabinets d'avocats et d'expertise comptable"],
  },
];

const steps = [
  { n: "1", title: "Vous importez vos impayés", text: "Vos factures en PDF, ou l'export de votre logiciel de facturation. Rien d'autre à configurer." },
  { n: "2", title: "Atlas prépare chaque relance", text: "Le bon ton pour chaque client, les références exactes de la facture et la suite prévue si rien ne bouge." },
  { n: "3", title: "Il répond à ce que dit votre client", text: "Facture égarée, contestation, promesse de paiement, demande d'échéancier : Atlas propose la bonne réponse et la suite." },
  { n: "4", title: "Vous voyez l'argent rentrer", text: "Chaque facture a un statut clair. Elle n'est close que lorsque le paiement est confirmé." },
];

const promises = [
  { title: "Vous restez aux commandes", text: "Rien ne part sans votre accord. Les messages partent de votre adresse, à votre nom." },
  { title: "Aucune erreur de montant", text: "Montants, numéros et dates sont repris de vos factures, jamais inventés. Chaque relance cite la facture concernée." },
  { title: "Le bon cadre légal", text: "Indemnité forfaitaire et pénalités de retard réservées aux clients professionnels ; jamais de menace hors du cadre légal." },
  { title: "Garantie de résultat", text: "Si, après 60 jours, les factures suivies n'ont pas rapporté au moins le montant de votre abonnement, il vous est remboursé." },
];

export default async function Landing() {
  const user = await currentUser();
  const contact = process.env.ATLAS_CONTACT_EMAIL?.trim();
  const cta = user ? { href: "/app", label: "Ouvrir mon espace" } : { href: "/signup", label: "Essayer sur 5 factures" };

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
          <p className="mb-4 text-sm font-medium text-accent">Factures impayées — entreprises, avocats, experts-comptables</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Atlas fait rentrer l&apos;argent qu&apos;on vous doit.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            Confiez-lui vos factures impayées. Il prépare chaque relance, comprend ce que vous répondent vos clients et vous propose
            la suite, jusqu&apos;au paiement. Vous gardez la main à chaque étape.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <LinkButton href={cta.href} variant="primary" className="px-5 py-2.5 text-base">
              {cta.label}
            </LinkButton>
            <a href="#fonctionnement" className="inline-flex items-center px-3 py-2.5 text-sm text-muted hover:text-fg">
              Comment ça marche ↓
            </a>
          </div>
          <p className="mt-4 text-sm text-faint">Gratuit pour vos 5 premières factures. Sans carte bancaire.</p>
        </section>

        <section id="fonctionnement" aria-labelledby="fonctionnement-titre" className="pb-16">
          <h2 id="fonctionnement-titre" className="mb-5 text-sm font-semibold uppercase tracking-wide text-muted">
            Fonctionnement
          </h2>
          <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {steps.map((h) => (
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

        <section aria-labelledby="engagements-titre" className="pb-16">
          <h2 id="engagements-titre" className="mb-5 text-sm font-semibold uppercase tracking-wide text-muted">
            Nos engagements
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {promises.map((p) => (
              <article key={p.title} className="rounded-2xl border border-line bg-surface/60 p-5">
                <h3 className="font-medium">{p.title}</h3>
                <p className="mt-2 text-sm text-muted">{p.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="tarifs" aria-labelledby="tarifs-titre" className="pb-16">
          <h2 id="tarifs-titre" className="mb-5 text-sm font-semibold uppercase tracking-wide text-muted">
            Tarifs
          </h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {plans.map((o) => (
              <article
                key={o.title}
                className={`rounded-2xl border p-5 ${o.featured ? "border-accent/50 bg-accent/5" : "border-line bg-surface/60"}`}
              >
                <h3 className="font-medium">{o.title}</h3>
                <p className="mt-2 text-2xl font-semibold">{o.price}</p>
                <p className="text-sm text-muted">{o.period}</p>
                <ul className="mt-4 list-disc space-y-1.5 pl-5 text-sm text-muted">
                  {o.items.map((i) => (
                    <li key={i}>{i}</li>
                  ))}
                </ul>
              </article>
            ))}
          </div>
        </section>

        <section className="mb-20 rounded-2xl border border-line bg-surface/60 p-6 sm:p-8">
          <h2 className="text-lg font-semibold">Ce qu&apos;Atlas ne fait pas</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted">
            Atlas n&apos;encaisse jamais d&apos;argent à votre place : vos clients vous paient directement. Il ne saisit pas la
            justice, ne donne pas de conseil juridique et n&apos;envoie rien sans votre accord. Pour l&apos;instant, c&apos;est vous qui
            envoyez les messages qu&apos;il prépare et qui confirmez les paiements reçus.
          </p>
          <LinkButton href={cta.href} variant="primary" className="mt-5">
            {cta.label}
          </LinkButton>
        </section>
      </main>

      <footer className="border-t border-line py-6 text-center text-xs text-faint">
        Atlas — l&apos;agent qui fait aboutir ce qui traîne{contact ? ` · ${contact}` : ""}
      </footer>
    </div>
  );
}
