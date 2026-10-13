import type { Metadata } from "next";
import { Diagnostic } from "@/components/site/diagnostic";

export const metadata: Metadata = {
  title: "Diagnostic gratuit",
  description: "Retenues de garantie, intérêts des marchés publics, sous-traitance, factures de chantier : ce que vous pouvez réclamer, et avant quelle date.",
};

export default async function DiagnosticPage({ searchParams }: { searchParams: Promise<{ reception?: string; montant?: string }> }) {
  const sp = await searchParams;
  const valid = (s?: string) => (s && /^\d{4}-\d{2}-\d{2}$/.test(s) ? s : undefined);
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-10">
      <header className="max-w-3xl">
        <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-[-0.035em] sm:text-6xl">
          <span className="line-mask">
            <span>Ce que vos chantiers</span>
          </span>{" "}
          <span className="line-mask">
            <span style={{ ["--reveal-delay" as string]: "90ms" }}>vous doivent encore.</span>
          </span>
        </h1>
        <p className="hero-in mt-6 max-w-xl text-lg text-muted" style={{ ["--reveal-delay" as string]: "300ms" }}>
          Ajoutez vos chantiers et vos factures : le bilan se calcule à mesure, avec la date à laquelle chaque somme peut être réclamée.
        </p>
      </header>
      <Diagnostic initialReception={valid(sp.reception)} initialWorks={sp.montant?.slice(0, 12)} today={today} />
    </div>
  );
}
