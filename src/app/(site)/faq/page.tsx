import type { Metadata } from "next";
import Link from "next/link";
import { CtaLink, mainCta } from "@/components/ui";
import { currentUser } from "@/lib/http";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description: "Ce que Nimbrel récupère, qui envoie les courriers, combien ça coûte et ce que deviennent vos données.",
};

type QA = { q: string; a: string };

function groups(): { id: string; title: string; items: QA[] }[] {
  const retention = Number(process.env.ATLAS_RETENTION_DAYS || 365);
  return [
    {
      id: "service",
      title: "Le service",
      items: [
        { q: "Pour qui est Nimbrel ?", a: "Pour les entreprises du bâtiment, artisans et sous-traitants, qui attendent de l'argent d'un client professionnel ou public : entreprise générale, promoteur, syndic, mairie, office HLM." },
        { q: "Qu'est-ce que Nimbrel récupère ?", a: "Les retenues de garantie non rendues, les intérêts de retard dus par les acheteurs publics, les situations et factures de chantier impayées, et les sommes dues à un sous-traitant par l'entreprise principale." },
        { q: "Qui envoie les courriers ?", a: "Vous. Nimbrel prépare chaque courrier à partir de vos pièces, vous le relisez, puis vous l'envoyez sous votre nom, en recommandé avec accusé de réception, en un clic. Rien ne part sans votre accord." },
        { q: "Que se passe-t-il si le client ne répond pas ?", a: "Nimbrel surveille les délais. À l'échéance, il prépare l'étape suivante : relance, mise en demeure, action directe contre le maître d'ouvrage si vous êtes sous-traitant, ou requête en injonction de payer prête à déposer." },
        { q: "Nimbrel remplace-t-il un avocat ?", a: "Non. Nimbrel est un outil d'aide à la rédaction et au suivi, propulsé par une intelligence artificielle. Si votre client conteste le fond (malfaçon, avenant, pénalités de retard de chantier), nous vous orientons vers un avocat. La signification et l'exécution forcée restent l'affaire d'un commissaire de justice." },
        { q: "Quels documents faut-il ?", a: "Selon le dossier : devis signé, contrat de sous-traitance, situations ou factures, procès-verbal de réception, bons de commande, échanges avec le client. PDF, Word ou texte." },
      ],
    },
    {
      id: "paiement",
      title: "Prix et paiement",
      items: [
        { q: "Combien ça coûte ?", a: "Un prix fixe par dossier, payé d'avance : 49 € HT pour une retenue de garantie, 39 € HT pour des intérêts de marché public, 79 € HT pour une facture impayée, 149 € HT pour un dossier sous-traitant. Le diagnostic est gratuit." },
        { q: "Prenez-vous une commission ?", a: "Non. Les sommes récupérées vous sont versées directement par votre client, en entier. Nimbrel ne les touche jamais." },
        { q: "Les recommandés sont-ils compris ?", a: "Oui, les envois prévus dans chaque dossier sont compris dans le prix." },
        { q: "Et si je n'ai rien récupéré ?", a: "Le prix couvre la préparation des courriers et le suivi des délais, pas le résultat, qui dépend de votre client. C'est pour cela que le diagnostic gratuit vous dit d'abord ce qui est réclamable, et à quelle date." },
      ],
    },
    {
      id: "donnees",
      title: "Vos données",
      items: [
        { q: "Nimbrel a-t-il accès à mes comptes ?", a: "Non. Nimbrel ne se connecte à aucun de vos comptes, bancaires ou autres, et ne vous demande jamais de mot de passe." },
        { q: "Combien de temps mes dossiers sont-ils conservés ?", a: `Un dossier inactif depuis ${retention} jours est supprimé automatiquement. Vous pouvez supprimer un dossier, ou votre compte entier, à tout moment depuis votre espace.` },
        { q: "Le diagnostic envoie-t-il mes chiffres ?", a: "Non. Le diagnostic en ligne calcule tout dans votre navigateur. Rien n'est enregistré tant que vous ne créez pas de dossier." },
      ],
    },
  ];
}

export default async function Faq() {
  const all = groups();
  const cta = mainCta(Boolean(await currentUser()));
  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: all.flatMap((g) => g.items).map((i) => ({ "@type": "Question", name: i.q, acceptedAnswer: { "@type": "Answer", text: i.a } })),
  };

  return (
    <div className="grid gap-12 lg:grid-cols-12 lg:gap-16">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* Left: title and the group index stay in view while the answers scroll. */}
      <aside className="lg:col-span-4">
        <div className="lg:sticky lg:top-28">
          <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-[-0.035em] sm:text-6xl">
            <span className="line-mask">
              <span>Questions</span>
            </span>{" "}
            <span className="line-mask">
              <span style={{ ["--reveal-delay" as string]: "90ms" }}>fréquentes</span>
            </span>
          </h1>
          <nav aria-label="Rubriques" className="hero-in mt-8 flex flex-wrap gap-2 lg:flex-col lg:items-start" style={{ ["--reveal-delay" as string]: "250ms" }}>
            {all.map((g) => (
              <a key={g.id} href={`#${g.id}`} className="rounded-full border border-line-strong px-4 py-1.5 text-sm transition-colors hover:border-accent hover:text-accent">
                {g.title}
              </a>
            ))}
          </nav>
          <div className="glass-ink hero-in mt-10 hidden rounded-3xl p-6 lg:block" style={{ ["--reveal-delay" as string]: "400ms" }}>
            <p className="font-display text-xl font-bold">Pas de réponse ici ?</p>
            <p className="mt-1 text-sm text-elev/80">Écrivez-nous, nous vous répondons par e-mail.</p>
            <Link href="/contact" className="mt-4 inline-block text-sm font-medium text-elev underline underline-offset-4 hover:no-underline">
              Nous écrire
            </Link>
          </div>
        </div>
      </aside>

      <div className="space-y-14 lg:col-span-8">
        {all.map((g, gi) => (
          <section key={g.id} id={g.id} aria-labelledby={`${g.id}-t`} className="scroll-mt-24">
            <h2 id={`${g.id}-t`} className="font-display text-2xl font-bold tracking-tight">
              {g.title}
            </h2>
            <div className="mt-5 space-y-3">
              {g.items.map((item, i) => (
                <details
                  key={item.q}
                  className="faq-item glass tile-in group rounded-2xl"
                  style={{ ["--i" as string]: gi * 3 + i }}
                  open={gi === 0 && i === 0}
                >
                  <summary className="flex cursor-pointer items-center justify-between gap-6 rounded-2xl px-5 py-4 font-medium outline-offset-2 transition-colors hover:text-accent">
                    {item.q}
                    <span aria-hidden className="faq-mark relative h-4 w-4 shrink-0">
                      <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 rounded bg-current" />
                      <span className="absolute inset-y-0 left-1/2 w-0.5 -translate-x-1/2 rounded bg-current" />
                    </span>
                  </summary>
                  <p className="max-w-2xl px-5 pb-5 text-muted">{item.a}</p>
                </details>
              ))}
            </div>
          </section>
        ))}
        <div className="glass view-in flex flex-col items-start justify-between gap-5 rounded-3xl p-7 sm:flex-row sm:items-center">
          <p className="font-display text-2xl font-bold leading-tight">Le plus simple : le diagnostic.<br />Gratuit, sans inscription.</p>
          <CtaLink href={cta.href}>{cta.label}</CtaLink>
        </div>
        <p className="text-sm text-muted lg:hidden">
          Pas de réponse ici ?{" "}
          <Link href="/contact" className="text-sky underline underline-offset-4">
            Nous écrire
          </Link>
        </p>
      </div>
    </div>
  );
}
