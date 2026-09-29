"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/tarifs", label: "Tarifs" },
  { href: "/faq", label: "Questions" },
  { href: "/contact", label: "Contact" },
];

const item =
  "rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-fg aria-[current=page]:text-fg aria-[current=page]:underline aria-[current=page]:decoration-accent aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8";

/** Desktop: inline links. Phone: a "Menu" disclosure, closed again on each page. */
export function SiteNavLinks({ signedIn }: { signedIn: boolean }) {
  const pathname = usePathname();
  return (
    <>
      <nav aria-label="Informations" className="hidden items-center gap-1 md:flex">
        {links.map((l) => (
          <Link key={l.href} href={l.href} aria-current={pathname === l.href ? "page" : undefined} className={item}>
            {l.label}
          </Link>
        ))}
      </nav>
      <details key={pathname} className="group relative md:hidden">
        <summary className="flex min-h-11 cursor-pointer list-none items-center rounded-lg px-3 text-sm font-medium [&::-webkit-details-marker]:hidden">
          Menu
        </summary>
        <nav aria-label="Informations" className="glass msg-in absolute left-0 top-12 z-50 flex w-48 flex-col rounded-2xl p-2">
          {[{ href: "/", label: "Accueil" }, ...links, ...(signedIn ? [] : [{ href: "/login", label: "Se connecter" }])].map((l) => (
            <Link key={l.href} href={l.href} aria-current={pathname === l.href ? "page" : undefined} className={`${item} min-h-11 content-center`}>
              {l.label}
            </Link>
          ))}
        </nav>
      </details>
    </>
  );
}
