"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { EnvelopeSimple, PaperPlaneTilt } from "@phosphor-icons/react/dist/ssr";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main className="conteneur-etroit py-16">
          <div className="carte h-56 animate-pulse" />
        </main>
      }
    >
      <LoginPageInterieur />
    </Suspense>
  );
}

function LoginPageInterieur() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/claim";
  const [email, setEmail] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function envoyerLienMagique(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEnvoi(true);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(next)}`,
      },
    });
    setEnvoi(false);
    if (error) {
      setErreur("Impossible d'envoyer le lien. Réessayez dans un instant.");
      return;
    }
    setEnvoye(true);
  }

  if (envoye) {
    return (
      <main className="conteneur-etroit py-16 sm:py-24">
        <div className="carte flex flex-col items-center gap-3 p-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-50)] text-[var(--color-accent-600)]">
            <PaperPlaneTilt size={22} weight="bold" />
          </span>
          <h1 className="text-xl font-bold tracking-tight">Vérifiez vos emails</h1>
          <p className="max-w-[36ch] text-[15px] leading-relaxed text-[var(--texte-attenue)]">
            Un lien de connexion a été envoyé à <strong className="text-[var(--texte)]">{email}</strong>.
            Cliquez dessus pour continuer votre dossier.
          </p>
        </div>
      </main>
    );
  }

  return (
    <main className="conteneur-etroit py-16 sm:py-24">
      <div className="mx-auto max-w-[26rem] text-center">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-50)] text-[var(--color-accent-600)]">
          <EnvelopeSimple size={22} weight="bold" />
        </span>
        <h1 className="mt-4 text-2xl font-bold tracking-tight">Connexion</h1>
        <p className="mt-2 text-[15px] text-[var(--texte-attenue)]">
          Pas de mot de passe : recevez un lien de connexion par email.
        </p>

        <form onSubmit={envoyerLienMagique} className="mt-6 flex flex-col gap-3 text-left">
          <label htmlFor="email" className="etiquette">
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            placeholder="vous@exemple.com"
            className="champ"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <button type="submit" className="bouton bouton-primaire mt-1" disabled={envoi}>
            {envoi ? "Envoi..." : "Recevoir le lien"}
          </button>
          {erreur && <p className="text-sm text-[var(--color-attente-600)]">{erreur}</p>}
        </form>
      </div>
    </main>
  );
}
