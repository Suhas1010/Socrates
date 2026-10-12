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
  text_tokenization: {
    formulaName: "Text Tokenization & Lexical Boundary Extraction",
    formulaLatex: "T = tokenize(s) = [words extracted from s]",
    formulaExplanation:
      "Data-flow logic: ingests raw unstructured message text, lowercases characters, and extracts normalized alphanumeric tokens using word boundaries without inventing arbitrary algebraic equations.",
    variableDefinitions: [
      { symbol: "s", meaning: "Raw input message string (e.g. email or SMS)" },
      { symbol: "T", meaning: "Ordered array of normalized alphanumeric word tokens" },
    ],
    numericalExample: {
      givenInputs: "Raw input text s = \"WINNER! Claim $1000 free Walmart giftcard now!\"",
      stepByStepArithmetic: [
        "Lowercase input characters: \"winner! claim $1000 free walmart giftcard now!\"",
        "Strip punctuation and extract alphanumeric tokens: [\"winner\", \"claim\", \"1000\", \"free\", \"walmart\", \"giftcard\", \"now\"]",
        "Validate token sequence length: 7 clean tokens ready for vocabulary frequency counting",
      ],
      finalResult: "Token Array = [\"winner\", \"claim\", \"1000\", \"free\", \"walmart\", \"giftcard\", \"now\"] (Count: 7 tokens)",
    },
  },

  bag_of_words_frequency: {
    formulaName: "Bag-of-Words & Feature Frequency Ratios",
    formulaLatex: "Ratio(w) = freq(w, Spam) / freq(w, Ham) = (count_spam / N_spam) / (count_ham / N_ham)",
    formulaExplanation:
      "Measures token occurrence rates across email collections. Words with high spam-to-ham frequency ratios act as primary mathematical discriminators.",
    variableDefinitions: [
      { symbol: "count(w, C)", meaning: "Occurrences of token w in category C" },
      { symbol: "Ratio(w)", meaning: "Empirical discrimination power multiplier" },
    ],
    numericalExample: {
      givenInputs: "Corpus of 100 emails (40 Spam, 60 Ham), target word w = \"urgent\"",
      stepByStepArithmetic: [
        "In 40 Spam emails: \"urgent\" appears 35 times → frequency = 35 / 40 = 0.875 (87.5%)",
        "In 60 Ham emails: \"urgent\" appears 3 times → frequency = 3 / 60 = 0.050 (5.0%)",
        "Calculate discriminatory ratio: 0.875 / 0.050 = 17.5× higher occurrence in spam",
      ],
      finalResult: "Discriminatory Power = 17.5× (Strong Spam Indicator)",
    },
  },

  class_prior_probabilities: {
    formulaName: "Prior Probability & Class Base Rates",
    formulaLatex: "P(Spam) = N_spam / N_total,   P(Ham) = 1 - P(Spam)",
    formulaExplanation:
      "Calculates the baseline base-rate probability that an incoming email is spam before reading any word contents.",
    variableDefinitions: [
      { symbol: "N_spam", meaning: "Verified spam emails in training corpus (250)" },
      { symbol: "N_total", meaning: "Total emails in training corpus (1,000)" },
    ],
    numericalExample: {
      givenInputs: "Training collection: 250 spam messages, 750 legitimate messages (N = 1,000)",
      stepByStepArithmetic: [
        "Compute Spam prior: P(Spam) = 250 / 1,000 = 0.250 (25.0%)",
        "Compute Ham prior: P(Ham) = 750 / 1,000 = 0.750 (75.0%)",
        "Verify probability space sum: 0.250 + 0.750 = 1.000 (100.0%)",
      ],
      finalResult: "Prior Base Rates: P(Spam) = 25.0%, P(Ham) = 75.0%",
    },
  },

  bayes_posterior_theorem: {
    formulaName: "Bayes' Theorem Posterior Probability",
    formulaLatex: "P(Spam | w) = [ P(w | Spam) · P(Spam) ] / [ P(w | Spam) · P(Spam) + P(w | Ham) · P(Ham) ]",
    formulaExplanation:
      "Updates the prior belief that an email is spam upon observing a high-signal keyword evidence w.",
    variableDefinitions: [
      { symbol: "P(Spam)", meaning: "Prior probability of spam (0.20)" },
      { symbol: "P(w|Spam)", meaning: "Likelihood of seeing keyword in spam (0.60)" },
      { symbol: "P(w|Ham)", meaning: "Likelihood of seeing keyword in ham (0.05)" },
    ],
    numericalExample: {
      givenInputs: "P(Spam) = 0.20, P(Ham) = 0.80, P('deal'|Spam) = 0.60, P('deal'|Ham) = 0.05",
      stepByStepArithmetic: [
        "Compute Joint Spam likelihood: 0.20 × 0.60 = 0.120",
        "Compute Joint Ham likelihood: 0.80 × 0.05 = 0.040",
        "Compute total marginal evidence P('deal'): 0.120 + 0.040 = 0.160",
        "Normalize posterior probability: 0.120 / 0.160 = 0.750",
      ],
      finalResult: "Posterior Probability P(Spam | 'deal') = 0.750 (75.0%)",
    },
  },

  naive_bayes_laplace: {
    formulaName: "Log-Space Naive Bayes with Laplace Smoothing",
    formulaLatex: "log P(C | D) = log P(C) + ∑ log [ (count(wᵢ, C) + 1) / (total_words(C) + |V|) ]",
    formulaExplanation:
      "Evaluates joint word likelihoods in log-space to prevent numerical underflow, applying +1 Laplace smoothing to prevent unseen words from zeroing out predictions.",
    variableDefinitions: [
      { symbol: "count(w, C)", meaning: "Frequency of word w in category C" },
      { symbol: "|V|", meaning: "Total unique vocabulary size" },
    ],
    numericalExample: {
      givenInputs: "Tokens ['free', 'giftcard'], Log priors: Spam = -1.386, Ham = -0.288; Log likelihoods: Spam ['free': -3.20, 'giftcard': -3.50], Ham ['free': -6.10, 'giftcard': -7.20]",
      stepByStepArithmetic: [
        "Accumulate Spam log evidence: -1.386 + (-3.20) + (-3.50) = -8.086",
        "Accumulate Ham log evidence: -0.288 + (-6.10) + (-7.20) = -13.588",
        "Compare log scores: -8.086 > -13.588 (Difference = +5.502 in favor of Spam)",
      ],
      finalResult: "Predicted Class = Spam (Log-evidence margin: +5.502)",
    },
  },

  train_test_split: {
    formulaName: "Train-Test Dataset Generalization Partitioning",
    formulaLatex: "N_train = floor(N · (1 - r)),   N_test = N - N_train",
    formulaExplanation:
      "Guarantees out-of-sample generalization by holding out evaluation instances that the training algorithm never observes.",
    variableDefinitions: [
      { symbol: "N", meaning: "Total verified dataset size (1,000)" },
      { symbol: "r", meaning: "Holdout test split ratio (0.20 or 20%)" },
    ],
    numericalExample: {
      givenInputs: "Total dataset size N = 1,000 labeled messages, Holdout ratio r = 0.20",
      stepByStepArithmetic: [
        "Compute evaluation test partition: 1,000 × 0.20 = 200 messages",
        "Compute training partition: 1,000 - 200 = 800 messages",
        "Verify disjoint separation: sets share 0 examples (zero train-test leakage)",
      ],
      finalResult: "Partitions: 800 Training messages / 200 Holdout Test messages",
    },
  },

  confusion_matrix_metrics: {
    formulaName: "Confusion Matrix: Precision, Recall & F1 Score",
    formulaLatex: "Precision = TP / (TP + FP),   Recall = TP / (TP + FN),   F₁ = 2 · (P · R) / (P + R)",
    formulaExplanation:
      "Evaluates binary classification trade-offs between false alarms (FP) and missed threats (FN).",
    variableDefinitions: [
      { symbol: "TP", meaning: "True Positives: Spam correctly caught (90)" },
      { symbol: "FP", meaning: "False Positives: Legitimate mail wrongly flagged (10)" },
      { symbol: "FN", meaning: "False Negatives: Spam missed into inbox (5)" },
    ],
    numericalExample: {
      givenInputs: "Evaluation results on 200 emails: TP = 90, FP = 10, FN = 5, TN = 95",
      stepByStepArithmetic: [
        "Compute Precision: 90 / (90 + 10) = 90 / 100 = 0.900 (90.0% of flagged mail was true spam)",
        "Compute Recall: 90 / (90 + 5) = 90 / 95 ≈ 0.9474 (94.7% of all spam was caught)",
        "Compute harmonic F1 score: 2 × (0.900 × 0.9474) / (0.900 + 0.9474) ≈ 0.923",
      ],
      finalResult: "Metrics: Precision = 90.0%, Recall = 94.7%, F1 Score = 0.923",
    },
  },

  pixel_flattening_normalization: {
    formulaName: "Pixel Tensor Flattening & Normalization",
    formulaLatex: "Xᵢ = pixel[r, c] / 255.0,   X ∈ [0.0, 1.0]⁷⁸⁴",
    formulaExplanation:
      "Transforms a 2D 28×28 grayscale pixel image into a 1D continuous 784-element floating point vector normalized between 0.0 and 1.0.",
    variableDefinitions: [
      { symbol: "P_{r, c}", meaning: "Raw byte pixel intensity [0, 255]" },
      { symbol: "X_i", meaning: "Normalized neural network input feature" },
    ],
    numericalExample: {
      givenInputs: "28×28 image patch, stroke detected at row 14, column 14 with raw value 204",
      stepByStepArithmetic: [
        "Calculate flattened index: 14 × 28 + 14 = index 406",
        "Normalize raw intensity: 204 / 255.0 = 0.800",
        "Background pixels: 0 / 255.0 = 0.000",
      ],
      finalResult: "Input Tensor = Vector X of length 784 (with X[406] = 0.800)",
    },
  },

  relu_activation: {
    formulaName: "ReLU Non-Linear Activation Function",
    formulaLatex: "a = ReLU(z) = max(0, z)",
    formulaExplanation:
      "Suppresses negative activations to zero while passing positive signals unchanged, introducing sparsity and solving vanishing gradients.",
    variableDefinitions: [
      { symbol: "z", meaning: "Pre-activation linear logit" },
      { symbol: "a", meaning: "Activated neuron output" },
    ],
    numericalExample: {
      givenInputs: "Pre-activation hidden logits z = [2.40, -1.80, 0.00, 3.10]",
      stepByStepArithmetic: [
        "Neuron 1: max(0, 2.40) = 2.40 (positive activation preserved)",
        "Neuron 2: max(0, -1.80) = 0.00 (negative activation zeroed)",
        "Neuron 4: max(0, 3.10) = 3.10 (positive activation preserved)",
      ],
      finalResult: "Activated Vector a = [2.40, 0.00, 0.00, 3.10]",
    },
  },

  scaled_dot_product_attention: {
    formulaName: "Transformer Scaled Dot-Product Attention",
    formulaLatex: "Attention(Q, K, V) = softmax( (Q · Kᵀ) / √d_k ) · V",
    formulaExplanation:
      "Calculates contextual relevance between tokens by taking scaled dot products of Queries and Keys, then taking a weighted sum of Values.",
    variableDefinitions: [
      { symbol: "Q, K, V", meaning: "Query, Key, and Value projection vectors" },
      { symbol: "d_k", meaning: "Head dimension (64, so √d_k = 8)" },
    ],
    numericalExample: {
      givenInputs: "Query for 'bark', Keys: ['dog', 'tree'], d_k = 64 (√d_k = 8)",
      stepByStepArithmetic: [
        "Compute dot products: Q·K_dog = 48.0, Q·K_tree = 8.0",
        "Scale by √d_k: 48.0 / 8 = 6.0, 8.0 / 8 = 1.0",
        "Softmax weights: e^6 / (e^6 + e^1) = 403.4 / (403.4 + 2.7) = 0.993",
        "Context combination: 0.993 × V_dog + 0.007 × V_tree",
      ],
      finalResult: "Context Attention: 99.3% focus on 'dog', 0.7% on 'tree'",
    },
  },

  linear_combination: {
    formulaName: "Linear Combination & Dot Product",
    formulaLatex: "z = w₁x₁ + w₂x₂ + ... + wₙxₙ + b = w · x + b",
    formulaExplanation:
      "Multiplies each input feature xᵢ by its learned weight wᵢ to scale its influence, and adds the baseline bias b.",
    variableDefinitions: [
      { symbol: "x = [x₁, x₂]", meaning: "Input features" },
      { symbol: "w = [w₁, w₂]", meaning: "Learned weights" },
      { symbol: "b", meaning: "Baseline bias term" },
      { symbol: "z", meaning: "Raw score (logit) produced by the linear neuron" },
    ],
    numericalExample: {
      givenInputs: "Features x = [0.80, 0.20], Weights w = [2.0, -1.5], Bias b = 0.10",
      stepByStepArithmetic: [
        "Compute weighted feature 1: 0.80 × 2.0 = 1.60",
        "Compute weighted feature 2: 0.20 × (-1.5) = -0.30",
        "Sum weighted features (dot product): 1.60 + (-0.30) = 1.30",
        "Add baseline bias: 1.30 + 0.10 = 1.40",
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
        "Negate the logit: -z = -1.40",
        "Compute exponential e^(-1.40): 2.71828^(-1.40) ≈ 0.2466",
        "Add 1 to denominator: 1 + 0.2466 = 1.2466",
        "Divide 1 by denominator: 1 / 1.2466 ≈ 0.8021",
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
        "Compute e^(z₁): e^(2.5) ≈ 12.182",
        "Compute e^(z₂): e^(1.0) ≈ 2.718",
        "Compute e^(z₃): e^(-0.5) ≈ 0.607",
        "Compute sum of exponentials: 12.182 + 2.718 + 0.607 = 15.507",
        "Normalize Joy: 12.182 / 15.507 ≈ 0.786 (78.6%)",
        "Normalize Surprise: 2.718 / 15.507 ≈ 0.175 (17.5%)",
        "Normalize Anger: 0.607 / 15.507 ≈ 0.039 (3.9%)",
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
        "Identify active branch: since y = 1, loss simplifies to -ln(p)",
        "Calculate natural log ln(0.80): ln(0.80) ≈ -0.2231",
        "Negate to get positive loss penalty: -(-0.2231) = +0.2231",
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
        "Compare confidence to threshold: 0.72 ≥ 0.50 ?",
        "Condition is True (0.72 > 0.50)",
        "Assign positive classification label ŷ = 1 (Positive / Detected)",
      ],
      finalResult: "Decision: Positive Class Confirmed (Confidence 72%)",
    },
  },

  naive_bayes_probability: {
    formulaName: "Bayesian Prior & Likelihood Scoring",
    formulaLatex: "P(\\text{Spam} \\mid \\text{words}) \\propto P(\\text{Spam}) \\prod P(w_i \\mid \\text{Spam})",
    formulaExplanation:
      "Calculates the joint probability that an incoming message is spam by multiplying the overall spam base rate by the likelihood of each observed keyword.",
    variableDefinitions: [
      { symbol: "P(Spam)", meaning: "Prior probability that any random message is spam" },
      { symbol: "P(w|Spam)", meaning: "Likelihood of seeing word w given the message is spam" },
    ],
    numericalExample: {
      givenInputs: "P(Spam) = 0.20, P('deal'|Spam) = 0.60, P('deal'|Ham) = 0.05",
      stepByStepArithmetic: [
        "Compute Joint Spam likelihood: 0.20 × 0.60 = 0.12",
        "Compute Joint Ham likelihood: 0.80 × 0.05 = 0.04",
        "Normalize posterior: 0.12 / (0.12 + 0.04) = 0.12 / 0.16 = 0.75",
      ],
      finalResult: "Spam Posterior Probability P = 0.75 (75%)",
    },
  },

  mean_squared_error: {
    formulaName: "Mean Squared Error (MSE) Loss",
    formulaLatex: "\\text{MSE} = \\frac{1}{m} \\sum_{i=1}^m (\\hat{y}_i - y_i)^2",
    formulaExplanation:
      "Measures the average squared difference between continuous model predictions and observed ground-truth values.",
    variableDefinitions: [
      { symbol: "y", meaning: "Actual verified selling price" },
      { symbol: "y_hat", meaning: "Model predicted continuous valuation" },
    ],
    numericalExample: {
      givenInputs: "Actual prices y = [$300k, $450k], Predictions y_hat = [$320k, $430k]",
      stepByStepArithmetic: [
        "Sample 1 residual: 320 - 300 = +20 → Squared error = 20² = 400",
        "Sample 2 residual: 430 - 450 = -20 → Squared error = (-20)² = 400",
        "Average squared error across m=2 samples: (400 + 400) / 2 = 400",
        "Take root for RMSE interpretation: √400 = $20,000 average deviation",
      ],
      finalResult: "Loss: MSE = 400 (RMSE = $20,000)",
    },
  },

  feature_scaling_min_max: {
    formulaName: "Min-Max Feature Scaling & Standardization",
    formulaLatex: "x_{\\text{scaled}} = \\frac{x - x_{\\min}}{x_{\\max} - x_{\\min}}",
    formulaExplanation:
      "Normalizes arbitrary tabular measurements (e.g. square footage, patient age) onto a uniform [0.0, 1.0] interval.",
    variableDefinitions: [
      { symbol: "x", meaning: "Raw observed feature measurement" },
      { symbol: "x_min, x_max", meaning: "Observed min and max range boundaries" },
    ],
    numericalExample: {
      givenInputs: "House square footage x = 2,400 sqft, Minimum = 500, Maximum = 5,000",
      stepByStepArithmetic: [
        "Calculate dynamic range: 5,000 - 500 = 4,500 sqft",
        "Calculate offset from minimum: 2,400 - 500 = 1,900 sqft",
        "Divide offset by range: 1,900 / 4,500 ≈ 0.4222",
      ],
      finalResult: "Normalized Feature = 0.422",
    },
  },

  clinical_data_contract: {
    formulaName: "Clinical Problem Formulation & Data Contract",
    formulaLatex: "f: \\mathcal{X} \\to \\mathcal{Y}, \\quad \\mathcal{X} \\subset \\mathbb{R}^K, \\; \\mathcal{Y} \\in \\{0, 1\\}",
    formulaExplanation:
      "Formulates a strict input-output contract for clinical disease prediction: observable patient measurements serve as input features X, predicting diagnostic risk Y without target leakage.",
    variableDefinitions: [
      { symbol: "X", meaning: "Observed patient measurements (e.g. radius, texture, perimeter, area, smoothness)" },
      { symbol: "Y", meaning: "Target clinical diagnosis (0 = Benign/Normal, 1 = Malignant/High Risk)" },
      { symbol: "K", meaning: "Number of diagnostic biomarkers measured per patient (K = 6)" },
    ],
    numericalExample: {
      givenInputs: "Patient biomarkers: [radius=17.99, texture=10.38, perimeter=122.8, area=1001.0, smoothness=0.118], Target: malignant (0 or 1)",
      stepByStepArithmetic: [
        "Verify measurable biomarkers are recorded prior to diagnosis",
        "Strictly isolate diagnosis label from inputs to prevent target leakage",
        "Map input dimensionality: 6 continuous biomarkers → 1 binary diagnosis decision",
      ],
      finalResult: "Verified Clinical Contract: f: ℝ^6 → {0, 1}",
    },
  },

  clinical_feature_matrix: {
    formulaName: "Clinical Feature Matrix & Patient Observations",
    formulaLatex: "X \\in \\mathbb{R}^{N \\times K}, \\quad y \\in \\{0, 1\\}^N",
    formulaExplanation:
      "Structures historical patient observations into a mathematical feature matrix where each row represents one patient's measured diagnostic biomarkers and vector y records confirmed diagnosis.",
    variableDefinitions: [
      { symbol: "N", meaning: "Total historical patient cohort size (rows)" },
      { symbol: "K", meaning: "Number of diagnostic biomarkers measured per patient (columns)" },
      { symbol: "X[i]", meaning: "Biomarker vector for patient i: [radius, texture, perimeter, area, smoothness]" },
      { symbol: "y[i]", meaning: "Confirmed clinical outcome: 1 = Malignant / Disease, 0 = Benign / Healthy" },
    ],
    numericalExample: {
      givenInputs: "Tumor biopsy cohort (N=6 patients, K=5 biomarkers): First patient measurements [17.99, 10.38, 122.80, 1001.0, 0.1184]",
      stepByStepArithmetic: [
        "Row 1: [radius=17.99, texture=10.38, perimeter=122.80, area=1001.0, smoothness=0.1184] → y₁ = 1 (Malignant)",
        "Row 2: [radius=12.45, texture=15.70, perimeter=82.57, area=477.1, smoothness=0.0880] → y₂ = 0 (Benign)",
        "Stack N=6 historical observations into training matrix X with shape 6 × 5",
        "Verify label correspondence: exactly one target diagnosis per patient row",
      ],
      finalResult: "Dataset Tensor Shape: X ∈ ℝ^(6 × 5), y ∈ {0, 1}^6",
    },
  },

  clinical_risk_sigmoid: {
    formulaName: "Logistic Sigmoid Diagnostic Risk Score",
    formulaLatex: "P(\\text{Malignant} \\mid x) = \\sigma(z) = \\frac{1}{1 + e^{-z}}",
    formulaExplanation:
      "Squashes the learned linear combination of patient biomarkers into a calibrated malignancy risk probability bounded between 0% and 100%.",
    variableDefinitions: [
      { symbol: "z", meaning: "Learned clinical logit score: z = w · x + b (e.g. z = 1.40)" },
      { symbol: "e", meaning: "Euler's exponential base (≈ 2.71828)" },
      { symbol: "P(Malignant|x)", meaning: "Calibrated patient risk probability" },
    ],
    numericalExample: {
      givenInputs: "Patient diagnostic logit z = 1.40 (derived from elevated tumor perimeter and area)",
      stepByStepArithmetic: [
        "Compute negative logit: -z = -1.40",
        "Exponentiate base e: e^(-1.40) ≈ 0.2466",
        "Add baseline offset: 1 + 0.2466 = 1.2466",
        "Compute risk probability: 1 / 1.2466 ≈ 0.8021 (80.2%)",
      ],
      finalResult: "Predicted Risk: P(Malignant) = 80.2% (High Risk Alert)",
    },
  },

  clinical_triage_sensitivity: {
    formulaName: "Clinical Triage Sensitivity & Confusion Matrix",
    formulaLatex: "\\text{Sensitivity (Recall)} = \\frac{\\text{TP}}{\\text{TP} + \\text{FN}} \\ge 0.95",
    formulaExplanation:
      "In clinical healthcare, missing a disease case (False Negative) is catastrophic. The decision threshold is calibrated to guarantee high Sensitivity (≥ 95%).",
    variableDefinitions: [
      { symbol: "TP", meaning: "True Positives: Confirmed malignant cases correctly caught by model" },
      { symbol: "FN", meaning: "False Negatives: Malignant cases mistakenly missed by model (critical danger)" },
      { symbol: "TN, FP", meaning: "True Negatives and False Positives (benign cases)" },
      { symbol: "Sensitivity", meaning: "Fraction of actual sick patients correctly identified: TP / (TP + FN)" },
    ],
    numericalExample: {
      givenInputs: "100 test biopsy patients (20 Malignant, 80 Benign) evaluated at calibrated triage threshold θ = 0.35",
      stepByStepArithmetic: [
        "Model detects 19 of 20 malignant cases: True Positives (TP) = 19",
        "Model misses 1 malignant case: False Negatives (FN) = 1",
        "Compute Sensitivity: 19 / (19 + 1) = 19 / 20 = 0.950 (95.0% recall of cancer cases)",
        "True Negatives (TN) = 76, False Positives (FP) = 4 → Specificity = 76 / 80 = 0.950 (95.0%)",
      ],
      finalResult: "Evaluation: Sensitivity = 95.0%, Specificity = 95.0% (Safety Standards Satisfied)",
    },
  },

  tabular_data_contract: {
    formulaName: "Supervised Problem Formulation & Data Contract",
    formulaLatex: "f: \\mathcal{X} \\to \\mathcal{Y}, \\quad \\mathcal{X} \\subset \\mathbb{R}^K",
    formulaExplanation:
      "Defines the mathematical mapping from measurable observation features X to target outcome Y, ensuring clean feature separation without target leakage.",
    variableDefinitions: [
      { symbol: "X", meaning: "K measurable domain attributes observable before prediction" },
      { symbol: "Y", meaning: "Target variable the machine learning model must predict" },
    ],
    numericalExample: {
      givenInputs: "K = 5 measurable domain features, Target = classification outcome",
      stepByStepArithmetic: [
        "Verify input features are available at decision time",
        "Verify target outcome is not included in the input feature set (prevents target leakage)",
        "Confirm task formulation: Supervised learning mapping f: ℝ^K → Y",
      ],
      finalResult: "Verified Input-Output Contract: f: ℝ^K → Y",
    },
  },

  tabular_feature_matrix: {
    formulaName: "Tabular Feature Matrix & Observation Dataset",
    formulaLatex: "X \\in \\mathbb{R}^{N \\times K}, \\quad y \\in \\mathbb{R}^N",
    formulaExplanation:
      "Represents tabular observations as an N × K matrix where each row is an empirical observation and each column represents a quantified feature attribute.",
    variableDefinitions: [
      { symbol: "N", meaning: "Total number of observations / rows in dataset" },
      { symbol: "K", meaning: "Number of quantified feature attributes / columns" },
      { symbol: "X", meaning: "Feature matrix of numerical inputs" },
      { symbol: "y", meaning: "Ground-truth target labels for each observation" },
    ],
    numericalExample: {
      givenInputs: "Training set of N = 6 observations across K = 5 features",
      stepByStepArithmetic: [
        "Format observation 1 into row vector: x₁ = [v₁, v₂, v₃, v₄, v₅]",
        "Pair each observation row with its confirmed target label: y₁",
        "Assemble N rows into matrix X with dimensions (6 rows, 5 columns)",
        "Verify dimensional alignment: len(X) == len(y) == 6",
      ],
      finalResult: "Dataset Matrix Shape: X ∈ ℝ^(6 × 5), y vector length = 6",
    },
  },

  recommender_cosine_similarity: {
    formulaName: "User-Item Cosine Similarity & Collaborative Filtering",
    formulaLatex: "\\text{sim}(u, v) = \\frac{u \\cdot v}{\\|u\\|_2 \\|v\\|_2} = \\frac{\\sum_i u_i v_i}{\\sqrt{\\sum_i u_i^2} \\sqrt{\\sum_i v_i^2}}",
    formulaExplanation:
      "Measures the geometric angle between preference vectors. High cosine similarity indicates close alignment in genre preferences and rating patterns.",
    variableDefinitions: [
      { symbol: "u", meaning: "Active user preference vector across genre affinity features" },
      { symbol: "v", meaning: "Target item / movie feature vector" },
      { symbol: "sim(u, v)", meaning: "Cosine similarity bounded between -1.0 and +1.0" },
    ],
    numericalExample: {
      givenInputs: "User profile u = [5.0, 4.0, 1.0, 0.0], Movie profile v = [4.0, 5.0, 2.0, 0.0]",
      stepByStepArithmetic: [
        "Compute dot product: (5×4) + (4×5) + (1×2) + (0×0) = 20 + 20 + 2 + 0 = 42.0",
        "Compute norm ||u||: √(25 + 16 + 1 + 0) = √42 ≈ 6.481",
        "Compute norm ||v||: √(16 + 25 + 4 + 0) = √45 ≈ 6.708",
        "Divide dot product by product of norms: 42.0 / (6.481 × 6.708) = 42.0 / 43.475 ≈ 0.966",
      ],
      finalResult: "Affinity Score = 0.966 (96.6% Match — Highly Recommended)",
    },
  },

  object_detection_iou: {
    formulaName: "Intersection over Union (IoU) Bounding Box Overlap",
    formulaLatex: "\\text{IoU} = \\frac{\\text{Area}(B_{\\text{pred}} \\cap B_{\\text{true}})}{\\text{Area}(B_{\\text{pred}} \\cup B_{\\text{true}})}",
    formulaExplanation:
      "Evaluates spatial localization accuracy by dividing the overlap area by the total union bounding area. Threshold IoU ≥ 0.50 defines a valid detection.",
    variableDefinitions: [
      { symbol: "B_pred", meaning: "Predicted bounding box coordinates [x, y, w, h]" },
      { symbol: "B_true", meaning: "Ground-truth object bounding box annotations" },
      { symbol: "IoU", meaning: "Overlap ratio bounded between 0.0 (disjoint) and 1.0 (exact match)" },
    ],
    numericalExample: {
      givenInputs: "True box [100, 100, 200, 200] (area 10,000), Predicted box [110, 110, 200, 200] (area 10,000)",
      stepByStepArithmetic: [
        "Compute intersection box width and height: 90 × 90 = 8,100 px²",
        "Compute union area: Area(True) + Area(Pred) - Intersection = 10,000 + 10,000 - 8,100 = 11,900 px²",
        "Compute IoU: 8,100 / 11,900 ≈ 0.6807 (68.1%)",
        "Compare to standard benchmark: 0.681 ≥ 0.50 → True Positive detection confirmed",
      ],
      finalResult: "Localization IoU = 0.681 (Accurate Detection Confirmed)",
    },
  },

  cybersecurity_anomaly_score: {
    formulaName: "Network Traffic Anomaly & Intrusion Z-Score",
    formulaLatex: "z = \\frac{\\text{packets} - \\mu}{\\sigma}, \\quad L = - [y \\ln(p) + (1-y)\\ln(1-p)]",
    formulaExplanation:
      "Computes how many standard deviations current network packet flow deviates from baseline traffic, triggering immediate intrusion alerts.",
    variableDefinitions: [
      { symbol: "packets", meaning: "Observed network packets per second on active port" },
      { symbol: "μ (mu)", meaning: "Historical baseline mean packet rate (e.g. 850 packets/sec)" },
      { symbol: "σ (sigma)", meaning: "Standard deviation of baseline traffic (e.g. 240 packets/sec)" },
      { symbol: "z", meaning: "Anomaly z-score threshold (z ≥ 3.0 indicates intrusion)" },
    ],
    numericalExample: {
      givenInputs: "Traffic burst = 12,500 packets/sec, Baseline mean μ = 850, Std dev σ = 240",
      stepByStepArithmetic: [
        "Calculate offset from baseline: 12,500 - 850 = +11,650 packets/sec",
        "Compute standard deviation multiplier: 11,650 / 240 ≈ +48.54",
        "Compare to intrusion threshold: 48.54 >> 3.00 (Extreme Outlier)",
        "Trigger firewall intrusion mitigation rule immediately",
      ],
      finalResult: "Anomaly Score z = +48.54 (CRITICAL: DDoS Flood Attack Detected)",
    },
  },

  customer_churn_sigmoid: {
    formulaName: "Logistic Sigmoid Subscriber Churn Risk",
    formulaLatex: "P(\\text{Churn} \\mid x) = \\frac{1}{1 + e^{-(w \\cdot x + b)}}",
    formulaExplanation:
      "Squashes customer engagement attributes (tenure, support calls, monthly charges) into an actionable churn risk percentage.",
    variableDefinitions: [
      { symbol: "x", meaning: "Customer attributes: [tenure=2 months, charges=$85, support_calls=4]" },
      { symbol: "w", meaning: "Learned model weights reflecting risk factors" },
      { symbol: "P(Churn)", meaning: "Estimated probability customer will cancel service" },
    ],
    numericalExample: {
      givenInputs: "Customer profile: Short tenure, high charges, 4 complaints → Raw logit z = +1.15",
      stepByStepArithmetic: [
        "Compute negative logit: -z = -1.15",
        "Compute exponential: e^(-1.15) ≈ 0.3166",
        "Add denominator base: 1 + 0.3166 = 1.3166",
        "Compute calibrated risk: 1 / 1.3166 ≈ 0.7595 (76.0%)",
      ],
      finalResult: "Churn Risk: P(Churn) = 76.0% (Action: Trigger Retention Promotion)",
    },
  },

  audio_spectrogram_features: {
    formulaName: "Discrete Fourier Transform & Acoustic Spectral Energy",
    formulaLatex: "X[k] = \\sum_{n=0}^{N-1} x[n] \\cdot e^{-j 2\\pi k n / N}",
    formulaExplanation:
      "Decomposes raw time-domain sound pressure waves into discrete frequency bins to identify phoneme and voice command resonance.",
    variableDefinitions: [
      { symbol: "x[n]", meaning: "Raw audio microphone pressure samples in discrete time" },
      { symbol: "X[k]", meaning: "Frequency spectrum magnitude at harmonic bin k" },
      { symbol: "N", meaning: "FFT window frame length (e.g. 512 samples at 16 kHz)" },
    ],
    numericalExample: {
      givenInputs: "Audio frame of 512 samples sampled at 16,000 Hz for voice command 'Lights On'",
      stepByStepArithmetic: [
        "Window PCM samples with Hanning window to prevent edge spectral leakage",
        "Compute Fast Fourier Transform across 512 samples",
        "Extract Mel-filterbank energy across 20 frequency bands",
        "Identify resonant formants: Peak at 850 Hz (vowel), secondary peak at 2,400 Hz",
      ],
      finalResult: "Dominant Acoustic Frequencies: [850 Hz, 2400 Hz] (Phonetic Voice Command Signal)",
    },
  },

  sentiment_lexicon_scoring: {
    formulaName: "Sentiment Lexicon Polarity & Sigmoid Activation",
    formulaLatex: "z = \\sum_{t \\in \\text{tokens}} w_t + b, \\quad P(\\text{Positive}) = \\frac{1}{1 + e^{-z}}",
    formulaExplanation:
      "Accumulates polarity weights across clean review tokens and squashes the raw sentiment score into a calibrated probability.",
    variableDefinitions: [
      { symbol: "tokens", meaning: "Cleaned lowercase words from user review" },
      { symbol: "w_t", meaning: "Learned sentiment polarity score for token t" },
      { symbol: "P(Positive)", meaning: "Calibrated likelihood review expresses positive sentiment" },
    ],
    numericalExample: {
      givenInputs: "Tokens: ['brilliant', 'loved', 'acting'], Weights: {'brilliant': 2.5, 'loved': 2.0, 'acting': 0.1}",
      stepByStepArithmetic: [
        "Sum token weights: 2.5 + 2.0 + 0.1 = +4.60",
        "Compute sigmoid denominator: 1 + e^(-4.60) = 1 + 0.01005 = 1.01005",
        "Compute probability: 1 / 1.01005 ≈ 0.990 (99.0%)",
        "Compare to threshold θ = 0.50 → High-confidence Positive classification",
      ],
      finalResult: "Sentiment Polarity: Positive (99.0% Confidence)",
    },
  },

  face_emotion_logits: {
    formulaName: "Facial Action Unit Logits & Softmax Probability",
    formulaLatex: "z_k = W_k \\cdot \\text{AU} + b_k, \\quad P(k) = \\frac{e^{z_k}}{\\sum_j e^{z_j}}",
    formulaExplanation:
      "Combines normalized facial muscle landmark displacements (AU) with learned emotion weights to compute mutually exclusive emotion class probabilities.",
    variableDefinitions: [
      { symbol: "AU", meaning: "Facial Action Units: [smile=0.85, brow=0.10, eyes=0.60, jaw=0.15]" },
      { symbol: "z_k", meaning: "Linear emotion logit for class k (Joy, Surprise, Anger)" },
      { symbol: "P(k)", meaning: "Softmax probability distribution over candidate emotions" },
    ],
    numericalExample: {
      givenInputs: "Observed face: Smile = 0.85, Brow furrow = 0.10, Eye aperture = 0.60, Jaw drop = 0.15",
      stepByStepArithmetic: [
        "Compute Joy logit: (3.5 × 0.85) - (2.0 × 0.10) + 0.20 = 2.975 - 0.20 + 0.20 = 2.975",
        "Compute Surprise logit: (2.8 × 0.60) + (3.0 × 0.15) - (1.5 × 0.10) = 1.68 + 0.45 - 0.15 = 1.980",
        "Compute Anger logit: (4.0 × 0.10) - (2.5 × 0.85) + 0.10 = 0.40 - 2.125 + 0.10 = -1.625",
        "Apply Softmax: e^2.975 ≈ 19.59, e^1.980 ≈ 7.24, e^(-1.625) ≈ 0.197 → Sum = 27.027",
        "Joy Probability: 19.59 / 27.027 ≈ 0.725 (72.5%)",
      ],
      finalResult: "Emotion Classification: Joy = 72.5%, Surprise = 26.8%, Anger = 0.7%",
    },
  },

  plant_disease_data_contract: {
    formulaName: "Plant Pathology Visual Contract & Target Isolation",
    formulaLatex: "f: \\mathcal{X} \\to \\mathcal{Y}, \\quad \\mathcal{X} \\subset \\mathbb{R}^4, \\; \\mathcal{Y} \\in \\{\\text{Healthy}, \\text{Blight}, \\text{Rust}\\}",
    formulaExplanation:
      "Explicitly specifies measurable botanical visual inputs (lesion area %, chlorosis discoloration, spot irregularity, moisture) predicting pathogen species without target leakage.",
    variableDefinitions: [
      { symbol: "X", meaning: "Observed canopy visual features: [lesion_area_pct, chlorosis_discoloration, spot_irregularity, moisture]" },
      { symbol: "Y", meaning: "Pathogen diagnostic outcome: Healthy, Powdery Mildew, Bacterial Blight, Rust Fungus" },
    ],
    numericalExample: {
      givenInputs: "Observed leaf: Lesion area = 42%, Chlorosis = 0.65, Spot irregularity = 0.40, Canopy moisture = 60%",
      stepByStepArithmetic: [
        "Validate input telemetry dimensions: exactly 4 quantitative visual signals",
        "Confirm target pathogen is isolated from input vectors (prevents target leakage)",
        "Map botanical feature space to discrete infection triage categories",
      ],
      finalResult: "Validated Visual Contract: f: ℝ^4 → Pathogen Class",
    },
  },

  plant_disease_vision_logits: {
    formulaName: "Plant Pathology Sigmoid Probability & Logit Scoring",
    formulaLatex: "z = \\sum_{i=1}^4 w_i x_i + b, \\quad P(\\text{Infected}) = \\frac{1}{1 + e^{-z}}",
    formulaExplanation:
      "Computes the weighted logit combination of necrotic lesion area, chlorosis halo, and spot boundary perimeter irregularity, squashing into a calibrated infection probability.",
    variableDefinitions: [
      { symbol: "x", meaning: "Normalized leaf symptoms: [lesion=0.45, chlorosis=0.65, irregularity=0.40]" },
      { symbol: "w", meaning: "Learned botanical risk weights: [2.40, 1.80, 1.20], Bias b = -1.60" },
      { symbol: "P(Infected)", meaning: "Calibrated likelihood of active fungal/bacterial blight" },
    ],
    numericalExample: {
      givenInputs: "Symptoms: Lesion area = 45% (x₁=0.45), Chlorosis = 0.65 (x₂=0.65), Irregularity = 0.40 (x₃=0.40)",
      stepByStepArithmetic: [
        "Calculate lesion contribution: 2.40 × 0.45 = 1.080",
        "Calculate chlorosis contribution: 1.80 × 0.65 = 1.170",
        "Calculate spot edge contribution: 1.20 × 0.40 = 0.480",
        "Sum contributions with bias: 1.080 + 1.170 + 0.480 - 1.60 = +1.130",
        "Compute sigmoid probability: 1 / (1 + e^(-1.130)) = 1 / (1 + 0.323) ≈ 0.7558 (75.6%)",
      ],
      finalResult: "Infection Probability: 75.6% (Action: Severe Blight Alert — Apply Bio-Fungicide)",
    },
  },
};

/**
 * Resolves a step-specific mathematical or data-flow walkthrough for any concept.
 * Strictly guarantees:
 * 1. Uses concept.workedExample if present (authentic domain scenario & numbers).
 * 2. Uses concept.goldenTest if present (strictly recorded inputs & outputs).
 * 3. Matches concept.id and semantic function against dedicated domain walkthroughs.
 * 4. NEVER falls back to generic linear regression for non-regression tasks.
 */
export function deriveStepSpecificMathWalkthrough(concept: Concept, goal?: string): DeepMathWalkthrough {
  const lowerGoal = (goal || "").toLowerCase();
  const lowerId = (concept.id || "").toLowerCase();
  const lowerTitle = (concept.title || "").toLowerCase();

  // 1. If concept already has deepMath, return it
  if (concept.deepMath) {
    return concept.deepMath;
  }

  // 2. If concept has a verified workedExample, synthesize a grounded walkthrough from it
  if (concept.workedExample && concept.workedExample.calculationSteps?.length > 0) {
    const ex = concept.workedExample;
    const cleanSteps = ex.calculationSteps.map((step) =>
      step.replace(/^(?:Step\s*\d+:?\s*|\d+\.\s*)/i, "")
    );

    let formulaLatex = "y = f(x)";
    if (lowerId.includes("token") || lowerTitle.includes("token")) {
      formulaLatex = "T = tokenize(s) = [words in s]";
    } else if (lowerId.includes("feature") || lowerTitle.includes("bag-of-words")) {
      formulaLatex = "Ratio(w) = freq(w, Class₁) / freq(w, Class₂)";
    } else if (lowerId.includes("prob") || lowerTitle.includes("prior")) {
      formulaLatex = "P(C) = N_C / N_total";
    } else if (lowerId.includes("bayes") || lowerTitle.includes("bayes")) {
      formulaLatex = "P(C | w) = [ P(w | C) · P(C) ] / P(w)";
    } else if (lowerId.includes("split") || lowerTitle.includes("split") || lowerTitle.includes("train")) {
      formulaLatex = "N_train = floor(N · (1 - r)),   N_test = N - N_train";
    } else if (lowerId.includes("matrix") || lowerTitle.includes("accuracy") || lowerTitle.includes("confusion")) {
      formulaLatex = "F₁ = 2 · (Precision · Recall) / (Precision + Recall)";
    } else if (lowerId.includes("scale") || lowerTitle.includes("scale") || lowerTitle.includes("normaliz")) {
      formulaLatex = "x_norm = (x - x_min) / (x_max - x_min)";
    } else if (lowerId.includes("mse") || lowerTitle.includes("squared error")) {
      formulaLatex = "MSE = (1/m) · ∑ (ŷ - y)²";
    }

    return {
      formulaName: `${concept.title} Calculation`,
      formulaLatex,
      formulaExplanation:
        ex.takeaway ||
        concept.explanationSummary ||
        concept.corePrinciple ||
        `Step-by-step arithmetic transformation verified for ${concept.title}.`,
      variableDefinitions: [
        { symbol: "Input", meaning: ex.scenario.slice(0, 80) },
        { symbol: "Result", meaning: ex.takeaway.slice(0, 80) },
      ],
      numericalExample: {
        givenInputs: ex.scenario,
        stepByStepArithmetic: cleanSteps,
        finalResult: ex.takeaway,
      },
    };
  }

  // 3. If concept has a verified goldenTest, ground strictly in recorded values
  if (concept.goldenTest) {
    const g = concept.goldenTest;
    const inpStr = typeof g.inputs === "object" ? JSON.stringify(g.inputs) : String(g.inputs);
    const outStr = typeof g.expectedOutput === "object" ? JSON.stringify(g.expectedOutput) : String(g.expectedOutput);
    const fnName = concept.id.replace(/-/g, "_");

    const isNonMath =
      lowerId.includes("token") ||
      lowerId.includes("load") ||
      lowerId.includes("read") ||
      lowerId.includes("spec") ||
      lowerId.includes("contract") ||
      lowerTitle.includes("contract") ||
      lowerTitle.includes("tokenize");

    if (isNonMath) {
      return {
        formulaName: `Data Flow: ${concept.title}`,
        formulaLatex: `D_{\\text{out}} = \\text{${fnName}}(D_{\\text{in}})`,
        formulaExplanation: `Data transformation flow: parses input structure into verified target schema without loss.`,
        variableDefinitions: [
          { symbol: "D_in", meaning: `Input buffer: ${inpStr}` },
          { symbol: "D_out", meaning: `Target output: ${outStr}` },
        ],
        numericalExample: {
          givenInputs: `Inputs: ${inpStr}`,
          stepByStepArithmetic: [
            `Ingest recorded input buffer ${inpStr}`,
            `Execute ${concept.title} transformation logic`,
            `Emit validated output structure matching reference ${outStr}`,
          ],
          finalResult: `Output = ${outStr}`,
        },
      };
    }

    return {
      formulaName: `${concept.title} Transformation`,
      formulaLatex: `y = f(x)`,
      formulaExplanation: `Grounded calculation for ${concept.title} verified against reference golden values.`,
      variableDefinitions: [
        { symbol: "x", meaning: `Input features (${inpStr})` },
        { symbol: "y", meaning: `Expected output (${outStr})` },
      ],
      numericalExample: {
        givenInputs: `Inputs: ${inpStr}`,
        stepByStepArithmetic: [
          `Ingest verified inputs ${inpStr}`,
          `Execute ${concept.title} transformation logic`,
          `Produce verified output matching golden expectation ${outStr}`,
        ],
        finalResult: `Output = ${outStr}`,
      },
    };
  }

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
      lowerGoal.includes("cancer") ||
      lowerGoal.includes("tumor") ||
      lowerGoal.includes("tumour") ||
      lowerGoal.includes("biopsy") ||
      lowerGoal.includes("malignan") ||
      lowerGoal.includes("oncolog") ||
      lowerGoal.includes("clinic") ||
      (lowerGoal.includes("disease") && !isPlantOrAgri) ||
      lowerGoal.includes("patient") ||
      (lowerGoal.includes("health") && !isPlantOrAgri) ||
      lowerGoal.includes("glucose") ||
      lowerGoal.includes("blood pressure") ||
      lowerGoal.includes("hypertension") ||
      (lowerGoal.includes("diagnosis") && !isPlantOrAgri));

  const isNLP =
    lowerGoal.includes("spam") ||
    lowerGoal.includes("email") ||
    lowerGoal.includes("text") ||
    lowerGoal.includes("nlp") ||
    lowerGoal.includes("sentiment") ||
    lowerGoal.includes("movie") ||
    lowerGoal.includes("review");

  const isEmotion =
    lowerGoal.includes("emotion") ||
    lowerGoal.includes("face") ||
    lowerGoal.includes("expression") ||
    lowerId.includes("emotion") ||
    lowerTitle.includes("facial");

  const isRecommender =
    lowerGoal.includes("recommend") ||
    lowerGoal.includes("movie") ||
    lowerGoal.includes("netflix") ||
    lowerGoal.includes("spotify") ||
    lowerGoal.includes("collaborative");

  const isObjectDetection =
    lowerGoal.includes("object detect") ||
    lowerGoal.includes("pedestrian") ||
    lowerGoal.includes("obstacle") ||
    lowerGoal.includes("self-driving") ||
    lowerGoal.includes("autonomous") ||
    lowerGoal.includes("yolo") ||
    lowerGoal.includes("bounding box") ||
    lowerGoal.includes("vehicle");

  const isCybersecurity =
    lowerGoal.includes("cyber") ||
    lowerGoal.includes("intrusion") ||
    lowerGoal.includes("ddos") ||
    lowerGoal.includes("packet") ||
    lowerGoal.includes("malware") ||
    lowerGoal.includes("firewall");

  const isCustomerChurn =
    lowerGoal.includes("churn") ||
    lowerGoal.includes("subscriber") ||
    lowerGoal.includes("retention") ||
    lowerGoal.includes("attrition");

  const isFakeNews =
    lowerGoal.includes("fake news") ||
    lowerGoal.includes("misinformation") ||
    lowerGoal.includes("clickbait") ||
    lowerGoal.includes("fact check");

  const isAudioOrSpeech =
    lowerGoal.includes("audio") ||
    lowerGoal.includes("speech") ||
    lowerGoal.includes("voice") ||
    lowerGoal.includes("sound") ||
    lowerGoal.includes("acoustic");

  const isFinanceOrFraud =
    lowerGoal.includes("fraud") ||
    lowerGoal.includes("credit card") ||
    lowerGoal.includes("transaction") ||
    lowerGoal.includes("bank") ||
    lowerGoal.includes("loan");

  const isRegressionDomain =
    lowerGoal.includes("price") ||
    lowerGoal.includes("house") ||
    lowerGoal.includes("real estate") ||
    lowerGoal.includes("stock") ||
    lowerGoal.includes("sales") ||
    lowerGoal.includes("demand") ||
    lowerGoal.includes("weather") ||

    lowerGoal.includes("forecast") ||
    lowerTitle.includes("regression");

  // Dedicated Plant & Agricultural Vision Step Mapping
  if (isPlantOrAgri) {
    if (lowerId === "problem-framing" || lowerTitle.includes("contract")) {
      return STANDARD_MATH_WALKTHROUGHS.plant_disease_data_contract;
    }
    if (lowerId === "feature-engineering" || lowerTitle.includes("scale") || lowerTitle.includes("normaliz")) {
      return STANDARD_MATH_WALKTHROUGHS.feature_scaling_min_max;
    }
    if (lowerId === "prior-probability" || lowerTitle.includes("prior") || lowerTitle.includes("base rate")) {
      return STANDARD_MATH_WALKTHROUGHS.class_prior_probabilities;
    }
    if (lowerId === "weights-scoring" || lowerTitle.includes("scoring") || lowerTitle.includes("logit")) {
      return STANDARD_MATH_WALKTHROUGHS.plant_disease_vision_logits;
    }
    if (lowerId === "loss-function" || lowerTitle.includes("loss") || lowerTitle.includes("cross-entropy")) {
      return STANDARD_MATH_WALKTHROUGHS.binary_cross_entropy;
    }
    if (lowerId === "gradient-descent" || lowerTitle.includes("gradient")) {
      return STANDARD_MATH_WALKTHROUGHS.gradient_descent_update;
    }
    if (lowerId === "decision-boundary" || lowerTitle.includes("threshold") || lowerTitle.includes("triage")) {
      return STANDARD_MATH_WALKTHROUGHS.decision_threshold_classification;
    }
    if (lowerId === "live-inference" || lowerTitle.includes("inference")) {
      return STANDARD_MATH_WALKTHROUGHS.plant_disease_vision_logits;
    }
    return STANDARD_MATH_WALKTHROUGHS.plant_disease_vision_logits;
  }

  // Dedicated Sentiment Analysis Step Mapping
  const isSentiment =
    lowerGoal.includes("sentiment") ||
    lowerGoal.includes("review") ||
    lowerId.includes("sentiment");

  if (isSentiment) {
    if (lowerId === "sentiment-preprocessing" || lowerTitle.includes("token") || lowerTitle.includes("preprocess")) {
      return STANDARD_MATH_WALKTHROUGHS.text_tokenization;
    }
    if (lowerId === "sentiment-vocabulary-weights" || lowerTitle.includes("vocabulary") || lowerTitle.includes("weight")) {
      return STANDARD_MATH_WALKTHROUGHS.sentiment_lexicon_scoring;
    }
    if (lowerId === "logistic-sigmoid-activation" || lowerTitle.includes("sigmoid")) {
      return STANDARD_MATH_WALKTHROUGHS.sigmoid_activation;
    }
    if (lowerId === "sentiment-pipeline-decision" || lowerTitle.includes("threshold")) {
      return STANDARD_MATH_WALKTHROUGHS.decision_threshold_classification;
    }
    if (lowerId === "evaluating-sentiment" || lowerTitle.includes("evaluat") || lowerTitle.includes("metric")) {
      return STANDARD_MATH_WALKTHROUGHS.confusion_matrix_metrics;
    }
    if (lowerId === "sentiment-live-deployment" || lowerTitle.includes("inference") || lowerTitle.includes("deploy")) {
      return STANDARD_MATH_WALKTHROUGHS.sentiment_lexicon_scoring;
    }
    return STANDARD_MATH_WALKTHROUGHS.sentiment_lexicon_scoring;
  }

  // 4. Dedicated Medical / Clinical Step Mapping
  if (isMedical) {
    if (lowerId === "problem-framing" || lowerTitle.includes("contract") || lowerTitle.includes("define the problem")) {
      return STANDARD_MATH_WALKTHROUGHS.clinical_data_contract;
    }
    if (lowerId === "feature-engineering" || lowerTitle.includes("dataset") || lowerTitle.includes("training dataset")) {
      return STANDARD_MATH_WALKTHROUGHS.clinical_feature_matrix;
    }
    if (lowerId.includes("scale") || lowerTitle.includes("standardiz") || lowerTitle.includes("scaling")) {
      return STANDARD_MATH_WALKTHROUGHS.feature_scaling_min_max;
    }
    if (lowerId === "model-architecture" || lowerTitle.includes("train a real ml model")) {
      return STANDARD_MATH_WALKTHROUGHS.clinical_risk_sigmoid;
    }
    if (
      lowerId === "decision-boundary" ||
      lowerId === "triage-threshold" ||
      lowerTitle.includes("held-out") ||
      lowerTitle.includes("threshold") ||
      lowerTitle.includes("triage")
    ) {
      return STANDARD_MATH_WALKTHROUGHS.clinical_triage_sensitivity;
    }
    if (lowerId === "live-inference" || lowerTitle.includes("inference")) {
      return STANDARD_MATH_WALKTHROUGHS.clinical_risk_sigmoid;
    }
  }

  // 5. Dedicated Facial Emotion Step Mapping
  if (isEmotion) {
    if (lowerId === "problem-framing" || lowerTitle.includes("contract")) {
      return STANDARD_MATH_WALKTHROUGHS.face_emotion_logits;
    }
    if (lowerId === "feature-engineering" || lowerTitle.includes("landmark") || lowerTitle.includes("geometry")) {
      return STANDARD_MATH_WALKTHROUGHS.face_emotion_logits;
    }
    if (lowerId === "prior-probability" || lowerTitle.includes("prior") || lowerTitle.includes("base rate")) {
      return STANDARD_MATH_WALKTHROUGHS.class_prior_probabilities;
    }
    if (lowerId === "weights-scoring" || lowerTitle.includes("logit")) {
      return STANDARD_MATH_WALKTHROUGHS.face_emotion_logits;
    }
    if (lowerId.includes("softmax") || lowerTitle.includes("softmax")) {
      return STANDARD_MATH_WALKTHROUGHS.softmax_activation;
    }
    if (lowerId === "loss-function" || lowerTitle.includes("loss") || lowerTitle.includes("cross-entropy")) {
      return STANDARD_MATH_WALKTHROUGHS.binary_cross_entropy;
    }
    if (lowerId === "gradient-descent" || lowerTitle.includes("gradient")) {
      return STANDARD_MATH_WALKTHROUGHS.gradient_descent_update;
    }
    if (lowerId === "decision-boundary" || lowerTitle.includes("evaluat") || lowerTitle.includes("threshold")) {
      return STANDARD_MATH_WALKTHROUGHS.confusion_matrix_metrics;
    }
    if (lowerId === "live-inference" || lowerTitle.includes("inference")) {
      return STANDARD_MATH_WALKTHROUGHS.softmax_activation;
    }
    return STANDARD_MATH_WALKTHROUGHS.face_emotion_logits;
  }

  // 6. Dedicated Recommender Systems Mapping
  if (isRecommender) {
    if (lowerId === "problem-framing" || lowerTitle.includes("contract")) {
      return STANDARD_MATH_WALKTHROUGHS.tabular_data_contract;
    }
    if (lowerId === "feature-engineering" || lowerTitle.includes("dataset") || lowerTitle.includes("matrix")) {
      return STANDARD_MATH_WALKTHROUGHS.recommender_cosine_similarity;
    }
    if (lowerId === "weights-scoring" || lowerTitle.includes("similarity") || lowerTitle.includes("cosine")) {
      return STANDARD_MATH_WALKTHROUGHS.recommender_cosine_similarity;
    }
    if (lowerId === "loss-function" || lowerTitle.includes("loss") || lowerTitle.includes("squared error")) {
      return STANDARD_MATH_WALKTHROUGHS.mean_squared_error;
    }
    if (lowerId === "decision-boundary" || lowerTitle.includes("evaluat")) {
      return STANDARD_MATH_WALKTHROUGHS.mean_squared_error;
    }
    return STANDARD_MATH_WALKTHROUGHS.recommender_cosine_similarity;
  }

  // 7. Dedicated Computer Vision / Autonomous Vehicle / Object Detection Mapping
  if (isObjectDetection) {
    if (lowerId === "problem-framing" || lowerTitle.includes("contract")) {
      return STANDARD_MATH_WALKTHROUGHS.object_detection_iou;
    }
    if (lowerId === "feature-engineering" || lowerTitle.includes("box") || lowerTitle.includes("bounding")) {
      return STANDARD_MATH_WALKTHROUGHS.object_detection_iou;
    }
    if (lowerId === "weights-scoring" || lowerTitle.includes("iou") || lowerTitle.includes("overlap")) {
      return STANDARD_MATH_WALKTHROUGHS.object_detection_iou;
    }
    if (lowerId === "loss-function" || lowerTitle.includes("loss")) {
      return STANDARD_MATH_WALKTHROUGHS.binary_cross_entropy;
    }
    if (lowerId === "decision-boundary" || lowerTitle.includes("evaluat") || lowerTitle.includes("threshold")) {
      return STANDARD_MATH_WALKTHROUGHS.confusion_matrix_metrics;
    }
    return STANDARD_MATH_WALKTHROUGHS.object_detection_iou;
  }

  // 8. Dedicated Cybersecurity / Intrusion Detection Mapping
  if (isCybersecurity) {
    if (lowerId === "problem-framing" || lowerTitle.includes("contract")) {
      return STANDARD_MATH_WALKTHROUGHS.tabular_data_contract;
    }
    if (lowerId === "feature-engineering" || lowerTitle.includes("traffic") || lowerTitle.includes("scale")) {
      return STANDARD_MATH_WALKTHROUGHS.feature_scaling_min_max;
    }
    if (lowerId === "prior-probability" || lowerTitle.includes("prior") || lowerTitle.includes("base rate")) {
      return STANDARD_MATH_WALKTHROUGHS.class_prior_probabilities;
    }
    if (lowerId === "weights-scoring" || lowerTitle.includes("anomaly") || lowerTitle.includes("score")) {
      return STANDARD_MATH_WALKTHROUGHS.cybersecurity_anomaly_score;
    }
    if (lowerId === "loss-function" || lowerTitle.includes("loss")) {
      return STANDARD_MATH_WALKTHROUGHS.binary_cross_entropy;
    }
    if (lowerId === "decision-boundary" || lowerTitle.includes("evaluat") || lowerTitle.includes("threshold")) {
      return STANDARD_MATH_WALKTHROUGHS.confusion_matrix_metrics;
    }
    return STANDARD_MATH_WALKTHROUGHS.cybersecurity_anomaly_score;
  }

  // 9. Dedicated Customer Churn Mapping
  if (isCustomerChurn) {
    if (lowerId === "problem-framing" || lowerTitle.includes("contract")) {
      return STANDARD_MATH_WALKTHROUGHS.tabular_data_contract;
    }
    if (lowerId === "feature-engineering" || lowerTitle.includes("scale") || lowerTitle.includes("normaliz")) {
      return STANDARD_MATH_WALKTHROUGHS.feature_scaling_min_max;
    }
    if (lowerId === "prior-probability" || lowerTitle.includes("prior") || lowerTitle.includes("base rate")) {
      return STANDARD_MATH_WALKTHROUGHS.class_prior_probabilities;
    }
    if (lowerId === "weights-scoring" || lowerTitle.includes("logit") || lowerTitle.includes("scoring")) {
      return STANDARD_MATH_WALKTHROUGHS.customer_churn_sigmoid;
    }
    if (lowerId === "loss-function" || lowerTitle.includes("loss") || lowerTitle.includes("cross-entropy")) {
      return STANDARD_MATH_WALKTHROUGHS.binary_cross_entropy;
    }
    if (lowerId === "decision-boundary" || lowerTitle.includes("evaluat") || lowerTitle.includes("threshold")) {
      return STANDARD_MATH_WALKTHROUGHS.confusion_matrix_metrics;
    }
    return STANDARD_MATH_WALKTHROUGHS.customer_churn_sigmoid;
  }

  // 10. Dedicated Audio & Voice Recognition Mapping
  if (isAudioOrSpeech) {
    if (lowerId === "problem-framing" || lowerTitle.includes("contract")) {
      return STANDARD_MATH_WALKTHROUGHS.tabular_data_contract;
    }
    if (lowerId === "feature-engineering" || lowerTitle.includes("spectrogram") || lowerTitle.includes("fft")) {
      return STANDARD_MATH_WALKTHROUGHS.audio_spectrogram_features;
    }
    if (lowerId === "weights-scoring" || lowerTitle.includes("scoring") || lowerTitle.includes("acoustic")) {
      return STANDARD_MATH_WALKTHROUGHS.audio_spectrogram_features;
    }
    if (lowerId === "loss-function" || lowerTitle.includes("loss")) {
      return STANDARD_MATH_WALKTHROUGHS.binary_cross_entropy;
    }
    if (lowerId === "decision-boundary" || lowerTitle.includes("evaluat")) {
      return STANDARD_MATH_WALKTHROUGHS.confusion_matrix_metrics;
    }
    return STANDARD_MATH_WALKTHROUGHS.audio_spectrogram_features;
  }

  // 11. Dedicated Fake News / Content Moderation Mapping
  if (isFakeNews) {
    if (lowerId === "problem-framing" || lowerTitle.includes("contract")) {
      return STANDARD_MATH_WALKTHROUGHS.text_tokenization;
    }
    if (lowerId === "feature-engineering" || lowerTitle.includes("vocabulary") || lowerTitle.includes("lexicon")) {
      return STANDARD_MATH_WALKTHROUGHS.sentiment_lexicon_scoring;
    }
    if (lowerId === "prior-probability" || lowerTitle.includes("prior")) {
      return STANDARD_MATH_WALKTHROUGHS.class_prior_probabilities;
    }
    if (lowerId === "weights-scoring" || lowerTitle.includes("scoring") || lowerTitle.includes("credibility")) {
      return STANDARD_MATH_WALKTHROUGHS.sentiment_lexicon_scoring;
    }
    if (lowerId === "decision-boundary" || lowerTitle.includes("evaluat") || lowerTitle.includes("threshold")) {
      return STANDARD_MATH_WALKTHROUGHS.confusion_matrix_metrics;
    }
    return STANDARD_MATH_WALKTHROUGHS.sentiment_lexicon_scoring;
  }

  // 11.5 Dedicated Financial Fraud & Transaction Risk Mapping
  if (isFinanceOrFraud) {
    if (lowerId === "problem-framing" || lowerTitle.includes("contract")) {
      return STANDARD_MATH_WALKTHROUGHS.tabular_data_contract;
    }
    if (lowerId === "feature-engineering" || lowerTitle.includes("scale") || lowerTitle.includes("amount")) {
      return STANDARD_MATH_WALKTHROUGHS.feature_scaling_min_max;
    }
    if (lowerId === "prior-probability" || lowerTitle.includes("prior") || lowerTitle.includes("base rate")) {
      return STANDARD_MATH_WALKTHROUGHS.class_prior_probabilities;
    }
    if (lowerId === "weights-scoring" || lowerTitle.includes("risk") || lowerTitle.includes("anomaly")) {
      return STANDARD_MATH_WALKTHROUGHS.cybersecurity_anomaly_score;
    }
    if (lowerId === "loss-function" || lowerTitle.includes("loss")) {
      return STANDARD_MATH_WALKTHROUGHS.binary_cross_entropy;
    }
    if (lowerId === "decision-boundary" || lowerTitle.includes("evaluat") || lowerTitle.includes("threshold")) {
      return STANDARD_MATH_WALKTHROUGHS.confusion_matrix_metrics;
    }
    return STANDARD_MATH_WALKTHROUGHS.cybersecurity_anomaly_score;
  }


  // 12. Dedicated Regression Domain Mapping
  if (isRegressionDomain) {
    if (lowerId === "problem-framing" || lowerTitle.includes("contract")) {
      return STANDARD_MATH_WALKTHROUGHS.tabular_data_contract;
    }
    if (lowerId === "feature-engineering" || lowerTitle.includes("dataset")) {
      return STANDARD_MATH_WALKTHROUGHS.tabular_feature_matrix;
    }
    return STANDARD_MATH_WALKTHROUGHS.mean_squared_error;
  }

  // 13. Dedicated General Tabular / Custom Step Mapping (Never show spam BoW on tabular projects)
  if (!isNLP && !isPlantOrAgri) {
    if (lowerId === "problem-framing" || lowerTitle.includes("contract") || lowerTitle.includes("define the problem")) {
      return STANDARD_MATH_WALKTHROUGHS.tabular_data_contract;
    }
    if (lowerId === "feature-engineering" || lowerTitle.includes("training dataset") || lowerTitle.includes("build the training dataset")) {
      return STANDARD_MATH_WALKTHROUGHS.tabular_feature_matrix;
    }
    if (lowerId === "model-architecture" || lowerTitle.includes("train a real ml model")) {
      return STANDARD_MATH_WALKTHROUGHS.binary_cross_entropy;
    }
    if (lowerId === "decision-boundary" || lowerTitle.includes("evaluat")) {
      return STANDARD_MATH_WALKTHROUGHS.confusion_matrix_metrics;
    }
    if (lowerId === "threshold-tuning" || lowerTitle.includes("threshold")) {
      return STANDARD_MATH_WALKTHROUGHS.decision_threshold_classification;
    }
    if (lowerId === "live-inference" || lowerTitle.includes("inference")) {
      return STANDARD_MATH_WALKTHROUGHS.sigmoid_activation;
    }
  }

  // 6. Exact Concept ID & Title Semantic Matching
  if (
    lowerId === "what-is-classification" ||
    (isNLP && (lowerId.includes("token") || lowerTitle.includes("token") || lowerTitle.includes("lexicon")))
  ) {
    return STANDARD_MATH_WALKTHROUGHS.text_tokenization;
  }

  if (
    lowerId === "features-from-text" ||
    lowerTitle.includes("bag-of-words") ||
    lowerTitle.includes("word count") ||
    (isNLP && lowerId.includes("feature"))
  ) {
    return STANDARD_MATH_WALKTHROUGHS.bag_of_words_frequency;
  }

  if (
    lowerId.includes("prior") ||
    lowerId === "probability-basics" ||
    lowerTitle.includes("base rate") ||
    lowerTitle.includes("prior prob")
  ) {
    return STANDARD_MATH_WALKTHROUGHS.class_prior_probabilities;
  }

  if (
    lowerId.includes("bayes-rule") ||
    (lowerTitle.includes("bayes") && lowerTitle.includes("rule")) ||
    lowerTitle.includes("posterior")
  ) {
    return STANDARD_MATH_WALKTHROUGHS.bayes_posterior_theorem;
  }

  if (
    lowerId.includes("naive-bayes") ||
    lowerId.includes("smooth") ||
    lowerTitle.includes("naive bayes") ||
    lowerTitle.includes("smoothing")
  ) {
    return STANDARD_MATH_WALKTHROUGHS.naive_bayes_laplace;
  }

  if (
    lowerId.includes("split") ||
    lowerId.includes("train") ||
    lowerTitle.includes("split") ||
    lowerTitle.includes("training vs testing")
  ) {
    return STANDARD_MATH_WALKTHROUGHS.train_test_split;
  }

  if (
    lowerId.includes("matrix") ||
    lowerId.includes("accuracy") ||
    lowerTitle.includes("confusion matrix") ||
    lowerTitle.includes("precision")
  ) {
    return STANDARD_MATH_WALKTHROUGHS.confusion_matrix_metrics;
  }

  if (
    lowerId.includes("pixel") ||
    lowerId === "pixels-to-vectors" ||
    lowerTitle.includes("flatten") ||
    lowerTitle.includes("pixel")
  ) {
    return STANDARD_MATH_WALKTHROUGHS.pixel_flattening_normalization;
  }

  if (lowerId.includes("relu") || lowerTitle.includes("relu")) {
    return STANDARD_MATH_WALKTHROUGHS.relu_activation;
  }

  if (lowerId.includes("attention") || lowerTitle.includes("attention")) {
    return STANDARD_MATH_WALKTHROUGHS.scaled_dot_product_attention;
  }

  if (lowerId.includes("scale") || lowerTitle.includes("feature scaling") || lowerTitle.includes("normaliz")) {
    return STANDARD_MATH_WALKTHROUGHS.feature_scaling_min_max;
  }

  if (lowerId.includes("mse") || lowerTitle.includes("mean squared") || lowerTitle.includes("regression")) {
    return STANDARD_MATH_WALKTHROUGHS.mean_squared_error;
  }

  if (lowerId.includes("activation") || lowerTitle.includes("sigmoid")) {
    return STANDARD_MATH_WALKTHROUGHS.sigmoid_activation;
  }

  if (lowerTitle.includes("softmax") || lowerTitle.includes("multi-class")) {
    return STANDARD_MATH_WALKTHROUGHS.softmax_activation;
  }

  if (lowerId.includes("loss") || lowerTitle.includes("loss") || lowerTitle.includes("cross-entropy")) {
    return STANDARD_MATH_WALKTHROUGHS.binary_cross_entropy;
  }

  if (
    lowerId.includes("threshold") ||
    lowerTitle.includes("boundary") ||
    lowerTitle.includes("boundaries") ||
    lowerTitle.includes("threshold")
  ) {
    return STANDARD_MATH_WALKTHROUGHS.decision_threshold_classification;
  }

  // 5. Domain Category Fallback (Safe & contextual, never generic regression for non-regression tasks)
  if (lowerGoal.includes("spam") || lowerGoal.includes("email") || lowerGoal.includes("text") || lowerGoal.includes("nlp")) {
    return STANDARD_MATH_WALKTHROUGHS.naive_bayes_laplace;
  }

  if (lowerGoal.includes("digit") || lowerGoal.includes("vision") || lowerGoal.includes("mnist") || lowerGoal.includes("image")) {
    return STANDARD_MATH_WALKTHROUGHS.pixel_flattening_normalization;
  }

  if (lowerGoal.includes("chatgpt") || lowerGoal.includes("gpt") || lowerGoal.includes("llm") || lowerGoal.includes("transformer")) {
    return STANDARD_MATH_WALKTHROUGHS.scaled_dot_product_attention;
  }

  if (lowerGoal.includes("house") || lowerGoal.includes("real estate") || lowerGoal.includes("price") || lowerGoal.includes("stock")) {
    return STANDARD_MATH_WALKTHROUGHS.mean_squared_error;
  }

  // Default: Linear combination only if linear score is explicitly relevant
  return STANDARD_MATH_WALKTHROUGHS.linear_combination;
}

/**
 * Synthesizes a pedagogically sound 4-choice intuition check question
 * for any concept that does not already possess one.
 */
export function deriveConceptCheckQuestion(
  concept: Concept,
  goal?: string
): {
  prompt: string;
  options: string[];
  correctIndex: number;
  explanation: string;
} {
  if (concept.predictQuestion) {
    return concept.predictQuestion;
  }
  if (concept.checkQuestion) {
    return concept.checkQuestion;
  }

  const lowerGoal = (goal || "").toLowerCase();
  const lowerId = (concept.id || "").toLowerCase();
  const lowerTitle = (concept.title || "").toLowerCase();

  // 1. Preprocessing, tokenization, or normalization
  if (
    lowerId.includes("preprocess") ||
    lowerId.includes("clean") ||
    lowerId.includes("token") ||
    lowerId.includes("normaliz") ||
    lowerTitle.includes("clean") ||
    lowerTitle.includes("normaliz") ||
    lowerTitle.includes("token") ||
    lowerTitle.includes("pixel")
  ) {
    return {
      prompt: `In the "${concept.title}" stage, why is standardizing and cleaning raw inputs vital before model computation?`,
      options: [
        "It eliminates erratic noise, scales features into a uniform numerical range, and prevents numerical instability during scoring.",
        "It encrypts private data strings so the GPU cannot read them.",
        "It forces the model to achieve 100% test accuracy on any dataset.",
        "Because Python dictionaries can only accept lowercase keys."
      ],
      correctIndex: 0,
      explanation: "Input normalization and standardization produce a stable, comparable feature representation essential for gradient learning and calibration."
    };
  }

  // 2. Weights, dot product, linear combinations, feature scoring
  if (
    lowerId.includes("weight") ||
    lowerId.includes("linear") ||
    lowerId.includes("dot") ||
    lowerId.includes("score") ||
    lowerTitle.includes("weight") ||
    lowerTitle.includes("linear") ||
    lowerTitle.includes("score") ||
    lowerTitle.includes("vector")
  ) {
    return {
      prompt: `In "${concept.title}", what does the mathematical dot product z = ∑ (wᵢ · xᵢ) + b represent intuitively?`,
      options: [
        "A weighted sum that measures how strongly the input feature pattern aligns with the model's learned positive template.",
        "A random number generator used to seed neural network initializations.",
        "A compression algorithm that reduces files to zero bytes.",
        "A sorting algorithm that arranges tokens alphabetically."
      ],
      correctIndex: 0,
      explanation: "Multiplying input features by learned weights accumulates evidence: features with large positive weights amplify the final confidence score."
    };
  }

  // 3. Sigmoid, activation, probabilities
  if (
    lowerId.includes("sigmoid") ||
    lowerId.includes("activation") ||
    lowerId.includes("calibrat") ||
    lowerTitle.includes("sigmoid") ||
    lowerTitle.includes("activation") ||
    lowerTitle.includes("probability")
  ) {
    return {
      prompt: `In "${concept.title}", why do we pass raw score z into an activation function like Sigmoid σ(z) = 1 / (1 + e^(-z))?`,
      options: [
        "It squashes any real-valued score from (-∞, +∞) smoothly into a calibrated probability between 0.0 and 1.0.",
        "It rounds floating point numbers into integers to reduce memory usage.",
        "It removes all false positive errors from the training dataset.",
        "It prevents the user interface from reloading."
      ],
      correctIndex: 0,
      explanation: "Sigmoids map unbounded linear scores into valid, calibrated probabilities in [0.0, 1.0], enabling thresholding and probabilistic interpretation."
    };
  }

  // 4. Softmax, multiclass
  if (
    lowerId.includes("softmax") ||
    lowerTitle.includes("softmax") ||
    lowerTitle.includes("multiclass")
  ) {
    return {
      prompt: `In "${concept.title}", what fundamental mathematical property does Softmax enforce across class scores?`,
      options: [
        "All class probabilities become non-negative and sum to exactly 1.0 (100%), forming a valid probability distribution.",
        "The highest score is multiplied by 10 while other scores are deleted.",
        "Every class probability is forced to be equal to 0.10.",
        "It inverts all negative logits into positive whole numbers."
      ],
      correctIndex: 0,
      explanation: "Softmax exponentiates and divides by the sum of exponentials, ensuring ∑ P(y=k) = 1.0 across all mutually exclusive classes."
    };
  }

  // 5. Loss, cross-entropy, error, optimization
  if (
    lowerId.includes("loss") ||
    lowerId.includes("entropy") ||
    lowerId.includes("gradient") ||
    lowerId.includes("optim") ||
    lowerTitle.includes("loss") ||
    lowerTitle.includes("gradient") ||
    lowerTitle.includes("error")
  ) {
    return {
      prompt: `In "${concept.title}", what is the primary role of the objective loss function?`,
      options: [
        "To mathematically quantify the discrepancy between model predictions and ground-truth targets, guiding gradient updates.",
        "To randomly discard training data that took too long to compute.",
        "To prevent Python from executing while testing is active.",
        "To measure how fast the computer's CPU clock is running."
      ],
      correctIndex: 0,
      explanation: "A loss function measures error magnitude and direction, providing the gradient slope that optimization algorithms descend."
    };
  }

  // 6. Evaluation, accuracy, confusion matrix, metrics
  if (
    lowerId.includes("eval") ||
    lowerId.includes("accur") ||
    lowerId.includes("matrix") ||
    lowerId.includes("metric") ||
    lowerTitle.includes("evaluat") ||
    lowerTitle.includes("accuracy") ||
    lowerTitle.includes("matrix")
  ) {
    return {
      prompt: `In "${concept.title}", why must model evaluation be conducted on a held-out test split rather than the training data?`,
      options: [
        "To assess true generalization on unseen samples and verify the model didn't merely memorize the training set (overfitting).",
        "Because Python deletes training data automatically upon running.",
        "Test sets run 10x faster because weights are frozen.",
        "To reduce network bandwidth consumption."
      ],
      correctIndex: 0,
      explanation: "Held-out test evaluations measure true out-of-sample generalization, safeguarding against misleading overfitted scores."
    };
  }

  // 7. General concept fallback derived from hook and explanationSummary
  return {
    prompt: `For the concept "${concept.title}", which of the following best reflects the core principle?`,
    options: [
      concept.explanationSummary
        ? `${concept.explanationSummary.slice(0, 120)}...`
        : `It translates input domain features into mathematically structured representations for reliable prediction.`,
      "It bypasses numerical computation and guesses outcomes based on file names.",
      "It requires retraining from scratch for every individual test inference.",
      "It is only applicable when training data contains fewer than 10 samples."
    ],
    correctIndex: 0,
    explanation: concept.hook || "Machine learning systems translate domain problems into rigorous mathematical pipelines."
  };
}

/**
 * Enriches any concept with deep ML/DL theory, jargon busters,
 * concrete step-by-step arithmetic, and guaranteed intuition check questions.
 */
export function enrichConceptWithDeepTheory(concept: Concept, goal?: string): Concept {
  const lowerGoal = (goal || "").toLowerCase();
  const lowerId = (concept.id || "").toLowerCase();
  const lowerTitle = (concept.title || "").toLowerCase();

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
      lowerGoal.includes("cancer") ||
      lowerGoal.includes("tumor") ||
      lowerGoal.includes("tumour") ||
      lowerGoal.includes("biopsy") ||
      lowerGoal.includes("malignan") ||
      lowerGoal.includes("oncolog") ||
      lowerGoal.includes("clinic") ||
      (lowerGoal.includes("disease") && !isPlantOrAgri) ||
      lowerGoal.includes("patient") ||
      (lowerGoal.includes("health") && !isPlantOrAgri) ||
      lowerGoal.includes("glucose") ||
      lowerGoal.includes("blood pressure") ||
      lowerGoal.includes("hypertension") ||
      (lowerGoal.includes("diagnosis") && !isPlantOrAgri));

  const isRegression =
    lowerGoal.includes("real estate") ||
    lowerGoal.includes("house") ||
    lowerGoal.includes("housing") ||
    lowerGoal.includes("price") ||
    lowerGoal.includes("stock") ||
    lowerTitle.includes("regression");

  // Derive guaranteed check question
  const fallbackCheck = deriveConceptCheckQuestion(concept, goal);
  const resolvedPredict = concept.predictQuestion || concept.checkQuestion || fallbackCheck;
  const resolvedCheck = concept.checkQuestion || concept.predictQuestion || fallbackCheck;

  // If Python track concept, leave technicalTerms and deepMath untouched (do not inject ML math)
  if (lowerId.startsWith("python-")) {
    return {
      ...concept,
      technicalTerms: concept.technicalTerms || [],
      deepMath: concept.deepMath,
      predictQuestion: resolvedPredict,
      checkQuestion: resolvedCheck,
    };
  }

  // If already populated, return existing with guaranteed predict & check questions
  if (concept.technicalTerms && concept.technicalTerms.length > 0 && concept.deepMath) {
    return {
      ...concept,
      predictQuestion: resolvedPredict,
      checkQuestion: resolvedCheck,
    };
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

  // Derive concept-specific math walkthrough grounded in worked example or golden test
  const mathWalkthrough = deriveStepSpecificMathWalkthrough(concept, goal);

  return {
    ...concept,
    technicalTerms: concept.technicalTerms || terms,
    deepMath: concept.deepMath || mathWalkthrough,
    predictQuestion: resolvedPredict,
    checkQuestion: resolvedCheck,
  };
}
