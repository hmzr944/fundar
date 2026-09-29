import Link from "next/link";
import { SiteNavLinks } from "@/components/site-nav-links";
import { LinkButton, Logo } from "@/components/ui";

/** The public pages' sticky glass bar: logo, the three info pages, account entry. */
export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  const cta = signedIn ? { href: "/app", label: "Ouvrir mon espace" } : { href: "/signup", label: "Commencer" };
  return (
    <div className="glass sticky top-0 z-40 rounded-none border-x-0 border-t-0">
      <header className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-10">
        <Link href="/" aria-label="Nimbrel, accueil">
          <Logo className="text-lg" />
        </Link>
        <SiteNavLinks />
        <nav aria-label="Compte" className="flex items-center gap-2">
          {!signedIn && (
            <LinkButton href="/login" variant="ghost">
              Se connecter
            </LinkButton>
          )}
          <LinkButton href={cta.href} variant="primary">
            {cta.label}
          </LinkButton>
        </nav>
      </header>
    </div>
  );
}
