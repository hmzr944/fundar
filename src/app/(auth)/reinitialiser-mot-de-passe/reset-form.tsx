"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { PasswordField } from "@/components/password-field";
import { Button, Spinner } from "@/components/ui";
import { api } from "@/lib/client/api";

export function ResetForm({ token }: { token: string }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    const password = String(f.get("password") ?? "");
    if (password !== String(f.get("confirm") ?? "")) {
      setError("Les deux mots de passe ne sont pas identiques.");
      return;
    }
    setPending(true);
    setError(null);
    try {
      await api("/api/auth/password/reset", { method: "POST", json: { token, password } });
      router.replace("/app");
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setPending(false);
    }
  }

  return (
    <>
      <h1 className="font-display text-2xl font-semibold">Choisir un nouveau mot de passe</h1>
      <p className="mt-1 text-sm text-muted">Vos autres sessions seront déconnectées par sécurité.</p>
      <form onSubmit={onSubmit} className="mt-6 space-y-4" noValidate>
        <PasswordField label="Nouveau mot de passe" name="password" autoComplete="new-password" required minLength={10} hint="10 caractères minimum." />
        <PasswordField label="Confirmer le mot de passe" name="confirm" autoComplete="new-password" required />
        {error && (
          <p role="alert" className="rounded-lg border border-danger/40 bg-danger/5 px-3 py-2 text-sm text-danger">
            {error}
            {error.includes("plus valable") && (
              <>
                {" "}
                <Link href="/mot-de-passe-oublie" className="font-medium underline">
                  Nouveau lien
                </Link>
              </>
            )}
          </p>
        )}
        <Button type="submit" variant="primary" className="w-full py-2.5" disabled={pending}>
          {pending && <Spinner />} Enregistrer et me connecter
        </Button>
      </form>
    </>
  );
}
