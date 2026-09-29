import Link from "next/link";
import type { MissionStatus } from "@/db/schema";
import { EmptyState, formatDate, MissionStatusBadge } from "@/components/ui";

export type MissionRow = {
  id: string;
  title: string;
  objective: string | null;
  status: MissionStatus;
  updatedAt: Date;
  totalSteps: number;
  doneSteps: number;
};

export function MissionList({ missions, empty }: { missions: MissionRow[]; empty: string }) {
  if (!missions.length) return <EmptyState title={empty} />;
  return (
    <ul className="glass divide-y divide-line/70 overflow-hidden rounded-2xl">
      {missions.map((m) => (
        <li key={m.id}>
          <Link
            href={`/app/missions/${m.id}`}
            className="group flex flex-col gap-2 px-4 py-3.5 transition-[background-color,padding] duration-300 hover:bg-[color-mix(in_srgb,var(--bg-elev)_60%,transparent)] hover:pl-6 sm:flex-row sm:items-center sm:gap-4"
          >
            <div className="min-w-0 flex-1">
              <p className="truncate font-medium">{m.title}</p>
              {m.objective && <p className="mt-0.5 truncate text-sm text-muted">{m.objective}</p>}
            </div>
            <div className="flex shrink-0 items-center gap-3 text-xs text-faint">
              {m.totalSteps > 0 && (
                <span>
                  {m.doneSteps}/{m.totalSteps} étapes
                </span>
              )}
              <span>{formatDate(m.updatedAt)}</span>
              <MissionStatusBadge status={m.status} />
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
