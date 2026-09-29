import Link from "next/link";
import type { ReactNode } from "react";
import { Photo } from "@/components/illustrations";
import { Logo, Reveal } from "@/components/ui";
import { unsplash } from "@/lib/photos";

/** The split layout shared by every account page: the files photo on the left, the form on the right. */
export function AuthShell({ tagline, children }: { tagline: string; children: ReactNode }) {
  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between lg:p-10">
        <div className="absolute inset-0">
          <Photo src={unsplash("snNHKZ-mGfE", 1200)} alt="" wipeIn className="h-full w-full" />
        </div>
        <div
          className="pointer-events-none absolute inset-0"
          style={{
            background:
              "linear-gradient(to bottom, color-mix(in srgb, var(--sky-strong) 55%, transparent), transparent 35%, transparent 45%, color-mix(in srgb, var(--sky-strong) 92%, transparent))",
          }}
          aria-hidden
        />
        <Link href="/" className="relative z-10">
          <Logo className="text-lg text-white" tone="light" />
        </Link>
        <Reveal delay={200} className="relative z-10 max-w-md">
          <p className="font-display text-3xl leading-tight text-white">{tagline}</p>
          <p className="mt-3 text-sm text-white/80">
            Nimbrel garde vos dossiers en mémoire, relance à votre place, et vous prévient quand quelque chose bouge.
          </p>
        </Reveal>
      </div>

      <div className="flex items-center justify-center px-4 py-10">
        <Reveal className="w-full max-w-sm">
          <Link href="/" className="mb-8 inline-block lg:hidden">
            <Logo className="text-lg" />
          </Link>
          {children}
        </Reveal>
      </div>
    </div>
  );
}

export function Field({ label, hint, ...props }: React.ComponentProps<"input"> & { label: string; hint?: string }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium">{label}</span>
      <input
        {...props}
        className="w-full rounded-lg border border-line-strong bg-elev px-3 py-2.5 text-sm outline-none transition-colors placeholder:text-faint focus:border-accent"
      />
      {hint && <span className="mt-1 block text-xs text-faint">{hint}</span>}
    </label>
  );
}
