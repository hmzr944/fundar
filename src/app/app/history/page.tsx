import type { Metadata } from "next";
import Link from "next/link";
import { getDb } from "@/db";
import { MissionList } from "@/components/mission-list";
import { cx } from "@/components/ui";
import { requirePageUser } from "@/lib/http";
import { listMissions, type MissionFilter } from "@/server/missions/service";

export const metadata: Metadata = { title: "Historique" };

const filters: { key: MissionFilter; label: string }[] = [
  { key: "all", label: "Toutes" },
  { key: "needs_action", label: "À traiter" },
  { key: "active", label: "En cours" },
  { key: "done", label: "Terminées ou échouées" },
];

export default async function History({ searchParams }: PageProps<"/app/history">) {
  const user = await requirePageUser();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.slice(0, 200) : "";
  const filter = filters.some((f) => f.key === sp.filter) ? (sp.filter as MissionFilter) : "all";
  const missions = await listMissions(getDb(), user.id, { filter, q, limit: 200 });
  return (
    <div className="space-y-5">
      <h1 className="text-2xl font-semibold tracking-tight">Historique des missions</h1>
      <form className="flex flex-col gap-3 sm:flex-row" role="search">
        <label htmlFor="q" className="sr-only">
          Rechercher une mission
        </label>
        <input
          id="q"
          name="q"
          defaultValue={q}
          placeholder="Rechercher par titre, demande ou objectif…"
          className="flex-1 rounded-lg border border-line-strong bg-elev px-3 py-2 text-sm outline-none placeholder:text-faint focus:border-accent"
        />
        <input type="hidden" name="filter" value={filter} />
        <button className="rounded-lg border border-line-strong bg-surface-2 px-4 py-2 text-sm hover:border-accent/60">Rechercher</button>
      </form>
      <nav aria-label="Filtres" className="flex flex-wrap gap-2">
        {filters.map((f) => (
          <Link
            key={f.key}
            href={{ pathname: "/app/history", query: { filter: f.key, ...(q ? { q } : {}) } }}
            aria-current={f.key === filter ? "page" : undefined}
            className={cx(
              "rounded-full border px-3 py-1 text-sm",
              f.key === filter ? "border-accent/60 bg-accent/10 text-fg" : "border-line text-muted hover:text-fg",
            )}
          >
            {f.label}
          </Link>
        ))}
      </nav>
      <MissionList missions={missions} empty={q ? "Aucune mission ne correspond à cette recherche." : "Aucune mission dans cette catégorie."} />
    </div>
  );
}
