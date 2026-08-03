"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  CheckCircle,
  Prohibit,
  Clock,
  MagnifyingGlass,
  ArrowRight,
} from "@phosphor-icons/react/dist/ssr";
import MontantSplitFlap from "@/components/MontantSplitFlap";
import RepartitionMontant from "@/components/RepartitionMontant";
import DeclarationVol, {
  type DonneesDeclaration,
} from "@/components/DeclarationVol";
import DelaiRestant from "@/components/DelaiRestant";
import PartagerVol from "@/components/PartagerVol";

interface Resultat {
  statut: "ELIGIBLE" | "INELIGIBLE" | "REVIEW_MANUEL" | "WAITLIST";
  montantEstime: number | null;
  devise: "EUR" | "GBP";
  motif: string;
  explication: string;
  dateLimiteReclamation?: string;
  joursAvantPrescription?: number;
}

interface Faits {
  typePerturbation: string;
  retardArriveeMinutes?: number;
  preavisAnnulationJours?: number;
}

interface ReponseCheck {
  vol?: { compagnie: string; aeroportDepart: string; aeroportArrivee: string };
  resultat?: Resultat;
  source?: "AUTOMATIQUE" | "DECLARATIF";
  faits?: Faits;
  /** "VOL_NON_VERIFIABLE" : le vol est trop ancien pour les bases publiques. */
  code?: string;
  message?: string;
  erreur?: string;
}

/** Un vol futur ne peut pas avoir été retardé : le sélecteur ne doit pas
 * le proposer, plutôt que de laisser le serveur refuser après coup. */
const AUJOURDHUI = new Date().toISOString().slice(0, 10);

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
          <div className="carte h-64" />
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

  const lancerVerification = useCallback(
    async (params: {
      numeroVol: string;
      dateVol: string;
      preavis?: string;
      declaration?: DonneesDeclaration;
    }) => {
      setChargement(true);
      setErreur(null);
      if (!params.declaration) setReponse(null);

      try {
        const res = await fetch("/api/check", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            numeroVol: params.numeroVol,
            dateVol: params.dateVol,
            preavisAnnulationJours: params.preavis ? Number(params.preavis) : undefined,
            declaration: params.declaration,
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
    },
    []
  );

  // Arrivée depuis le widget de la page d'accueil : on enchaîne directement
  // sur le verdict, sans forcer un second envoi du formulaire.
  const autoLance = useRef(false);
  useEffect(() => {
    if (autoLance.current) return;
    const auto = searchParams.get("auto");
    const vol = searchParams.get("numeroVol");
    const date = searchParams.get("dateVol");
    if (auto === "1" && vol && date) {
      autoLance.current = true;
      lancerVerification({ numeroVol: vol, dateVol: date });
    }
  }, [searchParams, lancerVerification]);

  function verifier(e: React.FormEvent) {
    e.preventDefault();
    lancerVerification({ numeroVol, dateVol, preavis: preavisAnnulationJours });
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

  // Un dossier déclaratif est volontairement classé "à vérifier" plutôt
  // qu'éligible, mais il doit pouvoir aller jusqu'au mandat : c'est
  // précisément le cas des vols anciens, majoritaires en réclamation.
  const declaratifNonVerifie =
    reponse?.resultat?.motif === "REVIEW_DECLARATIF_NON_VERIFIE";
  const peutReclamer =
    reponse?.resultat?.statut === "ELIGIBLE" || declaratifNonVerifie;

  return (
    <main className="conteneur-etroit py-14 sm:py-20">
      <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
        Vérifiez votre indemnisation
      </h1>
      <p className="mt-3 text-[17px] leading-relaxed text-[var(--texte-attenue)]">
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
              max={AUJOURDHUI}
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
        <div className="carte entree-fade mt-6 flex flex-col items-center gap-4 p-10">
          <span className="pulsation h-10 w-10">
            <MagnifyingGlass size={20} className="text-[var(--color-accent-500)]" weight="bold" />
          </span>
          <p className="text-[15px] text-[var(--texte-attenue)]">
            Nous analysons votre vol...
          </p>
        </div>
      )}

      {erreur && (
        <div className="carte entree-fade mt-6 p-6 text-[15px]">{erreur}</div>
      )}

      {reponse?.code === "VOL_NON_VERIFIABLE" && !reponse.resultat && (
        <DeclarationVol
          message={reponse.message ?? ""}
          enCours={chargement}
          onSoumettre={(declaration) =>
            lancerVerification({ numeroVol, dateVol, declaration })
          }
        />
      )}

      {reponse?.resultat && Icone && (
        <div
          className="carte-embarquement mt-6 p-6 sm:p-7"
          key={reponse.resultat.motif + numeroVol}
        >
          <span
            className={`pilule entree-fade ${PILULE_PAR_STATUT[reponse.resultat.statut]}`}
          >
            <Icone size={15} weight="bold" />
            {LIBELLE_PAR_STATUT[reponse.resultat.statut]}
          </span>

          {peutReclamer &&
            reponse.vol &&
            reponse.resultat.montantEstime !== null && (
              <>
                <div className="souche entree-fade mt-5 pt-5" style={{ animationDelay: "60ms" }}>
                  <p className="text-5xl font-bold">
                    <MontantSplitFlap
                      montant={reponse.resultat.montantEstime}
                      devise={reponse.resultat.devise}
                    />
                  </p>
                </div>
                <p
                  className="entree-fade mt-4 text-[15px] leading-relaxed text-[var(--texte-attenue)]"
                  style={{ animationDelay: "260ms" }}
                >
                  {reponse.resultat.explication}
                </p>
                <div className="entree-fade" style={{ animationDelay: "290ms" }}>
                  <DelaiRestant
                    dateLimite={reponse.resultat.dateLimiteReclamation}
                    joursRestants={reponse.resultat.joursAvantPrescription}
                  />
                  <RepartitionMontant
                    montant={reponse.resultat.montantEstime}
                    devise={reponse.resultat.devise}
                  />
                </div>
                <PartagerVol
                  numeroVol={numeroVol}
                  dateVol={dateVol}
                  montant={reponse.resultat.montantEstime}
                  devise={reponse.resultat.devise}
                />
                <Link
                  style={{ animationDelay: "320ms" }}
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
                      // Les faits, pas le verdict : c'est le serveur qui
                      // recalculera l'éligibilité au moment de créer le dossier.
                      source: reponse.source ?? "DECLARATIF",
                      typePerturbation: reponse.faits?.typePerturbation ?? "",
                      retardArriveeMinutes:
                        reponse.faits?.retardArriveeMinutes ?? "",
                      preavisAnnulationJours:
                        reponse.faits?.preavisAnnulationJours ?? "",
                    },
                  }}
                  className="bouton bouton-primaire entree-fade mt-6 w-full"
                >
                  Lancer ma réclamation
                  <ArrowRight size={18} weight="bold" />
                </Link>
              </>
            )}

          {reponse.resultat.statut === "INELIGIBLE" && (
            <p
              className="entree-fade mt-4 text-[15px] leading-relaxed text-[var(--texte-attenue)]"
              style={{ animationDelay: "120ms" }}
            >
              {reponse.resultat.explication}
            </p>
          )}

          {reponse.resultat.statut === "WAITLIST" && !emailEnvoye && (
            <>
              <p
                className="entree-fade mt-4 text-[15px] leading-relaxed text-[var(--texte-attenue)]"
                style={{ animationDelay: "120ms" }}
              >
                {reponse.resultat.explication}
              </p>
              <form onSubmit={enregistrerWaitlist} className="mt-5 flex flex-col gap-3 sm:flex-row">
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
            <p className="mt-4 text-[15px] text-[var(--texte-attenue)]">
              Merci, nous vous préviendrons dès que ce dossier sera traité.
            </p>
          )}

          {reponse.resultat.statut === "REVIEW_MANUEL" &&
            !demandePreavis &&
            !declaratifNonVerifie && (
            <p
              className="entree-fade mt-4 text-[15px] leading-relaxed text-[var(--texte-attenue)]"
              style={{ animationDelay: "120ms" }}
            >
              {reponse.resultat.explication}
            </p>
          )}

          {demandePreavis && (
            <>
              <p
                className="entree-fade mt-4 text-[15px] leading-relaxed text-[var(--texte-attenue)]"
                style={{ animationDelay: "120ms" }}
              >
                Il nous manque une information : combien de jours avant le vol
                l&apos;annulation vous a-t-elle été annoncée ?
              </p>
              <form onSubmit={verifier} className="mt-5 flex flex-col gap-3 sm:flex-row">
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
