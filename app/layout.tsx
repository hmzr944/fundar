import type { Metadata, Viewport } from "next";
import { Onest, Space_Mono } from "next/font/google";
import SiteHeader from "@/components/SiteHeader";
import "./globals.css";

const onest = Onest({
  subsets: ["latin"],
  weight: ["500", "600", "700"],
  variable: "--font-affichage",
  display: "swap",
});

const spaceMono = Space_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
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
  themeColor: "#0d0b09",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="fr" className={`${onest.variable} ${spaceMono.variable}`}>
      <body>
        <SiteHeader />
        {children}
      </body>
    </html>
  );
}
