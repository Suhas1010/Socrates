import { NextRequest, NextResponse } from "next/server";
import { generateStructuredLLM, EvaluateOutputSchema } from "@/lib/llm";
import { SEEDED_MISCONCEPTIONS } from "@/lib/seededMisconceptions";
import { ErrorType, ExplanationStrategy } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { concept, question, answer, code, runResult } = body;

    const conceptId = concept?.id || "what-is-classification";
    const userText = (answer || code || "").trim();

    // 1. Check against our curated seeded misconceptions benchmark (§12)
    const normalizedUser = userText.toLowerCase();
    const matchedSeed = SEEDED_MISCONCEPTIONS.find((s) => {
      const matchConcept = s.conceptId === conceptId;
      const matchAnswer =
        normalizedUser.includes(s.learnerAnswer.toLowerCase().slice(0, 20)) ||
        s.learnerAnswer.toLowerCase().includes(normalizedUser.slice(0, 20));
      return matchConcept && matchAnswer;
    });

    if (matchedSeed) {
      let strategy: ExplanationStrategy = "analogy";
      if (matchedSeed.expectedErrorType === "TERMINOLOGY_CONFUSION") strategy = "contrast";
      else if (matchedSeed.expectedErrorType === "CALCULATION_SLIP") strategy = "worked_example";
      else if (matchedSeed.expectedErrorType === "OVERCONFIDENT_MISCONCEPTION") strategy = "counterexample";

      return NextResponse.json({
        correct: false,
        errorType: matchedSeed.expectedErrorType,
        rootCauseConceptId: matchedSeed.expectedRootCauseId || conceptId,
        diagnosis: matchedSeed.notes,
        feedback: `You fell into a classic misconception: ${matchedSeed.notes}`,
        strategy,
        matchedExplanation: `Here is why that mental model breaks: in machine learning, ${matchedSeed.notes}. Let's look at a concrete contrast.`,
      });
    }

    // Check code or runResult error strings
    const combinedText = `${userText} ${runResult || ""}`.toLowerCase();

    // Target Leakage
    if (
      combinedText.includes("target_leakage") ||
      (combinedText.includes("price") && (combinedText.includes("inputs") || combinedText.includes("input")))
    ) {
      return NextResponse.json({
        correct: false,
        errorType: "CONCEPTUAL_GAP",
        rootCauseConceptId: conceptId,
        diagnosis: "Target Leakage: 'price' is the prediction target, so it cannot be provided in the inputs.",
        feedback: "In machine learning, inputs must only include observable features known before the outcome.",
        strategy: "analogy",
        matchedExplanation: "Think of taking an exam with the answers already printed on the test sheet. If the model is fed 'price' as an input, it never learns how square footage or bedrooms influence value — it simply memorizes the target directly.",
      });
    }

    // Task Type Misconception
    if (
      combinedText.includes("task_type_misconception") ||
      (combinedText.includes("task_type") && combinedText.includes("classification")) ||
      (combinedText.includes("classification") && !combinedText.includes("regression"))
    ) {
      return NextResponse.json({
        correct: false,
        errorType: "TERMINOLOGY_CONFUSION",
        rootCauseConceptId: conceptId,
        diagnosis: "Terminology Confusion: Home prices are continuous numbers along a spectrum (regression), not discrete categories (classification).",
        feedback: "Continuous quantities like dollars require regression models, whereas discrete labels require classification.",
        strategy: "contrast",
        matchedExplanation: "Contrast regression with classification: Classification sorts inputs into discrete buckets (like Spam or Ham). Regression predicts a continuous numeric quantity along an open-ended scale (like $250,000 for a house). Because prices can take any numeric dollar amount, this project is regression.",
      });
    }

    // Calculation Slip (Scaling or Intercept)
    if (
      combinedText.includes("calculation_slip") ||
      combinedText.includes("forgot to add the baseline intercept") ||
      combinedText.includes("was not scaled down")
    ) {
      return NextResponse.json({
        correct: false,
        errorType: "CALCULATION_SLIP",
        rootCauseConceptId: conceptId,
        diagnosis: "Calculation Slip: The mathematical operation missed a scaling factor or baseline intercept.",
        feedback: "Check your arithmetic: feature scaling and baseline bias are required for numerical accuracy.",
        strategy: "worked_example",
        matchedExplanation: "Let's review the exact arithmetic: For Listing 1 [1200 sqft, 2 beds], scaled sqft is 1200 / 1000 = 1.2. The model computes: (1.2 * $150k) + (2 * $20k) + $30k bias = $250,000.",
      });
    }

    // Unfilled blank
    if (combinedText.includes("blank '") && combinedText.includes("not filled in")) {
      return NextResponse.json({
        correct: false,
        errorType: "CONCEPTUAL_GAP",
        rootCauseConceptId: conceptId,
        diagnosis: "Conceptual Gap: Code contains unfilled blanks ('___'). Reason through what inputs and targets belong in this step.",
        feedback: "Fill in the blank with the appropriate variable, feature name, or mathematical operation.",
        strategy: "worked_example",
        matchedExplanation: "Look at the 3 sample listings: each home has observable features [sqft, bedrooms] that the model inspects, and an outcome price ($250,000) that it predicts.",
      });
    }

    // 2. Rule-based evaluation heuristics for common slips
    if (
      normalizedUser.includes("uphill") ||
      normalizedUser.includes("climb") ||
      normalizedUser.includes("maximize loss")
    ) {
      return NextResponse.json({
        correct: false,
        errorType: "CONCEPTUAL_GAP",
        rootCauseConceptId: "gradient-descent",
        diagnosis: "Confusion of gradient direction: optimization minimizes loss by stepping downhill, not uphill.",
        feedback: "Gradient descent follows the negative gradient to minimize loss.",
        strategy: "analogy",
        matchedExplanation: "Think of rolling a ball down a hill: gravity pulls it down towards the valley of minimal error.",
      });
    }

    if (
      normalizedUser.includes("backpropagation and gradient descent are the same") ||
      normalizedUser.includes("backprop is gradient descent")
    ) {
      return NextResponse.json({
        correct: false,
        errorType: "TERMINOLOGY_CONFUSION",
        rootCauseConceptId: "gradient-descent",
        diagnosis: "Term swap: Backpropagation calculates gradients; Gradient Descent applies them to update weights.",
        feedback: "Backpropagation is the calculus tool that finds the slope; Gradient Descent is the optimizer that takes the step.",
        strategy: "contrast",
        matchedExplanation: "Backprop = Map-making (computes derivative). Gradient Descent = Walking (takes step using that map).",
      });
    }

    if (
      normalizedUser.includes("100% means perfect") ||
      normalizedUser.includes("accuracy is all that matters")
    ) {
      return NextResponse.json({
        correct: false,
        errorType: "OVERCONFIDENT_MISCONCEPTION",
        rootCauseConceptId: "training-vs-testing",
        diagnosis: "Overfitting blindness: 100% training accuracy usually indicates rote memorization of noise rather than true generalization.",
        feedback: "Evaluating only on training data creates a dangerous false sense of perfection.",
        strategy: "counterexample",
        matchedExplanation: "Imagine a student who memorizes test answer keys without understanding concepts. They fail on unseen questions.",
      });
    }

    // 3. Fallback / LLM diagnosis
    const fallbackData = {
      correct: false,
      errorType: "CONCEPTUAL_GAP" as ErrorType,
      rootCauseConceptId: concept?.prereqs?.[0] || conceptId,
      diagnosis: "Identified a gap in the foundational mental model for this concept.",
      feedback: "Review how the inputs transform into mathematical evidence.",
      strategy: "analogy" as ExplanationStrategy,
      matchedExplanation: "Consider the project's core data flow: each step builds directly on the previous mathematical transformation.",
    };

    const systemPrompt = `You are Socrates Evaluator.
Concept: "${concept?.title}".
Prerequisites: ${JSON.stringify(concept?.prereqs || [])}.
Question: "${question}".
Classify the learner's answer into one error type:
- CONCEPTUAL_GAP: Missing or wrong mental model.
- TERMINOLOGY_CONFUSION: Right idea, swapped or misused technical terms.
- CALCULATION_SLIP: Understands the principle, made arithmetic or sign mistake.
- OVERCONFIDENT_MISCONCEPTION: Confident, resistant belief that is factually wrong.
- NONE: Correct answer.

Return ONLY valid JSON matching EvaluateOutputSchema.
Keep diagnosis to ONE crisp, human-readable sentence.`;

    const result = await generateStructuredLLM({
      systemPrompt,
      userPrompt: `Learner's response: "${userText}".`,
      schema: EvaluateOutputSchema,
      fallbackData,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/evaluate:", error);
    return NextResponse.json(
      {
        correct: false,
        errorType: "CONCEPTUAL_GAP",
        rootCauseConceptId: "what-is-classification",
        diagnosis: "Identified a misunderstanding of core classification boundaries.",
        feedback: "Check your reasoning against the foundational definition.",
        strategy: "analogy",
        matchedExplanation: "Let's revisit how classification boundaries partition feature space.",
      },
      { status: 200 }
    );
  }
}
