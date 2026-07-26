/**
 * Balayage radar : motif signature utilisé pendant la vérification d'un
 * vol ("on scanne votre dossier"). Purement décoratif mais motivé par
 * l'action en cours ; respecte prefers-reduced-motion via CSS.
 */
export default function Radar({ size = 220 }: { size?: number }) {
  return (
    <div className="radar" style={{ width: size }} aria-hidden="true">
      <div className="radar__anneaux" />
      <div className="radar__balayage" />
      <span className="radar__point" style={{ top: "30%", left: "62%" }} />
      <span
        className="radar__point"
        style={{ top: "58%", left: "38%", animationDelay: "0.6s" }}
      />
      <span
        className="radar__point"
        style={{ top: "70%", left: "68%", animationDelay: "1.1s" }}
      />
    </div>
  );
}
