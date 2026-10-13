import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import "./globals.css";

// Body: Archivo (OFL, self-hosted). Headlines: Satoshi, declared in globals.css
// from public/fonts/satoshi/ (Fontshare licence), with Archivo as its fallback.
const body = localFont({
  src: "./fonts/Archivo-Variable.woff2",
  weight: "100 900",
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
    <html lang="fr" className={body.variable} suppressHydrationWarning>
      <body className="text-fg">{children}</body>
    </html>
  );
}
