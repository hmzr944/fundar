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
    <form onSubmit={soumettre} aria-label="Vérifier mon vol">
      <input
        placeholder="Numéro de vol (ex: FR1234)"
        required
        value={numeroVol}
        onChange={(e) => setNumeroVol(e.target.value.toUpperCase())}
      />
      <input
        type="date"
        required
        value={dateVol}
        onChange={(e) => setDateVol(e.target.value)}
      />
      <button type="submit">Vérifier mon indemnisation</button>
    </form>
  );
}
