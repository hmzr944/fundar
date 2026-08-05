import Link from "next/link";
import Image from "next/image";
import Icone from "@/components/Icone";
import Logotype from "@/components/Logotype";
import CheckWidget from "@/components/CheckWidget";
import Temoignages from "@/components/Temoignages";

/**
 * Photo sous licence Unsplash (gratuite, usage commercial autorisé) :
 * hero-wing-sunset.jpg — unsplash.com/photos/KmGJCEGNeuE (Janis Ringli)
 */

const ETAPES = [
  {
    icone: "recherche",
    titre: "Vous vérifiez",
    description:
      "Numéro de vol et date. Le verdict tombe en moins d'une minute, sans créer de compte.",
  },
  {
    icone: "signature",
    titre: "Vous signez",
    description:
      "Coordonnées, justificatif, signature à l'écran. Cinq minutes depuis votre téléphone.",
  },
  {
    icone: "retour",
    titre: "Nous récupérons",
    description:
      "Nous portons la réclamation face à la compagnie et vous suivez l'avancement jusqu'au virement.",
  },
] as const;

const BAREME = [
  { montant: "250 €", distance: "Jusqu'à 1 500 km", exemple: "Paris → Rome" },
  { montant: "400 €", distance: "1 500 à 3 500 km", exemple: "Paris → Istanbul" },
  { montant: "600 €", distance: "Plus de 3 500 km", exemple: "Paris → New York" },
];

/*
 * Quatre preuves, aucune redite du tarif — il est déjà porté par la carte
 * d'accent du bento. Chaque ligne est vérifiable : rien qui ressemble à un
 * chiffre d'autosatisfaction.
 */
const REASSURANCE = [
  { chiffre: "60 s", libelle: "pour connaître le verdict, sans créer de compte" },
  { chiffre: "6 ans", libelle: "pour réclamer, selon le pays du vol" },
  { chiffre: "2004", libelle: "le règlement européen qui vous protège" },
  { chiffre: "UE", libelle: "vos données restent hébergées en Europe" },
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
      {/*
        Hero volontairement resté linéaire et centré : titre, une phrase,
        le champ. La grille bento commence en dessous. Encombrer ce premier
        écran de cartes ferait perdre la seule action qui compte.
      */}
      <section className="conteneur pt-14 pb-16 text-center sm:pt-20 sm:pb-20">
        {/* Le titre a été redimensionné en passant du serif à Geist : une
            sans en 700 occupe bien plus de largeur à corps égal, et les
            valeurs calées sur l'ancien dessin partaient sur quatre lignes. */}
        <div className="entree-fade mx-auto max-w-[52rem]">
          <h1 className="titre text-[2.25rem] sm:text-[3.25rem]">
            Votre vol a été retardé.
            <br />
            <span className="text-[var(--color-accent-500)]">
              Récupérez votre argent.
            </span>
          </h1>
          <p className="mx-auto mt-6 max-w-[36rem] text-[17px] leading-relaxed text-[var(--texte-attenue)] sm:text-[19px]">
            Jusqu&apos;à 600 € par passager au titre du règlement européen.
            Vérifiez en moins d&apos;une minute, sans créer de compte.
          </p>
        </div>

        <div
          className="entree-fade mx-auto mt-9 max-w-[42rem] text-left"
          style={{ animationDelay: "80ms" }}
        >
          <CheckWidget />
        </div>

        {/* Double appel à l'action : l'un agit, l'autre rassure d'abord. */}
        <div
          className="entree-fade mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3"
          style={{ animationDelay: "140ms" }}
        >
          <Link
            href="#comment"
            className="text-[15px] font-semibold text-[var(--texte)] underline decoration-[var(--bordure)] underline-offset-4 transition-colors hover:decoration-[var(--color-accent-500)]"
          >
            Comment ça marche
          </Link>
          <span className="flex items-center gap-1.5 text-sm text-[var(--texte-attenue)]">
            <Icone nom="cadenas" taille={15} />
            Aucun frais si nous ne récupérons rien
          </span>
        </div>
      </section>

      {/*
        Bento. Colonnes égales sur grand écran, mais les cartes s'étendent
        sur deux colonnes ou deux rangées selon leur poids : la photo tient
        la hauteur, le barème occupe la largeur. Un `gap` unique remplace
        toutes les marges individuelles.
      */}
      <section id="comment" className="conteneur pb-20 sm:pb-24">
        <div className="grid auto-rows-[minmax(0,auto)] gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {/* Photo — verre dépoli posé dessus : c'est le seul endroit du
              site où il y a réellement quelque chose à flouter. */}
          <div className="reveler relative min-h-[22rem] overflow-hidden rounded-[var(--radius-carte)] sm:row-span-2 lg:min-h-[30rem]">
            <Image
              src="/images/hero-wing-sunset.jpg"
              alt="Vue de l'aile d'un avion depuis le hublot au coucher du soleil"
              fill
              priority
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 380px"
              className="object-cover"
            />
            <div className="verre-sur-image absolute inset-x-4 bottom-4 p-5">
              <p className="titre text-[1.5rem] leading-tight">
                Vous n&apos;avez rien à négocier.
              </p>
              <p className="mt-2 text-[14px] leading-relaxed text-[var(--texte-attenue)]">
                Vous n&apos;écrivez aucun courrier et ne relancez personne.
              </p>
            </div>
          </div>

          {/* Les trois étapes, une carte chacune */}
          {ETAPES.map((etape, index) => (
            <div
              key={etape.titre}
              className="carte carte-interactive reveler flex flex-col p-6"
            >
              <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[var(--color-accent-50)] text-[var(--color-accent-600)]">
                <Icone nom={etape.icone} taille={21} />
              </span>
              <h3 className="mt-4 text-[17px] font-semibold">
                {index + 1}. {etape.titre}
              </h3>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--texte-attenue)]">
                {etape.description}
              </p>
            </div>
          ))}

          {/*
            Carte d'accent : elle comble la dernière cellule de la deuxième
            rangée — sans elle la grille laissait deux trous — et donne à la
            composition son seul aplat de couleur, sinon tout le bento est
            crème sur crème.
          */}
          <div className="reveler rounded-[var(--radius-carte)] bg-[var(--color-accent-500)] p-6 text-white">
            <p className="titre text-[2.75rem] leading-none">0 €</p>
            <p className="mt-3 text-[15px] leading-relaxed text-white/85">
              si nous ne récupérons rien. 22 % en cas de succès, sans
              majoration même si la compagnie conteste.
            </p>
          </div>

          {/* Barème — pleine largeur, il porte les chiffres du produit */}
          <div className="carte reveler p-6 sm:col-span-2 lg:col-span-3">
            <h2 className="titre text-[1.5rem] leading-tight sm:text-[1.75rem]">
              Ce que la loi vous doit
            </h2>
            <p className="mt-2 max-w-[46ch] text-[15px] leading-relaxed text-[var(--texte-attenue)]">
              Le montant ne dépend pas du prix de votre billet, mais de la
              distance du vol. Un billet à 40 € peut ouvrir droit à 600 €.
            </p>
            <div className="cascade mt-6 grid gap-4 sm:grid-cols-3">
              {BAREME.map((palier, i) => (
                <div
                  key={palier.montant}
                  style={{ ["--rang" as string]: i }}
                  className="rounded-[var(--radius-champ)] bg-[var(--bg-eleve-2)] p-4"
                >
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

      {/* Réassurance : quatre chiffres, aucun superlatif. */}
      <section className="border-y border-[var(--bordure)] bg-[var(--bg-eleve)]">
        <div className="conteneur cascade grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
          {REASSURANCE.map((item, i) => (
            <div key={item.libelle} style={{ ["--rang" as string]: i }}>
              <p className="chiffres titre text-[2.5rem] leading-none">
                {item.chiffre}
              </p>
              <p className="mt-2 text-[15px] leading-relaxed text-[var(--texte-attenue)]">
                {item.libelle}
              </p>
            </div>
          ))}
        </div>
      </section>

      <Temoignages />

      {/* FAQ : lève les objections avant le dernier appel à l'action */}
      <section className="border-y border-[var(--bordure)] bg-[var(--bg-eleve)]">
        <div className="conteneur-etroit py-20 sm:py-24">
          <h2 className="titre text-[1.75rem] sm:text-[2.125rem]">
            Questions fréquentes
          </h2>
          <div className="mt-8 flex flex-col divide-y divide-[var(--bordure)]">
            {QUESTIONS.map((q) => (
              <details key={q.question} className="group py-5">
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold">
                  {q.question}
                  <Icone
                    nom="chevron"
                    taille={18}
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
        <h2 className="titre mx-auto max-w-[22ch] text-[1.75rem] sm:text-[2.25rem]">
          Votre vol vaut peut-être plus que vous ne pensez.
        </h2>
        <div className="mx-auto mt-8 max-w-[42rem] text-left">
          <CheckWidget taille="compact" />
        </div>
      </section>

      <footer className="border-t border-[var(--bordure)] bg-[var(--bg-eleve)]">
        <div className="conteneur flex flex-col gap-6 py-10 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <Logotype hauteur={20} />
            <p className="mt-3 flex items-center gap-1.5 text-sm text-[var(--texte-attenue)]">
              <Icone nom="cadenas" taille={14} />
              Données hébergées en Union européenne
            </p>
          </div>
          <nav className="flex flex-wrap gap-6 text-sm text-[var(--texte-attenue)]">
            <Link href="/check">Vérifier un vol</Link>
            <Link href="/dashboard">Mes dossiers</Link>
            <Link href="/cgv">Conditions générales</Link>
            <Link href="/mentions-legales">Mentions légales</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
