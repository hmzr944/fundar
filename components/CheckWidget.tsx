"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

/** Widget compact de vérification, embarqué en tête des pages SEO programmatiques. */
export default function CheckWidget() {
  const router = useRouter();
  const [numeroVol, setNumeroVol] = useState("");
  const [dateVol, setDateVol] = useState("");

  function soumettre(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({ numeroVol, dateVol });
    router.push(`/check?${params.toString()}`);
  }

  return (
    <form
      onSubmit={soumettre}
      aria-label="Vérifier mon vol"
      className="carte mb-10 flex flex-col gap-3 p-5 sm:flex-row sm:items-end"
    >
      <div className="flex flex-1 flex-col gap-1.5">
        <label htmlFor="cw-numeroVol" className="etiquette">
          Numéro de vol
        </label>
        <input
          id="cw-numeroVol"
          className="champ"
          placeholder="FR1234"
          required
          value={numeroVol}
          onChange={(e) => setNumeroVol(e.target.value.toUpperCase())}
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <label htmlFor="cw-dateVol" className="etiquette">
          Date du vol
        </label>
        <input
          id="cw-dateVol"
          type="date"
          className="champ"
          required
          value={dateVol}
          onChange={(e) => setDateVol(e.target.value)}
        />
      </div>
      <button type="submit" className="bouton bouton-primaire">
        Vérifier
      </button>
    </form>
  );
}
