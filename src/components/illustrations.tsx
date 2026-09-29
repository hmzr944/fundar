"use client";

import { useState } from "react";
import { cx } from "@/components/ui";

/**
 * Real photography, not geometric marks — duotoned to the palette so any
 * photo reads as part of the same system. Falls back to a quiet paper wash
 * if the source is unreachable, so a dead link never shows a broken-image icon.
 */
export function Photo({
  src,
  alt,
  className,
  wipeIn = false,
  delay = 0,
}: {
  src: string;
  alt: string;
  className?: string;
  wipeIn?: boolean;
  delay?: number;
}) {
  const [failed, setFailed] = useState(false);
  return (
    <div
      className={cx("relative overflow-hidden bg-surface-2", wipeIn && "photo-wipe wipe-in", className)}
      style={wipeIn ? { ["--reveal-delay" as string]: `${delay}ms` } : undefined}
    >
      {!failed ? (
        <img
          src={src}
          alt={alt}
          loading="lazy"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
          style={{ filter: "grayscale(35%) sepia(6%) contrast(1.04)" }}
        />
      ) : (
        <div
          className="h-full w-full"
          style={{ background: "linear-gradient(150deg, var(--surface-2), var(--border))" }}
          aria-hidden
        />
      )}
      {!failed && (
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background: "linear-gradient(155deg, color-mix(in srgb, var(--sky) 30%, transparent), color-mix(in srgb, var(--accent) 18%, transparent))",
            mixBlendMode: "color",
          }}
          aria-hidden
        />
      )}
    </div>
  );
}
