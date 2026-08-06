import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

/**
 * Retour du lien de connexion envoyé par email.
 *
 * Deux échecs très différents arrivaient ici et repartaient avec le même
 * message. Ils n'appellent pourtant pas la même réponse :
 *
 * - `lien_perime` : Supabase a refusé le jeton avant même de nous appeler.
 *   Le lien avait déjà servi, ou un lien plus récent l'a remplacé. C'est
 *   le cas le plus fréquent, et il se répare tout seul en en demandant un
 *   nouveau.
 * - `lien_autre_navigateur` : l'échange a échoué alors que le jeton était
 *   valide. La preuve de sécurité (PKCE) est déposée en cookie par le
 *   navigateur qui a demandé le lien ; ouvrir l'email dans un AUTRE
 *   navigateur la laisse inaccessible. Redemander un lien depuis le même
 *   navigateur règle le problème — dire « lien invalide » envoyait au
 *   contraire l'utilisateur tourner en rond.
 *
 * Dans les deux cas la destination est conservée, sinon on renvoie le
 * passager à l'accueil après lui avoir fait signer un mandat.
 */
export async function GET(request: NextRequest) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");
  const next = searchParams.get("next") ?? "/dashboard";

  function versLogin(erreur: string) {
    const url = new URL("/login", origin);
    url.searchParams.set("erreur", erreur);
    url.searchParams.set("next", next);
    return NextResponse.redirect(url);
  }

  if (!code) {
    // Le détail de l'échec est dans le fragment (#error=...), que le
    // navigateur ne transmet jamais au serveur. On ne peut donc pas le
    // lire ici : c'est la page de connexion qui le récupérera.
    return versLogin("lien_perime");
  }

  const supabase = createClient();
  const { error } = await supabase.auth.exchangeCodeForSession(code);

  if (error) {
    return versLogin("lien_autre_navigateur");
  }

  return NextResponse.redirect(`${origin}${next}`);
}
