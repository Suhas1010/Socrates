import { SPAM_DATASET } from "./templates/spamClassifier";
import { Concept, ProjectModelContract, ModelFeatureSpec, ModelOutputSpec } from "./types";

export interface TokenContribution {
  token: string;
  spamLikelihood: number;
  hamLikelihood: number;
  impact: "spam" | "ham" | "neutral";
  score: number;
}

export interface LivePredictionResult {
  text: string;
  prediction: "spam" | "ham";
  spamConfidence: number;
  hamConfidence: number;
  tokens: string[];
  contributions: TokenContribution[];
  threshold: number;
  isSpamOverThreshold: boolean;
  explanation: string;
}

/**
 * High-performance client-side Bayesian inference engine
 * trained on the bundled dataset for instant live testing
 */
export function classifyLiveMessage(
  text: string,
  threshold: number = 0.65
): LivePredictionResult {
  // 1. Tokenize
  const clean = text.toLowerCase();
  const tokens = clean.match(/\b[a-z0-9]+\b/g) || [];

  // 2. Compute priors from dataset
  const totalMessages = SPAM_DATASET.length;
  const spamCount = SPAM_DATASET.filter((d) => d.label === "spam").length;
  const hamCount = totalMessages - spamCount;
  const pSpam = spamCount / totalMessages;
  const pHam = hamCount / totalMessages;

  // 3. Count frequencies
  const spamFreq: Record<string, number> = {};
  const hamFreq: Record<string, number> = {};
  let totalSpamWords = 0;
  let totalHamWords = 0;
  const vocab = new Set<string>();

  for (const item of SPAM_DATASET) {
    const itemTokens = item.text.toLowerCase().match(/\b[a-z0-9]+\b/g) || [];
    for (const t of itemTokens) {
      vocab.add(t);
      if (item.label === "spam") {
        spamFreq[t] = (spamFreq[t] || 0) + 1;
        totalSpamWords++;
      } else {
        hamFreq[t] = (hamFreq[t] || 0) + 1;
        totalHamWords++;
      }
    }
  }

  const vocabSize = Math.max(vocab.size, 1);

  // 4. Calculate log likelihoods with Laplace smoothing
  let logSpam = Math.log(pSpam);
  let logHam = Math.log(pHam);

  const contributions: TokenContribution[] = [];

  for (const t of tokens) {
    const sCount = spamFreq[t] || 0;
    const hCount = hamFreq[t] || 0;

    const pWS = (sCount + 1) / (totalSpamWords + vocabSize);
    const pWH = (hCount + 1) / (totalHamWords + vocabSize);

    logSpam += Math.log(pWS);
    logHam += Math.log(pWH);

    const diff = Math.log(pWS) - Math.log(pWH);
    let impact: "spam" | "ham" | "neutral" = "neutral";
    if (diff > 0.4) impact = "spam";
    else if (diff < -0.4) impact = "ham";

    contributions.push({
      token: t,
      spamLikelihood: pWS,
      hamLikelihood: pWH,
      impact,
      score: Math.round(diff * 100) / 100,
    });
  }

  // Softmax normalization
  const maxLog = Math.max(logSpam, logHam);
  const expSpam = Math.exp(logSpam - maxLog);
  const expHam = Math.exp(logHam - maxLog);
  const spamConfidence = expSpam / (expSpam + expHam);
  const hamConfidence = expHam / (expSpam + expHam);

  const isSpamOverThreshold = spamConfidence >= threshold;
  const prediction = isSpamOverThreshold ? "spam" : "ham";

  const topSpamTokens = contributions
    .filter((c) => c.impact === "spam")
    .map((c) => `"${c.token}" (+${c.score})`)
    .slice(0, 3);

  const topHamTokens = contributions
    .filter((c) => c.impact === "ham")
    .map((c) => `"${c.token}" (${c.score})`)
    .slice(0, 3);

  let explanation = "";
  if (prediction === "spam") {
    explanation = `Flagged as SPAM with ${(spamConfidence * 100).toFixed(1)}% certainty (exceeds ${threshold * 100}% threshold). Strongest triggers: ${topSpamTokens.join(", ") || "suspicious phrase distribution"}.`;
  } else {
    explanation = `Delivered to INBOX as legitimate (HAM). Spam probability is only ${(spamConfidence * 100).toFixed(1)}%. Natural language markers: ${topHamTokens.join(", ") || "standard conversational text"}.`;
  }

  return {
    text,
    prediction,
    spamConfidence,
    hamConfidence,
    tokens,
    contributions,
    threshold,
    isSpamOverThreshold,
    explanation,
  };
}

export interface DiabetesPatient {
  glucose: number;
  age: number;
  bmi: number;
  bloodPressure: number;
}

export interface ClinicalPredictionResult {
  patient: DiabetesPatient;
  riskProbability: number;
  isPositive: boolean;
  diagnosis: string;
  category: "HIGH_RISK" | "MODERATE_RISK" | "LOW_RISK";
  threshold: number;
  factors: { name: string; impact: string; severity: "high" | "moderate" | "normal" }[];
  recommendation: string;
}

/**
 * Interactive Clinical Inference Engine for Diabetes and Medical Models
 * Runs min-max normalization, logistic risk logit, and sigmoid probability
 */
export function predictClinicalDiabetes(
  patient: DiabetesPatient,
  threshold: number = 0.40
): ClinicalPredictionResult {
  // 1. Min-Max Normalization (as taught in the curriculum)
  const normGlucose = Math.max(0, Math.min(1.5, (patient.glucose - 70) / (200 - 70)));
  const normBmi = Math.max(0, Math.min(1.5, (patient.bmi - 18.5) / (35.0 - 18.5)));
  const normAge = Math.max(0, Math.min(1.5, (patient.age - 20) / (80 - 20)));
  const normBp = Math.max(0, Math.min(1.5, (patient.bloodPressure - 80) / (160 - 80)));

  // 2. Logistic Logit score: z = sum(w * x) + bias
  const logit = (2.20 * normGlucose) + (1.30 * normBmi) + (0.90 * normAge) + (0.50 * normBp) - 1.80;

  // 3. Sigmoid Activation: P = 1 / (1 + exp(-z))
  const riskProbability = Math.round((1.0 / (1.0 + Math.exp(-logit))) * 1000) / 1000;

  const isPositive = riskProbability >= threshold;
  const diagnosis = isPositive ? "HIGH RISK / POSITIVE" : "LOW RISK / NEGATIVE";
  const category = riskProbability >= 0.70 ? "HIGH_RISK" : riskProbability >= 0.35 ? "MODERATE_RISK" : "LOW_RISK";

  const factors: { name: string; impact: string; severity: "high" | "moderate" | "normal" }[] = [];
  if (patient.glucose >= 126) {
    factors.push({ name: "Fasting Blood Glucose", impact: `Elevated (${patient.glucose} mg/dL, >=126 criteria)`, severity: "high" });
  } else if (patient.glucose >= 100) {
    factors.push({ name: "Fasting Blood Glucose", impact: `Impaired Fasting Glucose (${patient.glucose} mg/dL, pre-diabetic)`, severity: "moderate" });
  } else {
    factors.push({ name: "Fasting Blood Glucose", impact: `Normal fasting range (${patient.glucose} mg/dL)`, severity: "normal" });
  }

  if (patient.bmi >= 30) {
    factors.push({ name: "Body Mass Index", impact: `Obese classification (${patient.bmi} kg/m² >= 30)`, severity: "high" });
  } else if (patient.bmi >= 25) {
    factors.push({ name: "Body Mass Index", impact: `Overweight classification (${patient.bmi} kg/m²)`, severity: "moderate" });
  } else {
    factors.push({ name: "Body Mass Index", impact: `Normal weight (${patient.bmi} kg/m²)`, severity: "normal" });
  }

  if (patient.age >= 45) {
    factors.push({ name: "Age Risk", impact: `Age ${patient.age} (elevated metabolic resistance factor)`, severity: "moderate" });
  }

  if (patient.bloodPressure >= 130) {
    factors.push({ name: "Blood Pressure", impact: `Hypertension indicator (${patient.bloodPressure} mmHg)`, severity: "moderate" });
  }

  let recommendation = "";
  if (category === "HIGH_RISK") {
    recommendation = "Recommend urgent secondary laboratory confirmation (Fasting Plasma Glucose & HbA1c test). Schedule clinical consultation.";
  } else if (category === "MODERATE_RISK") {
    recommendation = "Borderline metabolic indicators. Recommend lifestyle intervention and repeat screening within 6 months.";
  } else {
    recommendation = "Clinical vitals are within target healthy parameters. Continue routine annual preventative screening.";
  }

  return {
    patient,
    riskProbability,
    isPositive,
    diagnosis,
    category,
    threshold,
    factors,
    recommendation,
  };
}

export function predictHomeValue(
  sqft: number,
  bedrooms: number,
  locationMultiplier: number = 1.0
) {
  const scaledSqft = sqft / 1000.0;
  const price = (150000 * scaledSqft) + (20000 * bedrooms) + 30000;
  const finalPrice = Math.round(price * locationMultiplier);
  return {
    sqft,
    bedrooms,
    estimatedPrice: finalPrice,
    pricePerSqft: Math.round(finalPrice / sqft),
  };
}

export interface FacialEmotionFeatures {
  smile: number;        // -1.0 (frown) to +1.0 (broad smile)
  browFurrow: number;   // 0.0 (relaxed) to 1.0 (furrowed)
  eyeOpenness: number;  // 0.0 (narrow/squint) to 1.0 (wide)
  jawDrop: number;      // 0.0 (closed) to 1.0 (wide open)
}

export interface EmotionProbability {
  emotion: string;
  emoji: string;
  probability: number;
}

export interface EmotionPredictionResult {
  features: FacialEmotionFeatures;
  dominantEmotion: string;
  emoji: string;
  confidence: number;
  probabilities: EmotionProbability[];
  threshold: number;
  isConfident: boolean;
  actionUnits: {
    unit: string;
    activation: string;
    interpretation: string;
  }[];
}

/**
 * Computer Vision & Facial Action Unit Emotion Classifier
 * Linear feature weight logit scoring + multi-class Softmax probability distribution
 */
export function predictFacialEmotion(
  features: FacialEmotionFeatures,
  threshold: number = 0.40
): EmotionPredictionResult {
  const { smile, browFurrow, eyeOpenness, jawDrop } = features;

  // Linear logit scoring for 5 universal facial emotions
  const logits: Record<string, number> = {
    "Joy / Happy": 4.0 * smile - 2.5 * browFurrow - 0.5 * jawDrop + 0.2,
    "Surprise": 3.0 * eyeOpenness + 2.8 * jawDrop - 1.8 * browFurrow - 1.2,
    "Anger": 4.2 * browFurrow - 3.0 * smile - 1.2 * jawDrop + 0.1,
    "Sadness": -3.8 * smile + 2.2 * browFurrow - 1.5 * eyeOpenness - 0.2,
    "Neutral": 1.6 - 2.5 * Math.abs(smile) - 2.5 * browFurrow - 2.5 * Math.abs(eyeOpenness - 0.5) - 2.0 * jawDrop,
  };

  const emojiMap: Record<string, string> = {
    "Joy / Happy": "😄",
    "Surprise": "😲",
    "Anger": "😠",
    "Sadness": "😢",
    "Neutral": "😐",
  };

  // Compute Softmax probabilities: p_i = exp(z_i) / sum(exp(z_j))
  const maxLogit = Math.max(...Object.values(logits));
  const exps = Object.fromEntries(
    Object.entries(logits).map(([k, v]) => [k, Math.exp(v - maxLogit)])
  );
  const sumExps = Object.values(exps).reduce((a, b) => a + b, 0);

  const probabilities: EmotionProbability[] = Object.entries(exps).map(([emotion, expVal]) => ({
    emotion,
    emoji: emojiMap[emotion] || "🙂",
    probability: Math.round((expVal / sumExps) * 1000) / 1000,
  }));

  // Sort descending by probability
  probabilities.sort((a, b) => b.probability - a.probability);

  const dominant = probabilities[0];
  const confidence = Math.round(dominant.probability * 1000) / 10;
  const isConfident = dominant.probability >= threshold;

  const actionUnits = [
    {
      unit: "AU12 (Zygomaticus Major - Smile)",
      activation: `${smile > 0 ? "+" : ""}${smile.toFixed(2)}`,
      interpretation: smile > 0.4 ? "Strong lip corner pull (smile)" : smile < -0.3 ? "Lip corner depressor (frown)" : "Neutral lip posture",
    },
    {
      unit: "AU4 (Corrugator Supercilii - Brow Furrow)",
      activation: `${(browFurrow * 100).toFixed(0)}%`,
      interpretation: browFurrow > 0.5 ? "Deep brow lowerer / furrow" : "Relaxed forehead",
    },
    {
      unit: "AU5 (Upper Lid Raiser - Eye Aperture)",
      activation: `${(eyeOpenness * 100).toFixed(0)}%`,
      interpretation: eyeOpenness > 0.75 ? "Widened eyes (surprise/fear)" : eyeOpenness < 0.35 ? "Constricted/narrowed gaze" : "Normal aperture",
    },
    {
      unit: "AU26/27 (Jaw Drop / Mouth Openness)",
      activation: `${(jawDrop * 100).toFixed(0)}%`,
      interpretation: jawDrop > 0.6 ? "Open mouth / dropped mandible" : "Mouth closed",
    },
  ];

  return {
    features,
    dominantEmotion: dominant.emotion,
    emoji: dominant.emoji,
    confidence,
    probabilities,
    threshold,
    isConfident,
    actionUnits,
  };
}

/**
 * Dynamically derives a rich, domain-grounded ProjectModelContract for ANY project goal.
 * If the project has custom features defined in concepts, it parses them automatically.
 */
export function deriveModelContractForGoal(
  goal: string,
  concepts?: any[]
): ProjectModelContract {
  const lower = (goal || "").toLowerCase();
  const safeGoal = goal?.trim() || "Your Machine Learning Model";

  // 1. Vision & Facial Emotion / Expression Analyzer
  if (
    lower.includes("emotion") ||
    lower.includes("face") ||
    lower.includes("facial") ||
    lower.includes("expression") ||
    lower.includes("smile") ||
    lower.includes("mood")
  ) {
    return {
      functionName: "predict_face_emotion",
      title: "Live Facial Emotion Analyzer",
      subtitle:
        "Test your vision classifier on extracted facial action units (smile curvature, brow tension, eye aperture, jaw position) in real time.",
      badge: "Vision Classifier",
      defaultThreshold: 0.40,
      features: [
        {
          id: "smile",
          label: "Smile Curvature (AU12)",
          type: "slider",
          min: -1.0,
          max: 1.0,
          step: 0.05,
          default: 0.85,
          unit: "",
          description: "Zygomaticus major lip-corner pull (-1.0 frown to +1.0 smile)",
        },
        {
          id: "browFurrow",
          label: "Brow Furrow (AU4)",
          type: "slider",
          min: 0.0,
          max: 1.0,
          step: 0.05,
          default: 0.10,
          unit: "%",
          description: "Corrugator supercilii eyebrow furrow tension",
        },
        {
          id: "eyeOpenness",
          label: "Eye Aperture (AU5)",
          type: "slider",
          min: 0.1,
          max: 1.0,
          step: 0.05,
          default: 0.65,
          unit: "%",
          description: "Upper lid raiser eye openness",
        },
        {
          id: "jawDrop",
          label: "Jaw Drop (AU26)",
          type: "slider",
          min: 0.0,
          max: 1.0,
          step: 0.05,
          default: 0.20,
          unit: "%",
          description: "Mandible depression / mouth opening",
        },
      ],
      output: {
        type: "classification",
        label: "Dominant Emotion",
        classes: [
          { name: "Joy / Happy", emoji: "😄", color: "#F59E0B" },
          { name: "Surprise", emoji: "😲", color: "#06B6D4" },
          { name: "Anger", emoji: "😠", color: "#EF4444" },
          { name: "Sadness", emoji: "😢", color: "#3B82F6" },
          { name: "Neutral", emoji: "😐", color: "#9CA3AF" },
        ],
      },
      presets: [
        {
          name: "Joy / Happy",
          emoji: "😄",
          description: "Broad smile, relaxed brows",
          values: { smile: 0.90, browFurrow: 0.05, eyeOpenness: 0.65, jawDrop: 0.20 },
        },
        {
          name: "Surprise",
          emoji: "😲",
          description: "Wide eyes, dropped jaw",
          values: { smile: 0.05, browFurrow: 0.10, eyeOpenness: 0.95, jawDrop: 0.85 },
        },
        {
          name: "Anger",
          emoji: "😠",
          description: "Furrowed brows, pressed lips",
          values: { smile: -0.60, browFurrow: 0.90, eyeOpenness: 0.40, jawDrop: 0.10 },
        },
        {
          name: "Sadness",
          emoji: "😢",
          description: "Lip corners down, drooping eyelids",
          values: { smile: -0.80, browFurrow: 0.60, eyeOpenness: 0.35, jawDrop: 0.25 },
        },
        {
          name: "Neutral",
          emoji: "😐",
          description: "Baseline resting facial posture",
          values: { smile: 0.00, browFurrow: 0.05, eyeOpenness: 0.50, jawDrop: 0.05 },
        },
      ],
    };
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

  // 1.5 Agricultural Vision / Plant Disease Detector
  if (isPlantOrAgri) {
    return {
      functionName: "predict_plant_disease",
      title: "Live Plant & Crop Disease Classifier",
      subtitle:
        "Test your botanical vision classifier on leaf visual features (lesion coverage %, chlorosis discoloration, spot irregularity, moisture) in real time.",
      badge: "Agricultural Vision Model",
      defaultThreshold: 0.35,
      features: [
        {
          id: "lesionArea",
          label: "Lesion Surface Area",
          type: "slider",
          min: 0,
          max: 100,
          step: 1,
          default: 42,
          unit: "%",
          description: "Percentage of leaf blade covered by necrotic lesions or blight spots",
        },
        {
          id: "chlorophyllLoss",
          label: "Chlorophyll Discoloration",
          type: "slider",
          min: 0.0,
          max: 1.0,
          step: 0.05,
          default: 0.65,
          unit: "",
          description: "Loss of healthy green pigmentation / yellow chlorosis halo (0.0 healthy to 1.0 severe)",
        },
        {
          id: "spotIrregularity",
          label: "Spot Edge Irregularity",
          type: "slider",
          min: 0.0,
          max: 1.0,
          step: 0.05,
          default: 0.40,
          unit: "",
          description: "Geometric irregularity of spot perimeter (characteristic of fungal/bacterial blights)",
        },
        {
          id: "canopyMoisture",
          label: "Leaf Surface Moisture",
          type: "slider",
          min: 10,
          max: 100,
          step: 5,
          default: 40,
          unit: "%",
          description: "Relative canopy humidity favoring fungal spore germination",
        },
      ],
      output: {
        type: "classification",
        label: "Pathogen Diagnosis",
        classes: [
          { name: "Healthy Foliage", emoji: "🌿", color: "#10B981" },
          { name: "Powdery Mildew", emoji: "🍄", color: "#F59E0B" },
          { name: "Bacterial Leaf Blight", emoji: "🍂", color: "#EF4444" },
          { name: "Leaf Rust Fungus", emoji: "🍁", color: "#EC4899" },
        ],
      },
      presets: [
        {
          name: "Healthy Foliage",
          emoji: "🌿",
          description: "Clean green blade, zero necrotic spots",
          values: { lesionArea: 0, chlorophyllLoss: 0.04, spotIrregularity: 0.02, canopyMoisture: 55 },
        },
        {
          name: "Powdery Mildew",
          emoji: "🍄",
          description: "Moderate lesions, chalky discoloration",
          values: { lesionArea: 38, chlorophyllLoss: 0.65, spotIrregularity: 0.35, canopyMoisture: 40 },
        },
        {
          name: "Bacterial Leaf Blight",
          emoji: "🍂",
          description: "Extensive necrotic lesions, high moisture",
          values: { lesionArea: 75, chlorophyllLoss: 0.85, spotIrregularity: 0.90, canopyMoisture: 85 },
        },
        {
          name: "Early Leaf Rust",
          emoji: "🍁",
          description: "Scattered pustules with chlorotic halos",
          values: { lesionArea: 22, chlorophyllLoss: 0.40, spotIrregularity: 0.65, canopyMoisture: 65 },
        },
      ],
    };
  }

  // 2. Clinical / Health / Disease / Patient Vitals
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
    return {
      functionName: "run_patient_diagnosis",
      title: "Live Clinical Diagnostic Predictor",
      subtitle:
        "Test your built diagnostic pipeline on patient vitals. Move sliders to simulate incoming clinical records live in your browser!",
      badge: "Clinical Model Tester",
      defaultThreshold: 0.40,
      features: [
        {
          id: "glucose",
          label: "Fasting Glucose",
          type: "slider",
          min: 70,
          max: 220,
          step: 1,
          default: 145,
          unit: "mg/dL",
          description: "Normal: 70-100, Pre-diabetic: 100-125, Diabetic: 126+",
        },
        {
          id: "bmi",
          label: "Body Mass Index (BMI)",
          type: "slider",
          min: 18.5,
          max: 42.0,
          step: 0.5,
          default: 31.0,
          unit: "kg/m²",
          description: "Normal: 18.5-24.9, Overweight: 25-29.9, Obese: 30+",
        },
        {
          id: "age",
          label: "Patient Age",
          type: "slider",
          min: 18,
          max: 85,
          step: 1,
          default: 52,
          unit: "years",
          description: "Metabolic risk factor scale",
        },
        {
          id: "bloodPressure",
          label: "Blood Pressure",
          type: "slider",
          min: 90,
          max: 180,
          step: 2,
          default: 130,
          unit: "mmHg",
          description: "Systolic blood pressure reading",
        },
      ],
      output: {
        type: "classification",
        label: "Clinical Triage",
        positiveClass: "HIGH RISK / POSITIVE",
        negativeClass: "HEALTHY BASELINE / NEGATIVE",
        classes: [
          { name: "HIGH RISK / POSITIVE", emoji: "⚠️", color: "#EF4444" },
          { name: "HEALTHY BASELINE / NEGATIVE", emoji: "✅", color: "#10B981" },
        ],
      },
      presets: [
        {
          name: "High Risk Screening Patient",
          emoji: "🔴",
          description: "Elevated glucose, high BMI, older age",
          values: { glucose: 175, bmi: 34.0, age: 58, bloodPressure: 145 },
        },
        {
          name: "Healthy Baseline Adult",
          emoji: "🟢",
          description: "Normal fasting vitals",
          values: { glucose: 88, bmi: 22.0, age: 26, bloodPressure: 115 },
        },
        {
          name: "Borderline Pre-Diabetic",
          emoji: "🟡",
          description: "Impaired fasting glucose",
          values: { glucose: 118, bmi: 28.5, age: 48, bloodPressure: 132 },
        },
      ],
    };
  }

  // 3. Real Estate / Housing / Price Prediction
  if (
    lower.includes("real estate") ||
    lower.includes("house") ||
    lower.includes("housing") ||
    lower.includes("property") ||
    lower.includes("home price") ||
    lower.includes("price prediction")
  ) {
    return {
      functionName: "estimate_home_value",
      title: "Live Real Estate Valuation Predictor",
      subtitle:
        "Test your built linear regression pipeline on house attributes. Move sliders to predict market property valuations live in your browser!",
      badge: "Real Estate Regression Tester",
      features: [
        {
          id: "sqft",
          label: "Living Area",
          type: "slider",
          min: 600,
          max: 4800,
          step: 50,
          default: 1800,
          unit: "sq ft",
          description: "Interior finished square footage",
        },
        {
          id: "bedrooms",
          label: "Bedrooms",
          type: "slider",
          min: 1,
          max: 6,
          step: 1,
          default: 3,
          unit: "beds",
          description: "Count of bedrooms",
        },
      ],
      output: {
        type: "regression",
        label: "Estimated Property Value",
        unit: "$",
      },
      presets: [
        { name: "Cozy Starter Home", emoji: "🏡", values: { sqft: 1100, bedrooms: 2 } },
        { name: "Suburban Family House", emoji: "🏠", values: { sqft: 2200, bedrooms: 4 } },
        { name: "Luxury Executive Estate", emoji: "🏰", values: { sqft: 3800, bedrooms: 5 } },
      ],
    };
  }

  // 4. Spam / Text / NLP Classification
  if (
    lower.includes("spam") ||
    lower.includes("email") ||
    lower.includes("bayes") ||
    lower.includes("sentiment") ||
    lower.includes("review") ||
    lower.includes("message")
  ) {
    const isSentiment = lower.includes("sentiment") || lower.includes("review");
    return {
      functionName: isSentiment ? "classify_sentiment" : "classify_message",
      title: isSentiment ? "Live Sentiment Analyzer" : "Live Message Spam Analyzer",
      subtitle: isSentiment
        ? "Type or paste any customer review to observe token sentiment weights and positive/negative polarity live."
        : "Type or paste any message to observe token frequency weights and Bayesian spam scoring live.",
      badge: isSentiment ? "NLP Sentiment Engine" : "Bayesian Spam Filter",
      defaultThreshold: 0.50,
      features: [
        {
          id: "text",
          label: "Message / Review Input",
          type: "text",
          default: isSentiment
            ? "The battery life is phenomenal and the display is breathtaking. Absolutely love it!"
            : "Congratulations! You won a $1,000 free Walmart giftcard today. Call now to claim!",
          description: "Type any text string to evaluate live",
        },
      ],
      output: {
        type: "classification",
        label: isSentiment ? "Sentiment Polarity" : "Delivery Triage",
        positiveClass: isSentiment ? "POSITIVE REVIEW" : "FLAGGED AS SPAM",
        negativeClass: isSentiment ? "NEGATIVE REVIEW" : "DELIVERED TO INBOX",
        classes: isSentiment
          ? [
              { name: "POSITIVE REVIEW", emoji: "🌟", color: "#10B981" },
              { name: "NEGATIVE REVIEW", emoji: "👎", color: "#EF4444" },
            ]
          : [
              { name: "FLAGGED AS SPAM", emoji: "🚨", color: "#EF4444" },
              { name: "DELIVERED TO INBOX", emoji: "📬", color: "#10B981" },
            ],
      },
      presets: isSentiment
        ? [
            {
              name: "Glowing 5-Star Review",
              emoji: "⭐",
              values: {
                text: "Outstanding quality! Exceeded every expectation. Highly recommend to everyone.",
              },
            },
            {
              name: "Critical 1-Star Review",
              emoji: "❌",
              values: {
                text: "Terrible experience. Broke on day one, customer support refused a refund. Awful.",
              },
            },
            {
              name: "Mixed / Nuanced Review",
              emoji: "⚖️",
              values: {
                text: "The camera is decent for the price, but battery life drains faster than expected.",
              },
            },
          ]
        : [
            {
              name: "Urgent Phishing Scam",
              emoji: "⚠️",
              values: {
                text: "URGENT: Your bank account is locked! Click this link now to verify your credentials.",
              },
            },
            {
              name: "Legitimate Work Message",
              emoji: "💼",
              values: {
                text: "Hi team, let us reschedule the quarterly roadmap discussion to Thursday at 10 AM.",
              },
            },
            {
              name: "Lottery Prize Hook",
              emoji: "🎁",
              values: {
                text: "You have been selected as our winner! Call 1-800-PRIZE to claim your free cash award.",
              },
            },
          ],
    };
  }

  // 5. AUTONOMOUS DYNAMIC PARSER FOR ANY OTHER PROJECT
  const isRegression =
    lower.includes("price") ||
    lower.includes("cost") ||
    lower.includes("forecast") ||
    lower.includes("continuous") ||
    lower.includes("value") ||
    lower.includes("rate") ||
    lower.includes("time") ||
    lower.includes("duration");

  let extractedFeatureNames: string[] = [];
  if (concepts && concepts.length > 0) {
    const code = concepts[0].starterCode || concepts[0].solutionCode || "";
    const match = code.match(/["']inputs["']\s*:\s*\[([^\]]+)\]/);
    if (match && match[1]) {
      extractedFeatureNames = match[1]
        .split(",")
        .map((s: string) => s.replace(/["']/g, "").trim())
        .filter((s: string) => s.length > 0 && s !== "___");
    }
  }

  if (extractedFeatureNames.length === 0) {
    extractedFeatureNames = [
      "Signal Magnitude (x1)",
      "Variance Spread (x2)",
      "Rate of Change (x3)",
      "Prior Density (x4)",
    ];
  }

  const dynamicFeatures: ModelFeatureSpec[] = extractedFeatureNames.map((name, idx) => ({
    id: `feature_${idx + 1}`,
    label: name.charAt(0).toUpperCase() + name.slice(1).replace(/_/g, " "),
    type: "slider",
    min: 0.0,
    max: 1.0,
    step: 0.05,
    default: idx === 0 ? 0.80 : idx === 1 ? 0.35 : idx === 2 ? 0.60 : 0.20,
    unit: "",
    description: `Normalized input signal for ${name}`,
  }));

  return {
    functionName: "run_project_inference",
    title: `Live Model Inference: ${safeGoal}`,
    subtitle: `Test your custom machine learning model on simulated inputs in real time. Adjust sliders to observe live inference decisions!`,
    badge: isRegression ? "Dynamic Regression Model" : "Dynamic Classifier",
    defaultThreshold: 0.50,
    features: dynamicFeatures,
    output: {
      type: isRegression ? "regression" : "classification",
      label: isRegression ? "Target Output Quantity" : "Model Prediction",
      unit: isRegression ? "units" : undefined,
      positiveClass: "CLASS 1 / POSITIVE",
      negativeClass: "CLASS 0 / NEGATIVE",
      classes: isRegression
        ? undefined
        : [
            { name: "CLASS 1 / POSITIVE", emoji: "🎯", color: "#10B981" },
            { name: "CLASS 0 / NEGATIVE", emoji: "⚪", color: "#6B7280" },
          ],
    },
    presets: [
      {
        name: "High Activation Profile",
        emoji: "🔥",
        description: "Strong signal indicators",
        values: Object.fromEntries(
          dynamicFeatures.map((f, i) => [f.id, i % 2 === 0 ? 0.85 : 0.70])
        ),
      },
      {
        name: "Balanced Baseline",
        emoji: "⚖️",
        description: "Average / standard operational values",
        values: Object.fromEntries(dynamicFeatures.map((f) => [f.id, 0.50])),
      },
      {
        name: "Low Activity Profile",
        emoji: "❄️",
        description: "Minimal signal input",
        values: Object.fromEntries(
          dynamicFeatures.map((f, i) => [f.id, i % 2 === 0 ? 0.15 : 0.25])
        ),
      },
    ],
  };
}



