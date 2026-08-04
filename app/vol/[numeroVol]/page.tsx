import { Metadata } from "next";
import CheckWidget from "@/components/CheckWidget";

/** Généré à la demande et mis en cache (ISR), pas de generateStaticParams : le nombre de vols est illimité. */
export const revalidate = 3600;

export function generateMetadata({
  params,
}: {
  params: { numeroVol: string };
}): Metadata {
  const numeroVol = params.numeroVol.toUpperCase();
  return {
    title: `Vol ${numeroVol} retardé ou annulé ? Indemnisation EU261/UK261 | Volia`,
    description: `Le vol ${numeroVol} a-t-il été retardé, annulé ou surbooké ? Vérifiez votre droit à indemnisation en 60 secondes, sans créer de compte.`,
  };
}

export default function PageVol({
  params,
}: {
  params: { numeroVol: string };
}) {
  const numeroVol = params.numeroVol.toUpperCase();

  return (
    <main className="conteneur-etroit py-14 sm:py-20">
      <h1 className="titre text-[2.25rem] sm:text-[3rem]">
        Vol {numeroVol} : retardé, annulé ou surbooké ?
      </h1>
      <p className="mt-4 text-[17px] leading-relaxed text-[var(--texte-attenue)]">
        Indiquez la date de votre vol {numeroVol} pour vérifier immédiatement
        si vous avez droit à une indemnisation de 250 € à 600 € au titre du
        règlement EU261 ou UK261.
      </p>

      <div className="mt-8">
        <CheckWidget numeroVolInitial={numeroVol} />
      </div>

      <p className="mt-6 text-[15px] leading-relaxed text-[var(--texte-attenue)]">
        Aucune inscription n&apos;est requise pour obtenir votre verdict.
        Si vous êtes éligible, nous gérons la réclamation à votre place et ne
        sommes rémunérés qu&apos;en cas de succès.
      </p>
    </main>
  );
}
