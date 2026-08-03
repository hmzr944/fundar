import Link from "next/link";

/**
 * La page 404 par défaut de Next.js s'affiche en anglais
 * (« This page could not be found. ») sur un site entièrement français.
 * Elle propose surtout un cul-de-sac : ici on ramène vers la seule action
 * qui compte.
 */
export default function NonTrouvee() {
  return (
    <main className="conteneur-etroit py-20 sm:py-28">
      <p className="chiffres text-sm font-semibold uppercase tracking-[0.12em] text-[var(--texte-attenue)]">
        Erreur 404
      </p>
      <h1 className="mt-3 text-3xl font-bold tracking-tight sm:text-4xl">
        Cette page n&apos;existe pas.
      </h1>
      <p className="mt-4 max-w-[52ch] text-[17px] leading-relaxed text-[var(--texte-attenue)]">
        Le lien est peut-être ancien, ou comporte une erreur. Si vous cherchiez
        à savoir si votre vol ouvre droit à une indemnisation, la vérification
        prend moins d&apos;une minute et ne demande aucune inscription.
      </p>

      <div className="mt-8 flex flex-wrap gap-3">
        <Link href="/check" className="bouton bouton-primaire">
          Vérifier un vol
        </Link>
        <Link href="/" className="bouton bouton-secondaire">
          Retour à l&apos;accueil
        </Link>
      </div>
    </main>
  );
}
