import { describe, it, expect } from "vitest";
import {
  generateDiagnosticQuestionsForGoal,
  generateFallbackConceptsForGoal,
  generateFallbackEdgesForGoal,
} from "../diagnostics";
import { deriveModelContractForGoal } from "../inference";
import { PYTHON_TRACK_CONCEPTS } from "../templates/pythonTrack";
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

  it("generates facial emotion recognition questions without diabetes or spam mentions", () => {
    const questions = generateDiagnosticQuestionsForGoal("emotions on face analyzer");
    expect(questions.length).toBe(4);

    expect(questions[0].question).toContain("facial landmark features");
    expect(questions[0].options[0].text).toContain("Multi-Class Classification");

    expect(questions[1].question).toContain("P(Joy)");
    expect(questions[2].question).toContain("facial landmark distances");
    expect(questions[3].options[0].text).toContain("Softmax activation");

    for (const q of questions) {
      expect(q.question.toLowerCase()).not.toContain("glucose");
      expect(q.question.toLowerCase()).not.toContain("diabetes");
      expect(q.question.toLowerCase()).not.toContain("spam");
    }
  });

  it("generates facial emotion concepts with action units and Softmax activation", () => {
    const concepts = generateFallbackConceptsForGoal("emotions on face analyzer");
    expect(concepts.length).toBe(4);
    expect(concepts[0].title).toContain("Facial Feature Extraction");
    expect(concepts[0].starterCode).toContain("smile_curvature");
    expect(concepts[1].title).toContain("Action Unit Feature Normalization");
    expect(concepts[2].title).toContain("Linear Logit Scoring");
    expect(concepts[3].title).toContain("Softmax Activation");
  });

  it("derives dynamic schema contracts for any project goal", () => {
    // 1. Emotion project
    const emotionContract = deriveModelContractForGoal("emotions on face analyzer");
    expect(emotionContract.badge).toContain("Vision");
    expect(emotionContract.features.length).toBe(4);
    expect(emotionContract.features.map((f) => f.id)).toEqual(["smile", "browFurrow", "eyeOpenness", "jawDrop"]);
    expect(emotionContract.output.classes?.length).toBe(5);

    // 2. Medical project
    const medContract = deriveModelContractForGoal("Predict Diabetes Risk");
    expect(medContract.badge).toContain("Clinical");
    expect(medContract.features.map((f) => f.id)).toEqual(["glucose", "bmi", "age", "bloodPressure"]);

    // 3. Real Estate project
    const housingContract = deriveModelContractForGoal("Predict housing prices");
    expect(housingContract.output.type).toBe("regression");
    expect(housingContract.features.map((f) => f.id)).toContain("sqft");

    // 4. Custom unknown project
    const solarContract = deriveModelContractForGoal("Solar panel energy output forecast");
    expect(solarContract.output.type).toBe("regression");
    expect(solarContract.features.length).toBeGreaterThanOrEqual(4);
  });

  it("provides comprehensive Python Foundation track from scratch to vector math", () => {
    expect(PYTHON_TRACK_CONCEPTS.length).toBe(6);
    expect(PYTHON_TRACK_CONCEPTS[0].id).toBe("python-vars");
    expect(PYTHON_TRACK_CONCEPTS[1].id).toBe("python-collections");
    expect(PYTHON_TRACK_CONCEPTS[2].id).toBe("python-conditions");
    expect(PYTHON_TRACK_CONCEPTS[3].id).toBe("python-functions");
    expect(PYTHON_TRACK_CONCEPTS[4].id).toBe("python-loops");
    expect(PYTHON_TRACK_CONCEPTS[5].id).toBe("python-math-ai");

    // Check that vector math and sigmoid are covered in concept 6
    expect(PYTHON_TRACK_CONCEPTS[5].starterCode).toContain("sigmoid");
    expect(PYTHON_TRACK_CONCEPTS[5].solutionCode).toContain("math.exp");
  });

  it("manages 2-phase learning journey (theory vs building) and track toggling in store", () => {
    const store = useSessionStore.getState();

    // Default phase is theory
    store.setLearningPhase("theory");
    expect(useSessionStore.getState().learningPhase).toBe("theory");

    // Switch to building
    store.setLearningPhase("building");
    expect(useSessionStore.getState().learningPhase).toBe("building");

    // Toggle track to Python Foundation
    store.setLearningTrack("python_foundation");
    const pyState = useSessionStore.getState();
    expect(pyState.learningTrack).toBe("python_foundation");
    expect(pyState.concepts[0].id).toBe("python-vars");

    // Toggle back to Project
    store.setLearningTrack("project");
    const projState = useSessionStore.getState();
    expect(projState.learningTrack).toBe("project");
    expect(projState.concepts[0].id).not.toBe("python-vars");
  });
});



