"use client";

import { useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cx } from "@/components/ui";

gsap.registerPlugin(useGSAP, ScrollTrigger);

export type Step = { title: string; text: string };

/**
 * The one scroll-driven story on the page: the steps really are a sequence, so a
 * sticky step number and a progress rail follow the reader through them. Without
 * JS, on small screens or with reduced motion, it is a plain readable list.
 */
export function HowItWorks({ steps }: { steps: Step[] }) {
  const root = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [enhanced, setEnhanced] = useState(false);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
        setEnhanced(true);
        const items = gsap.utils.toArray<HTMLElement>("[data-step]");
        items.forEach((el, i) =>
          ScrollTrigger.create({
            trigger: el,
            start: "top 55%",
            end: "bottom 55%",
            onToggle: (self) => self.isActive && setActive(i),
          }),
        );
        gsap.fromTo(
          "[data-rail]",
          { scaleY: 0 },
          { scaleY: 1, ease: "none", scrollTrigger: { trigger: "[data-steps]", start: "top 55%", end: "bottom 55%", scrub: true } },
        );
        return () => setEnhanced(false);
      });
    },
    { scope: root },
  );

  const current = String(active + 1);

  return (
    <div ref={root} className="grid gap-10 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
      <div aria-hidden className={cx("hidden", enhanced && "lg:block")}>
        <div className="sticky top-28 flex gap-6">
          <div className="relative w-px self-stretch bg-line">
            <span data-rail className="absolute inset-0 origin-top bg-accent" />
          </div>
          <div>
            <span key={current} className="step-number block font-display text-[9rem] font-bold leading-none tracking-tight text-accent">
              {current}
            </span>
            <p className="mt-4 max-w-xs text-sm text-muted">sur {steps.length}</p>
          </div>
        </div>
      </div>

      <ol data-steps className="space-y-4 lg:space-y-0">
        {steps.map((s, i) => (
          <li
            key={s.title}
            data-step
            className={cx(
              "border-t border-line py-6 transition-opacity duration-500 lg:flex lg:min-h-[46vh] lg:flex-col lg:justify-center lg:border-t-0 lg:py-0",
              enhanced && i !== active && "lg:opacity-30",
            )}
          >
            <span className={cx("font-display text-sm font-bold text-accent", enhanced && "lg:hidden")}>
              {i + 1}
            </span>
            <h3 className="mt-2 max-w-xl font-display text-2xl font-bold tracking-tight sm:text-3xl lg:text-4xl">{s.title}</h3>
            <p className="mt-3 max-w-lg text-base text-muted sm:text-lg">{s.text}</p>
          </li>
        ))}
      </ol>
    </div>
  );
}
