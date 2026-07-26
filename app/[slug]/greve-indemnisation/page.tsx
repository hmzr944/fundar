import { notFound } from "next/navigation";
import { Metadata } from "next";
import { AEROPORTS, Aeroport } from "@/lib/eligibility/airports";
import { slugify } from "@/lib/seo/slugs";
import { BAREME } from "@/lib/eligibility/distance";
import CheckWidget from "@/components/CheckWidget";

function trouverAeroportParSlug(slug: string): Aeroport | undefined {
  return Object.values(AEROPORTS).find((a) => slugify(a.nom) === slug);
}

export function generateStaticParams() {
  return Object.values(AEROPORTS).map((a) => ({ slug: slugify(a.nom) }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const aeroport = trouverAeroportParSlug(params.slug);
  if (!aeroport) return {};
  return {
    title: `Grève à ${aeroport.nom} : indemnisation vol retardé ou annulé | Refund Radar`,
    description: `Vol au départ ou à l'arrivée de ${aeroport.nom} perturbé par une grève ? Vérifiez votre droit à indemnisation EU261/UK261 en 60 secondes.`,
  };
}

export default function PageAeroport({
  params,
}: {
  params: { slug: string };
}) {
  const aeroport = trouverAeroportParSlug(params.slug);
  if (!aeroport) notFound();

  return (
    <main className="page">
      <CheckWidget />
      <h1>Grève ou perturbation à {aeroport.nom} : votre indemnisation</h1>
      <p>
        Une grève (contrôle aérien, personnel au sol, personnel de la
        compagnie) a retardé ou annulé votre vol au départ ou à
        l&apos;arrivée de {aeroport.nom} ? Selon la cause exacte de la grève,
        vous pouvez avoir droit à une indemnisation EU261/UK261.
      </p>
      <p>
        Attention : une grève des contrôleurs aériens (externe à la
        compagnie) est souvent qualifiée de circonstance extraordinaire et
        nécessite une vérification manuelle. Une grève du personnel de la
        compagnie, en revanche, n&apos;exonère pas la compagnie de son
        obligation d&apos;indemnisation.
      </p>

      <h2>Barème indicatif</h2>
      <ul>
        <li>
          Vol ≤ 1 500 km : {BAREME.EUR.COURT} € / {BAREME.GBP.COURT} £
        </li>
        <li>
          Vol 1 500 – 3 500 km : {BAREME.EUR.MOYEN} € / {BAREME.GBP.MOYEN} £
        </li>
        <li>
          Vol &gt; 3 500 km : {BAREME.EUR.LONG} € / {BAREME.GBP.LONG} £
        </li>
      </ul>
    </main>
  );
}
