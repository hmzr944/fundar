import { LegalValue } from "@/components/legal-value";
import { legalIdentity } from "@/server/billing/stripe";

export const dynamic = "force-dynamic";
export const metadata = { title: "Mentions légales — Atlas" };

export default function MentionsLegales() {
  const id = legalIdentity();
  return (
    <>
      <h1>Mentions légales</h1>
      <h2>Éditeur</h2>
      <p>
        <LegalValue value={id.name} label="Nom ou raison sociale" /> — SIRET <LegalValue value={id.siret} label="SIRET" />
        <br />
        <LegalValue value={id.address} label="Adresse" />
        <br />
        Contact : <LegalValue value={id.email} label="E-mail de contact" />
      </p>
      <h2>Hébergement</h2>
      <p>
        <LegalValue value={id.host} label="Hébergeur (nom, adresse)" />
      </p>
      <h2>Intelligence artificielle</h2>
      <p>
        Atlas utilise des outils d&apos;intelligence artificielle pour analyser les dossiers et rédiger des courriers. Les textes
        produits sont relus automatiquement ; ils vous sont présentés pour vérification avant tout envoi, que vous effectuez vous-même.
      </p>
    </>
  );
}
