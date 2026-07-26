import { NextRequest, NextResponse } from "next/server";
import { getFlightStatusProvider } from "@/lib/flight-status";
import { verifierEligibilite } from "@/lib/eligibility/engine";
import { DemandeVerification, TypePerturbation } from "@/lib/eligibility/types";

interface CorpsRequete {
  numeroVol?: string;
  dateVol?: string;
  preavisAnnulationJours?: number;
  motifDeclare?: string;
  reacheminement?: {
    departAvantHeuresPrevues: number;
    arriveeApresHeuresPrevues: number;
  };
}

export async function POST(request: NextRequest) {
  let body: CorpsRequete;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  }

  const { numeroVol, dateVol, preavisAnnulationJours, motifDeclare, reacheminement } = body;

  if (!numeroVol || !dateVol) {
    return NextResponse.json(
      { erreur: "Le numéro de vol et la date sont requis." },
      { status: 400 }
    );
  }

  const provider = getFlightStatusProvider();
  let vol;
  try {
    vol = await provider.recupererStatut({ numeroVol, dateVol });
  } catch {
    return NextResponse.json(
      { erreur: "Le statut de ce vol est momentanément indisponible. Réessayez." },
      { status: 502 }
    );
  }

  if (!vol.trouve || !vol.compagnie || !vol.aeroportDepart || !vol.aeroportArrivee) {
    return NextResponse.json(
      { erreur: "Vol introuvable. Vérifiez le numéro de vol et la date." },
      { status: 404 }
    );
  }

  let typePerturbation: TypePerturbation = "AUCUNE";
  if (vol.statut === "ANNULE") {
    typePerturbation = "ANNULATION";
  } else if (vol.retardArriveeMinutes !== null && vol.retardArriveeMinutes >= 180) {
    typePerturbation = "RETARD";
  }

  const demande: DemandeVerification = {
    numeroVol,
    dateVol,
    aeroportDepart: vol.aeroportDepart,
    aeroportArrivee: vol.aeroportArrivee,
    compagnie: vol.compagnie,
    typePerturbation,
    retardArriveeMinutes: vol.retardArriveeMinutes ?? undefined,
    preavisAnnulationJours,
    reacheminement,
    motifDeclare,
  };

  const resultat = verifierEligibilite(demande);

  return NextResponse.json({
    vol: {
      compagnie: vol.compagnie,
      aeroportDepart: vol.aeroportDepart,
      aeroportArrivee: vol.aeroportArrivee,
      statut: vol.statut,
    },
    resultat,
  });
}
