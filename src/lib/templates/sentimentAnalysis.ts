import { Concept, ConceptEdge, DiagnosticQuestion } from "../types";

export const SENTIMENT_ANALYSIS_CONCEPTS: Concept[] = [
  {
    id: "sentiment-preprocessing",
    title: "Text Normalization & Sentiment Tokens",
    prereqs: [],
    difficulty: 1,
    hook: "In movie reviews, how does a computer know that 'LOVED IT!!!' and 'loved it' express the exact same glowing sentiment?",
    explanationSummary:
      "Raw user text contains erratic punctuation, casing, and stop words. Lowercasing, punctuation stripping, and tokenization standardize arbitrary human reviews into comparable word tokens.",
    buildStep: "Clean raw movie reviews by lowercasing, stripping punctuation, and removing irrelevant stop words.",
    starterCode: `# Step 1: Sentiment Text Cleaning
STOPWORDS = {"the", "a", "an", "is", "it", "this", "was"}

def clean_review(text):
    """
    Cleans lowercase tokens and removes stop words.
    """
    # TODO: Lowercase text and split into words
    words = text.lower().replace("!", "").replace(".", "").split()
    # TODO: Filter out words present in STOPWORDS
    filtered = [w for w in words if w not in STOPWORDS]
    return filtered

review = "This movie was absolutely brilliant! Loved it."
print("Cleaned tokens:", clean_review(review))
`,
    solutionCode: `STOPWORDS = {"the", "a", "an", "is", "it", "this", "was"}

def clean_review(text):
    words = text.lower().replace("!", "").replace(".", "").split()
    filtered = [w for w in words if w not in STOPWORDS]
    return filtered
`,
    testAssertion: `tokens = clean_review("This was fantastic!")
assert "fantastic" in tokens and "this" not in tokens and "was" not in tokens
print("Assertion Passed: Sentiment text preprocessing verified!")
`
  },
  {
    id: "sentiment-vocabulary-weights",
    title: "Sentiment Lexicon & Feature Weights",
    prereqs: ["sentiment-preprocessing"],
    difficulty: 2,
    hook: "Words like 'masterpiece' strongly signal praise (+3.0), while 'boring' signals dislike (-2.5). How do we quantify an entire sentence?",
    explanationSummary:
      "A sentiment model assigns a learned polarity weight to each word in the vocabulary. Summing the weights of words appearing in a review gives an unnormalized sentiment affinity score.",
    buildStep: "Compute the total sentiment score by accumulating vocabulary weights across tokens.",
    starterCode: `# Step 2: Vocabulary Weight Scoring
SENTIMENT_WEIGHTS = {
    "brilliant": 2.5, "loved": 2.0, "masterpiece": 3.0, "great": 1.5,
    "boring": -2.0, "waste": -2.5, "terrible": -3.0, "dull": -1.5
}

def score_sentiment(tokens, weights):
    score = 0.0
    for t in tokens:
        # TODO: Add weight for token t, default to 0.0 if not found
        score += weights.get(t, ___)
    return score

sample = ["loved", "acting", "masterpiece"]
print("Score:", score_sentiment(sample, SENTIMENT_WEIGHTS))
`,
    solutionCode: `SENTIMENT_WEIGHTS = {
    "brilliant": 2.5, "loved": 2.0, "masterpiece": 3.0, "great": 1.5,
    "boring": -2.0, "waste": -2.5, "terrible": -3.0, "dull": -1.5
}

def score_sentiment(tokens, weights):
    score = 0.0
    for t in tokens:
        score += weights.get(t, 0.0)
    return score
`,
    testAssertion: `w = {"good": 1.0, "bad": -1.0}
assert score_sentiment(["good", "good"], w) == 2.0
assert score_sentiment(["bad", "unknown"], w) == -1.0
print("Assertion Passed: Sentiment scoring verified!")
`
  },
  {
    id: "logistic-sigmoid-activation",
    title: "Sigmoidal Probability Calibration",
    prereqs: ["sentiment-vocabulary-weights"],
    difficulty: 3,
    hook: "A review gets a raw score of +4.2. How do you convert that arbitrary number into an exact 0% to 100% confidence percentage?",
    explanationSummary:
      "The Sigmoid function σ(z) = 1 / (1 + e^(-z)) maps any real number from -∞ to +∞ smoothly into a valid probability between 0.0 (Negative) and 1.0 (Positive).",
    buildStep: "Implement the mathematical sigmoid activation function.",
    starterCode: `# Step 3: Sigmoid Function
import math

def sigmoid(z):
    """
    Maps real score z to [0.0, 1.0] probability
    """
    # TODO: 1.0 / (1.0 + math.exp(-z))
    return 1.0 / (1.0 + math.exp(___))

print("Score +4.2 -> Probability:", round(sigmoid(4.2), 4))
print("Score -4.2 -> Probability:", round(sigmoid(-4.2), 4))
print("Score 0.0  -> Probability:", round(sigmoid(0.0), 4))
`,
    solutionCode: `import math

def sigmoid(z):
    return 1.0 / (1.0 + math.exp(-z))
`,
    testAssertion: `assert abs(sigmoid(0) - 0.5) < 1e-4, "sigmoid(0) must be 0.5"
assert sigmoid(10) > 0.99, "sigmoid(10) should be near 1.0"
assert sigmoid(-10) < 0.01, "sigmoid(-10) should be near 0.0"
print("Assertion Passed: Sigmoid probability calibration verified!")
`
  },
  {
    id: "sentiment-pipeline-decision",
    title: "End-to-End Sentiment Classifier",
    prereqs: ["logistic-sigmoid-activation"],
    difficulty: 3,
    hook: "Can our complete sentiment model read any arbitrary film review and correctly classify it as Positive or Negative with confidence?",
    explanationSummary:
      "By chaining preprocessing, feature weighting, and sigmoid activation, we produce a complete sentiment inference pipeline capable of processing real-world feedback in real time.",
    buildStep: "Assemble the complete sentiment classifier that returns label and confidence percentage.",
    starterCode: `# Step 4: Complete Sentiment Classifier Pipeline
def classify_review_sentiment(raw_text, weights, threshold=0.5):
    tokens = clean_review(raw_text)
    z = score_sentiment(tokens, weights)
    prob_positive = sigmoid(z)
    
    # TODO: Set label to "Positive" if prob_positive >= threshold else "Negative"
    label = "Positive" if prob_positive >= ___ else "Negative"
    return {
        "label": label,
        "positive_confidence": prob_positive,
        "tokens": tokens
    }

w = {"amazing": 2.0, "brilliant": 2.5, "awful": -3.0, "boring": -2.0}
print(classify_review_sentiment("The cinematography was brilliant and amazing!", w))
print(classify_review_sentiment("An awful and boring film.", w))
`,
    solutionCode: `def classify_review_sentiment(raw_text, weights, threshold=0.5):
    tokens = clean_review(raw_text)
    z = score_sentiment(tokens, weights)
    prob_positive = sigmoid(z)
    label = "Positive" if prob_positive >= threshold else "Negative"
    return {
        "label": label,
        "positive_confidence": prob_positive,
        "tokens": tokens
    }
`,
    testAssertion: `w = {"great": 2.0, "bad": -2.0}
res_pos = classify_review_sentiment("great movie", w)
res_neg = classify_review_sentiment("bad movie", w)
assert res_pos["label"] == "Positive"
assert res_neg["label"] == "Negative"
print("Assertion Passed: Full sentiment classification pipeline operational!")
`
  }
];

export const SENTIMENT_ANALYSIS_EDGES: ConceptEdge[] = [
  { from: "sentiment-preprocessing", to: "sentiment-vocabulary-weights" },
  { from: "sentiment-vocabulary-weights", to: "logistic-sigmoid-activation" },
  { from: "logistic-sigmoid-activation", to: "sentiment-pipeline-decision" }
];

export const SENTIMENT_DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: "diag-sentiment-1",
    targetConceptId: "sentiment-preprocessing",
    question: "Why do sentiment analysis models commonly remove 'stop words' like 'the', 'is', and 'at' during text preprocessing?",
    options: [
      {
        text: "They appear frequently in both positive and negative reviews and carry almost zero sentiment signal.",
        isCorrect: true,
        errorType: "NONE"
      },
      {
        text: "Computer operating systems crash if words have fewer than 3 letters.",
        isCorrect: false,
        errorType: "TERMINOLOGY_CONFUSION",
        rationale: "Operating systems handle strings of any length; stop words are removed for ML feature compactness."
      },
      {
        text: "Stop words are secretly encrypted malware signatures.",
        isCorrect: false,
        errorType: "OVERCONFIDENT_MISCONCEPTION",
        rationale: "Stop words are standard grammatical articles and prepositions."
      },
      {
        text: "Machine learning models only understand uppercase words.",
        isCorrect: false,
        errorType: "CONCEPTUAL_GAP",
        rationale: "Models process numbers; lowercasing is standard practice to normalize vocabulary."
      }
    ]
  },
  {
    id: "diag-sentiment-2",
    targetConceptId: "logistic-sigmoid-activation",
    question: "What is the primary role of the Sigmoid function in binary classification?",
    options: [
      {
        text: "It maps an unbounded linear score into a smooth probability between 0.0 and 1.0.",
        isCorrect: true,
        errorType: "NONE"
      },
      {
        text: "It increases the font size of the output text on screen.",
        isCorrect: false,
        errorType: "TERMINOLOGY_CONFUSION",
        rationale: "Sigmoid is a mathematical transformation, not a UI styling function."
      },
      {
        text: "It guarantees that the model will never make a prediction error.",
        isCorrect: false,
        errorType: "OVERCONFIDENT_MISCONCEPTION",
        rationale: "Sigmoid provides calibrated probabilities, not perfection."
      },
      {
        text: "It converts text strings into audio speech.",
        isCorrect: false,
        errorType: "CONCEPTUAL_GAP",
        rationale: "Speech synthesis uses acoustic models, not binary sigmoid activation."
      }
    ]
  }
];
