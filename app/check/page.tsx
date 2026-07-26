"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

interface Resultat {
  statut: "ELIGIBLE" | "INELIGIBLE" | "REVIEW_MANUEL" | "WAITLIST";
  montantEstime: number | null;
  devise: "EUR" | "GBP";
  motif: string;
  explication: string;
}

interface ReponseCheck {
  vol?: { compagnie: string; aeroportDepart: string; aeroportArrivee: string };
  resultat?: Resultat;
  erreur?: string;
}

const CLASSE_PAR_STATUT: Record<Resultat["statut"], string> = {
  ELIGIBLE: "eligible",
  INELIGIBLE: "ineligible",
  REVIEW_MANUEL: "revue",
  WAITLIST: "attente",
};

export default function CheckPage() {
  return (
    <Suspense
      fallback={
        <main className="page">
          <p>Chargement...</p>
        </main>
      }
    >
      <CheckPageInterieur />
    </Suspense>
  );
}

function CheckPageInterieur() {
  const searchParams = useSearchParams();
  const [numeroVol, setNumeroVol] = useState(searchParams.get("numeroVol") ?? "");
  const [dateVol, setDateVol] = useState(searchParams.get("dateVol") ?? "");
  const [preavisAnnulationJours, setPreavisAnnulationJours] = useState("");
  const [chargement, setChargement] = useState(false);
  const [erreur, setErreur] = useState<string | null>(null);
  const [reponse, setReponse] = useState<ReponseCheck | null>(null);
  const [email, setEmail] = useState("");
  const [emailEnvoye, setEmailEnvoye] = useState(false);

  async function verifier(e: React.FormEvent) {
    e.preventDefault();
    setChargement(true);
    setErreur(null);
    setReponse(null);

    try {
      const res = await fetch("/api/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          numeroVol,
          dateVol,
          preavisAnnulationJours: preavisAnnulationJours
            ? Number(preavisAnnulationJours)
            : undefined,
        }),
      });
      const data: ReponseCheck = await res.json();
      if (!res.ok) {
        setErreur(data.erreur ?? "Une erreur est survenue.");
      } else {
        setReponse(data);
      }
    } catch {
      setErreur("Connexion impossible. Réessayez.");
    } finally {
      setChargement(false);
    }
  }

  async function enregistrerWaitlist(e: React.FormEvent) {
    e.preventDefault();
    if (!reponse?.vol) return;
    await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, compagnie: reponse.vol.compagnie, numeroVol }),
    });
    setEmailEnvoye(true);
  }

  const demandePreavis =
    reponse?.resultat?.motif === "REVIEW_PREAVIS_INCONNU";

  return (
    <main className="page">
      <h1>Vérifier mon vol</h1>
      <p>Aucune inscription nécessaire pour obtenir votre verdict.</p>

      <form onSubmit={verifier}>
        <input
          placeholder="Numéro de vol (ex: AF1234)"
          required
          value={numeroVol}
          onChange={(e) => setNumeroVol(e.target.value.toUpperCase())}
        />
        <input
          type="date"
          required
          value={dateVol}
          onChange={(e) => setDateVol(e.target.value)}
        />
        <button type="submit" disabled={chargement}>
          {chargement ? "Vérification..." : "Vérifier"}
        </button>
      </form>

      {erreur && (
        <div className="verdict ineligible">
          <p>{erreur}</p>
        </div>
      )}

      {reponse?.resultat && (
        <div className={`verdict ${CLASSE_PAR_STATUT[reponse.resultat.statut]}`}>
          {reponse.resultat.statut === "ELIGIBLE" && reponse.vol && (
            <>
              <p className="montant">
                {reponse.resultat.montantEstime} {reponse.resultat.devise}
              </p>
              <p>{reponse.resultat.explication}</p>
              <Link
                href={{
                  pathname: "/claim",
                  query: {
                    numeroVol,
                    dateVol,
                    aeroportDepart: reponse.vol.aeroportDepart,
                    aeroportArrivee: reponse.vol.aeroportArrivee,
                    compagnie: reponse.vol.compagnie,
                    montantEstime: reponse.resultat.montantEstime ?? "",
                    devise: reponse.resultat.devise,
                    motif: reponse.resultat.motif,
                    explication: reponse.resultat.explication,
                  },
                }}
              >
                <button type="button">Lancer ma réclamation</button>
              </Link>
            </>
          )}

          {reponse.resultat.statut === "INELIGIBLE" && (
            <p>{reponse.resultat.explication}</p>
          )}

          {reponse.resultat.statut === "WAITLIST" && !emailEnvoye && (
            <>
              <p>{reponse.resultat.explication}</p>
              <form onSubmit={enregistrerWaitlist}>
                <input
                  type="email"
                  required
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit">Me prévenir</button>
              </form>
            </>
          )}
          {reponse.resultat.statut === "WAITLIST" && emailEnvoye && (
            <p>Merci, nous vous préviendrons dès que ce dossier sera traité.</p>
          )}

          {reponse.resultat.statut === "REVIEW_MANUEL" && !demandePreavis && (
            <p>{reponse.resultat.explication}</p>
          )}

          {demandePreavis && (
            <>
              <p>
                Il nous manque une information : combien de jours avant le
                vol l&apos;annulation vous a-t-elle été annoncée ?
              </p>
              <form onSubmit={verifier}>
                <input
                  type="number"
                  min={0}
                  required
                  placeholder="Nombre de jours"
                  value={preavisAnnulationJours}
                  onChange={(e) => setPreavisAnnulationJours(e.target.value)}
                />
                <button type="submit">Recalculer</button>
              </form>
            </>
          )}
        </div>
      )}
    </main>
  );
}
