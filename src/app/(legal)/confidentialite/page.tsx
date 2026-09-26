import { LegalValue } from "@/components/legal-value";
import { legalIdentity } from "@/server/billing/stripe";

export const dynamic = "force-dynamic";
export const metadata = { title: "Confidentialité — Atlas" };

export default function Confidentialite() {
  const id = legalIdentity();
  const retention = Number(process.env.ATLAS_RETENTION_DAYS || 365);
  return (
    <>
      <h1>Politique de confidentialité</h1>
      <h2>Responsable du traitement</h2>
      <p>
        <LegalValue value={id.name} label="Nom ou raison sociale" />, <LegalValue value={id.address} label="Adresse" />,{" "}
        <LegalValue value={id.email} label="E-mail de contact" />.
      </p>
      <h2>Données traitées et finalités</h2>
      <ul>
        <li>Compte : adresse e-mail et mot de passe (chiffré), pour vous identifier.</li>
        <li>Dossiers : vos messages et documents, pour analyser et traiter vos démarches (exécution du service).</li>
        <li>Paiement : traité par Stripe ; Atlas ne voit ni ne conserve vos coordonnées bancaires.</li>
        <li>Jamais demandés : mots de passe de vos comptes, codes bancaires, données de santé.</li>
      </ul>
      <h2>Qui traite vos données</h2>
      <p>
        L&apos;équipe Atlas et des prestataires techniques : l&apos;hébergeur (<LegalValue value={id.host} label="Hébergeur" />),
        Anthropic (modèle d&apos;intelligence artificielle, traitement aux États-Unis encadré par des clauses contractuelles types de la
        Commission européenne), Stripe (paiement) et, le cas échéant, le service d&apos;envoi de nos e-mails de notification.
      </p>
      <h2>Durée de conservation</h2>
      <p>Les dossiers inactifs depuis {retention} jours sont supprimés automatiquement. Vous pouvez supprimer un dossier ou votre compte à tout moment depuis l&apos;application.</p>
      <h2>Vos droits</h2>
      <p>
        Accès, rectification, effacement, portabilité, opposition : écrivez à <LegalValue value={id.email} label="E-mail de contact" />.
        Vous pouvez aussi saisir la CNIL (cnil.fr).
      </p>
    </>
  );
}
