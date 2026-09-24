"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Spinner } from "@/components/ui";
import { api } from "@/lib/client/api";

const suggestions = [
  "Analyse ce DCE : synthèse du marché, critères et pondération, dates limites, pièces à fournir, points de vigilance et questions à poser à l'acheteur. Dis-moi si nous devons y répondre.",
  "À partir de ce DCE, prépare la liste de contrôle des pièces administratives et de l'offre à déposer, avec pour chacune le document et l'article qui l'exigent.",
  "Rédige le mémoire technique de ce marché en suivant le plan et les critères imposés par le règlement de consultation, à partir des informations de notre entreprise.",
  "Relis notre dossier de réponse et vérifie qu'il est complet et conforme au règlement de consultation avant le dépôt.",
];

export function MissionComposer({ disabled }: { disabled?: boolean }) {
  const router = useRouter();
  const [value, setValue] = useState("");
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e?: React.FormEvent) {
    e?.preventDefault();
    if (value.trim().length < 5) {
      setError("Décrivez votre mission en quelques mots au moins.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      const res = await api<{ mission: { id: string } }>("/api/missions", { method: "POST", json: { request: value } });
      router.push(`/app/missions/${res.mission.id}`);
    } catch (err) {
      setError((err as Error).message);
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="rounded-2xl border border-line-strong bg-surface p-4 shadow-[0_0_0_1px_rgba(110,168,255,0.04)] sm:p-5">
      <label htmlFor="mission-request" className="text-lg font-semibold">
        Que voulez-vous accomplir ?
      </label>
      <textarea
        id="mission-request"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === "Enter" && (e.metaKey || e.ctrlKey)) void submit();
        }}
        rows={4}
        maxLength={8000}
        placeholder="Décrivez librement votre objectif, vos contraintes (dates, budget, lieux…) et ce que vous attendez."
        className="mt-3 w-full resize-y rounded-xl border border-line bg-elev px-4 py-3 text-[0.95rem] outline-none placeholder:text-faint focus:border-accent"
      />
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-faint">Vous pourrez ajouter des documents et des précisions ensuite. Ctrl/⌘ + Entrée pour envoyer.</p>
        <Button type="submit" variant="primary" disabled={pending || disabled}>
          {pending && <Spinner />} Créer la mission
        </Button>
      </div>
      <div className="mt-4 flex flex-wrap gap-2">
        {suggestions.map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setValue(s)}
            className="max-w-full truncate rounded-full border border-line px-3 py-1 text-xs text-muted transition-colors hover:border-accent/50 hover:text-fg"
            title={s}
          >
            {s.length > 60 ? `${s.slice(0, 58)}…` : s}
          </button>
        ))}
      </div>
    </form>
  );
}
