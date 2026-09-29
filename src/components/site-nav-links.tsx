"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const links = [
  { href: "/tarifs", label: "Tarifs" },
  { href: "/faq", label: "Questions" },
  { href: "/contact", label: "Contact" },
];

export function SiteNavLinks() {
  const pathname = usePathname();
  return (
    <nav aria-label="Informations" className="hidden items-center gap-1 md:flex">
      {links.map((l) => (
        <Link
          key={l.href}
          href={l.href}
          aria-current={pathname === l.href ? "page" : undefined}
          className="rounded-lg px-3 py-2 text-sm text-muted transition-colors hover:text-fg aria-[current=page]:text-fg aria-[current=page]:underline aria-[current=page]:decoration-accent aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-8"
        >
          {l.label}
        </Link>
      ))}
    </nav>
  );
}
