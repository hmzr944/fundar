import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { purgerDocumentsUtilisateur } from "@/lib/supabase/storage";

/**
 * Suppression de compte (droit à l'effacement, RGPD).
 *
 * L'ordre compte : les fichiers Storage doivent partir AVANT l'utilisateur.
 * Auparavant seul `deleteUser` était appelé, ce qui supprimait bien les
 * lignes par cascade mais laissait les documents dans le bucket, dont les
 * cartes d'embarquement (code-barres décodable). Le droit à l'effacement
 * n'était donc pas réellement honoré.
 */
export async function POST() {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ erreur: "Non authentifié." }, { status: 401 });
  }

  const admin = createAdminClient();

  // 1. Documents d'abord : après suppression du compte, on n'aurait plus de
  //    moyen fiable de les retrouver.
  const purge = await purgerDocumentsUtilisateur(admin, user.id);

  if (purge.echecs.length > 0) {
    // On n'efface pas le compte si des documents subsistent : un compte
    // supprimé avec des fichiers orphelins est le pire des deux mondes,
    // puisque plus personne ne peut les rattacher ni les supprimer.
    console.error(
      `[compte ${user.id}] purge incomplète, suppression annulée. Fichiers restants :`,
      purge.echecs
    );
    return NextResponse.json(
      {
        erreur:
          "Certains documents n'ont pas pu être supprimés. Votre compte n'a pas été supprimé pour éviter de laisser des fichiers orphelins. Réessayez ou contactez-nous.",
      },
      { status: 500 }
    );
  }

  // 2. Puis le compte : profiles / claims / documents / signatures /
  //    consentements / notifications partent en cascade.
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json(
      { erreur: "La suppression a échoué. Réessayez ou contactez le support." },
      { status: 500 }
    );
  }

  return NextResponse.json({
    statut: "SUPPRIME",
    documentsSupprimes: purge.fichiersSupprimes,
  });
}
