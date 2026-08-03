/**
 * Contrôle de plausibilité d'une adresse email.
 *
 * Volontairement permissif. Valider une adresse par expression régulière
 * est un problème sans solution propre — la RFC 5322 autorise des formes
 * que presque aucune regex ne couvre — et une règle trop stricte rejette
 * de vraies adresses, ce qui coûte bien plus cher que d'en accepter une
 * fausse. On écarte donc seulement ce qui ne peut pas être une adresse :
 * pas d'arobase, pas de point dans le domaine, des espaces, deux arobases.
 *
 * La seule preuve qui compte reste l'email de connexion qui arrive, ou non.
 */
export function estEmailPlausible(valeur: string): boolean {
  const email = valeur.trim();
  if (email.length < 6 || email.length > 254) return false;
  if (/\s/.test(email)) return false;

  const morceaux = email.split("@");
  if (morceaux.length !== 2) return false;

  const [local, domaine] = morceaux;
  if (local.length === 0 || domaine.length < 3) return false;
  if (!domaine.includes(".")) return false;
  if (domaine.startsWith(".") || domaine.endsWith(".")) return false;
  if (domaine.includes("..")) return false;

  const extension = domaine.split(".").pop() ?? "";
  return extension.length >= 2 && /^[a-zA-Z]+$/.test(extension);
}
