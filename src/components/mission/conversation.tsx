"use client";

import { useEffect, useRef, useState } from "react";
import { Markdown } from "@/components/markdown";
import { Button, cx, formatDate, Spinner } from "@/components/ui";
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
        <div ref={end} />
      </div>
      <form onSubmit={send} className="mt-4 border-t border-line pt-4">
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
          placeholder={locked ? "Atlas travaille… vous pourrez répondre ensuite." : "Ex. : départ de Lyon, arrivée à Nantes, budget 1 500 €."}
          className="mt-2 w-full resize-y rounded-lg border border-line bg-elev px-3 py-2 text-sm outline-none placeholder:text-faint focus:border-accent disabled:opacity-60"
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

function MessageBubble({ m }: { m: MessageDTO }) {
  if (m.role === "event") {
    return (
      <div className="rounded-lg border border-line bg-surface/50 px-3 py-2 text-xs text-muted" data-kind={String(m.metadata.kind ?? "")}>
        <div className="whitespace-pre-wrap">
          <Markdown>{m.content}</Markdown>
        </div>
        <p className="mt-1 text-[10px] text-faint">{formatDate(m.createdAt)}</p>
      </div>
    );
  }
  const mine = m.role === "user";
  return (
    <div className={cx("flex", mine ? "justify-end" : "justify-start")}>
      <div
        className={cx(
          "max-w-[92%] rounded-2xl px-4 py-3 text-sm",
          mine ? "rounded-br-sm bg-accent/15 text-fg" : "rounded-bl-sm border border-line bg-elev",
        )}
      >
        <p className="mb-1 text-[11px] font-medium text-faint">
          {mine ? "Vous" : "Atlas"} · {formatDate(m.createdAt)}
        </p>
        {mine ? <p className="whitespace-pre-wrap">{m.content}</p> : <Markdown>{m.content}</Markdown>}
      </div>
    </div>
  );
}
