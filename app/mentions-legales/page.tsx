import { Metadata } from "next";
import { ENTREPRISE, identiteIncomplete } from "@/config/entreprise";

export const metadata: Metadata = {
  title: "Mentions légales | Clearto",
  description:
    "Éditeur du site, hébergement, contact et cadre réglementaire du service Clearto.",
};

/**
 * Mentions légales et, surtout, un moyen de nous joindre.
 *
 * Le site n'en avait aucun : ni adresse, ni email, nulle part. C'est une
 * obligation légale pour un service en ligne, mais c'est d'abord une
 * contradiction avec ce qu'on vend. Le reproche adressé à tout le secteur
 * est de laisser les clients sans nouvelles ; un service de recouvrement
 * qu'on ne peut pas contacter la confirme avant même le premier dossier.
 *
 * Le contenu vient de config/entreprise.ts. Tant qu'il n'est pas renseigné,
 * la page le dit franchement plutôt que d'afficher des crochets vides.
 */
export default function MentionsLegalesPage() {
  const manquants = identiteIncomplete();

  return (
    <main id="contenu" className="conteneur-etroit py-14 sm:py-20">
      <h1 className="titre text-[1.875rem] sm:text-[2.5rem]">
        Mentions légales
      </h1>

      {manquants.length > 0 && (
        <div className="carte mt-8 border-[var(--color-accent-500)] p-5">
          <p className="text-[15px] font-semibold">
            Page incomplète — à renseigner avant la mise en ligne
          </p>
          <p className="mt-2 text-[15px] leading-relaxed text-[var(--texte-attenue)]">
            Éléments manquants : {manquants.join(", ")}. Ils se définissent par
            variables d&apos;environnement (<code>ENTREPRISE_*</code>), les
            mêmes que celles utilisées sur les factures.
          </p>
        </div>
      )}

      <section className="mt-10">
        <h2 className="titre text-[1.5rem]">Éditeur du site</h2>
        <div className="mt-3 flex flex-col gap-1 text-[15px] leading-relaxed text-[var(--texte-attenue)]">
          <p>
            {ENTREPRISE.raisonSociale} — {ENTREPRISE.formeJuridique}
          </p>
          <p>{ENTREPRISE.adresse}</p>
          <p>SIREN {ENTREPRISE.siren}</p>
          {ENTREPRISE.tvaIntracom && <p>TVA {ENTREPRISE.tvaIntracom}</p>}
        </div>
      </section>

      <section className="mt-10">
        <h2 className="titre text-[1.5rem]">Nous écrire</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--texte-attenue)]">
          Une question sur un dossier, une réclamation, ou l&apos;exercice de
          vos droits sur vos données :{" "}
          <a href={`mailto:${ENTREPRISE.email}`} className="underline">
            {ENTREPRISE.email}
          </a>
          . Nous répondons à chaque message, y compris pour dire qu&apos;un
          dossier n&apos;a pas avancé.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="titre text-[1.5rem]">Hébergement</h2>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--texte-attenue)]">
          Site hébergé par Vercel Inc. Données applicatives et documents
          hébergés par Supabase, au sein de l&apos;Union européenne.
        </p>
      </section>

      <section className="mt-10">
        <h2 className="titre text-[1.5rem]">
          Nature de l&apos;activité
        </h2>
        <p className="mt-3 text-[15px] leading-relaxed text-[var(--texte-attenue)]">
          Clearto exerce une activité de recouvrement amiable de créances pour le
          compte d&apos;autrui, régie par les articles R124-1 et suivants du
          Code des procédures civiles d&apos;exécution. Clearto n&apos;est pas un
          cabinet d&apos;avocats et ne fournit aucun conseil juridique.
        </p>
      </section>

      <div className="mt-12 border-t border-[var(--bordure)] pt-6">
        <a href="/cgv" className="bouton bouton-secondaire">
          Conditions générales de vente
        </a>
      </div>
    </main>
  );
}
