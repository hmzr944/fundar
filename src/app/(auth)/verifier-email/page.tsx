import type { Metadata } from "next";
import { getDb } from "@/db";
import { LinkButton } from "@/components/ui";
import { currentUser } from "@/lib/http";
import { verifyEmail } from "@/server/account-links";
import { AuthShell } from "../auth-shell";

export const metadata: Metadata = { title: "Vérification de l'adresse" };
export const dynamic = "force-dynamic";

export default async function Page({ searchParams }: { searchParams: Promise<{ jeton?: string }> }) {
  const { jeton } = await searchParams;
  const verified = jeton ? await verifyEmail(getDb(), jeton) : null;
  // A link scanner may have opened the link first: an already verified account still gets the good news.
  const user = verified ?? (await currentUser());
  const ok = Boolean(verified ?? user?.emailVerifiedAt);
  const next = user ? { href: "/app", label: "Ouvrir mon espace" } : { href: "/login", label: "Se connecter" };

  return (
    <AuthShell tagline={ok ? "Tout est en ordre." : "Encore une petite étape."}>
      <div className="msg-in" role="status">
        <h1 className="font-display text-2xl font-semibold">{ok ? "Adresse confirmée" : "Ce lien n'est plus valable"}</h1>
        <p className="mt-3 text-sm text-muted">
          {ok
            ? "Vous recevrez désormais par e-mail les nouvelles de vos dossiers : courrier prêt, réponse attendue, relance."
            : "Il a peut-être expiré (48 heures) ou déjà servi. Depuis votre espace, vous pouvez en recevoir un nouveau."}
        </p>
        <LinkButton href={next.href} variant="primary" className="mt-8 w-full py-2.5">
          {next.label}
        </LinkButton>
      </div>
    </AuthShell>
  );
}
