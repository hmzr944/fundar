import { comparer, repartir } from "@/lib/commission";
import { TAUX_COMMISSION } from "@/config/legal";

/**
 * Ce que le passager garde, en euros, chez nous et ailleurs.
 *
 * Placé juste sous le montant estimé, avant le bouton : c'est là que se
 * pose la seule question qui compte à cet instant — « pourquoi eux plutôt
 * que moi tout seul, ou qu'un autre ». Un pourcentage n'y répond pas, un
 * écart en euros oui.
 *
 * La comparaison disparaît d'elle-même si notre taux cesse d'être le
 * meilleur (voir lib/commission.ts) : le composant ne peut pas affirmer un
 * avantage qui n'existe plus.
 */
export default function RepartitionMontant({
  montant,
  devise,
}: {
  montant: number;
  devise: string;
}) {
  const nous = repartir(montant, TAUX_COMMISSION);
  const lignes = comparer(montant, TAUX_COMMISSION);

  return (
    <div className="mt-5 border-t border-[var(--bordure)] pt-5">
      <div className="flex items-baseline justify-between gap-4">
        <span className="text-[15px] font-semibold">
          Vous gardez
        </span>
        <span className="chiffres text-2xl font-bold text-[var(--color-succes-600)]">
          {nous.net} {devise}
        </span>
      </div>
      <p className="mt-1 text-[13px] text-[var(--texte-attenue)]">
        Notre commission : {nous.commission} {devise} ({Math.round(TAUX_COMMISSION * 100)} %),
        uniquement si vous êtes indemnisé. Ce taux ne bouge pas, même si la
        compagnie conteste.
      </p>

      {lignes.length > 0 && (
        <dl className="mt-4 flex flex-col gap-2">
          {lignes.map((ligne) => (
            <div
              key={ligne.nom}
              className="flex items-baseline justify-between gap-4 text-[13px]"
            >
              <dt className="text-[var(--texte-attenue)]">
                Avec {ligne.nom}
                {ligne.note && (
                  <span className="text-[var(--texte-attenue)]">
                    {" "}
                    ({ligne.note})
                  </span>
                )}
              </dt>
              <dd className="chiffres shrink-0 text-[var(--texte-attenue)]">
                {ligne.net} {devise}
                <span className="ml-1.5 font-semibold text-[var(--texte)]">
                  −{ligne.ecart}
                </span>
              </dd>
            </div>
          ))}
        </dl>
      )}
    </div>
  );
}
