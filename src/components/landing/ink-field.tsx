"use client";

import { useEffect, useRef } from "react";

const vertex = /* glsl */ `
  void main() { gl_Position = vec4(position.xy, 0.0, 1.0); }
`;

// Domain-warped noise reads as ink diffusing in water. Density is kept low on
// the left, where the text sits, so contrast holds; the cursor draws the ink.
const fragment = /* glsl */ `
  precision highp float;
  uniform float uTime;
  uniform vec2 uRes;
  uniform vec2 uMouse;
  uniform vec3 uPaper;
  uniform vec3 uInk;
  uniform vec3 uSeal;

  float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }
  float noise(vec2 p) {
    vec2 i = floor(p), f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), u.x), mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), u.x), u.y);
  }
  float fbm(vec2 p) {
    float v = 0.0, a = 0.5;
    for (int i = 0; i < 5; i++) { v += a * noise(p); p = p * 2.02 + vec2(1.7, 9.2); a *= 0.5; }
    return v;
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / uRes;
    float aspect = uRes.x / uRes.y;
    vec2 p = uv * vec2(aspect, 1.0) * 1.7;
    float t = uTime * 0.035;

    vec2 toMouse = (uMouse - uv) * vec2(aspect, 1.0);
    float pull = exp(-dot(toMouse, toMouse) * 6.0);
    p += toMouse * pull * 0.35;

    vec2 q = vec2(fbm(p + t), fbm(p + vec2(5.2, 1.3) - t));
    vec2 r = vec2(fbm(p + 4.0 * q + vec2(1.7, 9.2) + 0.15 * t), fbm(p + 4.0 * q + vec2(8.3, 2.8) + 0.126 * t));
    float f = fbm(p + 4.0 * r);

    float mask = smoothstep(0.18, 0.8, uv.x);
    float ink = smoothstep(0.42, 0.95, f + pull * 0.18) * mask;
    float seal = smoothstep(0.7, 0.95, length(r) * f * 1.35) * mask;

    vec3 col = mix(uPaper, uInk, ink * 0.78);
    col = mix(col, uSeal, seal * 0.75);
    gl_FragColor = vec4(col, 1.0);
  }
`;

function cssColor(name: string, fallback: string) {
  const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim();
  return v || fallback;
}

/** WebGL ink backdrop. Loads three.js only when its section approaches the viewport. */
export function InkField({ className }: { className?: string }) {
  const host = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = host.current;
    if (!el) return;
    let disposed = false;
    let cleanup: (() => void) | undefined;

    const start = async () => {
      const THREE = await import("three");
      if (disposed) return;

      let renderer: import("three").WebGLRenderer;
      try {
        renderer = new THREE.WebGLRenderer({ antialias: false, powerPreference: "low-power" });
      } catch {
        return; // No WebGL: the section's CSS wash stays as is.
      }
      renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
      const canvas = renderer.domElement;
      canvas.setAttribute("aria-hidden", "true");
      canvas.className = "absolute inset-0 h-full w-full opacity-0 transition-opacity duration-[1200ms]";
      el.appendChild(canvas);

      const uniforms = {
        uTime: { value: 0 },
        uRes: { value: new THREE.Vector2(1, 1) },
        uMouse: { value: new THREE.Vector2(0.75, 0.5) },
        uPaper: { value: new THREE.Color(cssColor("--bg", "#eef0ea")) },
        uInk: { value: new THREE.Color(cssColor("--sky", "#1f3a52")) },
        uSeal: { value: new THREE.Color(cssColor("--accent", "#9c2b2e")) },
      };
      const scene = new THREE.Scene();
      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const geometry = new THREE.PlaneGeometry(2, 2);
      const material = new THREE.ShaderMaterial({ vertexShader: vertex, fragmentShader: fragment, uniforms });
      scene.add(new THREE.Mesh(geometry, material));

      const still = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      const resize = () => {
        const { width, height } = el.getBoundingClientRect();
        renderer.setSize(width, height, false);
        uniforms.uRes.value.set(width * renderer.getPixelRatio(), height * renderer.getPixelRatio());
        if (still) renderer.render(scene, camera);
      };
      const ro = new ResizeObserver(resize);
      ro.observe(el);
      resize();

      const target = new THREE.Vector2(0.75, 0.5);
      const onMove = (e: PointerEvent) => {
        const b = el.getBoundingClientRect();
        target.set((e.clientX - b.left) / b.width, 1 - (e.clientY - b.top) / b.height);
      };
      el.parentElement?.addEventListener("pointermove", onMove);

      let raf = 0;
      let visible = false;
      const clock = new THREE.Clock();
      const frame = () => {
        uniforms.uTime.value = 40 + clock.getElapsedTime();
        uniforms.uMouse.value.lerp(target, 0.04);
        renderer.render(scene, camera);
        raf = requestAnimationFrame(frame);
      };
      const io = new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        cancelAnimationFrame(raf);
        if (visible && !still) raf = requestAnimationFrame(frame);
      });
      io.observe(el);

      uniforms.uTime.value = 40;
      renderer.render(scene, camera);
      requestAnimationFrame(() => canvas.classList.replace("opacity-0", "opacity-100"));

      cleanup = () => {
        cancelAnimationFrame(raf);
        io.disconnect();
        ro.disconnect();
        el.parentElement?.removeEventListener("pointermove", onMove);
        geometry.dispose();
        material.dispose();
        renderer.dispose();
        canvas.remove();
      };
    };

    const near = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        near.disconnect();
        void start();
      },
      { rootMargin: "400px 0px" },
    );
    near.observe(el);

    return () => {
      disposed = true;
      near.disconnect();
      cleanup?.();
    };
  }, []);

  return <div ref={host} aria-hidden className={className} />;
}
