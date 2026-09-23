import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Atlas — votre agent personnel", template: "%s · Atlas" },
  description: "Dites à Atlas ce que vous voulez accomplir. Il vous aide à le faire avancer, étape par étape.",
};

export const viewport: Viewport = { themeColor: "#070b14", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="fr">
      <body className="bg-bg text-fg">{children}</body>
    </html>
  );
}
