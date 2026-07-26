"use client";

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import type { User } from "@supabase/supabase-js";
import SignatureCanvas, { SignatureCanvasHandle } from "@/components/SignatureCanvas";

type Etape = "chargement" | "connexion_requise" | "formulaire" | "envoi" | "termine";

export default function ClaimPage() {
  return (
    <Suspense
      fallback={
        <main className="page">
          <p>Chargement...</p>
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
    supabase.auth.getUser().then(({ data }: { data: { user: User | null } }) => {
      setEtape(data.user ? "formulaire" : "connexion_requise");
    });
  }, [supabase]);

  if (etape === "chargement") {
    return (
      <main className="page">
        <p>Chargement...</p>
      </main>
    );
  }

  if (etape === "connexion_requise") {
    return (
      <main className="page">
        <h1>Connexion requise</h1>
        <p>Connectez-vous pour lancer votre réclamation.</p>
        <button
          type="button"
          onClick={() =>
            router.push(`/login?next=/claim?${searchParams.toString()}`)
          }
        >
          Se connecter
        </button>
      </main>
    );
  }

  if (!vol.numeroVol) {
    return (
      <main className="page">
        <h1>Réclamation</h1>
        <p>
          Commencez par vérifier votre vol sur la page{" "}
          <a href="/check">Vérifier mon vol</a>.
        </p>
      </main>
    );
  }

  if (etape === "termine") {
    return (
      <main className="page">
        <h1>Dossier envoyé</h1>
        <p>
          Votre mandat signé a été enregistré. Vous recevrez un email de
          confirmation, et pouvez suivre l&apos;avancement depuis votre{" "}
          <a href="/dashboard">tableau de bord</a>.
        </p>
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
    <main className="page">
      <h1>Finaliser ma réclamation</h1>
      <p>
        Vol {vol.numeroVol} du {vol.dateVol} ({vol.aeroportDepart} →{" "}
        {vol.aeroportArrivee}) — {vol.compagnie}
        {vol.montantEstime && (
          <>
            {" "}
            — estimation : {vol.montantEstime} {vol.devise}
          </>
        )}
      </p>

      <form onSubmit={soumettre}>
        <input
          placeholder="Nom"
          required
          value={identite.nom}
          onChange={(e) => setIdentite({ ...identite, nom: e.target.value })}
        />
        <input
          placeholder="Prénom"
          required
          value={identite.prenom}
          onChange={(e) => setIdentite({ ...identite, prenom: e.target.value })}
        />
        <input
          placeholder="Adresse postale"
          required
          value={identite.adresse}
          onChange={(e) => setIdentite({ ...identite, adresse: e.target.value })}
        />
        <input
          type="email"
          placeholder="Email"
          required
          value={identite.email}
          onChange={(e) => setIdentite({ ...identite, email: e.target.value })}
        />
        <input
          placeholder="IBAN"
          required
          value={identite.iban}
          onChange={(e) => setIdentite({ ...identite, iban: e.target.value })}
        />

        <label>
          Carte d&apos;embarquement ou confirmation de réservation
          <input
            type="file"
            accept="image/*,application/pdf"
            required
            onChange={(e) => setFichier(e.target.files?.[0] ?? null)}
          />
        </label>

        <label>Signez ici pour mandater Refund Radar</label>
        <SignatureCanvas ref={signatureRef} />
        <button type="button" onClick={() => signatureRef.current?.effacer()}>
          Effacer la signature
        </button>

        <label>
          <input
            type="checkbox"
            checked={cguAcceptees}
            onChange={(e) => setCguAcceptees(e.target.checked)}
          />{" "}
          J&apos;ai lu et j&apos;accepte les conditions générales, et je comprends
          qu&apos;une commission de 22 % sera due en cas de succès.
        </label>

        {erreur && <p role="alert">{erreur}</p>}

        <button type="submit" disabled={etape === "envoi"}>
          {etape === "envoi" ? "Envoi..." : "Commander avec obligation de paiement"}
        </button>
      </form>
    </main>
  );
}
