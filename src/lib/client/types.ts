import type {
  Artifact,
  Constraint,
  Message,
  MissingInfo,
  Mission,
  MissionRun,
  MissionStep,
  Source,
  UnsupportedRequest,
} from "@/db/schema";
import type { Review } from "@/server/agent/review";

/** JSON shapes returned by GET /api/missions/[id] (dates serialised as strings). */
type Jsonify<T> = { [K in keyof T]: T[K] extends Date ? string : T[K] extends Date | null ? string | null : T[K] };

export type MissionDTO = Jsonify<Mission> & {
  constraints: Constraint[];
  missingInfo: MissingInfo[];
  unsupported: UnsupportedRequest[];
};
export type StepDTO = Jsonify<MissionStep>;
export type MessageDTO = Jsonify<Message>;
export type ArtifactDTO = Jsonify<Omit<Artifact, "missionId" | "metadata">> & {
  review: ReviewDTO | null;
  readyToSend: boolean;
  send: { to: string; subject: string; confirmed: boolean; followUpDays?: number } | null;
  sentAt: string | null;
};
export type ReviewDTO = Review & { stale?: boolean };
export type SourceDTO = Jsonify<Source>;
export type RunDTO = Jsonify<MissionRun>;
export type DocumentDTO = {
  id: string;
  name: string;
  mimeType: string;
  sizeBytes: number;
  status: "PROCESSING" | "READY" | "FAILED";
  extractedChars: number | null;
  error: string | null;
  createdAt: string;
};

export type MissionDetailDTO = {
  mission: MissionDTO;
  steps: StepDTO[];
  messages: MessageDTO[];
  artifacts: ArtifactDTO[];
  sources: SourceDTO[];
  documents: DocumentDTO[];
  runs: RunDTO[];
  activeRun: RunDTO | null;
  usage: {
    llmCalls: number;
    toolCalls: number;
    errors: number;
    inputTokens: number;
    outputTokens: number;
    totalDurationMs: number;
    estimatedCostUsd: number | null;
  };
  /** The signed-in user's account, as far as this dossier needs it. */
  account: { cardSaved: boolean };
  integrations: {
    llm: { available: boolean; provider?: string; model?: string; testDouble?: boolean };
    search: { available: boolean; provider?: string };
    billing: {
      enabled: boolean;
      mode?: "success" | "upfront";
      priceCents?: number;
      fee?: { ratePct: number; minCents: number; maxCents: number; flatCents: number };
    };
    notifications: { enabled: boolean };
  };
};
