"use client";

import { useState } from "react";
import { Spinner } from "@/components/ui";
import { api } from "@/lib/client/api";

/** Shown in the app until the account's address is confirmed. */
export function VerifyEmailBanner({ email }: { email: string }) {
  const [state, setState] = useState<"idle" | "sending" | "sent">("idle");
  const [error, setError] = useState<string | null>(null);

  async function resend() {
    setState("sending");
    setError(null);
    try {
      await api("/api/account/verify-email", { method: "POST" });
      setState("sent");
    } catch (e) {
      setError((e as Error).message);
      setState("idle");
    }
  }

  return (
    <div role="status" className="glass rounded-none border-x-0 border-t-0 px-4 py-2.5 text-center text-sm">
      <span className="mr-2 inline-block h-2 w-2 rounded-full bg-accent align-middle animate-atlas-pulse" aria-hidden />
      Confirmez votre adresse <strong className="font-medium">{email}</strong> pour recevoir les nouvelles de vos dossiers.{" "}
      {state === "sent" ? (
        <span className="text-sky">Lien envoyé, regardez votre boîte mail.</span>
      ) : (
        <button onClick={resend} disabled={state === "sending"} className="inline-flex items-center gap-1 font-medium text-sky underline underline-offset-2 hover:no-underline">
          {state === "sending" && <Spinner className="h-3 w-3" />} Renvoyer le lien
        </button>
      )}
      {error && <span className="ml-2 text-danger">{error}</span>}
    </div>
  );
}
