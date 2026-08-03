/**
 * Lien de paiement Stripe, appelé en HTTP direct plutôt que via le SDK.
 *
 * Une seule requête est nécessaire : ajouter une dépendance de plusieurs
 * mégaoctets pour un POST en form-urlencoded ne se justifie pas, et la
 * surface d'API utilisée ici est stable depuis des années.
 *
 * Stripe est facultatif. Sans clé, on retourne null et la facture bascule
 * sur le virement bancaire : mieux vaut une facture payable lentement
 * qu'une facturation bloquée en attendant un compte marchand.
 */

const API = "https://api.stripe.com/v1/checkout/sessions";

export interface DemandeLienPaiement {
  montant: number;
  devise: string;
  libelle: string;
  /** Référence affichée sur le relevé et dans le back-office Stripe. */
  reference: string;
  emailClient: string;
  urlRetour: string;
}

export function stripeConfigure(): boolean {
  return Boolean(process.env.STRIPE_SECRET_KEY);
}

export async function creerLienPaiement(
  demande: DemandeLienPaiement
): Promise<string | null> {
  const cle = process.env.STRIPE_SECRET_KEY;
  if (!cle) return null;

  const parametres = new URLSearchParams({
    mode: "payment",
    "line_items[0][quantity]": "1",
    "line_items[0][price_data][currency]": demande.devise.toLowerCase(),
    "line_items[0][price_data][product_data][name]": demande.libelle,
    // Stripe raisonne en plus petite unité monétaire : 132,00 € = 13200.
    "line_items[0][price_data][unit_amount]": String(
      Math.round(demande.montant * 100)
    ),
    customer_email: demande.emailClient,
    client_reference_id: demande.reference,
    success_url: demande.urlRetour,
    cancel_url: demande.urlRetour,
  });

  const reponse = await fetch(API, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${cle}`,
      "Content-Type": "application/x-www-form-urlencoded",
      // Rejoue sans risque : deux appels pour la même facture renvoient la
      // même session au lieu d'en créer deux.
      "Idempotency-Key": `facture-${demande.reference}`,
    },
    body: parametres,
  });

  if (!reponse.ok) {
    const detail = await reponse.text();
    throw new Error(`Stripe a refusé la création du lien : ${detail.slice(0, 300)}`);
  }

  const session = await reponse.json();
  return session.url ?? null;
}
