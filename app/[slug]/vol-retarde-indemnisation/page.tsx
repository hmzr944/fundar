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
    title: `Vol ${compagnie.nom} retardé ou annulé : indemnisation jusqu'à 600 € | Refund Radar`,
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
    <main className="page">
      <CheckWidget />
      <h1>Vol {compagnie.nom} retardé ou annulé ? Vérifiez votre indemnisation</h1>
      <p>
        Si votre vol {compagnie.nom} a été retardé de plus de 3 heures à
        l&apos;arrivée, annulé, ou si vous avez été refusé à
        l&apos;embarquement pour surbooking, vous avez peut-être droit à une
        indemnisation au titre du règlement EU261
        {compagnie.immatriculeeUeUk ? " ou UK261" : ""}.
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

      <p>
        Nous gérons la réclamation à votre place et ne sommes rémunérés
        qu&apos;en cas de succès.
      </p>
    </main>
  );
}
