import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-affichage",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Refund Radar : indemnisation vol retardé ou annulé",
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
    <html lang="fr" className={figtree.variable}>
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
