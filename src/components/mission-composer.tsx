"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Spinner } from "@/components/ui";
import { api } from "@/lib/client/api";

const suggestions = [
  "Mon colis est indiqué livré mais je ne l'ai jamais reçu, et le vendeur refuse de me rembourser.",
  "Mon opérateur m'a facturé des frais de résiliation que je pense injustifiés.",
  "Mon ancien propriétaire ne m'a toujours pas rendu ma caution, plus de deux mois après l'état des lieux.",
  "Mon vol a été annulé et la compagnie m'impose un avoir au lieu d'un remboursement.",
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
        Quel problème voulez-vous régler ?
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
        placeholder="Racontez simplement : avec quelle entreprise, ce qui s'est passé, les dates et montants, ce que vous avez déjà tenté, et ce que vous voulez obtenir."
        className="mt-3 w-full resize-y rounded-xl border border-line bg-elev px-4 py-3 text-[0.95rem] outline-none placeholder:text-faint focus:border-accent"
      />
      {error && (
        <p role="alert" className="mt-2 text-sm text-danger">
          {error}
        </p>
      )}
      <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
        <p className="text-xs text-faint">
          Analyse gratuite : Atlas vous dit s&apos;il peut s&apos;occuper de votre dossier. Vous pourrez ajouter vos documents (factures,
          e-mails, contrat) ensuite.
        </p>
        <Button type="submit" variant="primary" disabled={pending || disabled}>
          {pending && <Spinner />} Analyser gratuitement
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
