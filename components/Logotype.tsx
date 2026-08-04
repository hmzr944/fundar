/**
 * Logotype « volia », tracé et non composé.
 *
 * Le mot est construit au compas et à la règle : cercles parfaits pour le o
 * et le ventre du a, segments à épaisseur constante ailleurs, terminaisons
 * arrondies partout. Aucune police n'intervient, donc le mot est identique
 * sur toutes les machines et se redimensionne sans se recomposer.
 *
 * La seule lettre dessinée est la première : le bras droit du v ne redescend
 * pas sur la hauteur d'x, il s'incurve et grimpe. Le mot décolle sur sa
 * première lettre, et le o vient se glisser sous cette aile — c'est cet
 * emboîtement qui fait tenir l'ensemble plutôt qu'un simple v surdimensionné.
 *
 * Le v reste un v : sa branche gauche et son sommet sont intacts, seule la
 * sortie change. Une tentative précédente modifiait le a final de la même
 * manière ; le mot se lisait « volid ». Une lettre qu'on déforme cesse
 * d'être une lettre, et la première est la seule qui supporte ce geste.
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
  const RATIO = 186 / 66;

  return (
    <svg
      viewBox="0 0 186 66"
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
        {/* v — descente franche, puis l'aile s'incurve et monte */}
        <path d="M7 20 L20 60 C28 44 34 24 49 9" />

        {/* o — cercle parfait, glissé sous l'aile */}
        <circle cx="72" cy="40" r="18" />

        {/* l — hampe pleine hauteur */}
        <path d="M104 6 L104 60" />

        {/* i — fût sur la hauteur d'x */}
        <path d="M122 20 L122 60" />

        {/* a — ventre circulaire et fût arrêté net sur la hauteur d'x */}
        <circle cx="156" cy="40" r="18" />
        <path d="M174 20 L174 60" />
      </g>

      {/* Point du i : un cercle plein plutôt qu'un segment nul, que certains
          moteurs de rendu escamotent. */}
      <circle cx="122" cy="8" r="4.5" fill="currentColor" />
    </svg>
  );
}
