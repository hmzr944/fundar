import type { Metadata } from "next";
import { getDb } from "@/db";
import { DangerZone, PasswordForm } from "@/components/settings-forms";
import { Card, SectionTitle } from "@/components/ui";
import { config } from "@/lib/config";
import { requirePageUser } from "@/lib/http";
import { integrationStatus } from "@/server/deps";
import { usageSummary } from "@/server/missions/service";

export const metadata: Metadata = { title: "Paramètres" };

export default async function Settings() {
  const user = await requirePageUser();
  const usage = await usageSummary(getDb(), user.id, 30);
  const integ = integrationStatus();
  const limits = config.limits;
  const cost = usage.estimatedCostUsd === null ? null : Number(usage.estimatedCostUsd);
  return (
    <div className="max-w-3xl space-y-6">
      <h1 className="text-2xl font-semibold tracking-tight">Paramètres</h1>

      <Card>
        <SectionTitle>Compte</SectionTitle>
        <dl className="grid gap-2 text-sm sm:grid-cols-[160px_1fr]">
          <dt className="text-muted">E-mail</dt>
          <dd>{user.email}</dd>
          <dt className="text-muted">Nom</dt>
          <dd>{user.name ?? "—"}</dd>
          <dt className="text-muted">Créé le</dt>
          <dd>{user.createdAt.toLocaleDateString("fr-FR")}</dd>
        </dl>
        <div className="mt-6">
          <PasswordForm />
        </div>
      </Card>

      <Card>
        <SectionTitle>Capacités de cette instance</SectionTitle>
        <ul className="space-y-2 text-sm">
          <li>
            <span className={integ.llm.available ? "text-success" : "text-warning"}>●</span> Modèle de langage :{" "}
            {integ.llm.available
              ? integ.llm.testDouble
                ? "script de test (aucun modèle réel)"
                : `${integ.llm.provider} — ${integ.llm.model}`
              : "non configuré (ANTHROPIC_API_KEY absente)"}
          </li>
          <li>
            <span className={integ.search.available ? "text-success" : "text-warning"}>●</span> Recherche web :{" "}
            {integ.search.available ? integ.search.provider : "non configurée (TAVILY_API_KEY ou BRAVE_SEARCH_API_KEY absente)"}
          </li>
          <li>
            <span className="text-success">●</span> Documents : PDF texte, DOCX, TXT, MD, CSV — {config.uploads.maxBytes / 1024 / 1024} Mo max
          </li>
          <li>
            <span className="text-faint">●</span> Non disponibles : appels, paiements, envoi d&apos;e-mails, connexion à vos comptes, rappels
            automatiques
          </li>
        </ul>
        <p className="mt-4 text-xs text-faint">
          Limites par exécution : {limits.maxIterations} échanges avec le modèle, {limits.maxToolCalls} appels d&apos;outils,{" "}
          {Math.round(limits.maxRunSeconds / 60)} min. Par 24 h : {limits.runsPerDay} exécutions, {limits.analysesPerDay} analyses.
        </p>
      </Card>

      <Card>
        <SectionTitle>Utilisation (30 derniers jours)</SectionTitle>
        <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {[
            ["Appels au modèle", usage.llmCalls],
            ["Appels d'outils", usage.toolCalls],
            ["Tokens", (usage.inputTokens + usage.outputTokens).toLocaleString("fr-FR")],
            ["Coût estimé", cost === null ? "non disponible" : `≈ ${cost.toFixed(2)} $`],
          ].map(([k, v]) => (
            <div key={k as string} className="rounded-lg border border-line bg-elev/60 px-3 py-2">
              <dt className="text-[11px] text-faint">{k}</dt>
              <dd className="mt-0.5 text-sm font-medium">{v}</dd>
            </div>
          ))}
        </dl>
        <p className="mt-3 text-xs text-faint">Estimation à partir des tokens déclarés par le fournisseur et de ses tarifs publics.</p>
      </Card>

      <Card>
        <SectionTitle>Confidentialité et conservation</SectionTitle>
        <ul className="list-disc space-y-1.5 pl-5 text-sm text-muted">
          <li>Vos missions, documents et livrables ne sont accessibles qu&apos;à votre compte.</li>
          <li>
            Pour analyser une mission, son contenu (demande, conversation, extraits de documents lus) est transmis au fournisseur du modèle
            de langage configuré. Les requêtes de recherche sont transmises au fournisseur de recherche.
          </li>
          <li>Les journaux techniques n&apos;enregistrent ni le contenu de vos documents ni vos messages.</li>
          <li>
            Les missions inactives depuis plus de {config.retentionDays} jours peuvent être supprimées automatiquement par
            l&apos;administrateur de l&apos;instance.
          </li>
          <li>Vous pouvez supprimer une mission, un document, toutes vos données ou votre compte à tout moment.</li>
        </ul>
      </Card>

      <Card className="border-danger/30">
        <SectionTitle>Suppression</SectionTitle>
        <DangerZone />
      </Card>
    </div>
  );
}
