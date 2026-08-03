"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Le client signale qu'il a été indemnisé.
 *
 * C'est le point le plus fragile du modèle mandat : on demande à quelqu'un
 * qui vient de recevoir son argent de déclarer spontanément une somme qui
 * déclenchera une facture. La formulation compte donc autant que le code —
 * on rappelle que la commission n'était due qu'en cas de succès, ce qu'il a
 * accepté en signant, plutôt que de présenter la déclaration comme une
 * formalité anodine.
 */
export default function DeclarerPaiementButton({
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
  const [recuLe, setRecuLe] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function declarer(e: React.FormEvent) {
    e.preventDefault();
    setEnCours(true);
    setErreur(null);

    const res = await fetch(`/api/claim/${claimId}/paiement-recu`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ montant: Number(montant), recuLe: recuLe || undefined }),
    });
    const data = await res.json();
    setEnCours(false);

    if (!res.ok) {
      setErreur(data.erreur ?? "Enregistrement impossible.");
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
        J&apos;ai reçu mon indemnisation
      </button>
    );
  }

  return (
    <form onSubmit={declarer} className="mt-4 w-full border-t border-[var(--bordure)] pt-4">
      <p className="text-[15px] font-semibold">Vous avez été indemnisé ?</p>
      <p className="mt-1 text-sm leading-relaxed text-[var(--texte-attenue)]">
        La compagnie vire directement sur votre compte, sans nous prévenir :
        c&apos;est vous qui nous l&apos;apprenez. Notre commission de 22 %
        devient alors due, comme prévu au mandat.
      </p>

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-montant`} className="etiquette">
            Montant reçu ({devise})
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
          <label htmlFor={`${id}-date`} className="etiquette">
            Reçu le
          </label>
          <input
            id={`${id}-date`}
            type="date"
            className="champ"
            value={recuLe}
            onChange={(e) => setRecuLe(e.target.value)}
          />
        </div>
      </div>

      {erreur && (
        <p className="mt-3 text-sm text-[var(--color-accent-600)]">{erreur}</p>
      )}

      <div className="mt-4 flex gap-2">
        <button
          type="submit"
          disabled={enCours}
          className="bouton bouton-primaire !py-2 !px-4 text-sm"
        >
          {enCours ? "Enregistrement..." : "Confirmer"}
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
  );
}
