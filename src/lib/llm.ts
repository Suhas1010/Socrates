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
 * Universal LLM generation function with provider abstraction and retry fallback
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

  const primaryModel = process.env.LLM_MODEL || "gemini-flash-lite-latest";

  const executeCall = async (promptText: string, modelName: string = primaryModel): Promise<T | null> => {
    try {
      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${apiKey}`;
      const payload = {
        contents: [
          {
            role: "user",
            parts: [{ text: promptText }],
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
        console.warn(`Gemini API (${modelName}) returned status ${res.status}`);
        if (modelName === primaryModel && (res.status === 429 || res.status === 404 || res.status === 503)) {
          // Retry with alternate working preview models verified on quota
          const backup = await executeCall(promptText, "gemini-3.1-flash-lite-preview");
          if (backup) return backup;
          return executeCall(promptText, "gemini-3-flash-preview");
        }
        return null;
      }

      const data = await res.json();
      const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (!rawText) return null;

      const cleaned = rawText.replace(/```json/g, "").replace(/```/g, "").trim();
      const parsed = JSON.parse(cleaned);

      // Normalization helpers for common LLM field variations
      if (parsed && typeof parsed === "object") {
        if (Array.isArray(parsed.concepts)) {
          parsed.concepts = parsed.concepts.map((c: any) => ({
            ...c,
            prereqs: c.prereqs || c.prerequisites || [],
            difficulty: typeof c.difficulty === "number" ? Math.min(Math.max(c.difficulty, 1), 5) : 1,
          }));
          if (!parsed.startingConceptId && parsed.concepts[0]?.id) {
            parsed.startingConceptId = parsed.concepts[0].id;
          }
        }
      }

      const validated = schema.safeParse(parsed);
      if (validated.success) {
        return validated.data;
      } else {
        console.warn("Zod schema validation failed on attempt:", validated.error.message);
        throw new Error(validated.error.message);
      }
    } catch (err) {
      throw err;
    }
  };

  const initialPrompt = `${systemPrompt}\n\nUSER PROMPT:\n${userPrompt}\n\nIMPORTANT: Respond with ONLY a valid, parseable JSON object. No markdown fences. Ensure all required fields exist.`;

  try {
    const firstResult = await executeCall(initialPrompt);
    if (firstResult) return firstResult;
  } catch (firstErr: any) {
    // Retry once with error message appended per docs/RULES.md Rule #3
    console.log("Retrying LLM call with validation error feedback...");
    try {
      const retryPrompt = `${initialPrompt}\n\nYOUR PREVIOUS OUTPUT HAD SCHEMA VALIDATION ERRORS:\n${firstErr.message}\nFix the schema mismatch and output the corrected JSON:`;
      const retryResult = await executeCall(retryPrompt);
      if (retryResult) return retryResult;
    } catch (retryErr) {
      console.warn("Retry failed. Falling back to cached template.");
    }
  }

  return fallbackData;
}
