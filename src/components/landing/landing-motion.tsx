"use client";

import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { useGSAP } from "@gsap/react";

gsap.registerPlugin(useGSAP, ScrollTrigger, SplitText);

const EASE = "expo.out";

/**
 * Page-level scroll choreography for the landing, wired by data attributes so the
 * page stays a server component. Every effect is skipped under reduced motion,
 * and the page reads fully without JS.
 */
export function LandingMotion() {
  useGSAP(() => {
    const mm = gsap.matchMedia();

    mm.add("(prefers-reduced-motion: no-preference)", () => {
      // Hero hands off to the page: the photo settles back, the copy drifts up.
      const hero = document.querySelector("[data-hero]");
      if (hero) {
        const scrub = { trigger: hero, start: "top top", end: "bottom top", scrub: true };
        gsap.to("[data-hero-photo]", { scale: 0.93, yPercent: 5, ease: "none", scrollTrigger: scrub });
        gsap.to("[data-hero-copy]", { yPercent: -18, opacity: 0.25, ease: "none", scrollTrigger: scrub });
      }

      // The cases open as one set: a staggered wipe, each photo settling inside its frame.
      const grid = document.querySelector("[data-tiles]");
      if (grid) {
        const tiles = gsap.utils.toArray<HTMLElement>("[data-tile]");
        const tl = gsap.timeline({ scrollTrigger: { trigger: grid, start: "top 78%", once: true } });
        tl.fromTo(
          tiles,
          { clipPath: "inset(100% 0% 0% 0%)" },
          { clipPath: "inset(0% 0% 0% 0%)", duration: 1.1, ease: EASE, stagger: 0.09, clearProps: "clipPath" },
        ).fromTo(
          tiles.map((t) => t.querySelector("img")).filter(Boolean),
          { scale: 1.18 },
          { scale: 1, duration: 1.5, ease: EASE, stagger: 0.09, clearProps: "transform" },
          0,
        );
      }

      // The band's statement is read word by word as it crosses the screen.
      gsap.utils.toArray<HTMLElement>("[data-scrub-words]").forEach((el) => {
        SplitText.create(el, {
          type: "words",
          autoSplit: true,
          onSplit: (self) =>
            gsap.fromTo(
              self.words,
              { opacity: 0.2 },
              { opacity: 1, ease: "none", stagger: 0.15, scrollTrigger: { trigger: el, start: "top 80%", end: "bottom 45%", scrub: true } },
            ),
        });
      });
    });

    // Primary calls to action lean slightly toward the pointer (mouse only).
    mm.add("(prefers-reduced-motion: no-preference) and (pointer: fine)", () => {
      const offs = gsap.utils.toArray<HTMLElement>("[data-magnetic]").map((el) => {
        const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
        const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
        const move = (e: PointerEvent) => {
          const b = el.getBoundingClientRect();
          x((e.clientX - (b.left + b.width / 2)) * 0.25);
          y((e.clientY - (b.top + b.height / 2)) * 0.35);
        };
        const leave = () => {
          x(0);
          y(0);
        };
        el.addEventListener("pointermove", move);
        el.addEventListener("pointerleave", leave);
        return () => {
          el.removeEventListener("pointermove", move);
          el.removeEventListener("pointerleave", leave);
        };
      });
      return () => offs.forEach((off) => off());
    });
  });

  return null;
}
