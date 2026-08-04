/**
 * Logotype « volia », tracé et non composé.
 *
 * Le mot est construit au compas et à la règle : un cercle parfait pour le
 * o et le ventre du a, des segments à épaisseur constante pour le reste,
 * terminaisons arrondies partout. Aucune police n'intervient, donc le mot
 * reste identique sur toutes les machines et se redimensionne sans jamais
 * se recomposer.
 *
 * Un seul écart à la géométrie pure : la hampe du a final monte au-dessus
 * de la hauteur d'x. C'est le seul détail « dessiné » du mot, et il dit
 * l'envol — le mot décolle sur sa dernière lettre.
 *
 * Le tracé hérite de currentColor : posé sur un aplat corail il devient
 * blanc sans qu'on ait à prévoir une seconde version.
 */
export default function Logotype({
  hauteur = 22,
  className,
  titre = "Volia",
}: {
  /** Hauteur de rendu en pixels. La largeur suit le ratio du tracé. */
  hauteur?: number;
  className?: string;
  /** Passer null quand le mot est déjà lu par un texte adjacent. */
  titre?: string | null;
}) {
  const RATIO = 178 / 66;

  return (
    <svg
      viewBox="0 0 178 66"
      height={hauteur}
      width={hauteur * RATIO}
      fill="none"
      className={className}
      role={titre ? "img" : "presentation"}
      aria-label={titre ?? undefined}
      aria-hidden={titre ? undefined : true}
    >
      <g
        stroke="currentColor"
        strokeWidth="9"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* v — deux segments, sommet posé sur la ligne de base */}
        <path d="M7 20 L20 60 L33 20" />

        {/* o — cercle parfait */}
        <circle cx="68" cy="40" r="18" />

        {/* l — hampe pleine hauteur */}
        <path d="M100 6 L100 60" />

        {/* i — fût sur la hauteur d'x */}
        <path d="M118 20 L118 60" />

        {/* a — ventre circulaire et fût arrêté net sur la hauteur d'x.
            Une première version faisait monter ce fût au-dessus, pour
            évoquer l'envol : le mot se lisait « volid ». Un détail qui
            change la lettre n'est pas un détail. */}
        <circle cx="152" cy="40" r="18" />
        <path d="M170 20 L170 60" />
      </g>

      {/* Point du i : un cercle plein plutôt qu'un segment nul, que
          certains moteurs de rendu escamotent. */}
      <circle cx="118" cy="8" r="4.5" fill="currentColor" />
    </svg>
  );
}
