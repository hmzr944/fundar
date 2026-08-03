"use client";

import { useId, useState } from "react";
import type { TypePerturbation } from "@/lib/eligibility/types";

export interface DonneesDeclaration {
  aeroportDepart: string;
  aeroportArrivee: string;
  typePerturbation: TypePerturbation;
  retardArriveeMinutes?: number;
}

const PERTURBATIONS: { valeur: TypePerturbation; libelle: string }[] = [
  { valeur: "RETARD", libelle: "Le vol est arrivé en retard" },
  { valeur: "ANNULATION", libelle: "Le vol a été annulé" },
  { valeur: "REFUS_EMBARQUEMENT", libelle: "On m'a refusé l'embarquement" },
];

/**
 * Repli déclaratif quand le fournisseur ne connaît pas le vol.
 *
 * On demande le retard **à l'arrivée**, pas au départ : c'est la seule
 * donnée qui compte pour le règlement, et c'est l'erreur que font la
 * plupart des passagers. La formulation le rappelle à chaque fois.
 */
export default function DeclarationVol({
  message,
  onSoumettre,
  enCours,
}: {
  message: string;
  onSoumettre: (donnees: DonneesDeclaration) => void;
  enCours: boolean;
}) {
  const id = useId();
  const [aeroportDepart, setAeroportDepart] = useState("");
  const [aeroportArrivee, setAeroportArrivee] = useState("");
  const [typePerturbation, setTypePerturbation] =
    useState<TypePerturbation>("RETARD");
  const [heuresRetard, setHeuresRetard] = useState("");

  function soumettre(e: React.FormEvent) {
    e.preventDefault();
    onSoumettre({
      aeroportDepart,
      aeroportArrivee,
      typePerturbation,
      retardArriveeMinutes:
        typePerturbation === "RETARD" && heuresRetard
          ? Math.round(Number(heuresRetard) * 60)
          : undefined,
    });
  }

  return (
    <div className="carte entree-fade mt-6 p-6">
      <p className="text-[15px] leading-relaxed text-[var(--texte-attenue)]">
        {message}
      </p>

      <form onSubmit={soumettre} className="mt-5 flex flex-col gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${id}-dep`} className="etiquette">
              Aéroport de départ
            </label>
            <input
              id={`${id}-dep`}
              className="champ"
              required
              maxLength={3}
              placeholder="CDG"
              value={aeroportDepart}
              onChange={(e) => setAeroportDepart(e.target.value.toUpperCase())}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${id}-arr`} className="etiquette">
              Aéroport d&apos;arrivée
            </label>
            <input
              id={`${id}-arr`}
              className="champ"
              required
              maxLength={3}
              placeholder="LIS"
              value={aeroportArrivee}
              onChange={(e) => setAeroportArrivee(e.target.value.toUpperCase())}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor={`${id}-type`} className="etiquette">
            Que s&apos;est-il passé ?
          </label>
          <select
            id={`${id}-type`}
            className="champ"
            value={typePerturbation}
            onChange={(e) =>
              setTypePerturbation(e.target.value as TypePerturbation)
            }
          >
            {PERTURBATIONS.map((p) => (
              <option key={p.valeur} value={p.valeur}>
                {p.libelle}
              </option>
            ))}
          </select>
        </div>

        {typePerturbation === "RETARD" && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor={`${id}-retard`} className="etiquette">
              Retard à l&apos;arrivée, en heures
            </label>
            <input
              id={`${id}-retard`}
              type="number"
              step="0.5"
              min="0"
              required
              className="champ"
              placeholder="3.5"
              value={heuresRetard}
              onChange={(e) => setHeuresRetard(e.target.value)}
            />
            <p className="text-[13px] text-[var(--texte-attenue)]">
              Bien le retard à l&apos;arrivée à destination, pas le retard au
              décollage. C&apos;est ce que retient le règlement.
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={enCours}
          className="bouton bouton-primaire mt-1"
        >
          {enCours ? "Estimation..." : "Estimer mon dossier"}
        </button>
      </form>
    </div>
  );
}
