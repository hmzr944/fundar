"use client";

import { useRef, useState } from "react";
import { EmptyState, formatDate, Spinner } from "@/components/ui";
import { api } from "@/lib/client/api";
import type { DocumentDTO, MissionDetailDTO, RunDTO, SourceDTO } from "@/lib/client/types";

export function SourcesPanel({ sources, searchAvailable }: { sources: SourceDTO[]; searchAvailable: boolean }) {
  const pages = sources.filter((s) => s.origin === "page");
  const results = sources.filter((s) => s.origin === "search_result" && !pages.some((p) => p.url === s.url));
  if (!sources.length) {
    return (
      <EmptyState title="Aucune source consultée">
        {searchAvailable
          ? "Les pages et résultats de recherche utilisés par Atlas apparaîtront ici."
          : "La recherche web n'est pas configurée sur cette instance. Atlas ne peut consulter que les liens que vous fournissez."}
      </EmptyState>
    );
  }
  return (
    <div className="space-y-6">
      <SourceList title={`Pages lues (${pages.length})`} hint="Contenu effectivement récupéré et lu par Atlas." items={pages} />
      <SourceList
        title={`Résultats de recherche (${results.length})`}
        hint="Vus dans une liste de résultats : seul l'extrait a été consulté."
        items={results}
      />
    </div>
  );
}

function SourceList({ title, hint, items }: { title: string; hint: string; items: SourceDTO[] }) {
  if (!items.length) return null;
  return (
    <section>
      <h3 className="text-sm font-semibold text-muted">{title}</h3>
      <p className="mb-2 text-xs text-faint">{hint}</p>
      <ul className="space-y-2" data-testid="sources">
        {items.map((s) => (
          <li key={s.id} className="rounded-lg border border-line bg-elev/60 px-3 py-2.5">
            <a href={s.url} target="_blank" rel="noopener noreferrer nofollow" className="block truncate text-sm font-medium text-accent hover:underline">
              {s.title || s.url}
            </a>
            <p className="truncate text-xs text-faint">{s.url}</p>
            {s.excerpt && <p className="mt-1 line-clamp-2 text-xs text-muted">{s.excerpt}</p>}
            <p className="mt-1 text-[11px] text-faint">
              Consultée le {formatDate(s.retrievedAt)}
              {s.publishedAt ? ` · publiée : ${s.publishedAt}` : ""}
            </p>
          </li>
        ))}
      </ul>
    </section>
  );
}

const ACCEPT = ".pdf,.docx,.txt,.md,.csv";

export function DocumentsPanel({
  missionId,
  documents,
  locked,
  onChanged,
}: {
  missionId: string;
  documents: DocumentDTO[];
  locked: boolean;
  onChanged: () => void;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState<{ tone: "ok" | "error"; text: string } | null>(null);

  async function upload(files: FileList | null) {
    if (!files?.length) return;
    setBusy(true);
    setMessage(null);
    for (const file of Array.from(files)) {
      const body = new FormData();
      body.append("file", file);
      try {
        const res = await api<{ document: DocumentDTO }>(`/api/missions/${missionId}/documents`, { method: "POST", body });
        setMessage(
          res.document.status === "READY"
            ? { tone: "ok", text: `« ${res.document.name} » importé et lu.` }
            : { tone: "error", text: `« ${res.document.name} » : ${res.document.error}` },
        );
      } catch (e) {
        setMessage({ tone: "error", text: `« ${file.name} » : ${(e as Error).message}` });
      }
    }
    setBusy(false);
    if (input.current) input.current.value = "";
    onChanged();
  }

  async function remove(id: string) {
    if (!confirm("Supprimer définitivement ce document ?")) return;
    try {
      await api(`/api/documents/${id}`, { method: "DELETE" });
      onChanged();
    } catch (e) {
      setMessage({ tone: "error", text: (e as Error).message });
    }
  }

  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-dashed border-line-strong p-4">
        <p className="text-sm">Ajoutez des documents qu&apos;Atlas pourra lire : PDF (texte), DOCX, TXT, MD, CSV — 10 Mo max.</p>
        <p className="mt-1 text-xs text-faint">Les images et PDF scannés ne sont pas encore pris en charge (pas d&apos;OCR).</p>
        <div className="mt-3 flex items-center gap-3">
          <input
            ref={input}
            id="doc-upload"
            type="file"
            accept={ACCEPT}
            multiple
            className="sr-only"
            disabled={locked || busy}
            onChange={(e) => upload(e.target.files)}
          />
          <label
            htmlFor="doc-upload"
            className={`inline-flex cursor-pointer items-center gap-2 rounded-lg border border-line-strong bg-surface-2 px-3.5 py-2 text-sm hover:border-accent/60 ${locked || busy ? "pointer-events-none opacity-50" : ""}`}
          >
            {busy && <Spinner />} Importer un document
          </label>
          {locked && <span className="text-xs text-faint">Indisponible pendant qu&apos;Atlas travaille.</span>}
        </div>
        {message && (
          <p role={message.tone === "error" ? "alert" : "status"} className={`mt-3 text-sm ${message.tone === "error" ? "text-danger" : "text-success"}`}>
            {message.text}
          </p>
        )}
      </div>
      {documents.length === 0 ? (
        <EmptyState title="Aucun document" />
      ) : (
        <ul className="space-y-2" data-testid="documents">
          {documents.map((d) => (
            <li key={d.id} className="flex flex-wrap items-center gap-3 rounded-lg border border-line bg-elev/60 px-3 py-2.5">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{d.name}</p>
                <p className={`text-xs ${d.status === "FAILED" ? "text-danger" : "text-faint"}`}>
                  {d.status === "READY"
                    ? `${(d.sizeBytes / 1024).toFixed(0)} Ko · ${d.extractedChars?.toLocaleString("fr-FR")} caractères lisibles`
                    : d.status === "FAILED"
                      ? `Illisible : ${d.error}`
                      : "Lecture en cours…"}
                </p>
              </div>
              <a className="text-xs text-accent hover:underline" href={`/api/documents/${d.id}`}>
                Télécharger
              </a>
              {!locked && (
                <button className="text-xs text-danger hover:underline" onClick={() => remove(d.id)}>
                  Supprimer
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

const RUN_LABELS: Record<RunDTO["status"], string> = {
  RUNNING: "En cours",
  SUCCEEDED: "Terminée",
  STOPPED: "Arrêtée (limite)",
  FAILED: "Échec",
  CANCELLED: "Interrompue",
  INTERRUPTED: "Coupée",
};

export function JournalPanel({ runs, usage }: { runs: RunDTO[]; usage: MissionDetailDTO["usage"] }) {
  return (
    <div className="space-y-5">
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Appels au modèle", usage.llmCalls],
          ["Appels d'outils", usage.toolCalls],
          ["Tokens (entrée / sortie)", `${usage.inputTokens.toLocaleString("fr-FR")} / ${usage.outputTokens.toLocaleString("fr-FR")}`],
          [
            "Coût estimé",
            usage.estimatedCostUsd === null ? "non disponible" : `≈ ${usage.estimatedCostUsd.toFixed(usage.estimatedCostUsd < 0.1 ? 4 : 2)} $`,
          ],
        ].map(([k, v]) => (
          <div key={k as string} className="rounded-lg border border-line bg-elev/60 px-3 py-2">
            <dt className="text-[11px] text-faint">{k}</dt>
            <dd className="mt-0.5 text-sm font-medium">{v}</dd>
          </div>
        ))}
      </dl>
      <p className="text-xs text-faint">
        Le coût est une estimation calculée à partir des tokens déclarés par le fournisseur et de ses tarifs publics ; ce n&apos;est pas
        une facture. {usage.errors > 0 && `${usage.errors} appel(s) en erreur ou refusé(s).`}
      </p>
      {runs.length === 0 ? (
        <EmptyState title="Aucune exécution" />
      ) : (
        <ul className="space-y-2">
          {runs.map((r) => (
            <li key={r.id} className="rounded-lg border border-line bg-elev/60 px-3 py-2.5 text-sm">
              <div className="flex flex-wrap items-center gap-x-3 gap-y-1">
                <span className="font-medium">{r.kind === "analysis" ? "Analyse" : "Exécution"}</span>
                <span className="text-xs text-muted">{RUN_LABELS[r.status]}</span>
                <span className="text-xs text-faint">{formatDate(r.startedAt)}</span>
                {r.kind === "execution" && (
                  <span className="text-xs text-faint">
                    {r.iterations} échanges · {r.toolCalls} outils
                  </span>
                )}
              </div>
              {r.stopReason && <p className="mt-1 text-xs text-muted">{r.stopReason}</p>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
