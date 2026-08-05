"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Icone from "@/components/Icone";
import Logotype from "@/components/Logotype";

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

  return (
    /*
      Deux colonnes : le formulaire à gauche, une image à droite qui
      disparaît sous 1024px. La page précédente était un champ flottant au
      milieu du vide — sur un service qui manipule un IBAN, ça ressemblait
      à un formulaire de test. On rappelle donc ici ce qu'on est et ce
      qu'on ne fait pas de l'adresse.
    */
    <main className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
      <div className="flex items-center justify-center px-5 py-14 sm:py-20">
        <div className="w-full max-w-[25rem]">
          <Link href="/" className="inline-flex text-[var(--texte)]">
            <Logotype hauteur={22} />
          </Link>

          {envoye ? (
            <div className="entree-fade mt-10">
              <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-succes-50)] text-[var(--color-succes-600)]">
                <Icone nom="coche" taille={22} />
              </span>
              <h1 className="titre mt-5 text-[1.875rem]">Regardez vos emails</h1>
              <p className="mt-3 text-[15px] leading-relaxed text-[var(--texte-attenue)]">
                Un lien de connexion vient de partir vers{" "}
                <strong className="font-semibold text-[var(--texte)]">
                  {email}
                </strong>
                . Il est valable une heure.
              </p>
              <p className="mt-4 text-[14px] leading-relaxed text-[var(--texte-attenue)]">
                Rien reçu au bout de deux minutes ? Regardez dans les
                indésirables, puis{" "}
                <button
                  type="button"
                  onClick={() => setEnvoye(false)}
                  className="font-semibold text-[var(--texte)] underline underline-offset-4"
                >
                  réessayez avec une autre adresse
                </button>
                .
              </p>
            </div>
          ) : (
            <>
              <h1 className="titre mt-10 text-[1.875rem] sm:text-[2.25rem]">
                Suivez votre dossier
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-[var(--texte-attenue)]">
                Pas de mot de passe à retenir : nous envoyons un lien de
                connexion à usage unique.
              </p>

              <form onSubmit={envoyerLienMagique} className="mt-8 flex flex-col gap-2">
                <label htmlFor="email" className="etiquette">
                  Votre email
                </label>
                <input
                  id="email"
                  type="email"
                  required
                  autoComplete="email"
                  autoFocus
                  placeholder="vous@exemple.com"
                  className="champ"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button
                  type="submit"
                  className="bouton bouton-primaire mt-3"
                  disabled={envoi}
                >
                  {envoi ? "Envoi en cours..." : "Recevoir mon lien"}
                  {!envoi && <Icone nom="fleche" taille={18} />}
                </button>
                {erreur && (
                  <p className="mt-1 text-sm text-[var(--color-accent-600)]">
                    {erreur}
                  </p>
                )}
              </form>

              <p className="mt-6 flex items-start gap-2 text-[13px] leading-relaxed text-[var(--texte-attenue)]">
                <Icone nom="cadenas" taille={15} className="mt-0.5 shrink-0" />
                Votre adresse sert uniquement à vous connecter et à vous tenir
                informé de votre dossier. Aucune newsletter, aucun partage.
              </p>
            </>
          )}
        </div>
      </div>

      {/* Colonne d'image, purement décorative : masquée aux lecteurs
          d'écran et absente du DOM mobile pour ne rien télécharger. */}
      <div className="relative hidden lg:block">
        <Image
          src="/images/twa-departure-board.jpg"
          alt=""
          aria-hidden="true"
          fill
          sizes="50vw"
          className="object-cover"
        />
        <div className="verre-sur-image absolute inset-x-10 bottom-10 p-6">
          <p className="titre text-[1.5rem] leading-tight">
            Un dossier, une adresse, aucune relance de votre part.
          </p>
        </div>
      </div>
    </main>
  );
}
