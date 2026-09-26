import Link from "next/link";

export function LegalFooter() {
  return (
    <footer className="border-t border-line py-6 text-center text-xs text-faint">
      <nav className="flex flex-wrap justify-center gap-4">
        <Link href="/mentions-legales" className="hover:text-fg">
          Mentions légales
        </Link>
        <Link href="/cgv" className="hover:text-fg">
          Conditions générales de vente
        </Link>
        <Link href="/confidentialite" className="hover:text-fg">
          Confidentialité
        </Link>
      </nav>
    </footer>
  );
}
