import { GoldenValueTest, ErrorType, ExplanationStrategy } from "../types";
import { DiagnosticianOutput } from "./types";
import { SEEDED_MISCONCEPTIONS } from "../seededMisconceptions";
import { getClientLLMConfig } from "../clientLLM";

/**
 * Diagnostician Agent (Section 7.2, 7.3 & 6.4 L-6)
 * Analyzes code tracebacks, failed assertions, and golden-value discrepancies,
 * producing evidence-backed diagnoses across the 4-type error taxonomy.
 */
export async function runDiagnosticianAgent(context: {
  conceptId: string;
  userCode: string;
  goldenTest?: GoldenValueTest;
  actualOutput?: any;
  errorTrace?: string;
}): Promise<DiagnosticianOutput> {
  const { conceptId, userCode, goldenTest, actualOutput, errorTrace } = context;

  // 1. Check if user fell into a known seeded misconception
  const normalized = userCode.toLowerCase();
  const matchedSeed = SEEDED_MISCONCEPTIONS.find((s) => {
    return (
      s.conceptId === conceptId &&
      (normalized.includes(s.learnerAnswer.toLowerCase().slice(0, 20)) ||
        s.learnerAnswer.toLowerCase().includes(normalized.slice(0, 20)))
    );
  });

  if (matchedSeed) {
    let strategy: ExplanationStrategy = "analogy";
    if (matchedSeed.expectedErrorType === "TERMINOLOGY_CONFUSION") strategy = "contrast";
    else if (matchedSeed.expectedErrorType === "CALCULATION_SLIP") strategy = "worked_example";
    else if (matchedSeed.expectedErrorType === "OVERCONFIDENT_MISCONCEPTION") strategy = "counterexample";

    return {
      correct: false,
      errorType: matchedSeed.expectedErrorType,
      rootCauseConceptId: matchedSeed.expectedRootCauseId || conceptId,
      diagnosis: matchedSeed.notes,
      evidence: `Learner submitted mental model matching seeded pattern: "${matchedSeed.learnerAnswer.slice(0, 40)}..."`,
      feedback: `Identified common hurdle: ${matchedSeed.notes}`,
      strategy,
      matchedExplanation: `Here is why that intuition breaks: ${matchedSeed.notes}.`,
    };
  }

  // 2. Numerical Golden Value Discrepancy (Calculation Slip vs Conceptual Gap)
  if (goldenTest && actualOutput !== undefined) {
    const expected = goldenTest.expectedOutput;
    const isNum = typeof expected === "number" && typeof actualOutput === "number";

    if (isNum) {
      const diff = Math.abs(expected - actualOutput);
      const isSignError = Math.abs(expected + actualOutput) < 0.01;

      if (isSignError) {
        return {
          correct: false,
          errorType: "CALCULATION_SLIP",
          rootCauseConceptId: conceptId,
          diagnosis: "Sign error detected: output inverted expected polarity.",
          evidence: `Your function returned ${actualOutput} where the reference returns ${expected}.`,
          feedback: "Check your mathematical operator signs (+ vs -).",
          strategy: "worked_example",
          matchedExplanation: `Let's trace the formula: expected ${expected}, but got ${actualOutput}. Notice the sign inversion in the subtraction term.`,
        };
      }

      if (diff > 0.5 * Math.abs(expected)) {
        return {
          correct: false,
          errorType: "CONCEPTUAL_GAP",
          rootCauseConceptId: conceptId,
          diagnosis: "Magnitude gap: return value deviates significantly from mathematical target.",
          evidence: `Your function returned ${actualOutput} where reference returns ${expected} (diff: ${diff.toFixed(2)}).`,
          feedback: "Review the foundational transformation formula.",
          strategy: "analogy",
          matchedExplanation: `Your calculation produced ${actualOutput}, while the target is ${expected}. Check whether you forgot to divide by the normalization denominator.`,
        };
      }

      return {
        correct: false,
        errorType: "CALCULATION_SLIP",
        rootCauseConceptId: conceptId,
        diagnosis: "Arithmetic deviation: calculation is close but outside numerical tolerance.",
        evidence: `Your function returned ${actualOutput} where reference returns ${expected} (tolerance: ${goldenTest.tolerance || 0.01}).`,
        feedback: "Check your decimal precision and rounding.",
        strategy: "worked_example",
        matchedExplanation: `Step-by-step trace: expected ${expected}, observed ${actualOutput}. Adjust the precision factor in the return statement.`,
      };
    }
  }

  // 3. Traceback & Syntax Errors
  if (errorTrace) {
    if (errorTrace.includes("ZeroDivisionError")) {
      return {
        correct: false,
        errorType: "CONCEPTUAL_GAP",
        rootCauseConceptId: conceptId,
        diagnosis: "Division by zero occurred because the denominator evaluated to 0.",
        evidence: `Runtime traceback: ${errorTrace.slice(0, 100)}`,
        feedback: "Add Laplace smoothing (+ 1) or an epsilon term (+ 1e-9) to guard the denominator.",
        strategy: "analogy",
        matchedExplanation: "In probability and division, unseen words or empty clusters produce count=0. Adding a smoothing constant guarantees non-zero denominators.",
      };
    }

    if (errorTrace.includes("KeyError")) {
      return {
        correct: false,
        errorType: "TERMINOLOGY_CONFUSION",
        rootCauseConceptId: conceptId,
        diagnosis: "Dictionary key mismatch: searched for a feature column that does not exist.",
        evidence: `Runtime traceback: ${errorTrace.slice(0, 100)}`,
        feedback: "Double-check your spelling and case sensitivity for feature names.",
        strategy: "contrast",
        matchedExplanation: "Feature dictionaries require exact string keys. Use dict.get(key, 0) for safe lookup.",
      };
    }
  }

  // 4. Deep AI Agent Evaluation via /api/evaluate when available
  if (typeof window !== "undefined") {
    try {
      const llmConfig = getClientLLMConfig();
      const evalRes = await fetch("/api/evaluate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...llmConfig.headers,
        },
        body: JSON.stringify({
          concept: { id: conceptId, title: conceptId.replace(/-/g, " ") },
          code: userCode,
          runResult: errorTrace,
          apiKey: llmConfig.apiKey,
          provider: llmConfig.provider,
        }),
      });
      if (evalRes.ok) {
        const evalData = await evalRes.json();
        if (evalData && evalData.diagnosis) {
          return {
            correct: evalData.correct || false,
            errorType: evalData.errorType || "CONCEPTUAL_GAP",
            rootCauseConceptId: evalData.rootCauseConceptId || conceptId,
            diagnosis: evalData.diagnosis,
            evidence: errorTrace ? `Traceback: ${errorTrace.slice(0, 100)}` : "Live Code Sandbox Evaluation",
            feedback: evalData.feedback || "Review the mathematical intuition.",
            strategy: evalData.strategy || "analogy",
            matchedExplanation: evalData.matchedExplanation || evalData.feedback,
          };
        }
      }
    } catch {
      // Fallback below
    }
  }

  // 5. Default evidence-based diagnosis (Offline Fallback)
  return {
    correct: false,
    errorType: "CONCEPTUAL_GAP",
    rootCauseConceptId: conceptId,
    diagnosis: "Implementation did not pass the required golden test conditions.",
    evidence: errorTrace ? `Traceback: ${errorTrace.slice(0, 80)}` : "Assertions failed during sandbox evaluation.",
    feedback: "Review the guided blanks and test assertions.",
    strategy: "analogy",
    matchedExplanation: "Let's inspect how the function inputs flow into the expected result.",
  };
}
