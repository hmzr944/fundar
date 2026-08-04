"use client";

import { useState } from "react";
import Icone from "./Icone";

/**
 * Partage vers les autres passagers du même vol.
 *
 * C'est le seul canal gratuit qui tienne à l'échelle, et il est
 * exceptionnellement bien ciblé ici : les destinataires étaient dans le même
 * avion, donc éligibles au même titre et pour le même montant. Un vol
 * annulé, ce sont 180 personnes qui croient toutes, à tort, n'avoir droit
 * à rien.
 *
 * La formulation est délibérément altruiste �?" « prévenez les autres », pas
 * « parrainez un ami ». Il n'y a aucune prime : une récompense
 * transformerait un geste utile en démarchage, et abîmerait la seule chose
 * qui nous distingue.
 */
export default function PartagerVol({
  numeroVol,
  dateVol,
  montant,
  devise,
}: {
  numeroVol: string;
  dateVol: string;
  montant: number | null;
  devise: string;
}) {
  const [copie, setCopie] = useState(false);

  const url =
    typeof window !== "undefined"
      ? `${window.location.origin}/vol/${encodeURIComponent(numeroVol)}`
      : `/vol/${numeroVol}`;

  const montantTexte = montant ? `${montant} ${devise}` : "jusqu'à 600 �,�";
  const message =
    `Vous étiez sur le vol ${numeroVol} du ${dateVol} ? ` +
    `Il ouvre droit à ${montantTexte} d'indemnisation par passager, ` +
    `même si la compagnie a dit le contraire. Vérification en une minute : ${url}`;

  async function partager() {
    // API de partage native sur mobile, où se trouvent les groupes de
    // discussion des passagers. Le presse-papiers reste le repli.
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({ title: `Vol ${numeroVol}`, text: message, url });
        return;
      } catch {
        // Partage annulé par l'utilisateur : on retombe sur la copie.
      }
    }

    try {
      await navigator.clipboard.writeText(message);
      setCopie(true);
      setTimeout(() => setCopie(false), 2500);
    } catch {
      setCopie(false);
    }
  }

  return (
    <div className="mt-5 border-t border-[var(--bordure)] pt-5">
      <p className="text-[15px] font-semibold">Vous n&apos;étiez pas seul.</p>
      <p className="mt-1 text-[13px] leading-relaxed text-[var(--texte-attenue)]">
        Tous les passagers de ce vol ont exactement le même droit, et
        presque aucun ne le sait. Le délai de réclamation court pour eux
        aussi.
      </p>

      <div className="mt-3 flex flex-wrap gap-2">
        <button
          type="button"
          onClick={partager}
          className="bouton bouton-secondaire !py-2 !px-3 text-sm"
        >
          {copie ? (
            <>
              <Icone nom="coche" taille={16} />
              Message copié
            </>
          ) : (
            <>
              <Icone nom="partage" taille={16} />
              Prévenir les autres passagers
            </>
          )}
        </button>
        <a
          href={`https://wa.me/?text=${encodeURIComponent(message)}`}
          target="_blank"
          rel="noreferrer"
          className="bouton bouton-fantome !py-2 !px-3 text-sm"
        >
          WhatsApp
        </a>
      </div>
    </div>
  );
}

