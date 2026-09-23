import { currentUser } from "@/lib/http";
import { LinkButton, Logo } from "@/components/ui";

const examples = [
  { title: "Organiser un déménagement", text: "Comparer les solutions de transport, lister les démarches, préparer les courriers de résiliation." },
  { title: "Comparer des offres", text: "Box internet, assurance, mutuelle : relever les offres selon vos critères et les sources." },
  { title: "Analyser un document", text: "Bail, contrat, devis, facture : extraire les points importants et ce qui manque." },
  { title: "Préparer une réclamation", text: "Rédiger un courrier de remboursement à partir de vos justificatifs." },
  { title: "Planifier une semaine", text: "Prioriser vos tâches et obtenir un planning réaliste avec une checklist." },
  { title: "Préparer un voyage", text: "Rassembler les informations utiles, un programme et une liste de départ." },
];

const how = [
  { n: "1", title: "Vous décrivez votre objectif", text: "En langage naturel, sans formulaire. Ajoutez des documents si besoin." },
  { n: "2", title: "Atlas clarifie et planifie", text: "Il reformule, pose seulement les questions utiles et propose un plan d'étapes." },
  { n: "3", title: "Atlas exécute ce qu'il peut", text: "Recherches, lecture de documents, rédaction de livrables — avec les sources." },
  { n: "4", title: "Vous gardez la main", text: "Chaque étape a un statut vérifiable. Les actions engageantes restent les vôtres." },
];

export default async function Landing() {
  const user = await currentUser();
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
          <p className="mb-4 text-sm font-medium text-accent">Agent personnel généraliste</p>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight tracking-tight sm:text-5xl">
            Dites-moi ce que vous voulez accomplir.
          </h1>
          <p className="mt-5 max-w-2xl text-lg text-muted">
            Atlas vous aide à le faire avancer, étape par étape, et vous montre clairement ce qui a été réalisé — avec ses
            sources, ses livrables et ses limites.
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
            Exemples de missions
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
          <h2 className="text-lg font-semibold">Ce qu&apos;Atlas ne fait pas (encore)</h2>
          <p className="mt-2 max-w-3xl text-sm text-muted">
            Atlas ne passe pas d&apos;appels, n&apos;effectue aucun paiement, ne signe rien et ne se connecte pas à vos comptes.
            Quand une mission l&apos;exige, il prépare ce qu&apos;il faut (courrier, script, checklist) et vous indique clairement ce
            qui vous revient. Une mission n&apos;est marquée terminée que lorsque ses résultats sont réellement disponibles.
          </p>
          <LinkButton href={cta.href} variant="primary" className="mt-5">
            {cta.label}
          </LinkButton>
        </section>
      </main>

      <footer className="border-t border-line py-6 text-center text-xs text-faint">Atlas — MVP</footer>
    </div>
  );
}
