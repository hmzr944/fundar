import { NextRequest, NextResponse } from "next/server";
import { getFlightStatusProvider } from "@/lib/flight-status";
import { verifierEligibilite } from "@/lib/eligibility/engine";
import {
  ajusterSelonSource,
  codeCompagnieDepuisNumeroVol,
  type SourceVerification,
} from "@/lib/eligibility/verification";
import { DemandeVerification, TypePerturbation } from "@/lib/eligibility/types";

interface Declaration {
  aeroportDepart: string;
  aeroportArrivee: string;
  typePerturbation: TypePerturbation;
  retardArriveeMinutes?: number;
}

interface CorpsRequete {
  numeroVol?: string;
  dateVol?: string;
  preavisAnnulationJours?: number;
  motifDeclare?: string;
  reacheminement?: {
    departAvantHeuresPrevues: number;
    arriveeApresHeuresPrevues: number;
  };
  /** Renseignée par le passager quand l'API ne connaît pas le vol. */
  declaration?: Declaration;
}

export async function POST(request: NextRequest) {
  let body: CorpsRequete;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ erreur: "Requête invalide." }, { status: 400 });
  }

  const {
    numeroVol,
    dateVol,
    preavisAnnulationJours,
    motifDeclare,
    reacheminement,
    declaration,
  } = body;

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
    vol = null;
  }

  // Reconstruit avec des champs non nullables : le reste de la route peut
  // alors s'appuyer sur le typage plutôt que sur des assertions.
  const volResolu =
    vol && vol.trouve && vol.compagnie && vol.aeroportDepart && vol.aeroportArrivee
      ? {
          compagnie: vol.compagnie,
          aeroportDepart: vol.aeroportDepart,
          aeroportArrivee: vol.aeroportArrivee,
          statut: vol.statut,
          retardArriveeMinutes: vol.retardArriveeMinutes,
        }
      : null;

  // Le fournisseur ne connaît pas ce vol. Ce n'est presque jamais une faute
  // de frappe : les bases publiques ne remontent que quelques mois, alors
  // qu'une réclamation se prescrit en un à six ans. On bascule donc sur ce
  // que le passager peut affirmer, plutôt que de le renvoyer corriger un
  // numéro qui est probablement juste.
  if (!volResolu && !declaration) {
    return NextResponse.json({
      code: "VOL_NON_VERIFIABLE",
      message:
        "Nous n'avons pas pu retrouver ce vol automatiquement. Les bases " +
        "publiques ne conservent les vols que quelques mois — si le vôtre est " +
        "plus ancien, c'est normal. Décrivez ce qui s'est passé : nous " +
        "vérifierons sur vos justificatifs.",
    });
  }

  const source: SourceVerification = volResolu ? "AUTOMATIQUE" : "DECLARATIF";

  let compagnie: string;
  let aeroportDepart: string;
  let aeroportArrivee: string;
  let typePerturbation: TypePerturbation;
  let retardArriveeMinutes: number | undefined;

  if (volResolu) {
    compagnie = volResolu.compagnie;
    aeroportDepart = volResolu.aeroportDepart;
    aeroportArrivee = volResolu.aeroportArrivee;
    retardArriveeMinutes = volResolu.retardArriveeMinutes ?? undefined;

    typePerturbation = "AUCUNE";
    if (volResolu.statut === "ANNULE") {
      typePerturbation = "ANNULATION";
    } else if (retardArriveeMinutes !== undefined && retardArriveeMinutes >= 180) {
      typePerturbation = "RETARD";
    }
  } else {
    const decl = declaration!;
    const codeCompagnie = codeCompagnieDepuisNumeroVol(numeroVol);
    const depart = decl.aeroportDepart?.trim().toUpperCase();
    const arrivee = decl.aeroportArrivee?.trim().toUpperCase();

    if (!codeCompagnie || !depart || !arrivee) {
      return NextResponse.json(
        {
          erreur:
            "Il nous manque la compagnie ou les aéroports pour estimer votre dossier.",
        },
        { status: 400 }
      );
    }

    compagnie = codeCompagnie;
    aeroportDepart = depart;
    aeroportArrivee = arrivee;
    typePerturbation = decl.typePerturbation;
    retardArriveeMinutes = decl.retardArriveeMinutes;
  }

  const demande: DemandeVerification = {
    numeroVol,
    dateVol,
    aeroportDepart,
    aeroportArrivee,
    compagnie,
    typePerturbation,
    retardArriveeMinutes,
    preavisAnnulationJours,
    reacheminement,
    motifDeclare,
  };

  const resultat = ajusterSelonSource(verifierEligibilite(demande), source);

  return NextResponse.json({
    vol: {
      compagnie,
      aeroportDepart,
      aeroportArrivee,
      statut: volResolu?.statut ?? "INCONNU",
    },
    source,
    // Les faits sont renvoyés pour que /claim puisse les transmettre et que
    // le serveur recalcule le verdict au lieu de faire confiance à la page.
    faits: { typePerturbation, retardArriveeMinutes, preavisAnnulationJours },
    resultat,
  });
}
