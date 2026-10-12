import {
  CatalogProject,
  ProjectTier,
  Concept,
  ConceptEdge,
  ProjectModelContract,
} from "../types";
import { SPAM_CLASSIFIER_CONCEPTS, SPAM_CLASSIFIER_EDGES } from "../templates/spamClassifier";
import { REAL_ESTATE_CONCEPTS, REAL_ESTATE_EDGES } from "../templates/realEstate";
import { DIGIT_RECOGNIZER_CONCEPTS, DIGIT_RECOGNIZER_EDGES } from "../templates/digitRecognizer";
import { SENTIMENT_ANALYSIS_CONCEPTS, SENTIMENT_ANALYSIS_EDGES } from "../templates/sentimentAnalysis";
import { CHATGPT_CONCEPTS, CHATGPT_EDGES } from "../templates/chatGpt";
import {
  generateFallbackConceptsForGoal,
  generateFallbackEdgesForGoal,
} from "../diagnostics";
import { deriveModelContractForGoal } from "../inference";

/**
 * 1. Spam Classifier Catalog Project (Tier A)
 */
export const CATALOG_SPAM_CLASSIFIER: CatalogProject = {
  id: "spam-classifier",
  title: "Spam Email & SMS Classifier",
  tier: "A",
  domain: "Natural Language Processing (NLP)",
  spec: {
    task: "classification",
    schema: [
      { name: "message", type: "string", description: "Raw incoming email or SMS message text" },
      { name: "threshold", type: "float", range: [0.1, 0.9], description: "Probability cutoff threshold" },
    ],
    target: "label",
    metric: "f1_score",
    threshold: 0.88,
    tier: "A",
  },
  functions: [
    { name: "tokenize", signature: "tokenize(text: str) -> list[str]", dependsOn: [] },
    { name: "compute_word_frequencies", signature: "compute_word_frequencies(messages: list) -> tuple[dict, dict, int, int]", dependsOn: ["tokenize"] },
    { name: "compute_priors", signature: "compute_priors(messages: list) -> tuple[float, float]", dependsOn: [] },
    { name: "compute_likelihood_with_smoothing", signature: "compute_likelihood_with_smoothing(token: str, word_counts: dict, total_words: int, vocab_size: int) -> float", dependsOn: [] },
    { name: "predict_spam_probability", signature: "predict_spam_probability(text: str, p_spam: float, p_ham: float, spam_counts: dict, ham_counts: dict, total_spam: int, total_ham: int, vocab_size: int) -> float", dependsOn: ["tokenize", "compute_likelihood_with_smoothing"] },
    { name: "classify", signature: "classify(text: str, threshold: float = 0.65) -> dict", dependsOn: ["predict_spam_probability"] },
  ],
  steps: SPAM_CLASSIFIER_CONCEPTS.map((c, i) => ({
    id: `step-${c.id}`,
    conceptId: c.id,
    title: c.title,
    function: c.id,
    blanksCount: 2,
    starterCode: c.starterCode || "",
    solutionCode: c.solutionCode || "",
    goldenValues: [
      {
        inputs: { text: "Urgent! Claim free gift card now" },
        expectedOutput: { label: "spam", isSpam: true },
        tolerance: 0.05,
      },
    ],
    misconceptions: [
      "Naive Bayes assumes words are independent, so it cannot capture semantics.",
      "Zero probabilities can be resolved by ignoring unseen words instead of Laplace smoothing.",
    ],
  })),
  dag: {
    nodes: SPAM_CLASSIFIER_CONCEPTS,
    edges: SPAM_CLASSIFIER_EDGES,
  },
  modelContract: {
    functionName: "classify",
    title: "Live Bayesian Spam Classifier",
    subtitle: "Test how your trained model evaluates token likelihoods on custom text messages.",
    badge: "NLP / Naive Bayes (WASM)",
    defaultThreshold: 0.65,
    features: [
      { id: "text", label: "Email / SMS Text", type: "text", default: "Congratulations! You won a $1000 Walmart giftcard. Call now to claim!" },
    ],
    output: {
      type: "classification",
      label: "Spam Probability",
      positiveClass: "SPAM (Phishing / Scam)",
      negativeClass: "HAM (Legitimate)",
    },
    presets: [
      { name: "Obvious Scam", emoji: "🚨", values: { text: "WINNER! You won $1000 free cash gift. Call now!" } },
      { name: "Normal Work Email", emoji: "💼", values: { text: "Can you review the pull request on GitHub when you have time?" } },
      { name: "Borderline Promo", emoji: "🛍️", values: { text: "Don't miss our summer sale: 20% off all shoes today." } },
    ],
  },
};

/**
 * 2. Real Estate Price Predictor Catalog Project (Tier A)
 */
export const CATALOG_REAL_ESTATE: CatalogProject = {
  id: "real-estate",
  title: "Real Estate Housing Price Predictor",
  tier: "A",
  domain: "Tabular Regression",
  spec: {
    task: "regression",
    schema: [
      { name: "sqft", type: "float", range: [400, 6000], description: "Total interior square footage" },
      { name: "bedrooms", type: "int", range: [1, 6], description: "Number of bedrooms" },
      { name: "bathrooms", type: "float", range: [1, 5], description: "Number of bathrooms" },
      { name: "location_score", type: "float", range: [1, 10], description: "School & neighborhood rating" },
    ],
    target: "price",
    metric: "r2_score",
    threshold: 0.85,
    tier: "A",
  },
  functions: [
    { name: "standardize_features", signature: "standardize_features(X: list) -> list", dependsOn: [] },
    { name: "compute_mean_squared_error", signature: "compute_mean_squared_error(y_true: list, y_pred: list) -> float", dependsOn: [] },
    { name: "gradient_descent_step", signature: "gradient_descent_step(w: float, b: float, X: list, y: list, lr: float) -> tuple[float, float]", dependsOn: [] },
    { name: "predict_price", signature: "predict_price(sqft: float, bedrooms: int, bathrooms: float, location_score: float) -> float", dependsOn: ["standardize_features"] },
  ],
  steps: REAL_ESTATE_CONCEPTS.map((c) => ({
    id: `step-${c.id}`,
    conceptId: c.id,
    title: c.title,
    function: c.id,
    blanksCount: 2,
    starterCode: c.starterCode || "",
    solutionCode: c.solutionCode || "",
    goldenValues: [
      {
        inputs: { sqft: 2000, bedrooms: 3, bathrooms: 2, location_score: 8 },
        expectedOutput: 420000,
        tolerance: 20000,
      },
    ],
    misconceptions: [
      "Features of vastly different scales (e.g. sqft vs bedrooms) converge just as fast without normalization.",
      "A higher learning rate always reaches the minimum loss faster.",
    ],
  })),
  dag: {
    nodes: REAL_ESTATE_CONCEPTS,
    edges: REAL_ESTATE_EDGES,
  },
  modelContract: {
    functionName: "predict_price",
    title: "Housing Valuation Regression Engine",
    subtitle: "Observe how gradient-descent weights scale home valuations across diverse property features.",
    badge: "Tabular Regression (WASM)",
    features: [
      { id: "sqft", label: "Living Area (sqft)", type: "slider", min: 500, max: 4500, step: 50, default: 2100, unit: "sqft" },
      { id: "bedrooms", label: "Bedrooms", type: "slider", min: 1, max: 6, step: 1, default: 3 },
      { id: "bathrooms", label: "Bathrooms", type: "slider", min: 1, max: 4, step: 0.5, default: 2.5 },
      { id: "location_score", label: "School Rating", type: "slider", min: 1, max: 10, step: 1, default: 8, unit: "/10" },
    ],
    output: {
      type: "regression",
      label: "Predicted Market Value",
      unit: "$",
    },
    presets: [
      { name: "Starter Condo", emoji: "🏢", values: { sqft: 850, bedrooms: 1, bathrooms: 1, location_score: 6 } },
      { name: "Suburban Family Home", emoji: "🏡", values: { sqft: 2400, bedrooms: 4, bathrooms: 2.5, location_score: 8 } },
      { name: "Luxury Estate", emoji: "🏰", values: { sqft: 4200, bedrooms: 5, bathrooms: 4, location_score: 10 } },
    ],
  },
};

/**
 * 3. Handwritten Digit Recognizer Catalog Project (Tier A)
 */
export const CATALOG_DIGIT_RECOGNIZER: CatalogProject = {
  id: "digit-recognizer",
  title: "Handwritten Digit Recognizer (MNIST From Scratch)",
  tier: "A",
  domain: "Computer Vision & Neural Networks",
  spec: {
    task: "classification",
    schema: [
      { name: "pixels", type: "string", description: "28x28 normalized pixel brightness array" },
    ],
    target: "digit_class",
    metric: "accuracy",
    threshold: 0.92,
    tier: "A",
  },
  functions: [
    { name: "preprocess_digit_image", signature: "preprocess_digit_image(pixel_grid_2d: list) -> list", dependsOn: [] },
    { name: "compute_linear_score", signature: "compute_linear_score(features: list, weights: list, bias: float) -> float", dependsOn: ["preprocess_digit_image"] },
    { name: "softmax", signature: "softmax(scores: list) -> list", dependsOn: ["compute_linear_score"] },
    { name: "cross_entropy_loss", signature: "cross_entropy_loss(probabilities: list, target_digit: int) -> float", dependsOn: ["softmax"] },
    { name: "update_weights", signature: "update_weights(weights: list, features: list, error: float, lr: float) -> list", dependsOn: ["cross_entropy_loss"] },
    { name: "classify_digit", signature: "classify_digit(features: list, weights_matrix: list, biases: list) -> dict", dependsOn: ["compute_linear_score", "softmax"] },
  ],
  steps: DIGIT_RECOGNIZER_CONCEPTS.map((c) => ({
    id: `step-${c.id}`,
    conceptId: c.id,
    title: c.title,
    function: c.id,
    blanksCount: 3,
    starterCode: c.starterCode || "",
    solutionCode: c.solutionCode || "",
    goldenValues: [
      {
        inputs: { pixel_sum: 45.2 },
        expectedOutput: { predictedDigit: 7, confidence: 0.94 },
        tolerance: 0.05,
      },
    ],
    misconceptions: [
      "Softmax probabilities can be computed simply by dividing each logit by the sum of logits.",
      "A neural network with linear activations in every layer can approximate non-linear curves.",
    ],
  })),
  dag: {
    nodes: DIGIT_RECOGNIZER_CONCEPTS,
    edges: DIGIT_RECOGNIZER_EDGES,
  },
  modelContract: {
    functionName: "classify_digit",
    title: "Neural Digit Classifier (NumPy WASM)",
    subtitle: "Input handwriting stroke metrics to calculate forward pass activations across dense layers.",
    badge: "Computer Vision (NumPy)",
    features: [
      { id: "stroke_density", label: "Center Stroke Density", type: "slider", min: 0.05, max: 0.95, step: 0.05, default: 0.65 },
      { id: "vertical_bias", label: "Vertical Stroke Bias", type: "slider", min: 0.1, max: 1.0, step: 0.05, default: 0.85 },
      { id: "loop_ratio", label: "Enclosed Loop Ratio", type: "slider", min: 0.0, max: 0.9, step: 0.05, default: 0.1 },
    ],
    output: {
      type: "classification",
      label: "Predicted Digit",
      positiveClass: "Digit 1 / 7 (Linear)",
      negativeClass: "Digit 0 / 8 (Looped)",
    },
    presets: [
      { name: "Sharp Vertical Line ('1')", emoji: "1️⃣", values: { stroke_density: 0.35, vertical_bias: 0.95, loop_ratio: 0.0 } },
      { name: "Enclosed Oval ('0')", emoji: "0️⃣", values: { stroke_density: 0.55, vertical_bias: 0.45, loop_ratio: 0.85 } },
      { name: "Double Loop ('8')", emoji: "8️⃣", values: { stroke_density: 0.75, vertical_bias: 0.55, loop_ratio: 0.90 } },
    ],
  },
};

/**
 * 4. Clinical Healthcare Risk Predictor (Tier A)
 */
export const CATALOG_CLINICAL_RISK: CatalogProject = {
  id: "diabetes-risk",
  title: "Clinical Condition & Diabetes Risk Predictor",
  tier: "A",
  domain: "Biomedical & Healthcare ML",
  spec: {
    task: "classification",
    schema: [
      { name: "glucose", type: "float", range: [70, 250], description: "Fasting blood glucose (mg/dL)" },
      { name: "bmi", type: "float", range: [16, 45], description: "Body Mass Index" },
      { name: "blood_pressure", type: "float", range: [80, 190], description: "Systolic blood pressure (mmHg)" },
      { name: "age", type: "int", range: [18, 90], description: "Patient age in years" },
    ],
    target: "risk_outcome",
    metric: "roc_auc",
    threshold: 0.84,
    tier: "A",
  },
  functions: [
    { name: "min_max_scale", signature: "min_max_scale(val: float, min_val: float, max_val: float) -> float", dependsOn: [] },
    { name: "compute_clinical_prior", signature: "compute_clinical_prior(total_patients: int, positive_cases: int) -> float", dependsOn: [] },
    { name: "compute_biomarker_logit", signature: "compute_biomarker_logit(glucose: float, bmi: float, bp: float, age: int) -> float", dependsOn: ["min_max_scale"] },
    { name: "sigmoid", signature: "sigmoid(z: float) -> float", dependsOn: [] },
    { name: "compute_bce_loss", signature: "compute_bce_loss(y_true: float, p_pred: float) -> float", dependsOn: [] },
    { name: "evaluate_clinical_threshold", signature: "evaluate_clinical_threshold(prob: float, threshold: float = 0.35) -> bool", dependsOn: ["sigmoid", "compute_biomarker_logit"] },
  ],
  steps: [
    {
      id: "step-clinical-1",
      conceptId: "clinical-framing",
      title: "Clinical Feature Framing & Normalization",
      function: "min_max_scale",
      blanksCount: 2,
      starterCode: `def min_max_scale(val, min_val, max_val):
    # Scale patient vitals into [0, 1] range to avoid measurement unit bias
    scaled = (val - ___) / (___ - min_val)
    return max(0.0, min(1.0, scaled))`,
      solutionCode: `def min_max_scale(val, min_val, max_val):
    scaled = (val - min_val) / (max_val - min_val)
    return max(0.0, min(1.0, scaled))`,
      goldenValues: [{ inputs: { val: 160, min_val: 70, max_val: 250 }, expectedOutput: 0.5, tolerance: 0.01 }],
      misconceptions: ["Higher raw values like Blood Pressure (140) outweigh Glucose (100) purely because of numerical scale."],
    },
    {
      id: "step-clinical-2",
      conceptId: "clinical-priors",
      title: "Patient Base Rate & Prior Odds",
      function: "compute_clinical_prior",
      blanksCount: 1,
      starterCode: `def compute_clinical_prior(total_patients, positive_cases):
    # Calculate baseline probability of condition in the cohort
    return positive_cases / ___`,
      solutionCode: `def compute_clinical_prior(total_patients, positive_cases):
    return positive_cases / total_patients`,
      goldenValues: [{ inputs: { total_patients: 1000, positive_cases: 120 }, expectedOutput: 0.12, tolerance: 0.001 }],
      misconceptions: ["Assuming 50/50 risk for all conditions regardless of epidemiological prevalence."],
    },
    {
      id: "step-clinical-3",
      conceptId: "clinical-dot-product",
      title: "Biomarker Weight Dot Product & Logit",
      function: "compute_biomarker_logit",
      blanksCount: 2,
      starterCode: `def compute_biomarker_logit(glucose, bmi, bp, age):
    norm_g = min_max_scale(glucose, 70, 250)
    norm_b = min_max_scale(bmi, 16, 45)
    norm_bp = min_max_scale(bp, 80, 190)
    norm_a = min_max_scale(age, 18, 90)
    # Weighted sum minus calibrated bias
    z = (2.8 * norm_g) + (1.6 * norm_b) + (1.0 * norm_bp) + (0.9 * norm_a) - ___
    return round(z, 3)`,
      solutionCode: `def compute_biomarker_logit(glucose, bmi, bp, age):
    norm_g = min_max_scale(glucose, 70, 250)
    norm_b = min_max_scale(bmi, 16, 45)
    norm_bp = min_max_scale(bp, 80, 190)
    norm_a = min_max_scale(age, 18, 90)
    z = (2.8 * norm_g) + (1.6 * norm_b) + (1.0 * norm_bp) + (0.9 * norm_a) - 2.5
    return round(z, 3)`,
      goldenValues: [{ inputs: { glucose: 180, bmi: 34, bp: 140, age: 58 }, expectedOutput: 1.52, tolerance: 0.1 }],
      misconceptions: ["Negative logits mean negative probabilities."],
    },
    {
      id: "step-clinical-4",
      conceptId: "logistic-sigmoid",
      title: "Logistic Sigmoid Activation",
      function: "sigmoid",
      blanksCount: 2,
      starterCode: `import math

def sigmoid(z):
    # Map unbounded log-odds z into a probability between 0.0 and 1.0
    return 1.0 / (1.0 + math.exp(___))`,
      solutionCode: `import math

def sigmoid(z):
    return 1.0 / (1.0 + math.exp(-z))`,
      goldenValues: [{ inputs: { z: 0.0 }, expectedOutput: 0.5, tolerance: 0.001 }],
      misconceptions: ["Sigmoid values above 0.5 guarantee disease presence with 100% certainty."],
    },
    {
      id: "step-clinical-5",
      conceptId: "clinical-loss",
      title: "Cross-Entropy Loss & Calibration",
      function: "compute_bce_loss",
      blanksCount: 2,
      starterCode: `import math

def compute_bce_loss(y_true, p_pred):
    # Binary cross-entropy penalizes overconfident incorrect diagnoses
    eps = 1e-7
    p = max(eps, min(1.0 - eps, p_pred))
    return -(y_true * math.log(p) + (1 - y_true) * math.log(___))`,
      solutionCode: `import math

def compute_bce_loss(y_true, p_pred):
    eps = 1e-7
    p = max(eps, min(1.0 - eps, p_pred))
    return -(y_true * math.log(p) + (1 - y_true) * math.log(1 - p))`,
      goldenValues: [{ inputs: { y_true: 1.0, p_pred: 0.8 }, expectedOutput: 0.223, tolerance: 0.02 }],
      misconceptions: ["Cross-entropy loss can be negative."],
    },
    {
      id: "step-clinical-6",
      conceptId: "clinical-threshold",
      title: "Clinical Decision Threshold & Triage Sensitivity",
      function: "evaluate_clinical_threshold",
      blanksCount: 1,
      starterCode: `def evaluate_clinical_threshold(prob, threshold=0.35):
    # In clinical medicine, threshold is lowered to catch critical cases early
    return prob >= ___`,
      solutionCode: `def evaluate_clinical_threshold(prob, threshold=0.35):
    return prob >= threshold`,
      goldenValues: [{ inputs: { prob: 0.42, threshold: 0.35 }, expectedOutput: true }],
      misconceptions: ["Classification threshold must always be fixed at 0.50 regardless of false-negative clinical severity."],
    },
  ],
  dag: {
    nodes: [
      { id: "clinical-framing", title: "Clinical Framing & Normalization", prereqs: [], difficulty: 1, hook: "Why would a blood pressure reading of 140 naturally crush a glucose reading of 90 in raw math?", buildStep: "Normalize patient vitals into [0, 1]" },
      { id: "clinical-priors", title: "Patient Base Rate & Prior Odds", prereqs: ["clinical-framing"], difficulty: 2, hook: "If only 12% of patients have the condition, why is predicting 'Healthy' every time dangerous?", buildStep: "Calculate cohort prior odds" },
      { id: "clinical-dot-product", title: "Biomarker Weight Dot Product", prereqs: ["clinical-priors"], difficulty: 3, hook: "How does the model combine multiple independent patient biomarkers into one scalar logit?", buildStep: "Calculate weighted logit score" },
      { id: "logistic-sigmoid", title: "Logistic Sigmoid Activation", prereqs: ["clinical-dot-product"], difficulty: 3, hook: "How do you constrain infinite weighted scores into a true [0, 1] probability curve?", buildStep: "Implement numerically stable sigmoid" },
      { id: "clinical-loss", title: "Cross-Entropy Loss & Calibration", prereqs: ["logistic-sigmoid"], difficulty: 4, hook: "How do doctors mathematically punish confident misdiagnoses?", buildStep: "Compute binary cross-entropy loss" },
      { id: "clinical-threshold", title: "Decision Threshold & Sensitivity", prereqs: ["clinical-loss"], difficulty: 4, hook: "Why must medical AI lower decision thresholds to avoid lethal false negatives?", buildStep: "Calibrate triage threshold" },
    ],
    edges: [
      { from: "clinical-framing", to: "clinical-priors" },
      { from: "clinical-priors", to: "clinical-dot-product" },
      { from: "clinical-dot-product", to: "logistic-sigmoid" },
      { from: "logistic-sigmoid", to: "clinical-loss" },
      { from: "clinical-loss", to: "clinical-threshold" },
    ],
  },

  modelContract: {
    functionName: "logistic_risk_score",
    title: "Clinical Diabetes & Health Risk Classifier",
    subtitle: "Examine how fasting glucose, body mass index, and blood pressure shift patient risk curves.",
    badge: "Clinical Risk (NumPy WASM)",
    defaultThreshold: 0.5,
    features: [
      { id: "glucose", label: "Fasting Blood Glucose", type: "slider", min: 70, max: 250, step: 5, default: 140, unit: "mg/dL" },
      { id: "bmi", label: "Body Mass Index (BMI)", type: "slider", min: 16, max: 45, step: 0.5, default: 29.5 },
      { id: "bloodPressure", label: "Systolic Blood Pressure", type: "slider", min: 80, max: 190, step: 5, default: 130, unit: "mmHg" },
      { id: "age", label: "Patient Age", type: "slider", min: 18, max: 90, step: 1, default: 52, unit: "yrs" },
    ],
    output: {
      type: "classification",
      label: "Condition Risk Outcome",
      positiveClass: "ELEVATED RISK (Requires Care)",
      negativeClass: "NORMAL BASELINE (Healthy)",
    },
    presets: [
      { name: "Healthy Routine Checkup", emoji: "🩺", values: { glucose: 85, bmi: 22.0, bloodPressure: 115, age: 28 } },
      { name: "Borderline Metabolic", emoji: "⚠️", values: { glucose: 135, bmi: 28.5, bloodPressure: 135, age: 48 } },
      { name: "Acute Clinical Intervention", emoji: "🚨", values: { glucose: 210, bmi: 36.0, bloodPressure: 165, age: 64 } },
    ],
  },
};

/**
 * 5. Mini ChatGPT Attention Engine (Tier A)
 */
export const CATALOG_CHATGPT: CatalogProject = {
  id: "chatgpt",
  title: "Mini Transformer & Attention Mechanism (From Scratch)",
  tier: "A",
  domain: "Large Language Models & Deep Learning",
  spec: {
    task: "classification",
    schema: [
      { name: "prompt", type: "string", description: "Input sequence prompt to auto-regressively complete" },
      { name: "temperature", type: "float", range: [0.1, 1.5], description: "Sampling randomness temperature" },
    ],
    target: "next_token",
    metric: "perplexity",
    threshold: 12.5,
    tier: "A",
  },
  functions: [
    { name: "tokenize_subwords", signature: "tokenize_subwords(text: str) -> list[int]", dependsOn: [] },
    { name: "scaled_dot_product_attention", signature: "scaled_dot_product_attention(Q: list, K: list, V: list) -> list", dependsOn: [] },
    { name: "softmax_temperature", signature: "softmax_temperature(logits: list, temp: float) -> list", dependsOn: [] },
  ],
  steps: CHATGPT_CONCEPTS.map((c) => ({
    id: `step-${c.id}`,
    conceptId: c.id,
    title: c.title,
    function: c.id,
    blanksCount: 2,
    starterCode: c.starterCode || "",
    solutionCode: c.solutionCode || "",
    goldenValues: [
      {
        inputs: { sequence: [1, 4, 8] },
        expectedOutput: [0.72, 0.18, 0.10],
        tolerance: 0.05,
      },
    ],
    misconceptions: [
      "Attention computes how similar words are grammatically, not contextual relevance.",
      "Higher temperature makes the model more accurate.",
    ],
  })),
  dag: {
    nodes: CHATGPT_CONCEPTS,
    edges: CHATGPT_EDGES,
  },
  modelContract: {
    functionName: "sample_next_token",
    title: "Self-Attention Token Generator",
    subtitle: "Observe self-attention dot products and temperature-scaled Softmax sampling live in WebAssembly.",
    badge: "Transformers / Self-Attention",
    features: [
      { id: "context", label: "Input Token Prompt", type: "text", default: "The future of artificial intelligence is" },
      { id: "temperature", label: "Sampling Temperature", type: "slider", min: 0.1, max: 1.5, step: 0.1, default: 0.7 },
    ],
    output: {
      type: "classification",
      label: "Next Token Candidate",
      positiveClass: "High Likelihood Token",
      negativeClass: "Low Likelihood Token",
    },
    presets: [
      { name: "Deterministic (Temp 0.2)", emoji: "🎯", values: { context: "Machine learning algorithms learn", temperature: 0.2 } },
      { name: "Creative Exploration (Temp 1.2)", emoji: "🎨", values: { context: "In a distant galaxy surrounded by", temperature: 1.2 } },
    ],
  },
};

/**
 * 6. Tier C Showcase: Fine-Tuning BERT for Custom Classification (Export Only)
 */
export const CATALOG_BERT_TIER_C: CatalogProject = {
  id: "bert-finetuning",
  title: "Fine-Tuning BERT for Multi-Class Sequence Classification",
  tier: "C",
  domain: "Pretrained Foundation Models (Deep Learning)",
  spec: {
    task: "classification",
    schema: [{ name: "text", type: "string" }],
    target: "class_id",
    metric: "eval_accuracy",
    threshold: 0.94,
    tier: "C",
  },
  functions: [
    { name: "load_pretrained_bert", signature: "load_pretrained_bert()", dependsOn: [] },
    { name: "train_linear_head", signature: "train_linear_head()", dependsOn: [] },
  ],
  steps: [
    {
      id: "step-bert-1",
      conceptId: "bert-export-notice",
      title: "Tier C: Export-Only Model Architecture",
      function: "bert_pipeline",
      blanksCount: 0,
      starterCode: `# Tier C Project Notice:\n# Training 110M+ parameter Transformer encoders exceeds browser WebAssembly RAM.\n# Click 'Export Jupyter Notebook' to run full GPU fine-tuning on Google Colab.`,
      solutionCode: `# Complete PyTorch Hugging Face Transformers pipeline provided in exported notebook.`,
      goldenValues: [],
      misconceptions: ["100M+ parameter neural networks can be trained at 60 FPS in browser JavaScript without a GPU."],
    },
  ],
  dag: {
    nodes: [
      {
        id: "bert-export-notice",
        title: "Foundation Model Pipeline (Tier C)",
        prereqs: [],
        difficulty: 4,
        hook: "Why can't you train a 110M parameter Transformer in your browser?",
        buildStep: "Inspect Hugging Face fine-tuning script",
      },
    ],
    edges: [],
  },
  modelContract: {
    functionName: "classify_with_bert",
    title: "BERT Sequence Classifier (Tier C Export)",
    subtitle: "Large pretrained foundation model fine-tuning with Hugging Face and PyTorch (Export for Google Colab GPU).",
    badge: "Tier C · Colab Export",
    features: [{ id: "text", label: "Sample Text", type: "text", default: "Financial quarterly results exceeded analyst forecasts." }],
    output: { type: "classification", label: "Sentiment Class" },
  },
};

/**
 * Helper to construct rich 6-8 step CatalogProjects using verified fallback generators
 */
function buildCatalogProject(
  id: string,
  title: string,
  domain: string,
  goal: string,
  tier: ProjectTier = "A"
): CatalogProject {
  const concepts = generateFallbackConceptsForGoal(goal);
  const edges = generateFallbackEdgesForGoal(concepts);
  const contract = deriveModelContractForGoal(goal);

  return {
    id,
    title,
    tier,
    domain,
    spec: {
      task: "classification",
      schema: contract.features.map((f) => ({
        name: f.id,
        type: f.type === "slider" ? "float" : "string",
        description: f.label,
        range: f.min !== undefined && f.max !== undefined ? [f.min, f.max] : undefined,
      })),
      target: "prediction",
      metric: "f1_score",
      threshold: contract.defaultThreshold ?? 0.85,
      tier,
    },
    functions: concepts.map((c) => ({
      name: c.id.replace(/-/g, "_"),
      signature: `${c.id.replace(/-/g, "_")}()`,
      dependsOn: c.prereqs.map((p) => p.replace(/-/g, "_")),
    })),
    steps: concepts.map((c) => ({
      id: `step-${c.id}`,
      conceptId: c.id,
      title: c.title,
      function: c.id.replace(/-/g, "_"),
      blanksCount: 2,
      starterCode: c.starterCode || "",
      solutionCode: c.solutionCode || "",
      goldenValues: c.goldenTest ? [c.goldenTest] : [],
      misconceptions: [
        "Models memorize training records instead of learning generalizable patterns across features.",
      ],
    })),
    dag: {
      nodes: concepts,
      edges,
    },
    modelContract: contract,
  };
}

/**
 * 7. Sentiment Analysis Catalog Project (Tier A - 6 nodes)
 */
export const CATALOG_SENTIMENT_ANALYSIS: CatalogProject = {
  id: "sentiment-analysis",
  title: "Movie & Review Sentiment Analyzer",
  tier: "A",
  domain: "Natural Language Processing (NLP)",
  spec: {
    task: "classification",
    schema: [
      { name: "text", type: "string", description: "Review or opinion text" },
      { name: "threshold", type: "float", range: [0.1, 0.9], description: "Sentiment cutoff threshold" },
    ],
    target: "sentiment",
    metric: "f1_score",
    threshold: 0.85,
    tier: "A",
  },
  functions: [
    { name: "clean_and_tokenize", signature: "clean_and_tokenize(text: str) -> list[str]", dependsOn: [] },
    { name: "compute_sentiment_score", signature: "compute_sentiment_score(tokens: list, weights: dict, bias: float) -> float", dependsOn: ["clean_and_tokenize"] },
    { name: "sigmoid", signature: "sigmoid(z: float) -> float", dependsOn: [] },
    { name: "classify_sentiment", signature: "classify_sentiment(text: str, weights: dict, bias: float, threshold: float = 0.5) -> dict", dependsOn: ["clean_and_tokenize", "compute_sentiment_score", "sigmoid"] },
  ],
  steps: SENTIMENT_ANALYSIS_CONCEPTS.map((c) => ({
    id: `step-${c.id}`,
    conceptId: c.id,
    title: c.title,
    function: c.id.replace(/-/g, "_"),
    blanksCount: 2,
    starterCode: c.starterCode || "",
    solutionCode: c.solutionCode || "",
    goldenValues: c.goldenTest ? [c.goldenTest] : [],
    misconceptions: [
      "Sentiment is determined solely by word count rather than learned positive/negative semantic polarity weights.",
    ],
  })),
  dag: {
    nodes: SENTIMENT_ANALYSIS_CONCEPTS,
    edges: SENTIMENT_ANALYSIS_EDGES,
  },
  modelContract: {
    functionName: "classify_sentiment",
    title: "Live Sentiment Classifier",
    subtitle: "Evaluate text reviews with calibrated lexicon polarity weights.",
    badge: "NLP / Sentiment (WASM)",
    defaultThreshold: 0.5,
    features: [
      { id: "text", label: "Review Text", type: "text", default: "This movie was absolutely brilliant, heartfelt and inspiring!" },
    ],
    output: {
      type: "classification",
      label: "Positive Sentiment Probability",
      positiveClass: "POSITIVE",
      negativeClass: "NEGATIVE",
    },
    presets: [
      { name: "Glowing Praise", emoji: "🌟", values: { text: "Outstanding performance and beautiful cinematography!" } },
      { name: "Critical Review", emoji: "👎", values: { text: "Boring plot, terrible pacing, and disappointing ending." } },
      { name: "Mixed Review", emoji: "⚖️", values: { text: "Decent acting but the script had serious flaws." } },
    ],
  },
};

/**
 * 8. Plant Pathology & Agricultural Vision Catalog Project (8 nodes)
 */
export const CATALOG_PLANT_DISEASE = buildCatalogProject(
  "plant-disease",
  "Plant Pathology & Crop Leaf Disease Detector",
  "Agricultural Computer Vision",
  "AI based plant disease detector"
);

/**
 * 9. Facial Landmark Emotion Analyzer (8 nodes)
 */
export const CATALOG_FACIAL_EMOTION = buildCatalogProject(
  "facial-emotion",
  "Facial Landmark Emotion & Expression Classifier",
  "Computer Vision & Biometrics",
  "facial emotion detector"
);

/**
 * 10. Recommender System (8 nodes)
 */
export const CATALOG_RECOMMENDER = buildCatalogProject(
  "recommender-system",
  "Movie & Content Recommender System",
  "Collaborative Filtering & Embeddings",
  "Movie Recommender System"
);

/**
 * 11. Autonomous Vehicle Object Detection (8 nodes)
 */
export const CATALOG_OBJECT_DETECTION = buildCatalogProject(
  "object-detection",
  "Autonomous Vehicle Obstacle Detection & Localization",
  "Computer Vision & Deep Learning",
  "Autonomous Car Obstacle Detection"
);

/**
 * 12. Cybersecurity Network Threat & Anomaly Detector (8 nodes)
 */
export const CATALOG_CYBERSECURITY = buildCatalogProject(
  "cybersecurity-intrusion",
  "Cybersecurity Network Intrusion & Threat Detector",
  "Security Analytics & Anomaly Detection",
  "Cybersecurity Threat and Intrusion Detection"
);

/**
 * 13. Customer Churn & Retention Predictor (8 nodes)
 */
export const CATALOG_CUSTOMER_CHURN = buildCatalogProject(
  "customer-churn",
  "Customer Churn & Retention Predictor",
  "Business & Tabular Analytics",
  "Customer Churn Predictor"
);

/**
 * 14. Voice Command & Audio Classifier (8 nodes)
 */
export const CATALOG_AUDIO_SPEECH = buildCatalogProject(
  "audio-speech",
  "Voice Command & Audio Speech Classifier",
  "Acoustic Signal Processing",
  "Voice Command Audio Classifier"
);

/**
 * 15. Fake News & Misinformation Detector (8 nodes)
 */
export const CATALOG_FAKE_NEWS = buildCatalogProject(
  "fake-news",
  "Fake News & Misinformation Detector",
  "NLP & Fact Verification",
  "Fake News & Misinformation Detector"
);

/**
 * 16. Financial Fraud & Transaction Risk Detector (8 nodes)
 */
export const CATALOG_FRAUD_DETECTION = buildCatalogProject(
  "fraud-detection",
  "Financial Transaction & Credit Card Fraud Detector",
  "FinTech & Anomaly Detection",
  "Credit Card Fraud Detector"
);

/**
 * Complete Master Catalog Array
 */
export const ALL_CATALOG_PROJECTS: CatalogProject[] = [
  CATALOG_SPAM_CLASSIFIER,
  CATALOG_REAL_ESTATE,
  CATALOG_DIGIT_RECOGNIZER,
  CATALOG_CLINICAL_RISK,
  CATALOG_SENTIMENT_ANALYSIS,
  CATALOG_PLANT_DISEASE,
  CATALOG_FACIAL_EMOTION,
  CATALOG_RECOMMENDER,
  CATALOG_OBJECT_DETECTION,
  CATALOG_CYBERSECURITY,
  CATALOG_CUSTOMER_CHURN,
  CATALOG_AUDIO_SPEECH,
  CATALOG_FAKE_NEWS,
  CATALOG_FRAUD_DETECTION,
  CATALOG_CHATGPT,
  CATALOG_BERT_TIER_C,
];

/**
 * Resolves nearest catalog project for any user input goal in < 10ms.
 * Never degrades unknown projects into Spam Classifier.
 */
export function findNearestCatalogProject(goal: string): CatalogProject {
  const lower = (goal || "").toLowerCase();

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

  if (isPlantOrAgri) {
    return CATALOG_PLANT_DISEASE;
  }
  if (lower.includes("spam") || lower.includes("phish") || lower.includes("sms")) {
    return CATALOG_SPAM_CLASSIFIER;
  }
  if (lower.includes("sentiment") || lower.includes("review") || lower.includes("polarity")) {
    return CATALOG_SENTIMENT_ANALYSIS;
  }
  if (
    lower.includes("emotion") ||
    lower.includes("facial") ||
    lower.includes("expression") ||
    lower.includes("smile") ||
    (lower.includes("face") && !lower.includes("surface"))
  ) {
    return CATALOG_FACIAL_EMOTION;
  }
  if (lower.includes("recommend") || lower.includes("netflix") || lower.includes("collaborative")) {
    return CATALOG_RECOMMENDER;
  }
  if (
    lower.includes("object detect") ||
    lower.includes("yolo") ||
    lower.includes("bounding box") ||
    lower.includes("autonomous") ||
    lower.includes("obstacle") ||
    lower.includes("self-driving") ||
    lower.includes("pedestrian")
  ) {
    return CATALOG_OBJECT_DETECTION;
  }
  if (
    lower.includes("cyber") ||
    lower.includes("intrusion") ||
    lower.includes("ddos") ||
    lower.includes("packet") ||
    lower.includes("malware") ||
    lower.includes("firewall")
  ) {
    return CATALOG_CYBERSECURITY;
  }
  if (lower.includes("churn") || lower.includes("subscriber") || lower.includes("retention") || lower.includes("attrition")) {
    return CATALOG_CUSTOMER_CHURN;
  }
  if (lower.includes("audio") || lower.includes("speech") || lower.includes("voice") || lower.includes("sound") || lower.includes("acoustic")) {
    return CATALOG_AUDIO_SPEECH;
  }
  if (lower.includes("fake news") || lower.includes("misinformation") || lower.includes("fact check") || lower.includes("clickbait")) {
    return CATALOG_FAKE_NEWS;
  }
  if (lower.includes("fraud") || lower.includes("credit card") || lower.includes("transaction") || lower.includes("bank") || lower.includes("loan")) {
    return CATALOG_FRAUD_DETECTION;
  }
  if (lower.includes("house") || lower.includes("price") || lower.includes("estate") || lower.includes("home") || lower.includes("rent")) {
    return CATALOG_REAL_ESTATE;
  }
  if (lower.includes("digit") || lower.includes("mnist") || lower.includes("handwriting")) {
    return CATALOG_DIGIT_RECOGNIZER;
  }
  if (
    !isPlantOrAgri &&
    (lower.includes("diabetes") ||
      lower.includes("clinical") ||
      lower.includes("medical") ||
      lower.includes("cancer") ||
      lower.includes("tumor") ||
      lower.includes("biopsy") ||
      lower.includes("patient") ||
      lower.includes("vitals") ||
      lower.includes("health") ||
      lower.includes("heart"))
  ) {
    return CATALOG_CLINICAL_RISK;
  }
  if (lower.includes("chatgpt") || lower.includes("gpt") || lower.includes("transformer") || lower.includes("attention") || lower.includes("llm")) {
    return CATALOG_CHATGPT;
  }
  if (lower.includes("bert") || lower.includes("diffusion") || lower.includes("fine-tun") || lower.includes("large model")) {
    return CATALOG_BERT_TIER_C;
  }

  // Dynamic Synthesis for ANY Arbitrary Custom Goal:
  // Builds a full 6-8 node CatalogProject tailored directly to the learner's goal
  const safeGoal = goal?.trim() || "Custom AI Machine Learning Model";
  return buildCatalogProject(
    `custom-${safeGoal.toLowerCase().replace(/[^a-z0-9]+/g, "-").slice(0, 30)}`,
    safeGoal,
    "Supervised Machine Learning",
    safeGoal
  );
}

