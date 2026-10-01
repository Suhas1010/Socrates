import { DiagnosticQuestion, Concept, ConceptEdge } from "./types";

/**
 * Generates tailored diagnostic questions grounded in the user's actual project goal.
 * Never mentions spam emails unless the goal is specifically about spam!
 */
export function generateDiagnosticQuestionsForGoal(goal: string): DiagnosticQuestion[] {
  const lower = (goal || "").toLowerCase();
  const safeGoal = goal?.trim() || "Your AI Project";

  // 0. Facial Emotion / Face Expression Analyzer
  if (
    lower.includes("emotion") ||
    lower.includes("face") ||
    lower.includes("facial") ||
    lower.includes("expression") ||
    lower.includes("smile") ||
    lower.includes("mood")
  ) {
    return [
      {
        id: "diag-emotion-1",
        targetConceptId: "problem-framing",
        question: `When building "${safeGoal}" using facial landmark features, what is the computer's ultimate job when given a picture of someone's face?`,
        options: [
          {
            text: "Multi-Class Classification (categorizing the face into discrete emotion states like Happy, Surprised, Angry, or Neutral).",
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: "Calculate the exact dollar price of the camera.",
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: "Predicting distinct emotional categories is classification, not financial regression.",
          },
          {
            text: "Delete the face image from the hard drive.",
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: "The model analyzes images to recognize human expressions, not delete files.",
          },
          {
            text: "Print out the image on physical paper.",
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: "The model runs computational software logic in Python.",
          },
        ],
      },
      {
        id: "diag-emotion-2",
        targetConceptId: "prior-probability",
        question: `A camera only sees colored pixels. To calculate P(Joy) or any emotion, can a Python program directly "feel" human emotion without converting the image into measurements (features) first?`,
        options: [
          {
            text: "No — computers only understand numbers, so we must extract key measurements (like lip curvature and eyebrow height).",
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: "Yes — computers have human empathy and understand emotional feelings naturally.",
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: "Computers have zero emotional awareness. They only compute arithmetic on numerical measurements (features).",
          },
          {
            text: "Yes — Python has a built-in 'import human_soul' module.",
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: "AI is statistical mathematics, not spiritual consciousness.",
          },
          {
            text: "No — computers can only understand audio sound waves, never images.",
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: "Computers process images as matrices of numerical values.",
          },
        ],
      },
      {
        id: "diag-emotion-3",
        targetConceptId: "feature-engineering",
        question: `Why can't we just write a simple rule using raw facial landmark distances like "if smile > 0.5: return 'Happy'" for every human face?`,
        options: [
          {
            text: "Because human expressions are nuanced (e.g. someone might grimace in anger or have different face shapes), so we need multiple weighted features.",
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: "Because Python crashes if you write an if statement.",
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: "Python handles conditional if statements effortlessly; the limitation is the complexity of real human facial anatomy.",
          },
          {
            text: "Because smiling faces are invisible to digital cameras.",
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: "Digital cameras capture smiles clearly; single rigid thresholds simply fail to capture nuanced expressions.",
          },
          {
            text: "Because computers can only execute while loops.",
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: "Computers execute all control flow constructs.",
          },
        ],
      },
      {
        id: "diag-emotion-4",
        targetConceptId: "decision-boundary",
        question: `When our AI model analyzes a face, what mathematical function converts raw linear scores into valid probabilities that sum to 1.0?`,
        options: [
          {
            text: "Softmax activation (converts scores into calibrated confidence percentages like 92% Happy, 5% Neutral, 3% Surprised).",
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: "It should claim it is 100% infallible on every face in the universe.",
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: "Real-world data contains uncertainty; calibrated AI models always output probabilities, not arrogant certainties.",
          },
          {
            text: "It should randomly pick a letter of the alphabet.",
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: "The model outputs calibrated probabilities across the target emotional classes.",
          },
          {
            text: "It should shut down the computer immediately.",
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: "The model returns an evaluation dictionary or classification string.",
          },
        ],
      },
    ];
  }

  const isPlantOrAgri =
    lower.includes("plant") ||
    lower.includes("crop") ||
    lower.includes("leaf") ||
    lower.includes("leaves") ||
    lower.includes("botan") ||
    lower.includes("agri") ||
    lower.includes("tree") ||
    lower.includes("garden") ||
    lower.includes("farm") ||
    lower.includes("flora");

  // 0.5 Agricultural Vision / Plant Disease Detector
  if (isPlantOrAgri) {
    return [
      {
        id: "diag-plant-1",
        targetConceptId: "problem-framing",
        question: `When building "${safeGoal}" to identify leaf pathogens (like Powdery Mildew, Leaf Blight, or Rust) from crop photographs, what kind of machine learning task is this?`,
        options: [
          {
            text: "Multi-Class Classification (categorizing the leaf into distinct disease states or a healthy baseline)",
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: "Continuous Regression (predicting open-ended continuous dollar prices for farm equipment)",
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: "Identifying discrete botanical pathogen classes is a classification problem, not financial regression.",
          },
          {
            text: "Unsupervised Clustering (grouping files on disk without any ground truth botanical labels)",
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: "Plant disease models are trained using supervised datasets with expert-labeled crop disease tags.",
          },
          {
            text: "Reinforcement Learning (controlling a physical tractor driving through video game simulations)",
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: "Computer vision classification analyzes static image tensors, not reinforcement reward agents.",
          },
        ],
      },
      {
        id: "diag-plant-2",
        targetConceptId: "prior-probability",
        question: `In a commercial greenhouse survey where 8 out of 100 inspected tomato leaves exhibit early fungal spots, what is the baseline prior probability P(Fungal Infection)?`,
        options: [
          {
            text: "0.08 (8% baseline prevalence in the greenhouse crop)",
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: "0.50 (50% — assuming equal odds regardless of actual greenhouse survey data)",
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: "Prior probability reflects historical base rate: 8 / 100 = 0.08, not 50/50.",
          },
          {
            text: "0.92 (92% — subtracting from 100 without dividing)",
            isCorrect: false,
            errorType: "CALCULATION_SLIP",
            rationale: "0.92 is the probability of a leaf being healthy/uninfected.",
          },
          {
            text: "1.00 (100% — certainty before examining any leaves)",
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: "A prior of 1.0 would mean every plant on Earth is unconditionally diseased.",
          },
        ],
      },
      {
        id: "diag-plant-3",
        targetConceptId: "feature-engineering",
        question: `When combining lesion surface area (0–100%) with chlorophyll discoloration index (0.01–0.98), why is feature scaling or normalization applied?`,
        options: [
          {
            text: "To ensure features with larger numerical ranges do not disproportionately dominate gradient updates during model optimization.",
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: "Because Python arithmetic errors out on numbers greater than 10.",
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: "Python handles arbitrary numbers; normalization ensures balanced optimization dynamics.",
          },
          {
            text: "To eliminate the need for photographing training leaf samples.",
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: "Scaling transforms data values; it does not replace the requirement for leaf imagery.",
          },
          {
            text: "To convert all leaf images into raw text strings.",
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: "Machine learning vision models process numeric feature vectors and pixel matrices, not text strings.",
          },
        ],
      },
      {
        id: "diag-plant-4",
        targetConceptId: "decision-boundary",
        question: `In agricultural disease triage, what is the agronomic rationale for lowering the alert decision threshold from 0.50 to 0.35 confidence?`,
        options: [
          {
            text: "Prioritize High Sensitivity / Recall: Early detection prevents fungal contagion from ruining the entire harvest, accepting a few false positive alerts.",
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: "To guarantee that the computer uses less electricity.",
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: "Decision thresholds adjust classification sensitivity, not GPU electrical power.",
          },
          {
            text: "Because machine learning models only execute mathematical operations below 0.40.",
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: "Thresholds are statistical decision boundaries chosen based on real-world cost of misclassification.",
          },
          {
            text: "To turn all diseased leaves green automatically.",
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: "The AI model performs diagnostic inference; it cannot physically alter the biological plant tissue.",
          },
        ],
      },
    ];
  }

  // 1. Medical / Health / Disease / Clinical (e.g. Diabetes, Cancer, Heart Disease, Medical Diagnosis)
  if (
    !isPlantOrAgri &&
    (lower.includes("diabet") ||
      (lower.includes("disease") && !isPlantOrAgri) ||
      lower.includes("cancer") ||
      lower.includes("medical") ||
      lower.includes("patient") ||
      (lower.includes("health") && !isPlantOrAgri) ||
      lower.includes("clinic") ||
      lower.includes("heart") ||
      lower.includes("tumor") ||
      lower.includes("glucose") ||
      (lower.includes("diagnosis") && !isPlantOrAgri))
  ) {
    return [
      {
        id: "diag-med-1",
        targetConceptId: "problem-framing",
        question: `When building "${safeGoal}" using patient attributes (e.g. glucose, blood pressure, BMI), what kind of machine learning task is this?`,
        options: [
          {
            text: "Binary Classification (categorizing patients into Positive or Negative for the condition)",
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: "Continuous Regression (predicting open-ended continuous dollar prices)",
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: "Predicting the presence or absence of a disease is a categorical classification problem, not continuous pricing.",
          },
          {
            text: "Unsupervised Clustering (grouping records without any ground truth diagnostic labels)",
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: "We train on labeled patient records with known historical diagnoses.",
          },
          {
            text: "Reinforcement Learning (agent playing a video game through reward signals)",
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: "Diagnostic prediction uses supervised clinical datasets, not reinforcement learning agents.",
          },
        ],
      },
      {
        id: "diag-med-2",
        targetConceptId: "prior-probability",
        question: `If 15 out of 100 patients in a clinical screening cohort are diagnosed with the condition, what is the baseline prior probability P(Condition)?`,
        options: [
          {
            text: "0.15 (15%)",
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: "0.50 (50% — assuming equal odds regardless of cohort data)",
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: "Prior probability reflects historical base rate: 15 / 100 = 0.15, not 50/50.",
          },
          {
            text: "0.85 (85% — subtracting from 100 without dividing)",
            isCorrect: false,
            errorType: "CALCULATION_SLIP",
            rationale: "85% is the probability of NOT having the condition.",
          },
          {
            text: "1.00 (100% — certainty before seeing any tests)",
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: "A prior of 1.0 would mean every human has the disease unconditionally.",
          },
        ],
      },
      {
        id: "diag-med-3",
        targetConceptId: "feature-engineering",
        question: `When combining blood glucose (70–200 mg/dL) with age (20–80 years), why is feature scaling or normalization applied?`,
        options: [
          {
            text: "To ensure features with larger numerical ranges do not disproportionately dominate gradient updates during model optimization.",
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: "Because Python arithmetic errors out on numbers greater than 100.",
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: "Python handles arbitrary numbers; scaling is a mathematical convergence requirement.",
          },
          {
            text: "To eliminate the need for collecting training patient data.",
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: "Scaling transforms data; it does not replace the need for patient samples.",
          },
          {
            text: "To convert all patient records into text strings.",
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: "Machine learning models require pure numeric tensors, not text strings.",
          },
        ],
      },
      {
        id: "diag-med-4",
        targetConceptId: "decision-boundary",
        question: `If the model calculates a disease risk score of 0.82 for a patient, and your clinical decision threshold is 0.50, what decision should the system make?`,
        options: [
          {
            text: "Classify as Positive / High Risk because 0.82 exceeds the 0.50 decision threshold.",
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: "Classify as Negative because scores must reach 1.00 for a positive diagnosis.",
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: "Decision rules trigger whenever predicted probability exceeds the decision threshold (0.82 >= 0.50).",
          },
          {
            text: "Discard the patient's record because the score is not an integer.",
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: "Probabilities are continuous numbers between 0 and 1.",
          },
          {
            text: "Invert the prediction and diagnose the opposite.",
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: "Higher risk probabilities correspond to the positive class.",
          },
        ],
      },
    ];
  }

  // 2. Financial / Fraud / Churn / Risk / Default
  if (
    lower.includes("fraud") ||
    lower.includes("churn") ||
    lower.includes("credit") ||
    lower.includes("loan") ||
    lower.includes("bank") ||
    lower.includes("default") ||
    lower.includes("finance")
  ) {
    return [
      {
        id: "diag-fin-1",
        targetConceptId: "problem-framing",
        question: `For "${safeGoal}", what is the core machine learning task?`,
        options: [
          {
            text: "Binary Classification (identifying positive event vs normal status)",
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: "Continuous Regression (predicting open-ended continuous quantities)",
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: "Flagging events (fraud vs legitimate, churn vs retain) is a classification task.",
          },
          {
            text: "Unsupervised dimensionality reduction with no labels",
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: "We use historical transaction records labeled with known outcomes.",
          },
          {
            text: "Heuristic hardcoded if-else statements",
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: "Machine learning learns statistical decision boundaries rather than hardcoded rules.",
          },
        ],
      },
      {
        id: "diag-fin-2",
        targetConceptId: "prior-probability",
        question: `If 2 out of every 100 transactions are confirmed fraudulent, what is the base rate prior probability P(Fraud)?`,
        options: [
          {
            text: "0.02 (2%)",
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: "0.50 (50% — equal likelihood)",
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: "Fraud is heavily imbalanced: 2 / 100 = 0.02, not 50%.",
          },
          {
            text: "0.98 (98%)",
            isCorrect: false,
            errorType: "CALCULATION_SLIP",
            rationale: "98% is the probability of legitimate transactions.",
          },
          {
            text: "0.00 (impossible to detect)",
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: "A prior of 0 would prevent Bayesian updates from ever triggering.",
          },
        ],
      },
      {
        id: "diag-fin-3",
        targetConceptId: "feature-engineering",
        question: `Why must transaction attributes (amount, frequency, account age) be normalized before training a model?`,
        options: [
          {
            text: "To prevent high-magnitude features (e.g. $10,000 transaction amount) from overpowering lower-magnitude indicators (e.g. 3 attempts).",
            isCorrect: true,
            errorType: "NONE",
          },
          {
            text: "Because Python lists cannot hold floating point numbers.",
            isCorrect: false,
            errorType: "TERMINOLOGY_CONFUSION",
            rationale: "Feature scaling is a mathematical stability technique, not a language limitation.",
          },
          {
            text: "To delete past transaction history.",
            isCorrect: false,
            errorType: "CONCEPTUAL_GAP",
            rationale: "Scaling preserves information while balancing numerical variance.",
          },
          {
            text: "Because all financial transactions are equal in value.",
            isCorrect: false,
            errorType: "OVERCONFIDENT_MISCONCEPTION",
            rationale: "Transaction amounts vary across orders of magnitude.",
          },
        ],
      },
    ];
  }

  // 3. General / Custom Machine Learning Project (Grounded in their exact goal title!)
  return [
    {
      id: "diag-custom-1",
      targetConceptId: "problem-framing",
      question: `When building "${safeGoal}", what is the primary role of problem formulation?`,
      options: [
        {
          text: `Defining the observable input features (X) and the target outcome (Y) the model is learning to predict.`,
          isCorrect: true,
          errorType: "NONE",
        },
        {
          text: `Writing a 50-page documentation manual before touching any data.`,
          isCorrect: false,
          errorType: "TERMINOLOGY_CONFUSION",
          rationale: "Problem formulation establishes the mathematical data contract between inputs and targets.",
        },
        {
          text: `Feeding the target answer directly into the input features.`,
          isCorrect: false,
          errorType: "CONCEPTUAL_GAP",
          rationale: "Including the target in the inputs causes target leakage, breaking real-world generalization.",
        },
        {
          text: `Assuming machine learning models read human thoughts automatically.`,
          isCorrect: false,
          errorType: "OVERCONFIDENT_MISCONCEPTION",
          rationale: "Models only operate on explicitly defined numerical feature vectors.",
        },
      ],
    },
    {
      id: "diag-custom-2",
      targetConceptId: "prior-probability",
      question: `In a dataset of 100 historical examples for "${safeGoal}", if 20 belong to the target class, what is the empirical prior probability P(Target)?`,
      options: [
        {
          text: "0.20 (20%)",
          isCorrect: true,
          errorType: "NONE",
        },
        {
          text: "0.50 (50% — assuming balanced coin flip)",
          isCorrect: false,
          errorType: "CONCEPTUAL_GAP",
          rationale: "Prior probability reflects historical frequency: 20 / 100 = 0.20.",
        },
        {
          text: "0.80 (80%)",
          isCorrect: false,
          errorType: "CALCULATION_SLIP",
          rationale: "80% represents the non-target class proportion.",
        },
        {
          text: "1.00 (100%)",
          isCorrect: false,
          errorType: "OVERCONFIDENT_MISCONCEPTION",
          rationale: "A prior of 1.0 means every sample is unconditionally positive.",
        },
      ],
    },
    {
      id: "diag-custom-3",
      targetConceptId: "feature-engineering",
      question: `Why do we transform raw real-world data into scaled numerical vectors before training "${safeGoal}"?`,
      options: [
        {
          text: "Optimization algorithms and gradient updates require pure numerical floats on comparable scales.",
          isCorrect: true,
          errorType: "NONE",
        },
        {
          text: "Because modern computers cannot store text strings.",
          isCorrect: false,
          errorType: "TERMINOLOGY_CONFUSION",
          rationale: "Computers store strings easily, but calculus optimization operates on numerical matrices.",
        },
        {
          text: "To delete ground truth labels from the dataset.",
          isCorrect: false,
          errorType: "CONCEPTUAL_GAP",
          rationale: "Feature vectors represent inputs (X); labels (Y) remain separate for supervised training.",
        },
        {
          text: "To make code execute in reverse order.",
          isCorrect: false,
          errorType: "OVERCONFIDENT_MISCONCEPTION",
          rationale: "Vectorization prepares clean numeric matrices for matrix operations.",
        },
      ],
    },
    {
      id: "diag-custom-4",
      targetConceptId: "decision-boundary",
      question: `When the model for "${safeGoal}" outputs a decision score of 0.78 and the decision threshold is 0.50, what is the predicted outcome?`,
      options: [
        {
          text: "Classified as Positive / Target because 0.78 is greater than or equal to the 0.50 threshold.",
          isCorrect: true,
          errorType: "NONE",
        },
        {
          text: "Classified as Negative because it did not reach 1.00.",
          isCorrect: false,
          errorType: "OVERCONFIDENT_MISCONCEPTION",
          rationale: "Standard decision rules trigger whenever predicted probability reaches or exceeds the threshold.",
        },
        {
          text: "The model halts execution with an error.",
          isCorrect: false,
          errorType: "CONCEPTUAL_GAP",
          rationale: "A score of 0.78 is a valid probability output.",
        },
        {
          text: "The threshold is increased to 0.78 automatically.",
          isCorrect: false,
          errorType: "TERMINOLOGY_CONFUSION",
          rationale: "The decision threshold is set prior to inference to partition the feature space.",
        },
      ],
    },
  ];
}

/**
 * Generates tailored fallback concepts with real interactive blanks and assertions
 * specifically tailored to the user's project domain.
 */
export function generateFallbackConceptsForGoal(goal: string): Concept[] {
  const lower = (goal || "").toLowerCase();
  const safeGoal = goal?.trim() || "Your AI Project";

  const isPlantOrAgri =
    lower.includes("plant") ||
    lower.includes("crop") ||
    lower.includes("leaf") ||
    lower.includes("leaves") ||
    lower.includes("botan") ||
    lower.includes("agri") ||
    lower.includes("tree") ||
    lower.includes("garden") ||
    lower.includes("farm") ||
    lower.includes("flora");

  // Facial Emotion / Face Expression Analyzer
  if (
    lower.includes("emotion") ||
    lower.includes("face") ||
    lower.includes("facial") ||
    lower.includes("expression") ||
    lower.includes("smile") ||
    lower.includes("mood")
  ) {
    return [
      {
        id: "problem-framing",
        title: `Facial Feature Extraction & Contract: ${safeGoal}`,
        prereqs: [],
        difficulty: 1,
        hook: `How do computer vision models convert raw facial landmark geometries into quantifiable features to predict emotions?`,
        explanationSummary: `Facial emotion recognition systems map geometric landmark distances (such as lip corner elevation AU12 and brow furrow AU4) as observable input features (X) to predict categorical emotional states (Y: Joy, Surprise, Anger, Sadness, Neutral).`,
        corePrinciple: `Action Units (AUs) represent fundamental muscle contractions. Mathematical model: f(action_units) -> emotion_probabilities. Target variables must never leak into inputs.`,
        whyItMatters: `Explicitly defining facial action unit features makes emotion classification invariant to lighting, skin tone, and camera sensor variations.`,
        buildStep: `Define the facial emotion model contract specifying task type, action unit features, and target emotions.`,
        starterCode: `# Step 1: Facial Emotion Architecture Contract for ${safeGoal}
# Fill in the blanks:
# 1. Specify task type: "classification" or "regression"
# 2. List the facial action unit features extracted from landmarks
# 3. Specify the target emotion classes

def define_face_emotion_spec():
    return {
        "project": "${safeGoal}",
        "task_type": ___,                   # TODO: "classification" or "regression"
        "action_units": [___],              # TODO: list strings, e.g. "smile_curvature", "brow_furrow", "eye_aperture", "jaw_drop"
        "target_emotions": [___]            # TODO: list target emotion categories, e.g. "Joy", "Surprise", "Anger", "Neutral"
    }

print("Vision Spec:", define_face_emotion_spec())
`,
        solutionCode: `def define_face_emotion_spec():
    return {
        "project": "${safeGoal}",
        "task_type": "classification",
        "action_units": ["smile_curvature", "brow_furrow", "eye_aperture", "jaw_drop"],
        "target_emotions": ["Joy", "Surprise", "Anger", "Neutral"]
    }

print("Vision Spec:", define_face_emotion_spec())
`,
        testAssertion: `spec = define_face_emotion_spec()
assert isinstance(spec, dict), "define_face_emotion_spec() must return a dictionary"
task_type = str(spec.get("task_type", "")).lower().strip()
assert task_type != "___" and task_type != "", "Blank 'task_type' is not filled in yet. Choose 'classification' or 'regression'."
assert task_type == "classification", f"Emotion recognition is a 'classification' task, got '{task_type}'"
units = spec.get("action_units", [])
assert isinstance(units, list) and len(units) > 0 and units != ["___"], "Blank 'action_units' is not filled in yet."
emotions = spec.get("target_emotions", [])
assert isinstance(emotions, list) and len(emotions) > 0 and emotions != ["___"], "Blank 'target_emotions' is not filled in yet."
print("Assertion Passed: Facial emotion specification contract verified!")
`,
        predictQuestion: {
          prompt: `For ${safeGoal}, why are facial action units (e.g. smile curvature, brow furrow) used instead of raw image pixel coordinates?`,
          options: [
            "Action units are invariant to camera distance and head size, providing scale-independent biometric signals.",
            "Raw pixel coordinates make code run backwards.",
            "Because machine learning cannot process numbers.",
            "To remove the mouth from the face.",
          ],
          correctIndex: 0,
          explanation: "Action units measure geometric muscle deformation relative to face size, making the model robust across different camera angles and distances.",
        },
        checkQuestion: {
          prompt: "What mathematical representation do we use for the input to our facial emotion classifier?",
          options: [
            "A normalized numerical feature vector representing facial landmark displacements.",
            "An uncompressed raw audio stream.",
            "A random word dictionary.",
            "A database backup file.",
          ],
          correctIndex: 0,
          explanation: "Computer vision classifiers transform geometric landmarks into normalized numerical feature vectors for matrix computation.",
        },
      },
      {
        id: "feature-engineering",
        title: `Action Unit Feature Normalization: ${safeGoal}`,
        prereqs: ["problem-framing"],
        difficulty: 2,
        hook: `A user sitting close to a webcam has larger pixel distances than someone sitting 6 feet away. How do we make facial measurements distance-invariant?`,
        explanationSummary: `Feature normalization bounds facial landmark measurements to standardized ranges (e.g., -1.0 to +1.0 for lip curvature, 0.0 to 1.0 for brow furrow) so that camera distance does not distort emotion classification.`,
        corePrinciple: `Normalized AU = (measured_distance - baseline) / face_scale. Normalization ensures features operate on balanced numerical intervals.`,
        whyItMatters: `Without normalization, a subject moving closer to the camera would cause pixel distances to expand, leading the classifier to mistakenly detect exaggerated expressions.`,
        buildStep: `Implement normalize_action_unit to scale raw landmark displacements into normalized floating point values.`,
        starterCode: `# Step 2: Facial Landmark Normalization
# Fill in the blanks:
# 1. Normalize raw displacement by the reference face scale (inter-ocular distance)
# 2. Clamp the value between min_val and max_val using max() and min()

def normalize_action_unit(raw_displacement: float, face_scale: float, min_val: float = -1.0, max_val: float = 1.0) -> float:
    # Scale raw pixel distance by face scale to achieve distance-invariance
    scaled = raw_displacement / ___      # TODO: divide by which reference scale?
    # Clamp between min_val and max_val
    clamped = max(min_val, min(max_val, ___))  # TODO: clamp the scaled value
    return round(clamped, 3)

print("Smiling close-up:", normalize_action_unit(raw_displacement=45.0, face_scale=50.0))
print("Smiling far away:", normalize_action_unit(raw_displacement=18.0, face_scale=20.0))
`,
        solutionCode: `def normalize_action_unit(raw_displacement: float, face_scale: float, min_val: float = -1.0, max_val: float = 1.0) -> float:
    scaled = raw_displacement / face_scale
    clamped = max(min_val, min(max_val, scaled))
    return round(clamped, 3)

print("Smiling close-up:", normalize_action_unit(raw_displacement=45.0, face_scale=50.0))
print("Smiling far away:", normalize_action_unit(raw_displacement=18.0, face_scale=20.0))
`,
        testAssertion: `close_up = normalize_action_unit(45.0, 50.0)
far_away = normalize_action_unit(18.0, 20.0)
assert close_up == 0.9, f"Expected 0.9 for close-up smile, got {close_up}"
assert far_away == 0.9, f"Expected 0.9 for far-away smile, got {far_away}"
assert close_up == far_away, "Scale invariance failed: close-up and far-away identical smiles must yield identical normalized values!"
over_extended = normalize_action_unit(100.0, 50.0, -1.0, 1.0)
assert over_extended == 1.0, f"Clamping failed: expected 1.0, got {over_extended}"
print("Assertion Passed: Facial feature normalization operates with scale invariance!")
`,
        predictQuestion: {
          prompt: "If a person smiles with displacement 45px at 50px face width, and later with displacement 18px at 20px face width, what should their normalized smile scores be?",
          options: [
            "Identical (0.90 for both), because normalization divides by face width to cancel out camera distance.",
            "45px should score much higher because 45 > 18.",
            "Both should be 0.0 because pixels cannot be divided.",
            "18px should score higher because the person is farther.",
          ],
          correctIndex: 0,
          explanation: "Dividing by the face reference scale makes the feature scale-invariant: 45/50 = 0.90 and 18/20 = 0.90.",
        },
        checkQuestion: {
          prompt: "What mathematical property does feature clamping (bounding between -1.0 and 1.0) provide?",
          options: [
            "It prevents outlier landmark tracker glitches from producing explosive gradients or infinite logits.",
            "It changes the color of the webcam feed.",
            "It makes the computer shut down automatically.",
            "It deletes old photo files from disk.",
          ],
          correctIndex: 0,
          explanation: "Clamping ensures extreme values or tracking artifacts do not produce disproportionate logit scores during inference.",
        },
      },
      {
        id: "weights-scoring",
        title: `Linear Logit Scoring & Emotion Weights: ${safeGoal}`,
        prereqs: ["feature-engineering"],
        difficulty: 3,
        hook: `How does a machine learning model mathematically evaluate whether a combination of smile, brow furrow, and eye aperture indicates Joy, Surprise, or Anger?`,
        explanationSummary: `Each emotion class maintains learned weights for every facial action unit. A weighted linear sum (logit z = w1*smile + w2*brow + w3*eyes + w4*jaw + bias) scores how strongly the facial configuration aligns with each emotion.`,
        corePrinciple: `Logit formula: z = (W . X) + b. Positive weights increase the emotion likelihood, while negative weights penalize incompatible movements (e.g. brow furrow penalizes Joy).`,
        whyItMatters: `Calibrating weights ensures conflicting facial expressions are correctly disentangled (e.g. a wide smile with deeply furrowed brows vs a relaxed smile).`,
        buildStep: `Implement compute_emotion_logits to calculate class scores for Joy, Surprise, and Anger from normalized action units.`,
        starterCode: `# Step 3: Linear Emotion Logit Scoring
# Fill in the blanks:
# 1. Joy: high positive weight on smile, negative weight on brow_furrow
# 2. Surprise: high positive weight on eye_openness and jaw_drop
# 3. Anger: high positive weight on brow_furrow, negative weight on smile

def compute_emotion_logits(smile: float, brow: float, eyes: float, jaw: float) -> dict:
    # Joy is driven strongly by smile curvature
    joy_score = (3.5 * ___) - (2.0 * brow) + 0.2            # TODO: which feature drives joy?
    # Surprise is driven by widened eyes and dropped jaw
    surprise_score = (2.8 * eyes) + (3.0 * ___) - (1.5 * brow)  # TODO: which feature indicates dropped mouth?
    # Anger is driven by brow furrow
    anger_score = (4.0 * ___) - (2.5 * smile) + 0.1         # TODO: which feature indicates furrowed brow?
    
    return {
        "Joy": round(joy_score, 3),
        "Surprise": round(surprise_score, 3),
        "Anger": round(anger_score, 3)
    }

print("Smiling face logits:", compute_emotion_logits(smile=0.85, brow=0.10, eyes=0.60, jaw=0.15))
print("Surprised face logits:", compute_emotion_logits(smile=0.05, brow=0.15, eyes=0.95, jaw=0.85))
`,
        solutionCode: `def compute_emotion_logits(smile: float, brow: float, eyes: float, jaw: float) -> dict:
    joy_score = (3.5 * smile) - (2.0 * brow) + 0.2
    surprise_score = (2.8 * eyes) + (3.0 * jaw) - (1.5 * brow)
    anger_score = (4.0 * brow) - (2.5 * smile) + 0.1
    return {
        "Joy": round(joy_score, 3),
        "Surprise": round(surprise_score, 3),
        "Anger": round(anger_score, 3)
    }

print("Smiling face logits:", compute_emotion_logits(smile=0.85, brow=0.10, eyes=0.60, jaw=0.15))
print("Surprised face logits:", compute_emotion_logits(smile=0.05, brow=0.15, eyes=0.95, jaw=0.85))
`,
        testAssertion: `smile_logits = compute_emotion_logits(0.85, 0.10, 0.60, 0.15)
assert smile_logits["Joy"] > smile_logits["Surprise"], "Smiling face should score higher on Joy than Surprise"
assert smile_logits["Joy"] > smile_logits["Anger"], "Smiling face should score higher on Joy than Anger"

surp_logits = compute_emotion_logits(0.05, 0.15, 0.95, 0.85)
assert surp_logits["Surprise"] > surp_logits["Joy"], "Surprised face should score higher on Surprise than Joy"

anger_logits = compute_emotion_logits(-0.50, 0.90, 0.40, 0.10)
assert anger_logits["Anger"] > anger_logits["Joy"], "Furrowed brow should score higher on Anger than Joy"
print("Assertion Passed: Emotion scoring weights correctly discriminate distinct facial expressions!")
`,
        predictQuestion: {
          prompt: "Why does the Joy logit have a negative weight (-2.0) on the brow furrow feature?",
          options: [
            "Because genuine joy typically exhibits relaxed brows; a strong brow furrow contradicts happiness and suggests confusion or anger.",
            "Because negative numbers make code execute faster.",
            "To turn off the webcam.",
            "Because smiles cannot occur in daylight.",
          ],
          correctIndex: 0,
          explanation: "Negative weights penalize incompatible facial movements, helping the linear model suppress Joy when conflicting features like brow furrowing are present.",
        },
        checkQuestion: {
          prompt: "What is a 'logit' in machine learning classification?",
          options: [
            "An unnormalized raw scalar score produced by a linear combination of features and weights before activation.",
            "A log file stored on disk.",
            "A Python syntax error.",
            "A type of computer screen.",
          ],
          correctIndex: 0,
          explanation: "Logits are raw real-valued scores (z = W.X + b) that represent the model's confidence in each class prior to probability normalization.",
        },
      },
      {
        id: "decision-boundary",
        title: `Softmax Activation & Live Pipeline: ${safeGoal}`,
        prereqs: ["weights-scoring"],
        difficulty: 4,
        hook: `Logits can be any positive or negative number (-3.2, 5.8, etc.). How do we convert them into calibrated percentages that sum to 100%?`,
        explanationSummary: `The Softmax activation function exponentiates each class logit and normalizes by the sum of all exponents: P(Class_i) = exp(z_i) / sum(exp(z_j)). This guarantees all class probabilities are strictly positive and sum exactly to 1.0 (100%).`,
        corePrinciple: `Softmax turns arbitrary continuous logits into a valid categorical probability distribution. The class with the highest probability is chosen as the dominant emotion.`,
        whyItMatters: `Without Softmax, models cannot express calibrated multi-class uncertainties (e.g. 70% Joy, 20% Surprise, 10% Neutral) or apply decision thresholds.`,
        buildStep: `Implement predict_face_emotion to compute Softmax probabilities and classify the dominant emotion.`,
        starterCode: `# Step 4: Multi-Class Softmax Activation & Classification
# Fill in the blanks:
# 1. Compute exp(logit) for each emotion class using math.exp()
# 2. Divide each exp value by sum_exp to get valid probabilities summing to 1.0
# 3. Determine the dominant emotion using max()

import math

def predict_face_emotion(smile: float, brow: float, eyes: float, jaw: float) -> dict:
    # 1. Compute linear logits
    joy_z = (3.5 * smile) - (2.0 * brow) + 0.2
    surp_z = (2.8 * eyes) + (3.0 * jaw) - (1.5 * brow)
    anger_z = (4.0 * brow) - (2.5 * smile) + 0.1
    neutral_z = 0.5 - abs(smile) - brow
    
    logits = {"Joy": joy_z, "Surprise": surp_z, "Anger": anger_z, "Neutral": neutral_z}
    
    # 2. Exponentiate logits
    exp_scores = {k: math.exp(v) for k, v in logits.items()}
    sum_exp = sum(exp_scores.values())
    
    # 3. Softmax probabilities: p_i = exp_i / sum_exp
    probabilities = {k: round(v / ___, 4) for k, v in exp_scores.items()}  # TODO: divide by which total sum?
    
    # 4. Find dominant emotion class
    dominant_emotion = max(probabilities, key=probabilities.get)
    confidence_pct = round(probabilities[dominant_emotion] * 100, 1)
    
    return {
        "dominant_emotion": dominant_emotion,
        "confidence": confidence_pct,
        "probabilities": probabilities
    }

print("Happy Face:", predict_face_emotion(smile=0.88, brow=0.05, eyes=0.60, jaw=0.20))
print("Surprised Face:", predict_face_emotion(smile=0.05, brow=0.10, eyes=0.95, jaw=0.85))
`,
        solutionCode: `import math

def predict_face_emotion(smile: float, brow: float, eyes: float, jaw: float) -> dict:
    joy_z = (3.5 * smile) - (2.0 * brow) + 0.2
    surp_z = (2.8 * eyes) + (3.0 * jaw) - (1.5 * brow)
    anger_z = (4.0 * brow) - (2.5 * smile) + 0.1
    neutral_z = 0.5 - abs(smile) - brow
    logits = {"Joy": joy_z, "Surprise": surp_z, "Anger": anger_z, "Neutral": neutral_z}
    exp_scores = {k: math.exp(v) for k, v in logits.items()}
    sum_exp = sum(exp_scores.values())
    probabilities = {k: round(v / sum_exp, 4) for k, v in exp_scores.items()}
    dominant_emotion = max(probabilities, key=probabilities.get)
    confidence_pct = round(probabilities[dominant_emotion] * 100, 1)
    return {
        "dominant_emotion": dominant_emotion,
        "confidence": confidence_pct,
        "probabilities": probabilities
    }

print("Happy Face:", predict_face_emotion(smile=0.88, brow=0.05, eyes=0.60, jaw=0.20))
print("Surprised Face:", predict_face_emotion(smile=0.05, brow=0.10, eyes=0.95, jaw=0.85))
`,
        testAssertion: `res_joy = predict_face_emotion(0.88, 0.05, 0.60, 0.20)
assert res_joy["dominant_emotion"] == "Joy", f"Expected Joy, got {res_joy['dominant_emotion']}"
assert res_joy["confidence"] > 50.0, f"Expected confidence > 50%, got {res_joy['confidence']}%"

res_surp = predict_face_emotion(0.05, 0.10, 0.95, 0.85)
assert res_surp["dominant_emotion"] == "Surprise", f"Expected Surprise, got {res_surp['dominant_emotion']}"

probs_sum = sum(res_joy["probabilities"].values())
assert abs(probs_sum - 1.0) < 0.01, f"Softmax probabilities must sum to 1.0, got {probs_sum}"
print("Assertion Passed: Full facial emotion inference engine verified operational!")
`,
        predictQuestion: {
          prompt: "Why must multi-class classification probabilities sum to exactly 1.0 (100%)?",
          options: [
            "Because an observation must belong to mutually exclusive classes within the defined probability space.",
            "Because numbers larger than 1 break computer monitors.",
            "To save memory on the graphic card.",
            "It is not required; probabilities can sum to any number.",
          ],
          correctIndex: 0,
          explanation: "In standard single-label multi-class classification, classes are mutually exclusive, so the sum of all class probabilities over the outcome space must equal 1.0.",
        },
        checkQuestion: {
          prompt: "Once the inference pipeline passes assertion testing, where can you test it live with interactive facial action unit sliders?",
          options: [
            "In the 'Model Tester' tab with real-time AU sliders, SVG face visualizer, and Softmax charts.",
            "Nowhere, AI models cannot be tested interactively.",
            "By emailing the weights to a university.",
            "By clearing the browser cache.",
          ],
          correctIndex: 0,
          explanation: "The Model Tester tab lets you interactively adjust action unit sliders, test expression presets, and observe the live SVG facial avatar update in real time.",
        },
      },
    ];
  }

  // Agricultural Vision / Plant Disease Detector
  if (isPlantOrAgri) {
    return [
      {
        id: "problem-framing",
        title: `Agricultural Vision Formulation: ${safeGoal}`,
        prereqs: [],
        difficulty: 1,
        hook: `Before training AI to diagnose leaf diseases from photographs, what observable visual features are extracted from the leaf, and what target pathogen classes are we predicting?`,
        explanationSummary: `Agricultural computer vision establishes a strict input/output contract: observable visual symptoms (lesion surface area %, chlorophyll discoloration index, spot edge irregularity, canopy moisture) serve as inputs (X), and the botanical health status (Healthy, Powdery Mildew, Bacterial Blight, Rust Fungus) serves as the target output (Y).`,
        corePrinciple: `Supervised classification learns a mathematical mapping f(leaf_visual_features) -> disease_class. Target labels must never leak into input features.`,
        whyItMatters: `Clearly isolating visual features from ground truth labels prevents data leakage, ensuring the model generalizes to new crop fields under varying weather conditions.`,
        buildStep: `Define the plant disease vision specification dictionary with observed leaf features and target pathogen classes.`,
        starterCode: `# Step 1: Agricultural Vision Specification for ${safeGoal}
# Fill in the blanks:
# 1. Specify task type: "classification" or "regression"
# 2. List the observable visual features extracted from leaf imagery
# 3. State the primary target pathogen classes to diagnose

def define_plant_disease_spec():
    return {
        "project": "${safeGoal}",
        "task_type": ___,               # TODO: "classification" or "regression"
        "visual_features": [___],       # TODO: list strings, e.g. "lesion_area_pct", "chlorophyll_discoloration", "spot_irregularity", "canopy_moisture"
        "target_pathogens": [___]       # TODO: list strings, e.g. "Healthy", "Powdery Mildew", "Bacterial Blight", "Rust Fungus"
    }

print("Plant Vision Spec:", define_plant_disease_spec())
`,
        solutionCode: `def define_plant_disease_spec():
    return {
        "project": "${safeGoal}",
        "task_type": "classification",
        "visual_features": ["lesion_area_pct", "chlorophyll_discoloration", "spot_irregularity", "canopy_moisture"],
        "target_pathogens": ["Healthy", "Powdery Mildew", "Bacterial Blight", "Rust Fungus"]
    }

print("Plant Vision Spec:", define_plant_disease_spec())
`,
        testAssertion: `spec = define_plant_disease_spec()
assert isinstance(spec, dict), "define_plant_disease_spec() must return a dictionary"
task_type = str(spec.get("task_type", "")).lower().strip()
assert task_type != "___" and task_type != "", "Blank 'task_type' is not filled in yet. Choose 'classification' or 'regression'."
assert task_type == "classification", f"Plant disease detection is a 'classification' task, got '{task_type}'"
features = spec.get("visual_features", [])
assert isinstance(features, list), "'visual_features' must be a list of feature names"
assert len(features) > 0 and features != ["___"], "Blank 'visual_features' is not filled in yet."
pathogens = spec.get("target_pathogens", [])
assert isinstance(pathogens, list) and len(pathogens) > 0 and pathogens != ["___"], "Blank 'target_pathogens' is not filled in yet."
print("Assertion Passed: Plant disease vision specification contract verified!")
`,
        predictQuestion: {
          prompt: `For ${safeGoal}, why must the 'target_pathogens' never be included inside the 'visual_features' input list?`,
          options: [
            "Including target labels in the input causes target leakage, where the model memorizes answers without learning visual symptom patterns.",
            "Python deletes the file if any word repeats twice.",
            "Leaf images can only be saved in grayscale if target labels are present.",
            "Agricultural models can only process a single leaf per day.",
          ],
          correctIndex: 0,
          explanation: "Target leakage gives the model the answer during training, causing it to completely fail when evaluating unseen leaves in real crop fields.",
        },
        checkQuestion: {
          prompt: `In machine learning for plant pathology, what is the mathematical difference between classification and regression?`,
          options: [
            "Classification predicts discrete categories (e.g. Healthy vs Powdery Mildew), while regression predicts continuous numerical quantities (e.g. crop yield in kg).",
            "Classification only runs on mobile phones, regression only on servers.",
            "Regression works without any dataset.",
            "There is no difference between them.",
          ],
          correctIndex: 0,
          explanation: "Plant disease identification classifies leaves into discrete pathogen categories.",
        },
      },
      {
        id: "feature-engineering",
        title: "Leaf Visual Feature Normalization & Scaling",
        prereqs: ["problem-framing"],
        difficulty: 2,
        hook: `Lesion area spans 0–100% while spot irregularity ranges from 0.01 to 0.95. Why must these visual measurements be scaled before optimizing model weights?`,
        explanationSummary: `When numerical inputs have vastly different scales, gradient descent oscillates erratically. Min-max normalization scales raw measurements into a standardized [0.0, 1.0] interval using: (x - min) / (max - min).`,
        corePrinciple: `Normalized Value = (x - min_val) / (max_val - min_val). Equalizing feature magnitude ensures balanced gradient steps.`,
        whyItMatters: `Without scaling, features with large numbers (like 100% lesion area) dominate weight updates, blinding the network to subtle but critical microscopic spot patterns.`,
        buildStep: `Implement normalize_leaf_feature to rescale raw visual leaf measurements into a normalized [0.0, 1.0] float.`,
        starterCode: `# Step 2: Leaf Visual Feature Scaling
# Formula: normalized = (value - min_val) / (max_val - min_val)

def normalize_leaf_feature(value: float, min_val: float, max_val: float) -> float:
    # Fill in the blanks:
    # 1. Compute the range: max_val - min_val
    # 2. Divide offset by range and clamp between 0.0 and 1.0
    feat_range = ___                            # TODO: max_val - min_val
    scaled = (value - min_val) / feat_range
    clamped = max(0.0, min(1.0, scaled))
    return round(clamped, 4)

# Test with 45% lesion area on a [0, 100] scale
print("Normalized Lesion:", normalize_leaf_feature(45.0, 0.0, 100.0))
`,
        solutionCode: `def normalize_leaf_feature(value: float, min_val: float, max_val: float) -> float:
    feat_range = max_val - min_val
    scaled = (value - min_val) / feat_range
    clamped = max(0.0, min(1.0, scaled))
    return round(clamped, 4)

print("Normalized Lesion:", normalize_leaf_feature(45.0, 0.0, 100.0))
`,
        testAssertion: `res = normalize_leaf_feature(45.0, 0.0, 100.0)
assert res == 0.45, f"Expected 0.45 for 45% lesion on [0, 100], got {res}"
res_edge = normalize_leaf_feature(110.0, 0.0, 100.0)
assert res_edge == 1.0, f"Expected clamped 1.0 for out-of-range value, got {res_edge}"
print("Assertion Passed: Leaf visual feature normalization verified!")
`,
        predictQuestion: {
          prompt: "If a leaf has 100% lesion coverage on a [0, 100] scale, what is its normalized value?",
          options: [
            "1.0000",
            "100.0000",
            "0.0000",
            "-1.0000",
          ],
          correctIndex: 0,
          explanation: "(100 - 0) / (100 - 0) = 1.0000. Min-max normalization maps the maximum observed value to exactly 1.0.",
        },
        checkQuestion: {
          prompt: "Why is feature scaling essential for neural networks processing visual leaf attributes?",
          options: [
            "It prevents large-scale numerical attributes from dominating gradients and destabilizing backpropagation.",
            "It automatically colors all images black and white.",
            "It prevents Python from running out of RAM.",
            "It increases image resolution from 720p to 4K.",
          ],
          correctIndex: 0,
          explanation: "Normalized features ensure loss surface contours are circular rather than elongated, allowing gradient descent to converge quickly.",
        },
      },
      {
        id: "prior-probability",
        title: "Crop Pathogen Prior & Base Rate Calibration",
        prereqs: ["problem-framing"],
        difficulty: 2,
        hook: `If only 8% of plants in a healthy nursery harbor fungal spores, how does Bayes' rule ensure our detector does not trigger excessive false alarms?`,
        explanationSummary: `Prior probability P(Disease) anchors predictions to historical incidence rates. When disease prevalence is rare, a naive model that ignores base rates will generate massive false positive alarm rates.`,
        corePrinciple: `Prior P(Disease) = infected_count / total_population. The prior acts as an anchor before observing leaf visual evidence.`,
        whyItMatters: `Commercial farm managers cannot afford to quarantine entire crop fields due to false positive alerts; incorporating agronomic base rates ensures balanced decision support.`,
        buildStep: `Implement calculate_pathogen_prior to compute the empirical prior probability from nursery survey records.`,
        starterCode: `# Step 3: Pathogen Prior Probability
# Formula: prior = infected_samples / total_inspected

def calculate_pathogen_prior(infected_samples: int, total_inspected: int) -> float:
    # Fill in the blanks:
    # 1. Guard against division by zero
    # 2. Divide infected by total and round to 4 decimals
    if total_inspected <= 0:
        return 0.0
    prior = ___ / ___                           # TODO: compute infected / total
    return round(prior, 4)

print("Greenhouse Prior:", calculate_pathogen_prior(16, 200))
`,
        solutionCode: `def calculate_pathogen_prior(infected_samples: int, total_inspected: int) -> float:
    if total_inspected <= 0:
        return 0.0
    prior = infected_samples / total_inspected
    return round(prior, 4)

print("Greenhouse Prior:", calculate_pathogen_prior(16, 200))
`,
        testAssertion: `prior = calculate_pathogen_prior(16, 200)
assert prior == 0.08, f"Expected 0.08 for 16/200, got {prior}"
assert calculate_pathogen_prior(0, 100) == 0.0, "Zero infected should yield 0.0"
print("Assertion Passed: Pathogen prior calculation verified!")
`,
        predictQuestion: {
          prompt: "If 25 out of 500 inspected grapevine leaves have powdery mildew, what is the pathogen prior rate?",
          options: [
            "0.05 (5%)",
            "0.50 (50%)",
            "0.25 (25%)",
            "0.005 (0.5%)",
          ],
          correctIndex: 0,
          explanation: "25 / 500 = 0.05 (5% baseline prior probability).",
        },
        checkQuestion: {
          prompt: "Why must plant disease AI models account for base rates?",
          options: [
            "In low-prevalence outbreaks, ignoring base rates leads to severe false-positive over-reporting.",
            "Prior probabilities make Python run without an operating system.",
            "Because leaves only grow in prime numbers.",
            "To delete corrupted photos from camera SD cards.",
          ],
          correctIndex: 0,
          explanation: "Bayesian reasoning combines the prior prevalence with observed leaf symptoms to compute true posterior infection likelihood.",
        },
      },
      {
        id: "decision-boundary",
        title: "Visual Logit Scoring for Plant Diseases",
        prereqs: ["feature-engineering"],
        difficulty: 3,
        hook: `How does a machine learning model combine lesion area, discoloration, and spot sharpness into a single decision score?`,
        explanationSummary: `A linear decision score (logit z) multiplies each normalized leaf feature by a learned weight vector and adds a bias: z = w1*lesion + w2*discoloration + w3*sharpness + bias.`,
        corePrinciple: `Logit z = sum(w_i * x_i) + b. Positive weights amplify disease evidence, while the bias calibrates baseline susceptibility.`,
        whyItMatters: `Visual symptoms reinforce each other: widespread lesion coverage combined with yellow chlorotic halos strongly signals virulent pathogen infection.`,
        buildStep: `Implement compute_leaf_pathogen_logit to calculate the weighted symptom sum.`,
        starterCode: `# Step 4: Visual Logit Calculation
# Formula: z = (w_lesion * x1) + (w_discolor * x2) + (w_sharp * x3) + bias

def compute_leaf_pathogen_logit(norm_lesion: float, norm_discolor: float, norm_sharp: float) -> float:
    # Agronomic vision weights learned from field datasets
    w_lesion = 2.40
    w_discolor = 1.80
    w_sharp = 1.20
    bias = -1.60

    # Fill in the blank: compute linear combination
    logit = ___                                 # TODO: sum weighted features + bias
    return round(logit, 4)

# Test with severe leaf blight symptoms: lesion=0.8, discolor=0.7, sharp=0.9
print("Severe Blight Logit:", compute_leaf_pathogen_logit(0.8, 0.7, 0.9))
`,
        solutionCode: `def compute_leaf_pathogen_logit(norm_lesion: float, norm_discolor: float, norm_sharp: float) -> float:
    w_lesion = 2.40
    w_discolor = 1.80
    w_sharp = 1.20
    bias = -1.60
    logit = (w_lesion * norm_lesion) + (w_discolor * norm_discolor) + (w_sharp * norm_sharp) + bias
    return round(logit, 4)

print("Severe Blight Logit:", compute_leaf_pathogen_logit(0.8, 0.7, 0.9))
`,
        testAssertion: `z = compute_leaf_pathogen_logit(0.8, 0.7, 0.9)
expected = round((2.4 * 0.8) + (1.8 * 0.7) + (1.2 * 0.9) - 1.6, 4)
assert z == expected, f"Expected {expected}, got {z}"
z_clean = compute_leaf_pathogen_logit(0.0, 0.0, 0.0)
assert z_clean == -1.6, f"Expected bias -1.6 for pristine leaf, got {z_clean}"
print("Assertion Passed: Leaf pathogen logit calculation verified!")
`,
        predictQuestion: {
          prompt: "What will the logit score be for a completely pristine leaf where all normalized symptoms are 0.0?",
          options: [
            "Equal to the negative bias (-1.60), representing strong baseline resistance to infection.",
            "Positive infinity.",
            "Zero always.",
            "It will throw a division by zero exception.",
          ],
          correctIndex: 0,
          explanation: "When all features are 0.0, the sum of weights*features is 0.0, leaving only the bias term (-1.60).",
        },
        checkQuestion: {
          prompt: "What role does the bias term play in plant disease scoring?",
          options: [
            "It shifts the decision boundary independently of input symptoms, capturing baseline healthy resilience.",
            "It flips the image orientation 180 degrees.",
            "It deletes features with low correlation.",
            "It encrypts the model weights for security.",
          ],
          correctIndex: 0,
          explanation: "The bias allows the model to shift the activation function left or right along the input axis.",
        },
      },
      {
        id: "loss-functions",
        title: "Sigmoid Probability & Cross-Entropy Loss",
        prereqs: ["decision-boundary"],
        difficulty: 3,
        hook: `A raw logit score of +2.8 indicates severe symptoms, but farmers need an actionable probability (e.g. 94% chance of blight). How do we convert unbounded logits into valid probabilities?`,
        explanationSummary: `The Sigmoid activation sigma(z) = 1 / (1 + exp(-z)) maps any real number into the open interval (0, 1). Binary Cross-Entropy measures the loss between predicted probability p and true label y in {0, 1}.`,
        corePrinciple: `P(Disease) = 1 / (1 + exp(-z)). Cross-Entropy Loss L = -[y * log(p) + (1 - y) * log(1 - p)]. Confident wrong predictions are penalized with extreme loss.`,
        whyItMatters: `Cross-entropy provides smooth non-zero gradients across all probability values, driving rapid weight correction when the detector mistakes a blighted leaf for healthy foliage.`,
        buildStep: `Implement sigmoid activation and binary cross-entropy loss in Python.`,
        starterCode: `import math

# Step 5: Sigmoid Activation & Binary Cross-Entropy
def leaf_disease_probability(logit: float) -> float:
    # Fill in the blank: Sigmoid formula: 1 / (1 + exp(-z))
    p = ___                                     # TODO: 1.0 / (1.0 + math.exp(-logit))
    return round(p, 4)

def binary_cross_entropy(y_true: int, y_pred: float) -> float:
    # Clamp y_pred to prevent log(0) math domain error
    eps = 1e-12
    p = max(eps, min(1.0 - eps, y_pred))
    # Fill in the blank: -[y*log(p) + (1-y)*log(1-p)]
    loss = ___                                  # TODO: -(y_true * math.log(p) + (1 - y_true) * math.log(1.0 - p))
    return round(loss, 4)

prob = leaf_disease_probability(2.65)
print("Infection Probability:", prob)
print("Loss on Diseased Leaf (y=1):", binary_cross_entropy(1, prob))
`,
        solutionCode: `import math

def leaf_disease_probability(logit: float) -> float:
    p = 1.0 / (1.0 + math.exp(-logit))
    return round(p, 4)

def binary_cross_entropy(y_true: int, y_pred: float) -> float:
    eps = 1e-12
    p = max(eps, min(1.0 - eps, y_pred))
    loss = -(y_true * math.log(p) + (1 - y_true) * math.log(1.0 - p))
    return round(loss, 4)

prob = leaf_disease_probability(2.65)
print("Infection Probability:", prob)
print("Loss on Diseased Leaf (y=1):", binary_cross_entropy(1, prob))
`,
        testAssertion: `p = leaf_disease_probability(0.0)
assert p == 0.5, f"Sigmoid(0) must equal 0.5, got {p}"
p_pos = leaf_disease_probability(5.0)
assert p_pos > 0.99, "Large positive logit should yield probability near 1.0"
loss_good = binary_cross_entropy(1, 0.99)
loss_bad = binary_cross_entropy(1, 0.01)
assert loss_bad > loss_good, "Wrong prediction should produce significantly higher loss"
print("Assertion Passed: Sigmoid and Cross-Entropy verified!")
`,
        predictQuestion: {
          prompt: "What happens to the cross-entropy loss if the true label is 1 (Blighted), but our model outputs p = 0.001 (confident it is healthy)?",
          options: [
            "The loss explodes to a very large positive number (-log(0.001) approx 6.9), heavily penalizing the mistake.",
            "The loss becomes negative.",
            "The loss drops to zero.",
            "The model restarts the training computer.",
          ],
          correctIndex: 0,
          explanation: "-log(p) approaches infinity as p approaches 0 when the ground truth label is 1.",
        },
        checkQuestion: {
          prompt: "Why is epsilon clipping (e.g. 1e-12) used when computing Cross-Entropy?",
          options: [
            "To prevent math domain errors from calculating log(0), which is undefined (-infinity).",
            "To speed up GPU clock speeds.",
            "To remove watermarks from leaf photos.",
            "To reduce image storage file sizes.",
          ],
          correctIndex: 0,
          explanation: "log(0) is mathematically undefined and throws a runtime exception in Python.",
        },
      },
      {
        id: "gradient-descent",
        title: "Weight Optimization via Gradient Descent",
        prereqs: ["loss-functions"],
        difficulty: 4,
        hook: `When our detector misclassifies a powdery mildew infection, how does calculus compute the exact adjustment needed for each symptom weight?`,
        explanationSummary: `Gradient descent computes the partial derivative of loss with respect to each weight: dL/dw = (p - y) * x. Each weight is updated opposite to the gradient: w_new = w_old - (learning_rate * gradient).`,
        corePrinciple: `Weight Update: w_new = w_old - alpha * (p - y) * x. When error (p - y) is positive (overprediction), weights decrease; when negative (underprediction), weights increase.`,
        whyItMatters: `Gradient descent automates parameter optimization across thousands of leaf training samples without requiring hand-tuned heuristics.`,
        buildStep: `Implement update_leaf_weights to perform a single gradient step.`,
        starterCode: `# Step 6: Gradient Descent Step on Leaf Weights
# Formula: w_new = w - (learning_rate * gradient)
# where gradient = (p - y) * x

def update_leaf_weights(weights: list, features: list, y_true: int, p_pred: float, lr: float = 0.1) -> list:
    error = p_pred - y_true
    new_weights = []
    # Fill in the blanks:
    # Compute gradient for each feature and update weight
    for w, x in zip(weights, features):
        grad = error * x
        w_updated = ___                         # TODO: w - (lr * grad)
        new_weights.append(round(w_updated, 4))
    return new_weights

print("Updated Weights:", update_leaf_weights([2.0, 1.5], [0.8, 0.6], y_true=1, p_pred=0.4, lr=0.1))
`,
        solutionCode: `def update_leaf_weights(weights: list, features: list, y_true: int, p_pred: float, lr: float = 0.1) -> list:
    error = p_pred - y_true
    new_weights = []
    for w, x in zip(weights, features):
        grad = error * x
        w_updated = w - (lr * grad)
        new_weights.append(round(w_updated, 4))
    return new_weights

print("Updated Weights:", update_leaf_weights([2.0, 1.5], [0.8, 0.6], y_true=1, p_pred=0.4, lr=0.1))
`,
        testAssertion: `w_up = update_leaf_weights([2.0], [1.0], y_true=1, p_pred=0.5, lr=0.1)
assert w_up[0] == 2.05, f"Expected 2.05, got {w_up[0]}"
print("Assertion Passed: Gradient descent update verified!")
`,
        predictQuestion: {
          prompt: "If our model predicts p = 0.3 for a severely diseased leaf (y = 1), what direction will the weight update move?",
          options: [
            "Weights will increase (error is -0.7, so subtracting negative gradient adds to the weights).",
            "Weights will decrease to zero.",
            "Weights will stay unchanged.",
            "Weights will turn into string variables.",
          ],
          correctIndex: 0,
          explanation: "When the model underpredicts (p < y), the error (p - y) is negative. Subtracting lr * negative_grad increases the weights to boost future sensitivity.",
        },
        checkQuestion: {
          prompt: "What happens if the learning rate alpha is set excessively high (e.g. alpha = 100.0)?",
          options: [
            "Weights oscillate violently and diverge, causing loss to explode.",
            "The model trains in 1 millisecond perfectly.",
            "The computer screen starts flickering green.",
            "Training data deletes itself from disk.",
          ],
          correctIndex: 0,
          explanation: "Excessively high learning rates overshoot the minimum of the loss landscape and diverge.",
        },
      },
      {
        id: "bias-variance",
        title: "Agronomic Disease Triage & Quarantine Threshold",
        prereqs: ["loss-functions"],
        difficulty: 3,
        hook: `A default 0.50 threshold treats false alarms and missed outbreaks equally. In agriculture, missing a contagious fungal infection is disastrous. How do we tune decision thresholds for farm protection?`,
        explanationSummary: `Tuning the classification decision threshold allows agronomists to optimize the precision-recall tradeoff. Lowering the threshold to 0.35 increases Sensitivity (Recall), catching 99% of early crop infections.`,
        corePrinciple: `Threshold Decision: If P(Disease) >= threshold -> ACTIONABLE INFECTION ALERT. Lower thresholds prioritize recall; higher thresholds prioritize precision.`,
        whyItMatters: `Catching leaf blight when only 2 plants are infected saves an entire field; waiting for 50%+ confidence risks catastrophic harvest losses.`,
        buildStep: `Implement triage_crop_disease to return structured agronomic action recommendations.`,
        starterCode: `# Step 7: Agronomic Disease Triage
# Decision logic based on calibrated infection probability and threshold

def triage_crop_disease(prob: float, threshold: float = 0.35) -> dict:
    # Fill in the blanks:
    # 1. Determine infection status: True if prob >= threshold else False
    # 2. Assign action: "QUARANTINE_AND_SPRAY", "MONITOR_FIELD", or "CLEAN_HEALTHY"
    is_infected = ___                           # TODO: prob >= threshold
    if prob >= 0.70:
        action = "QUARANTINE_AND_SPRAY"
        severity = "HIGH"
    elif prob >= threshold:
        action = "MONITOR_FIELD"
        severity = "MODERATE"
    else:
        action = "CLEAN_HEALTHY"
        severity = "LOW"
    return {"infected": is_infected, "action": action, "severity": severity, "probability": prob}

print("Crop Triage:", triage_crop_disease(0.42, threshold=0.35))
`,
        solutionCode: `def triage_crop_disease(prob: float, threshold: float = 0.35) -> dict:
    is_infected = prob >= threshold
    if prob >= 0.70:
        action = "QUARANTINE_AND_SPRAY"
        severity = "HIGH"
    elif prob >= threshold:
        action = "MONITOR_FIELD"
        severity = "MODERATE"
    else:
        action = "CLEAN_HEALTHY"
        severity = "LOW"
    return {"infected": is_infected, "action": action, "severity": severity, "probability": prob}

print("Crop Triage:", triage_crop_disease(0.42, threshold=0.35))
`,
        testAssertion: `res = triage_crop_disease(0.42, threshold=0.35)
assert res["infected"] is True, "Prob 0.42 should exceed 0.35 threshold"
assert res["action"] == "MONITOR_FIELD", f"Expected MONITOR_FIELD, got {res['action']}"
res_clean = triage_crop_disease(0.15, threshold=0.35)
assert res_clean["infected"] is False, "Prob 0.15 should be below threshold"
assert res_clean["action"] == "CLEAN_HEALTHY"
print("Assertion Passed: Agronomic disease triage verified!")
`,
        predictQuestion: {
          prompt: "What is the primary operational tradeoff when lowering the agricultural alert threshold from 0.50 to 0.35?",
          options: [
            "Higher Recall (fewer missed fungal infections) at the cost of slightly lower Precision (more false positive alerts).",
            "The model runs in reverse.",
            "Images take twice as long to load.",
            "All plants automatically turn into trees.",
          ],
          correctIndex: 0,
          explanation: "Lowering the decision threshold catches more true positives (high recall) but accepts more false alarms (lower precision).",
        },
        checkQuestion: {
          prompt: "Why is high recall prioritized in crop pathogen detection systems?",
          options: [
            "Because an undetected pathogen can spread exponentially and wipe out an entire farm season.",
            "Because high precision causes camera lenses to blur.",
            "Because agricultural drones cannot fly at 0.50.",
            "Because Python runs faster with high recall.",
          ],
          correctIndex: 0,
          explanation: "The asymmetric cost of a false negative (missed contagion) far exceeds the cost of a false alarm (routine visual reinspection).",
        },
      },
      {
        id: "inference-pipeline",
        title: "Live End-to-End Plant Disease Inference Pipeline",
        prereqs: ["bias-variance"],
        difficulty: 4,
        hook: `Now assemble everything we built into a complete production pipeline: from raw leaf measurements to normalized features, logit scoring, probability mapping, and agronomic triage report!`,
        explanationSummary: `An end-to-end vision inference pipeline ingests raw leaf attributes (lesion %, discoloration, spot sharpness, moisture), applies feature scaling, computes logits, applies sigmoid activation, and generates a structured agronomic diagnostic report.`,
        corePrinciple: `Complete Pipeline: Raw Leaf -> normalize_leaf_feature() -> compute_leaf_pathogen_logit() -> sigmoid() -> triage_crop_disease() -> Actionable Agronomic Report.`,
        whyItMatters: `Packaging modular functions into a unified pipeline allows testing in the browser 'Model Tester' tab with real-time sliders and instant diagnostic feedback.`,
        buildStep: `Implement predict_plant_disease to integrate all pipeline stages into a unified function.`,
        starterCode: `import math

# Step 8: Unified Plant Disease Inference Pipeline
def predict_plant_disease(lesion_area_pct: float, discoloration: float, spot_sharpness: float, moisture_pct: float = 50.0, threshold: float = 0.35) -> dict:
    # 1. Feature normalization
    norm_lesion = max(0.0, min(1.0, lesion_area_pct / 100.0))
    norm_disc = max(0.0, min(1.0, discoloration))
    norm_sharp = max(0.0, min(1.0, spot_sharpness))
    
    # 2. Logit calculation
    logit = (2.40 * norm_lesion) + (1.80 * norm_disc) + (1.20 * norm_sharp) - 1.60
    
    # 3. Sigmoid probability
    prob = round(1.0 / (1.0 + math.exp(-logit)), 4)
    
    # 4. Agronomic triage
    is_infected = prob >= threshold
    if prob >= 0.75:
        diagnosis = "Powdery Mildew / Blight (Severe)"
        action = "Quarantine block & apply targeted bio-fungicide"
    elif prob >= threshold:
        action = "Inspect canopy & schedule secondary moisture check"
        diagnosis = "Early Pathogen Infection Detected"
    else:
        diagnosis = "Healthy Foliage Baseline"
        action = "Routine surveillance"
        
    return {
        "lesion_area_pct": lesion_area_pct,
        "discoloration": discoloration,
        "infection_probability": prob,
        "is_infected": is_infected,
        "diagnosis": diagnosis,
        "action": action
    }

print("Healthy Leaf:", predict_plant_disease(lesion_area_pct=0.0, discoloration=0.04, spot_sharpness=0.02))
print("Diseased Leaf:", predict_plant_disease(lesion_area_pct=65.0, discoloration=0.82, spot_sharpness=0.75))
`,
        solutionCode: `import math

def predict_plant_disease(lesion_area_pct: float, discoloration: float, spot_sharpness: float, moisture_pct: float = 50.0, threshold: float = 0.35) -> dict:
    norm_lesion = max(0.0, min(1.0, lesion_area_pct / 100.0))
    norm_disc = max(0.0, min(1.0, discoloration))
    norm_sharp = max(0.0, min(1.0, spot_sharpness))
    
    logit = (2.40 * norm_lesion) + (1.80 * norm_disc) + (1.20 * norm_sharp) - 1.60
    prob = round(1.0 / (1.0 + math.exp(-logit)), 4)
    
    is_infected = prob >= threshold
    if prob >= 0.75:
        diagnosis = "Powdery Mildew / Blight (Severe)"
        action = "Quarantine block & apply targeted bio-fungicide"
    elif prob >= threshold:
        action = "Inspect canopy & schedule secondary moisture check"
        diagnosis = "Early Pathogen Infection Detected"
    else:
        diagnosis = "Healthy Foliage Baseline"
        action = "Routine surveillance"
        
    return {
        "lesion_area_pct": lesion_area_pct,
        "discoloration": discoloration,
        "infection_probability": prob,
        "is_infected": is_infected,
        "diagnosis": diagnosis,
        "action": action
    }

print("Healthy Leaf:", predict_plant_disease(lesion_area_pct=0.0, discoloration=0.04, spot_sharpness=0.02))
print("Diseased Leaf:", predict_plant_disease(lesion_area_pct=65.0, discoloration=0.82, spot_sharpness=0.75))
`,
        testAssertion: `res_clean = predict_plant_disease(0.0, 0.02, 0.01)
assert res_clean["is_infected"] is False, "Clean leaf should be marked healthy"
res_sick = predict_plant_disease(75.0, 0.85, 0.90)
assert res_sick["is_infected"] is True, "High lesion leaf must be classified as infected"
assert "Blight" in res_sick["diagnosis"] or "Severe" in res_sick["diagnosis"]
print("Assertion Passed: Full plant disease inference pipeline verified!")
`,
        predictQuestion: {
          prompt: "What is the primary advantage of bundling normalization, logit computation, and threshold triage into a single inference pipeline function?",
          options: [
            "It creates an atomic, reproducible inference endpoint ready for deployment to edge devices or web apps.",
            "It deletes intermediate variables so code cannot be read.",
            "It turns Python into JavaScript.",
            "It allows the program to run without memory.",
          ],
          correctIndex: 0,
          explanation: "Encapsulating the full pipeline ensures raw real-world inputs undergo the exact same preprocessing and transformation used during model training.",
        },
        checkQuestion: {
          prompt: "Where can you interactively test your plant disease model pipeline in Socrates?",
          options: [
            "In the 'Model Tester' tab using live leaf symptom sliders, preset buttons, and visual feedback.",
            "Nowhere, AI models cannot be tested interactively.",
            "By printing out the Python script on physical paper.",
            "By clearing the browser history.",
          ],
          correctIndex: 0,
          explanation: "The Model Tester tab lets you interactively adjust lesion area, discoloration, and spot sharpness sliders to test the model live in the browser.",
        },
      },
    ];
  }

  // Medical / Health / Disease / Clinical
  if (
    !isPlantOrAgri &&
    (lower.includes("diabet") ||
      (lower.includes("disease") && !isPlantOrAgri) ||
      lower.includes("cancer") ||
      lower.includes("medical") ||
      lower.includes("patient") ||
      (lower.includes("health") && !isPlantOrAgri) ||
      lower.includes("clinic") ||
      lower.includes("heart") ||
      lower.includes("tumor") ||
      lower.includes("glucose") ||
      (lower.includes("diagnosis") && !isPlantOrAgri))
  ) {
    return [
      {
        id: "problem-framing",
        title: `Clinical Problem Formulation: ${safeGoal}`,
        prereqs: [],
        difficulty: 1,
        hook: `Before predicting health outcomes for ${safeGoal}, what clinical features are measured, and what diagnostic category are we predicting?`,
        explanationSummary: `Medical machine learning defines an explicit contract: observable clinical vitals (glucose, blood pressure, BMI, age) serve as inputs (X), and the clinical diagnosis (positive or negative) serves as the target outcome (Y).`,
        corePrinciple: `Supervised classification learns a mathematical mapping f(patient_vitals) -> diagnostic_outcome. Target variables must never leak into the input features.`,
        whyItMatters: `Defining clear input/output contracts prevents target leakage, where future diagnostic test results contaminate training data and cause models to fail catastrophically in clinical deployment.`,
        buildStep: `Define the clinical problem specification dictionary with target diagnosis and observed patient vital features.`,
        starterCode: `# Step 1: Clinical Problem Contract for ${safeGoal}
# Fill in the blanks:
# 1. Specify task type: "classification" or "regression"
# 2. List the clinical vital signs observed by doctors
# 3. State the target outcome variable to predict

def define_clinical_spec():
    return {
        "project": "${safeGoal}",
        "task_type": ___,               # TODO: "classification" or "regression"
        "patient_vitals": [___],        # TODO: list strings, e.g. "glucose_mg_dl", "blood_pressure", "bmi", "age"
        "target_diagnosis": ___         # TODO: what single condition is being predicted?
    }

print("Clinical Spec:", define_clinical_spec())
`,
        solutionCode: `def define_clinical_spec():
    return {
        "project": "${safeGoal}",
        "task_type": "classification",
        "patient_vitals": ["glucose_mg_dl", "blood_pressure", "bmi", "age"],
        "target_diagnosis": "diabetes_positive"
    }

print("Clinical Spec:", define_clinical_spec())
`,
        testAssertion: `spec = define_clinical_spec()
assert isinstance(spec, dict), "define_clinical_spec() must return a dictionary"
task_type = str(spec.get("task_type", "")).lower().strip()
assert task_type != "___" and task_type != "", "Blank 'task_type' is not filled in yet. Choose 'classification' or 'regression'."
assert task_type == "classification", f"Disease diagnosis is a 'classification' task, got '{task_type}'"
vitals = spec.get("patient_vitals", [])
assert isinstance(vitals, list), "'patient_vitals' must be a list of vital names"
assert len(vitals) > 0 and vitals != ["___"], "Blank 'patient_vitals' is not filled in yet."
target = str(spec.get("target_diagnosis", "")).lower().strip()
assert target != "___" and target != "", "Blank 'target_diagnosis' is not filled in yet."
assert target not in [str(x).lower() for x in vitals], "TARGET_LEAKAGE: Target diagnosis cannot be in the patient_vitals list!"
print("Assertion Passed: Clinical specification contract verified!")
`,
        predictQuestion: {
          prompt: `For ${safeGoal}, why must the 'target_diagnosis' be excluded from the 'patient_vitals' input list?`,
          options: [
            "Including the target in the inputs creates data leakage, giving the model the answer during training but failing on new patients.",
            "Python throws a syntax error if any string appears twice.",
            "Medical datasets can only store numerical values, never names.",
            "Diagnostic models can only process one feature at a time.",
          ],
          correctIndex: 0,
          explanation: "If the target is in the inputs, the model simply memorizes the target directly (leakage) and learns nothing about predictive clinical vitals.",
        },
        checkQuestion: {
          prompt: `In machine learning for healthcare, what distinguishes classification from regression?`,
          options: [
            "Classification predicts discrete diagnostic categories (e.g. Positive vs Negative), while regression predicts continuous numerical quantities.",
            "Classification is only for images, regression is only for text.",
            "Regression is always more accurate than classification.",
            "Classification requires no training data.",
          ],
          correctIndex: 0,
          explanation: "Disease diagnosis categorizes patients into discrete condition classes (Binary or Multiclass Classification).",
        },
      },
      {
        id: "feature-engineering",
        title: "Clinical Feature Normalization & Scaling",
        prereqs: ["problem-framing"],
        difficulty: 2,
        hook: `Blood glucose ranges from 70–200 mg/dL while patient age ranges from 20–80. Why must we scale these features before training our model?`,
        explanationSummary: `When numerical features have widely differing scales, optimization algorithms update weights unevenly. Min-max normalization transforms raw clinical measurements onto a standardized [0.0, 1.0] scale using the formula: (x - min) / (max - min).`,
        corePrinciple: `Scaled Value = (Value - Min) / (Max - Min). Features on equal footing allow gradient descent to converge smoothly.`,
        whyItMatters: `Without scaling, features with large numbers (like glucose or platelet counts) dominate distance metrics and gradient calculations, blinding the model to vital indicators with smaller numerical ranges (like BMI or HbA1c).`,
        buildStep: `Implement min-max scaling to transform raw clinical patient measurements into a normalized [0.0, 1.0] range.`,
        starterCode: `# Step 2: Clinical Feature Scaling
# Formula: normalized = (value - min_val) / (max_val - min_val)

def normalize_vital(value: float, min_val: float, max_val: float) -> float:
    # Fill in the blanks:
    # 1. Compute the range (max_val - min_val)
    # 2. Divide the offset (value - min_val) by the range
    vital_range = ___                           # TODO: max_val - min_val
    normalized = ___                            # TODO: (value - min_val) / vital_range
    return round(normalized, 4)

# Test with glucose: value=135 mg/dL, normal range [70, 200]
print("Normalized Glucose:", normalize_vital(135.0, 70.0, 200.0))
`,
        solutionCode: `def normalize_vital(value: float, min_val: float, max_val: float) -> float:
    vital_range = max_val - min_val
    normalized = (value - min_val) / vital_range
    return round(normalized, 4)

print("Normalized Glucose:", normalize_vital(135.0, 70.0, 200.0))
`,
        testAssertion: `res = normalize_vital(135.0, 70.0, 200.0)
assert res == 0.5, f"Expected 0.5 for glucose 135 in range [70, 200], got {res}"
res_low = normalize_vital(70.0, 70.0, 200.0)
assert res_low == 0.0, f"Expected 0.0 for min value, got {res_low}"
res_high = normalize_vital(200.0, 70.0, 200.0)
assert res_high == 1.0, f"Expected 1.0 for max value, got {res_high}"
print("Assertion Passed: Clinical vital scaling operational!")
`,
        predictQuestion: {
          prompt: "If a patient's fasting blood glucose is 200 mg/dL and the reference cohort range is 70 to 200 mg/dL, what is the normalized value?",
          options: [
            "1.00 (the maximum boundary of the normalized scale)",
            "0.50 (the midpoint of the cohort)",
            "0.00 (baseline)",
            "200.00 (unscaled raw measurement)"
          ],
          correctIndex: 0,
          explanation: "(200 - 70) / (200 - 70) = 130 / 130 = 1.00.",
        },
        checkQuestion: {
          prompt: "What happens during gradient updates if one vital feature has values in the thousands and another has values between 0 and 1?",
          options: [
            "The large feature dominates gradient magnitude, causing unstable updates and ignoring the smaller feature.",
            "Python automatically balances the weights without any scaling.",
            "The model learns twice as fast.",
            "The smaller feature gets multiplied by 1000 automatically."
          ],
          correctIndex: 0,
          explanation: "Gradients are proportional to input feature scale, so unscaled large features overwhelm optimization.",
        },
      },
      {
        id: "model-architecture",
        title: "Clinical Risk Scoring & Sigmoid Probability Mapping",
        prereqs: ["feature-engineering"],
        difficulty: 3,
        hook: `How does our diagnostic model turn weighted vital scores into a true clinical risk probability between 0% and 100%?`,
        explanationSummary: `A linear combination of weighted patient vitals produces an unbounded logit score z. The sigmoid activation function sigma(z) = 1 / (1 + exp(-z)) maps this score smoothly into a calibrated clinical probability between 0.0 and 1.0.`,
        corePrinciple: `P(Disease | Vitals) = 1 / (1 + exp(-z)), where z = w1*vital1 + w2*vital2 + ... + bias.`,
        whyItMatters: `Clinicians need probabilistic confidence estimates, not just arbitrary numbers, so they can weigh clinical uncertainty before recommending invasive procedures or treatments.`,
        buildStep: `Implement the sigmoid activation function to map logit scores into clinical disease probabilities.`,
        starterCode: `# Step 3: Sigmoid Risk Probability Function
import math

def calculate_disease_probability(logit_score: float) -> float:
    # Fill in the blanks:
    # Formula: 1 / (1 + math.exp(-logit_score))
    denominator = ___                           # TODO: 1.0 + math.exp(-logit_score)
    probability = ___                           # TODO: 1.0 / denominator
    return round(probability, 4)

print("Probability for logit 0.0:", calculate_disease_probability(0.0))
print("Probability for logit 2.2:", calculate_disease_probability(2.2))
`,
        solutionCode: `import math

def calculate_disease_probability(logit_score: float) -> float:
    denominator = 1.0 + math.exp(-logit_score)
    probability = 1.0 / denominator
    return round(probability, 4)

print("Probability for logit 0.0:", calculate_disease_probability(0.0))
print("Probability for logit 2.2:", calculate_disease_probability(2.2))
`,
        testAssertion: `p0 = calculate_disease_probability(0.0)
assert p0 == 0.5, f"Expected 0.5 for logit 0.0, got {p0}"
p_high = calculate_disease_probability(2.1972)
assert round(p_high, 2) == 0.90, f"Expected ~0.90 for logit 2.1972, got {p_high}"
p_low = calculate_disease_probability(-2.1972)
assert round(p_low, 2) == 0.10, f"Expected ~0.10 for logit -2.1972, got {p_low}"
print("Assertion Passed: Sigmoid probability mapping verified!")
`,
        predictQuestion: {
          prompt: "When the weighted logit score z equals exactly 0.0, what disease probability does the sigmoid function output?",
          options: [
            "0.50 (50% probability — boundary of maximum uncertainty)",
            "0.00 (0% probability)",
            "1.00 (100% certainty)",
            "-1.00 (negative confidence)"
          ],
          correctIndex: 0,
          explanation: "1 / (1 + exp(0)) = 1 / (1 + 1) = 1/2 = 0.50.",
        },
        checkQuestion: {
          prompt: "Why is the sigmoid function preferred over a simple linear clamp [0, 1] for risk scoring?",
          options: [
            "It is smoothly differentiable everywhere and asymptotically bounds outputs between 0 and 1 without hard cutoffs.",
            "It rounds all numbers to the nearest integer.",
            "It only works with positive numbers.",
            "It deletes features with small values."
          ],
          correctIndex: 0,
          explanation: "Sigmoidal curves allow gradient backpropagation across the entire real number line without abrupt gradient zeroing.",
        },
      },
      {
        id: "decision-boundary",
        title: "Clinical Decision Threshold & Sensitivity Triage",
        prereqs: ["model-architecture"],
        difficulty: 3,
        hook: `In healthcare, missing a sick patient (false negative) is dangerous. How do we tune the decision threshold to protect patients?`,
        explanationSummary: `While standard models use 0.50 as a default decision threshold, clinical risk models can lower the threshold (e.g. to 0.35) to prioritize sensitivity (recall), ensuring potential disease cases undergo secondary physician review.`,
        corePrinciple: `Decision = "High Risk / Positive" if P(Disease) >= threshold else "Low Risk / Negative". Adjusting threshold trades off Sensitivity vs Specificity.`,
        whyItMatters: `A rigid 0.50 threshold fails in medicine when the cost of a false negative (missed diagnosis) is far higher than the cost of a false positive (follow-up confirmatory blood test).`,
        buildStep: `Implement the clinical triage decision function with an adjustable risk threshold.`,
        starterCode: `# Step 4: Clinical Decision Triage Function

def triage_patient(risk_probability: float, threshold: float = 0.40) -> dict:
    # Fill in the blanks:
    # 1. Determine if risk_probability meets or exceeds threshold
    # 2. Return decision dict with category and risk level
    is_positive = ___                           # TODO: risk_probability >= threshold
    diagnosis = ___ if is_positive else ___     # TODO: "POSITIVE" if is_positive else "NEGATIVE"
    return {
        "probability": risk_probability,
        "threshold": threshold,
        "diagnosis": diagnosis,
        "recommendation": "Confirmatory clinical exam" if is_positive else "Routine monitoring"
    }

print("Patient 1:", triage_patient(0.45, threshold=0.40))
print("Patient 2:", triage_patient(0.25, threshold=0.40))
`,
        solutionCode: `def triage_patient(risk_probability: float, threshold: float = 0.40) -> dict:
    is_positive = risk_probability >= threshold
    diagnosis = "POSITIVE" if is_positive else "NEGATIVE"
    return {
        "probability": risk_probability,
        "threshold": threshold,
        "diagnosis": diagnosis,
        "recommendation": "Confirmatory clinical exam" if is_positive else "Routine monitoring"
    }

print("Patient 1:", triage_patient(0.45, threshold=0.40))
print("Patient 2:", triage_patient(0.25, threshold=0.40))
`,
        testAssertion: `t1 = triage_patient(0.45, 0.40)
assert t1["diagnosis"] == "POSITIVE", f"Expected POSITIVE for 0.45 >= 0.40, got {t1['diagnosis']}"
t2 = triage_patient(0.35, 0.40)
assert t2["diagnosis"] == "NEGATIVE", f"Expected NEGATIVE for 0.35 < 0.40, got {t2['diagnosis']}"
t3 = triage_patient(0.40, 0.40)
assert t3["diagnosis"] == "POSITIVE", f"Threshold boundary 0.40 should trigger POSITIVE, got {t3['diagnosis']}"
print("Assertion Passed: Clinical decision triage operational!")
`,
        predictQuestion: {
          prompt: "If we lower the diagnostic decision threshold from 0.50 down to 0.30, what happens to the number of flagged patients?",
          options: [
            "More patients will be flagged as high risk (higher sensitivity / fewer missed cases).",
            "Fewer patients will be flagged.",
            "The model stops making predictions.",
            "All patients will be diagnosed as healthy."
          ],
          correctIndex: 0,
          explanation: "Lowering the decision threshold catches more patients who have even moderate probability, increasing sensitivity.",
        },
        checkQuestion: {
          prompt: "Why would a hospital choose a decision threshold lower than 0.50 for a disease screening model?",
          options: [
            "Because missing a true case (false negative) could be fatal, whereas a false alarm can be resolved by a follow-up test.",
            "Because computers prefer smaller numbers.",
            "To make the model run faster.",
            "Because probabilities never exceed 0.50 in reality."
          ],
          correctIndex: 0,
          explanation: "In clinical screening, the asymmetric cost of false negatives justifies a more sensitive, lower threshold.",
        },
      },
      {
        id: "loss-calculation",
        title: "Binary Cross-Entropy Loss & Penalty Formulation",
        prereqs: ["model-architecture"],
        difficulty: 3,
        hook: "When our diagnostic model makes a high-confidence false negative prediction, how does calculus mathematically penalize that mistake?",
        explanationSummary: "Binary cross-entropy loss quantifies prediction penalty: Loss = -[y * log(p) + (1 - y) * log(1 - p)]. If ground truth y=1, loss is -log(p). If p is close to 0, loss skyrockets toward infinity.",
        corePrinciple: "BCE Loss = -(y * log(p) + (1 - y) * log(1 - p)). Penalizes confident misdiagnoses logarithmically.",
        whyItMatters: "Squared error treats all errors symmetrically. Logarithmic loss imposes massive penalties on overconfident medical blunders.",
        buildStep: "Implement the binary cross-entropy loss function to calculate error on patient diagnostic predictions.",
        starterCode: `# Step 5: Binary Cross-Entropy Loss
import math

def compute_bce_loss(predicted_prob: float, true_label: int) -> float:
    # Fill in the blanks:
    # Clamp probability slightly to avoid math.log(0)
    p = max(min(predicted_prob, 0.9999), 0.0001)
    # Formula: - (y * log(p) + (1 - y) * log(1 - p))
    term1 = ___                                 # TODO: true_label * math.log(p)
    term2 = ___                                 # TODO: (1 - true_label) * math.log(1.0 - p)
    loss = -(term1 + term2)
    return round(loss, 4)

print("Loss (True=1, Pred=0.9):", compute_bce_loss(0.9, 1))
print("Loss (True=1, Pred=0.1 - Severe Error):", compute_bce_loss(0.1, 1))
`,
        solutionCode: `import math

def compute_bce_loss(predicted_prob: float, true_label: int) -> float:
    p = max(min(predicted_prob, 0.9999), 0.0001)
    term1 = true_label * math.log(p)
    term2 = (1 - true_label) * math.log(1.0 - p)
    loss = -(term1 + term2)
    return round(loss, 4)

print("Loss (True=1, Pred=0.9):", compute_bce_loss(0.9, 1))
print("Loss (True=1, Pred=0.1 - Severe Error):", compute_bce_loss(0.1, 1))
`,
        testAssertion: `l_good = compute_bce_loss(0.9, 1)
assert l_good < 0.15, f"Expected low loss for accurate prediction, got {l_good}"
l_bad = compute_bce_loss(0.1, 1)
assert l_bad > 2.0, f"Expected high penalty (>2.0) for confident wrong prediction, got {l_bad}"
l_neg_good = compute_bce_loss(0.1, 0)
assert l_neg_good < 0.15, f"Expected low loss for accurate negative diagnosis, got {l_neg_good}"
print("Assertion Passed: Binary cross-entropy loss verified!")
`,
        predictQuestion: {
          prompt: "If a patient has diabetes (label=1) and the model predicts 0.99 probability, what happens to the BCE loss?",
          options: [
            "The loss approaches 0.0 because -log(0.99) is nearly zero (near-perfect prediction).",
            "The loss approaches infinity.",
            "The loss becomes negative.",
            "The program crashes because log(1) is undefined.",
          ],
          correctIndex: 0,
          explanation: "-log(0.99) ≈ 0.010. Accurate predictions incur nearly zero loss.",
        },
        checkQuestion: {
          prompt: "Why does binary cross-entropy loss use logarithms instead of simple absolute difference |y - p|?",
          options: [
            "Logarithms penalize confident wrong predictions exponentially more severely than small uncertainties.",
            "Logarithms are faster for CPUs to calculate than subtraction.",
            "Absolute differences cannot be computed in Python.",
            "Because probabilities are always negative.",
          ],
          correctIndex: 0,
          explanation: "As predicted probability p approaches 0 for a true positive case, -log(p) approaches infinity, forcing the model to fix disastrous misdiagnoses.",
        },
      },
      {
        id: "gradient-optimization",
        title: "Gradient Descent & Clinical Weight Optimization",
        prereqs: ["loss-calculation"],
        difficulty: 4,
        hook: "When a training patient produces an error, how does gradient descent compute the exact numerical nudge to improve the model's weights?",
        explanationSummary: "For logistic regression with BCE loss, the derivative with respect to feature weight w_i simplifies elegantly: gradient = (prediction - true_label) * feature_val. The weight is updated by: w_new = w - learning_rate * gradient.",
        corePrinciple: "Gradient = (p - y) * x; New Weight = Weight - lr * Gradient.",
        whyItMatters: "Gradient descent is the engine that drives modern machine learning, iteratively tuning weights toward zero prediction error.",
        buildStep: "Implement the gradient descent weight update step for a clinical vital feature.",
        starterCode: `# Step 6: Gradient Descent Weight Update
def update_clinical_weight(current_weight: float, feature_val: float, pred: float, label: int, lr: float = 0.1) -> float:
    # Fill in the blanks:
    # 1. Error = pred - label
    # 2. Gradient = error * feature_val
    # 3. New weight = current_weight - lr * gradient
    error = ___                                 # TODO: pred - label
    gradient = ___                              # TODO: error * feature_val
    new_weight = current_weight - (lr * gradient)
    return round(new_weight, 4)

print("Updated Weight (lowering error):", update_clinical_weight(1.0, feature_val=0.8, pred=0.9, label=0, lr=0.1))
`,
        solutionCode: `def update_clinical_weight(current_weight: float, feature_val: float, pred: float, label: int, lr: float = 0.1) -> float:
    error = pred - label
    gradient = error * feature_val
    new_weight = current_weight - (lr * gradient)
    return round(new_weight, 4)

print("Updated Weight (lowering error):", update_clinical_weight(1.0, feature_val=0.8, pred=0.9, label=0, lr=0.1))
`,
        testAssertion: `w1 = update_clinical_weight(1.0, 0.8, 0.9, 0, lr=0.1)
assert w1 < 1.0, f"Weight should decrease when model over-predicts positive for negative patient, got {w1}"
w2 = update_clinical_weight(1.0, 0.8, 0.2, 1, lr=0.1)
assert w2 > 1.0, f"Weight should increase when model under-predicts for positive patient, got {w2}"
print("Assertion Passed: Gradient descent weight optimizer operational!")
`,
        predictQuestion: {
          prompt: "If prediction is 0.80 and true label is 0 (false alarm), should the feature weight increase or decrease?",
          options: [
            "Decrease: error is positive (+0.80), so subtracting lr * gradient reduces the weight and lowers future risk scores.",
            "Increase: weights must always grow during training.",
            "Stay identical: 0.80 is close enough to 0.",
            "Reset to zero immediately.",
          ],
          correctIndex: 0,
          explanation: "Error is positive (0.8 - 0 = +0.8). Subtracting learning_rate * (+gradient) pushes the weight down.",
        },
        checkQuestion: {
          prompt: "What is the purpose of the learning rate parameter (lr) in gradient descent?",
          options: [
            "It controls step size along the negative gradient, preventing violent oscillations or divergence.",
            "It measures the accuracy of the training dataset.",
            "It determines how many patient records are in memory.",
            "It automatically stops the program when complete.",
          ],
          correctIndex: 0,
          explanation: "Learning rate governs how far weights move in the gradient direction on each step.",
        },
      },
      {
        id: "model-evaluation",
        title: "Clinical Evaluation: Sensitivity & Confusion Matrix",
        prereqs: ["decision-boundary"],
        difficulty: 4,
        hook: "If 95 out of 100 patients are healthy, a model predicting 'Healthy' for everyone gets 95% accuracy while missing every sick patient. How do clinicians evaluate real performance?",
        explanationSummary: "Clinical models are evaluated using a Confusion Matrix: True Positives (TP), False Positives (FP), True Negatives (TN), and False Negatives (FN). Sensitivity = TP / (TP + FN) measures the proportion of actual sick patients caught.",
        corePrinciple: "Sensitivity (Recall) = TP / (TP + FN). In healthcare, high sensitivity prevents missed diagnoses.",
        whyItMatters: "Accuracy is dangerously deceptive in disease screening. Measuring sensitivity guarantees life-saving triage.",
        buildStep: "Compute the confusion matrix and clinical sensitivity metric from cohort predictions.",
        starterCode: `# Step 7: Clinical Confusion Matrix & Sensitivity
def evaluate_clinical_cohort(predictions: list[int], actuals: list[int]) -> dict:
    tp = sum(1 for p, a in zip(predictions, actuals) if p == 1 and a == 1)
    fp = sum(1 for p, a in zip(predictions, actuals) if p == 1 and a == 0)
    tn = sum(1 for p, a in zip(predictions, actuals) if p == 0 and a == 0)
    fn = sum(1 for p, a in zip(predictions, actuals) if p == 0 and a == 1)
    
    # Fill in the blanks:
    # Sensitivity (Recall) = tp / (tp + fn)
    total_positives = tp + fn
    sensitivity = ___ if total_positives > 0 else 0.0   # TODO: round(tp / total_positives, 4)
    return {"tp": tp, "fp": fp, "tn": tn, "fn": fn, "sensitivity": sensitivity}

print("Cohort Metrics:", evaluate_clinical_cohort([1, 1, 0, 1], [1, 1, 1, 0]))
`,
        solutionCode: `def evaluate_clinical_cohort(predictions: list[int], actuals: list[int]) -> dict:
    tp = sum(1 for p, a in zip(predictions, actuals) if p == 1 and a == 1)
    fp = sum(1 for p, a in zip(predictions, actuals) if p == 1 and a == 0)
    tn = sum(1 for p, a in zip(predictions, actuals) if p == 0 and a == 0)
    fn = sum(1 for p, a in zip(predictions, actuals) if p == 0 and a == 1)
    total_positives = tp + fn
    sensitivity = round(tp / total_positives, 4) if total_positives > 0 else 0.0
    return {"tp": tp, "fp": fp, "tn": tn, "fn": fn, "sensitivity": sensitivity}

print("Cohort Metrics:", evaluate_clinical_cohort([1, 1, 0, 1], [1, 1, 1, 0]))
`,
        testAssertion: `res = evaluate_clinical_cohort([1, 1, 0, 0], [1, 1, 1, 0])
assert res["tp"] == 2 and res["fn"] == 1, f"Expected 2 TP, 1 FN, got {res}"
assert round(res["sensitivity"], 2) == 0.67, f"Expected 2/3 = 0.67 sensitivity, got {res['sensitivity']}"
print("Assertion Passed: Clinical evaluation metrics verified!")
`,
        predictQuestion: {
          prompt: "In a cohort of 10 diabetic patients, if the model correctly identifies 8 and misses 2, what is the clinical sensitivity?",
          options: [
            "0.80 (80% sensitivity = 8 / (8 + 2))",
            "0.20 (20%)",
            "1.00 (100%)",
            "0.50 (50%)",
          ],
          correctIndex: 0,
          explanation: "Sensitivity = TP / (TP + FN) = 8 / (8 + 2) = 0.80.",
        },
        checkQuestion: {
          prompt: "Why is a False Negative considered far more dangerous than a False Positive in disease diagnosis?",
          options: [
            "A false negative leaves a sick patient untreated, while a false positive triggers a safe confirmatory check.",
            "False negatives use more computer RAM.",
            "False positives cause the program to crash.",
            "Because medical laws prohibit false negatives only.",
          ],
          correctIndex: 0,
          explanation: "Missing an active pathology (false negative) leads to disease progression; false alarms are resolved safely by second-opinion tests.",
        },
      },
      {
        id: "inference-pipeline",
        title: "Interactive Clinical Deployment: Complete Inference Engine",
        prereqs: ["model-evaluation"],
        difficulty: 4,
        hook: "We have normalized vitals, weighted logits, sigmoid probability, and clinical triage. How do we package this into a live interactive pipeline that doctors can test on any new patient?",
        explanationSummary: "An end-to-end inference pipeline takes raw patient measurements (e.g. glucose, BMI, age), normalizes them against clinical bounds, calculates the linear logit, evaluates the sigmoid probability, and returns the actionable triage diagnosis in a structured report.",
        corePrinciple: "Raw Patient Data -> Pipeline Vectorizer -> Model Scoring -> Sigmoid Risk Probability -> Clinical Triage Decision.",
        whyItMatters: "Deploying machine learning to healthcare requires a deterministic, end-to-end pipeline that safely validates inputs and produces transparent, auditable clinical decisions.",
        buildStep: "Package the complete end-to-end clinical inference pipeline function for live patient testing.",
        starterCode: `# Step 8: Complete End-to-End Clinical Inference Engine
import math

def run_patient_diagnosis(glucose: float, bmi: float, age: float, threshold: float = 0.40) -> dict:
    # 1. Normalize vitals to [0, 1]
    norm_glucose = max(0.0, min(1.0, (glucose - 70.0) / 130.0))
    norm_bmi = max(0.0, min(1.0, (bmi - 18.5) / 16.5))
    norm_age = max(0.0, min(1.0, (age - 20.0) / 60.0))
    
    # 2. Linear logit with clinical weights [2.2, 1.3, 0.9] and bias -1.8
    logit = (2.2 * norm_glucose) + (1.3 * norm_bmi) + (0.9 * norm_age) - 1.8
    
    # 3. Sigmoid risk probability
    # Complete the blank: 1.0 / (1.0 + math.exp(-logit))
    risk_prob = ___                             # TODO: 1.0 / (1.0 + math.exp(-logit))
    
    # 4. Clinical triage decision
    is_positive = risk_prob >= threshold
    return {
        "glucose": glucose,
        "bmi": bmi,
        "age": age,
        "risk_probability": round(risk_prob, 4),
        "diagnosis": "POSITIVE" if is_positive else "NEGATIVE",
        "threshold": threshold,
        "recommendation": "Urgent HbA1c & clinical review" if is_positive else "Standard routine monitoring"
    }

print("Live Patient 1:", run_patient_diagnosis(glucose=175, bmi=33.5, age=58))
print("Live Patient 2:", run_patient_diagnosis(glucose=88, bmi=21.0, age=25))
`,
        solutionCode: `import math

def run_patient_diagnosis(glucose: float, bmi: float, age: float, threshold: float = 0.40) -> dict:
    norm_glucose = max(0.0, min(1.0, (glucose - 70.0) / 130.0))
    norm_bmi = max(0.0, min(1.0, (bmi - 18.5) / 16.5))
    norm_age = max(0.0, min(1.0, (age - 20.0) / 60.0))
    logit = (2.2 * norm_glucose) + (1.3 * norm_bmi) + (0.9 * norm_age) - 1.8
    risk_prob = 1.0 / (1.0 + math.exp(-logit))
    is_positive = risk_prob >= threshold
    return {
        "glucose": glucose,
        "bmi": bmi,
        "age": age,
        "risk_probability": round(risk_prob, 4),
        "diagnosis": "POSITIVE" if is_positive else "NEGATIVE",
        "threshold": threshold,
        "recommendation": "Urgent HbA1c & clinical review" if is_positive else "Standard routine monitoring"
    }

print("Live Patient 1:", run_patient_diagnosis(glucose=175, bmi=33.5, age=58))
print("Live Patient 2:", run_patient_diagnosis(glucose=88, bmi=21.0, age=25))
`,
        testAssertion: `p_high = run_patient_diagnosis(175, 33.5, 58, threshold=0.40)
assert p_high["diagnosis"] == "POSITIVE", f"Expected POSITIVE for high-risk patient, got {p_high['diagnosis']}"
assert p_high["risk_probability"] > 0.60, f"Expected risk > 60%, got {p_high['risk_probability']}"

p_low = run_patient_diagnosis(88, 21.0, 25, threshold=0.40)
assert p_low["diagnosis"] == "NEGATIVE", f"Expected NEGATIVE for healthy baseline, got {p_low['diagnosis']}"
assert p_low["risk_probability"] < 0.30, f"Expected risk < 30%, got {p_low['risk_probability']}"
print("Assertion Passed: Full clinical deployment pipeline verified operational!")
`,
        predictQuestion: {
          prompt: "What is the primary architectural purpose of the complete inference pipeline in a production clinical AI system?",
          options: [
            "It chains feature normalization, weight scoring, probability mapping, and triage logic into a unified, reproducible function for live patient testing.",
            "It erases patient data to preserve database disk space.",
            "It retrains all model weights on every single prediction query.",
            "It generates random numbers when the model is unsure.",
          ],
          correctIndex: 0,
          explanation: "The inference pipeline executes the complete, deterministic transform chain from raw inputs to calibrated clinical triage decisions.",
        },
        checkQuestion: {
          prompt: "Once the inference pipeline passes assertion testing, where can you test it live with custom patient inputs in Socrates?",
          options: [
            "In the 'Model Tester' tab with interactive vital sliders and the live clinical risk gauge.",
            "By writing letters to the hospital.",
            "Nowhere, AI models cannot be tested live.",
            "By restarting the entire course.",
          ],
          correctIndex: 0,
          explanation: "The Model Tester tab lets you interactively adjust patient vitals and thresholds live to observe real-time risk predictions.",
        },
      },
    ];
  }

  // General Custom Machine Learning Project (Grounded in their exact goal!)
  return [
    {
      id: "problem-framing",
      title: `Problem Formulation: ${safeGoal}`,
      prereqs: [],
      difficulty: 1,
      hook: `Before writing code for ${safeGoal}, what features does the model observe and what single target quantity does it predict?`,
      explanationSummary: `Every machine learning project begins by defining an input/output contract: observable features serve as inputs (X), and the learned quantity serves as the target outcome (Y).`,
      corePrinciple: `Supervised learning learns f(X) -> Y. Features in X must be known prior to prediction, and target Y must never leak into X.`,
      whyItMatters: `Defining the data contract upfront prevents target leakage and establishes whether the task requires classification or regression.`,
      buildStep: `Define the input/output specification contract for ${safeGoal}.`,
      starterCode: `# Step 1: Input/Output Contract for ${safeGoal}
# Fill in the blanks:
# 1. Is this "regression" or "classification"?
# 2. What input features does the model observe?
# 3. What is the target to predict?

def define_project_spec():
    return {
        "project": "${safeGoal}",
        "task_type": ___,        # TODO: "regression" or "classification"?
        "inputs": [___],         # TODO: list the input feature names as strings
        "target": ___            # TODO: what single value is it predicting?
    }

print("Spec:", define_project_spec())
`,
      solutionCode: `def define_project_spec():
    return {
        "project": "${safeGoal}",
        "task_type": "classification",
        "inputs": ["feature_1", "feature_2"],
        "target": "target_value"
    }

print("Spec:", define_project_spec())
`,
      testAssertion: `spec = define_project_spec()
assert isinstance(spec, dict), "define_project_spec() must return a dictionary"
task_type = str(spec.get("task_type", "")).lower().strip()
assert task_type != "___" and task_type != "", "Blank 'task_type' is not filled in yet. Choose 'regression' or 'classification'."
inputs = spec.get("inputs", [])
assert isinstance(inputs, list), "'inputs' must be a list of feature names"
assert len(inputs) > 0 and inputs != ["___"], "Blank 'inputs' is not filled in yet."
target = str(spec.get("target", "")).lower().strip()
assert target != "___" and target != "", "Blank 'target' is not filled in yet."
assert target not in [str(x).lower() for x in inputs], "TARGET_LEAKAGE: Target cannot be in the inputs list!"
print("Assertion Passed: Project specification verified!")
`,
      predictQuestion: {
        prompt: `For ${safeGoal}, what should go into the model's 'inputs' list, and what should the 'target' be?`,
        options: [
          "inputs: observable features known beforehand, target: outcome to predict",
          "inputs: outcome to predict, target: observable features",
          "inputs: model weights, target: gradient loss",
          "inputs: training code, target: compiler output",
        ],
        correctIndex: 0,
        explanation: "Inputs are the observable features known beforehand; target is what the model learns to predict.",
      },
      checkQuestion: {
        prompt: `What is the danger of including the target variable inside the model's input features list?`,
        options: [
          "Target leakage: the model cheats by looking at the target directly during training and fails on new real-world data.",
          "It makes the program run out of memory.",
          "Python prohibits duplicate variables.",
          "The output will always be zero.",
        ],
        correctIndex: 0,
        explanation: "Target leakage ruins model generalization because the target is unavailable at inference time.",
      },
    },
    {
      id: "feature-engineering",
      title: `Feature Vectorization & Preprocessing: ${safeGoal}`,
      prereqs: ["problem-framing"],
      difficulty: 2,
      hook: `Raw data for ${safeGoal} arrives in diverse formats. How do we convert messy inputs into clean numerical float vectors?`,
      explanationSummary: `Machine learning models operate on numerical matrices. Transforming raw inputs into structured float vectors is required for matrix multiplication and gradient optimization.`,
      corePrinciple: `Feature Vectorization maps domain measurements to standard numeric floats [x_1, x_2, ..., x_n].`,
      whyItMatters: `Mathematical optimization algorithms cannot compute gradients on missing markers or unparsed strings.`,
      buildStep: `Build the normalization and numerical vectorization transform for incoming project data.`,
      starterCode: `# Step 2: Numerical Feature Vectorization
# Complete the blank to convert raw inputs into float values:

def vectorize_features(raw_data: list) -> list[float]:
    # Extract numerical vector by converting each valid item to float
    clean_vector = [___ for x in raw_data if isinstance(x, (int, float))]  # TODO: float(x)
    return clean_vector

print("Vector:", vectorize_features([10, 20.5, "ignore", 30]))
`,
      solutionCode: `def vectorize_features(raw_data: list) -> list[float]:
    clean_vector = [float(x) for x in raw_data if isinstance(x, (int, float))]
    return clean_vector

print("Vector:", vectorize_features([10, 20.5, "ignore", 30]))
`,
      testAssertion: `res = vectorize_features([1, 2, "a", 3.5])
assert res == [1.0, 2.0, 3.5], f"Expected [1.0, 2.0, 3.5], got {res}"
print("Assertion Passed: Feature vectorizer operational!")
`,
      predictQuestion: {
        prompt: "Why must non-numeric values be converted or filtered during feature vectorization?",
        options: [
          "Matrix multiplication and gradient updates require pure numerical floats",
          "Text uses more disk storage than floats",
          "Python prohibits mixing strings and numbers in lists",
          "Neural networks can only run on integers",
        ],
        correctIndex: 0,
        explanation: "Mathematical optimization algorithms require numerical tensors to compute dot products and derivatives.",
      },
      checkQuestion: {
        prompt: "What is the primary benefit of feature vectorization in machine learning?",
        options: [
          "It maps diverse real-world domain inputs into a uniform mathematical coordinate space.",
          "It deletes noisy rows from memory permanently.",
          "It eliminates the need for test datasets.",
          "It converts the script into C++ binary code.",
        ],
        correctIndex: 0,
        explanation: "Vectorization creates numerical coordinates for geometrical pattern matching and optimization.",
      },
    },
    {
      id: "model-architecture",
      title: `Core Decision Function & Scoring: ${safeGoal}`,
      prereqs: ["feature-engineering"],
      difficulty: 3,
      hook: `Once features are numbers, what mathematical function calculates the model's prediction score?`,
      explanationSummary: `Linear scoring computes the dot product of learned weights with input features, then adds a bias term: score = sum(w_i * x_i) + bias.`,
      corePrinciple: `Decision Score = dot_product(Weights, Features) + Bias.`,
      whyItMatters: `The scoring function forms the computational heart of linear models, logistic regression, and neural network layers.`,
      buildStep: `Implement the parameterized scoring function that maps features to class scores.`,
      starterCode: `# Step 3: Parameterized Decision Function
# Formula: score = sum(feature * weight) + bias

def predict_score(features: list[float], weights: list[float], bias: float = 0.0) -> float:
    # Fill in the blanks:
    # 1. Compute dot product
    # 2. Add bias intercept
    weighted_sum = ___           # TODO: sum(f * w for f, w in zip(features, weights))
    score = ___                  # TODO: weighted_sum + bias
    return round(score, 4)

print("Score:", predict_score([1.0, 2.0], [0.5, 1.5], 0.1))
`,
      solutionCode: `def predict_score(features: list[float], weights: list[float], bias: float = 0.0) -> float:
    weighted_sum = sum(f * w for f, w in zip(features, weights))
    score = weighted_sum + bias
    return round(score, 4)

print("Score:", predict_score([1.0, 2.0], [0.5, 1.5], 0.1))
`,
      testAssertion: `s = predict_score([1.0, 2.0], [0.5, 1.5], 0.1)
assert round(s, 2) == 3.6, f"Expected 3.6 for (1*0.5 + 2*1.5 + 0.1), got {s}"
print("Assertion Passed: Decision function operational!")
`,
      predictQuestion: {
        prompt: "In the decision function score = sum(w * x) + bias, what is the role of the bias term?",
        options: [
          "It shifts the decision boundary independently of feature inputs (baseline intercept)",
          "It randomly introduces noise to test model stability",
          "It multiplies all features by a constant scaling factor",
          "It records how long the model has been training",
        ],
        correctIndex: 0,
        explanation: "The bias allows the model to predict a non-zero baseline even when all input features are zero.",
      },
      checkQuestion: {
        prompt: "If all features x are zero, what does predict_score(features, weights, bias) return?",
        options: [
          "The bias value",
          "0.0 always",
          "An error",
          "Infinity",
        ],
        correctIndex: 0,
        explanation: "sum(0 * w) = 0, so 0 + bias = bias.",
      },
    },
    {
      id: "decision-boundary",
      title: `Decision Boundary & Evaluation: ${safeGoal}`,
      prereqs: ["model-architecture"],
      difficulty: 3,
      hook: `How does the system decide whether a score warrants a positive or negative prediction for ${safeGoal}?`,
      explanationSummary: `A decision threshold partitions the continuous score space into discrete predictions. Comparing predictions against ground truth labels yields evaluation metrics like Precision, Recall, and Accuracy.`,
      corePrinciple: `Prediction = 1 if score >= threshold else 0.`,
      whyItMatters: `Threshold tuning lets you adapt your system to real-world costs — such as prioritizing recall to avoid missed detections.`,
      buildStep: `Implement the decision thresholding rule and evaluate prediction accuracy against ground truth labels.`,
      starterCode: `# Step 4: Decision Threshold & Accuracy Evaluation

def evaluate_predictions(scores: list[float], targets: list[int], threshold: float = 0.50) -> dict:
    # Fill in the blanks:
    # 1. Convert each continuous score to 1 if score >= threshold else 0
    # 2. Count correct matches
    predictions = [___ for s in scores]         # TODO: 1 if s >= threshold else 0
    correct = sum(1 for p, t in zip(predictions, targets) if p == t)
    accuracy = round(correct / len(targets), 4) if targets else 0.0
    return {"accuracy": accuracy, "predictions": predictions}

print("Evaluation:", evaluate_predictions([0.8, 0.3, 0.6], [1, 0, 1], threshold=0.50))
`,
      solutionCode: `def evaluate_predictions(scores: list[float], targets: list[int], threshold: float = 0.50) -> dict:
    predictions = [1 if s >= threshold else 0 for s in scores]
    correct = sum(1 for p, t in zip(predictions, targets) if p == t)
    accuracy = round(correct / len(targets), 4) if targets else 0.0
    return {"accuracy": accuracy, "predictions": predictions}

print("Evaluation:", evaluate_predictions([0.8, 0.3, 0.6], [1, 0, 1], threshold=0.50))
`,
      testAssertion: `res = evaluate_predictions([0.8, 0.3, 0.6], [1, 0, 1], 0.50)
assert res["accuracy"] == 1.0, f"Expected 1.0 accuracy, got {res['accuracy']}"
assert res["predictions"] == [1, 0, 1], f"Expected [1, 0, 1], got {res['predictions']}"
res2 = evaluate_predictions([0.4, 0.3], [1, 0], 0.50)
assert res2["accuracy"] == 0.5, f"Expected 0.5 accuracy, got {res2['accuracy']}"
print("Assertion Passed: Decision boundary evaluation operational!")
`,
      predictQuestion: {
        prompt: "If a model outputs probability 0.72 and the decision threshold is 0.50, what is the classified output?",
        options: [
          "Class 1 (Positive) because 0.72 >= 0.50",
          "Class 0 (Negative) because 0.72 is not 1.00",
          "Undecided",
          "Error: scores must be integers",
        ],
        correctIndex: 0,
        explanation: "Any score greater than or equal to the decision threshold is mapped to the positive class.",
      },
      checkQuestion: {
        prompt: "Why is accuracy sometimes a misleading metric when evaluating imbalanced datasets?",
        options: [
          "A naive model predicting only the majority class can get 99% accuracy while finding zero positive cases.",
          "Accuracy only works for regression problems.",
          "Accuracy cannot be computed with Python floats.",
          "Accuracy is always lower than precision.",
        ],
        correctIndex: 0,
        explanation: "On skewed data (e.g. 99% negative cases), a model that predicts negative 100% of the time gets 99% accuracy but fails its mission.",
      },
    },
  ];
}

/**
 * Generates linear concept edges connecting the roadmap concepts in sequence.
 */
export function generateFallbackEdgesForGoal(concepts: Concept[]): ConceptEdge[] {
  const edges: ConceptEdge[] = [];
  for (let i = 0; i < concepts.length - 1; i++) {
    edges.push({
      from: concepts[i].id,
      to: concepts[i + 1].id,
    });
  }
  return edges;
}
