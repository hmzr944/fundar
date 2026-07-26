import Link from "next/link";

export default function HomePage() {
  return (
    <main className="page">
      <h1>Vol retardé, annulé, ou surbooké ?</h1>
      <p>
        Vérifiez en moins de 60 secondes si vous avez droit à une
        indemnisation de 250 € à 600 € au titre d&apos;EU261 ou UK261. Nous
        gérons la réclamation à votre place, sans frais si nous ne récupérons
        rien.
      </p>
      <Link href="/check">
        <button type="button">Vérifier mon vol</button>
      </Link>
    </main>
  );
}
