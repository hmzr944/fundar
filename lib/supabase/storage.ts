import type { SupabaseClient } from "@supabase/supabase-js";

export const BUCKET_DOCUMENTS = "documents";

/**
 * Liste récursivement tous les objets sous un préfixe.
 *
 * L'arborescence est `<user_id>/<claim_id>/<fichier>` : un simple `list()`
 * ne renvoie que le premier niveau, ce qui laisserait les fichiers en place.
 */
async function listerRecursivement(
  client: SupabaseClient,
  prefixe: string
): Promise<string[]> {
  const { data, error } = await client.storage
    .from(BUCKET_DOCUMENTS)
    .list(prefixe, { limit: 1000 });

  if (error || !data) return [];

  const chemins: string[] = [];

  for (const entree of data) {
    const chemin = prefixe ? `${prefixe}/${entree.name}` : entree.name;

    // Un dossier n'a pas de métadonnées de fichier : on descend dedans.
    if (entree.id === null || entree.metadata === null) {
      chemins.push(...(await listerRecursivement(client, chemin)));
    } else {
      chemins.push(chemin);
    }
  }

  return chemins;
}

export interface ResultatPurge {
  fichiersSupprimes: number;
  echecs: string[];
}

/**
 * Supprime tous les documents d'un utilisateur (carte d'embarquement,
 * mandat signé, lettre de réclamation).
 *
 * Doit impérativement être appelé AVANT la suppression du compte : une fois
 * l'utilisateur supprimé, on perd le moyen de retrouver ses fichiers, qui
 * resteraient alors orphelins dans le bucket. C'est ce qui empêchait le
 * droit à l'effacement d'être réellement honoré.
 */
export async function purgerDocumentsUtilisateur(
  admin: SupabaseClient,
  userId: string
): Promise<ResultatPurge> {
  const chemins = await listerRecursivement(admin, userId);

  if (chemins.length === 0) {
    return { fichiersSupprimes: 0, echecs: [] };
  }

  const { data, error } = await admin.storage
    .from(BUCKET_DOCUMENTS)
    .remove(chemins);

  if (error) {
    return { fichiersSupprimes: 0, echecs: chemins };
  }

  const supprimes = new Set((data ?? []).map((o) => o.name));
  const echecs = chemins.filter((c) => !supprimes.has(c));

  return { fichiersSupprimes: chemins.length - echecs.length, echecs };
}
