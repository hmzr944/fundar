"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Spinner } from "@/components/ui";
import { PasswordField } from "@/components/password-field";
import { api } from "@/lib/client/api";
import { eurosShort } from "@/lib/fee";

const input =
  "w-full rounded-lg border border-line-strong bg-elev px-3 py-2 text-sm outline-none placeholder:text-faint focus:border-accent";

export function PasswordForm() {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, setPending] = useState(false);
  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const f = new FormData(form);
    setPending(true);
    try {
      await api("/api/account/password", { method: "POST", json: { current: f.get("current"), next: f.get("next") } });
      setMsg({ ok: true, text: "Mot de passe modifié. Vos autres sessions ont été déconnectées." });
      form.reset();
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally {
      setPending(false);
    }
  }
  return (
    <form onSubmit={submit} className="grid max-w-md gap-3">
      <PasswordField label="Mot de passe actuel" name="current" autoComplete="current-password" required />
      <PasswordField label="Nouveau mot de passe" name="next" autoComplete="new-password" required minLength={10} hint="10 caractères minimum." />
      {msg && <p role={msg.ok ? "status" : "alert"} className={`text-sm ${msg.ok ? "text-success" : "text-danger"}`}>{msg.text}</p>}
      <Button type="submit" disabled={pending} className="justify-self-start">
        {pending && <Spinner />} Modifier le mot de passe
      </Button>
    </form>
  );
}

export function DangerZone() {
  const router = useRouter();
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState<null | "data" | "account">(null);

  async function deleteData() {
    if (!confirm("Supprimer TOUTES vos missions, documents et livrables ? Cette action est irréversible.")) return;
    setPending("data");
    try {
      const res = await api<{ deletedFiles: number }>("/api/account/data", { method: "DELETE" });
      setMsg({ ok: true, text: `Toutes vos missions ont été supprimées (${res.deletedFiles} fichier(s)).` });
      router.refresh();
    } catch (e) {
      setMsg({ ok: false, text: (e as Error).message });
    } finally {
      setPending(null);
    }
  }

  async function deleteAccount(e: React.FormEvent) {
    e.preventDefault();
    if (!confirm("Supprimer définitivement votre compte et toutes vos données ?")) return;
    setPending("account");
    try {
      await api("/api/account", { method: "DELETE", json: { password } });
      router.replace("/");
      router.refresh();
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
      setPending(null);
    }
  }

  return (
    <div className="space-y-5">
      <div>
        <p className="text-sm">Supprimer toutes les missions, conversations, documents importés, livrables, sources et journaux.</p>
        <Button variant="danger" className="mt-2" onClick={deleteData} disabled={pending !== null}>
          {pending === "data" && <Spinner />} Supprimer toutes mes données
        </Button>
      </div>
      <form onSubmit={deleteAccount} className="max-w-md space-y-2">
        <p className="text-sm">Supprimer le compte et toutes les données associées.</p>
        <PasswordField
          label="Confirmez avec votre mot de passe"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
        />
        <Button type="submit" variant="danger" disabled={pending !== null || !password}>
          {pending === "account" && <Spinner />} Supprimer mon compte
        </Button>
      </form>
      {msg && <p role={msg.ok ? "status" : "alert"} className={`text-sm ${msg.ok ? "text-success" : "text-danger"}`}>{msg.text}</p>}
    </div>
  );
}

export function PlusSection({
  active,
  canceledAt,
  currentPeriodEnd,
  priceCents,
  feeDiscountPct,
  costMultiplier,
}: {
  active: boolean;
  canceledAt?: string;
  currentPeriodEnd?: string;
  priceCents: number;
  feeDiscountPct: number;
  costMultiplier: number;
}) {
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  async function subscribe() {
    setPending(true);
    setMsg(null);
    try {
      const { url } = await api<{ url: string }>("/api/account/plus", { method: "POST" });
      window.location.assign(url);
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
      setPending(false);
    }
  }

  async function cancel() {
    if (!confirm("Résilier Atlas Plus ? Vous garderez l'avantage jusqu'à la fin de la période déjà payée.")) return;
    setPending(true);
    setMsg(null);
    try {
      await api("/api/account/plus/cancel", { method: "POST" });
      setMsg({ ok: true, text: "Résiliation enregistrée. L'avantage reste actif jusqu'à la fin de la période en cours." });
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally {
      setPending(false);
    }
  }

  if (active) {
    return (
      <div className="space-y-2 text-sm" data-testid="plus-active">
        <p>
          <span className="text-success">●</span> Atlas Plus actif
          {currentPeriodEnd && !canceledAt && ` — renouvellement le ${new Date(currentPeriodEnd).toLocaleDateString("fr-FR")}`}
          {canceledAt && currentPeriodEnd && ` — actif jusqu'au ${new Date(currentPeriodEnd).toLocaleDateString("fr-FR")}, puis résilié`}
        </p>
        <p className="text-muted">
          Commission réduite de {feeDiscountPct} % sur chaque dossier réglé, et budget d&apos;IA multiplié par {costMultiplier} par dossier.
        </p>
        {!canceledAt && (
          <Button variant="ghost" onClick={cancel} disabled={pending}>
            {pending && <Spinner />} Résilier votre contrat
          </Button>
        )}
        {msg && <p role={msg.ok ? "status" : "alert"} className={`text-sm ${msg.ok ? "text-success" : "text-danger"}`}>{msg.text}</p>}
      </div>
    );
  }

  return (
    <div className="space-y-2 text-sm" data-testid="plus-inactive">
      <p>
        {eurosShort(priceCents)} € par mois, résiliable à tout moment. Réduit la commission de {feeDiscountPct} % sur chaque dossier réglé et
        multiplie par {costMultiplier} le budget d&apos;IA disponible par dossier. Se rentabilise dès qu&apos;un dossier de valeur moyenne se
        règle dans le mois.
      </p>
      <Button variant="primary" onClick={subscribe} disabled={pending} data-testid="plus-subscribe">
        {pending && <Spinner />} Devenir Atlas Plus
      </Button>
      {msg && <p role="alert" className="text-sm text-danger">{msg.text}</p>}
    </div>
  );
}

export function PostalAddressForm({ address }: { address: { name: string; address1: string; address2?: string; postalCode: string; city: string; country: string } | null }) {
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);
  const [pending, setPending] = useState(false);

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setPending(true);
    setMsg(null);
    try {
      await api("/api/account/postal-address", {
        method: "POST",
        json: {
          name: f.get("name"),
          address1: f.get("address1"),
          address2: f.get("address2") || undefined,
          postalCode: f.get("postalCode"),
          city: f.get("city"),
          country: f.get("country") || "France",
        },
      });
      setMsg({ ok: true, text: "Adresse enregistrée." });
    } catch (err) {
      setMsg({ ok: false, text: (err as Error).message });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={submit} className="grid max-w-md gap-3">
      <p className="text-xs text-muted">
        Utilisée comme adresse d&apos;expéditeur si vous demandez à Atlas d&apos;envoyer une lettre recommandée (LRAR).
      </p>
      <label className="text-sm">
        Nom
        <input name="name" defaultValue={address?.name} required className={`${input} mt-1`} />
      </label>
      <label className="text-sm">
        Adresse
        <input name="address1" defaultValue={address?.address1} required className={`${input} mt-1`} />
      </label>
      <label className="text-sm">
        Complément (facultatif)
        <input name="address2" defaultValue={address?.address2} className={`${input} mt-1`} />
      </label>
      <div className="grid grid-cols-2 gap-3">
        <label className="text-sm">
          Code postal
          <input name="postalCode" defaultValue={address?.postalCode} required className={`${input} mt-1`} />
        </label>
        <label className="text-sm">
          Ville
          <input name="city" defaultValue={address?.city} required className={`${input} mt-1`} />
        </label>
      </div>
      <label className="text-sm">
        Pays
        <input name="country" defaultValue={address?.country ?? "France"} className={`${input} mt-1`} />
      </label>
      {msg && <p role={msg.ok ? "status" : "alert"} className={`text-sm ${msg.ok ? "text-success" : "text-danger"}`}>{msg.text}</p>}
      <Button type="submit" disabled={pending} className="justify-self-start">
        {pending && <Spinner />} Enregistrer
      </Button>
    </form>
  );
}
