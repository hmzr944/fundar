"use client";

import { useState } from "react";
import { Button, cx, EmptyState, StepStatusText } from "@/components/ui";
import { api } from "@/lib/client/api";
import type { ArtifactDTO, StepDTO } from "@/lib/client/types";
import { STEP_KIND_LABELS } from "@/server/missions/status";

const dot: Record<StepDTO["status"], string> = {
  PENDING: "border-line-strong",
  IN_PROGRESS: "border-accent bg-accent/30 animate-atlas-pulse",
  DONE: "border-success bg-success",
  WAITING_USER: "border-warning bg-warning/30",
  BLOCKED: "border-danger bg-danger/30",
  FAILED: "border-danger bg-danger",
  SKIPPED: "border-line-strong bg-line-strong",
};

export function PlanPanel({
  missionId,
  steps,
  artifacts,
  locked,
  onChanged,
}: {
  missionId: string;
  steps: StepDTO[];
  artifacts: ArtifactDTO[];
  locked: boolean;
  onChanged: () => void;
}) {
  if (!steps.length) {
    return <EmptyState title="Pas encore de plan">Atlas établit le plan après avoir compris votre demande.</EmptyState>;
  }
  const done = steps.filter((s) => s.status === "DONE" || s.status === "SKIPPED").length;
  return (
    <div>
      <div className="mb-4 flex items-center gap-3">
        <div
          className="h-1.5 flex-1 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={steps.length}
          aria-valuenow={done}
          aria-label="Étapes closes"
        >
          <div className="h-full rounded-full bg-success transition-all" style={{ width: `${(done / steps.length) * 100}%` }} />
        </div>
        <span className="text-xs text-muted">
          {done}/{steps.length} étapes closes
        </span>
      </div>
      <ol className="space-y-3" data-testid="plan">
        {steps.map((s, i) => (
          <StepItem key={s.id} index={i} step={s} missionId={missionId} artifacts={artifacts} locked={locked} onChanged={onChanged} />
        ))}
      </ol>
    </div>
  );
}

function StepItem({
  step,
  index,
  missionId,
  artifacts,
  locked,
  onChanged,
}: {
  step: StepDTO;
  index: number;
  missionId: string;
  artifacts: ArtifactDTO[];
  locked: boolean;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [noteOpen, setNoteOpen] = useState(false);
  const [note, setNote] = useState("");
  const linked = artifacts.filter((a) => (step.evidence.artifactIds ?? []).includes(a.id) || a.stepId === step.id);
  const closed = step.status === "DONE" || step.status === "SKIPPED";

  async function update(status: "DONE" | "SKIPPED" | "PENDING", withNote?: string) {
    setBusy(true);
    setError(null);
    try {
      await api(`/api/missions/${missionId}/steps/${step.id}`, { method: "PATCH", json: { status, note: withNote || undefined } });
      setNoteOpen(false);
      setNote("");
      onChanged();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <li className="rounded-xl border border-line bg-elev/60 p-4" data-testid="step" data-step-status={step.status}>
      <div className="flex items-start gap-3">
        <span className={cx("mt-1 h-3 w-3 shrink-0 rounded-full border-2", dot[step.status])} aria-hidden />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <p className="font-medium">
              <span className="text-faint">{index + 1}.</span> {step.title}
            </p>
            <StepStatusText status={step.status} />
            <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-[11px] text-muted">{STEP_KIND_LABELS[step.kind]}</span>
            {step.completedBy === "user" && closed && (
              <span className="rounded-md border border-warning/40 px-1.5 py-0.5 text-[11px] text-warning" title="Action déclarée par vous, non exécutée par Atlas">
                Déclarée par vous
              </span>
            )}
            {step.completedBy === "atlas" && step.status === "DONE" && (
              <span className="rounded-md border border-success/40 px-1.5 py-0.5 text-[11px] text-success">Exécutée par Atlas</span>
            )}
          </div>
          {step.description && <p className="mt-1 text-sm text-muted">{step.description}</p>}
          {step.result && (
            <div className="mt-2 whitespace-pre-wrap rounded-lg bg-surface/80 px-3 py-2 text-sm">
              <span className="text-xs font-medium text-faint">Résultat · </span>
              {step.result}
            </div>
          )}
          {step.error && (
            <p className="mt-2 rounded-lg border border-danger/30 bg-danger/5 px-3 py-2 text-sm text-danger">
              <span className="font-medium">Problème : </span>
              {step.error}
            </p>
          )}
          {(linked.length > 0 || (step.evidence.sourceIds?.length ?? 0) > 0 || (step.evidence.documentIds?.length ?? 0) > 0) && (
            <p className="mt-2 text-xs text-faint">
              Preuves :{" "}
              {[
                linked.length ? `${linked.length} livrable(s)` : null,
                step.evidence.sourceIds?.length ? `${step.evidence.sourceIds.length} source(s)` : null,
                step.evidence.documentIds?.length ? `${step.evidence.documentIds.length} document(s) lu(s)` : null,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}

          {!locked && (
            <div className="mt-3 flex flex-wrap gap-2">
              {!closed && (
                <>
                  <Button className="px-2.5 py-1 text-xs" onClick={() => setNoteOpen((v) => !v)} disabled={busy}>
                    J&apos;ai fait cette étape
                  </Button>
                  <Button variant="ghost" className="px-2.5 py-1 text-xs" onClick={() => update("SKIPPED")} disabled={busy}>
                    Ignorer
                  </Button>
                </>
              )}
              {closed && (
                <Button variant="ghost" className="px-2.5 py-1 text-xs" onClick={() => update("PENDING")} disabled={busy}>
                  Rouvrir
                </Button>
              )}
            </div>
          )}
          {noteOpen && (
            <div className="mt-3 space-y-2">
              <label className="block text-xs text-muted" htmlFor={`note-${step.id}`}>
                Précision facultative (ce que vous avez fait, le résultat obtenu)
              </label>
              <textarea
                id={`note-${step.id}`}
                value={note}
                onChange={(e) => setNote(e.target.value)}
                rows={2}
                maxLength={2000}
                className="w-full rounded-lg border border-line bg-bg px-3 py-2 text-sm outline-none focus:border-accent"
              />
              <Button variant="primary" className="px-2.5 py-1 text-xs" onClick={() => update("DONE", note)} disabled={busy}>
                Confirmer
              </Button>
            </div>
          )}
          {error && <p role="alert" className="mt-2 text-sm text-danger">{error}</p>}
        </div>
      </div>
    </li>
  );
}
