import { LegalValue } from "@/components/legal-value";
import { billingConfig, legalIdentity } from "@/server/billing/stripe";

export const dynamic = "force-dynamic";
export const metadata = { title: "Conditions générales de vente — Atlas" };

export default function Cgv() {
  const id = legalIdentity();
  const cfg = billingConfig();
  const price = cfg ? `${(cfg.priceCents / 100).toFixed(2).replace(".", ",")} € TTC` : null;
  return (
    <>
      <h1>Conditions générales de vente</h1>
      <p className="text-xs text-faint">Version {cfg?.termsVersion ?? process.env.ATLAS_TERMS_VERSION ?? "1"}</p>

      <h2>1. Vendeur</h2>
      <p>
        <LegalValue value={id.name} label="Nom ou raison sociale" />, SIRET <LegalValue value={id.siret} label="SIRET" />,{" "}
        <LegalValue value={id.address} label="Adresse" />, <LegalValue value={id.email} label="E-mail de contact" />.
      </p>

      <h2>2. Le service</h2>
      <p>Atlas est un service en ligne d&apos;assistance aux démarches des particuliers auprès d&apos;entreprises et d&apos;organisations. Pour un dossier, Atlas :</p>
      <ul>
        <li>analyse les informations et documents que vous fournissez ;</li>
        <li>prépare les courriers et messages utiles, les vérifie automatiquement et vous les présente ;</li>
        <li>assure le suivi du dossier : il le reprend aux échéances prévues pour préparer relances et escalades (médiateur, etc.).</li>
      </ul>
      <p>
        Vous restez l&apos;auteur et l&apos;expéditeur des courriers : vous les relisez et les envoyez vous-même depuis votre messagerie.
        Atlas ne fournit <strong>aucun conseil juridique personnalisé</strong>, ne vous représente pas, notamment en justice, et
        n&apos;encaisse aucune somme pour votre compte. <strong>Aucun résultat n&apos;est garanti</strong> : la décision appartient à
        l&apos;organisation concernée.
      </p>

      <h2>3. Analyse gratuite, puis prise en charge payante</h2>
      <p>
        L&apos;analyse initiale est gratuite : Atlas vous indique s&apos;il peut prendre votre dossier en charge. La prise en charge
        complète d&apos;un dossier coûte <LegalValue value={price} label="Prix" />, payable en une fois, par carte, avant son début.
        Le paiement est traité par Stripe.
      </p>

      <h2>4. Droit de rétractation</h2>
      <p>
        Vous disposez de 14 jours à compter du paiement pour vous rétracter, sans motif, en écrivant à{" "}
        <LegalValue value={id.email} label="E-mail de contact" />. En payant, vous demandez expressément que le service commence
        immédiatement. Si vous vous rétractez pendant ce délai, vous êtes remboursé, déduction faite de la part du service déjà
        réalisée à la date de votre rétractation (articles L221-18, L221-25 et L221-28 du code de la consommation).
      </p>

      <h2>5. Dossiers qu&apos;Atlas ne traite pas</h2>
      <p>
        Procédures judiciaires, droit pénal, de la famille, du travail, des étrangers, santé, dettes qui vous sont réclamées. Si un
        dossier payé s&apos;avère hors de ce périmètre, Atlas vous le signale et vous êtes remboursé.
      </p>

      <h2>6. Réclamations et médiation</h2>
      <p>
        Pour toute réclamation : <LegalValue value={id.email} label="E-mail de contact" />. À défaut de solution, vous pouvez saisir
        gratuitement le médiateur de la consommation : <LegalValue value={id.mediator} label="Médiateur de la consommation" />.
      </p>

      <h2>7. Données personnelles</h2>
      <p>
        Voir la <a href="/confidentialite" className="underline">politique de confidentialité</a>.
      </p>
    </>
  );
}
