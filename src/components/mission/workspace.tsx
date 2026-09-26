"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { Alert, Button, Card, cx, MissionStatusBadge, Spinner } from "@/components/ui";
import { api } from "@/lib/client/api";
import type { MissionDetailDTO } from "@/lib/client/types";
import { Conversation } from "./conversation";
import { PlanPanel } from "./plan-panel";
import { ResultsPanel } from "./results-panel";
import { DocumentsPanel, JournalPanel, SourcesPanel } from "./side-panels";

type Tab = "plan" | "results" | "sources" | "documents" | "journal";

export function MissionWorkspace({ initial }: { initial: MissionDetailDTO }) {
  const router = useRouter();
  const [data, setData] = useState(initial);
  const [tab, setTab] = useState<Tab>(initial.artifacts.length ? "results" : "plan");
  const [busy, setBusy] = useState<null | "run" | "cancel" | "analyze" | "delete">(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const id = data.mission.id;
  const active = data.activeRun;
  const locked = Boolean(active);

  const refresh = useCallback(async () => {
    try {
      const next = await api<MissionDetailDTO>(`/api/missions/${id}`);
      setData(next);
      setLoadError(null);
    } catch (e) {
      setLoadError((e as Error).message);
    }
  }, [id]);

  // Poll while Atlas works; stop as soon as the run is over.
  useEffect(() => {
    if (!active) return;
    const t = setInterval(refresh, 2000);
    return () => clearInterval(t);
  }, [active, refresh]);

  // Back from the payment page: the confirmation arrives from Stripe a few seconds later.
  const paiement = useSearchParams().get("paiement");
  const paymentReturn = paiement === "ok" || paiement === "annule" ? paiement : null;
  const paid = Boolean(data.mission.payment?.paidAt);
  useEffect(() => {
    if (paymentReturn !== "ok" || paid || active) return;
    const started = Date.now();
    const t = setInterval(() => {
      if (Date.now() - started > 120_000) clearInterval(t);
      else void refresh();
    }, 3000);
    return () => clearInterval(t);
  }, [paymentReturn, paid, active, refresh]);

  const [checkoutOpen, setCheckoutOpen] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [immediate, setImmediate] = useState(false);
  async function checkout() {
    setActionError(null);
    try {
      const { url } = await api<{ url: string }>(`/api/missions/${id}/checkout`, {
        method: "POST",
        json: { acceptTerms, immediateExecution: immediate },
      });
      window.location.assign(url);
    } catch (e) {
      setActionError((e as Error).message);
    }
  }

  async function act(kind: "run" | "cancel" | "analyze") {
    setBusy(kind);
    setActionError(null);
    try {
      if (kind === "run") await api(`/api/missions/${id}/run`, { method: "POST" });
      if (kind === "cancel") await api(`/api/missions/${id}/run`, { method: "DELETE" });
      if (kind === "analyze") await api(`/api/missions/${id}/analyze`, { method: "POST" });
      await refresh();
    } catch (e) {
      setActionError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  async function remove() {
    if (!confirm("Supprimer définitivement cette mission, ses documents et ses livrables ?")) return;
    setBusy("delete");
    try {
      await api(`/api/missions/${id}`, { method: "DELETE" });
      router.push("/app/history");
      router.refresh();
    } catch (e) {
      setActionError((e as Error).message);
      setBusy(null);
    }
  }

  const { mission, steps, integrations } = data;
  const blocking = mission.missingInfo.filter((m) => m.blocking);
  const optional = mission.missingInfo.filter((m) => !m.blocking);
  const runnable = steps.some((s) => !["DONE", "SKIPPED"].includes(s.status) && s.kind !== "user_action");
  const userSteps = steps.filter((s) => s.kind === "user_action" && !["DONE", "SKIPPED"].includes(s.status));
  const hasRun = data.runs.some((r) => r.kind === "execution");
  const canRun = integrations.llm.available && !locked && steps.length > 0 && blocking.length === 0 && runnable;
  const mustPay = integrations.billing.enabled && !paid;
  const price = ((integrations.billing.priceCents ?? 0) / 100).toFixed(2).replace(".", ",");
  const lastRun = data.runs[0];
  const analysisFailed = !locked && lastRun?.kind === "analysis" && lastRun.status === "FAILED";

  const tabs: { key: Tab; label: string; count?: number }[] = [
    { key: "plan", label: "Plan", count: steps.length },
    { key: "results", label: "Résultats", count: data.artifacts.length },
    { key: "sources", label: "Sources", count: data.sources.length },
    { key: "documents", label: "Documents", count: data.documents.length },
    { key: "journal", label: "Journal" },
  ];

  return (
    <div className="space-y-6">
      <div>
        <Link href="/app/history" className="text-sm text-muted hover:text-fg">
          ← Missions
        </Link>
        <div className="mt-3 flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-3">
              <h1 className="text-2xl font-semibold tracking-tight" data-testid="mission-title">
                {mission.title}
              </h1>
              <MissionStatusBadge status={mission.status} />
            </div>
            {mission.objective && <p className="mt-2 max-w-3xl text-muted">{mission.objective}</p>}
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            {locked ? (
              <Button variant="danger" onClick={() => act("cancel")} disabled={busy !== null || active?.cancelRequested}>
                {busy === "cancel" && <Spinner />} {active?.cancelRequested ? "Interruption…" : "Interrompre"}
              </Button>
            ) : (
              <>
                {steps.length > 0 && mustPay && (
                  <Button variant="primary" onClick={() => setCheckoutOpen(true)} disabled={!canRun || busy !== null} data-testid="pay-button">
                    Confier mon dossier à Atlas — {price} €
                  </Button>
                )}
                {steps.length > 0 && !mustPay && (
                  <Button variant="primary" onClick={() => act("run")} disabled={!canRun || busy !== null} data-testid="run-button">
                    {busy === "run" && <Spinner />} {hasRun ? "Reprendre l'exécution" : "Lancer l'exécution"}
                  </Button>
                )}
                {(analysisFailed || (steps.length === 0 && integrations.llm.available)) && (
                  <Button onClick={() => act("analyze")} disabled={busy !== null}>
                    {busy === "analyze" && <Spinner />} Relancer l&apos;analyse
                  </Button>
                )}
                <Button variant="ghost" onClick={remove} disabled={busy !== null}>
                  Supprimer
                </Button>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="space-y-3" aria-live="polite">
        {active && (
          <Alert tone="info" title={active.kind === "analysis" ? "Atlas analyse votre demande…" : "Atlas exécute le plan…"}>
            <span className="inline-flex items-center gap-2">
              <Spinner className="text-accent" />
              {active.kind === "execution"
                ? `${active.iterations} échange(s) avec le modèle, ${active.toolCalls} appel(s) d'outils jusqu'ici. Vous pouvez quitter la page : le travail continue.`
                : "Reformulation, questions éventuelles et plan d'action."}
            </span>
          </Alert>
        )}
        {checkoutOpen && mustPay && (
          <Alert tone="info" title={`Confier ce dossier à Atlas — ${price} € TTC, paiement unique`}>
            <p>
              Atlas prend en charge l&apos;ensemble du dossier : rédaction et vérification des courriers, suivi, relances et escalade.
              Vous envoyez vous-même les courriers en un clic. Atlas ne donne pas de conseil juridique et ne garantit pas le résultat.
            </p>
            <label className="mt-3 flex items-start gap-2 text-sm">
              <input type="checkbox" checked={acceptTerms} onChange={(e) => setAcceptTerms(e.target.checked)} data-testid="accept-terms" />
              <span>
                J&apos;accepte les{" "}
                <a href="/cgv" target="_blank" className="underline">
                  conditions générales de vente
                </a>{" "}
                et la{" "}
                <a href="/confidentialite" target="_blank" className="underline">
                  politique de confidentialité
                </a>
                .
              </span>
            </label>
            <label className="mt-2 flex items-start gap-2 text-sm">
              <input type="checkbox" checked={immediate} onChange={(e) => setImmediate(e.target.checked)} data-testid="immediate-execution" />
              <span>
                Je demande qu&apos;Atlas commence immédiatement, sans attendre la fin du délai de rétractation de 14 jours. Si je me rétracte
                pendant ce délai, je paierai la part du service déjà réalisée.
              </span>
            </label>
            <div className="mt-3 flex gap-2">
              <Button variant="primary" onClick={checkout} disabled={!acceptTerms || !immediate}>
                Payer {price} €
              </Button>
              <Button variant="ghost" onClick={() => setCheckoutOpen(false)}>
                Annuler
              </Button>
            </div>
          </Alert>
        )}
        {paymentReturn === "ok" && !paid && <Alert tone="info">Paiement effectué : confirmation en cours. Atlas démarrera automatiquement.</Alert>}
        {paymentReturn === "annule" && !paid && <Alert tone="warning">Paiement annulé : votre dossier n&apos;a pas été pris en charge.</Alert>}
        {actionError && <Alert tone="danger">{actionError}</Alert>}
        {loadError && <Alert tone="danger">Actualisation impossible : {loadError}</Alert>}
        {!integrations.llm.available && (
          <Alert tone="warning" title="Analyse automatique indisponible">
            Aucun modèle de langage n&apos;est configuré sur cette instance. Vous pouvez consulter la mission, importer des documents
            et suivre les étapes manuellement.
          </Alert>
        )}
        {!locked && mission.lastError && (
          <Alert tone="danger" title="Le dernier travail d'Atlas n'a pas abouti">
            {mission.lastError} Le travail déjà réalisé est conservé.
          </Alert>
        )}
        {!locked && blocking.length > 0 && (
          <Alert tone="warning" title="Atlas a besoin de ces informations pour avancer">
            <ol className="list-decimal space-y-0.5 pl-5">
              {blocking.map((q) => (
                <li key={q.question}>{q.question}</li>
              ))}
            </ol>
            <p className="mt-2 text-xs text-muted">Répondez dans la conversation : Atlas mettra le plan à jour.</p>
          </Alert>
        )}
        {mission.nextFollowUpAt && (
          <Alert tone="info" title={`Atlas reprendra ce dossier le ${new Date(mission.nextFollowUpAt).toLocaleDateString("fr-FR")}`}>
            <span data-testid="follow-up">{mission.followUpReason}</span>
            <p className="mt-1 text-xs text-muted">Vous n&apos;avez rien à faire d&apos;ici là. Si vous recevez une réponse avant, ajoutez-la à la conversation.</p>
          </Alert>
        )}
        {!locked && blocking.length === 0 && userSteps.length > 0 && !runnable && steps.length > 0 && (
          <Alert tone="warning" title="À vous de jouer">
            Il reste {userSteps.length} action(s) que vous seul pouvez réaliser. Pour un courrier prêt, utilisez le bouton
            « Envoyer » dans l&apos;onglet Résultats, puis « J&apos;ai envoyé ». Pour le reste, marquez les actions comme faites dans le plan.
          </Alert>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_400px]">
        <div className="min-w-0 space-y-6">
          {(mission.reformulation || mission.constraints.length > 0 || mission.unsupported.length > 0 || optional.length > 0) && (
            <Card>
              {mission.reformulation && (
                <>
                  <h2 className="text-sm font-semibold text-muted">Ce qu&apos;Atlas a compris</h2>
                  <p className="mt-1.5 text-sm">{mission.reformulation}</p>
                </>
              )}
              {mission.constraints.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-2">
                  {mission.constraints.map((c) => (
                    <span key={`${c.label}-${c.value}`} className="rounded-lg border border-line bg-elev px-2.5 py-1 text-xs">
                      <span className="text-faint">{c.label} :</span> {c.value}
                    </span>
                  ))}
                </div>
              )}
              {optional.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-muted">Précisions utiles (facultatives)</p>
                  <ul className="mt-1 list-disc pl-5 text-sm text-muted">
                    {optional.map((q) => (
                      <li key={q.question}>{q.question}</li>
                    ))}
                  </ul>
                </div>
              )}
              {mission.unsupported.length > 0 && (
                <div className="mt-4">
                  <p className="text-xs font-semibold text-warning">Hors de portée d&apos;Atlas</p>
                  <ul className="mt-1 space-y-1 text-sm">
                    {mission.unsupported.map((u) => (
                      <li key={u.request}>
                        <span className="font-medium">{u.request}</span> — <span className="text-muted">{u.reason}</span>
                        {u.alternative && <span className="block text-xs text-faint">Alternative : {u.alternative}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </Card>
          )}

          <Card className="p-0">
            <div role="tablist" aria-label="Sections de la mission" className="flex gap-1 overflow-x-auto border-b border-line px-3 pt-3">
              {tabs.map((t) => (
                <button
                  key={t.key}
                  role="tab"
                  id={`tab-${t.key}`}
                  aria-selected={tab === t.key}
                  aria-controls={`panel-${t.key}`}
                  onClick={() => setTab(t.key)}
                  className={cx(
                    "-mb-px whitespace-nowrap border-b-2 px-3 py-2 text-sm transition-colors",
                    tab === t.key ? "border-accent text-fg" : "border-transparent text-muted hover:text-fg",
                  )}
                >
                  {t.label}
                  {t.count !== undefined && <span className="ml-1.5 text-xs text-faint">{t.count}</span>}
                </button>
              ))}
            </div>
            <div role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`} className="p-4 sm:p-5">
              {tab === "plan" && <PlanPanel missionId={id} steps={steps} artifacts={data.artifacts} locked={locked} onChanged={refresh} />}
              {tab === "results" && <ResultsPanel mission={mission} artifacts={data.artifacts} locked={locked} onChanged={refresh} />}
              {tab === "sources" && <SourcesPanel sources={data.sources} searchAvailable={integrations.search.available} />}
              {tab === "documents" && <DocumentsPanel missionId={id} documents={data.documents} locked={locked} onChanged={refresh} />}
              {tab === "journal" && <JournalPanel runs={data.runs} usage={data.usage} />}
            </div>
          </Card>
        </div>

        <aside aria-label="Conversation">
          <Card className="lg:sticky lg:top-20">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-muted">Conversation</h2>
            <Conversation
              missionId={id}
              messages={data.messages}
              locked={locked}
              llmAvailable={integrations.llm.available}
              onSent={refresh}
            />
          </Card>
        </aside>
      </div>
    </div>
  );
}
