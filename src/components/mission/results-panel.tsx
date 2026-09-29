"use client";

import { useState } from "react";
import { Markdown } from "@/components/markdown";
import { Button, EmptyState, formatDate } from "@/components/ui";
import { api } from "@/lib/client/api";
import type { ArtifactDTO, MissionDTO, ReviewDTO } from "@/lib/client/types";

const TYPE_LABELS: Record<ArtifactDTO["type"], string> = {
  letter: "Courrier",
  email: "E-mail",
  checklist: "Checklist",
  action_plan: "Plan d'action",
  comparison_table: "Tableau comparatif",
  summary: "Synthèse",
  report: "Compte rendu",
  other: "Document",
};

export function ResultsPanel({
  mission,
  artifacts,
  locked,
  onChanged,
  postal,
  account,
}: {
  mission: MissionDTO;
  artifacts: ArtifactDTO[];
  locked: boolean;
  onChanged: () => void;
  postal: { enabled: boolean; priceCents?: number };
  account: { hasPostalAddress: boolean };
}) {
  return (
    <div className="space-y-6">
      {mission.report && (
        <section aria-labelledby="report-title" className="rounded-xl border border-line bg-elev/60 p-4">
          <h3 id="report-title" className="mb-2 text-sm font-semibold text-muted">
            Dernier compte rendu d&apos;Atlas
          </h3>
          <Markdown>{mission.report}</Markdown>
          {mission.remainingActions.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-warning">Ce qui vous reste à faire</p>
              <ul className="mt-1 list-disc pl-5 text-sm">
                {mission.remainingActions.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          )}
          {mission.limitations.length > 0 && (
            <div className="mt-4">
              <p className="text-sm font-semibold text-muted">Limites signalées</p>
              <ul className="mt-1 list-disc pl-5 text-sm text-muted">
                {mission.limitations.map((a) => (
                  <li key={a}>{a}</li>
                ))}
              </ul>
            </div>
          )}
        </section>
      )}

      <section aria-labelledby="deliverables-title">
        <h3 id="deliverables-title" className="mb-3 text-sm font-semibold text-muted">
          Livrables ({artifacts.length})
        </h3>
        {artifacts.length === 0 ? (
          <EmptyState title="Aucun livrable pour l'instant">Les documents produits par Atlas apparaîtront ici.</EmptyState>
        ) : (
          <div className="space-y-3">
            {artifacts.map((a) => (
              <ArtifactCard key={a.id} artifact={a} locked={locked} onChanged={onChanged} postal={postal} account={account} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}

function ArtifactCard({
  artifact,
  locked,
  onChanged,
  postal,
  account,
}: {
  artifact: ArtifactDTO;
  locked: boolean;
  onChanged: () => void;
  postal: { enabled: boolean; priceCents?: number };
  account: { hasPostalAddress: boolean };
}) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(artifact.content);
  const [status, setStatus] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const hasTable = /^\s*\|.*\|\s*$/m.test(artifact.content) && /^\s*\|?\s*:?-{2,}/m.test(artifact.content);

  async function copy() {
    try {
      await navigator.clipboard.writeText(artifact.content);
      setStatus("Copié dans le presse-papiers.");
    } catch {
      setStatus("La copie a été refusée par le navigateur.");
    }
    setTimeout(() => setStatus(null), 2500);
  }

  async function save() {
    setError(null);
    try {
      await api(`/api/artifacts/${artifact.id}`, { method: "PATCH", json: { content: draft } });
      setEditing(false);
      setStatus("Modifications enregistrées.");
      setTimeout(() => setStatus(null), 2500);
      onChanged();
    } catch (e) {
      setError((e as Error).message);
    }
  }

  return (
    <article className="rounded-xl border border-line bg-elev/60" data-testid="artifact">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="flex w-full items-center gap-3 px-4 py-3 text-left"
      >
        <span className="rounded-md bg-accent/10 px-2 py-0.5 text-xs font-medium text-accent">{TYPE_LABELS[artifact.type]}</span>
        <span className="min-w-0 flex-1 truncate font-medium">{artifact.name}</span>
        {artifact.editedByUser && <span className="text-xs text-faint">modifié par vous</span>}
        {artifact.sentAt ? (
          <span className="rounded-md border border-success/40 bg-success/5 px-2 py-0.5 text-xs font-medium text-success">
            Envoyé le {new Date(artifact.sentAt).toLocaleDateString("fr-FR")}
          </span>
        ) : (
          <ReadinessBadge ready={artifact.readyToSend} />
        )}
        <span className="hidden text-xs text-faint sm:inline">{formatDate(artifact.updatedAt)}</span>
        <span className="text-faint" aria-hidden>
          {open ? "▴" : "▾"}
        </span>
      </button>
      {open && (
        <div className="border-t border-line px-4 py-4">
          {editing ? (
            <div className="space-y-2">
              <label className="sr-only" htmlFor={`edit-${artifact.id}`}>
                Contenu du livrable (Markdown)
              </label>
              <textarea
                id={`edit-${artifact.id}`}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                rows={16}
                className="w-full rounded-lg border border-line bg-bg px-3 py-2 font-mono text-sm outline-none focus:border-accent"
              />
              <div className="flex gap-2">
                <Button variant="primary" onClick={save}>
                  Enregistrer
                </Button>
                <Button
                  variant="ghost"
                  onClick={() => {
                    setDraft(artifact.content);
                    setEditing(false);
                  }}
                >
                  Annuler
                </Button>
              </div>
            </div>
          ) : (
            <Markdown>{artifact.content}</Markdown>
          )}
          {artifact.send && <SendPanel artifact={artifact} locked={locked} onChanged={onChanged} />}
          {artifact.readyToSend && postal.enabled && <LrarPanel artifact={artifact} postal={postal} account={account} />}
          <ReviewDetails artifactId={artifact.id} review={artifact.review} ready={artifact.readyToSend} locked={locked} onChanged={onChanged} />
          <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-line pt-3">
            <Button className="px-2.5 py-1 text-xs" onClick={copy}>
              Copier
            </Button>
            {!editing && !locked && (
              <Button className="px-2.5 py-1 text-xs" onClick={() => setEditing(true)}>
                Modifier
              </Button>
            )}
            <a className="rounded-lg border border-line-strong px-2.5 py-1 text-xs hover:border-accent/60" href={`/api/artifacts/${artifact.id}/download?format=docx`}>
              Télécharger .docx
            </a>
            <a className="rounded-lg border border-line-strong px-2.5 py-1 text-xs hover:border-accent/60" href={`/api/artifacts/${artifact.id}/download?format=md`}>
              .md
            </a>
            {hasTable && (
              <a className="rounded-lg border border-line-strong px-2.5 py-1 text-xs hover:border-accent/60" href={`/api/artifacts/${artifact.id}/download?format=csv`}>
                .csv
              </a>
            )}
            {status && <span role="status" className="text-xs text-success">{status}</span>}
            {error && <span role="alert" className="text-xs text-danger">{error}</span>}
          </div>
        </div>
      )}
    </article>
  );
}

const VERDICT: Record<ReviewDTO["verdict"], { label: string; tone: string }> = {
  ok: { label: "Relu : rien à signaler", tone: "text-success border-success/40 bg-success/5" },
  to_fix: { label: "Relu : à vérifier", tone: "text-warning border-warning/40 bg-warning/5" },
  blocking: { label: "Relu : problème bloquant", tone: "text-danger border-danger/40 bg-danger/5" },
};

const SEVERITY_LABELS: Record<ReviewDTO["issues"][number]["severity"], string> = {
  blocking: "Bloquant",
  to_fix: "À corriger",
  note: "Remarque",
};

const CATEGORY_LABELS: Record<ReviewDTO["issues"][number]["category"], string> = {
  promise: "Promesse ou avis",
  unsupported_fact: "Fait non étayé",
  inconsistency: "Incohérence avec les pièces",
  legal_reference: "Référence juridique à vérifier",
  sensitive_data: "Donnée sensible",
  missing_info: "Information manquante",
  tone: "Ton",
  other: "Autre",
};

function ReviewBadge({ review }: { review: ReviewDTO }) {
  const v = VERDICT[review.verdict];
  return (
    <span className={`rounded-md border px-2 py-0.5 text-xs font-medium ${review.stale ? "border-line-strong text-faint" : v.tone}`} data-testid="review-badge">
      {review.stale ? "Relecture à refaire" : v.label}
    </span>
  );
}

function ReadinessBadge({ ready }: { ready: boolean }) {
  return (
    <span
      className={`rounded-md border px-2 py-0.5 text-xs font-medium ${ready ? "border-success/40 bg-success/5 text-success" : "border-warning/40 bg-warning/5 text-warning"}`}
      data-testid="readiness"
      data-ready={ready}
    >
      {ready ? "Prêt à envoyer" : "À vérifier avant envoi"}
    </span>
  );
}

function ReviewDetails({
  artifactId,
  review,
  ready,
  locked,
  onChanged,
}: {
  artifactId: string;
  review: ReviewDTO | null;
  ready: boolean;
  locked: boolean;
  onChanged: () => void;
}) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function rerun() {
    setBusy(true);
    setError(null);
    try {
      await api(`/api/artifacts/${artifactId}/review`, { method: "POST" });
      onChanged();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-4 rounded-lg border border-line bg-bg/40 p-3" aria-label="Relecture automatique" data-testid="review-details">
      <div className="flex flex-wrap items-center gap-2">
        <p className="text-sm font-semibold text-muted">Relecture automatique</p>
        {review ? <ReviewBadge review={review} /> : <span className="text-xs text-faint">pas encore relu</span>}
        {!locked && (
          <Button className="ml-auto px-2.5 py-1 text-xs" onClick={rerun} disabled={busy}>
            {busy ? "Relecture…" : review ? "Relire à nouveau" : "Relire"}
          </Button>
        )}
      </div>
      <p className="mt-2 text-xs text-muted">
        {ready
          ? "Relecture complète sans problème, aucun champ à compléter : ce texte peut être envoyé tel quel."
          : "Pas encore prêt : corrigez les points ci-dessous, complétez les champs [À COMPLÉTER] ou relancez la relecture."}
      </p>
      {review?.stale && <p className="mt-2 text-xs text-faint">Le texte a été modifié après cette relecture : relancez-la pour vérifier la nouvelle version.</p>}
      {review?.note && <p className="mt-2 text-xs text-warning">{review.note}</p>}
      {review && review.issues.length > 0 && (
        <ul className="mt-3 space-y-2">
          {review.issues.map((i, n) => (
            <li key={n} className="text-sm">
              <span className="font-medium">
                {SEVERITY_LABELS[i.severity]} · {CATEGORY_LABELS[i.category]}
              </span>
              {i.excerpt && <span className="block text-xs italic text-faint">« {i.excerpt} »</span>}
              <span className="block">{i.problem}</span>
              {i.suggestion && <span className="block text-xs text-muted">Suggestion : {i.suggestion}</span>}
            </li>
          ))}
        </ul>
      )}
      <p className="mt-2 text-xs text-faint">
        Relecture par règles fixes et par un second passage du modèle. Elle aide à repérer les erreurs, mais ne remplace pas votre vérification avant envoi.
      </p>
      {error && (
        <p role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      )}
    </section>
  );
}

/** Plain text for an e-mail body: Markdown markers removed, layout kept. */
function plainText(markdown: string) {
  return markdown
    .replace(/^#{1,6}\s+/gm, "")
    .replace(/\*\*(.+?)\*\*/g, "$1")
    .replace(/__(.+?)__/g, "$1")
    .replace(/\[([^\]]+)\]\((https?:[^)]+)\)/g, "$1 ($2)")
    .trim();
}

const LRAR_STATUS_LABEL: Record<NonNullable<ArtifactDTO["postalLetter"]>["status"], string> = {
  PENDING_PAYMENT: "En attente de paiement",
  PAID: "Payée, envoi en cours",
  SENT: "Envoyée par La Poste",
  FAILED: "Échec de l'envoi",
};

function LrarPanel({
  artifact,
  postal,
  account,
}: {
  artifact: ArtifactDTO;
  postal: { enabled: boolean; priceCents?: number };
  account: { hasPostalAddress: boolean };
}) {
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const price = ((postal.priceCents ?? 0) / 100).toFixed(2).replace(".", ",");
  const letter = artifact.postalLetter;

  async function submit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const f = new FormData(e.currentTarget);
    setBusy(true);
    setError(null);
    try {
      const { url } = await api<{ url: string }>(`/api/artifacts/${artifact.id}/lrar`, {
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
      window.location.assign(url);
    } catch (err) {
      setError((err as Error).message);
      setBusy(false);
    }
  }

  if (letter && letter.status !== "FAILED") {
    return (
      <section className="mt-3 rounded-lg border border-line bg-bg/40 p-3 text-sm" data-testid="lrar-panel">
        <p className="font-semibold text-muted">Lettre recommandée (LRAR)</p>
        <p className="mt-1">
          {LRAR_STATUS_LABEL[letter.status]}
          {letter.trackingUrl && (
            <>
              {" — "}
              <a href={letter.trackingUrl} target="_blank" rel="noopener noreferrer" className="underline">
                suivi
              </a>
            </>
          )}
        </p>
      </section>
    );
  }

  return (
    <section className="mt-3 rounded-lg border border-line bg-bg/40 p-3 text-sm" data-testid="lrar-panel">
      <p className="font-semibold text-muted">Aller plus loin : lettre recommandée avec accusé de réception</p>
      <p className="mt-1 text-xs text-muted">
        Un e-mail est souvent ignoré. Pour {price} €, Atlas envoie ce courrier en recommandé physique par La Poste, à votre nom.
        {letter?.status === "FAILED" && (
          <span className="mt-1 block text-danger">L&apos;envoi précédent a échoué ({letter.failure}) : contactez le support, la lettre est payée.</span>
        )}
      </p>
      {!account.hasPostalAddress ? (
        <p className="mt-2">
          Renseignez d&apos;abord{" "}
          <a href="/app/settings" className="underline">
            votre adresse postale d&apos;expéditeur
          </a>{" "}
          dans Paramètres.
        </p>
      ) : !open ? (
        <Button className="mt-2 px-2.5 py-1 text-xs" onClick={() => setOpen(true)} data-testid="lrar-open">
          Envoyer en recommandé — {price} €
        </Button>
      ) : (
        <form onSubmit={submit} className="mt-2 grid gap-2 sm:grid-cols-2">
          <input name="name" placeholder="Destinataire (société)" required className="rounded-lg border border-line bg-bg px-2 py-1 sm:col-span-2" />
          <input name="address1" placeholder="Adresse" required className="rounded-lg border border-line bg-bg px-2 py-1 sm:col-span-2" />
          <input name="address2" placeholder="Complément (facultatif)" className="rounded-lg border border-line bg-bg px-2 py-1 sm:col-span-2" />
          <input name="postalCode" placeholder="Code postal" required className="rounded-lg border border-line bg-bg px-2 py-1" />
          <input name="city" placeholder="Ville" required className="rounded-lg border border-line bg-bg px-2 py-1" />
          {error && (
            <p role="alert" className="text-xs text-danger sm:col-span-2">
              {error}
            </p>
          )}
          <div className="flex gap-2 sm:col-span-2">
            <Button type="submit" variant="primary" className="px-2.5 py-1 text-xs" disabled={busy} data-testid="lrar-submit">
              {busy ? "…" : `Payer ${price} € et envoyer`}
            </Button>
            <Button type="button" variant="ghost" className="px-2.5 py-1 text-xs" onClick={() => setOpen(false)} disabled={busy}>
              Annuler
            </Button>
          </div>
        </form>
      )}
    </section>
  );
}

function SendPanel({ artifact, locked, onChanged }: { artifact: ArtifactDTO; locked: boolean; onChanged: () => void }) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const send = artifact.send!;
  const body = plainText(artifact.content);
  const to = encodeURIComponent(send.to);
  const subject = encodeURIComponent(send.subject);
  const encodedBody = encodeURIComponent(body);
  const mailto = `mailto:${to}?subject=${subject}&body=${encodedBody}`;
  // Plain compose deep links — no Google/Microsoft sign-in or account access, just a pre-filled draft in the browser.
  const gmailCompose = `https://mail.google.com/mail/?view=cm&fs=1&to=${to}&su=${subject}&body=${encodedBody}`;
  const outlookCompose = `https://outlook.office.com/mail/deeplink/compose?to=${to}&subject=${subject}&body=${encodedBody}`;

  async function copyText() {
    try {
      await navigator.clipboard.writeText(`À : ${send.to}\nObjet : ${send.subject}\n\n${body}`);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard can be unavailable; the text is still visible above to select by hand.
    }
  }

  async function confirmSent() {
    setBusy(true);
    setError(null);
    try {
      await api(`/api/artifacts/${artifact.id}/sent`, { method: "POST" });
      onChanged();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="mt-4 rounded-lg border border-line bg-bg/40 p-3" aria-label="Envoi" data-testid="send-panel">
      <p className="text-sm font-semibold text-muted">Envoi</p>
      <p className="mt-1 text-sm">
        À : <span className="font-medium">{send.to}</span> · Objet : {send.subject}
      </p>
      {!send.confirmed && (
        <p className="mt-1 text-xs text-warning">
          Cette adresse a été proposée par Atlas mais ne figure pas dans vos messages ou documents : vérifiez-la avant d&apos;envoyer.
        </p>
      )}
      {artifact.sentAt ? (
        <p className="mt-2 text-sm text-success">
          Envoyé le {new Date(artifact.sentAt).toLocaleDateString("fr-FR")}.
          {send.followUpDays ? ` Atlas vérifiera la réponse dans ${send.followUpDays} jours.` : ""}
        </p>
      ) : artifact.readyToSend ? (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <a className="rounded-lg bg-accent px-3 py-1.5 text-sm font-semibold text-accent-contrast hover:bg-accent-strong" href={gmailCompose} target="_blank" rel="noopener noreferrer" data-testid="send-link-gmail">
            Envoyer avec Gmail
          </a>
          <a className="rounded-lg border border-line-strong px-3 py-1.5 text-sm font-medium hover:bg-elev" href={outlookCompose} target="_blank" rel="noopener noreferrer" data-testid="send-link-outlook">
            Envoyer avec Outlook
          </a>
          <a className="rounded-lg border border-line-strong px-3 py-1.5 text-sm font-medium hover:bg-elev" href={mailto} data-testid="send-link">
            Autre messagerie
          </a>
          <Button variant="ghost" className="px-2.5 py-1 text-xs" onClick={copyText} data-testid="send-copy">
            {copied ? "Copié !" : "Copier le texte"}
          </Button>
          {!locked && (
            <Button className="px-2.5 py-1 text-xs" onClick={confirmSent} disabled={busy}>
              {busy ? "Enregistrement…" : "J'ai envoyé"}
            </Button>
          )}
          <p className="w-full text-xs text-faint">
            Le message s&apos;ouvre prêt, à vérifier avant d&apos;envoyer. Puis cliquez sur « J&apos;ai envoyé ».
            {send.followUpDays ? ` Atlas reprendra ensuite le dossier seul dans ${send.followUpDays} jours.` : ""}
          </p>
        </div>
      ) : (
        <p className="mt-2 text-xs text-warning">L&apos;envoi sera possible quand le courrier sera « Prêt à envoyer » (voir la relecture ci-dessous).</p>
      )}
      {error && (
        <p role="alert" className="mt-2 text-xs text-danger">
          {error}
        </p>
      )}
    </section>
  );
}
