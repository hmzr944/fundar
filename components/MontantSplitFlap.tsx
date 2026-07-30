/**
 * Affiche un montant en défilement mécanique façon panneau d'aéroport
 * (split-flap). Chaque caractère "atterrit" avec un léger décalage.
 * La clé côté appelant doit changer avec la valeur pour rejouer l'animation.
 */
export default function MontantSplitFlap({
  montant,
  devise,
}: {
  montant: number;
  devise: string;
}) {
  const caracteres = String(montant).split("");

  return (
    <span className="split-flap mono" aria-label={`${montant} ${devise}`}>
      {caracteres.map((c, i) => (
        <span
          key={i}
          className="split-flap__tuile"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          {c}
        </span>
      ))}
      <span
        className="split-flap__tuile"
        style={{ animationDelay: `${caracteres.length * 50}ms` }}
      >
        &nbsp;{devise}
      </span>
    </span>
  );
}
