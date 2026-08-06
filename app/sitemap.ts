import { MetadataRoute } from "next";
import { COMPAGNIES } from "@/lib/eligibility/airlines";
import { AEROPORTS } from "@/lib/eligibility/airports";
import { slugify } from "@/lib/seo/slugs";
import { grevesEncoreReclamables } from "@/config/greves";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://clearto.example";

export default function sitemap(): MetadataRoute.Sitemap {
  const pagesStatiques: MetadataRoute.Sitemap = [
    { url: BASE_URL, changeFrequency: "weekly", priority: 1 },
    { url: `${BASE_URL}/check`, changeFrequency: "weekly", priority: 0.9 },
  ];

  const pagesCompagnies: MetadataRoute.Sitemap = Object.values(COMPAGNIES).map(
    (c) => ({
      url: `${BASE_URL}/${slugify(c.nom)}/vol-retarde-indemnisation`,
      changeFrequency: "weekly",
      priority: 0.7,
    })
  );

  const pagesAeroports: MetadataRoute.Sitemap = Object.values(AEROPORTS).map(
    (a) => ({
      url: `${BASE_URL}/${slugify(a.nom)}/greve-indemnisation`,
      changeFrequency: "weekly",
      priority: 0.7,
    })
  );

  // Pages d'événement. Priorité haute et rafraîchissement quotidien : la
  // recherche a lieu dans les heures qui suivent la grève, pas des mois
  // après. Retirées automatiquement passé le délai de prescription le plus
  // court d'Europe, pour ne pas indexer un droit éteint.
  const pagesGreves: MetadataRoute.Sitemap = grevesEncoreReclamables().map(
    (greve) => ({
      url: `${BASE_URL}/greve/${greve.slug}`,
      changeFrequency: "daily",
      priority: 0.9,
    })
  );

  return [
    ...pagesStatiques,
    ...pagesGreves,
    ...pagesCompagnies,
    ...pagesAeroports,
  ];
}
