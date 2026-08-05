"use client";

import { AnimatePresence, motion, useReducedMotion } from "framer-motion";

interface ProgressionEtapesProps {
  etapeActuelle: number;
  labels: string[];
}

/**
 * Progression du tunnel de réclamation.
 *
 * Les segments se remplissent de gauche à droite au lieu de changer de
 * couleur d'un coup, et le libellé glisse plutôt que de sauter : sur un
 * formulaire qui réclame une identité, un IBAN et une signature, chaque
 * changement d'écran doit se lire comme une avancée, pas comme un
 * rechargement.
 *
 * Seul le segment courant s'anime. Repeindre toute la barre à chaque étape
 * rejouerait l'animation sur des étapes déjà franchies, ce qui donne
 * l'impression de repartir en arrière.
 */
export default function ProgressionEtapes({
  etapeActuelle,
  labels,
}: ProgressionEtapesProps) {
  const reduit = useReducedMotion();

  return (
    <div className="mb-6">
      <div className="flex h-1.5 gap-1.5">
        {labels.map((label, index) => (
          <div
            key={label}
            className="h-full flex-1 overflow-hidden rounded-full bg-[var(--bordure)]"
          >
            <motion.div
              className="h-full rounded-full bg-[var(--color-accent-500)]"
              initial={false}
              animate={{ scaleX: index <= etapeActuelle ? 1 : 0 }}
              style={{ transformOrigin: "left" }}
              transition={
                reduit
                  ? { duration: 0 }
                  : {
                      duration: index === etapeActuelle ? 0.22 : 0,
                      ease: [0.23, 1, 0.32, 1],
                    }
              }
            />
          </div>
        ))}
      </div>

      <div className="mt-2 h-4 overflow-hidden">
        <AnimatePresence mode="wait" initial={false}>
          <motion.p
            key={etapeActuelle}
            initial={reduit ? false : { y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={reduit ? undefined : { y: -6, opacity: 0 }}
            transition={{ duration: 0.18, ease: [0.23, 1, 0.32, 1] }}
            className="text-xs font-semibold uppercase tracking-wide text-[var(--texte-attenue)]"
          >
            Étape {etapeActuelle + 1} sur {labels.length} · {labels[etapeActuelle]}
          </motion.p>
        </AnimatePresence>
      </div>
    </div>
  );
}
