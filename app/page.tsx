import Link from "next/link";
import {
  AirplaneTilt,
  PenNib,
  Wallet,
  ShieldCheck,
  LockKey,
  EnvelopeSimple,
} from "@phosphor-icons/react/dist/ssr";
import BrandMark from "@/components/BrandMark";
import Radar from "@/components/Radar";
import MontantSplitFlap from "@/components/MontantSplitFlap";

const ETAPES = [
  {
    icone: AirplaneTilt,
    titre: "Vérifiez votre vol",
    description:
      "Numéro de vol et date : le verdict d'éligibilité tombe en moins d'une minute, sans créer de compte.",
  },
  {
    icone: PenNib,
    titre: "Signez votre mandat",
    description:
      "Identité, carte d'embarquement, signature à l'écran. Cinq minutes, depuis votre téléphone.",
  },
  {
    icone: Wallet,
    titre: "On récupère votre argent",
    description:
      "Nous portons la réclamation face à la compagnie et vous tenons informé jusqu'au virement.",
  },
];

export default function HomePage() {
  return (
    <main>
      {/* Hero : asymétrique, radar en arrière-plan, carte d'embarquement au premier plan */}
      <section className="conteneur grid items-center gap-12 pt-14 pb-20 sm:pt-20 sm:pb-28 lg:grid-cols-[1.05fr_0.95fr] lg:gap-8">
        <div className="entree-fade max-w-[34rem]">
          <h1 className="text-4xl font-semibold leading-[1.08] tracking-tight sm:text-5xl">
            Vol retardé, annulé ?{" "}
            <span className="text-[var(--color-accent-500)]">Récupérez</span>{" "}
            ce qu&apos;on vous doit.
          </h1>
          <p className="mt-5 max-w-[38ch] text-[17px] leading-relaxed text-[var(--texte-attenue)]">
            Vérifiez votre indemnisation EU261 en 60 secondes, sans créer de
            compte. Payé uniquement si nous récupérons votre argent.
          </p>
          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Link href="/check" className="bouton bouton-primaire text-base">
              Vérifier mon vol
            </Link>
            <span className="text-sm text-[var(--texte-attenue)]">
              22 % de commission, seulement en cas de succès
            </span>
          </div>
        </div>

        <div className="entree-fade relative flex h-[24rem] items-center justify-center sm:h-[28rem]">
          <div className="absolute inset-0 flex items-center justify-center opacity-80">
            <Radar size={320} />
          </div>

          <div className="carte-embarquement relative w-[19rem] p-6 sm:w-[21rem]">
            <div className="flex items-center justify-between">
              <p className="etiquette">Vol AF1380</p>
              <span className="pilule pilule-eligible">Éligible</span>
            </div>
            <p className="mt-2 text-sm font-medium text-[var(--texte-attenue)] mono">
              CDG → FCO
            </p>
            <p className="text-sm text-[var(--texte-attenue)]">
              Retard à l&apos;arrivée : 3h42
            </p>
            <div className="souche mt-4 pt-4">
              <p className="text-4xl font-bold">
                <MontantSplitFlap montant={250} devise="EUR" />
              </p>
              <p className="mt-1 text-xs text-[var(--texte-attenue)]">
                Estimation au titre du règlement EU261
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Comment ça marche : timeline verticale, pas de cartes égales */}
      <section className="border-t border-[var(--bordure)] bg-[var(--bg-eleve)]">
        <div className="conteneur grid gap-10 py-20 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight sm:text-3xl">
              Trois étapes, aucune paperasse
            </h2>
            <p className="mt-3 max-w-[32ch] text-[15px] leading-relaxed text-[var(--texte-attenue)]">
              Nous gérons la réclamation de bout en bout. Vous n&apos;avez
              rien d&apos;autre à faire ensuite.
            </p>
          </div>

          <ol className="relative flex flex-col gap-10 sm:pl-2">
            {ETAPES.map((etape, index) => {
              const Icone = etape.icone;
              return (
                <li key={etape.titre} className="relative flex gap-5">
                  <div className="flex flex-col items-center">
                    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[var(--color-accent-50)] text-[var(--color-accent-500)]">
                      <Icone size={20} weight="bold" />
                    </span>
                    {index < ETAPES.length - 1 && (
                      <span className="mt-2 w-px flex-1 bg-[var(--bordure)]" />
                    )}
                  </div>
                  <div className="pb-2">
                    <h3 className="text-lg font-semibold">{etape.titre}</h3>
                    <p className="mt-1 max-w-[46ch] text-[15px] leading-relaxed text-[var(--texte-attenue)]">
                      {etape.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Confiance : stat asymétrique + liste, pas de cartes */}
      <section className="conteneur grid gap-10 py-20 lg:grid-cols-[0.7fr_1.3fr] lg:items-center lg:gap-16">
        <div>
          <p className="mono text-6xl font-bold tracking-tight text-[var(--color-accent-500)] sm:text-7xl">
            22%
          </p>
          <p className="mt-2 max-w-[24ch] text-[15px] leading-relaxed text-[var(--texte-attenue)]">
            de commission sur le montant récupéré. Rien si nous ne récupérons
            rien.
          </p>
        </div>

        <ul className="flex flex-col gap-6">
          <li className="flex gap-4">
            <ShieldCheck size={22} className="mt-0.5 shrink-0 text-[var(--color-accent-500)]" />
            <p className="text-[15px] leading-relaxed">
              Un dossier peut être refusé, et nous vous le disons
              honnêtement : le verdict n&apos;est jamais caché derrière un
              mur d&apos;email.
            </p>
          </li>
          <li className="flex gap-4">
            <EnvelopeSimple size={22} className="mt-0.5 shrink-0 text-[var(--color-accent-500)]" />
            <p className="text-[15px] leading-relaxed">
              Nous n&apos;accédons jamais à votre messagerie. Seules les
              informations utiles à votre dossier sont demandées.
            </p>
          </li>
          <li className="flex gap-4">
            <LockKey size={22} className="mt-0.5 shrink-0 text-[var(--color-accent-500)]" />
            <p className="text-[15px] leading-relaxed">
              Données hébergées en Union européenne, suppression de compte
              possible à tout moment.
            </p>
          </li>
        </ul>
      </section>

      {/* Bandeau CTA final */}
      <section className="bg-[var(--color-accent-500)]">
        <div className="conteneur flex flex-col items-center gap-6 py-16 text-center">
          <h2 className="max-w-[24ch] text-2xl font-semibold tracking-tight text-[#1a1103] sm:text-3xl">
            Votre vol a peut-être une valeur que vous ignorez.
          </h2>
          <Link href="/check" className="bouton bg-[#1a1103] text-[var(--color-accent-400)]">
            Vérifier mon vol
          </Link>
        </div>
      </section>

      <footer className="border-t border-[var(--bordure)]">
        <div className="conteneur flex flex-col items-center gap-4 py-10 text-sm text-[var(--texte-attenue)] sm:flex-row sm:justify-between">
          <span className="flex items-center gap-2 font-semibold text-[var(--texte)]">
            <BrandMark size={18} />
            Refund Radar
          </span>
          <nav className="flex gap-6">
            <Link href="/check">Vérifier un vol</Link>
            <Link href="/dashboard">Mes dossiers</Link>
          </nav>
        </div>
      </footer>
    </main>
  );
}
