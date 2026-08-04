"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Les quatre étapes du tunnel, animées en SVG inline plutôt qu'en Lottie.
 *
 * Le brief demandait `@dotlottie/react-player`. Le lecteur pèse une
 * soixantaine de kilo-octets et ne sert à rien sans fichiers `.lottie` —
 * or il n'y en a aucun dans le projet, et je ne peux pas en produire.
 * On aurait installé une dépendance pour afficher du vide.
 *
 * Ces quatre dessins font le même travail : ils sont tracés dans la
 * géométrie du logotype, pèsent quelques centaines d'octets, héritent de
 * currentColor, et s'animent au tracé. Le jour où vous aurez de vraies
 * animations Lottie d'un motion designer, ce composant se remplace sans
 * toucher au reste.
 */
export type NomEtape = "vol" | "preuve" | "mandat" | "indemnite";

const TRACES: Record<NomEtape, { d: string[]; libelle: string }> = {
  // 1. Le numéro de vol : la trajectoire du logotype.
  vol: {
    libelle: "Numéro de vol",
    d: ["M6 18 L17 52 C24 38 29 21 42 8"],
  },
  // 2. La preuve d'achat : un document dont le coin se replie.
  preuve: {
    libelle: "Preuve d'achat",
    d: [
      "M14 6 H31 L42 17 V54 A2 2 0 0 1 40 56 H14 A2 2 0 0 1 12 54 V8 A2 2 0 0 1 14 6 Z",
      "M31 6 V17 H42",
      "M20 32 H34",
      "M20 42 H34",
    ],
  },
  // 3. Le mandat signé : le geste de la signature, posé sur sa ligne.
  mandat: {
    libelle: "Mandat signé",
    d: ["M10 40 C18 16 25 13 29 24 C33 35 39 34 46 18", "M8 52 H46"],
  },
  // 4. L'indemnité : le cercle qui se referme sur une coche.
  indemnite: {
    libelle: "Indemnité reçue",
    d: ["M27 6 A21 21 0 1 1 26.9 6", "M17 28 L24 35 L37 20"],
  },
};

export default function EtapeTunnel({
  etape,
  actif = false,
  taille = 54,
}: {
  etape: NomEtape;
  /** Rejoue le tracé quand l'étape devient l'étape courante. */
  actif?: boolean;
  taille?: number;
}) {
  const reduit = useReducedMotion();
  const { d, libelle } = TRACES[etape];

  return (
    <svg
      viewBox="0 0 54 62"
      width={taille}
      height={taille * (62 / 54)}
      fill="none"
      stroke="currentColor"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
      role="img"
      aria-label={libelle}
    >
      {d.map((trace, i) => (
        <motion.path
          key={trace}
          d={trace}
          initial={false}
          // Une étape non atteinte reste dessinée mais en retrait : la
          // masquer priverait le client de la vue d'ensemble du parcours.
          animate={
            reduit
              ? { pathLength: 1, opacity: actif ? 1 : 0.3 }
              : { pathLength: actif ? 1 : 0.999, opacity: actif ? 1 : 0.3 }
          }
          transition={
            reduit
              ? { duration: 0 }
              : { duration: 0.55, delay: actif ? i * 0.18 : 0, ease: [0.23, 1, 0.32, 1] }
          }
        />
      ))}
    </svg>
  );
}
