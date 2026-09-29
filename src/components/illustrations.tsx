/** Decorative inline SVG marks — no raster assets, so they stay crisp and on-brand at any size. */

/** The hero motif: a storm clearing to light. Purely decorative. */
export function SkyBurst({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 560 560" className={className} aria-hidden focusable="false">
      <defs>
        <radialGradient id="sb-glow" cx="72%" cy="28%" r="55%">
          <stop offset="0%" stopColor="var(--accent)" stopOpacity="0.55" />
          <stop offset="100%" stopColor="var(--accent)" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="sb-sky" cx="30%" cy="62%" r="60%">
          <stop offset="0%" stopColor="var(--sky)" stopOpacity="0.45" />
          <stop offset="100%" stopColor="var(--sky)" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="sb-cloud" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--surface-2)" />
          <stop offset="100%" stopColor="var(--surface)" />
        </linearGradient>
      </defs>
      <circle cx="400" cy="160" r="220" fill="url(#sb-glow)" />
      <circle cx="180" cy="360" r="220" fill="url(#sb-sky)" />
      <g className="drift-slow" style={{ transformOrigin: "280px 320px" }}>
        <ellipse cx="230" cy="330" rx="150" ry="64" fill="url(#sb-cloud)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <ellipse cx="150" cy="300" rx="70" ry="46" fill="url(#sb-cloud)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <ellipse cx="330" cy="300" rx="90" ry="52" fill="url(#sb-cloud)" stroke="var(--border-strong)" strokeWidth="1.5" />
      </g>
      <g className="drift-slower" style={{ transformOrigin: "360px 220px" }} opacity="0.9">
        <ellipse cx="380" cy="235" rx="110" ry="44" fill="url(#sb-cloud)" stroke="var(--border-strong)" strokeWidth="1.5" />
        <ellipse cx="440" cy="215" rx="55" ry="34" fill="url(#sb-cloud)" stroke="var(--border-strong)" strokeWidth="1.5" />
      </g>
      <g stroke="var(--accent)" strokeWidth="2" strokeLinecap="round" opacity="0.6">
        <line x1="400" y1="60" x2="400" y2="20" />
        <line x1="470" y1="90" x2="500" y2="65" />
        <line x1="330" y1="90" x2="300" y2="65" />
      </g>
      <circle cx="400" cy="150" r="34" fill="var(--accent)" />
    </svg>
  );
}

/** A thin drifting wisp used to break up long sections without another flat divider line. */
export function CloudWisp({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 200 48" className={className} aria-hidden focusable="false">
      <path
        d="M6 32c-4-10 5-18 14-14 2-9 16-12 22-3 8-6 20-1 20 8 0 1 0 2-1 3h12c8 0 8 12 0 12H20C10 38 8 36 6 32Z"
        fill="var(--surface-2)"
        stroke="var(--border-strong)"
        strokeWidth="1.2"
      />
      <path
        d="M110 30c-3-8 4-15 12-12 2-7 13-10 18-2 6-5 16 0 16 7 0 1 0 1-1 2h10c6 0 6 10 0 10h-46c-6 0-8-2-9-5Z"
        fill="var(--surface-2)"
        stroke="var(--border-strong)"
        strokeWidth="1.2"
        opacity="0.7"
      />
    </svg>
  );
}

/** Numbered step marker with a soft glow — used in "how it works" style sequences. */
export function StepGlow({ n, className }: { n: number | string; className?: string }) {
  return (
    <span className={className} aria-hidden>
      <svg viewBox="0 0 40 40" className="h-full w-full">
        <defs>
          <radialGradient id={`sg-${n}`} cx="35%" cy="30%" r="75%">
            <stop offset="0%" stopColor="var(--accent-strong)" />
            <stop offset="100%" stopColor="var(--accent)" />
          </radialGradient>
        </defs>
        <circle cx="20" cy="20" r="18" fill={`url(#sg-${n})`} />
      </svg>
      <span className="absolute inset-0 flex items-center justify-center text-sm font-semibold text-accent-contrast">{n}</span>
    </span>
  );
}
