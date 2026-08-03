"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Clôture d'un dossier : montant réellement reçu, ou refus définitif.
 *
 * Le montant demandé est celui qui a été VERSÉ, pas celui qui était estimé.
 * L'écart entre les deux est une donnée à part entière : c'est lui qui dira
 * si nos estimations sont honnêtes.
 */
export default function SaisieIssue({
  claimId,
  devise,
}: {
  claimId: string;
  devise: string;
}) {
  const router = useRouter();
  const id = useId();
  const [ouvert, setOuvert] = useState(false);
  const [montant, setMontant] = useState("");
  const [recupereLe, setRecupereLe] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function envoyer(corps: Record<string, unknown>) {
    setEnCours(true);
    setErreur(null);
    const res = await fetch("/api/admin/dossier", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claimId, ...corps }),
    });
    const data = await res.json();
    setEnCours(false);
    if (!res.ok) {
      setErreur(data.erreur ?? "Mise à jour refusée.");
      return;
    }
    setOuvert(false);
    router.refresh();
  }

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="bouton bouton-secondaire !py-2 !px-3 text-sm"
      >
        Clôturer
      </button>
    );
  }

  return (
    <div className="mt-3 flex flex-col gap-3">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          envoyer({
            statut: "PAYE",
            montantRecupere: Number(montant),
            deviseRecuperee: devise,
            recupereLe,
          });
        }}
        className="flex flex-col gap-3"
      >
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${id}-montant`} className="etiquette">
              Montant réellement versé ({devise})
            </label>
            <input
              id={`${id}-montant`}
              type="number"
              step="0.01"
              min="0"
              required
              className="champ"
              value={montant}
              onChange={(e) => setMontant(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${id}-recu`} className="etiquette">
              Reçu le
            </label>
            <input
              id={`${id}-recu`}
              type="date"
              required
              className="champ"
              value={recupereLe}
              onChange={(e) => setRecupereLe(e.target.value)}
            />
          </div>
        </div>

        {erreur && (
          <p className="text-sm text-[var(--color-accent-600)]">{erreur}</p>
        )}

        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={enCours}
            className="bouton bouton-primaire !py-2 !px-4 text-sm"
          >
            {enCours ? "..." : "Marquer payé"}
          </button>
          <button
            type="button"
            disabled={enCours}
            onClick={() => envoyer({ statut: "REFUSE" })}
            className="bouton bouton-secondaire !py-2 !px-3 text-sm"
          >
            Refus définitif
          </button>
          <button
            type="button"
            onClick={() => setOuvert(false)}
            className="bouton bouton-fantome !py-2 !px-3 text-sm"
          >
            Annuler
          </button>
        </div>
      </form>
    </div>
  );
}
