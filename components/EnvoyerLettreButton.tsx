"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface Reponse {
  statut?: string;
  explication?: string;
  urlFormulaire?: string | null;
  adressePostale?: string | null;
}

/**
 * Déclenche l'envoi de la réclamation à la compagnie et affiche honnêtement
 * le résultat. Un échec n'est jamais silencieux : si l'envoi automatique est
 * impossible, on le dit et on indique la marche à suivre plutôt que de
 * laisser croire que la réclamation est partie.
 */
export default function EnvoyerLettreButton({ claimId }: { claimId: string }) {
  const router = useRouter();
  const [envoi, setEnvoi] = useState(false);
  const [resultat, setResultat] = useState<Reponse | null>(null);

  async function envoyer() {
    setEnvoi(true);
    setResultat(null);
    try {
      const res = await fetch(`/api/claim/${claimId}/lettre`, { method: "POST" });
      const data: Reponse = await res.json();
      setResultat(data);
      if (res.ok) router.refresh();
    } catch {
      setResultat({
        statut: "ECHEC_RESEAU",
        explication: "Requête impossible. Rien n'a été envoyé à la compagnie.",
      });
    } finally {
      setEnvoi(false);
    }
  }

  const succes = resultat?.statut === "RECLAMATION_ENVOYEE";

  return (
    <div className="flex flex-col items-end gap-2">
      <button
        type="button"
        className="bouton bouton-secondaire text-sm"
        onClick={envoyer}
        disabled={envoi || succes}
      >
        {envoi ? "Transmission..." : "Transmettre à la compagnie"}
      </button>

      {resultat && !succes && (
        <div className="max-w-[34rem] rounded-[var(--radius-champ)] bg-[var(--color-attente-50)] p-3 text-left text-sm text-[var(--color-attente-600)]">
          <p>{resultat.explication ?? "L'envoi n'a pas abouti."}</p>
          {resultat.urlFormulaire && (
            <p className="mt-1.5">
              Formulaire à utiliser :{" "}
              <a href={resultat.urlFormulaire} target="_blank" rel="noreferrer" className="underline">
                {resultat.urlFormulaire}
              </a>
            </p>
          )}
          {resultat.adressePostale && (
            <p className="mt-1.5">Adresse postale : {resultat.adressePostale}</p>
          )}
        </div>
      )}

      {succes && (
        <p className="text-sm text-[var(--color-succes-600)]">
          Réclamation transmise à la compagnie.
        </p>
      )}
    </div>
  );
}
