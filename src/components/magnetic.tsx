"use client";

import gsap from "gsap";
import { usePathname } from "next/navigation";
import { useEffect } from "react";

/**
 * A slight pull of each [data-magnetic] element toward the pointer, so the
 * call to action answers the hand before the click. Precise pointers only,
 * never under reduced motion. Re-binds on each page of the layout.
 */
export function Magnetic() {
  const pathname = usePathname();
  useEffect(() => {
    if (!window.matchMedia("(pointer: fine) and (prefers-reduced-motion: no-preference)").matches) return;
    const offs = Array.from(document.querySelectorAll<HTMLElement>("[data-magnetic]")).map((el) => {
      const x = gsap.quickTo(el, "x", { duration: 0.5, ease: "power3.out" });
      const y = gsap.quickTo(el, "y", { duration: 0.5, ease: "power3.out" });
      const move = (e: PointerEvent) => {
        const b = el.getBoundingClientRect();
        x((e.clientX - (b.left + b.width / 2)) * 0.2);
        y((e.clientY - (b.top + b.height / 2)) * 0.3);
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
        gsap.set(el, { x: 0, y: 0 });
      };
    });
    return () => offs.forEach((off) => off());
  }, [pathname]);
  return null;
}
