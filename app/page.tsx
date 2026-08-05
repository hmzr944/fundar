import Link from "next/link";
import Image from "next/image";
import Icone from "@/components/Icone";
import Logotype from "@/components/Logotype";
import Trajectoire from "@/components/motif/Trajectoire";
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

/*
 * Délais de prescription, alignés sur config/jurisdictions.ts qui fait foi
 * pour le moteur. Toute correction juridique doit être portée aux deux
 * endroits — la table du moteur décide, celle-ci ne fait qu'informer.
 */
const PRESCRIPTION = [
  { pays: "Belgique", delai: "1 an" },
  { pays: "Italie, Pays-Bas", delai: "2 ans" },
  { pays: "Allemagne", delai: "3 ans" },
  { pays: "France, Espagne", delai: "5 ans" },
  { pays: "Angleterre, Galles", delai: "6 ans" },
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
    <main id="contenu">
      {/*
        Hero volontairement resté linéaire et centré : titre, une phrase,
        le champ. La grille bento commence en dessous. Encombrer ce premier
        écran de cartes ferait perdre la seule action qui compte.
      */}
      <section className="conteneur pt-14 pb-16 text-center sm:pt-20 sm:pb-20">
        {/* Le titre a été redimensionné en passant du serif à Geist : une
            sans en 700 occupe bien plus de largeur à corps égal, et les
            valeurs calées sur l'ancien dessin partaient sur quatre lignes. */}
        <div className="mx-auto max-w-[52rem]">
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

        <div className="mx-auto mt-9 max-w-[42rem] text-left">
          <CheckWidget />
        </div>

        {/* Double appel à l'action : l'un agit, l'autre rassure d'abord. */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-x-6 gap-y-3">
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
              className="carte carte-interactive flex flex-col p-6"
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
          <div className="rounded-[var(--radius-carte)] bg-[var(--color-accent-500)] p-6 text-white">
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

      {/*
        Le filet perforé remplace le trait de séparation ordinaire : c'est
        la découpe d'une souche de billet, seule forme graphique que la
        marque possède en propre, jusqu'ici cantonnée à la carte de verdict.
      */}
      <div className="conteneur">
        <div className="filet-perfore" />
      </div>

      {/* Réassurance : quatre chiffres, aucun superlatif. */}
      <section className="relative overflow-hidden border-b border-[var(--bordure)] bg-[var(--bg-eleve)]">
        <Trajectoire
          className="-bottom-40 -left-40 h-[30rem] w-[44rem]"
          opacite={0.05}
        />
        <div className="conteneur relative grid gap-8 py-12 sm:grid-cols-2 lg:grid-cols-4">
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
          {/* Chaque question est séparée par un pointillé plutôt qu'un
              trait plein : même langage que la souche du billet. */}
          <div className="mt-8 flex flex-col">
            {QUESTIONS.map((q, i) => (
              <details
                key={q.question}
                className={`group py-5 ${i > 0 ? "border-t-2 border-dashed border-[var(--bordure)]" : ""}`}
              >
                <summary className="flex cursor-pointer list-none items-center justify-between gap-4 text-[16px] font-semibold transition-colors hover:text-[var(--color-accent-600)]">
                  {q.question}
                  <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-[var(--bg-eleve-2)] text-[var(--texte-attenue)] transition-all duration-300 group-open:rotate-180 group-open:bg-[var(--color-accent-50)] group-open:text-[var(--color-accent-600)]">
                    <Icone nom="chevron" taille={16} />
                  </span>
                </summary>
                <p className="mt-3 max-w-[58ch] text-[15px] leading-relaxed text-[var(--texte-attenue)]">
                  {q.reponse}
                </p>
              </details>
            ))}
          </div>
        </div>
      </section>

      {/*
        Dernier appel.

        Cette section reprenait le formulaire du hero à l'identique, et la
        page se lisait comme une boucle plutôt qu'une progression. Répéter
        l'action en fin de page est juste — la supprimer ferait remonter le
        visiteur convaincu jusqu'en haut — mais la répéter TELLE QUELLE ne
        répond à aucune question nouvelle.

        Après le barème et la FAQ, l'objection restante n'est plus « combien »
        ni « comment » : c'est « est-il trop tard ». On mène donc par
        l'échéance, avec un seul champ au lieu de deux, et le formulaire
        complet reste à un clic.
      */}
      <section className="conteneur relative overflow-hidden py-20 sm:py-24">
        <Trajectoire
          className="-top-24 left-1/2 h-[34rem] w-[56rem] -translate-x-1/2"
          opacite={0.05}
        />
        <div className="relative grid items-center gap-10 lg:grid-cols-[1.1fr_0.9fr]">
          <div>
            <p className="etiquette">Le délai court</p>
            <h2 className="titre mt-2 max-w-[16ch] text-[1.75rem] sm:text-[2.25rem]">
              Un vol d&apos;il y a cinq ans peut encore être réclamé.
            </h2>
            <p className="mt-4 max-w-[46ch] text-[16px] leading-relaxed text-[var(--texte-attenue)]">
              Le délai dépend du pays du vol, pas de votre nationalité. Passé
              cette date le droit s&apos;éteint, et rien ne le rouvre. La
              vérification prend moins d&apos;une minute.
            </p>
            <Link href="/check" className="bouton bouton-primaire mt-7">
              Vérifier mon vol
              <Icone nom="fleche" taille={18} />
            </Link>
          </div>

          {/*
            Les délais de prescription, et non le barème.

            Une première version reprenait ici les montants 250/400/600 —
            déjà affichés dans le bento quelques écrans plus haut. Corriger
            une répétition en en créant une autre n'avance à rien. Ces
            délais, eux, n'apparaissent nulle part ailleurs sur la page, et
            ce sont eux qui donnent son sens au titre.
          */}
          <ul className="carte divide-y divide-dashed divide-[var(--bordure)] p-2">
            {PRESCRIPTION.map((pays, i) => (
              <li
                key={pays.pays}
                style={{ ["--rang" as string]: i }}
                className="flex items-baseline justify-between gap-4 p-4"
              >
                <span className="text-[15px] font-medium">{pays.pays}</span>
                <span className="chiffres text-[15px] font-bold text-[var(--color-accent-500)]">
                  {pays.delai}
                </span>
              </li>
            ))}
          </ul>
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
