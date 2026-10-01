import { NextRequest, NextResponse } from "next/server";
import { SPAM_DIAGNOSTIC_QUESTIONS } from "@/lib/templates/spamClassifier";
import { CHATGPT_DIAGNOSTIC_QUESTIONS } from "@/lib/templates/chatGpt";
import { SENTIMENT_DIAGNOSTIC_QUESTIONS } from "@/lib/templates/sentimentAnalysis";
import { generateDiagnosticQuestionsForGoal } from "@/lib/diagnostics";
import { initializeMasteryFromDiagnostic } from "@/lib/mastery";
import { DiagnosticQuestion } from "@/lib/types";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { goal, templateId, concepts, history = [] } = body;

    const lowerGoal = (goal || "").toLowerCase();
    let questions: DiagnosticQuestion[] = [];

    if (
      templateId === "spam-classifier" ||
      lowerGoal.includes("spam") ||
      lowerGoal.includes("email") ||
      lowerGoal.includes("bayes")
    ) {
      questions = SPAM_DIAGNOSTIC_QUESTIONS;
    } else if (
      templateId === "chatgpt" ||
      lowerGoal.includes("chatgpt") ||
      lowerGoal.includes("gpt") ||
      lowerGoal.includes("llm") ||
      lowerGoal.includes("transformer") ||
      lowerGoal.includes("language model")
    ) {
      questions = CHATGPT_DIAGNOSTIC_QUESTIONS;
    } else if (
      templateId === "sentiment-analysis" ||
      lowerGoal.includes("sentiment") ||
      lowerGoal.includes("movie") ||
      lowerGoal.includes("review")
    ) {
      questions = SENTIMENT_DIAGNOSTIC_QUESTIONS;
    } else if (
      templateId === "digit-recognizer" ||
      lowerGoal.includes("digit") ||
      lowerGoal.includes("handwriting") ||
      lowerGoal.includes("mnist")
    ) {
      questions = [
        {
          id: "diag-digit-1",
          targetConceptId: "pixels-to-vectors",
          question: "How does a neural network process an image of a handwritten digit?",
          options: [
            {
              text: "It flattens pixel brightness numbers into a numerical vector.",
              isCorrect: true,
              errorType: "NONE",
            },
            {
              text: "It prints out the image on paper and scans it with a laser.",
              isCorrect: false,
              errorType: "TERMINOLOGY_CONFUSION",
              rationale: "Images are processed digitally as numeric matrices.",
            },
            {
              text: "It ignores pixel brightness and counts the number of colors.",
              isCorrect: false,
              errorType: "CONCEPTUAL_GAP",
              rationale: "Grayscale digit recognizers rely on pixel intensity values.",
            },
            {
              text: "It requires human handwriting experts to grade each pixel live.",
              isCorrect: false,
              errorType: "OVERCONFIDENT_MISCONCEPTION",
              rationale: "Neural nets process features autonomously without manual grading.",
            },
          ],
        },
        {
          id: "diag-digit-2",
          targetConceptId: "gradient-descent",
          question: "When training a neural network, what does gradient descent achieve?",
          options: [
            {
              text: "It iteratively adjusts weights in the direction that minimizes prediction loss.",
              isCorrect: true,
              errorType: "NONE",
            },
            {
              text: "It increases model errors as much as possible to test limits.",
              isCorrect: false,
              errorType: "CONCEPTUAL_GAP",
              rationale: "Gradient descent minimizes loss, rather than maximizing error.",
            },
            {
              text: "It randomly shuffles dataset rows until lucky.",
              isCorrect: false,
              errorType: "TERMINOLOGY_CONFUSION",
              rationale: "Gradient descent computes analytic calculus derivatives to update weights.",
            },
            {
              text: "It deletes weights whenever a mistake is made.",
              isCorrect: false,
              errorType: "OVERCONFIDENT_MISCONCEPTION",
              rationale: "Weights are updated incrementally by learning rate * gradient.",
            },
          ],
        },
      ];
    } else {
      questions = generateDiagnosticQuestionsForGoal(goal || "");
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
