import Link from "next/link";
import { SiteNavLinks } from "@/components/site-nav-links";
import { CtaLink, Logo, mainCta } from "@/components/ui";

/** The public pages' sticky glass bar: logo, the three info pages, account entry. */
export function SiteHeader({ signedIn }: { signedIn: boolean }) {
  const cta = mainCta(signedIn);
  return (
    <div className="glass sticky top-0 z-40 rounded-none border-x-0 border-t-0">
      <header className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-2 px-4 sm:px-6 lg:px-10">
        <div className="flex items-center gap-1">
          <Link href="/" aria-label="Nimbrel, accueil" className="mr-1">
            <Logo className="text-lg" />
          </Link>
          <SiteNavLinks signedIn={signedIn} />
        </div>
        <nav aria-label="Compte" className="flex items-center gap-1 sm:gap-3">
          {!signedIn && (
            <Link href="/login" className="hidden rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-fg sm:inline-flex">
              Se connecter
            </Link>
          )}
          <CtaLink href={cta.href}>{cta.label}</CtaLink>
        </nav>
      </header>
    </div>
  );
}
