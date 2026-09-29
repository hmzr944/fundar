"use client";

import { useEffect, useRef, useState } from "react";
import { Markdown } from "@/components/markdown";
import { Button, cx, formatDate, LOGO_PATH, Spinner } from "@/components/ui";
import { api } from "@/lib/client/api";
import type { MessageDTO } from "@/lib/client/types";

export function Conversation({
  missionId,
  messages,
  locked,
  llmAvailable,
  onSent,
}: {
  missionId: string;
  messages: MessageDTO[];
  locked: boolean;
  llmAvailable: boolean;
  onSent: () => void;
}) {
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const end = useRef<HTMLDivElement>(null);

  useEffect(() => {
    end.current?.scrollIntoView({ block: "nearest" });
  }, [messages.length]);

  async function send(e: React.FormEvent) {
    e.preventDefault();
    if (!value.trim()) return;
    setPending(true);
    setError(null);
    try {
      await api(`/api/missions/${missionId}/messages`, { method: "POST", json: { content: value } });
      setValue("");
      onSent();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex h-full flex-col">
      <div className="max-h-[60vh] flex-1 space-y-3 overflow-y-auto pr-1 lg:max-h-[calc(100dvh-16rem)]" data-testid="conversation">
        {messages.map((m) => (
          <MessageBubble key={m.id} m={m} />
        ))}
        {locked && <Typing />}
        <div ref={end} />
      </div>
      <form onSubmit={send} className="mt-4 pt-1">
        <label htmlFor="add-info" className="text-sm font-medium">
          Répondre ou ajouter une information
        </label>
        <textarea
          id="add-info"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          rows={3}
          maxLength={8000}
          disabled={locked}
          placeholder={locked ? "Atlas travaille… vous pourrez répondre ensuite." : "Ex. : la réponse de l'entreprise, une date, un montant, l'adresse e-mail du service client."}
          className="glass mt-2 w-full resize-y rounded-2xl px-4 py-3 text-sm outline-none transition-shadow placeholder:text-faint focus:shadow-[0_0_0_3px_color-mix(in_srgb,var(--accent)_22%,transparent)] disabled:opacity-60"
        />
        {error && (
          <p role="alert" className="mt-1 text-sm text-danger">
            {error}
          </p>
        )}
        <div className="mt-2 flex items-center justify-between gap-2">
          <p className="text-xs text-faint">{llmAvailable ? "Atlas mettra à jour l'analyse et le plan." : "Analyse automatique indisponible."}</p>
          <Button type="submit" variant="primary" disabled={locked || pending || !value.trim()}>
            {pending && <Spinner />} Envoyer
          </Button>
        </div>
      </form>
    </div>
  );
}

function AtlasMark() {
  return (
    <span className="glass-ink flex h-7 w-7 shrink-0 items-center justify-center rounded-full" aria-hidden>
      <svg viewBox="0 0 48 34" className="h-3 w-4" fill="none">
        <path d={LOGO_PATH} stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </span>
  );
}

function Typing() {
  return (
    <div className="msg-in flex items-end gap-2" role="status">
      <AtlasMark />
      <div className="glass flex items-center gap-1.5 rounded-2xl rounded-bl-md px-4 py-3">
        <span className="sr-only">Atlas travaille</span>
        {[0, 1, 2].map((i) => (
          <span key={i} className="h-1.5 w-1.5 rounded-full bg-sky animate-atlas-pulse" style={{ animationDelay: `${i * 180}ms` }} aria-hidden />
        ))}
      </div>
    </div>
  );
}

function MessageBubble({ m }: { m: MessageDTO }) {
  if (m.role === "event") {
    return (
      <div className="msg-in rounded-xl border border-line/70 px-3 py-2 text-xs text-muted" data-kind={String(m.metadata.kind ?? "")}>
        <div className="whitespace-pre-wrap">
          <Markdown>{m.content}</Markdown>
        </div>
        <p className="mt-1 text-xs text-faint">{formatDate(m.createdAt)}</p>
      </div>
    );
  }
  const mine = m.role === "user";
  return (
    <div className={cx("msg-in flex items-end gap-2", mine ? "justify-end" : "justify-start")}>
      {!mine && <AtlasMark />}
      <div
        className={cx(
          "max-w-[88%] rounded-2xl px-4 py-3 text-sm",
          mine ? "glass-ink rounded-br-md" : "glass rounded-bl-md",
        )}
      >
        <p className={cx("mb-1 text-xs font-medium", mine ? "opacity-75" : "text-faint")}>
          {mine ? "Vous" : "Atlas"} · {formatDate(m.createdAt)}
        </p>
        {mine ? <p className="whitespace-pre-wrap">{m.content}</p> : <Markdown>{m.content}</Markdown>}
      </div>
    </div>
  );
}
