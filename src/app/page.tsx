import { currentUser } from "@/lib/http";
import { LinkButton, Logo } from "@/components/ui";

const offers = [
  {
    title: "Essentiel",
    price: "490 € HT",
    period: "par mois, sans engagement",
    items: [
      "Veille : chaque semaine, les appels d'offres qui correspondent à votre métier et à votre zone, avec notre avis « on y va / on passe »",
      "1 dossier de réponse complet par mois",
      "Votre dossier administratif tenu à jour : nous vous prévenons avant l'expiration de chaque attestation",
      "Calendrier de vos échéances de dépôt",
    ],
  },
  {
    title: "Croissance",
    price: "990 € HT",
    period: "par mois, sans engagement",
    featured: true,
    items: [
      "Tout l'Essentiel",
      "3 dossiers de réponse complets par mois",
      "Questions à l'acheteur rédigées et suivies pendant la consultation",
      "Après chaque résultat : demande des motifs de rejet et plan d'amélioration pour le marché suivant",
      "Votre bibliothèque de réponses (références, moyens, méthodes) enrichie à chaque dossier",
    ],
  },
  {
    title: "Dossier à l'unité",
    price: "890 € HT",
    period: "par dossier",
    items: [
      "Analyse du dossier de consultation et avis argumenté",
      "Pièces administratives préparées",
      "Mémoire technique rédigé pour ce marché",
      "Relecture de conformité avant votre dépôt",
    ],
  },
];

const outcomes = [
  { title: "Vous ne ratez plus les bons marchés", text: "Nous surveillons les publications pour vous et vous signalons seulement celles qui valent la peine d'y répondre." },
  { title: "Vous ne perdez plus de soirées sur les dossiers", text: "Vous répondez à nos questions sur votre entreprise ; nous rédigeons, vérifions et vous livrons un dossier prêt à signer." },
  { title: "Vous n'êtes plus écarté pour une pièce manquante", text: "Chaque exigence du règlement est vérifiée, avec la référence de l'article concerné." },
  { title: "Chaque réponse améliore la suivante", text: "Gagné ou perdu, nous demandons les motifs à l'acheteur et en tirons les corrections pour le prochain dossier." },
];

const how = [
  { n: "1", title: "Nous apprenons votre entreprise", text: "Un entretien et un questionnaire : métier, zone, références, moyens. Fait une fois, réutilisé à chaque dossier." },
  { n: "2", title: "Nous choisissons les marchés avec vous", text: "Chaque semaine, une sélection argumentée. Vous décidez en un clic sur quels marchés répondre." },
  { n: "3", title: "Nous préparons la réponse", text: "Analyse du dossier de consultation, pièces, mémoire technique : produits avec notre outil Atlas, relus par un humain." },
  { n: "4", title: "Vous signez et déposez", text: "Le dossier arrive prêt, au plus tard 48 h avant la date limite. Après le résultat, nous analysons avec vous." },
];

export default async function Landing() {
  const user = await currentUser();
  const contact = process.env.ATLAS_CONTACT_EMAIL?.trim();
  const space = user ? { href: "/app", label: "Ouvrir mon espace" } : { href: "/signup", label: "Créer un espace client" };
  // Main call to action: send a tender file by e-mail when a contact address is configured, otherwise the client space.
  const primary = contact
    ? { href: `mailto:${contact}?subject=${encodeURIComponent("Premier échange — service marchés publics")}`, label: "Parler de vos marchés" }
    : { href: space.href, label: space.label };

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
          <LinkButton href={space.href} variant={contact ? "ghost" : "primary"}>
            {space.label}
          </LinkButton>
        </nav>
      </header>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        <section className="py-14 sm:py-24">
          <p className="mb-4 text-sm font-medium text-accent">Service marchés publics — TPE et PME</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Votre service appels d&apos;offres, sans embaucher.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            Nous trouvons les marchés publics faits pour vous, préparons des réponses complètes et conformes, et apprenons de
            chaque résultat pour la suivante. Vous gardez votre temps pour votre métier : vous validez, signez et déposez.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <LinkButton href={primary.href} variant="primary" className="px-5 py-2.5 text-base">
              {primary.label}
            </LinkButton>
            <a href="#offres" className="inline-flex items-center px-3 py-2.5 text-sm text-muted hover:text-fg">
              Voir les offres ↓
            </a>
          </div>
          <p className="mt-4 text-sm text-faint">
            Premier échange et première analyse de marché offerts. Délai de livraison garanti, ou le dossier est remboursé.
          </p>
        </section>

        <section aria-labelledby="resultats-titre" className="pb-16">
          <h2 id="resultats-titre" className="mb-5 text-sm font-semibold uppercase tracking-wide text-muted">
            Ce qui change pour vous
          </h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {outcomes.map((o) => (
              <article key={o.title} className="rounded-2xl border border-line bg-surface/60 p-5">
                <h3 className="font-medium">{o.title}</h3>
                <p className="mt-2 text-sm text-muted">{o.text}</p>
              </article>
            ))}
          </div>
        </section>

        <section id="offres" aria-labelledby="offres-titre" className="pb-16">
          <h2 id="offres-titre" className="mb-5 text-sm font-semibold uppercase tracking-wide text-muted">
            Offres
          </h2>
          <div className="grid gap-4 lg:grid-cols-3">
            {offers.map((o) => (
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
          <h2 className="text-lg font-semibold">Ce que nous ne faisons pas</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted">
            Nous ne déposons pas votre offre, ne signons rien à votre place et ne garantissons pas l&apos;attribution d&apos;un
            marché : personne ne peut le garantir honnêtement. Nous ne donnons pas de conseil juridique. Vos prix restent votre
            décision. Pour garantir le délai, le dossier de consultation doit nous parvenir au moins 7 jours avant la date limite.
          </p>
          <LinkButton href={primary.href} variant="primary" className="mt-5">
            {primary.label}
          </LinkButton>
        </section>
      </main>

      <footer className="border-t border-line py-6 text-center text-xs text-faint">
        Atlas — service marchés publics pour TPE et PME{contact ? ` · ${contact}` : ""}
      </footer>
    </div>
  );
}
