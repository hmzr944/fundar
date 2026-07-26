/** Marque géométrique simple : arcs radar + trajectoire, un seul accent. */
export default function BrandMark({ size = 28 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <circle cx="16" cy="16" r="15" stroke="currentColor" strokeOpacity="0.15" strokeWidth="1.5" />
      <circle cx="16" cy="16" r="10" stroke="currentColor" strokeOpacity="0.28" strokeWidth="1.5" />
      <path
        d="M16 16 L16 4"
        stroke="var(--color-accent-500)"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <circle cx="16" cy="16" r="2.5" fill="var(--color-accent-500)" />
    </svg>
  );
}
