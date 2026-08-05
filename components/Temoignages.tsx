import Icone, { type NomIcone } from "./Icone";

/**
 * Preuve sociale (référence Alan).
 *
 * IMPORTANT — à remplir dès les 3 premiers dossiers réels payés :
 * ajoutez les témoignages ci-dessous et la section basculera
 * automatiquement de "nos engagements" vers les vrais avis clients.
 *
 * N'inventez jamais de témoignage : de faux avis sont sanctionnables
 * (cf. l'amende de 193 000 $ infligée à DoNotPay pour survente) et
 * détruiraient la confiance qui est le seul actif du produit.
 */
interface Temoignage {
  citation: string;
  prenom: string;
  contexte: string;
  montant: string;
}

const TEMOIGNAGES: Temoignage[] = [
  // Exemple de format attendu, à décommenter et remplacer par un vrai avis :
  // {
  //   citation: "Dossier déposé un mardi, virement reçu six semaines plus tard.",
  //   prenom: "Prénom réel",
  //   contexte: "Vol CDG → FCO, retard de 4h",
  //   montant: "250 €",
  // },
];

const ENGAGEMENTS = [
  {
    icone: "coche" as NomIcone,
    titre: "Un droit, pas une faveur",
    texte:
      "L'indemnisation est prévue par le règlement européen EU261 depuis 2004. Nous ne négocions pas une remise commerciale, nous faisons appliquer un texte.",
  },
  {
    icone: "retour" as NomIcone,
    titre: "Rien à avancer",
    texte:
      "Aucun frais au dépôt, aucun frais si le dossier échoue. Nous ne sommes payés que sur ce qui arrive réellement sur votre compte.",
  },
  {
    icone: "cadenas" as NomIcone,
    titre: "Un refus reste un refus",
    texte:
      "Si votre dossier n'est pas défendable, nous vous le disons tout de suite et nous ne le prenons pas. Le verdict n'est jamais caché derrière un formulaire.",
  },
];

export default function Temoignages() {
  if (TEMOIGNAGES.length > 0) {
    return (
      <section className="conteneur py-20 sm:py-24">
        <h2 className="titre max-w-[22ch] text-[1.75rem] sm:text-[2.125rem]">
          Ils ont récupéré leur argent
        </h2>
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {TEMOIGNAGES.map((t) => (
            <figure key={t.citation} className="carte flex flex-col justify-between gap-5 p-6">
              <blockquote className="text-[15px] leading-relaxed">
                &ldquo;{t.citation}&rdquo;
              </blockquote>
              <figcaption className="flex items-end justify-between gap-3">
                <span className="text-sm">
                  <span className="font-semibold">{t.prenom}</span>
                  <br />
                  <span className="text-[var(--texte-attenue)]">{t.contexte}</span>
                </span>
                <span className="chiffres text-lg font-bold text-[var(--color-succes-600)]">
                  {t.montant}
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section className="conteneur py-20 sm:py-24">
      <h2 className="titre max-w-[26ch] text-[1.75rem] sm:text-[2.125rem]">
        Pourquoi nous faire confiance avant d&apos;avoir des avis
      </h2>
      <p className="mt-3 max-w-[52ch] text-[17px] leading-relaxed text-[var(--texte-attenue)]">
        Nous démarrons, et nous préférons le dire plutôt que d&apos;afficher des
        témoignages inventés. Voici ce sur quoi vous pouvez nous juger dès
        aujourd&apos;hui.
      </p>

      {/*
        Trois cartes égales côte à côte : c'est la rangée de fonctionnalités
        la plus reconnaissable d'une page générée, et elle donne aux trois
        engagements le même poids alors qu'ils ne se lisent pas au même
        moment du raisonnement.

        On passe donc à une liste numérotée, alignée à gauche, séparée par
        le pointillé du billet. Chaque ligne se lit dans l'ordre, le texte
        tient sur toute sa largeur, et le numéro sert de repère plutôt
        qu'une pastille d'icône répétée trois fois.
      */}
      <ol className="mt-10 flex flex-col">
        {ENGAGEMENTS.map((e, i) => (
          <li
            key={e.titre}
            className={`grid gap-x-8 gap-y-2 py-7 sm:grid-cols-[auto_0.9fr_1.4fr] sm:items-baseline ${
              i > 0 ? "border-t-2 border-dashed border-[var(--bordure)]" : ""
            }`}
          >
            <span className="chiffres text-[15px] font-bold text-[var(--color-accent-500)]">
              {String(i + 1).padStart(2, "0")}
            </span>
            <h3 className="text-[19px] font-semibold leading-snug">{e.titre}</h3>
            <p className="text-[15px] leading-relaxed text-[var(--texte-attenue)]">
              {e.texte}
            </p>
          </li>
        ))}
      </ol>
    </section>
  );
}

