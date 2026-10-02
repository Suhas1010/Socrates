import { describe, it, expect } from "vitest";
import { SPAM_CLASSIFIER_CONCEPTS } from "../templates/spamClassifier";
import { REAL_ESTATE_CONCEPTS } from "../templates/realEstate";
import { PYTHON_TRACK_CONCEPTS } from "../templates/pythonTrack";
import { CHATGPT_CONCEPTS } from "../templates/chatGpt";
import { DIGIT_RECOGNIZER_CONCEPTS } from "../templates/digitRecognizer";
import { SENTIMENT_ANALYSIS_CONCEPTS } from "../templates/sentimentAnalysis";
import { generateFallbackConceptsForGoal } from "../diagnostics";
import { runPythonCode } from "../pyodideRunner";

describe("Solution Code Verification", () => {
  const allTemplates = [
    { name: "spam", concepts: SPAM_CLASSIFIER_CONCEPTS },
    { name: "realEstate", concepts: REAL_ESTATE_CONCEPTS },
    { name: "pythonTrack", concepts: PYTHON_TRACK_CONCEPTS },
    { name: "chatGpt", concepts: CHATGPT_CONCEPTS },
    { name: "digit", concepts: DIGIT_RECOGNIZER_CONCEPTS },
    { name: "sentiment", concepts: SENTIMENT_ANALYSIS_CONCEPTS },
    { name: "heartRateFallback", concepts: generateFallbackConceptsForGoal("heart rate prediction by ai") },
    { name: "diabetesFallback", concepts: generateFallbackConceptsForGoal("Diabetes disease predictor") },
    { name: "emotionFallback", concepts: generateFallbackConceptsForGoal("facial emotion detector") },
  ];

  for (const track of allTemplates) {
    for (const concept of track.concepts) {
      it(`[${track.name}] ${concept.id} passes with solutionCode`, async () => {
        if (!concept.solutionCode || !concept.testAssertion) return;

        const res = await runPythonCode(concept.solutionCode, concept.testAssertion);
        if (!res.assertionPassed) {
          console.error(`FAILED: ${track.name} ${concept.id}`, res);
        }
        expect(res.assertionPassed).toBe(true);
      });
    }
  }
});
