import { MetadataRoute } from "next";
import { COMPAGNIES } from "@/lib/eligibility/airlines";
import { AEROPORTS } from "@/lib/eligibility/airports";
import { slugify } from "@/lib/seo/slugs";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://refundradar.example";

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

  return [...pagesStatiques, ...pagesCompagnies, ...pagesAeroports];
}
