"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import Icone from "@/components/Icone";

/**
 * Déclaration d'un envoi fait à la main.
 *
 * Le lien vers le formulaire de la compagnie est affiché à côté du bouton,
 * et non ailleurs : la personne qui déclare l'envoi est celle qui vient de
 * le faire, et lui faire chercher l'URL dans un fichier de configuration
 * garantit qu'elle finira par déclarer sans avoir envoyé.
 *
 * La date est pré-remplie à aujourd'hui parce que c'est le cas courant,
 * mais reste modifiable : on rattrape souvent des dossiers envoyés la
 * veille, et une date fausse décale tout le calendrier des relances.
 */
export default function SaisieEnvoiManuel({
  claimId,
  urlFormulaire,
  note,
}: {
  claimId: string;
  urlFormulaire?: string | null;
  note?: string | null;
}) {
  const router = useRouter();
  const id = useId();
  const [ouvert, setOuvert] = useState(false);
  const [envoyeLe, setEnvoyeLe] = useState(
    () => new Date().toISOString().slice(0, 10)
  );
  const [referenceExterne, setReferenceExterne] = useState("");
  const [enCours, setEnCours] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    setEnCours(true);
    setErreur(null);

    const res = await fetch("/api/admin/envoi-manuel", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ claimId, envoyeLe, referenceExterne }),
    });
    const data = await res.json();
    setEnCours(false);

    if (!res.ok) {
      setErreur(data.erreur ?? "Enregistrement refusé.");
      return;
    }

    setOuvert(false);
    router.refresh();
  }

  return (
    <div className="mt-3">
      <div className="flex flex-wrap items-center gap-2">
        {urlFormulaire && (
          <a
            href={urlFormulaire}
            target="_blank"
            rel="noopener noreferrer"
            className="bouton bouton-secondaire !py-2 !px-4 text-sm"
          >
            Ouvrir le formulaire
            <Icone nom="partage" taille={15} />
          </a>
        )}
        <button
          type="button"
          onClick={() => setOuvert(!ouvert)}
          className="bouton bouton-primaire !py-2 !px-4 text-sm"
        >
          {ouvert ? "Annuler" : "J'ai envoyé la réclamation"}
        </button>
      </div>

      {note && (
        <p className="mt-2 max-w-[70ch] text-[13px] leading-relaxed text-[var(--texte-attenue)]">
          {note}
        </p>
      )}

      {ouvert && (
        <form onSubmit={enregistrer} className="mt-3 flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label htmlFor={`${id}-date`} className="etiquette">
              Envoyée le
            </label>
            <input
              id={`${id}-date`}
              type="date"
              required
              className="champ !py-2"
              value={envoyeLe}
              onChange={(e) => setEnvoyeLe(e.target.value)}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label htmlFor={`${id}-ref`} className="etiquette">
              Référence compagnie (facultatif)
            </label>
            <input
              id={`${id}-ref`}
              type="text"
              placeholder="ex. CLM-482913"
              className="champ !py-2"
              value={referenceExterne}
              onChange={(e) => setReferenceExterne(e.target.value)}
            />
          </div>
          <button
            type="submit"
            disabled={enCours}
            className="bouton bouton-primaire !py-2 !px-4 text-sm"
          >
            {enCours ? "Enregistrement..." : "Confirmer l'envoi"}
          </button>
        </form>
      )}

      {erreur && (
        <p className="mt-2 max-w-[70ch] text-sm leading-relaxed text-[var(--color-accent-600)]">
          {erreur}
        </p>
      )}
    </div>
  );
}
