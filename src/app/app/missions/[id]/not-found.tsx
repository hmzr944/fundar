import { LinkButton } from "@/components/ui";

export default function MissionNotFound() {
  return (
    <div className="mx-auto max-w-md py-16 text-center">
      <h1 className="text-xl font-semibold">Mission introuvable</h1>
      <p className="mt-2 text-sm text-muted">Elle a peut-être été supprimée, ou elle ne vous appartient pas.</p>
      <LinkButton href="/app" className="mt-6">
        Retour au tableau de bord
      </LinkButton>
    </div>
  );
}
