import { describe, it, expect } from "vitest";
import {
  generateDiagnosticQuestionsForGoal,
  generateFallbackConceptsForGoal,
  generateFallbackEdgesForGoal,
} from "../diagnostics";
import { useSessionStore } from "../store";

describe("Domain-Grounded Diagnostics & Roadmaps", () => {
  it("generates medical-specific diagnostic questions for diabetes project without any spam mentions", () => {
    const questions = generateDiagnosticQuestionsForGoal("Diabetes disease predictor");
    expect(questions.length).toBe(4);

    // Verify Check 1 and 2 mention clinical concepts
    expect(questions[0].question).toContain("patient attributes (e.g. glucose, blood pressure, BMI)");
    expect(questions[0].options[0].text).toContain("Binary Classification (categorizing patients into Positive or Negative");

    expect(questions[1].question).toContain("clinical screening cohort are diagnosed with the condition");
    expect(questions[1].question).toContain("P(Condition)");
    expect(questions[1].question.toLowerCase()).not.toContain("email");
    expect(questions[1].question.toLowerCase()).not.toContain("spam");

    // Check all questions for absence of spam
    for (const q of questions) {
      expect(q.question.toLowerCase()).not.toContain("email");
      expect(q.question.toLowerCase()).not.toContain("spam");
      expect(q.question.toLowerCase()).not.toContain("mailbox");
    }
  });

  it("generates medical concepts with interactive blanks and assertions", () => {
    const concepts = generateFallbackConceptsForGoal("Diabetes disease predictor");
    expect(concepts.length).toBe(8);
    expect(concepts[0].title).toContain("Clinical Problem Formulation");
    expect(concepts[0].starterCode).toContain("___");
    expect(concepts[0].starterCode).toContain("patient_vitals");
    expect(concepts[1].title).toContain("Clinical Feature Normalization");
    expect(concepts[2].title).toContain("Clinical Risk Scoring");
    expect(concepts[3].title).toContain("Clinical Decision Threshold");
    expect(concepts[4].title).toContain("Binary Cross-Entropy");
    expect(concepts[7].title).toContain("Inference Engine");
  });

  it("updates store synchronously with domain-specific diagnostic questions", () => {
    const store = useSessionStore.getState();
    store.setGoalAndInterests("Diabetes disease predictor", "health");

    const updated = useSessionStore.getState();
    expect(updated.goal).toBe("Diabetes disease predictor");
    expect(updated.templateId).toBe("custom");
    expect(updated.diagnosticQuestions.length).toBe(4);
    expect(updated.diagnosticQuestions[1].question).toContain("P(Condition)");
    expect(updated.diagnosticQuestions[1].question.toLowerCase()).not.toContain("spam");
    expect(updated.concepts[0].title).toContain("Clinical Problem Formulation");
  });

  it("generates grounded custom diagnostic questions for arbitrary goals", () => {
    const questions = generateDiagnosticQuestionsForGoal("Autonomous Drone Navigation");
    expect(questions.length).toBe(4);
    expect(questions[0].question).toContain("Autonomous Drone Navigation");
    for (const q of questions) {
      expect(q.question.toLowerCase()).not.toContain("email");
      expect(q.question.toLowerCase()).not.toContain("spam");
    }
  });
});
