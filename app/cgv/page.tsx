import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Conditions générales de vente | Volia",
  description:
    "Conditions générales applicables au service de réclamation d'indemnisation aérienne Volia.",
  robots: { index: true, follow: true },
};

/**
 * ┌──────────────────────────────────────────────────────────────────────┐
 * │ PREMIER JET — DOIT ÊTRE RELU PAR UN JURISTE AVANT MISE EN PRODUCTION.│
 * │                                                                      │
 * │ Ce texte couvre les points identifiés comme structurants dans le      │
 * │ cahier des charges : nature du service (mandat, PAS un cabinet        │
 * │ d'avocats), rémunération au succès, absence de garantie de résultat,  │
 * │ droit de rétractation, traitement des données.                        │
 * │                                                                      │
 * │ Champs à compléter avant publication : raison sociale, forme          │
 * │ juridique, siège, numéro d'immatriculation, adresse de contact.       │
 * │ Ils sont marqués [À COMPLÉTER] ci-dessous.                            │
 * └──────────────────────────────────────────────────────────────────────┘
 */

const SECTIONS = [
  {
    titre: "1. Identité du prestataire",
    paragraphes: [
      "Le service Volia est édité par [À COMPLÉTER : raison sociale, forme juridique], dont le siège est situé [À COMPLÉTER : adresse], immatriculée sous le numéro [À COMPLÉTER].",
      "Contact : [À COMPLÉTER : adresse email de contact].",
    ],
  },
  {
    titre: "2. Nature du service",
    paragraphes: [
      "Volia est un service de recouvrement amiable de créances d'indemnisation aérienne. Nous vérifions l'éligibilité d'un vol au titre du règlement (CE) n° 261/2004 ou de son équivalent britannique, puis, sur mandat du passager, nous adressons la réclamation à la compagnie aérienne et assurons le suivi des échanges.",
      "Volia n'est pas un cabinet d'avocats et ne fournit aucune prestation de conseil juridique. Aucune information figurant sur le site ou communiquée dans le cadre du service ne constitue un conseil juridique personnalisé. Le passager conserve à tout moment la faculté de recourir à un avocat ou de saisir lui-même les autorités compétentes.",
      "Le service ne comporte aucune représentation devant une juridiction. Si un dossier nécessite une action contentieuse, il ne pourra être poursuivi qu'avec l'accord exprès du passager et par l'intermédiaire d'un professionnel du droit habilité, dans les conditions qui lui seront alors communiquées.",
    ],
  },
  {
    titre: "3. Mandat donné par le passager",
    paragraphes: [
      "En signant le mandat, le passager autorise Volia à agir en son nom pour réclamer l'indemnisation auprès de la compagnie aérienne concernée, à recevoir les correspondances relatives au dossier et à communiquer les pièces nécessaires à son instruction.",
      "Le mandat n'opère aucune cession de créance : la créance reste la propriété du passager, et la compagnie aérienne verse l'indemnisation directement au passager.",
      "Le mandat peut être révoqué à tout moment par simple demande écrite. La révocation n'affecte pas la rémunération due au titre d'une indemnisation déjà obtenue grâce à l'intervention de Volia.",
      "Le passager s'engage à informer Volia s'il a déjà engagé une démarche pour le même vol, directement ou par l'intermédiaire d'un tiers, et à ne pas engager de démarche parallèle pendant la durée du mandat.",
    ],
  },
  {
    titre: "4. Rémunération",
    paragraphes: [
      "Le service est rémunéré exclusivement en cas de succès. Aucun frais n'est dû au dépôt du dossier, ni en cas de rejet de la réclamation, ni en cas d'abandon du dossier par Volia.",
      "En cas de succès, une commission de 22 % du montant effectivement récupéré est due à Volia. Le taux applicable est celui figurant sur le mandat signé par le passager.",
      "La compagnie aérienne versant l'indemnisation directement au passager, celui-ci s'engage à reverser la commission à Volia dans un délai de quatorze (14) jours à compter de la réception effective des fonds, sur présentation d'une facture.",
      "Aucun autre frais n'est facturé : ni frais de dossier, ni frais de gestion, ni majoration en cas de complexité du dossier.",
    ],
  },
  {
    titre: "5. Absence de garantie de résultat",
    paragraphes: [
      "Volia s'engage à mettre en œuvre les moyens raisonnables pour obtenir l'indemnisation, sans garantir un résultat. L'issue d'une réclamation dépend de la compagnie aérienne, des circonstances de la perturbation et de l'appréciation qui en est faite.",
      "Le montant affiché lors de la vérification d'éligibilité est une estimation fondée sur les informations disponibles à cet instant. Il ne constitue ni une promesse de paiement ni un engagement sur le montant final.",
      "Volia peut refuser un dossier ou cesser de l'instruire, notamment lorsque les éléments communiqués se révèlent inexacts ou insuffisants. Le passager en est informé et ne doit alors aucune somme.",
    ],
  },
  {
    titre: "6. Obligations du passager",
    paragraphes: [
      "Le passager garantit l'exactitude des informations communiquées, en particulier son identité, les références du vol et ses coordonnées bancaires. Une erreur dans les coordonnées bancaires peut empêcher le versement de l'indemnisation par la compagnie.",
      "Le passager s'engage à transmettre sans délai toute correspondance reçue de la compagnie aérienne relative au dossier, ainsi qu'à signaler la réception effective de l'indemnisation.",
    ],
  },
  {
    titre: "7. Droit de rétractation",
    paragraphes: [
      "Le passager consommateur dispose d'un délai de quatorze (14) jours à compter de la conclusion du contrat pour se rétracter sans avoir à motiver sa décision et sans frais.",
      "En cochant la case prévue à cet effet et en validant sa commande, le passager demande expressément l'exécution du service avant la fin du délai de rétractation. Il reconnaît qu'en cas d'exécution complète du service pendant ce délai, à savoir l'obtention de l'indemnisation, il perd son droit de rétractation pour cette prestation.",
      "La rétractation s'exerce par toute déclaration dénuée d'ambiguïté adressée à [À COMPLÉTER : adresse email de contact].",
    ],
  },
  {
    titre: "8. Données personnelles",
    paragraphes: [
      "Les données collectées sont limitées à ce qui est nécessaire à l'instruction de la réclamation : identité, coordonnées, références du vol, coordonnées bancaires et justificatif d'embarquement.",
      "Elles sont hébergées au sein de l'Union européenne et ne sont transmises qu'à la compagnie aérienne concernée, dans la limite de ce qu'exige le traitement de la réclamation. Volia n'accède à aucune boîte de messagerie du passager.",
      "Le justificatif d'embarquement pouvant contenir des données lisibles par code-barres, il est conservé en accès restreint et n'est jamais rendu public.",
      "Le passager peut demander l'accès, la rectification ou l'effacement de ses données, et peut supprimer son compte ainsi que l'ensemble de ses documents à tout moment depuis son tableau de bord.",
    ],
  },
  {
    titre: "9. Réclamations et droit applicable",
    paragraphes: [
      "Toute réclamation relative au service peut être adressée à [À COMPLÉTER : adresse email de contact]. Nous nous engageons à y répondre dans un délai raisonnable.",
      "Les présentes conditions sont soumises au droit [À COMPLÉTER : droit applicable selon le pays d'établissement]. Les dispositions impératives protectrices du consommateur de son pays de résidence demeurent applicables.",
    ],
  },
];

export default function CgvPage() {
  return (
    <main className="conteneur-etroit py-14 sm:py-20">
      <h1 className="titre text-[1.875rem] sm:text-[2.5rem]">
        Conditions générales
      </h1>
      <p className="mt-3 text-[17px] leading-relaxed text-[var(--texte-attenue)]">
        Elles s&apos;appliquent au service de réclamation d&apos;indemnisation
        aérienne Volia. Le point essentiel en une phrase : nous agissons
        sur votre mandat, la compagnie vous paie directement, et nous ne sommes
        rémunérés que si vous récupérez effectivement de l&apos;argent.
      </p>

      <div className="mt-10 flex flex-col gap-9">
        {SECTIONS.map((section) => (
          <section key={section.titre}>
            <h2 className="titre text-[1.5rem]">{section.titre}</h2>
            <div className="mt-3 flex flex-col gap-3">
              {section.paragraphes.map((p, i) => (
                <p key={i} className="text-[15px] leading-relaxed text-[var(--texte-attenue)]">
                  {p}
                </p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-12 border-t border-[var(--bordure)] pt-6">
        <Link href="/check" className="bouton bouton-primaire">
          Vérifier mon vol
        </Link>
      </div>
    </main>
  );
}
