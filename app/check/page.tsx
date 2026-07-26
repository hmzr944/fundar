"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Prohibit,
  Clock,
  MagnifyingGlass,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import Radar from "@/components/Radar";
import MontantSplitFlap from "@/components/MontantSplitFlap";

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

const PILULE_PAR_STATUT: Record<Resultat["statut"], string> = {
  ELIGIBLE: "pilule-eligible",
  INELIGIBLE: "pilule-ineligible",
  REVIEW_MANUEL: "pilule-revue",
  WAITLIST: "pilule-attente",
};

const LIBELLE_PAR_STATUT: Record<Resultat["statut"], string> = {
  ELIGIBLE: "Éligible",
  INELIGIBLE: "Non éligible",
  REVIEW_MANUEL: "À vérifier",
  WAITLIST: "Liste d'attente",
};

const ICONE_PAR_STATUT: Record<Resultat["statut"], React.ElementType> = {
  ELIGIBLE: CheckCircle,
  INELIGIBLE: Prohibit,
  REVIEW_MANUEL: MagnifyingGlass,
  WAITLIST: Clock,
};

export default function CheckPage() {
  return (
    <Suspense
      fallback={
        <main className="conteneur-etroit py-16">
          <div className="carte h-64 animate-pulse" />
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

  const demandePreavis = reponse?.resultat?.motif === "REVIEW_PREAVIS_INCONNU";
  const Icone = reponse?.resultat ? ICONE_PAR_STATUT[reponse.resultat.statut] : null;

  return (
    <main className="conteneur-etroit py-14 sm:py-20">
      <h1 className="text-3xl font-extrabold tracking-tight sm:text-4xl">
        Vérifiez votre indemnisation
      </h1>
      <p className="mt-2 text-[15px] text-[var(--texte-attenue)]">
        Numéro de vol et date suffisent. Aucune inscription requise.
      </p>

      <form onSubmit={verifier} className="carte mt-8 flex flex-col gap-4 p-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="numeroVol" className="etiquette">
              Numéro de vol
            </label>
            <input
              id="numeroVol"
              className="champ"
              placeholder="AF1380"
              required
              value={numeroVol}
              onChange={(e) => setNumeroVol(e.target.value.toUpperCase())}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="dateVol" className="etiquette">
              Date du vol
            </label>
            <input
              id="dateVol"
              type="date"
              className="champ"
              required
              value={dateVol}
              onChange={(e) => setDateVol(e.target.value)}
            />
          </div>
        </div>
        <button type="submit" className="bouton bouton-primaire mt-1" disabled={chargement}>
          {chargement ? "Vérification..." : "Vérifier"}
        </button>
      </form>

      {chargement && (
        <div className="carte mt-6 flex flex-col items-center gap-3 p-10">
          <Radar size={96} />
          <p className="text-sm text-[var(--texte-attenue)]">Scan de votre dossier en cours...</p>
        </div>
      )}

      {erreur && (
        <div className="carte mt-6 border-[var(--color-attente-500)]/30 p-5 text-[15px]">
          {erreur}
        </div>
      )}

      {reponse?.resultat && Icone && (
        <div className="carte-embarquement mt-6 p-6" key={reponse.resultat.motif + numeroVol}>
          <span className={`pilule ${PILULE_PAR_STATUT[reponse.resultat.statut]}`}>
            <Icone size={14} weight="bold" />
            {LIBELLE_PAR_STATUT[reponse.resultat.statut]}
          </span>

          {reponse.resultat.statut === "ELIGIBLE" && reponse.vol && reponse.resultat.montantEstime !== null && (
            <>
              <div className="souche mt-4 pt-4">
                <p className="text-4xl font-bold">
                  <MontantSplitFlap
                    montant={reponse.resultat.montantEstime}
                    devise={reponse.resultat.devise}
                  />
                </p>
              </div>
              <p className="mt-3 text-[15px] leading-relaxed text-[var(--texte-attenue)]">
                {reponse.resultat.explication}
              </p>
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
                className="bouton bouton-primaire mt-5"
              >
                Lancer ma réclamation
                <ArrowRight size={16} weight="bold" />
              </Link>
            </>
          )}

          {reponse.resultat.statut === "INELIGIBLE" && (
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--texte-attenue)]">
              {reponse.resultat.explication}
            </p>
          )}

          {reponse.resultat.statut === "WAITLIST" && !emailEnvoye && (
            <>
              <p className="mt-3 text-[15px] leading-relaxed text-[var(--texte-attenue)]">
                {reponse.resultat.explication}
              </p>
              <form onSubmit={enregistrerWaitlist} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="email"
                  required
                  placeholder="vous@exemple.com"
                  className="champ"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
                <button type="submit" className="bouton bouton-secondaire sm:shrink-0">
                  Me prévenir
                </button>
              </form>
            </>
          )}
          {reponse.resultat.statut === "WAITLIST" && emailEnvoye && (
            <p className="mt-3 text-[15px] text-[var(--texte-attenue)]">
              Merci, nous vous préviendrons dès que ce dossier sera traité.
            </p>
          )}

          {reponse.resultat.statut === "REVIEW_MANUEL" && !demandePreavis && (
            <p className="mt-3 text-[15px] leading-relaxed text-[var(--texte-attenue)]">
              {reponse.resultat.explication}
            </p>
          )}

          {demandePreavis && (
            <>
              <p className="mt-3 text-[15px] leading-relaxed text-[var(--texte-attenue)]">
                Il nous manque une information : combien de jours avant le
                vol l&apos;annulation vous a-t-elle été annoncée ?
              </p>
              <form onSubmit={verifier} className="mt-4 flex flex-col gap-3 sm:flex-row">
                <input
                  type="number"
                  min={0}
                  required
                  placeholder="Nombre de jours"
                  className="champ"
                  value={preavisAnnulationJours}
                  onChange={(e) => setPreavisAnnulationJours(e.target.value)}
                />
                <button type="submit" className="bouton bouton-secondaire sm:shrink-0">
                  Recalculer
                </button>
              </form>
            </>
          )}
        </div>
      )}
    </main>
  );
}
