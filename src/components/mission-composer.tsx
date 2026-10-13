"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Spinner } from "@/components/ui";
import { api } from "@/lib/client/api";

const suggestions = [
  "Chantier réceptionné il y a plus d'un an : le promoteur ne m'a toujours pas rendu ma retenue de garantie de 5 %.",
  "Je suis sous-traitant en électricité, l'entreprise générale ne règle pas ma dernière situation de 12 600 €.",
  "La mairie a payé ma facture de travaux avec deux mois de retard, sans intérêts de retard.",
  "Un client professionnel ne paie pas ma facture de plomberie échue depuis 45 jours.",
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
    <form onSubmit={submit} className="glass tile-in rounded-3xl p-5 sm:p-6">
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
        placeholder="Décrivez simplement : le chantier, le client, les montants et les dates (réception, facture, échéance), et ce que vous avez déjà tenté."
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
