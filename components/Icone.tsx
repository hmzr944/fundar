/**
 * Jeu d'icônes maison, tracé dans la même géométrie que le logotype.
 *
 * Les bibliothèques génériques donnent à tous les sites la même main : on
 * reconnaît le jeu avant de reconnaître la marque. Ces dessins n'utilisent
 * que des cercles parfaits, des segments droits et un arc au maximum, avec
 * des terminaisons arrondies — exactement les primitives du mot « clearto ».
 *
 * Grille de 24, trait de 1.6. Le trait ne se met JAMAIS à l'échelle
 * (`vectorEffect`) : à 14px une icône dont le trait maigrit devient grise
 * et disparaît à côté du texte.
 */
export type NomIcone =
  | "recherche"
  | "signature"
  | "retour"
  | "cadenas"
  | "chevron"
  | "enveloppe"
  | "fleche"
  | "coche"
  | "horloge"
  | "partage"
  | "interdit"
  | "coche-cercle"
  | "document"
  | "envoi"
  | "sablier";

const TRACES: Record<NomIcone, React.ReactNode> = {
  // Loupe : un cercle, un manche. Rien de plus.
  recherche: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="M15.4 15.4 L21 21" />
    </>
  ),

  // Signature : le geste d'une main qui signe, posé sur sa ligne.
  signature: (
    <>
      <path d="M4 16.5 C7 7.5 10 6.5 11.5 11 C13 15.5 15.5 15 20 8.5" />
      <path d="M3 20.5 H21" />
    </>
  ),

  // L'argent qui revient : un cercle presque fermé, qui rentre.
  retour: (
    <>
      <path d="M20 12 A8 8 0 1 1 14.4 4.4" />
      <path d="M20 4.5 V12 H12.5" />
    </>
  ),

  cadenas: (
    <>
      <rect x="4.5" y="10.5" width="15" height="9.5" rx="2.5" />
      <path d="M8.25 10.5 V7.5 A3.75 3.75 0 0 1 15.75 7.5 V10.5" />
    </>
  ),

  chevron: <path d="M7 10 L12 15 L17 10" />,

  enveloppe: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3.8 7.2 L12 13.4 L20.2 7.2" />
    </>
  ),

  fleche: (
    <>
      <path d="M4 12 H19.5" />
      <path d="M13.5 6 L19.5 12 L13.5 18" />
    </>
  ),

  coche: <path d="M5 12.5 L10 17.5 L19.5 7" />,

  // Horloge : le cercle du o, deux aiguilles.
  horloge: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 6.75 V12 L15.75 14.25" />
    </>
  ),

  // Partage : trois points, deux liens. Un seul geste, comme le reste.
  partage: (
    <>
      <circle cx="17.5" cy="5.5" r="2.75" />
      <circle cx="6" cy="12" r="2.75" />
      <circle cx="17.5" cy="18.5" r="2.75" />
      <path d="M8.5 10.6 L15 7" />
      <path d="M8.5 13.4 L15 17" />
    </>
  ),

  // Interdit : le même cercle, barré.
  interdit: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M6.4 6.4 L17.6 17.6" />
    </>
  ),

  "coche-cercle": (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M8 12.2 L11 15.2 L16.2 9" />
    </>
  ),

  document: (
    <>
      <path d="M13.5 3.5 H6.5 A1.5 1.5 0 0 0 5 5 V19 A1.5 1.5 0 0 0 6.5 20.5 H17.5 A1.5 1.5 0 0 0 19 19 V9" />
      <path d="M13.5 3.5 V9 H19" />
    </>
  ),

  // Avion de papier : le pli, pas le fuselage.
  envoi: (
    <>
      <path d="M20.5 3.5 L3.5 10 L10.5 13.5 L20.5 3.5 Z" />
      <path d="M10.5 13.5 L14 20.5 L20.5 3.5" />
    </>
  ),

  sablier: (
    <>
      <path d="M7 3.5 H17" />
      <path d="M7 20.5 H17" />
      <path d="M7.5 3.5 V7.5 L12 12 L16.5 7.5 V3.5" />
      <path d="M7.5 20.5 V16.5 L12 12 L16.5 16.5 V20.5" />
    </>
  ),
};

export default function Icone({
  nom,
  taille = 20,
  className,
}: {
  nom: NomIcone;
  taille?: number;
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={taille}
      height={taille}
      fill="none"
      stroke="currentColor"
      strokeWidth="1.6"
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      aria-hidden="true"
      className={className}
    >
      {TRACES[nom]}
    </svg>
  );
}
