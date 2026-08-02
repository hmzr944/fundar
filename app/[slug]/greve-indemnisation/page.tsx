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
    title: `Grève à ${aeroport.nom} : indemnisation vol retardé ou annulé | Volia`,
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
    <main className="conteneur-etroit py-14 sm:py-20">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Grève à {aeroport.nom} : votre indemnisation
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-[var(--texte-attenue)]">
        Une grève (contrôle aérien, personnel au sol, personnel de la
        compagnie) a retardé ou annulé votre vol au départ ou à
        l&apos;arrivée de {aeroport.nom} ? Selon la cause exacte de la grève,
        vous pouvez avoir droit à une indemnisation EU261/UK261.
      </p>
      <p className="mt-4 text-[15px] leading-relaxed text-[var(--texte-attenue)]">
        Une grève des contrôleurs aériens, externe à la compagnie, est
        souvent qualifiée de circonstance extraordinaire et nécessite une
        vérification manuelle. Une grève du personnel de la compagnie,
        en revanche, n&apos;exonère pas la compagnie de son obligation
        d&apos;indemnisation.
      </p>

      <div className="mt-8">
        <CheckWidget />
      </div>

      <div className="carte mt-8 grid grid-cols-3 divide-x divide-[var(--bordure)] p-6 text-center">
        <div>
          <p className="text-2xl font-bold tabular-nums">{BAREME.EUR.COURT} €</p>
          <p className="mt-1 text-xs text-[var(--texte-attenue)]">Jusqu&apos;à 1 500 km</p>
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums">{BAREME.EUR.MOYEN} €</p>
          <p className="mt-1 text-xs text-[var(--texte-attenue)]">De 1 500 à 3 500 km</p>
        </div>
        <div>
          <p className="text-2xl font-bold tabular-nums">{BAREME.EUR.LONG} €</p>
          <p className="mt-1 text-xs text-[var(--texte-attenue)]">Au-delà de 3 500 km</p>
        </div>
      </div>
    </main>
  );
}
