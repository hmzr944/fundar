import { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://volia.example";

/**
 * Le site répondait 404 sur /robots.txt.
 *
 * Sans ce fichier, rien n'indique aux moteurs où trouver le sitemap, et
 * surtout rien n'empêche l'indexation des pages qui n'ont aucune raison
 * d'être publiques — un dossier client ou un tableau de bord d'exploitation
 * n'a pas à apparaître dans un résultat de recherche.
 */
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin", "/dashboard", "/claim", "/api/", "/auth/"],
    },
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
