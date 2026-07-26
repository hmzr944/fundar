import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * Suppression de compte RGPD (§7). Supprime l'utilisateur auth.users ;
 * profiles/claims/documents/signatures/consentements suivent par
 * ON DELETE CASCADE (voir supabase/migrations/0001_init.sql).
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
  const { error } = await admin.auth.admin.deleteUser(user.id);

  if (error) {
    return NextResponse.json(
      { erreur: "La suppression a échoué. Réessayez ou contactez le support." },
      { status: 500 }
    );
  }

  return NextResponse.json({ statut: "SUPPRIME" });
}
