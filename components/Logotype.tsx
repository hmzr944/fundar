/**
 * Logotype « clearto », tracé et non composé.
 *
 * Le mot est construit au compas et à la règle : cercles parfaits pour le c,
 * le e, le ventre du a et le o, segments à épaisseur constante ailleurs,
 * terminaisons arrondies partout. Aucune police n'intervient, donc le mot est
 * identique sur toutes les machines et se redimensionne sans se recomposer.
 *
 * Aucune lettre n'est déformée, et c'est délibéré. Quatre gestes ont été
 * tentés sur le logotype précédent — un a relevé, un o transformé en boucle,
 * un l incurvé, une traînée pointillée. Les trois premiers ont produit un mot
 * qu'on ne lisait plus (« volid », « v dia », « vofia »), le quatrième était
 * invisible en dessous de trente pixels. Une lettre qu'on décore cesse d'être
 * une lettre. L'identité tient ici à la construction géométrique et à la
 * régularité du rythme, pas à un accident greffé sur une lettre.
 *
 * Seul le pied du t s'incurve vers la droite : ce n'est pas un ornement mais
 * un trait typographique standard, que l'œil lit comme un t et non comme une
 * bizarrerie.
 *
 * Le tracé hérite de currentColor : posé sur un aplat corail il devient
 * blanc sans qu'on ait à prévoir une seconde version.
 */
export default function Logotype({
  hauteur = 22,
  className,
  titre = "Clearto",
}: {
  /** Hauteur de rendu en pixels. La largeur suit le ratio du tracé. */
  hauteur?: number;
  className?: string;
  /** Passer null quand le mot est déjà lu par un texte adjacent. */
  titre?: string | null;
}) {
  const RATIO = 303 / 66;

  return (
    <svg
      viewBox="0 0 303 66"
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
        {/* c — anneau ouvert sur la droite, à 45° de part et d'autre */}
        <path d="M41.7 27.3 A18 18 0 1 0 41.7 52.7" />

        {/* l — hampe pleine hauteur */}
        <path d="M58 6 L58 60" />

        {/* e — barre médiane, puis l'anneau ouvert en bas à droite */}
        <path d="M74 40 L110 40" />
        <path d="M110 40 A18 18 0 1 0 104.7 52.7" />

        {/* a — ventre circulaire et fût arrêté net sur la hauteur d'x */}
        <circle cx="144" cy="40" r="18" />
        <path d="M162 20 L162 60" />

        {/* r — fût et épaule amorcée, sans retomber */}
        <path d="M178 20 L178 60" />
        <path d="M178 32 C178 23 186 18 194 20" />

        {/* t — hampe montante, pied incurvé, barre sur la hauteur d'x */}
        <path d="M222 6 L222 51 C222 58 227 61 234 60" />
        <path d="M209 20 L239 20" />

        {/* o — cercle parfait, qui referme le mot comme il l'a ouvert */}
        <circle cx="274" cy="40" r="18" />
      </g>
    </svg>
  );
}
