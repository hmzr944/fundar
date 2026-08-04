import Link from "next/link";
import Logotype from "./Logotype";

export default function SiteHeader() {
  return (
    // Verre dépoli plutôt qu'un aplat translucide : le contenu qui défile
    // dessous reste perceptible sans jamais gêner la lecture du menu.
    <header className="sticky top-0 z-40 border-b border-[color-mix(in_srgb,#ffffff_50%,var(--bordure))] bg-[color-mix(in_srgb,var(--bg)_72%,transparent)] backdrop-blur-xl backdrop-saturate-150">
      <div className="conteneur flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center text-[var(--texte)] transition-opacity hover:opacity-70"
        >
          <Logotype hauteur={21} />
        </Link>

        <nav className="hidden items-center gap-1 sm:flex">
          <Link href="/check" className="bouton bouton-fantome">
            Vérifier un vol
          </Link>
          <Link href="/dashboard" className="bouton bouton-fantome">
            Mes dossiers
          </Link>
        </nav>

        <Link href="/check" className="bouton bouton-primaire !py-2.5 !px-4 text-sm sm:hidden">
          Vérifier
        </Link>
      </div>
    </header>
  );
}
