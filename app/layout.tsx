import type { Metadata, Viewport } from "next";
import { Instrument_Sans, Instrument_Serif } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

/*
  Deux familles au lieu d'une.

  Figtree était neutre au point d'être anonyme : la même géométrie que la
  moitié des sites de 2024, donc aucune mémoire visuelle. Instrument Sans
  garde cette lisibilité pour tout ce qui se lit vite — champs, tableaux,
  montants — pendant qu'Instrument Serif porte les titres.

  Le serif n'est pas décoratif ici. Sur un sujet d'argent et de droit, il
  fait basculer le ton de « application » vers « courrier » : c'est le
  registre d'un journal ou d'un cabinet, pas d'un formulaire. C'est
  exactement la promesse du produit — on vous dit la vérité par écrit.
*/
const texte = Instrument_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-texte",
  display: "swap",
});

const affichage = Instrument_Serif({
  subsets: ["latin"],
  weight: ["400"],
  style: ["normal", "italic"],
  variable: "--font-affichage",
  display: "swap",
});

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
    <html lang="fr" className={`${texte.variable} ${affichage.variable}`}>
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
