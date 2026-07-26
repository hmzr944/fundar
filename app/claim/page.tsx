"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import { CheckCircle, LockKey } from "@phosphor-icons/react/dist/ssr";
import SignatureCanvas, { SignatureCanvasHandle } from "@/components/SignatureCanvas";

type Etape = "chargement" | "connexion_requise" | "formulaire" | "envoi" | "termine";

export default function ClaimPage() {
  return (
    <Suspense
      fallback={
        <main className="conteneur-etroit py-16">
          <div className="carte h-64 animate-pulse" />
        </main>
      }
    >
      <ClaimPageInterieur />
    </Suspense>
  );
}

function ClaimPageInterieur() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClient();
  const signatureRef = useRef<SignatureCanvasHandle>(null);

  const [etape, setEtape] = useState<Etape>("chargement");
  const [erreur, setErreur] = useState<string | null>(null);
  const [fichier, setFichier] = useState<File | null>(null);
  const [cguAcceptees, setCguAcceptees] = useState(false);

  const [identite, setIdentite] = useState({
    nom: "",
    prenom: "",
    adresse: "",
    email: "",
    iban: "",
  });

  const vol = {
    numeroVol: searchParams.get("numeroVol") ?? "",
    dateVol: searchParams.get("dateVol") ?? "",
    aeroportDepart: searchParams.get("aeroportDepart") ?? "",
    aeroportArrivee: searchParams.get("aeroportArrivee") ?? "",
    compagnie: searchParams.get("compagnie") ?? "",
    montantEstime: searchParams.get("montantEstime") ?? "",
    devise: searchParams.get("devise") ?? "EUR",
    motif: searchParams.get("motif") ?? "",
    explication: searchParams.get("explication") ?? "",
  };

  useEffect(() => {
    supabase.auth
      .getUser()
      .then(({ data }: { data: { user: User | null } }) => {
        setEtape(data.user ? "formulaire" : "connexion_requise");
      })
      .catch(() => setEtape("connexion_requise"));
  }, [supabase]);

  if (etape === "chargement") {
    return (
      <main className="conteneur-etroit py-16">
        <div className="carte h-64 animate-pulse" />
      </main>
    );
  }

  if (etape === "connexion_requise") {
    return (
      <main className="conteneur-etroit py-16 text-center sm:py-24">
        <h1 className="text-2xl font-extrabold tracking-tight">Connexion requise</h1>
        <p className="mt-2 text-[15px] text-[var(--texte-attenue)]">
          Connectez-vous pour lancer votre réclamation.
        </p>
        <button
          type="button"
          className="bouton bouton-primaire mx-auto mt-6"
          onClick={() =>
            router.push(`/login?next=${encodeURIComponent(`/claim?${searchParams.toString()}`)}`)
          }
        >
          Se connecter
        </button>
      </main>
    );
  }

  if (!vol.numeroVol) {
    return (
      <main className="conteneur-etroit py-16 text-center sm:py-24">
        <h1 className="text-2xl font-extrabold tracking-tight">Réclamation</h1>
        <p className="mt-2 text-[15px] text-[var(--texte-attenue)]">
          Commencez par vérifier votre vol sur la page{" "}
          <a href="/check" className="text-[var(--color-accent-600)]">
            Vérifier mon vol
          </a>
          .
        </p>
      </main>
    );
  }

  if (etape === "termine") {
    return (
      <main className="conteneur-etroit py-16 sm:py-24">
        <div className="carte flex flex-col items-center gap-3 p-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-succes-50)] text-[var(--color-succes-600)]">
            <CheckCircle size={24} weight="bold" />
          </span>
          <h1 className="text-xl font-extrabold tracking-tight">Dossier envoyé</h1>
          <p className="max-w-[40ch] text-[15px] leading-relaxed text-[var(--texte-attenue)]">
            Votre mandat signé a été enregistré. Vous recevrez un email de
            confirmation, et pouvez suivre l&apos;avancement depuis votre{" "}
            <a href="/dashboard" className="text-[var(--color-accent-600)]">
              tableau de bord
            </a>
            .
          </p>
        </div>
      </main>
    );
  }

  async function soumettre(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    const signatureDataUrl = signatureRef.current?.obtenirSignature();
    if (!signatureDataUrl) {
      setErreur("Merci de signer le mandat avant de continuer.");
      return;
    }
    if (!cguAcceptees) {
      setErreur("Merci d'accepter les conditions générales.");
      return;
    }
    if (!fichier) {
      setErreur("Merci de joindre votre carte d'embarquement ou votre confirmation de réservation.");
      return;
    }

    setEtape("envoi");

    try {
      const resCreation = await fetch("/api/claim", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numeroVol: vol.numeroVol,
          dateVol: vol.dateVol,
          aeroportDepart: vol.aeroportDepart,
          aeroportArrivee: vol.aeroportArrivee,
          compagnie: vol.compagnie,
          statutEligibilite: "ELIGIBLE",
          montantEstime: vol.montantEstime ? Number(vol.montantEstime) : null,
          devise: vol.devise,
          motif: vol.motif,
          explication: vol.explication,
        }),
      });

      const { id, erreur: erreurCreation } = await resCreation.json();
      if (!resCreation.ok || !id) {
        setErreur(erreurCreation ?? "Impossible de créer le dossier.");
        setEtape("formulaire");
        return;
      }

      const {
        data: { user },
      } = await supabase.auth.getUser();

      const cheminStorage = `${user!.id}/${id}/carte-embarquement-${fichier.name}`;
      const { error: erreurUpload } = await supabase.storage
        .from("documents")
        .upload(cheminStorage, fichier, { upsert: true });

      if (erreurUpload) {
        setErreur("Impossible d'envoyer votre justificatif. Réessayez.");
        setEtape("formulaire");
        return;
      }

      await supabase.from("documents").insert({
        claim_id: id,
        type: "CARTE_EMBARQUEMENT",
        storage_path: cheminStorage,
      });

      const resMandat = await fetch(`/api/claim/${id}/mandat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...identite, signatureDataUrl }),
      });

      if (!resMandat.ok) {
        setErreur("Impossible de finaliser le mandat. Réessayez.");
        setEtape("formulaire");
        return;
      }

      setEtape("termine");
    } catch {
      setErreur("Une erreur est survenue. Réessayez.");
      setEtape("formulaire");
    }
  }

  return (
    <main className="conteneur-etroit py-14 sm:py-20">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
        Finaliser ma réclamation
      </h1>

      <div className="carte mt-6 flex items-center justify-between p-5">
        <div>
          <p className="text-sm font-bold">
            Vol {vol.numeroVol} · {vol.aeroportDepart} → {vol.aeroportArrivee}
          </p>
          <p className="text-sm text-[var(--texte-attenue)]">{vol.dateVol}</p>
        </div>
        {vol.montantEstime && (
          <p className="text-2xl font-extrabold tabular-nums text-[var(--color-accent-500)]">
            {vol.montantEstime} {vol.devise}
          </p>
        )}
      </div>

      <form onSubmit={soumettre} className="carte mt-6 flex flex-col gap-5 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="nom" className="etiquette">
              Nom
            </label>
            <input
              id="nom"
              className="champ"
              required
              value={identite.nom}
              onChange={(e) => setIdentite({ ...identite, nom: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="prenom" className="etiquette">
              Prénom
            </label>
            <input
              id="prenom"
              className="champ"
              required
              value={identite.prenom}
              onChange={(e) => setIdentite({ ...identite, prenom: e.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="adresse" className="etiquette">
            Adresse postale
          </label>
          <input
            id="adresse"
            className="champ"
            required
            value={identite.adresse}
            onChange={(e) => setIdentite({ ...identite, adresse: e.target.value })}
          />
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="email" className="etiquette">
              Email
            </label>
            <input
              id="email"
              type="email"
              className="champ"
              required
              value={identite.email}
              onChange={(e) => setIdentite({ ...identite, email: e.target.value })}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="iban" className="etiquette">
              IBAN
            </label>
            <input
              id="iban"
              className="champ"
              required
              value={identite.iban}
              onChange={(e) => setIdentite({ ...identite, iban: e.target.value })}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="fichier" className="etiquette">
            Carte d&apos;embarquement ou confirmation de réservation
          </label>
          <input
            id="fichier"
            type="file"
            accept="image/*,application/pdf"
            required
            className="champ"
            onChange={(e) => setFichier(e.target.files?.[0] ?? null)}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="etiquette">Signez ici pour mandater Refund Radar</span>
          <SignatureCanvas ref={signatureRef} />
          <button
            type="button"
            className="bouton bouton-fantome self-start !px-0 text-sm"
            onClick={() => signatureRef.current?.effacer()}
          >
            Effacer la signature
          </button>
        </div>

        <label className="flex items-start gap-2.5 text-sm leading-relaxed text-[var(--texte-attenue)]">
          <input
            type="checkbox"
            className="mt-0.5 h-4 w-4 shrink-0 accent-[var(--color-accent-500)]"
            checked={cguAcceptees}
            onChange={(e) => setCguAcceptees(e.target.checked)}
          />
          J&apos;ai lu et j&apos;accepte les conditions générales, et je comprends
          qu&apos;une commission de 22 % sera due en cas de succès.
        </label>

        {erreur && <p className="text-sm text-[var(--color-attente-600)]">{erreur}</p>}

        <button type="submit" className="bouton bouton-primaire" disabled={etape === "envoi"}>
          {etape === "envoi" ? "Envoi..." : "Commander avec obligation de paiement"}
        </button>

        <p className="flex items-center justify-center gap-1.5 text-xs text-[var(--texte-attenue)]">
          <LockKey size={14} />
          Données chiffrées, hébergées en Union européenne.
        </p>
      </form>
    </main>
  );
}
