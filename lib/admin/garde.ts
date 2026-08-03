import { createClient } from "@/lib/supabase/server";
import { estAdmin } from "@/config/admin";

/**
 * Vérifie que l'appelant est administrateur, côté serveur uniquement.
 *
 * Retourne l'email plutôt qu'un booléen, pour que l'appelant puisse le
 * journaliser : toute écriture sur le dossier d'un client doit être
 * imputable à quelqu'un.
 */
export async function exigerAdmin(): Promise<
  { autorise: true; email: string } | { autorise: false; statut: 401 | 403 }
> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { autorise: false, statut: 401 };
  if (!estAdmin(user.email)) return { autorise: false, statut: 403 };

  return { autorise: true, email: user.email! };
}
