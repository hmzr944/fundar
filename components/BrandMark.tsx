/**
 * Marque Refund Radar.
 *
 * Un seul trait continu : une boucle qui se dénoue puis s'élance en montée,
 * comme une trajectoire de vol qui revient. La boucle raconte le produit
 * (l'argent qui revient au passager), la montée raconte l'aviation.
 *
 * Le geste est volontairement fait d'une seule ligne, terminaisons arrondies,
 * sans aucun détail : il doit rester lisible en favicon 16px, ce qui a été
 * vérifié à 96 / 48 / 32 / 24 / 16 px. La contreforme de la boucle est
 * délibérément large — resserrée, elle se bouche en dessous de 24px.
 */
export default function BrandMark({ size = 32 }: { size?: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 100 100"
      fill="none"
      aria-hidden="true"
    >
      <rect width="100" height="100" rx="28" fill="var(--color-accent-500)" />
      <path
        d="M28 80 C13 71 17 49 34 48 C48 47 51 62 39 65 L81 25 L61 75"
        stroke="#ffffff"
        strokeWidth="10"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
