import type { Metadata } from "next";
import Link from "next/link";
import { AuthShell } from "../auth-shell";
import { ResetForm } from "./reset-form";

export const metadata: Metadata = { title: "Nouveau mot de passe" };

export default async function Page({ searchParams }: { searchParams: Promise<{ jeton?: string }> }) {
  const { jeton } = await searchParams;
  return (
    <AuthShell tagline="Un nouveau départ, sans rien perdre.">
      {jeton ? (
        <ResetForm token={jeton} />
      ) : (
        <>
          <h1 className="font-display text-2xl font-semibold">Lien incomplet</h1>
          <p className="mt-3 text-sm text-muted">
            Ouvrez le lien reçu par e-mail tel quel, ou demandez-en un nouveau.
          </p>
          <p className="mt-6 text-sm">
            <Link className="text-sky hover:underline" href="/mot-de-passe-oublie">
              Demander un nouveau lien
            </Link>
          </p>
        </>
      )}
    </AuthShell>
  );
}
