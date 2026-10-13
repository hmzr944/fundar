"use client";

import { useEffect, useRef } from "react";

/**
 * A number that rolls from its previous value to the new one, so the eye sees
 * what changed. Written straight to the DOM (no re-render per frame); instant
 * under reduced motion. The final text is in the server HTML, so nothing
 * depends on JavaScript to be read.
 */
export function CountUp({ value, format, className, duration = 650 }: { value: number; format: (n: number) => string; className?: string; duration?: number }) {
  const ref = useRef<HTMLSpanElement>(null);
  const from = useRef(value);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const start = from.current;
    from.current = value;
    if (start === value || window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.textContent = format(value);
      return;
    }
    const t0 = performance.now();
    let raf = 0;
    const step = (t: number) => {
      const k = Math.min(1, (t - t0) / duration);
      const eased = 1 - Math.pow(1 - k, 3); // ease-out: fast start, gentle landing
      el.textContent = format(Math.round(start + (value - start) * eased));
      if (k < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    el.classList.remove("count-pop");
    void el.offsetWidth;
    el.classList.add("count-pop");
    return () => cancelAnimationFrame(raf);
  }, [value, format, duration]);

  return (
    <span ref={ref} className={className}>
      {format(value)}
    </span>
  );
}
