import type { Metadata } from "next";
import Link from "next/link";
import { CtaLink, mainCta } from "@/components/ui";
import { currentUser } from "@/lib/http";
import { eurosShort } from "@/lib/fee";
import { integrationStatus } from "@/server/deps";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Questions fréquentes",
  description: "Ce que fait Atlas, ce qu'il ne fait pas, combien ça coûte et ce que deviennent vos données.",
};

type QA = { q: string; a: string };

function groups(): { id: string; title: string; items: QA[] }[] {
  const { billing, postal } = integrationStatus();
  const retention = Number(process.env.ATLAS_RETENTION_DAYS || 365);
  const payment: QA[] = !billing.enabled
    ? [{ q: "Combien ça coûte ?", a: "Aucun paiement n'est demandé sur ce site pour le moment. L'analyse de votre dossier est gratuite." }]
    : billing.mode === "success"
      ? [
          {
            q: "Combien ça coûte ?",
            a: `L'analyse et le premier courrier sont gratuits. Si votre problème est réglé, une commission de ${billing.fee.ratePct} % de ce que vous récupérez (entre ${eurosShort(billing.fee.minCents)} et ${eurosShort(billing.fee.maxCents)} €), ou ${eurosShort(billing.fee.flatCents)} € si le résultat n'est pas une somme d'argent. Sinon, rien.`,
          },
          {
            q: "Pourquoi enregistrer une carte si je ne paie rien d'avance ?",
            a: "Pour que la commission puisse être prélevée une fois le problème réglé, sans vous redemander vos coordonnées. La carte est conservée par Stripe, notre prestataire de paiement : Nimbrel ne la voit jamais.",
          },
          {
            q: "Qui décide que le problème est réglé ?",
            a: "Vous. Vous indiquez vous-même le résultat et le montant obtenu à la fin du dossier. Aucune commission n'est prélevée sans cette déclaration.",
          },
        ]
      : [{ q: "Combien ça coûte ?", a: `L'analyse est gratuite. La prise en charge d'un dossier coûte ${eurosShort(billing.priceCents)} € TTC, en une fois.` }];
  if (billing.enabled) payment.push({ q: "Où retrouver mes paiements et mes factures ?", a: "Dans votre espace, rubrique Paiements : l'historique par dossier, et un accès à la page sécurisée de Stripe pour changer de carte ou télécharger vos factures." });
  if (postal.enabled) payment.push({ q: "Atlas peut-il envoyer une lettre recommandée ?", a: `Oui, pour ${eurosShort(postal.priceCents)} € par envoi, payés au moment de l'envoi. La lettre est imprimée et postée avec accusé de réception.` });

  return [
    {
      id: "service",
      title: "Le service",
      items: [
        { q: "Quels problèmes Atlas peut-il régler ?", a: "Les litiges avec une entreprise : colis perdu, facture contestée, caution non rendue, abonnement impossible à résilier, remboursement qui n'arrive pas, service client muet. L'analyse gratuite vous dit en quelques instants si votre cas en fait partie." },
        { q: "Est-ce qu'Atlas envoie les courriers à ma place ?", a: `Atlas prépare et vérifie chaque courrier, puis c'est vous qui l'envoyez, en un clic. Rien ne part sans votre accord.${postal.enabled ? " Pour une lettre recommandée, Atlas peut aussi l'imprimer et la poster pour vous." : ""}` },
        { q: "Atlas est-il un avocat ?", a: "Non. Atlas est une intelligence artificielle. Il ne donne pas de conseil juridique personnalisé, ne vous représente pas en justice et ne garantit pas le résultat." },
        { q: "Que se passe-t-il si l'entreprise ne répond pas ?", a: "Atlas surveille les délais. À l'échéance, il reprend le dossier seul et prépare la suite : relance, mise en demeure, saisine du médiateur." },
        { q: "Quels documents puis-je ajouter ?", a: "Factures, e-mails, contrats, captures : PDF texte, DOCX, TXT, MD ou CSV. Atlas vérifie chaque montant et chaque date dans vos pièces." },
      ],
    },
    { id: "paiement", title: "Paiement", items: payment },
    {
      id: "donnees",
      title: "Vos données",
      items: [
        { q: "Atlas a-t-il accès à mes comptes ?", a: "Non. Atlas ne se connecte à aucun de vos comptes et ne vous demande jamais de mot de passe ni de code bancaire." },
        { q: "Combien de temps mes dossiers sont-ils conservés ?", a: `Un dossier inactif depuis ${retention} jours est supprimé automatiquement. Vous pouvez supprimer un dossier, ou votre compte entier, à tout moment depuis votre espace.` },
        { q: "Qui voit mes documents ?", a: "Vous, et les prestataires techniques nécessaires au service (hébergement, modèle d'intelligence artificielle). Le détail est dans la politique de confidentialité." },
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
          <p className="font-display text-2xl font-bold leading-tight">Le plus simple, c&apos;est d&apos;essayer.<br />L&apos;analyse de votre cas est gratuite.</p>
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
