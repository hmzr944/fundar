import Link from "next/link";

const links = [
  { href: "/tarifs", label: "Tarifs" },
  { href: "/faq", label: "Questions fréquentes" },
  { href: "/contact", label: "Contact" },
  { href: "/mentions-legales", label: "Mentions légales" },
  { href: "/cgv", label: "Conditions générales de vente" },
  { href: "/confidentialite", label: "Confidentialité" },
];

export function LegalFooter() {
  return (
    <footer className="border-t border-line py-6 text-center text-xs text-faint">
      <nav aria-label="Pied de page" className="flex flex-wrap justify-center gap-x-4 gap-y-2 px-4">
        {links.map((l) => (
          <Link key={l.href} href={l.href} className="hover:text-fg">
            {l.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
