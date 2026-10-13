import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

const heading = localFont({
  src: [
    { path: "./fonts/HyperlegibleSans-Medium.woff2", weight: "500", style: "normal" },
    { path: "./fonts/HyperlegibleSans-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-heading-face",
  display: "swap",
});

const body = localFont({
  src: "./fonts/SpaceGrotesk-Variable.ttf",
  weight: "300 700",
  variable: "--font-body-face",
  display: "swap",
});

export const metadata: Metadata = {
  title: { default: "Nimbrel, l'argent de vos chantiers", template: "%s · Nimbrel" },
  description: "Retenues de garantie, situations impayées, intérêts des marchés publics : Nimbrel prépare les courriers et surveille les délais pour les entreprises du bâtiment.",
};

export const viewport: Viewport = { themeColor: "#eef1f4", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" className={`${heading.variable} ${body.variable}`} suppressHydrationWarning>
      <body className="text-fg">{children}</body>
    </html>
  );
}
