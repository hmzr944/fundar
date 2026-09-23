import { LinkButton } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-md px-4 py-24 text-center">
      <h1 className="text-xl font-semibold">Page introuvable</h1>
      <LinkButton href="/" className="mt-6">
        Retour à l&apos;accueil
      </LinkButton>
    </div>
  );
}
