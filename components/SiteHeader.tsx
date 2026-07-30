import Link from "next/link";
import BrandMark from "./BrandMark";

export default function SiteHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-[var(--bordure)] bg-[var(--bg)]/85 backdrop-blur-md">
      <div className="conteneur flex h-16 items-center justify-between">
        <Link
          href="/"
          className="flex items-center gap-2.5 text-[17px] font-bold tracking-tight text-[var(--texte)]"
        >
          <BrandMark size={34} />
          Refund Radar
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
