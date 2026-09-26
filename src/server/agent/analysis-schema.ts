import { z } from "zod";

export const STEP_KINDS = ["research", "document_analysis", "deliverable", "planning", "user_action"] as const;
export const CAPABILITIES = ["web_search", "document_analysis", "deliverable", "planning", "tracking"] as const;

/**
 * Structured output of the understanding / clarification / planning phase.
 * Also used as the JSON schema sent to the model.
 */
export const analysisSchema = z.object({
  title: z.string().min(1),
  objective: z.string().min(1),
  reformulation: z.string().min(1),
  constraints: z
    .array(z.object({ label: z.string(), value: z.string() })),
  missing_info: z
    .array(
      z.object({
        question: z.string(),
        reason: z.string(),
        blocking: z.boolean(),
      }),
    ),
  capabilities_needed: z.array(z.enum(CAPABILITIES)),
  unsupported: z
    .array(
      z.object({
        request: z.string(),
        reason: z.string(),
        alternative: z.string(),
      }),
    ),
  steps: z
    .array(
      z.object({
        key: z.string().min(1),
        title: z.string().min(1),
        description: z.string(),
        kind: z.enum(STEP_KINDS),
        depends_on: z.array(z.string()),
      }),
    ),
  /** Can Atlas take the whole dossier in charge? Decides whether payment is offered. */
  eligibility: z
    .object({
      can_handle: z.boolean(),
      reason: z.string(),
      what_atlas_will_do: z.string(),
    })
    .optional(),
  reply: z.string().min(1),
});

export type Analysis = z.infer<typeof analysisSchema>;

/** Hand-written JSON schema (strict-compatible) mirroring `analysisSchema`. */
export const analysisJsonSchema = {
  type: "object",
  additionalProperties: false,
  required: [
    "title",
    "objective",
    "reformulation",
    "constraints",
    "missing_info",
    "capabilities_needed",
    "unsupported",
    "steps",
    "eligibility",
    "reply",
  ],
  properties: {
    title: { type: "string", description: "Titre court de la mission (max 80 caractères)." },
    objective: { type: "string", description: "Objectif final, en une ou deux phrases." },
    reformulation: {
      type: "string",
      description: "Reformulation claire de la demande, qui distingue l'objectif final des étapes.",
    },
    constraints: {
      type: "array",
      description: "Contraintes connues : budget, dates, lieux, préférences, délais, format…",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["label", "value"],
        properties: { label: { type: "string" }, value: { type: "string" } },
      },
    },
    missing_info: {
      type: "array",
      description:
        "Informations manquantes. blocking=true uniquement si la mission ne peut pas avancer utilement sans elle.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["question", "reason", "blocking"],
        properties: {
          question: { type: "string" },
          reason: { type: "string" },
          blocking: { type: "boolean" },
        },
      },
    },
    capabilities_needed: {
      type: "array",
      items: { type: "string", enum: [...CAPABILITIES] },
    },
    unsupported: {
      type: "array",
      description: "Parties de la demande qu'Atlas ne peut pas exécuter lui-même, avec une alternative réaliste.",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["request", "reason", "alternative"],
        properties: {
          request: { type: "string" },
          reason: { type: "string" },
          alternative: { type: "string" },
        },
      },
    },
    steps: {
      type: "array",
      description: "Plan d'action ordonné (3 à 10 étapes en général).",
      items: {
        type: "object",
        additionalProperties: false,
        required: ["key", "title", "description", "kind", "depends_on"],
        properties: {
          key: {
            type: "string",
            description: "Identifiant stable court (ex: s1, s2…). Réutiliser la clé d'une étape existante conservée.",
          },
          title: { type: "string" },
          description: { type: "string" },
          kind: { type: "string", enum: [...STEP_KINDS] },
          depends_on: { type: "array", items: { type: "string" } },
        },
      },
    },
    eligibility: {
      type: "object",
      additionalProperties: false,
      required: ["can_handle", "reason", "what_atlas_will_do"],
      description:
        "Atlas peut-il prendre en charge ce dossier de bout en bout ? C'est ce verdict qui décide si l'utilisateur peut payer la prise en charge : ne mets true que si les conditions sont réunies.",
      properties: {
        can_handle: {
          type: "boolean",
          description:
            "true seulement si : il s'agit d'un problème avec une entreprise ou une organisation (réclamation, remboursement, facture, résiliation, caution, litige de consommation…) ; les démarches peuvent se faire par écrit (e-mail, formulaire, courrier, médiateur) sans les identifiants de l'utilisateur ; le résultat attendu est vérifiable ; le sujet n'est pas exclu (procédure judiciaire, pénal, famille, travail, étrangers, santé, dette réclamée à l'utilisateur). Une demande qui n'est pas un problème à régler (organisation, comparaison, planning…) → false.",
        },
        reason: { type: "string", description: "Pourquoi, en une ou deux phrases adressées à l'utilisateur." },
        what_atlas_will_do: {
          type: "string",
          description: "Si can_handle : ce qu'Atlas va faire concrètement (à qui il écrira, quoi demander, quel suivi), en 2 ou 3 phrases, sans promettre de résultat. Sinon : chaîne vide.",
        },
      },
    },
    reply: {
      type: "string",
      description:
        "Message adressé à l'utilisateur (markdown, en français) : reformulation, questions éventuelles, limites.",
    },
  },
} as const;
