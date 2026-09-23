import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { currentUser } from "@/lib/http";
import { AuthForm } from "../auth-form";

export const metadata: Metadata = { title: "Connexion" };

export default async function Page() {
  if (await currentUser()) redirect("/app");
  return (
    <Suspense>
      <AuthForm mode="login" />
    </Suspense>
  );
}
