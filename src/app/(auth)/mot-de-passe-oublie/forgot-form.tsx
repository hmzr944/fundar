"use client";

import Link from "next/link";
import { useState } from "react";
import { Button, Spinner } from "@/components/ui";
import { api } from "@/lib/client/api";
import { Field } from "../auth-shell";

export function ForgotForm() {
  const [sentTo, setSentTo] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const email = String(new FormData(e.currentTarget).get("email") ?? "");
    setPending(true);
    setError(null);
    try {
      await api("/api/auth/password/forgot", { method: "POST", json: { email } });
      setSentTo(email);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setPending(false);
    }
  }

  if (sentTo) {
    return (
      <div className="msg-in" role="status">
        <h1 className="font-display text-2xl font-semibold">Vérifiez votre boîte mail</h1>
        <p className="mt-3 text-sm text-muted">
          Si un compte existe pour <strong className="text-fg">{sentTo}</strong>, un lien pour choisir un nouveau mot de passe vient d&apos;y
          être envoyé. Il est valable une heure.
        </p>
        <p className="mt-3 text-sm text-muted">Rien reçu ? Regardez dans les indésirables, ou recommencez dans quelques minutes.</p>
        <p className="mt-8 text-sm">
          <Link className="text-sky hover:underline" href="/login">
            Retour à la connexion
          </Link>
        </p>
      </div>
    );
  }

  return (
    <>
      <h1 className="font-display text-2xl font-semibold">Mot de passe oublié</h1>
      <p className="mt-1 text-sm text-muted">Indiquez votre adresse : nous vous envoyons un lien pour en choisir un nouveau.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <Field label="Adresse e-mail" name="email" type="email" autoComplete="email" required />
        {error && (
          <p role="alert" className="rounded-lg border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger">
            {error}
          </p>
        )}
        <Button type="submit" variant="primary" className="w-full py-2.5" disabled={pending}>
          {pending && <Spinner />} Envoyer le lien
        </Button>
      </form>
      <p className="mt-6 text-sm text-muted">
        Vous l&apos;avez retrouvé ?{" "}
        <Link className="text-sky hover:underline" href="/login">
          Se connecter
        </Link>
      </p>
    </>
  );
}
