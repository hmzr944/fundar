import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  const { email, compagnie, numeroVol } = await request.json();

  if (!email || !compagnie) {
    return NextResponse.json(
      { erreur: "Email et compagnie requis." },
      { status: 400 }
    );
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("waitlist")
    .insert({ email, compagnie, numero_vol: numeroVol ?? null });

  if (error) {
    return NextResponse.json(
      { erreur: "Impossible d'enregistrer votre email pour le moment." },
      { status: 500 }
    );
  }

  return NextResponse.json({ statut: "ENREGISTRE" });
}
