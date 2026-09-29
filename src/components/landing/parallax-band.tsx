"use client";

import { useRef, type ReactNode } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { Photo } from "@/components/illustrations";

gsap.registerPlugin(useGSAP, ScrollTrigger);

/** Full-bleed photo with a statement over it; the photo drifts slightly slower than the page for depth. */
export function ParallaxBand({ src, children }: { src: string; children: ReactNode }) {
  const root = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.fromTo(
          "[data-parallax]",
          { yPercent: -8 },
          { yPercent: 8, ease: "none", scrollTrigger: { trigger: root.current, start: "top bottom", end: "bottom top", scrub: true } },
        );
      });
    },
    { scope: root },
  );

  return (
    <section ref={root} className="relative isolate overflow-hidden">
      <div data-parallax className="absolute -inset-y-[12%] inset-x-0 -z-10">
        <Photo src={src} alt="" className="h-full w-full" />
      </div>
      <div
        aria-hidden
        className="absolute inset-0 -z-10"
        style={{ background: "linear-gradient(100deg, color-mix(in srgb, var(--sky-strong) 92%, transparent) 20%, color-mix(in srgb, var(--sky-strong) 45%, transparent))" }}
      />
      {children}
    </section>
  );
}
