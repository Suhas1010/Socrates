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
    expect(questions.length).toBeGreaterThanOrEqual(3);

    // Verify Check 1 and 2 mention clinical concepts
    expect(questions[0].question).toContain("patient's measurements");
    expect(questions[0].options[0].text).toContain("hundreds of past patients");

    expect(questions[1].question).toContain("past patients");
    expect(questions[1].options[0].text).toContain("known outcomes");
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
    expect(concepts.length).toBeGreaterThanOrEqual(4);
    expect(concepts[0].title).toContain("Define the Problem");
    expect(concepts[0].starterCode).toContain("___");
    expect(concepts[1].title).toContain("Dataset");
    expect(concepts[2].title).toContain("Train a Real ML Model");
    expect(concepts[2].starterCode).toContain("model.fit");
    expect(concepts[3].title).toContain("Evaluate on Held-Out Test Data");
  });

  it("updates store synchronously with domain-specific diagnostic questions", () => {
    const store = useSessionStore.getState();
    store.setGoalAndInterests("Diabetes disease predictor", "health");

    const updated = useSessionStore.getState();
    expect(updated.goal).toBe("Diabetes disease predictor");
    expect(updated.templateId).toBe("custom");
    expect(updated.diagnosticQuestions.length).toBeGreaterThanOrEqual(3);
    expect(updated.diagnosticQuestions[0].question).toContain("patient's measurements");
    expect(updated.diagnosticQuestions[1].question.toLowerCase()).not.toContain("spam");
    expect(updated.concepts[0].title).toContain("Define the Problem");
  });

  it("generates grounded custom diagnostic questions for arbitrary goals", () => {
    const questions = generateDiagnosticQuestionsForGoal("Autonomous Drone Navigation");
    expect(questions.length).toBeGreaterThanOrEqual(3);
    expect(questions[0].question).toContain("Autonomous Drone Navigation");
    for (const q of questions) {
      expect(q.question.toLowerCase()).not.toContain("email");
      expect(q.question.toLowerCase()).not.toContain("spam");
    }
  });

  it("generates facial emotion recognition questions without diabetes or spam mentions", () => {
    const questions = generateDiagnosticQuestionsForGoal("emotions on face analyzer");
    expect(questions.length).toBeGreaterThanOrEqual(3);

    expect(questions[0].question).toContain("photos of faces");
    expect(questions[0].options[0].text).toContain("measurements (like eyebrow height, lip curve)");

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
    expect(questions.length).toBeGreaterThanOrEqual(3);

    expect(questions[0].question).toContain("farmer who takes a photo of a leaf");
    expect(questions[0].options[0].text).toContain("visual patterns in the photo");

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

  it("generates tailored diagnostics and scikit-learn roadmaps for Recommender Systems", () => {
    const questions = generateDiagnosticQuestionsForGoal("Movie Recommender System");
    expect(questions.length).toBeGreaterThanOrEqual(3);
    expect(questions[0].question).toContain("recommendation system (like Netflix or Spotify)");
    expect(questions[1].question).toContain("sparse");
    expect(questions[2].question).toContain("popular movies");

    const concepts = generateFallbackConceptsForGoal("Movie Recommender System");
    expect(concepts.length).toBe(4);
    expect(concepts[0].starterCode).toContain("predicted_rating_stars");
    expect(concepts[1].starterCode).toContain("genre_affinity");
    expect(concepts[2].starterCode).toContain("RandomForestRegressor");
    expect(concepts[2].starterCode).toContain("model.fit");
    expect(concepts[2].solutionCode).toContain("model.fit(X_train, y_train)");

    const contract = deriveModelContractForGoal("Movie Recommender System");
    expect(contract.badge).toBe("Recommender System");
    expect(contract.features.map((f) => f.id)).toContain("genreAffinity");
  });

  it("generates tailored diagnostics and scikit-learn roadmaps for Object Detection / Self-Driving", () => {
    const questions = generateDiagnosticQuestionsForGoal("Autonomous Car Obstacle Detection");
    expect(questions.length).toBeGreaterThanOrEqual(3);
    expect(questions[0].question).toContain("records 30 video frames per second");
    expect(questions[0].options[0].text).toContain("WHAT the objects are");
    expect(questions[1].question).toContain("empty road with zero pedestrians");
    expect(questions[2].options[0].text).toContain("Intersection over Union");

    const concepts = generateFallbackConceptsForGoal("Autonomous Car Obstacle Detection");
    expect(concepts.length).toBe(4);
    expect(concepts[0].starterCode).toContain("obstacle_type");
    expect(concepts[2].starterCode).toContain("RandomForestClassifier");

    const contract = deriveModelContractForGoal("Autonomous Car Obstacle Detection");
    expect(contract.badge).toBe("Autonomous Vision Detector");
    expect(contract.features.map((f) => f.id)).toContain("distanceMeters");
  });

  it("generates tailored diagnostics and scikit-learn roadmaps for Cybersecurity Intrusion Detection", () => {
    const questions = generateDiagnosticQuestionsForGoal("Cybersecurity Threat and Intrusion Detection");
    expect(questions.length).toBeGreaterThanOrEqual(3);
    expect(questions[0].question).toContain("data packets hit a server");
    expect(questions[1].question).toContain("99.995% accuracy");
    expect(questions[2].question).toContain("packet size (up to 1,500 bytes)");

    const concepts = generateFallbackConceptsForGoal("Cybersecurity Threat and Intrusion Detection");
    expect(concepts.length).toBe(4);
    expect(concepts[0].starterCode).toContain("is_malicious_attack");
    expect(concepts[1].starterCode).toContain("foreign_port");

    const contract = deriveModelContractForGoal("Cybersecurity Threat and Intrusion Detection");
    expect(contract.badge).toBe("Cybersecurity Threat Engine");
    expect(contract.features.map((f) => f.id)).toContain("packetsPerSecond");
  });

  it("generates tailored diagnostics and scikit-learn roadmaps for Customer Churn", () => {
    const questions = generateDiagnosticQuestionsForGoal("Customer Churn Predictor");
    expect(questions.length).toBeGreaterThanOrEqual(3);
    expect(questions[0].question).toContain("predict who will cancel BEFORE they leave");
    expect(questions[1].question).toContain("only 4 out of 100 subscribers cancel");

    const concepts = generateFallbackConceptsForGoal("Customer Churn Predictor");
    expect(concepts.length).toBe(4);
    expect(concepts[0].starterCode).toContain("will_churn");
    expect(concepts[2].starterCode).toContain("GradientBoostingClassifier");

    const contract = deriveModelContractForGoal("Customer Churn Predictor");
    expect(contract.badge).toBe("Customer Retention Model");
    expect(contract.features.map((f) => f.id)).toContain("monthlyChargesUsd");
  });

  it("generates tailored diagnostics and scikit-learn roadmaps for Fake News Detection", () => {
    const questions = generateDiagnosticQuestionsForGoal("Fake News & Misinformation Detector");
    expect(questions.length).toBeGreaterThanOrEqual(3);
    expect(questions[0].question).toContain("evaluate whether an article might be misleading or fake");
    expect(questions[1].question).toContain("SHOCKING TRUTH REVEALED!!!");

    const concepts = generateFallbackConceptsForGoal("Fake News & Misinformation Detector");
    expect(concepts.length).toBe(4);
    expect(concepts[0].starterCode).toContain("is_fake_news");

    const contract = deriveModelContractForGoal("Fake News & Misinformation Detector");
    expect(contract.badge).toBe("NLP Fact Checker");
    expect(contract.features.map((f) => f.id)).toContain("sensationalDensity");
  });

  it("generates tailored diagnostics and scikit-learn roadmaps for Voice & Audio Recognition", () => {
    const questions = generateDiagnosticQuestionsForGoal("Voice Command Audio Classifier");
    expect(questions.length).toBeGreaterThanOrEqual(3);
    expect(questions[0].question).toContain("microphone, it records sound vibrations");
    expect(questions[1].question).toContain("44,100 raw pressure samples");

    const concepts = generateFallbackConceptsForGoal("Voice Command Audio Classifier");
    expect(concepts.length).toBe(4);
    expect(concepts[0].starterCode).toContain("voice_command_class");
    expect(concepts[1].starterCode).toContain("pitch_hz");

    const contract = deriveModelContractForGoal("Voice Command Audio Classifier");
    expect(contract.badge).toBe("Acoustic Audio Model");
    expect(contract.features.map((f) => f.id)).toContain("pitchHz");
  });
});




