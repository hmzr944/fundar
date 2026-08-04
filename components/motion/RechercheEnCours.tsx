"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Attente pendant la vérification d'un vol.
 *
 * Le brief demandait un « radar » : un cercle et un balayage lumineux. Le
 * geste vient du nom précédent du produit, et il dit surveillance — un
 * faisceau qui traque une cible. Ce n'est ni le nom ni le ton d'aujourd'hui.
 *
 * On reprend donc le geste du logotype : une trajectoire qui plonge puis
 * s'élève, tracée en boucle pendant l'attente. Le client voit son vol
 * décoller, pas un scanner qui le cherche.
 *
 * L'attente est le seul moment où l'on peut faire patienter sans mentir :
 * elle dure ce qu'elle dure, et l'animation ne prétend pas mesurer une
 * progression qu'on ne connaît pas.
 */
export default function RechercheEnCours({ taille = 96 }: { taille?: number }) {
  const reduit = useReducedMotion();

  return (
    <div
      className="relative grid place-items-center"
      style={{ width: taille, height: taille }}
      role="status"
      aria-label="Vérification du vol en cours"
    >
      {/* Halos concentriques : la respiration, pas un balayage. */}
      {!reduit &&
        [0, 1].map((i) => (
          <motion.span
            key={i}
            className="absolute rounded-full border border-[var(--color-accent-500)]"
            style={{ width: taille, height: taille }}
            initial={{ scale: 0.55, opacity: 0.5 }}
            animate={{ scale: 1, opacity: 0 }}
            transition={{
              duration: 2.4,
              repeat: Infinity,
              delay: i * 1.2,
              ease: "easeOut",
            }}
          />
        ))}

      <svg
        viewBox="0 0 56 69"
        width={taille * 0.46}
        height={taille * 0.56}
        fill="none"
        aria-hidden="true"
      >
        {/* Tracé fantôme : la trajectoire complète, en filigrane. */}
        <path
          d="M7 20 L20 60 C28 44 34 24 49 9"
          stroke="var(--color-accent-500)"
          strokeOpacity="0.18"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <motion.path
          d="M7 20 L20 60 C28 44 34 24 49 9"
          stroke="var(--color-accent-500)"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
          // pathLength normalise le tracé à 1 quelle que soit sa longueur
          // réelle : la vitesse ne dépend donc pas de la taille de rendu.
          initial={{ pathLength: 0 }}
          animate={reduit ? { pathLength: 1 } : { pathLength: [0, 1, 1] }}
          transition={
            reduit
              ? { duration: 0 }
              : { duration: 1.9, repeat: Infinity, ease: "easeInOut", times: [0, 0.7, 1] }
          }
        />
      </svg>
    </div>
  );
}
