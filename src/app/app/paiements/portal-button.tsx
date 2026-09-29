"use client";

import { useState } from "react";
import { Button, Spinner } from "@/components/ui";
import { api } from "@/lib/client/api";

/** Hands off to Stripe's hosted portal: card data never touches Nimbrel. */
export function PortalButton({ className }: { className?: string }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function open() {
    setBusy(true);
    setError(null);
    try {
      const { url } = await api<{ url: string }>("/api/account/billing-portal", { method: "POST" });
      window.location.assign(url);
    } catch (e) {
      setError((e as Error).message);
      setBusy(false);
    }
  }

  return (
    <div className={className}>
      <Button variant="primary" onClick={open} disabled={busy}>
        {busy && <Spinner className="h-3.5 w-3.5" />} Gérer ma carte et mes factures
      </Button>
      {error && (
        <p role="alert" className="msg-in mt-2 text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}
