import { SPAM_DATASET } from "./templates/spamClassifier";

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


