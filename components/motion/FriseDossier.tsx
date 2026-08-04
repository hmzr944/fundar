"use client";

import { motion, useReducedMotion } from "framer-motion";
import EtapeTunnel, { type NomEtape } from "./EtapeTunnel";

/**
 * Frise d'avancement d'un dossier.
 *
 * Une réserve assumée sur la demande d'origine, qui parlait de « jauges de
 * progression fluides » : une jauge continue affirme qu'on sait où en est
 * le dossier en pourcentage. On ne le sait pas — une compagnie répond en
 * trois semaines ou en cinq mois, et rien ne permet d'annoncer « 60 % ».
 *
 * La barre mesure donc des ÉTAPES FRANCHIES, discrètes et vérifiables.
 * C'est la seule progression qu'on puisse montrer sans inventer une
 * information rassurante, ce que ce produit s'interdit partout ailleurs.
 */
const ETAPES: { cle: NomEtape; libelle: string }[] = [
  { cle: "vol", libelle: "Vol vérifié" },
  { cle: "preuve", libelle: "Justificatif reçu" },
  { cle: "mandat", libelle: "Réclamation transmise" },
  { cle: "indemnite", libelle: "Indemnité reçue" },
];

export function etapeDuDossier(dossier: {
  statut_dossier: string;
  reclamation_envoyee_le: string | null;
  montant_recupere: number | null;
}): number {
  if (dossier.statut_dossier === "PAYE" || dossier.montant_recupere !== null) return 3;
  if (dossier.reclamation_envoyee_le) return 2;
  // Un dossier n'existe pas sans justificatif : la deuxième étape est
  // franchie dès sa création.
  return 1;
}

export default function FriseDossier({
  etapeCourante,
  refuse = false,
}: {
  etapeCourante: number;
  /** Un dossier refusé s'arrête : la frise ne doit pas continuer d'avancer. */
  refuse?: boolean;
}) {
  const reduit = useReducedMotion();
  const progression = refuse
    ? (etapeCourante + 1) / ETAPES.length
    : Math.min(Math.max(etapeCourante + 1, 0), ETAPES.length) / ETAPES.length;

  return (
    <div className="mt-5 border-t border-[var(--bordure)] pt-5">
      <div className="h-1.5 overflow-hidden rounded-full bg-[var(--bg-eleve-2)]">
        <motion.div
          className={`h-full rounded-full ${
            refuse ? "bg-[var(--texte-attenue)]" : "bg-[var(--color-accent-500)]"
          }`}
          initial={reduit ? false : { scaleX: 0 }}
          animate={{ scaleX: progression }}
          style={{ transformOrigin: "left" }}
          transition={{ duration: 0.9, ease: [0.23, 1, 0.32, 1] }}
        />
      </div>

      <ol className="mt-5 flex items-start justify-between gap-2">
        {ETAPES.map((e, i) => {
          // Un refus n'efface pas le passé : le vol a bien été vérifié et le
          // justificatif bien reçu. Ces étapes restent marquées comme
          // franchies, en neutre plutôt qu'en corail, parce qu'elles se sont
          // réellement produites — seule la suite ne viendra pas.
          const franchie = i <= etapeCourante;
          return (
            <li
              key={e.cle}
              className="flex flex-1 flex-col items-center gap-2 text-center"
            >
              <span
                className={
                  !franchie
                    ? "text-[var(--texte-attenue)]"
                    : refuse
                      ? "text-[var(--texte)]"
                      : "text-[var(--color-accent-500)]"
                }
              >
                <EtapeTunnel etape={e.cle} actif={franchie} taille={30} />
              </span>
              <span
                className={`text-[11px] leading-tight sm:text-[12px] ${
                  franchie
                    ? "font-semibold text-[var(--texte)]"
                    : "text-[var(--texte-attenue)]"
                }`}
              >
                {e.libelle}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}
