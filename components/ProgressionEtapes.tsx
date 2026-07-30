interface ProgressionEtapesProps {
  etapeActuelle: number;
  labels: string[];
}

/** Barre de progression + libellés, pour un parcours multi-étapes lisible. */
export default function ProgressionEtapes({ etapeActuelle, labels }: ProgressionEtapesProps) {
  return (
    <div className="mb-6">
      <div className="flex h-1.5 gap-1.5">
        {labels.map((label, index) => (
          <div
            key={label}
            className="h-full flex-1 rounded-full transition-colors duration-300"
            style={{
              background:
                index <= etapeActuelle ? "var(--color-accent-500)" : "var(--bordure)",
            }}
          />
        ))}
      </div>
      <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-[var(--texte-attenue)]">
        Étape {etapeActuelle + 1} sur {labels.length} · {labels[etapeActuelle]}
      </p>
    </div>
  );
}
