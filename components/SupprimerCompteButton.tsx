"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SupprimerCompteButton() {
  const router = useRouter();
  const [confirmation, setConfirmation] = useState(false);
  const [envoi, setEnvoi] = useState(false);

  if (!confirmation) {
    return (
      <button type="button" onClick={() => setConfirmation(true)}>
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
    <div>
      <p>
        Cette action supprime définitivement votre compte et tous vos
        dossiers. Confirmer ?
      </p>
      <button type="button" onClick={supprimer} disabled={envoi}>
        {envoi ? "Suppression..." : "Confirmer la suppression"}
      </button>
      <button type="button" onClick={() => setConfirmation(false)}>
        Annuler
      </button>
    </div>
  );
}
