/**
 * Badge de marque : fond rempli, arcs de signal balayant vers un point
 * ("blip" détecté) — vocabulaire universel du radar/signal, lisible même
 * en petite taille. Fonctionne aussi seul comme icône d'app.
 */
export default function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <rect width="32" height="32" rx="9" fill="#0d0b09" />
      <path
        d="M7 22a13.2 13.2 0 0 1 13.2-13.2"
        stroke="var(--color-accent-500)"
        strokeOpacity="0.32"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <path
        d="M11.2 22a9 9 0 0 1 9-9"
        stroke="var(--color-accent-500)"
        strokeOpacity="0.62"
        strokeWidth="2.3"
        strokeLinecap="round"
      />
      <circle cx="20.2" cy="9.8" r="2.6" fill="var(--color-accent-500)" />
    </svg>
  );
}
