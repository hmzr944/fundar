"use client";

import { useState } from "react";
import { Button, Spinner } from "@/components/ui";
import { api, ApiError } from "@/lib/client/api";

const input =
  "w-full rounded-lg border border-line-strong bg-elev px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-faint focus:border-accent";

export function ContactForm({ topics, defaultEmail, fallbackEmail }: { topics: Record<string, string>; defaultEmail?: string; fallbackEmail: string | null }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<{ message: string; offerMail: boolean } | null>(null);
  const [length, setLength] = useState(0);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(e.currentTarget));
    setState("sending");
    setError(null);
    try {
      await api("/api/contact", { method: "POST", json: data });
      setState("sent");
    } catch (err) {
      const status = err instanceof ApiError ? err.status : 0;
      setError({ message: (err as Error).message, offerMail: status >= 500 || status === 0 });
      setState("idle");
    }
  }

  if (state === "sent") {
    return (
      <div role="status" className="msg-in py-6">
        <h2 className="font-display text-3xl font-bold">Message envoyé</h2>
        <p className="mt-3 max-w-md text-muted">Merci. Nous vous répondons par e-mail, en général sous deux jours ouvrés.</p>
        <Button className="mt-6" onClick={() => setState("idle")}>
          Écrire un autre message
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5" noValidate>
      <div className="grid gap-5 sm:grid-cols-2">
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">
            Nom <span className="font-normal text-faint">(facultatif)</span>
          </span>
          <input name="name" autoComplete="name" maxLength={120} className={input} />
        </label>
        <label className="block">
          <span className="mb-1.5 block text-sm font-medium">Adresse e-mail</span>
          <input name="email" type="email" autoComplete="email" required defaultValue={defaultEmail} className={input} />
        </label>
      </div>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium">Sujet</span>
        <select name="topic" defaultValue="question" className={input}>
          {Object.entries(topics).map(([k, v]) => (
            <option key={k} value={k}>
              {v}
            </option>
          ))}
        </select>
      </label>
      <label className="block">
        <span className="mb-1.5 flex items-baseline justify-between text-sm font-medium">
          Message
          <span className="text-xs font-normal text-faint tabular-nums" aria-hidden>
            {length} / 4000
          </span>
        </span>
        <textarea name="message" required minLength={10} maxLength={4000} rows={7} onChange={(e) => setLength(e.target.value.length)} className={`${input} resize-y`} />
        <span className="mt-1 block text-xs text-faint">Pour un dossier, indiquez son titre. Ne joignez ni mot de passe ni code bancaire.</span>
      </label>
      {/* Honeypot, invisible to people and to assistive tech. */}
      <div aria-hidden className="absolute -left-[9999px] h-px w-px overflow-hidden">
        <label>
          Site web
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>
      {error && (
        <p role="alert" className="msg-in rounded-lg border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger">
          {error.message}
          {error.offerMail && fallbackEmail && (
            <>
              {" "}
              <a href={`mailto:${fallbackEmail}`} className="font-medium underline">
                {fallbackEmail}
              </a>
            </>
          )}
        </p>
      )}
      <Button type="submit" variant="primary" className="px-6 py-2.5" disabled={state === "sending"}>
        {state === "sending" && <Spinner />} Envoyer le message
      </Button>
    </form>
  );
}
