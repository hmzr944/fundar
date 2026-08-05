import type { Metadata, Viewport } from "next";
import { GeistSans } from "geist/font/sans";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

/*
  Une seule famille : Geist, en variable.

  Une version précédente opposait un serif de titrage à une sans de texte.
  Le serif donnait au produit un registre de courrier plutôt que
  d'application, ce qui servait la promesse — mais le choix retenu est une
  sans unique, et il vaut mieux une famille assumée que deux mal mariées.

  Geist étant variable de 100 à 900, tout le contraste vient désormais de
  la graisse et de la taille, plus du dessin. Les titres descendent donc
  volontairement en interlignage et en approche (voir .titre) : une sans
  très grande avec les réglages par défaut se lit comme un bloc de texte
  agrandi, pas comme un titre.

  La police vient du paquet `geist` publié par Vercel, et non de
  `next/font/google` : le catalogue Google de Next 14 est figé à la version
  du framework et ne connaît pas encore Geist. Le paquet embarque les
  fichiers, donc rien n'est téléchargé au chargement de la page.
*/

export const metadata: Metadata = {
  title: "Volia : indemnisation vol retardé ou annulé",
  description:
    "Vérifiez en 60 secondes si vous avez droit à une indemnisation EU261/UK261 pour votre vol. Aucun frais si nous ne récupérons rien.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#fdf9f5",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={GeistSans.variable}>
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
