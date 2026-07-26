"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function EnvoyerLettreButton({ claimId }: { claimId: string }) {
  const router = useRouter();
  const [envoi, setEnvoi] = useState(false);

  async function envoyer() {
    setEnvoi(true);
    await fetch(`/api/claim/${claimId}/lettre`, { method: "POST" });
    setEnvoi(false);
    router.refresh();
  }

  return (
    <button type="button" onClick={envoyer} disabled={envoi}>
      {envoi ? "Envoi..." : "Envoyer la lettre de réclamation"}
    </button>
  );
}
