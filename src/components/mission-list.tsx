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
    <ul className="divide-y divide-line overflow-hidden rounded-xl border border-line">
      {missions.map((m) => (
        <li key={m.id}>
          <Link
            href={`/app/missions/${m.id}`}
            className="flex flex-col gap-2 bg-surface/40 px-4 py-3.5 transition-colors hover:bg-surface-2/70 sm:flex-row sm:items-center sm:gap-4"
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
