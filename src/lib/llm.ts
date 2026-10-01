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
  concepts: z.array(ConceptSchema),
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
  "gemini-3.1-pro-preview",       // Frontier reasoning & synthesis (Tier 1 - Highest)
  "gemini-pro-latest",            // Production pro reasoning (Tier 2)
  "gemini-2.5-flash",             // Advanced multimodal flash (Tier 3)
  "gemini-3-flash-preview",       // Next-generation high capability flash (Tier 4)
  "gemini-3.1-flash-lite-preview",// Next-generation ultra-fast preview (Tier 5)
  "gemini-flash-lite-latest",     // High quota production lite (Tier 6)
  "gemini-flash-latest",          // General production fallback (Tier 7 - Lowest)
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

/**
 * Universal LLM generation function with provider abstraction, strict schema validation,
 * and automatic cascading down the model priority hierarchy (highest to lowest).
 */
export async function generateStructuredLLM<T>({
  systemPrompt,
  userPrompt,
  schema,
  fallbackData,
  apiKeyOverride,
}: {
  systemPrompt: string;
  userPrompt: string;
  schema: z.ZodSchema<T>;
  fallbackData: T;
  apiKeyOverride?: string;
}): Promise<T> {
  const apiKey =
    apiKeyOverride ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.NEXT_PUBLIC_GEMINI_API_KEY;

  if (!apiKey) {
    return fallbackData;
  }

  const modelPriorityList = getGeminiModelPriorityList();
  const initialPrompt = `${systemPrompt}\n\nUSER PROMPT:\n${userPrompt}\n\nIMPORTANT: Respond with ONLY a valid, parseable JSON object. No markdown fences. Ensure all required fields exist.`;

  for (let i = 0; i < modelPriorityList.length; i++) {
    const modelName = modelPriorityList[i];
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
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
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
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

      const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      let parsed = JSON.parse(cleaned);

      // Normalization helpers for common LLM field variations
      if (parsed && typeof parsed === "object") {
        if (Array.isArray(parsed.concepts)) {
          parsed.concepts = parsed.concepts.map((c: any) => ({
            ...c,
            prereqs: c.prereqs || c.prerequisites || [],
            difficulty:
              typeof c.difficulty === "number"
                ? Math.min(Math.max(c.difficulty, 1), 5)
                : 1,
          }));
          if (!parsed.startingConceptId && parsed.concepts[0]?.id) {
            parsed.startingConceptId = parsed.concepts[0].id;
          }
        }
      }

      const validated = schema.safeParse(parsed);
      if (validated.success) {
        console.log(
          `[Gemini Success] Successfully generated response using model '${modelName}' (Tier ${i + 1}/${modelPriorityList.length})`
        );
        return validated.data;
      } else {
        console.warn(
          `[Gemini Schema Warning] Model '${modelName}' output schema mismatch: ${validated.error.message}. Retrying once with error feedback...`
        );
        // Retry once on the current model with validation error feedback
        try {
          const retryPrompt = `${initialPrompt}\n\nYOUR PREVIOUS OUTPUT HAD SCHEMA VALIDATION ERRORS:\n${validated.error.message}\nFix the schema mismatch and output the corrected JSON:`;
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
              const retryCleaned = retryRaw.replace(/```json/g, "").replace(/```/g, "").trim();
              const retryParsed = JSON.parse(retryCleaned);
              const retryVal = schema.safeParse(retryParsed);
              if (retryVal.success) {
                console.log(
                  `[Gemini Success] Successfully corrected schema using model '${modelName}' on retry`
                );
                return retryVal.data;
              }
            }
          }
        } catch (retryErr) {
          // fall through to next model
        }
        console.warn(
          `[Gemini Switch] Schema retry on '${modelName}' unsuccessful. Switching to next lower model...`
        );
        continue;
      }
    } catch (err: any) {
      console.warn(
        `[Gemini Exception] Error with model '${modelName}': ${err?.message || err}. Switching to next lower model...`
      );
      continue;
    }
  }

  console.warn(
    "[Gemini Fallback] All Gemini models in priority hierarchy were exhausted or failed. Using curated domain fallback."
  );
  return fallbackData;
}
