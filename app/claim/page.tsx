"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, EnvelopeSimple } from "@phosphor-icons/react/dist/ssr";
import SignatureCanvas, { SignatureCanvasHandle } from "@/components/SignatureCanvas";
import ProgressionEtapes from "@/components/ProgressionEtapes";

type Etape = "identite" | "signature" | "justificatif" | "attente_email" | "termine";

const LABELS_ETAPES = ["Coordonnées", "Signature", "Justificatif"];
const CLE_SESSION = "refund-radar:dossier-en-attente";

interface Identite {
  nom: string;
  prenom: string;
  adresse: string;
  email: string;
  iban: string;
}

interface DossierEnAttente {
  identite: Identite;
  signatureDataUrl: string;
}

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
  const searchParams = useSearchParams();
  const supabase = createClient();
  const signatureRef = useRef<SignatureCanvasHandle>(null);

  const [etape, setEtape] = useState<Etape>("identite");
  const [erreur, setErreur] = useState<string | null>(null);
  const [fichier, setFichier] = useState<File | null>(null);
  const [cguAcceptees, setCguAcceptees] = useState(false);
  const [envoi, setEnvoi] = useState(false);
  const [signatureDataUrl, setSignatureDataUrl] = useState<string | null>(null);
  const [emailEnAttente, setEmailEnAttente] = useState("");

  const [identite, setIdentite] = useState<Identite>({
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

  // Retour après vérification email : on restaure ce qui a déjà été saisi
  // plutôt que de faire tout recommencer depuis zéro.
  useEffect(() => {
    const brut = sessionStorage.getItem(CLE_SESSION);
    if (!brut) return;
    try {
      const dossier: DossierEnAttente = JSON.parse(brut);
      setIdentite(dossier.identite);
      setSignatureDataUrl(dossier.signatureDataUrl);
      setCguAcceptees(true);
      setEtape("justificatif");
    } catch {
      sessionStorage.removeItem(CLE_SESSION);
    }
  }, []);

  if (!vol.numeroVol) {
    return (
      <main className="conteneur-etroit py-16 text-center sm:py-24">
        <h1 className="text-2xl font-semibold tracking-tight">Réclamation</h1>
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

  if (etape === "attente_email") {
    return (
      <main className="conteneur-etroit py-16 sm:py-24">
        <div className="carte flex flex-col items-center gap-3 p-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-accent-50)] text-[var(--color-accent-600)]">
            <EnvelopeSimple size={22} weight="bold" />
          </span>
          <h1 className="text-xl font-semibold tracking-tight">Plus qu'une étape</h1>
          <p className="max-w-[40ch] text-[15px] leading-relaxed text-[var(--texte-attenue)]">
            Vos informations et votre signature sont déjà enregistrées.
            Cliquez sur le lien envoyé à{" "}
            <strong className="text-[var(--texte)]">{emailEnAttente}</strong>{" "}
            pour confirmer et finaliser votre dossier.
          </p>
        </div>
      </main>
    );
  }

  if (etape === "termine") {
    return (
      <main className="conteneur-etroit py-16 sm:py-24">
        <div className="carte flex flex-col items-center gap-3 p-8 text-center">
          <span className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--color-succes-50)] text-[var(--color-succes-500)]">
            <CheckCircle size={24} weight="bold" />
          </span>
          <h1 className="text-xl font-semibold tracking-tight">Dossier envoyé</h1>
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

  function validerIdentite(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    setEtape("signature");
  }

  function validerSignature(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);
    const donnees = signatureRef.current?.obtenirSignature();
    if (!donnees) {
      setErreur("Merci de signer le mandat avant de continuer.");
      return;
    }
    if (!cguAcceptees) {
      setErreur("Merci d'accepter les conditions générales.");
      return;
    }
    setSignatureDataUrl(donnees);
    setEtape("justificatif");
  }

  async function soumettreDossierComplet(userId: string) {
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
      return false;
    }

    const cheminStorage = `${userId}/${id}/carte-embarquement-${fichier!.name}`;
    const { error: erreurUpload } = await supabase.storage
      .from("documents")
      .upload(cheminStorage, fichier!, { upsert: true });

    if (erreurUpload) {
      setErreur("Impossible d'envoyer votre justificatif. Réessayez.");
      return false;
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
      return false;
    }

    sessionStorage.removeItem(CLE_SESSION);
    return true;
  }

  async function soumettreFinal(e: React.FormEvent) {
    e.preventDefault();
    setErreur(null);

    if (!fichier) {
      setErreur("Merci de joindre votre carte d'embarquement ou votre confirmation de réservation.");
      return;
    }

    setEnvoi(true);

    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        const dossier: DossierEnAttente = { identite, signatureDataUrl: signatureDataUrl! };
        sessionStorage.setItem(CLE_SESSION, JSON.stringify(dossier));

        const { error } = await supabase.auth.signInWithOtp({
          email: identite.email,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(`/claim?${searchParams.toString()}`)}`,
          },
        });

        if (error) {
          setErreur("Impossible d'envoyer le lien de vérification. Réessayez.");
          setEnvoi(false);
          return;
        }

        setEmailEnAttente(identite.email);
        setEtape("attente_email");
        setEnvoi(false);
        return;
      }

      const succes = await soumettreDossierComplet(user.id);
      setEnvoi(false);
      if (succes) setEtape("termine");
    } catch {
      setErreur("Une erreur est survenue. Réessayez.");
      setEnvoi(false);
    }
  }

  const indexEtape = etape === "identite" ? 0 : etape === "signature" ? 1 : 2;

  return (
    <main className="conteneur-etroit py-14 sm:py-20">
      <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">
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
          <p className="text-2xl font-bold tabular-nums text-[var(--color-accent-500)]">
            {vol.montantEstime} {vol.devise}
          </p>
        )}
      </div>

      <div className="mt-8">
        <ProgressionEtapes etapeActuelle={indexEtape} labels={LABELS_ETAPES} />
      </div>

      {etape === "identite" && (
        <form onSubmit={validerIdentite} className="carte flex flex-col gap-5 p-6">
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

          <button type="submit" className="bouton bouton-primaire">
            Continuer
          </button>
        </form>
      )}

      {etape === "signature" && (
        <form onSubmit={validerSignature} className="carte flex flex-col gap-5 p-6">
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

          <div className="flex gap-3">
            <button
              type="button"
              className="bouton bouton-secondaire"
              onClick={() => setEtape("identite")}
            >
              Retour
            </button>
            <button type="submit" className="bouton bouton-primaire flex-1">
              Continuer
            </button>
          </div>
        </form>
      )}

      {etape === "justificatif" && (
        <form onSubmit={soumettreFinal} className="carte flex flex-col gap-5 p-6">
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

          {erreur && <p className="text-sm text-[var(--color-attente-600)]">{erreur}</p>}

          <button type="submit" className="bouton bouton-primaire" disabled={envoi}>
            {envoi ? "Envoi..." : "Commander avec obligation de paiement"}
          </button>

          <p className="text-center text-xs text-[var(--texte-attenue)]">
            Nous vérifierons votre email à cette étape si ce n&apos;est pas déjà fait.
          </p>
        </form>
      )}
    </main>
  );
}
