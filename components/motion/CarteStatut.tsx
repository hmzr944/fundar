"use client";

import { motion, useReducedMotion } from "framer-motion";
import EtapeTunnel, { type NomEtape } from "./EtapeTunnel";

/**
 * Carte de suivi d'un dossier, avec sa progression.
 *
 * Une réserve sur le brief, qui demandait « des jauges de progression
 * fluides » : une jauge suggère qu'on sait où l'on en est en pourcentage.
 * Ici on ne le sait pas — une compagnie répond en trois semaines ou en
 * cinq mois, et rien ne permet de dire qu'un dossier est « à 60 % ».
 *
 * La barre ne mesure donc pas le temps mais les ÉTAPES FRANCHIES, qui sont
 * discrètes et vérifiables. Afficher une progression continue serait la
 * seule chose que ce produit s'interdit : inventer une information
 * rassurante.
 */
export const ETAPES_DOSSIER: { cle: NomEtape; libelle: string }[] = [
  { cle: "vol", libelle: "Vol vérifié" },
  { cle: "preuve", libelle: "Justificatif reçu" },
  { cle: "mandat", libelle: "Réclamation transmise" },
  { cle: "indemnite", libelle: "Indemnité reçue" },
];

export default function CarteStatut({
  etapeCourante,
  montant,
  devise = "EUR",
  refuse = false,
}: {
  /** Index dans ETAPES_DOSSIER, 0 = première étape franchie. */
  etapeCourante: number;
  montant?: number | null;
  devise?: string;
  /** Un dossier refusé s'arrête : la barre ne doit pas continuer d'avancer. */
  refuse?: boolean;
}) {
  const reduit = useReducedMotion();
  const total = ETAPES_DOSSIER.length;
  const progression = Math.min(Math.max(etapeCourante + 1, 0), total) / total;

  return (
    <div className="carte overflow-hidden p-6">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="etiquette">
            {refuse ? "Dossier clos" : "Votre dossier avance"}
          </p>
          <p className="titre mt-1 text-[1.5rem] leading-tight">
            {ETAPES_DOSSIER[Math.min(etapeCourante, total - 1)]?.libelle}
          </p>
        </div>

        {montant != null && (
          // Le montant apparaît en montant légèrement : c'est la seule
          // information que le client cherche vraiment sur cette carte.
          <motion.span
            initial={reduit ? false : { opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, ease: [0.23, 1, 0.32, 1] }}
            className="chiffres rounded-[var(--radius-pilule)] bg-[var(--color-succes-50)] px-3 py-1.5 text-[15px] font-bold text-[var(--color-succes-600)]"
          >
            {montant} {devise}
          </motion.span>
        )}
      </div>

      {/* Barre d'étapes franchies, jamais de pourcentage de temps. */}
      <div className="mt-5 h-1.5 overflow-hidden rounded-full bg-[var(--bg-eleve-2)]">
        <motion.div
          className={`h-full rounded-full ${
            refuse ? "bg-[var(--texte-attenue)]" : "bg-[var(--color-accent-500)]"
          }`}
          initial={reduit ? false : { scaleX: 0 }}
          animate={{ scaleX: progression }}
          style={{ transformOrigin: "left" }}
          transition={{ duration: 0.8, ease: [0.23, 1, 0.32, 1] }}
        />
      </div>

      <ol className="mt-6 flex items-start justify-between gap-2">
        {ETAPES_DOSSIER.map((e, i) => {
          const franchie = i <= etapeCourante && !refuse;
          return (
            <li
              key={e.cle}
              className="flex flex-1 flex-col items-center gap-2 text-center"
            >
              <span
                className={
                  franchie
                    ? "text-[var(--color-accent-500)]"
                    : "text-[var(--texte-attenue)]"
                }
              >
                <EtapeTunnel etape={e.cle} actif={franchie} taille={34} />
              </span>
              <span
                className={`text-[12px] leading-tight ${
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
