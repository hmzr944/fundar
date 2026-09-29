import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Nimbrel — votre agent personnel", template: "%s · Nimbrel" },
  description: "Dites à Atlas, votre agent Nimbrel, ce que vous voulez accomplir. Il vous aide à le faire avancer, étape par étape.",
};

export const viewport: Viewport = { themeColor: "#05070d", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className="bg-bg text-fg">{children}</body>
    </html>
  );
}
