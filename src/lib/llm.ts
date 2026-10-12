import { z } from "zod";
import { ErrorType, ExplanationStrategy } from "./types";
import { SPAM_CLASSIFIER_CONCEPTS, SPAM_CLASSIFIER_EDGES } from "./templates/spamClassifier";
import { DIGIT_RECOGNIZER_CONCEPTS, DIGIT_RECOGNIZER_EDGES } from "./templates/digitRecognizer";

// Zod schemas for LLM contracts (PRD §7)

export const ConceptSchema = z.object({
  id: z.string(),
  title: z.string(),
  prereqs: z.array(z.string()),
  hook: z.string(),
  buildStep: z.string(),
  difficulty: z.number().min(1).max(5),
  explanationSummary: z.string().optional(),
  starterCode: z.string().optional(),
  solutionCode: z.string().optional(),
  testAssertion: z.string().optional(),
});

export const EdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  isWeakPrereq: z.boolean().optional(),
});

export const PlanOutputSchema = z.object({
  templateId: z.string().optional(),
  rationale: z.string(),
  concepts: z.array(ConceptSchema).min(6),
  edges: z.array(EdgeSchema),
  startingConceptId: z.string(),
});


export const DiagnosticQuestionSchema = z.object({
  id: z.string().optional(),
  question: z.string(),
  options: z.array(
    z.object({
      text: z.string(),
      isCorrect: z.boolean(),
      errorType: z
        .enum([
          "CONCEPTUAL_GAP",
          "TERMINOLOGY_CONFUSION",
          "CALCULATION_SLIP",
          "OVERCONFIDENT_MISCONCEPTION",
          "NONE",
        ])
        .optional()
        .default("NONE"),
      rationale: z.string().optional(),
    })
  ),
  targetConceptId: z.string().optional(),
});

export const DiagnosticSetSchema = z.object({
  questions: z.array(DiagnosticQuestionSchema),
});

export const DiagnosticNextOutputSchema = z.union([
  z.object({
    done: z.literal(false),
    question: DiagnosticQuestionSchema,
  }),
  z.object({
    done: z.literal(true),
    mastery: z.record(z.string(), z.number()),
    recommendedStartingConceptId: z.string(),
  }),
]);

export const TeachOutputSchema = z.object({
  hook: z.string(),
  explanation: z.string(),
  strategy: z.enum(["analogy", "contrast", "worked_example", "counterexample"]),
  example: z.string(),
  checkQuestion: z.object({
    prompt: z.string(),
    options: z.array(z.string()),
    correctIndex: z.number(),
    explanation: z.string(),
  }),
  buildTask: z.string(),
  starterCode: z.string().optional(),
});

export const EvaluateOutputSchema = z.object({
  correct: z.boolean(),
  errorType: z.enum([
    "CONCEPTUAL_GAP",
    "TERMINOLOGY_CONFUSION",
    "CALCULATION_SLIP",
    "OVERCONFIDENT_MISCONCEPTION",
    "NONE",
  ]),
  rootCauseConceptId: z.string().optional(),
  diagnosis: z.string(),
  feedback: z.string(),
  strategy: z.enum(["analogy", "contrast", "worked_example", "counterexample"]),
  matchedExplanation: z.string(),
});

export const TeachBackOutputSchema = z.object({
  passed: z.boolean(),
  score: z.number().min(0).max(100),
  gaps: z.array(z.string()),
  strengths: z.array(z.string()),
  feedback: z.string(),
  followUp: z.string().optional(),
});

export interface LearnerProfile {
  goal: string;
  interests?: string;
  background?: string;
  masteryVector?: Record<string, number>;
  lastMisconceptions?: { conceptId: string; errorType: ErrorType; note: string }[];
}

/**
 * Default hierarchy of Gemini models from highest capability/tier to lowest.
 */
export const DEFAULT_GEMINI_MODELS: string[] = [
  "gemini-3.1-pro-preview",       // Frontier reasoning preview
  "gemini-pro-latest",            // Pro production tier
  "gemini-2.5-flash",             // High-speed production flash
  "gemini-3-flash-preview",       // Next-generation high capability flash
  "gemini-3.1-flash-lite-preview",// Ultra-lightweight reasoning preview
  "gemini-flash-lite-latest",     // General lite fallback tier
  "gemini-flash-latest",          // General fallback tier
];

/**
 * Returns the ordered priority list of Gemini models to attempt, highest to lowest.
 * Reads GEMINI_MODELS from environment, or prepends LLM_MODEL if set.
 */
export function getGeminiModelPriorityList(): string[] {
  const envModels = process.env.GEMINI_MODELS;
  if (envModels && envModels.trim()) {
    const list = envModels
      .split(",")
      .map((m) => m.trim())
      .filter(Boolean);
    if (list.length > 0) return list;
  }
  if (process.env.LLM_MODEL && process.env.LLM_MODEL.trim()) {
    const primary = process.env.LLM_MODEL.trim();
    return [primary, ...DEFAULT_GEMINI_MODELS.filter((m) => m !== primary)];
  }
  return DEFAULT_GEMINI_MODELS;
}

export const DEFAULT_GROK_MODELS: string[] = [
  "grok-2-latest",
  "grok-2",
  "grok-beta",
  "grok-2-vision-latest",
];

/**
 * Normalizes raw LLM JSON text across various provider quirks (Gemini, Grok, etc.)
 * and validates against the target Zod schema.
 */
export function normalizeAndValidateLLMOutput<T>(
  rawText: string,
  schema: z.ZodSchema<T>
): { success: true; data: T } | { success: false; error: any } {
  try {
    const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
    let parsed = JSON.parse(cleaned);

    // Normalization helpers for common LLM field variations
    if (parsed && typeof parsed === "object") {
      if (parsed.plan && typeof parsed.plan === "object") parsed = parsed.plan;
      if (parsed.roadmap && typeof parsed.roadmap === "object") parsed = parsed.roadmap;
      if (parsed.data && typeof parsed.data === "object") parsed = parsed.data;

      if (Array.isArray(parsed.concepts)) {
        parsed.concepts = parsed.concepts.map((c: any, idx: number) => {
          const rawId = String(c.id || c.name || `step-${idx + 1}`)
            .toLowerCase()
            .replace(/[^a-z0-9]+/g, "-")
            .replace(/^-|-$/g, "");
          const conceptId = rawId || `step-${idx + 1}`;
          return {
            id: conceptId,
            title: String(c.title || c.name || `Step ${idx + 1}`),
            prereqs: Array.isArray(c.prereqs)
              ? c.prereqs
              : Array.isArray(c.prerequisites)
              ? c.prerequisites
              : idx > 0 && parsed.concepts[idx - 1]?.id
              ? [parsed.concepts[idx - 1].id]
              : [],
            hook: String(
              c.hook || c.question || c.intro || `How do we implement ${c.title || "this step"} in Python?`
            ),
            buildStep: String(
              c.buildStep || c.task || c.implementation || c.goal || `Implement ${c.title || "this step"} in Python.`
            ),
            difficulty:
              typeof c.difficulty === "number"
                ? Math.min(Math.max(c.difficulty, 1), 5)
                : idx < 2
                ? 1
                : idx < 5
                ? 2
                : 3,
            explanationSummary: c.explanationSummary || c.explanation || c.summary || c.corePrinciple || "",
            starterCode: c.starterCode || c.code || "",
            solutionCode: c.solutionCode || c.solution || c.starterCode || "",
            testAssertion: c.testAssertion || c.assertion || c.test || "",
          };
        });

        if (!parsed.startingConceptId && parsed.concepts[0]?.id) {
          parsed.startingConceptId = parsed.concepts[0].id;
        }

        if (!parsed.rationale || typeof parsed.rationale !== "string") {
          parsed.rationale = `AI agent curriculum designed dynamically for your goal.`;
        }

        if (!Array.isArray(parsed.edges) || parsed.edges.length === 0) {
          parsed.edges = parsed.concepts.slice(1).map((c: any, idx: number) => ({
            from: parsed.concepts[idx].id,
            to: c.id,
          }));
        } else {
          parsed.edges = parsed.edges.map((e: any) => ({
            from: String(e.from || e.source || ""),
            to: String(e.to || e.target || ""),
            isWeakPrereq: Boolean(e.isWeakPrereq),
          }));
        }
      }
    }

    const validated = schema.safeParse(parsed);
    if (validated.success) {
      return { success: true, data: validated.data };
    }
    return { success: false, error: validated.error };
  } catch (err) {
    return { success: false, error: err };
  }
}

let grokDisabledUntil = 0;

/**
 * Invokes xAI Grok Chat Completions API with native JSON response format.
 */
export async function callGrokChatCompletion({
  apiKey,
  systemPrompt,
  userPrompt,
  model = "grok-2-latest",
}: {
  apiKey: string;
  systemPrompt: string;
  userPrompt: string;
  model?: string;
}): Promise<string> {
  if (Date.now() < grokDisabledUntil) {
    throw new Error("xAI Grok is temporarily disabled (credits exhausted / permission denied). Using failover.");
  }

  const endpoint = "https://api.x.ai/v1/chat/completions";
  const activeModel = model || process.env.GROK_MODEL || "grok-2-latest";

  const cleanedKey = apiKey.trim();
  const bearerToken =
    cleanedKey.startsWith("xai-") || cleanedKey.startsWith("mock-") || cleanedKey.startsWith("test-")
      ? cleanedKey
      : `xai-${cleanedKey}`;

  const res = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${bearerToken}`,
    },
    body: JSON.stringify({
      model: activeModel,
      messages: [
        { role: "system", content: systemPrompt },
        {
          role: "user",
          content: `${userPrompt}\n\nIMPORTANT: Respond with ONLY a valid, parseable JSON object matching the required schema. Do NOT include markdown fences (\`\`\`json) or conversational commentary. Ensure all fields exist.`,
        },
      ],
      temperature: 0.2,
      response_format: { type: "json_object" },
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => "");
    if (
      res.status === 403 ||
      res.status === 401 ||
      errText.includes("credits") ||
      errText.includes("permission-denied")
    ) {
      grokDisabledUntil = Date.now() + 10 * 60 * 1000;
    }
    throw new Error(`Grok API returned status ${res.status}: ${errText}`);
  }

  const data = await res.json();
  const rawText = data?.choices?.[0]?.message?.content;
  if (!rawText) throw new Error("Grok API returned empty content");
  return rawText;
}

/**
 * Extracts API key override and provider preference from HTTP request headers and request body.
 */
export function extractLLMRequestCredentials(
  reqHeaders: { get(name: string): string | null },
  body?: { apiKey?: string; provider?: string }
): { apiKey?: string; provider?: string } {
  const headerKey =
    reqHeaders.get("x-grok-api-key") ||
    reqHeaders.get("x-gemini-api-key") ||
    reqHeaders.get("x-api-key") ||
    undefined;
  const headerProvider = reqHeaders.get("x-llm-provider") || undefined;
  const apiKey = (body?.apiKey && body.apiKey.trim()) || headerKey || undefined;
  const provider =
    body?.provider ||
    headerProvider ||
    (apiKey?.startsWith("xai-") ? "grok" : undefined);
  return { apiKey, provider };
}

/**
 * Universal LLM generation function with multi-provider abstraction (Google Gemini & xAI Grok),
 * strict schema validation, automatic retry loops, and failover cascades.
 */
export async function generateStructuredLLM<T>({
  systemPrompt,
  userPrompt,
  schema,
  fallbackData,
  apiKeyOverride,
  provider,
}: {
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodSchema<T>;
  fallbackData: T;
  apiKeyOverride?: string;
  provider?: string;
}): Promise<T> {
  const isExplicitGrok =
    provider === "grok" ||
    (apiKeyOverride && apiKeyOverride.startsWith("xai-")) ||
    process.env.LLM_PROVIDER === "grok";

  const grokApiKey =
    (apiKeyOverride && (apiKeyOverride.startsWith("xai-") || provider === "grok")
      ? apiKeyOverride
      : undefined) ||
    process.env.GROK_API_KEY ||
    process.env.XAI_API_KEY;

  const geminiApiKey =
    (!apiKeyOverride?.startsWith("xai-") && provider !== "grok" ? apiKeyOverride : undefined) ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  // 1. If Grok is explicitly requested or key starts with xai-, execute Grok first
  if (isExplicitGrok && grokApiKey) {
    try {
      console.log("[xAI Grok] Attempting generation with Grok API...");
      const grokRaw = await callGrokChatCompletion({
        apiKey: grokApiKey,
        systemPrompt,
        userPrompt,
        model: process.env.GROK_MODEL || "grok-2-latest",
      });
      const grokResult = normalizeAndValidateLLMOutput(grokRaw, schema);
      if (grokResult.success) {
        console.log("[xAI Grok Success] Successfully generated response using xAI Grok");
        return grokResult.data;
      }
      console.warn("[xAI Grok] Schema mismatch from Grok output:", grokResult.error);
    } catch (grokErr: any) {
      console.warn(`[xAI Grok Error] ${grokErr?.message || grokErr}. Checking failover...`);
    }
  }

  // 2. Attempt Google Gemini Priority Cascade
  if (geminiApiKey) {
    const modelPriorityList = getGeminiModelPriorityList();
    const initialPrompt = `${systemPrompt}\n\nUSER PROMPT:\n${userPrompt}\n\nIMPORTANT: Respond with ONLY a valid, parseable JSON object. No markdown fences. Ensure all required fields exist.`;

    let consecutive429Count = 0;
    for (let i = 0; i < modelPriorityList.length; i++) {
      if (consecutive429Count >= 2) {
        console.warn("[Gemini Quota Exceeded] Multiple models returned 429. Breaking cascade to prevent hanging.");
        break;
      }
      const modelName = modelPriorityList[i];
      try {
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${geminiApiKey}`;
        const payload = {
          contents: [
            {
              role: "user",
              parts: [{ text: initialPrompt }],
            },
          ],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: "application/json",
          },
        };

        const res = await fetch(endpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          signal: AbortSignal.timeout(10000),
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          if (res.status === 429) {
            consecutive429Count++;
          }
          console.warn(
            `[Gemini Priority ${i + 1}/${modelPriorityList.length}] Model '${modelName}' returned status ${res.status}. Switching to next lower model...`
          );
          continue;
        }

        const data = await res.json();
        const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (!rawText) {
          console.warn(
            `[Gemini Priority ${i + 1}/${modelPriorityList.length}] Model '${modelName}' returned empty content. Switching to next lower model...`
          );
          continue;
        }

        const geminiResult = normalizeAndValidateLLMOutput(rawText, schema);
        if (geminiResult.success) {
          console.log(
            `[Gemini Success] Successfully generated response using model '${modelName}' (Tier ${i + 1}/${modelPriorityList.length})`
          );
          return geminiResult.data;
        }

        // Retry once on the current model with validation error feedback
        try {
          const retryPrompt = `${initialPrompt}\n\nYOUR PREVIOUS OUTPUT HAD SCHEMA VALIDATION ERRORS:\n${geminiResult.error?.message}\nFix the schema mismatch and output the corrected JSON:`;
          const retryRes = await fetch(endpoint, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: retryPrompt }] }],
              generationConfig: {
                temperature: 0.1,
                responseMimeType: "application/json",
              },
            }),
          });
          if (retryRes.ok) {
            const retryData = await retryRes.json();
            const retryRaw = retryData?.candidates?.[0]?.content?.parts?.[0]?.text;
            if (retryRaw) {
              const retryVal = normalizeAndValidateLLMOutput(retryRaw, schema);
              if (retryVal.success) {
                console.log(
                  `[Gemini Success] Successfully corrected schema using model '${modelName}' on retry`
                );
                return retryVal.data;
              }
            }
          }
        } catch {
          // fall through to next model
        }
      } catch (err: any) {
        console.warn(
          `[Gemini Exception] Error with model '${modelName}': ${err?.message || err}. Switching to next lower model...`
        );
        continue;
      }
    }
  }

  // 3. Failover to Grok if Gemini was exhausted but Grok key is available
  if (!isExplicitGrok && grokApiKey) {
    try {
      console.log("[Failover -> xAI Grok] Gemini exhausted. Attempting failover to xAI Grok...");
      const grokRaw = await callGrokChatCompletion({
        apiKey: grokApiKey,
        systemPrompt,
        userPrompt,
        model: process.env.GROK_MODEL || "grok-2-latest",
      });
      const grokResult = normalizeAndValidateLLMOutput(grokRaw, schema);
      if (grokResult.success) {
        console.log("[xAI Grok Failover Success] Generated response via Grok failover");
        return grokResult.data;
      }
    } catch (failoverErr: any) {
      console.warn("[Failover -> xAI Grok Error]", failoverErr?.message || failoverErr);
    }
  }

  console.warn(
    "[LLM Fallback] All active LLM providers (Gemini/Grok) were exhausted or failed. Using curated domain fallback."
  );
  return fallbackData;
}
