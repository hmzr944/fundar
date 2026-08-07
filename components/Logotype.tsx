/**
 * Logotype « clearto », tracé et non composé.
 *
 * Construit au compas et à la règle : anneaux ouverts à 45° pour le c et le
 * e, cercles vrais pour le ventre du a et le o, segments à épaisseur
 * constante ailleurs, terminaisons arrondies partout. Aucune police
 * n'intervient, donc le mot est identique sur toutes les machines et se
 * redimensionne sans se recomposer.
 *
 * Trois corrections sur la version précédente, qui se lisait « brouillon » :
 *
 * 1. Le trait passe de 9 à 7,5 pour une hauteur d'x de 38 — de 22 % à 20 %.
 *    Au-delà, les contreformes du e et du a se bouchent et le mot devient
 *    une tache avant d'être un mot.
 * 2. L'espacement n'est plus mécanique. Une ronde suivie d'une ronde demande
 *    plus d'air qu'une hampe suivie d'une ronde : les blancs sont réglés à
 *    l'œil (8 après le c, 9,5 après le l, 10,5 entre le e et le a) et non
 *    au décimètre. C'est la cause principale de l'effet désordonné.
 * 3. La barre du t monte vers la droite et pointe vers le o. C'est le seul
 *    écart au tracé géométrique, et il est volontaire : « cleared to » est
 *    l'autorisation de la tour de contrôle, la barre est la trajectoire de
 *    montée, et le o qu'elle vise ferme le mot.
 *
 * Une barre inclinée reste une barre : le squelette de la lettre est
 * intact. C'est précisément ce qui manquait aux quatre gestes tentés sur le
 * logotype précédent, qui déformaient des lettres et donnaient des mots
 * illisibles — « volid », « v dia », « vofia ».
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
  const RATIO = 319 / 76;

  return (
    <svg
      viewBox="0 0 319 76"
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
        strokeWidth="7.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {/* c — anneau ouvert à 45° de part et d'autre */}
        <path d="M40.4 31.6 A19 19 0 1 0 40.4 58.4" />

        {/* l — hampe pleine hauteur */}
        <path d="M56 12 L56 64" />

        {/* e — barre médiane, puis l'anneau ouvert en bas à droite */}
        <path d="M73 45 L111 45" />
        <path d="M111 45 A19 19 0 1 0 105.4 58.4" />

        {/* a — ventre circulaire et fût arrêté net sur la hauteur d'x */}
        <circle cx="148" cy="45" r="19" />
        <path d="M167 26 L167 64" />

        {/* r — fût et épaule amorcée, sans retomber */}
        <path d="M184 26 L184 64" />
        <path d="M184 38 C184 29 192 24 200 26" />

        {/* t — hampe montante, pied incurvé */}
        <path d="M232 12 L232 57 C232 62 236 65 244 64" />

        {/* la barre monte et vise le o : la trajectoire de montée */}
        <path d="M217 26 L254 21" />

        {/* o — cercle parfait, qui referme le mot comme il l'a ouvert */}
        <circle cx="292" cy="45" r="19" />
      </g>
    </svg>
  );
}
