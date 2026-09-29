"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { cx, Logo } from "@/components/ui";
import { api } from "@/lib/client/api";

const links = [
  { href: "/app", label: "Tableau de bord" },
  { href: "/app/history", label: "Historique" },
  { href: "/app/settings", label: "Paramètres" },
];

export function AppNav({ email, admin = false, billing = false }: { email: string; admin?: boolean; billing?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [leaving, setLeaving] = useState(false);

  async function logout() {
    setLeaving(true);
    await api("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    router.replace("/login");
    router.refresh();
  }

  return (
    <header className="glass sticky top-0 z-20 rounded-none border-x-0 border-t-0">
      <div className="mx-auto flex max-w-7xl flex-wrap items-center gap-x-3 gap-y-2 px-4 py-3 sm:flex-nowrap sm:px-6">
        <Link href="/app" aria-label="Accueil Atlas" className="flex items-center gap-2">
          <Logo />
          {/* AI Act, art. 50 §1 : information claire, à chaque interaction, que l'utilisateur échange avec un système d'IA. */}
          <span className="rounded-full border border-line-strong px-2 py-0.5 text-xs font-medium text-faint">Assistant IA</span>
        </Link>
        <nav aria-label="Navigation principale" className="order-last -mx-1 flex w-full min-w-0 gap-1 overflow-x-auto sm:order-none sm:mx-0 sm:ml-2 sm:w-auto sm:flex-1">
          {[...links, ...(billing ? [{ href: "/app/paiements", label: "Paiements" }] : []), ...(admin ? [{ href: "/app/admin", label: "Économie" }] : [])].map((l) => {
            const active = l.href === "/app" ? pathname === "/app" : pathname.startsWith(l.href);
            return (
              <Link
                key={l.href}
                href={l.href}
                aria-current={active ? "page" : undefined}
                className={cx(
                  "whitespace-nowrap rounded-lg px-3 py-1.5 text-sm transition-colors",
                  active ? "bg-surface-2 text-fg" : "text-muted hover:text-fg",
                )}
              >
                {l.label}
              </Link>
            );
          })}
        </nav>
        <span className="ml-auto hidden max-w-48 truncate text-xs text-faint md:inline" title={email}>
          {email}
        </span>
        <button onClick={logout} disabled={leaving} className="ml-auto rounded-lg md:ml-0 px-2.5 py-1.5 text-sm text-muted hover:bg-surface-2 hover:text-fg">
          Déconnexion
        </button>
      </div>
    </header>
  );
}
