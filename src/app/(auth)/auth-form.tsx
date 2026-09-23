"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, Logo, Spinner } from "@/components/ui";
import { api } from "@/lib/client/api";

export function AuthForm({ mode }: { mode: "login" | "signup" }) {
  const router = useRouter();
  const params = useSearchParams();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const next = params.get("next");
  const safeNext = next && next.startsWith("/app") ? next : "/app";

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
          ...(mode === "signup" ? { name: form.get("name") || undefined } : {}),
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
    <div className="flex min-h-dvh items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <Link href="/" className="mb-8 inline-block">
          <Logo className="text-lg" />
        </Link>
        <h1 className="text-2xl font-semibold">{mode === "login" ? "Connexion" : "Créer un compte"}</h1>
        <p className="mt-1 text-sm text-muted">
          {mode === "login" ? "Retrouvez vos missions là où vous les avez laissées." : "Votre espace personnel pour faire avancer vos missions."}
        </p>
        <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
          {mode === "signup" && (
            <Field label="Prénom (facultatif)" name="name" type="text" autoComplete="given-name" />
          )}
          <Field label="Adresse e-mail" name="email" type="email" autoComplete="email" required />
          <Field
            label="Mot de passe"
            name="password"
            type="password"
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
              Pas encore de compte ? <Link className="text-accent hover:underline" href="/signup">Créer un compte</Link>
            </>
          ) : (
            <>
              Déjà inscrit ? <Link className="text-accent hover:underline" href="/login">Se connecter</Link>
            </>
          )}
        </p>
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
