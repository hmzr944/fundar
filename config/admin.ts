/**
 * Contrôle d'accès au tableau de bord interne.
 *
 * Volontairement fermé par défaut : si ADMIN_EMAILS n'est pas renseignée,
 * personne n'est administrateur. Une liste vide qui autoriserait tout le
 * monde exposerait l'intégralité des dossiers clients au premier compte
 * créé.
 */
export function listeAdmins(): string[] {
  return (process.env.ADMIN_EMAILS ?? "")
    .split(",")
    .map((email) => email.trim().toLowerCase())
    .filter((email) => email.length > 0);
}

export function estAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const liste = listeAdmins();
  if (liste.length === 0) return false;
  return liste.includes(email.trim().toLowerCase());
}
