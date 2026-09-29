import type { CSSProperties } from "react";

const tile = (i: number) => ({ ["--i" as string]: i }) as CSSProperties;

const steps = [
  { title: "Racontez", text: "Ce qui s'est passé, avec qui, depuis quand. Quelques phrases suffisent." },
  { title: "Joignez vos pièces", text: "Facture, e-mails, contrat : Atlas y vérifie chaque montant et chaque date." },
  { title: "Relisez et envoyez", text: "Atlas prépare le courrier. Vous l'envoyez en un clic, il suit la réponse." },
];

/** Shown until the first dossier exists: what to expect, in three moves. */
export function FirstSteps() {
  return (
    <section aria-labelledby="first-steps" className="grid gap-4 md:grid-cols-6" data-testid="first-steps">
      <div className="glass-ink tile-in rounded-3xl p-6 sm:p-7 md:col-span-4 md:row-span-2" style={tile(0)}>
        <h2 id="first-steps" className="font-display text-2xl font-bold">
          Votre premier dossier
        </h2>
        <ol className="mt-6 space-y-5">
          {steps.map((s, i) => (
            <li key={s.title} className="tile-in grid grid-cols-[2.25rem_1fr] gap-3" style={tile(i + 1)}>
              <span aria-hidden className="grid h-9 w-9 place-items-center rounded-full border border-white/25 font-display text-lg font-bold">
                {i + 1}
              </span>
              <div>
                <p className="font-medium">{s.title}</p>
                <p className="text-sm text-elev/75">{s.text}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div className="glass tile-in rounded-3xl p-6 md:col-span-2" style={tile(2)}>
        <p className="font-display text-lg font-bold">Analyse gratuite</p>
        <p className="mt-1 text-sm text-muted">Atlas vous dit d&apos;abord s&apos;il peut s&apos;occuper de votre cas, et comment.</p>
      </div>
      <div className="tile-in rounded-3xl bg-accent p-6 text-accent-contrast md:col-span-2" style={tile(3)}>
        <p className="font-display text-lg font-bold">Rien ne part sans vous</p>
        <p className="mt-1 text-sm opacity-85">Aucun courrier n&apos;est envoyé sans votre accord.</p>
      </div>
    </section>
  );
}
