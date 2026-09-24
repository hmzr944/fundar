import { currentUser } from "@/lib/http";
import { LinkButton, Logo } from "@/components/ui";

const offers = [
  {
    title: "Analyse de DCE",
    price: "149 € HT",
    delay: "1 jour ouvré",
    items: [
      "Synthèse du marché, lots et durée",
      "Critères de jugement et pondération",
      "Dates limites et formalités de remise",
      "Liste des pièces à fournir",
      "Points de vigilance et questions à poser à l'acheteur",
      "Avis argumenté : y aller ou non",
    ],
  },
  {
    title: "Dossier complet",
    price: "790 € HT",
    delay: "3 jours ouvrés",
    featured: true,
    items: [
      "Tout le contenu de l'analyse",
      "Pièces administratives : liste et aide au remplissage",
      "Mémoire technique rédigé à partir des informations de votre entreprise",
      "Relecture de conformité avant votre dépôt",
    ],
  },
  {
    title: "Pack 3 dossiers",
    price: "1 990 € HT",
    delay: "3 jours ouvrés par dossier",
    items: ["3 dossiers complets", "À utiliser sous 6 mois", "Vos informations d'entreprise réutilisées d'un dossier à l'autre"],
  },
];

const how = [
  { n: "1", title: "Vous envoyez le DCE", text: "Le dossier de consultation tel que publié par l'acheteur, au moins 7 jours avant la date limite." },
  { n: "2", title: "Atlas l'analyse", text: "Règlement, cahiers des charges, pièces demandées, critères : tout est lu et relevé, avec la référence du document." },
  { n: "3", title: "Un humain relit et complète", text: "Chaque livrable est vérifié et adapté à votre entreprise avant de vous être remis." },
  { n: "4", title: "Vous déposez votre offre", text: "Vous recevez un dossier prêt à signer. Le dépôt sur la plateforme de l'acheteur reste entre vos mains." },
];

export default async function Landing() {
  const user = await currentUser();
  const contact = process.env.ATLAS_CONTACT_EMAIL?.trim();
  const space = user ? { href: "/app", label: "Ouvrir mon espace" } : { href: "/signup", label: "Créer un espace client" };
  // Main call to action: send a tender file by e-mail when a contact address is configured, otherwise the client space.
  const primary = contact
    ? { href: `mailto:${contact}?subject=${encodeURIComponent("Analyse de DCE offerte")}`, label: "Envoyer un DCE" }
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
          <p className="mb-4 text-sm font-medium text-accent">Appels d&apos;offres publics — TPE et PME</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Répondez aux appels d&apos;offres sans y passer vos soirées.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            Envoyez-nous le dossier de consultation. Vous recevez l&apos;analyse du marché, la liste des pièces à fournir et un
            mémoire technique rédigé pour votre entreprise, relus par un humain. Vous signez et déposez.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <LinkButton href={primary.href} variant="primary" className="px-5 py-2.5 text-base">
              {primary.label}
            </LinkButton>
            <a href="#offres" className="inline-flex items-center px-3 py-2.5 text-sm text-muted hover:text-fg">
              Voir les offres ↓
            </a>
          </div>
          <p className="mt-4 text-sm text-faint">Votre première analyse de DCE est offerte.</p>
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
                <p className="text-sm text-muted">Livré en {o.delay}</p>
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
            Nous ne déposons pas votre offre, ne signons rien à votre place et ne garantissons pas l&apos;attribution du marché.
            Nous ne donnons pas de conseil juridique. Les documents scannés et les tableurs de prix sont traités à part : nous
            vous le signalons dès la réception du DCE.
          </p>
          <LinkButton href={primary.href} variant="primary" className="mt-5">
            {primary.label}
          </LinkButton>
        </section>
      </main>

      <footer className="border-t border-line py-6 text-center text-xs text-faint">
        Atlas — réponses aux appels d&apos;offres publics{contact ? ` · ${contact}` : ""}
      </footer>
    </div>
  );
}
