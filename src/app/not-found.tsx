import { Ambient, CtaLink, TextLink } from "@/components/ui";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-dvh max-w-xl flex-col items-start justify-center px-4 py-24">
      <Ambient />
      <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">Page introuvable</h1>
      <p className="mt-4 text-muted">Le lien est peut-être ancien, ou l&apos;adresse mal recopiée. Vos dossiers, eux, n&apos;ont pas bougé.</p>
      <div className="mt-8 flex flex-wrap items-center gap-6">
        <CtaLink href="/">Retour à l&apos;accueil</CtaLink>
        <TextLink href="/faq" className="text-sm">
          Questions fréquentes
        </TextLink>
      </div>
    </div>
  );
}
