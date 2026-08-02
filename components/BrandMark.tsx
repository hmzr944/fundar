/**
 * Marque : un seul trait continu, sans cadre.
 *
 * Une boucle qui se dénoue puis s'élance en montée. La boucle raconte le
 * produit (l'argent qui revient au passager), la montée raconte l'envol.
 * Terminaisons arrondies, aucun détail intérieur.
 *
 * Le viewBox est calé au plus près de l'encre (et non sur un carré de 100)
 * : sans la pastille pleine derrière, le trait doit occuper toute la boîte,
 * sinon la marque paraît flotter et perd du poids à côté du mot.
 *
 * Le trait prend la couleur d'accent par défaut, mais `couleur="courant"`
 * le fait hériter de la couleur du texte environnant — nécessaire pour
 * poser la marque sur un aplat corail (bouton, carte pleine) où le corail
 * sur corail disparaîtrait.
 */
export default function BrandMark({
  size = 32,
  couleur = "accent",
}: {
  size?: number;
  couleur?: "accent" | "courant";
}) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="10 14.5 76 76"
      fill="none"
      aria-hidden="true"
    >
      <path
        d="M28 80 C13 71 17 49 34 48 C48 47 51 62 39 65 L81 25 L61 75"
        stroke={couleur === "courant" ? "currentColor" : "var(--color-accent-500)"}
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
