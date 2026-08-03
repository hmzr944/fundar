"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";

const NATURES = [
  { valeur: "ACCUSE_RECEPTION", libelle: "Accusé de réception" },
  { valeur: "DEMANDE_INFO", libelle: "Demande d'information" },
  { valeur: "REFUS", libelle: "Refus" },
  { valeur: "BON_ACHAT", libelle: "Bon d'achat proposé" },
  { valeur: "PAIEMENT_ANNONCE", libelle: "Paiement annoncé" },
] as const;

/**
 * Saisie d'une réponse de compagnie.
 *
 * Deux champs seulement sont obligatoires (date et nature) : ces données ne
 * valent que si elles sont réellement saisies, et un formulaire long ne
 * l'est jamais. Le motif invoqué reste libre et non normalisé — c'est en le
 * relisant qu'on décidera plus tard quelles catégories méritent d'exister.
 */
export default function SaisieReponse({ claimId }: { claimId: string }) {
  const router = useRouter();
  const id = useId();
  const [ouvert, setOuvert] = useState(false);
  const [recueLe, setRecueLe] = useState("");
  const [nature, setNature] = useState<string>("REFUS");
  const [motifInvoque, setMotifInvoque] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setEnCours(true);
    setErreur(null);

    const res = await fetch("/api/admin/reponse", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claimId, recueLe, nature, motifInvoque }),
    });
    const data = await res.json();
    setEnCours(false);

    if (!res.ok) {
      setErreur(data.erreur ?? "Enregistrement refusé.");
      return;
    }

    setOuvert(false);
    setMotifInvoque("");
    router.refresh();
  }

  if (!ouvert) {
    return (
      <button
        type="button"
        onClick={() => setOuvert(true)}
        className="bouton bouton-secondaire !py-2 !px-3 text-sm"
      >
        Noter une réponse
      </button>
    );
  }

  return (
    <form onSubmit={enregistrer} className="mt-3 flex flex-col gap-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-date`} className="etiquette">
            Date de la réponse
          </label>
          <input
            id={`${id}-date`}
            type="date"
            required
            className="champ"
            value={recueLe}
            onChange={(e) => setRecueLe(e.target.value)}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-nature`} className="etiquette">
            Nature
          </label>
          <select
            id={`${id}-nature`}
            className="champ"
            value={nature}
            onChange={(e) => setNature(e.target.value)}
          >
            {NATURES.map((n) => (
              <option key={n.valeur} value={n.valeur}>
                {n.libelle}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor={`${id}-motif`} className="etiquette">
          Motif invoqué par la compagnie (recopié tel quel)
        </label>
        <input
          id={`${id}-motif`}
          className="champ"
          placeholder="circonstance extraordinaire : conditions météo"
          value={motifInvoque}
          onChange={(e) => setMotifInvoque(e.target.value)}
        />
      </div>

      {erreur && (
        <p className="text-sm text-[var(--color-accent-600)]">{erreur}</p>
      )}

      <div className="flex gap-2">
        <button
          type="submit"
          disabled={enCours}
          className="bouton bouton-primaire !py-2 !px-4 text-sm"
        >
          {enCours ? "Enregistrement..." : "Enregistrer"}
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
