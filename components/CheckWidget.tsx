"use client";

import { useId, useState } from "react";
import { useRouter } from "next/navigation";
import Icone from "./Icone";

/** Un vol futur ne peut pas avoir été retardé : le sélecteur ne doit pas
 * le proposer, plutôt que de laisser le serveur refuser après coup. */
const AUJOURDHUI = new Date().toISOString().slice(0, 10);


/**
 * Widget de vérification. Placé directement dans le hero (référence Wise /
 * Airbnb) : l'utilisateur peut agir dans la seconde, sans clic intermédiaire
 * vers une autre page.
 */
export default function CheckWidget({
  taille = "hero",
  numeroVolInitial = "",
}: {
  taille?: "hero" | "compact";
  numeroVolInitial?: string;
}) {
  const router = useRouter();
  // La page d'accueil affiche deux widgets : les identifiants doivent être
  // uniques, sinon les <label> pointent tous vers le premier champ.
  const idBase = useId();
  const idVol = `${idBase}-vol`;
  const idDate = `${idBase}-date`;
  const [numeroVol, setNumeroVol] = useState(numeroVolInitial);
  const [dateVol, setDateVol] = useState("");

  function soumettre(e: React.FormEvent) {
    e.preventDefault();
    const params = new URLSearchParams({ numeroVol, dateVol, auto: "1" });
    router.push(`/check?${params.toString()}`);
  }

  const estHero = taille === "hero";

  return (
    <form
      onSubmit={soumettre}
      aria-label="Vérifier mon vol"
      /* action/method + name sur les champs : si le JS n'est pas encore
         hydraté (ou désactivé), l'envoi natif atterrit quand même sur
         /check avec les bons paramètres au lieu de recharger la page. */
      action="/check"
      method="get"
      className={`${estHero ? "carte-forte" : "carte"} flex flex-col gap-3 p-4 sm:flex-row sm:items-end sm:gap-3 sm:p-5`}
    >
      <input type="hidden" name="auto" value="1" />
      <div className="flex flex-1 flex-col gap-1.5">
        <label htmlFor={idVol} className="etiquette">
          Numéro de vol
        </label>
        <input
          id={idVol}
          name="numeroVol"
          className="champ"
          placeholder="AF1380"
          required
          value={numeroVol}
          onChange={(e) => setNumeroVol(e.target.value.toUpperCase())}
        />
      </div>
      <div className="flex flex-1 flex-col gap-1.5">
        <label htmlFor={idDate} className="etiquette">
          Date du vol
        </label>
        <input
          id={idDate}
          name="dateVol"
          type="date"
          max={AUJOURDHUI}
          className="champ"
          required
          value={dateVol}
          onChange={(e) => setDateVol(e.target.value)}
        />
      </div>
      <button type="submit" className="bouton bouton-primaire sm:shrink-0">
        <Icone nom="recherche" taille={18} />
        Vérifier
      </button>
    </form>
  );
}

