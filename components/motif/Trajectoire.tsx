"use client";

import { motion, useReducedMotion } from "framer-motion";

/**
 * Trajectoire de fond : le geste du logotype, agrandi et presque effacé.
 *
 * Le site manquait de signature graphique — des cartes blanches sur du
 * crème, indifférenciables de n'importe quel SaaS. Plutôt que d'inventer
 * un ornement, on reprend la seule forme que la marque possède déjà : la
 * courbe du v qui décolle. Répétée en fond de section, elle fait le lien
 * entre le logo, les icônes et les pages.
 *
 * Elle est volontairement à la limite du perceptible. Un motif de fond
 * qu'on remarque est un motif qui gêne la lecture ; celui-ci doit se voir
 * quand on cherche, pas quand on lit.
 */
export default function Trajectoire({
  className = "",
  opacite = 0.045,
  /** Trace le chemin à l'entrée dans le champ de vision. */
  anime = true,
}: {
  className?: string;
  opacite?: number;
  anime?: boolean;
}) {
  const reduit = useReducedMotion();
  const doitAnimer = anime && !reduit;

  return (
    <svg
      viewBox="0 0 60 60"
      preserveAspectRatio="none"
      aria-hidden="true"
      // Purement décoratif : jamais d'interception du pointeur, sinon le
      // motif volerait les clics des éléments qu'il recouvre.
      className={`pointer-events-none absolute select-none ${className}`}
      style={{ color: "var(--color-accent-500)", opacity: opacite }}
    >
      {/*
        Seul l'arc montant du v, pas la lettre entière. Une première
        version reprenait le glyphe complet : agrandi derrière un titre, il
        se lisait comme un V égaré dans la page, donc comme une faute de
        mise en page. Réduit à sa courbe, le geste reste reconnaissable
        sans jamais être pris pour un caractère.
      */}
      <motion.path
        d="M6 56 C18 40 30 22 54 4"
        fill="none"
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={doitAnimer ? { pathLength: 0 } : false}
        whileInView={doitAnimer ? { pathLength: 1 } : undefined}
        viewport={{ once: true, amount: 0.2 }}
        transition={{ duration: 1.4, ease: [0.23, 1, 0.32, 1] }}
      />
    </svg>
  );
}
