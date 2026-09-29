import type { Metadata } from "next";
import Link from "next/link";
import { ContactForm } from "@/components/site/contact-form";
import { currentUser } from "@/lib/http";
import { legalIdentity } from "@/server/billing/stripe";
import { CONTACT_TOPICS } from "@/server/contact";

export const metadata: Metadata = {
  title: "Contact",
  description: "Une question sur Nimbrel, un dossier ou un paiement : écrivez-nous.",
};

export default async function Contact() {
  const user = await currentUser();
  const inbox = legalIdentity().email;

  return (
    <div className="grid gap-6 lg:grid-cols-12">
      <div className="lg:col-span-5">
        <h1 className="font-display text-5xl font-bold leading-[1.02] tracking-[-0.035em] sm:text-6xl">
          <span className="line-mask">
            <span>Écrivez-nous.</span>
          </span>
        </h1>
        <p className="hero-in mt-6 max-w-sm text-lg text-muted" style={{ ["--reveal-delay" as string]: "250ms" }}>
          Une question sur le service, un dossier ou un paiement : nous répondons par e-mail.
        </p>

        {/* Two tiles: where else to look, and the direct address. */}
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
          <Link href="/faq" className="glass-ink tile-in shine group block rounded-3xl p-6" style={{ ["--i" as string]: 2 }}>
            <p className="font-display text-xl font-bold">Réponse immédiate ?</p>
            <p className="mt-1 text-sm text-elev/80">Les questions les plus courantes ont déjà leur réponse.</p>
            <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium">
              Questions fréquentes
              <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                →
              </span>
            </span>
          </Link>
          {user ? (
            <Link href="/app" className="tile-in shine group block rounded-3xl bg-accent p-6 text-accent-contrast" style={{ ["--i" as string]: 3 }}>
              <p className="font-display text-xl font-bold">Une question sur un dossier ?</p>
              <p className="mt-1 text-sm opacity-85">Posez-la directement à Atlas, dans le dossier : il connaît déjà tout le contexte.</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-medium">
                Mes dossiers
                <span aria-hidden className="transition-transform duration-300 group-hover:translate-x-1">
                  →
                </span>
              </span>
            </Link>
          ) : (
            inbox && (
              <div className="tile-in rounded-3xl bg-accent p-6 text-accent-contrast" style={{ ["--i" as string]: 3 }}>
                <p className="font-display text-xl font-bold">Par e-mail</p>
                <a href={`mailto:${inbox}`} className="mt-2 inline-block break-all text-sm font-medium underline underline-offset-4 hover:no-underline">
                  {inbox}
                </a>
              </div>
            )
          )}
        </div>
      </div>

      <section aria-label="Formulaire de contact" className="glass tile-in relative rounded-3xl p-6 sm:p-8 lg:col-span-7 lg:p-10" style={{ ["--i" as string]: 1 }}>
        <ContactForm topics={CONTACT_TOPICS} defaultEmail={user?.email} fallbackEmail={inbox} />
      </section>
    </div>
  );
}
