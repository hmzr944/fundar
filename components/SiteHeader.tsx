"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import Logotype from "./Logotype";

const LIENS = [
  { href: "/check", libelle: "Vérifier un vol" },
  { href: "/dashboard", libelle: "Mes dossiers" },
];

export default function SiteHeader() {
  const chemin = usePathname();

  return (
    <>
      {/*
        Lien d'évitement : premier arrêt de tabulation de la page, invisible
        à la souris. Sans lui, un utilisateur au clavier retraverse toute la
        navigation à chaque page avant d'atteindre le contenu.
      */}
      <a href="#contenu" className="saut-contenu">
        Aller au contenu
      </a>

      {/* Verre dépoli plutôt qu'un aplat translucide : le contenu qui défile
          dessous reste perceptible sans gêner la lecture du menu. */}
      <header className="sticky top-0 z-40 border-b border-[color-mix(in_srgb,#ffffff_50%,var(--bordure))] bg-[color-mix(in_srgb,var(--bg)_72%,transparent)] backdrop-blur-xl backdrop-saturate-150">
        <div className="conteneur flex h-16 items-center justify-between">
          <Link
            href="/"
            className="flex items-center text-[var(--texte)] transition-opacity hover:opacity-70"
            aria-label="Volia, retour à l'accueil"
          >
            <Logotype hauteur={21} titre={null} />
          </Link>

          <nav className="hidden items-center gap-1 sm:flex">
            {LIENS.map((lien) => {
              // La page courante était indiquée nulle part : rien ne disait
              // à l'utilisateur où il se trouvait dans le site.
              const actif = chemin === lien.href;
              return (
                <Link
                  key={lien.href}
                  href={lien.href}
                  aria-current={actif ? "page" : undefined}
                  className={`bouton bouton-fantome ${
                    actif
                      ? "!bg-[var(--bg-eleve-2)] !text-[var(--texte)]"
                      : ""
                  }`}
                >
                  {lien.libelle}
                </Link>
              );
            })}
          </nav>

          <Link
            href="/check"
            className="bouton bouton-primaire !py-2.5 !px-4 text-sm sm:hidden"
          >
            Vérifier
          </Link>
        </div>
      </header>
    </>
  );
}
