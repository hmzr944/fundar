import Link from "next/link";
import Image from "next/image";
import {
  MagnifyingGlass,
  PenNib,
  Wallet,
  CaretDown,
  LockKey,
} from "@phosphor-icons/react/dist/ssr";
import BrandMark from "@/components/BrandMark";
import CheckWidget from "@/components/CheckWidget";
import Temoignages from "@/components/Temoignages";

/**
 * Photo sous licence Unsplash (gratuite, usage commercial autorisé) :
 * hero-wing-sunset.jpg — unsplash.com/photos/KmGJCEGNeuE (Janis Ringli)
 */

const ETAPES = [
  {
    icone: MagnifyingGlass,
    titre: "Vous vérifiez",
    description:
      "Numéro de vol et date. Le verdict tombe en moins d'une minute, sans créer de compte.",
  },
  {
    icone: PenNib,
    titre: "Vous signez",
    description:
      "Coordonnées, justificatif, signature à l'écran. Cinq minutes depuis votre téléphone.",
  },
  {
    icone: Wallet,
    titre: "Nous récupérons",
    description:
      "Nous portons la réclamation face à la compagnie et vous suivez l'avancement jusqu'au virement.",
  },
];

const BAREME = [
  { montant: "250 €", distance: "Jusqu'à 1 500 km", exemple: "Paris → Rome" },
  { montant: "400 €", distance: "1 500 à 3 500 km", exemple: "Paris → Istanbul" },
  { montant: "600 €", distance: "Plus de 3 500 km", exemple: "Paris → New York" },
];

const QUESTIONS = [
  {
    question: "Dois-je créer un compte pour savoir si j'ai droit à quelque chose ?",
    reponse:
      "Non. Le verdict s'affiche sans inscription. Un compte n'est demandé qu'à la toute fin, au moment de signer le mandat, et il se crée par simple lien email.",
  },
  {
    question: "Combien de temps ça prend ?",
    reponse:
      "La lettre de réclamation part sous 48 h après votre signature. Le délai de réponse dépend ensuite de la compagnie : de quelques semaines à plusieurs mois selon son comportement de paiement habituel.",
  },
  {
    question: "Et si mon dossier est refusé ?",
    reponse:
      "Vous ne payez rien. Nous ne sommes rémunérés que sur une indemnisation réellement encaissée. Un dossier perdu ne vous coûte rien.",
  },
  {
    question: "Pourquoi 22 % de commission ?",
    reponse:
      "C'est moins qu'AirHelp (35 %, jusqu'à 50 % en cas de contentieux) et dans le bas de la fourchette de Flightright (20 à 30 % hors taxes), sans majoration si l'affaire se complique.",
  },
  {
    question: "Que faites-vous de mes données ?",
    reponse:
      "Elles sont hébergées en Union européenne, nous n'accédons jamais à votre messagerie, et vous pouvez supprimer votre compte et tous vos documents à tout moment.",
  },
];

export default function HomePage() {
  return (
    <main>
      {/* Hero : titre, une phrase, et le widget. Rien d'autre (réf. Airbnb / Wise). */}
      <section className="conteneur pt-16 pb-20 text-center sm:pt-24 sm:pb-24">
        <div className="entree-fade mx-auto max-w-[38rem]">
          <h1 className="text-[2.5rem] font-bold leading-[1.05] tracking-tight sm:text-[3.5rem]">
            Votre vol a été retardé.{" "}
            <span className="text-[var(--color-accent-500)]">
              Récupérez votre argent.
            </span>
          </h1>
          <p className="mx-auto mt-5 max-w-[34rem] text-[17px] leading-relaxed text-[var(--texte-attenue)] sm:text-[19px]">
            Jusqu&apos;à 600 € par passager au titre du règlement européen.
            Vérifiez en moins d&apos;une minute, sans créer de compte.
          </p>
        </div>

        <div className="entree-fade mx-auto mt-9 max-w-[42rem] text-left" style={{ animationDelay: "80ms" }}>
          <CheckWidget />
          <p className="mt-3 text-center text-sm text-[var(--texte-attenue)]">
            Aucun frais si nous ne récupérons rien. 22 % uniquement en cas de succès.
          </p>
        </div>
      </section>

      {/* Barème : des montants réels, prévus par la loi. Preuve concrète. */}
      <section className="border-y border-[var(--bordure)] bg-[var(--bg-eleve)]">
        <div className="conteneur py-16 sm:py-20">
          <div className="grid gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:gap-16">
            <div>
              <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
                Ce que la loi vous doit
              </h2>
              <p className="mt-3 max-w-[38ch] text-[17px] leading-relaxed text-[var(--texte-attenue)]">
                Le montant ne dépend pas du prix de votre billet, mais de la
                distance du vol. Un billet à 40 € peut ouvrir droit à 600 €.
              </p>
            </div>

            <div className="grid gap-4 sm:grid-cols-3">
              {BAREME.map((palier) => (
                <div key={palier.montant} className="carte p-5">
                  <p className="chiffres text-3xl font-bold text-[var(--color-accent-500)]">
                    {palier.montant}
                  </p>
                  <p className="mt-2 text-sm font-medium">{palier.distance}</p>
                  <p className="mt-0.5 text-sm text-[var(--texte-attenue)]">
                    ex. {palier.exemple}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Parcours : photo réelle + trois étapes numérotées */}
      <section className="conteneur py-20 sm:py-24">
        <div className="grid gap-12 lg:grid-cols-[1fr_1fr] lg:items-center lg:gap-16">
          <div className="relative h-[20rem] overflow-hidden rounded-[var(--radius-carte)] sm:h-[26rem]">
            <Image
              src="/images/hero-wing-sunset.jpg"
              alt="Vue de l'aile d'un avion depuis le hublot au coucher du soleil"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 520px"
              className="object-cover"
            />
          </div>

          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Vous n&apos;avez rien à négocier
            </h2>
            <p className="mt-3 max-w-[40ch] text-[17px] leading-relaxed text-[var(--texte-attenue)]">
              Nous prenons le dossier à notre charge de bout en bout. Vous
              n&apos;écrivez aucun courrier et ne relancez personne.
            </p>

            <ol className="mt-9 flex flex-col gap-7">
              {ETAPES.map((etape, index) => {
                const Icone = etape.icone;
                return (
                  <li key={etape.titre} className="flex gap-4">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-50)] text-[var(--color-accent-600)]">
                      <Icone size={20} weight="bold" />
                    </span>
                    <div>
                      <h3 className="text-[17px] font-semibold">
                        {index + 1}. {etape.titre}
                      </h3>
                      <p className="mt-1 max-w-[44ch] text-[15px] leading-relaxed text-[var(--texte-attenue)]">
                        {etape.description}
                      </p>
                    </div>
                  </li>
                );
              })}
            </ol>
          </div>
        </div>
      </section>

      <div className="border-t border-[var(--bordure)]" />

      {/* Preuve sociale (bascule automatiquement sur de vrais avis dès qu'il y en a) */}
      <Temoignages />

      {/* FAQ : lève les objections avant le dernier appel à l'action */}
      <section className="border-y border-[var(--bordure)] bg-[var(--bg-eleve)]">
        <div className="conteneur-etroit py-20 sm:py-24">
          <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
            Questions fréquentes
          </h2>
          <div className="mt-8 flex flex-col divide-y divide-[var(--bordure)]">
            {QUESTIONS.map((q) => (
              <details key={q.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold">
                  {q.question}
                  <CaretDown
                    size={18}
                    className="shrink-0 text-[var(--texte-attenue)] transition-transform duration-200 group-open:rotate-180"
                  />
                </summary>
                <p className="mt-3 max-w-[58ch] text-[15px] leading-relaxed text-[var(--texte-attenue)]">
                  {q.reponse}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/* Dernier appel : on redonne le widget plutôt qu'un simple bouton */}
      <section className="conteneur py-20 text-center sm:py-24">
        <h2 className="mx-auto max-w-[26ch] text-2xl font-semibold tracking-tight sm:text-3xl">
          Votre vol vaut peut-être plus que vous ne pensez.
        </h2>
        <div className="mx-auto mt-8 max-w-[42rem] text-left">
          <CheckWidget taille="compact" />
        </div>
      </section>

      <footer className="border-t border-[var(--bordure)] bg-[var(--bg-eleve)]">
        <div className="conteneur flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <span className="flex items-center gap-2.5 font-semibold">
              <BrandMark size={26} />
              Refund Radar
            </span>
            <p className="mt-2 flex items-center gap-1.5 text-sm text-[var(--texte-attenue)]">
              <LockKey size={14} />
              Données hébergées en Union européenne
            </p>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm text-[var(--texte-attenue)]">
            <Link href="/check">Vérifier un vol</Link>
            <Link href="/dashboard">Mes dossiers</Link>
            <Link href="/cgv">Conditions générales</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
