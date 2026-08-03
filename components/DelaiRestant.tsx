import { Clock } from "@phosphor-icons/react/dist/ssr";

/** Un an : au-delà, rappeler l'échéance relève de la pression inutile. */
const SEUIL_URGENCE_JOURS = 365;

function formater(iso: string): string {
  return new Date(`${iso}T00:00:00Z`).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });
}

/**
 * Échéance de prescription du dossier.
 *
 * La seule urgence honnête du produit : elle n'est pas fabriquée, elle est
 * dans la loi, et le passager ne la trouve nulle part ailleurs. Elle n'est
 * affichée qu'en deçà d'un an — au-delà, agiter une échéance à quatre ans
 * serait de la pression sans objet, et abîmerait la confiance qu'on essaie
 * précisément de construire.
 */
export default function DelaiRestant({
  dateLimite,
  joursRestants,
}: {
  dateLimite?: string;
  joursRestants?: number;
}) {
  if (!dateLimite || joursRestants === undefined || joursRestants < 0) {
    return null;
  }

  const urgent = joursRestants <= SEUIL_URGENCE_JOURS;
  const mois = Math.floor(joursRestants / 30);

  return (
    <p
      className={`mt-4 flex items-start gap-2 text-[13px] leading-relaxed ${
        urgent ? "text-[var(--color-accent-600)]" : "text-[var(--texte-attenue)]"
      }`}
    >
      <Clock size={15} weight="bold" className="mt-0.5 shrink-0" />
      <span>
        {urgent ? (
          <>
            Il vous reste{" "}
            <strong>
              {mois >= 2 ? `${mois} mois` : `${joursRestants} jours`}
            </strong>{" "}
            pour réclamer : au-delà du {formater(dateLimite)}, ce droit
            s&apos;éteint définitivement.
          </>
        ) : (
          <>Vous avez jusqu&apos;au {formater(dateLimite)} pour réclamer.</>
        )}
      </span>
    </p>
  );
}
