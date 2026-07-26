"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);

  async function envoyerLienMagique(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setErreur("Impossible d'envoyer le lien. Réessayez dans un instant.");
      return;
    }
    setEnvoye(true);
  }

  if (envoye) {
    return (
      <main className="page">
        <h1>Vérifiez vos emails</h1>
        <p>
          Un lien de connexion a été envoyé à <strong>{email}</strong>.
          Cliquez dessus pour continuer votre dossier.
        </p>
      </main>
    );
  }

  return (
    <main className="page">
      <h1>Connexion</h1>
      <p>Pas de mot de passe : recevez un lien de connexion par email.</p>
      <form onSubmit={envoyerLienMagique}>
        <input
          type="email"
          required
          placeholder="vous@exemple.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <button type="submit">Recevoir le lien</button>
      </form>
      {erreur && <p role="alert">{erreur}</p>}
    </main>
  );
}
