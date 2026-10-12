import { NextRequest, NextResponse } from "next/server";
import { SPAM_DIAGNOSTIC_QUESTIONS } from "@/lib/templates/spamClassifier";
import { CHATGPT_DIAGNOSTIC_QUESTIONS } from "@/lib/templates/chatGpt";
import { SENTIMENT_DIAGNOSTIC_QUESTIONS } from "@/lib/templates/sentimentAnalysis";
import { DIGIT_RECOGNIZER_DIAGNOSTIC_QUESTIONS } from "@/lib/templates/digitRecognizer";
import { REAL_ESTATE_DIAGNOSTIC_QUESTIONS } from "@/lib/templates/realEstate";
import { generateDiagnosticQuestionsForGoal } from "@/lib/diagnostics";
import { DiagnosticQuestion } from "@/lib/types";
import { initializeMasteryFromDiagnostic } from "@/lib/mastery";
import { generateStructuredLLM, DiagnosticSetSchema, extractLLMRequestCredentials } from "@/lib/llm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { goal, templateId, concepts, history = [] } = body;

    const lowerGoal = (goal || "").toLowerCase();
    let questions: DiagnosticQuestion[] = [];

    let fallbackQuestions: DiagnosticQuestion[] = [];
    if (
      templateId === "spam-classifier" ||
      lowerGoal.includes("spam") ||
      lowerGoal.includes("email") ||
      lowerGoal.includes("bayes")
    ) {
      fallbackQuestions = SPAM_DIAGNOSTIC_QUESTIONS;
    } else if (
      templateId === "chatgpt" ||
      lowerGoal.includes("chatgpt") ||
      lowerGoal.includes("gpt") ||
      lowerGoal.includes("llm") ||
      lowerGoal.includes("transformer") ||
      lowerGoal.includes("language model")
    ) {
      fallbackQuestions = CHATGPT_DIAGNOSTIC_QUESTIONS;
    } else if (
      templateId === "sentiment-analysis" ||
      lowerGoal.includes("sentiment") ||
      lowerGoal.includes("movie") ||
      lowerGoal.includes("review")
    ) {
      fallbackQuestions = SENTIMENT_DIAGNOSTIC_QUESTIONS;
    } else if (
      templateId === "digit-recognizer" ||
      lowerGoal.includes("digit") ||
      lowerGoal.includes("handwriting") ||
      lowerGoal.includes("mnist")
    ) {
      fallbackQuestions = DIGIT_RECOGNIZER_DIAGNOSTIC_QUESTIONS;
    } else if (
      templateId === "real-estate" ||
      lowerGoal.includes("house") ||
      lowerGoal.includes("estate") ||
      lowerGoal.includes("housing") ||
      lowerGoal.includes("price prediction")
    ) {
      fallbackQuestions = REAL_ESTATE_DIAGNOSTIC_QUESTIONS;
    } else {
      fallbackQuestions = generateDiagnosticQuestionsForGoal(goal || "");
    }

    // Always attempt dynamic AI agent generation FIRST:
    try {
      const { apiKey: activeKey, provider: activeProvider } = extractLLMRequestCredentials(req.headers, body);
      const systemPrompt = `You are Socrates, an expert AI tutor. A learner wants to build: "${goal}".
Learner coding background: "beginner".
Generate a set of 4 progressive diagnostic check questions tailored SPECIFICALLY to their project: "${goal}".
RULES:
1. Every question must be 100% grounded in "${goal}".
2. Question 1: Problem Formulation (what kind of ML task is this, classification vs regression, inputs X vs output Y).
3. Question 2: Base Rate / Prior Probability in this domain.
4. Question 3: Feature Scaling / Normalization in this domain.
5. Question 4: Decision Boundary / Threshold / Sensitivity tradeoff in this domain.
6. Target concept IDs should match: "problem-framing", "prior-probability", "feature-engineering", "decision-boundary".
7. Each question must have exactly 4 options with 1 correct option and 3 realistic misconceptions with errorType and rationale.

Respond in JSON with this exact structure:
{
  "questions": [
    {
      "id": "diag-1",
      "targetConceptId": "problem-framing",
      "question": "Diagnostic question grounded in ${goal}?",
      "options": [
        { "text": "Correct option", "isCorrect": true, "errorType": "NONE", "rationale": "Correct explanation" },
        { "text": "Misconception 1", "isCorrect": false, "errorType": "CONCEPTUAL_GAP", "rationale": "Explanation" },
        { "text": "Misconception 2", "isCorrect": false, "errorType": "TERMINOLOGY_CONFUSION", "rationale": "Explanation" },
        { "text": "Misconception 3", "isCorrect": false, "errorType": "OVERCONFIDENT_MISCONCEPTION", "rationale": "Explanation" }
      ]
    }
  ]
}`;

      const llmResult = await generateStructuredLLM({
        systemPrompt,
        userPrompt: `Goal: "${goal}". Return 4 diagnostic questions.`,
        schema: DiagnosticSetSchema,
        fallbackData: {
          questions: fallbackQuestions.map((q) => ({
            id: q.id,
            targetConceptId: q.targetConceptId,
            question: q.question,
            options: q.options.map((opt) => ({
              text: opt.text,
              isCorrect: opt.isCorrect,
              errorType: (opt.errorType as any) || "NONE",
              rationale: opt.rationale || "",
            })),
          })),
        },
        apiKeyOverride: activeKey,
        provider: activeProvider,
      });

      if (llmResult.questions && llmResult.questions.length > 0) {
        questions = llmResult.questions.map((q, idx) => ({
          id: q.id || `diag-dynamic-${idx + 1}`,
          targetConceptId: q.targetConceptId || fallbackQuestions[idx]?.targetConceptId || "problem-framing",
          question: q.question,
          options: q.options.map((opt) => ({
            text: opt.text,
            isCorrect: opt.isCorrect,
            errorType: opt.errorType,
            rationale: opt.rationale || "",
          })),
        }));
      } else {
        questions = fallbackQuestions;
      }
    } catch {
      questions = fallbackQuestions;
    }

    const currentStep = history.length;
    const totalQuestions = questions.length;

    if (currentStep >= totalQuestions) {
      const conceptIds =
        concepts && concepts.length > 0
          ? concepts.map((c: any) => c.id)
          : questions.map((q) => q.targetConceptId);

      const mastery = initializeMasteryFromDiagnostic(
        conceptIds,
        history.map((h: any) => ({ conceptId: h.conceptId, isCorrect: h.isCorrect }))
      );

      const unmastered =
        conceptIds.find((id: string) => (mastery[id] ?? 0) < 0.6) || conceptIds[0];

      return NextResponse.json({
        done: true,
        mastery,
        recommendedStartingConceptId: unmastered,
      });
    }

    const questionToServe = questions[currentStep];

    return NextResponse.json({
      done: false,
      question: questionToServe,
      questions,
    });
  } catch (error) {
    console.error("Error in /api/diagnostic/next:", error);
    return NextResponse.json({
      done: true,
      mastery: {},
      recommendedStartingConceptId: "problem-framing",
    });
  }
}
