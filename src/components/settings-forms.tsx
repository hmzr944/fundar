"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Button, Spinner } from "@/components/ui";
import { api } from "@/lib/client/api";

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
      <label className="text-sm">
        Mot de passe actuel
        <input name="current" type="password" autoComplete="current-password" required className={`${input} mt-1`} />
      </label>
      <label className="text-sm">
        Nouveau mot de passe (10 caractères minimum)
        <input name="next" type="password" autoComplete="new-password" required minLength={10} className={`${input} mt-1`} />
      </label>
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
      const res = await api<{ deletedFiles: number; pendingFiles: number }>("/api/account/data", { method: "DELETE" });
      setMsg({
        ok: true,
        text:
          `Toutes vos missions ont été supprimées et ne sont plus accessibles (${res.deletedFiles} fichier(s) effacé(s)).` +
          (res.pendingFiles ? ` ${res.pendingFiles} fichier(s) seront effacés lors du prochain traitement de la file de suppression.` : ""),
      });
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
        <label className="block text-sm">
          Confirmez avec votre mot de passe
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} required autoComplete="current-password" className={`${input} mt-1`} />
        </label>
        <Button type="submit" variant="danger" disabled={pending !== null || !password}>
          {pending === "account" && <Spinner />} Supprimer mon compte
        </Button>
      </form>
      {msg && <p role={msg.ok ? "status" : "alert"} className={`text-sm ${msg.ok ? "text-success" : "text-danger"}`}>{msg.text}</p>}
    </div>
  );
}
