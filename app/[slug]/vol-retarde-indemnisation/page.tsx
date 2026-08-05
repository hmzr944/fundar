import { notFound } from "next/navigation";
import { Metadata } from "next";
import { COMPAGNIES, Compagnie } from "@/lib/eligibility/airlines";
import { slugify } from "@/lib/seo/slugs";
import { BAREME } from "@/lib/eligibility/distance";
import CheckWidget from "@/components/CheckWidget";

function trouverCompagnieParSlug(slug: string): Compagnie | undefined {
  return Object.values(COMPAGNIES).find((c) => slugify(c.nom) === slug);
}

export function generateStaticParams() {
  return Object.values(COMPAGNIES).map((c) => ({ slug: slugify(c.nom) }));
}

export function generateMetadata({
  params,
}: {
  params: { slug: string };
}): Metadata {
  const compagnie = trouverCompagnieParSlug(params.slug);
  if (!compagnie) return {};
  return {
    title: `Vol ${compagnie.nom} retardé ou annulé : indemnisation jusqu'à 600 € | Volia`,
    description: `Vol ${compagnie.nom} retardé de plus de 3h, annulé ou surbooké ? Vérifiez gratuitement votre éligibilité à une indemnisation EU261/UK261 en 60 secondes.`,
  };
}

export default function PageCompagnie({
  params,
}: {
  params: { slug: string };
}) {
  const compagnie = trouverCompagnieParSlug(params.slug);
  if (!compagnie) notFound();

  return (
    <main className="conteneur-etroit py-14 sm:py-20">
      <h1 className="titre text-[1.875rem] sm:text-[2.5rem]">
        Vol {compagnie.nom} retardé ou annulé ?
      </h1>
      <p className="mt-4 text-[15px] leading-relaxed text-[var(--texte-attenue)]">
        Si votre vol {compagnie.nom} a été retardé de plus de 3 heures à
        l&apos;arrivée, annulé, ou si vous avez été refusé à
        l&apos;embarquement pour surbooking, vous avez peut-être droit à une
        indemnisation au titre du règlement EU261
        {compagnie.immatriculeeUeUk ? " ou UK261" : ""}.
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

      <p className="mt-6 text-[15px] leading-relaxed text-[var(--texte-attenue)]">
        Nous gérons la réclamation à votre place et ne sommes rémunérés
        qu&apos;en cas de succès.
      </p>
    </main>
  );
}
