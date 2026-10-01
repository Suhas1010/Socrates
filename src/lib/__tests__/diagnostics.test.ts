import { describe, it, expect } from "vitest";
import {
  generateDiagnosticQuestionsForGoal,
  generateFallbackConceptsForGoal,
  generateFallbackEdgesForGoal,
} from "../diagnostics";
import { deriveModelContractForGoal } from "../inference";
import { PYTHON_TRACK_CONCEPTS } from "../templates/pythonTrack";
import { useSessionStore } from "../store";
import { enrichConceptWithDeepTheory, ML_DL_DICTIONARY } from "../technicalDictionary";

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

    // 2. Agricultural Plant Disease project
    const plantContract = deriveModelContractForGoal("AI based plant disease detector");
    expect(plantContract.badge).toContain("Agricultural");
    expect(plantContract.features.map((f) => f.id)).toEqual([
      "lesionArea",
      "chlorophyllLoss",
      "spotIrregularity",
      "canopyMoisture",
    ]);
    expect(plantContract.output.classes?.map((c) => c.name)).toEqual([
      "Healthy Foliage",
      "Powdery Mildew",
      "Bacterial Leaf Blight",
      "Leaf Rust Fungus",
    ]);

    // 3. Medical project
    const medContract = deriveModelContractForGoal("Predict Diabetes Risk");
    expect(medContract.badge).toContain("Clinical");
    expect(medContract.features.map((f) => f.id)).toEqual(["glucose", "bmi", "age", "bloodPressure"]);

    // 4. Real Estate project
    const housingContract = deriveModelContractForGoal("Predict housing prices");
    expect(housingContract.output.type).toBe("regression");
    expect(housingContract.features.map((f) => f.id)).toContain("sqft");

    // 5. Custom unknown project
    const solarContract = deriveModelContractForGoal("Solar panel energy output forecast");
    expect(solarContract.output.type).toBe("regression");
    expect(solarContract.features.length).toBeGreaterThanOrEqual(4);
  });

  it("generates plant disease diagnostic questions without any medical or glucose contamination", () => {
    const questions = generateDiagnosticQuestionsForGoal("AI based plant disease detector");
    expect(questions.length).toBe(4);

    expect(questions[0].question).toContain("leaf pathogens (like Powdery Mildew, Leaf Blight, or Rust)");
    expect(questions[0].options[0].text).toContain("Multi-Class Classification");

    expect(questions[1].question).toContain("P(Fungal Infection)");
    expect(questions[2].question).toContain("lesion surface area");
    expect(questions[3].question).toContain("agronomic rationale for lowering the alert decision threshold");

    for (const q of questions) {
      const qLower = q.question.toLowerCase();
      expect(qLower).not.toContain("glucose");
      expect(qLower).not.toContain("patient");
      expect(qLower).not.toContain("bmi");
      expect(qLower).not.toContain("diabetes");
      expect(qLower).not.toContain("spam");
      for (const opt of q.options) {
        const optLower = opt.text.toLowerCase();
        expect(optLower).not.toContain("glucose");
        expect(optLower).not.toContain("patient");
        expect(optLower).not.toContain("diabetes");
      }
    }
  });

  it("generates plant disease 8-stage architecture roadmap without medical leaks", () => {
    const concepts = generateFallbackConceptsForGoal("AI based plant disease detector");
    expect(concepts.length).toBe(8);
    expect(concepts[0].title).toContain("Agricultural Vision Formulation");
    expect(concepts[0].starterCode).toContain("define_plant_disease_spec");
    expect(concepts[0].starterCode).toContain("lesion_area_pct");
    expect(concepts[1].title).toContain("Leaf Visual Feature Normalization");
    expect(concepts[2].title).toContain("Crop Pathogen Prior");
    expect(concepts[3].title).toContain("Visual Logit Scoring");
    expect(concepts[4].title).toContain("Sigmoid Probability & Cross-Entropy");
    expect(concepts[5].title).toContain("Weight Optimization via Gradient Descent");
    expect(concepts[6].title).toContain("Agronomic Disease Triage");
    expect(concepts[7].title).toContain("Live End-to-End Plant Disease Inference Pipeline");

    for (const c of concepts) {
      expect(c.title.toLowerCase()).not.toContain("clinical");
      expect(c.title.toLowerCase()).not.toContain("patient");
      expect(c.hook.toLowerCase()).not.toContain("glucose");
      expect(c.starterCode?.toLowerCase() || "").not.toContain("glucose");
    }
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

  it("manages 3-phase learning journey (theory, building, testing) and track toggling in store", () => {
    const store = useSessionStore.getState();

    // 1. Phase 1: Theory
    store.setLearningPhase("theory");
    expect(useSessionStore.getState().learningPhase).toBe("theory");

    // 2. Phase 2: Building
    store.setLearningPhase("building");
    expect(useSessionStore.getState().learningPhase).toBe("building");

    // 3. Phase 3: Testing & Running
    store.setLearningPhase("testing");
    expect(useSessionStore.getState().learningPhase).toBe("testing");

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

  it("enriches concepts with deep ML/DL technical dictionary and step-by-step arithmetic", () => {
    // Check dictionary completeness
    expect(ML_DL_DICTIONARY.weights.term).toContain("Weights");
    expect(ML_DL_DICTIONARY.weights.analogy).toBeTruthy();
    expect(ML_DL_DICTIONARY.bias.mathSymbolOrFormula).toContain("z = w · x + b");
    expect(ML_DL_DICTIONARY.sigmoid.mathSymbolOrFormula).toContain("σ(z)");
    expect(ML_DL_DICTIONARY.softmax.term).toContain("Softmax");
    expect(ML_DL_DICTIONARY.action_units.term).toContain("Facial Action Units");

    // Enrich an emotion concept
    const rawConcept = {
      id: "feature-engineering",
      title: "Facial Landmark Normalization",
      prereqs: [],
      hook: "How to normalize landmarks?",
      buildStep: "Write normalize_landmarks()",
      difficulty: 2,
    };

    const enriched = enrichConceptWithDeepTheory(rawConcept, "Emotion on face analyzer");
    expect(enriched.technicalTerms?.length).toBeGreaterThanOrEqual(3);
    expect(enriched.technicalTerms?.map((t: any) => t.term)).toContain("Facial Action Units (FACS AUs)");
    expect(enriched.deepMath).toBeDefined();
    expect(enriched.deepMath!.numericalExample.stepByStepArithmetic.length).toBeGreaterThan(0);
  });
});




