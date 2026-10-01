import { Concept, TechnicalTerm, DeepMathWalkthrough } from "./types";

/**
 * Universal technical dictionary explaining core ML & DL terms
 * from absolute scratch with zero assumed prior knowledge.
 */
export const ML_DL_DICTIONARY: Record<string, TechnicalTerm> = {
  feature_vector: {
    term: "Feature Vector (x)",
    definition:
      "A clean list of measurable numbers that describes an item so the computer can calculate with it.",
    analogy:
      "Think of the nutrition facts label on a cereal box: [Calories: 150, Sugar: 9g, Fiber: 3g]. Those numbers summarize the food.",
    mathSymbolOrFormula: "x = [x₁, x₂, ..., xₙ]ᵀ",
    exampleUsage:
      "In emotion detection, x = [smile_curvature: 0.85, brow_furrow: 0.10, eye_openness: 0.70].",
  },
  label_target: {
    term: "Target / Ground Truth Label (y)",
    definition:
      "The true real-world answer that we want the AI model to learn to predict.",
    analogy:
      "The answer key at the back of a textbook that the student checks their homework against.",
    mathSymbolOrFormula: "y ∈ {0, 1} (Classification) or y ∈ ℝ (Regression)",
    exampleUsage:
      "y = 1 if the patient has diabetes, or y = 'Joy' if the face is smiling.",
  },
  weights: {
    term: "Weights (w)",
    definition:
      "Importance dials. A weight determines how strongly a specific input feature influences the final prediction.",
    analogy:
      "Volume faders on a music mixing console. Pushing up the vocal fader makes vocals dominate; lowering it mutes them.",
    mathSymbolOrFormula: "w = [w₁, w₂, ..., wₙ]",
    exampleUsage:
      "A high positive weight (+2.5) on 'smile curvature' strongly pushes the prediction toward 'Joy'.",
  },
  bias: {
    term: "Bias (b)",
    definition:
      "The baseline starting point or default assumption of the model before looking at any feature inputs.",
    analogy:
      "The default thermostat setting in an empty room (e.g. 68°F) before anyone enters or turns on appliances.",
    mathSymbolOrFormula: "z = w · x + b",
    exampleUsage:
      "If 90% of all emails are normal, a negative bias keeps the spam alert quiet until overwhelming spam evidence arrives.",
  },
  logit: {
    term: "Logit / Linear Combination (z)",
    definition:
      "The raw unconstrained mathematical score computed by multiplying features by weights and adding the bias.",
    analogy:
      "The raw points score accumulated in a game before being converted into a letter grade.",
    mathSymbolOrFormula: "z = ∑ (wᵢ · xᵢ) + b = wᵀx + b",
    exampleUsage:
      "z = 2.45. This raw number can range from -∞ to +∞ before an activation function squashes it into a probability.",
  },
  dot_product: {
    term: "Dot Product (w · x)",
    definition:
      "Multiplying matching elements of two number lists and adding the results together into a single master score.",
    analogy:
      "Calculating your grocery bill: (3 apples × $1.50) + (2 milks × $3.00) = $4.50 + $6.00 = $10.50.",
    mathSymbolOrFormula: "w · x = w₁x₁ + w₂x₂ + ... + wₙxₙ",
    exampleUsage:
      "[1.8, -1.2] · [0.85, 0.10] = (1.8 × 0.85) + (-1.2 × 0.10) = 1.53 - 0.12 = 1.41.",
  },
  sigmoid: {
    term: "Sigmoid Activation Function (σ)",
    definition:
      "A smooth S-shaped mathematical curve that takes any number from -∞ to +∞ and smoothly squashes it strictly between 0 and 1 (0% to 100%).",
    analogy:
      "A dimmer switch that smoothly transitions a light bulb from completely off (0.0) to maximum brightness (1.0).",
    mathSymbolOrFormula: "σ(z) = 1 / (1 + e⁻ᶻ)",
    exampleUsage:
      "If logit z = 1.46, σ(1.46) = 1 / (1 + e⁻¹·⁴⁶) = 0.812 → 81.2% probability.",
  },
  softmax: {
    term: "Softmax Activation Function",
    definition:
      "An activation function for multi-class classification that exponentiates raw logits and normalizes them so all class probabilities sum to exactly 1.0 (100%).",
    analogy:
      "Dividing a 100-slice pizza among players proportionally based on how many goals each player scored.",
    mathSymbolOrFormula: "P(class i) = e^(zᵢ) / ∑ⱼ e^(zⱼ)",
    exampleUsage:
      "For logits [3.0, 1.0, 0.0], Softmax outputs [0.84, 0.11, 0.05] for Joy, Surprise, and Neutral.",
  },
  loss_function: {
    term: "Loss / Cost Function (L)",
    definition:
      "A mathematical penalty score measuring how far off the model's guess is from the true real-world answer. Lower loss is always better.",
    analogy:
      "In archery, measuring the physical distance in centimeters from where your arrow landed to the center bullseye.",
    mathSymbolOrFormula: "Binary Cross-Entropy: -[y log(p) + (1-y) log(1-p)]",
    exampleUsage:
      "If the true label is 1 and the model predicts 0.90, the loss is small (-log(0.90) = 0.105). If it predicts 0.10, loss explodes to 2.30.",
  },
  gradient_descent: {
    term: "Gradient Descent",
    definition:
      "The master optimization algorithm in AI that calculates which direction to nudge each weight to make the loss smaller.",
    analogy:
      "A hiker blindfolded on a foggy mountain who feels the slope of the ground with their boots and takes steps downward.",
    mathSymbolOrFormula: "w_new = w_old - α · (∂L / ∂w)",
    exampleUsage:
      "If increasing weight w₁ raises the error, the gradient is positive, so gradient descent nudges w₁ down.",
  },
  learning_rate: {
    term: "Learning Rate (α or η)",
    definition:
      "The step size taken during each update in gradient descent. Determines how cautiously or aggressively weights change.",
    analogy:
      "When tuning a radio knob: turning it too violently skips past your station; turning it too microscopic takes hours.",
    mathSymbolOrFormula: "Step = α · ∇L (Typical α: 0.01 to 0.001)",
    exampleUsage:
      "A learning rate of 0.01 provides smooth, stable weight updates without causing numerical explosions.",
  },
  decision_threshold: {
    term: "Decision Threshold (θ)",
    definition:
      "The probability cutoff above which the model classifies an input as Positive rather than Negative (commonly 0.50 or 50%).",
    analogy:
      "A security metal detector's sensitivity dial. Turn it up high to catch every needle; turn it down to avoid false alarms on belt buckles.",
    mathSymbolOrFormula: "ŷ = 1 if P(y=1|x) ≥ θ, else 0",
    exampleUsage:
      "In cancer screening, doctors lower the threshold to 0.20 to catch even faint warning signs early.",
  },
  overfitting: {
    term: "Overfitting vs Generalization",
    definition:
      "Overfitting happens when a model memorizes the training data quirks by heart, failing when tested on brand-new unseen data.",
    analogy:
      "A student who memorizes test question numbers and letters [1: A, 2: C] instead of learning the math concepts, then fails the real exam.",
    mathSymbolOrFormula: "High Training Accuracy (99%) + Poor Validation Accuracy (62%)",
    exampleUsage:
      "We prevent overfitting by using validation sets, regularization, and keeping models simple.",
  },
  action_units: {
    term: "Facial Action Units (FACS AUs)",
    definition:
      "The international scientific taxonomy of individual facial muscle contractions (e.g. AU12 Lip Corner Puller for smiling, AU4 Brow Lowerer).",
    analogy:
      "The individual keys on a piano keyboard: pressing different combinations produces chords (emotions).",
    mathSymbolOrFormula: "AU12 (Zygomaticus Major), AU4 (Corrugator Supercilii)",
    exampleUsage:
      "A high AU12 score paired with low AU4 indicates genuine happiness; high AU4 with low AU12 indicates anger or concentration.",
  },
};

/**
 * Standard Step-by-Step Deep Math Walkthroughs for core learning phases
 */
export const STANDARD_MATH_WALKTHROUGHS: Record<string, DeepMathWalkthrough> = {
  linear_combination: {
    formulaName: "Linear Combination & Dot Product",
    formulaLatex: "z = w₁x₁ + w₂x₂ + ... + wₙxₙ + b = w · x + b",
    formulaExplanation:
      "Each input feature xᵢ is multiplied by its learned weight wᵢ to scale its influence, and the baseline bias b is added to shift the starting point.",
    variableDefinitions: [
      { symbol: "x = [x₁, x₂]", meaning: "Input features (e.g. normalized facial measurements or patient vitals)" },
      { symbol: "w = [w₁, w₂]", meaning: "Feature weights (positive = excites prediction, negative = inhibits)" },
      { symbol: "b", meaning: "Scalar bias term (the default score before considering any features)" },
      { symbol: "z", meaning: "Raw score (logit) produced by the linear neuron" },
    ],
    numericalExample: {
      givenInputs: "Features x = [0.80, 0.20], Weights w = [2.0, -1.5], Bias b = 0.10",
      stepByStepArithmetic: [
        "Step 1: Compute weighted feature 1: 0.80 × 2.0 = 1.60",
        "Step 2: Compute weighted feature 2: 0.20 × (-1.5) = -0.30",
        "Step 3: Sum the weighted features (dot product): 1.60 + (-0.30) = 1.30",
        "Step 4: Add the baseline bias: 1.30 + 0.10 = 1.40",
      ],
      finalResult: "Raw logit z = 1.40",
    },
  },

  sigmoid_activation: {
    formulaName: "Sigmoid Non-Linear Activation Function",
    formulaLatex: "σ(z) = 1 / (1 + e⁻ᶻ)",
    formulaExplanation:
      "Squashes the unbounded linear logit z (-∞ to +∞) into a calibrated probability strictly bounded between 0.0 (0%) and 1.0 (100%).",
    variableDefinitions: [
      { symbol: "z", meaning: "Input linear logit score from the previous layer" },
      { symbol: "e", meaning: "Euler's constant (natural exponential base ≈ 2.71828)" },
      { symbol: "σ(z)", meaning: "Calibrated probability score between 0 and 1" },
    ],
    numericalExample: {
      givenInputs: "Raw logit z = 1.40",
      stepByStepArithmetic: [
        "Step 1: Negate the logit: -z = -1.40",
        "Step 2: Compute exponential e^(-1.40): 2.71828^(-1.40) ≈ 0.2466",
        "Step 3: Add 1 to denominator: 1 + 0.2466 = 1.2466",
        "Step 4: Divide 1 by denominator: 1 / 1.2466 ≈ 0.8021",
      ],
      finalResult: "Probability P(Positive) = 0.802 (80.2% confidence)",
    },
  },

  softmax_activation: {
    formulaName: "Softmax Multi-Class Activation Function",
    formulaLatex: "P(class k) = exp(zₖ) / ∑ⱼ exp(zⱼ)",
    formulaExplanation:
      "Exponentiates all class logits to make them strictly positive, then divides each by the grand sum so the entire distribution sums to 1.0 (100%).",
    variableDefinitions: [
      { symbol: "zₖ", meaning: "Raw logit score for class k (e.g. Joy, Surprise, Anger)" },
      { symbol: "exp(zₖ)", meaning: "Euler's exponential e^(zₖ)" },
      { symbol: "∑ exp(zⱼ)", meaning: "Sum of exponentiated logits across all classes" },
    ],
    numericalExample: {
      givenInputs: "Logits: Joy z₁ = 2.5, Surprise z₂ = 1.0, Anger z₃ = -0.5",
      stepByStepArithmetic: [
        "Step 1: Compute e^(z₁): e^(2.5) ≈ 12.182",
        "Step 2: Compute e^(z₂): e^(1.0) ≈ 2.718",
        "Step 3: Compute e^(z₃): e^(-0.5) ≈ 0.607",
        "Step 4: Compute sum of exponentials: 12.182 + 2.718 + 0.607 = 15.507",
        "Step 5: Normalize Joy: 12.182 / 15.507 ≈ 0.786 (78.6%)",
        "Step 6: Normalize Surprise: 2.718 / 15.507 ≈ 0.175 (17.5%)",
        "Step 7: Normalize Anger: 0.607 / 15.507 ≈ 0.039 (3.9%)",
      ],
      finalResult: "Probabilities: [Joy: 78.6%, Surprise: 17.5%, Anger: 3.9%] (Sum = 100.0%)",
    },
  },

  binary_cross_entropy: {
    formulaName: "Binary Cross-Entropy Loss (Log Loss)",
    formulaLatex: "L(y, p) = - [ y · ln(p) + (1 - y) · ln(1 - p) ]",
    formulaExplanation:
      "Penalizes confident wrong guesses logarithmically. When true label y=1, loss is -ln(p). When true label y=0, loss is -ln(1-p).",
    variableDefinitions: [
      { symbol: "y", meaning: "True ground-truth label (1 for positive, 0 for negative)" },
      { symbol: "p", meaning: "Model's predicted probability (between 0.0 and 1.0)" },
      { symbol: "ln", meaning: "Natural logarithm" },
    ],
    numericalExample: {
      givenInputs: "True label y = 1, Model predicted probability p = 0.80",
      stepByStepArithmetic: [
        "Step 1: Identify active branch: since y = 1, loss simplifies to -ln(p)",
        "Step 2: Calculate natural log ln(0.80): ln(0.80) ≈ -0.2231",
        "Step 3: Negate to get positive loss penalty: -(-0.2231) = +0.2231",
        "Contrast: If the model foolishly predicted p = 0.10, loss would be -ln(0.10) = +2.3026 (10× worse penalty!)",
      ],
      finalResult: "Loss L = 0.2231 (Well calibrated prediction)",
    },
  },

  decision_threshold_classification: {
    formulaName: "Decision Boundary & Threshold Partitioning",
    formulaLatex: "Prediction ŷ = Class 1 if P(y=1|x) ≥ θ, else Class 0",
    formulaExplanation:
      "Converts the continuous probability curve into an actionable discrete decision. Adjusting θ balances False Positives vs False Negatives.",
    variableDefinitions: [
      { symbol: "P(y=1|x)", meaning: "Estimated probability of positive condition" },
      { symbol: "θ (theta)", meaning: "Operating decision threshold (default = 0.50)" },
      { symbol: "ŷ (y-hat)", meaning: "Final discrete classification label output" },
    ],
    numericalExample: {
      givenInputs: "Model confidence P = 0.72, Standard threshold θ = 0.50",
      stepByStepArithmetic: [
        "Step 1: Compare confidence to threshold: 0.72 ≥ 0.50 ?",
        "Step 2: Condition is True (0.72 > 0.50)",
        "Step 3: Assign positive classification label ŷ = 1 (Positive / Detected)",
      ],
      finalResult: "Decision: Positive Class Confirmed (Confidence 72%)",
    },
  },
};

/**
 * Enriches any concept with deep ML/DL theory, jargon busters,
 * and concrete step-by-step arithmetic.
 */
export function enrichConceptWithDeepTheory(concept: Concept, goal?: string): Concept {
  const lowerGoal = (goal || "").toLowerCase();
  const lowerId = concept.id.toLowerCase();
  const lowerTitle = concept.title.toLowerCase();

  const isEmotion =
    lowerGoal.includes("emotion") ||
    lowerGoal.includes("face") ||
    lowerGoal.includes("expression") ||
    lowerId.includes("emotion") ||
    lowerTitle.includes("facial");

  const isPlantOrAgri =
    lowerGoal.includes("plant") ||
    lowerGoal.includes("crop") ||
    lowerGoal.includes("leaf") ||
    lowerGoal.includes("leaves") ||
    lowerGoal.includes("botan") ||
    lowerGoal.includes("agri") ||
    lowerGoal.includes("tree");

  const isMedical =
    !isPlantOrAgri &&
    (lowerGoal.includes("diabet") ||
      lowerGoal.includes("heart") ||
      (lowerGoal.includes("disease") && !isPlantOrAgri) ||
      lowerGoal.includes("patient") ||
      (lowerGoal.includes("health") && !isPlantOrAgri));

  const isRegression =
    lowerGoal.includes("real estate") ||
    lowerGoal.includes("house") ||
    lowerGoal.includes("housing") ||
    lowerGoal.includes("price") ||
    lowerGoal.includes("stock") ||
    lowerTitle.includes("regression");

  // If already populated, return existing
  if (concept.technicalTerms && concept.technicalTerms.length > 0 && concept.deepMath) {
    return concept;
  }

  // Determine relevant technical terms
  const terms: TechnicalTerm[] = [];

  if (isEmotion) {
    terms.push(ML_DL_DICTIONARY.action_units);
    terms.push(ML_DL_DICTIONARY.feature_vector);
    terms.push(ML_DL_DICTIONARY.weights);
    terms.push(ML_DL_DICTIONARY.softmax);
    terms.push(ML_DL_DICTIONARY.bias);
  } else if (isPlantOrAgri) {
    terms.push(ML_DL_DICTIONARY.feature_vector);
    terms.push(ML_DL_DICTIONARY.weights);
    terms.push(ML_DL_DICTIONARY.sigmoid);
    terms.push(ML_DL_DICTIONARY.decision_threshold);
    terms.push(ML_DL_DICTIONARY.cross_entropy);
  } else if (isMedical) {
    terms.push(ML_DL_DICTIONARY.feature_vector);
    terms.push(ML_DL_DICTIONARY.label_target);
    terms.push(ML_DL_DICTIONARY.sigmoid);
    terms.push(ML_DL_DICTIONARY.decision_threshold);
    terms.push(ML_DL_DICTIONARY.weights);
  } else if (isRegression) {
    terms.push(ML_DL_DICTIONARY.feature_vector);
    terms.push(ML_DL_DICTIONARY.weights);
    terms.push(ML_DL_DICTIONARY.bias);
    terms.push(ML_DL_DICTIONARY.dot_product);
    terms.push(ML_DL_DICTIONARY.overfitting);
  } else {
    // Default NLP or general ML
    terms.push(ML_DL_DICTIONARY.feature_vector);
    terms.push(ML_DL_DICTIONARY.weights);
    terms.push(ML_DL_DICTIONARY.bias);
    terms.push(ML_DL_DICTIONARY.sigmoid);
    terms.push(ML_DL_DICTIONARY.loss_function);
  }

  // Determine deep math walkthrough
  let mathWalkthrough: DeepMathWalkthrough = STANDARD_MATH_WALKTHROUGHS.linear_combination;

  if (lowerId.includes("activation") || lowerTitle.includes("activation") || lowerTitle.includes("sigmoid")) {
    mathWalkthrough = STANDARD_MATH_WALKTHROUGHS.sigmoid_activation;
  } else if (isEmotion || lowerTitle.includes("softmax") || lowerTitle.includes("multi-class")) {
    mathWalkthrough = STANDARD_MATH_WALKTHROUGHS.softmax_activation;
  } else if (lowerId.includes("loss") || lowerTitle.includes("loss") || lowerTitle.includes("cross-entropy")) {
    mathWalkthrough = STANDARD_MATH_WALKTHROUGHS.binary_cross_entropy;
  } else if (lowerId.includes("decision") || lowerId.includes("threshold") || lowerTitle.includes("boundary")) {
    mathWalkthrough = STANDARD_MATH_WALKTHROUGHS.decision_threshold_classification;
  }

  return {
    ...concept,
    technicalTerms: concept.technicalTerms || terms,
    deepMath: concept.deepMath || mathWalkthrough,
  };
}
