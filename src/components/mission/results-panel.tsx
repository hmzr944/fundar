"use client";

import { useState } from "react";
import { Markdown } from "@/components/markdown";
import { Button, EmptyState, formatDate } from "@/components/ui";
import { api } from "@/lib/client/api";
import type { ArtifactDTO, MissionDTO } from "@/lib/client/types";

const TYPE_LABELS: Record<ArtifactDTO["type"], string> = {
  letter: "Courrier",
  email: "E-mail",
  checklist: "Checklist",
  action_plan: "Plan d'action",
  comparison_table: "Tableau comparatif",
  summary: "Synthèse",
  report: "Compte rendu",
  other: "Document",
};

export function ResultsPanel({
  mission,
  artifacts,
  locked,
  onChanged,
}: {
  mission: MissionDTO;
  artifacts: ArtifactDTO[];
  locked: boolean;
  onChanged: () => void;
}) {
  return (
    <div className="space-y-6">
      {mission.report && (
        <section aria-labelledby="report-title" className="rounded-xl border border-line bg-elev/60 p-4">
          <h3 id="report-title" className="mb-2 text-sm font-semibold text-muted">
            Dernier compte rendu d&apos;Atlas
          </h3>
          <Markdown>{mission.report}</Markdown>
          {mission.remainingActions.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-warning">Ce qui vous reste à faire</p>
              <ul className="mt-1 list-disc pl-5 text-sm">
                {mission.remainingActions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          )}
          {mission.limitations.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-muted">Limites signalées</p>
              <ul className="mt-1 list-disc pl-5 text-sm text-muted">
                {mission.limitations.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <section aria-labelledby="deliverables-title">
        <h3 id="deliverables-title" className="mb-3 text-sm font-semibold text-muted">
          Livrables ({artifacts.length})
        </h3>
        {artifacts.length === 0 ? (
          <EmptyState title="Aucun livrable pour l'instant">Les documents produits par Atlas apparaîtront ici.</EmptyState>
        ) : (
          <div className="space-y-3">
            {artifacts.map((a) => (
              <ArtifactCard key={a.id} artifact={a} locked={locked} onChanged={onChanged} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ArtifactCard({ artifact, locked, onChanged }: { artifact: ArtifactDTO; locked: boolean; onChanged: () => void }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(artifact.content);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasTable = /^\s*\|.*\|\s*$/m.test(artifact.content) && /^\s*\|?\s*:?-{2,}/m.test(artifact.content);

  async function copy() {
    try {
      await navigator.clipboard.writeText(artifact.content);
      setStatus("Copié dans le presse-papiers.");
    } catch {
      setStatus("La copie a été refusée par le navigateur.");
    }
    setTimeout(() => setStatus(null), 2500);
  }

  async function save() {
    setError(null);
    try {
      await api(`/api/artifacts/${artifact.id}`, { method: "PATCH", json: { content: draft } });
      setEditing(false);
      setStatus("Modifications enregistrées.");
      setTimeout(() => setStatus(null), 2500);
      onChanged();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <article className="rounded-xl border border-line bg-elev/60" data-testid="artifact">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="rounded-md bg-accent/10 px-2 py-0.5 text-[11px] font-medium text-accent">{TYPE_LABELS[artifact.type]}</span>
        <span className="min-w-0 flex-1 truncate font-medium">{artifact.name}</span>
        {artifact.editedByUser && <span className="text-[11px] text-faint">modifié par vous</span>}
        <span className="hidden text-xs text-faint sm:inline">{formatDate(artifact.updatedAt)}</span>
        <span className="text-faint" aria-hidden>
          {open ? "▴" : "▾"}
        </span>
      </button>
      {open && (
        <div className="border-t border-line px-4 py-4">
          {editing ? (
            <div className="space-y-2">
              <label className="sr-only" htmlFor={`edit-${artifact.id}`}>
                Contenu du livrable (Markdown)
              </label>
              <textarea
                id={`edit-${artifact.id}`}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={16}
                className="w-full rounded-lg border border-line bg-bg px-3 py-2 font-mono text-sm outline-none focus:border-accent"
              />
              <div className="flex gap-2">
                <Button variant="primary" onClick={save}>
                  Enregistrer
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setDraft(artifact.content);
                    setEditing(false);
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <Markdown>{artifact.content}</Markdown>
          )}
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
            <Button className="px-2.5 py-1 text-xs" onClick={copy}>
              Copier
            </Button>
            {!editing && !locked && (
              <Button className="px-2.5 py-1 text-xs" onClick={() => setEditing(true)}>
                Modifier
              </Button>
            )}
            <a className="rounded-lg border border-line-strong px-2.5 py-1 text-xs hover:border-accent/60" href={`/api/artifacts/${artifact.id}/download?format=docx`}>
              Télécharger .docx
            </a>
            <a className="rounded-lg border border-line-strong px-2.5 py-1 text-xs hover:border-accent/60" href={`/api/artifacts/${artifact.id}/download?format=md`}>
              .md
            </a>
            {hasTable && (
              <a className="rounded-lg border border-line-strong px-2.5 py-1 text-xs hover:border-accent/60" href={`/api/artifacts/${artifact.id}/download?format=csv`}>
                .csv
              </a>
            )}
            {status && <span role="status" className="text-xs text-success">{status}</span>}
            {error && <span role="alert" className="text-xs text-danger">{error}</span>}
          </div>
        </div>
      )}
    </article>
  );
}
