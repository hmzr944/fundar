"use client";

import Icone from "@/components/Icone";
import { MAX_PASSAGERS, type Passager } from "@/lib/claims/passagers";

/**
 * Passagers du dossier.
 *
 * Le premier est le titulaire du compte : ses champs viennent de l'étape
 * d'identité et ne sont pas ressaisis ici. Les suivants s'ajoutent un par
 * un — c'est le cas d'une famille, où l'indemnisation est due à chacun et
 * où le dossier vaut donc plusieurs fois le barème.
 *
 * L'explication est affichée avant les champs, pas après : sans elle,
 * personne ne pense à ajouter ses enfants, et le dossier part à un quart
 * de sa valeur.
 */
export default function SaisiePassagers({
  titulaire,
  compagnons,
  onChange,
}: {
  titulaire: Passager;
  compagnons: Passager[];
  onChange: (compagnons: Passager[]) => void;
}) {
  const total = compagnons.length + 1;

  function modifier(index: number, champ: keyof Passager, valeur: string) {
    onChange(
      compagnons.map((p, i) => (i === index ? { ...p, [champ]: valeur } : p))
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between">
        <span className="etiquette">Passagers du dossier</span>
        <span className="chiffres text-[13px] text-[var(--texte-attenue)]">
          {total} sur ce vol
        </span>
      </div>

      <p className="rounded-[var(--radius-interne)] bg-[var(--bg-eleve-2)] p-3 text-[13px] leading-relaxed text-[var(--texte-attenue)]">
        L&apos;indemnisation est due{" "}
        <strong className="font-semibold text-[var(--texte)]">
          à chaque passager
        </strong>
        . Ajoutez les personnes qui voyageaient avec vous sur la même
        réservation : le montant réclamé sera multiplié d&apos;autant.
      </p>

      <div className="flex items-center gap-2 rounded-[var(--radius-interne)] border border-[var(--bordure)] p-3 text-[15px]">
        <Icone
          nom="coche-cercle"
          taille={17}
          className="shrink-0 text-[var(--color-succes-600)]"
        />
        {titulaire.prenom || titulaire.nom ? (
          <>
            {titulaire.prenom} {titulaire.nom}
          </>
        ) : (
          <span className="text-[var(--texte-attenue)]">Vos coordonnées</span>
        )}
        <span className="ml-auto text-[13px] text-[var(--texte-attenue)]">
          vous
        </span>
      </div>

      {compagnons.map((p, i) => (
        <div key={i} className="grid gap-2 sm:grid-cols-[1fr_1fr_auto]">
          <input
            aria-label={`Prénom du passager ${i + 2}`}
            className="champ"
            placeholder="Prénom"
            value={p.prenom}
            onChange={(e) => modifier(i, "prenom", e.target.value)}
          />
          <input
            aria-label={`Nom du passager ${i + 2}`}
            className="champ"
            placeholder="Nom"
            value={p.nom}
            onChange={(e) => modifier(i, "nom", e.target.value)}
          />
          <button
            type="button"
            aria-label={`Retirer le passager ${i + 2}`}
            onClick={() => onChange(compagnons.filter((_, j) => j !== i))}
            className="bouton bouton-fantome !px-3"
          >
            <Icone nom="interdit" taille={17} />
          </button>
        </div>
      ))}

      {total < MAX_PASSAGERS ? (
        <button
          type="button"
          onClick={() => onChange([...compagnons, { nom: "", prenom: "" }])}
          className="bouton bouton-secondaire self-start !py-2 !px-4 text-sm"
        >
          Ajouter un passager
        </button>
      ) : (
        <p className="text-[13px] leading-relaxed text-[var(--texte-attenue)]">
          Au-delà de {MAX_PASSAGERS} passagers, la compagnie exige une
          procédure de groupe. Écrivez-nous, nous la prenons en charge à part.
        </p>
      )}
    </div>
  );
}
