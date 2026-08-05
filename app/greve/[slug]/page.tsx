import { notFound } from "next/navigation";
import { Metadata } from "next";
import Icone from "@/components/Icone";
import { GREVES, perspectiveIndemnisation, trouverGreve } from "@/config/greves";
import { AEROPORTS } from "@/lib/eligibility/airports";
import { COMPAGNIES } from "@/lib/eligibility/airlines";
import CheckWidget from "@/components/CheckWidget";

export function generateStaticParams() {
  return GREVES.map((greve) => ({ slug: greve.slug }));
}

/** Registre vide = aucune page. Un slug non enregistré doit rester 404. */
export const dynamicParams = false;

function formaterPeriode(debut: string, fin: string) {
  const options: Intl.DateTimeFormatOptions = {
    day: "numeric",
    month: "long",
    year: "numeric",
  };
  const d = new Date(debut).toLocaleDateString("fr-FR", options);
  if (debut === fin) return `le ${d}`;
  return `du ${new Date(debut).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
  })} au ${new Date(fin).toLocaleDateString("fr-FR", options)}`;
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const greve = trouverGreve(params.slug);
  if (!greve) return {};

  const due = perspectiveIndemnisation(greve.origine) === "DUE";
  return {
    title: `${greve.titre} : avez-vous droit à une indemnisation ? | Volia`,
    description: due
      ? `Votre vol a été annulé ou retardé ${formaterPeriode(greve.dateDebut, greve.dateFin)}. Une grève du personnel de la compagnie n'est pas une circonstance extraordinaire : l'indemnisation reste due. Vérifiez en 60 secondes.`
      : `Votre vol a été perturbé ${formaterPeriode(greve.dateDebut, greve.dateFin)}. Vérifiez en 60 secondes si une indemnisation EU261/UK261 vous est due.`,
  };
}

export default function PageGreve({ params }: { params: { slug: string } }) {
  const greve = trouverGreve(params.slug);
  if (!greve) notFound();

  const due = perspectiveIndemnisation(greve.origine) === "DUE";

  const compagnies = greve.compagnies
    .map((code) => COMPAGNIES[code]?.nom ?? code)
    .join(", ");
  const aeroports = greve.aeroports
    .map((code) => AEROPORTS[code]?.nom ?? code)
    .join(", ");

  return (
    <main id="contenu" className="conteneur-etroit py-14 sm:py-20">
      <span className={`pilule ${due ? "pilule-eligible" : "pilule-revue"}`}>
        {due ? <Icone nom="coche-cercle" taille={15} /> : <Icone nom="recherche" taille={15} />}
        {due ? "Indemnisation due" : "À vérifier"}
      </span>

      <h1 className="mt-4 titre text-[1.875rem] sm:text-[2.5rem]">
        {greve.titre}
      </h1>
      <p className="mt-3 text-[17px] leading-relaxed text-[var(--texte-attenue)]">
        Vol annulé ou retardé {formaterPeriode(greve.dateDebut, greve.dateFin)}
        {compagnies && ` sur ${compagnies}`}
        {aeroports && ` à ${aeroports}`}.
      </p>

      {due ? (
        <div className="carte mt-8 p-6">
          <p className="text-[17px] font-semibold leading-snug">
            La compagnie vous a peut-être dit que non. Elle a tort.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--texte-attenue)]">
            Une grève du personnel de la compagnie relève de sa gestion
            normale : elle n&apos;est pas une circonstance extraordinaire, et
            n&apos;exonère donc pas le transporteur de son obligation
            d&apos;indemnisation. C&apos;est vrai même lorsque la grève est
            annoncée à l&apos;avance et suivie par un syndicat.
          </p>
          <p className="mt-3 text-[15px] leading-relaxed text-[var(--texte-attenue)]">
            Selon la distance de votre vol, le règlement européen prévoit 250,
            400 ou 600 € par passager — indépendamment du prix payé pour le
            billet.
          </p>
        </div>
      ) : (
        <div className="carte mt-8 p-6">
          <p className="text-[15px] leading-relaxed text-[var(--texte-attenue)]">
            Cette grève est extérieure à la compagnie. Elle est souvent
            retenue comme circonstance extraordinaire, ce qui écarte
            l&apos;indemnisation — mais pas toujours, et pas pour tous les
            vols de la période. Nous ne le devinons pas à votre place :
            indiquez votre vol, le verdict est immédiat et gratuit.
          </p>
        </div>
      )}

      <div className="mt-8">
        <CheckWidget />
      </div>

      <p className="mt-6 text-[15px] leading-relaxed text-[var(--texte-attenue)]">
        Aucune inscription pour obtenir le verdict. Si vous êtes éligible,
        nous portons la réclamation à votre place et ne sommes rémunérés
        qu&apos;en cas de succès.
      </p>

      <p className="mt-8 border-t border-[var(--bordure)] pt-4 text-[13px] text-[var(--texte-attenue)]">
        Source de l&apos;événement :{" "}
        <a href={greve.source} rel="nofollow noopener" target="_blank" className="underline">
          {new URL(greve.source).hostname}
        </a>
      </p>
    </main>
  );
}
