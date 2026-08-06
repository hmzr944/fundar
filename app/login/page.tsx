"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";
import Icone from "@/components/Icone";
import Logotype from "@/components/Logotype";
import { messageErreurEnvoi } from "@/lib/auth/message-erreur";

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <main id="contenu" className="conteneur-etroit py-16">
          <div className="carte h-56 animate-pulse" />
        </main>
      }
    >
      <LoginPageInterieur />
    </Suspense>
  );
}

/**
 * Un lien qui ne marche pas mérite mieux qu'un formulaire vierge.
 *
 * Le parcours partait en boucle : le lien échouait, la page de connexion
 * réapparaissait sans un mot d'explication, l'utilisateur ressaisissait
 * son adresse, recevait un nouveau lien... et comme le précédent devenait
 * caduc, la moindre erreur de clic relançait le tour.
 */
const MESSAGE_ECHEC: Record<string, { titre: string; detail: string }> = {
  lien_perime: {
    titre: "Ce lien a déjà servi",
    detail:
      "Les liens de connexion ne fonctionnent qu'une fois, et un lien plus récent annule les précédents. Demandez-en un nouveau ci-dessous, puis ouvrez le dernier email reçu.",
  },
  lien_autre_navigateur: {
    titre: "Ce lien a été ouvert dans un autre navigateur",
    detail:
      "Pour votre sécurité, le lien ne s'active que dans le navigateur qui l'a demandé. Redemandez-en un ici, depuis cette fenêtre, et ouvrez-le sans changer de navigateur.",
  },
};

function LoginPageInterieur() {
  const searchParams = useSearchParams();
  const next = searchParams.get("next") ?? "/dashboard";
  const [email, setEmail] = useState("");
  const [envoye, setEnvoye] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [echecLien, setEchecLien] = useState(
    () => MESSAGE_ECHEC[searchParams.get("erreur") ?? ""] ?? null
  );

  // Supabase place le motif du refus dans le fragment (#error_code=...),
  // que le serveur ne voit jamais. On le lit ici, puis on le retire de la
  // barre d'adresse : le message est affiché, l'URL n'a plus à le porter.
  useEffect(() => {
    if (!window.location.hash.includes("error")) return;
    const params = new URLSearchParams(window.location.hash.slice(1));
    const code = params.get("error_code");
    if (code === "otp_expired" || code === "access_denied") {
      setEchecLien(MESSAGE_ECHEC.lien_perime);
    }
    history.replaceState(null, "", window.location.pathname + window.location.search);
  }, []);

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
      setErreur(messageErreurEnvoi(error));
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
    <main id="contenu" className="grid min-h-[calc(100vh-4rem)] lg:grid-cols-2">
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
              {/* Le piège du lien magique : chaque nouvelle demande annule
                  la précédente. Sans cette phrase, on ouvre un vieil email,
                  on tombe sur une erreur, on redemande un lien — et la
                  boucle se referme. */}
              <p className="mt-3 text-[14px] leading-relaxed text-[var(--texte-attenue)]">
                Ouvrez bien le <strong className="font-semibold text-[var(--texte)]">dernier</strong>{" "}
                email reçu : chaque nouvelle demande annule les liens
                précédents.
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
              {echecLien && (
                <div className="entree-fade mt-10 flex gap-3 rounded-[var(--radius-interne)] border border-[var(--color-attente-500)]/30 bg-[var(--color-attente-50)] p-4">
                  <Icone
                    nom="sablier"
                    taille={18}
                    className="mt-0.5 shrink-0 text-[var(--color-attente-600)]"
                  />
                  <div>
                    <p className="text-[15px] font-semibold">{echecLien.titre}</p>
                    <p className="mt-1 text-[14px] leading-relaxed text-[var(--texte-attenue)]">
                      {echecLien.detail}
                    </p>
                  </div>
                </div>
              )}

              <h1
                className={`titre text-[1.875rem] sm:text-[2.25rem] ${
                  echecLien ? "mt-8" : "mt-10"
                }`}
              >
                {echecLien ? "Renvoyer un lien" : "Suivez votre dossier"}
              </h1>
              <p className="mt-3 text-[15px] leading-relaxed text-[var(--texte-attenue)]">
                {echecLien
                  ? "Votre dossier n'est pas perdu : il vous attend, et vous le retrouverez là où vous l'aviez laissé."
                  : "Pas de mot de passe à retenir : nous envoyons un lien de connexion à usage unique."}
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
