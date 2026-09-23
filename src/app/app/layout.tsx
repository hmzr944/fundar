import { redirect } from "next/navigation";
import { AppNav } from "@/components/app-nav";
import { currentUser } from "@/lib/http";
import { integrationStatus } from "@/server/deps";

export const dynamic = "force-dynamic";

export default async function AppLayout({ children }: { children: React.ReactNode }) {
  // Authoritative check (the proxy only does an optimistic cookie check).
  const user = await currentUser();
  if (!user) redirect("/login");
  const integrations = integrationStatus();
  return (
    <div className="min-h-dvh">
      <AppNav email={user.email} />
      {!integrations.llm.available && (
        <div role="status" className="border-b border-warning/30 bg-warning/5 px-4 py-2 text-center text-sm text-warning">
          Aucun modèle de langage n&apos;est configuré : Atlas ne peut ni analyser ni exécuter de mission. Voir Paramètres.
        </div>
      )}
      {integrations.llm.available && integrations.llm.testDouble && (
        <div role="status" className="border-b border-violet/30 bg-violet/5 px-4 py-2 text-center text-sm text-violet">
          Mode test : les réponses d&apos;Atlas sont produites par un script, pas par un modèle de langage.
        </div>
      )}
      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
    </div>
  );
}
