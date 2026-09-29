import type { Metadata } from "next";
import { AuthShell } from "../auth-shell";
import { ForgotForm } from "./forgot-form";

export const metadata: Metadata = { title: "Mot de passe oublié" };

export default function Page() {
  return (
    <AuthShell tagline="Un oubli, ça arrive. Vos dossiers vous attendent.">
      <ForgotForm />
    </AuthShell>
  );
}
