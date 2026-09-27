"use client";

import { useState } from "react";
import { Button } from "@/components/ui";

/** Every satisfied client is a distribution channel — no ad spend needed to reach the next one. */
export function ReferralCard({ code, creditCents, rewardCents }: { code: string; creditCents: number; rewardCents: number }) {
  const [copied, setCopied] = useState(false);
  const link = typeof window !== "undefined" ? `${window.location.origin}/signup?ref=${code}` : `/signup?ref=${code}`;

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be unavailable (permissions, insecure context); the link is still visible to copy by hand.
    }
  }

  return (
    <div className="rounded-2xl border border-line bg-surface/60 px-5 py-4 text-sm" data-testid="referral-card">
      <p className="font-medium">Invitez un ami</p>
      <p className="mt-1 text-muted">
        Dès qu&apos;il paie sa première commission, vous recevez {(rewardCents / 100).toFixed(2).replace(".", ",")} € de crédit, déduits
        automatiquement de votre prochaine commission.
        {creditCents > 0 && (
          <>
            {" "}
            Vous avez actuellement <strong>{(creditCents / 100).toFixed(2).replace(".", ",")} €</strong> de crédit.
          </>
        )}
      </p>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <code className="rounded-lg border border-line bg-elev px-2 py-1 text-xs" data-testid="referral-link">
          {link}
        </code>
        <Button variant="ghost" onClick={copy} data-testid="referral-copy">
          {copied ? "Copié !" : "Copier le lien"}
        </Button>
      </div>
    </div>
  );
}
