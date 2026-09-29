"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Button, Spinner } from "@/components/ui";
import { PasswordField } from "@/components/password-field";
import { api } from "@/lib/client/api";
import { AuthShell, Field } from "./auth-shell";

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
    <AuthShell tagline={mode === "login" ? "Reprenez là où vous vous êtes arrêté." : "Un problème de moins à porter seul."}>
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
            {mode === "login" && (
              <p className="-mt-2 text-right text-sm">
                <Link href="/mot-de-passe-oublie" className="text-sky hover:underline">
                  Mot de passe oublié ?
                </Link>
              </p>
            )}
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
    </AuthShell>
  );
}
