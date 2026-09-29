"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, Logo, Reveal, Spinner } from "@/components/ui";
import { PasswordField } from "@/components/password-field";
import { SkyBurst } from "@/components/illustrations";
import { api } from "@/lib/client/api";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const next = params.get("next");
  const safeNext = next && next.startsWith("/app") ? next : "/app";
  const ref = params.get("ref");

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = new FormData(e.currentTarget);
    setPending(true);
    setError(null);
    try {
      await api(`/api/auth/${mode}`, {
        method: "POST",
        json: {
          email: form.get("email"),
          password: form.get("password"),
          ...(mode === "signup" ? { name: form.get("name") || undefined, ref: ref || undefined } : {}),
        },
      });
      router.replace(safeNext);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setPending(false);
    }
  }

  return (
    <div className="grid min-h-dvh lg:grid-cols-2">
      <div className="relative hidden overflow-hidden border-r border-line bg-elev lg:flex lg:flex-col lg:justify-between lg:p-10">
        <SkyBurst className="pointer-events-none absolute inset-0 h-full w-full opacity-90" />
        <Link href="/" className="relative z-10">
          <Logo className="text-lg" />
        </Link>
        <Reveal delay={150} className="relative z-10 max-w-md">
          <p className="font-display text-3xl leading-tight text-fg">
            {mode === "login" ? "Reprenez là où vous vous êtes arrêté." : "Un problème de moins à porter seul."}
          </p>
          <p className="mt-3 text-sm text-muted">
            Nimbrel garde vos dossiers en mémoire, relance à votre place, et vous prévient quand quelque chose bouge.
          </p>
        </Reveal>
      </div>

      <div className="flex items-center justify-center px-4 py-10">
        <Reveal className="w-full max-w-sm">
          <Link href="/" className="mb-8 inline-block lg:hidden">
            <Logo className="text-lg" />
          </Link>
          <h1 className="font-display text-2xl font-semibold">{mode === "login" ? "Connexion" : "Créer un compte"}</h1>
          <p className="mt-1 text-sm text-muted">
            {mode === "login" ? "Retrouvez vos missions là où vous les avez laissées." : "Votre espace personnel pour faire avancer vos missions."}
          </p>
          <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
            {mode === "signup" && (
              <Field label="Prénom (facultatif)" name="name" type="text" autoComplete="given-name" />
            )}
            <Field label="Adresse e-mail" name="email" type="email" autoComplete="email" required />
            <PasswordField
              label="Mot de passe"
              name="password"
              autoComplete={mode === "login" ? "current-password" : "new-password"}
              required
              hint={mode === "signup" ? "10 caractères minimum." : undefined}
            />
            {error && (
              <p role="alert" className="rounded-lg border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger">
                {error}
              </p>
            )}
            <Button type="submit" variant="primary" className="w-full py-2.5" disabled={pending}>
              {pending && <Spinner />}
              {mode === "login" ? "Se connecter" : "Créer mon compte"}
            </Button>
          </form>
          <p className="mt-6 text-sm text-muted">
            {mode === "login" ? (
              <>
                Pas encore de compte ? <Link className="text-sky hover:underline" href="/signup">Créer un compte</Link>
              </>
            ) : (
              <>
                Déjà inscrit ? <Link className="text-sky hover:underline" href="/login">Se connecter</Link>
              </>
            )}
          </p>
        </Reveal>
      </div>
    </div>
  );
}

function Field({ label, hint, ...props }: React.ComponentProps<"input"> & { label: string; hint?: string }) {
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
