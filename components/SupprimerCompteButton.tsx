"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SupprimerCompteButton() {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState(false);
  const [envoi, setEnvoi] = useState(false);

  if (!confirmation) {
    return (
      <button
        type="button"
        className="bouton bouton-fantome text-sm !px-0"
        onClick={() => setConfirmation(true)}
      >
        Supprimer mon compte
      </button>
    );
  }

  async function supprimer() {
    setEnvoi(true);
    const res = await fetch("/api/compte/supprimer", { method: "POST" });
    if (res.ok) {
      router.push("/");
    }
    setEnvoi(false);
  }

  return (
    <div className="flex flex-col gap-3 text-sm">
      <p className="text-[var(--texte-attenue)]">
        Cette action supprime définitivement votre compte et tous vos
        dossiers. Confirmer ?
      </p>
      <div className="flex gap-3">
        <button
          type="button"
          className="bouton bouton-secondaire text-sm"
          onClick={() => setConfirmation(false)}
        >
          Annuler
        </button>
        <button
          type="button"
          className="bouton text-sm"
          style={{ background: "var(--color-attente-600)", color: "white" }}
          onClick={supprimer}
          disabled={envoi}
        >
          {envoi ? "Suppression..." : "Confirmer la suppression"}
        </button>
      </div>
    </div>
  );
}
