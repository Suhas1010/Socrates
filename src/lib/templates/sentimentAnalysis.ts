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
    predictQuestion: {
      prompt: "Why do we lowercase text and remove common stop words ('is', 'the', 'it') before scoring sentiment?",
      options: [
        "Stop words carry minimal sentiment polarity, while casing variations ('LOVED' vs 'loved') should map to the exact same lexicon weight.",
        "Because Python can only store lowercase strings in dictionaries.",
        "Because sentiment words are only valid if punctuation is converted to numbers.",
        "To reduce review accuracy so the classifier runs in faster time."
      ],
      correctIndex: 0,
      explanation: "Normalizing text ensures words like 'LOVED' and 'loved' share one lexicon weight, while neutral stop words don't dilute the sentiment signal."
    },
    checkQuestion: {
      prompt: "If a raw review is 'Loved it! Absolutely LOVED it.', what is the cleaned token list after lowercasing, stripping punctuation, and removing stop words {'it'}?",
      options: [
        "['loved', 'absolutely', 'loved']",
        "['Loved', 'it!', 'Absolutely', 'LOVED', 'it.']",
        "['loved', 'it']",
        "[] (empty list)"
      ],
      correctIndex: 0,
      explanation: "Punctuation is removed, all tokens are lowercased, and 'it' is filtered out as a stop word, leaving ['loved', 'absolutely', 'loved']."
    },
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
    predictQuestion: {
      prompt: "If a review contains 'loved' (+2.0), 'acting' (0.0), and 'masterpiece' (+3.0), what is its accumulated sentiment score?",
      options: [
        "+5.0, because the unnormalized polarity is the sum of vocabulary weights: 2.0 + 0.0 + 3.0",
        "-1.0, because words cancel each other out randomly",
        "0.0, because unweighted words zero out the entire phrase",
        "+6.0, because positive words are automatically multiplied by each other"
      ],
      correctIndex: 0,
      explanation: "A lexicon scorer accumulates weights for all known tokens. Words not in the lexicon default to 0.0 polarity, giving 2.0 + 0.0 + 3.0 = +5.0."
    },
    checkQuestion: {
      prompt: "What happens if a review contains words like 'cinematography' or 'director' that are NOT present in our sentiment dictionary?",
      options: [
        "They safely default to 0.0 weight, neither increasing nor decreasing the sentiment score.",
        "The entire program raises a fatal KeyError crash.",
        "The model automatically assumes the review is 100% negative.",
        "The score is multiplied by -1.0."
      ],
      correctIndex: 0,
      explanation: "Using dict.get(token, 0.0) ensures uncatalogued tokens contribute neutral (0.0) weight without breaking scoring."
    },
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
    predictQuestion: {
      prompt: "What does the sigmoid function σ(z) = 1 / (1 + e^(-z)) output when the input raw score z is 0.0?",
      options: [
        "0.5 (representing an even 50% split / maximum uncertainty between Positive and Negative)",
        "0.0 (representing 0% probability)",
        "1.0 (representing 100% certainty)",
        "-1.0 (representing negative sentiment)"
      ],
      correctIndex: 0,
      explanation: "When z = 0, e^(-0) = 1, so σ(0) = 1 / (1 + 1) = 0.5. A zero net score represents neutrality or 50% probability."
    },
    checkQuestion: {
      prompt: "As the raw score z becomes an extremely large positive number (e.g. z = +10.0), what value does σ(z) approach?",
      options: [
        "1.0 (approaching 100% positive probability asymptotically)",
        "+∞ (unbounded linear growth)",
        "0.0 (inverting to negative)",
        "0.5 (neutrality)"
      ],
      correctIndex: 0,
      explanation: "As z → +∞, e^(-z) → 0, meaning σ(z) → 1.0. Large positive scores saturate near 1.0 certainty."
    },
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
    predictQuestion: {
      prompt: "If a sentiment classifier calculates prob_positive = 0.82 with a standard decision threshold of 0.5, what label and confidence should it assign?",
      options: [
        "Positive with 82.0% confidence, because 0.82 >= 0.50 threshold",
        "Negative with 18.0% confidence, because scores above 0.5 invert",
        "Neutral with 0% confidence, because it is not exactly 1.0",
        "Reject review, because probability must be an integer"
      ],
      correctIndex: 0,
      explanation: "Probabilities at or above the 0.5 decision threshold map directly to the positive class, with the calibrated probability serving as confidence."
    },
    checkQuestion: {
      prompt: "If the calculated prob_positive is 0.15 with a threshold of 0.5, what is the negative sentiment confidence percentage?",
      options: [
        "85.0% (1.0 - 0.15 = 0.85)",
        "15.0%",
        "50.0%",
        "0.0%"
      ],
      correctIndex: 0,
      explanation: "For binary classification, P(Negative) = 1.0 - P(Positive) = 1.0 - 0.15 = 0.85 (85.0% confidence)."
    },
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
  },
  {
    id: "evaluating-sentiment",
    title: "Evaluating Accuracy & Confusion Matrix",
    prereqs: ["sentiment-pipeline-decision"],
    difficulty: 3,
    hook: "How do we verify whether our sentiment model genuinely understands new reviews rather than lucky guesses? We evaluate accuracy on a held-out test collection.",
    explanationSummary:
      "Accuracy measures the proportion of correct predictions across all evaluated reviews: Accuracy = correct / total. Tracking mistakes identifies missing vocabulary.",
    predictQuestion: {
      prompt: "If your sentiment model correctly classifies 18 out of 20 test reviews, what is its test accuracy?",
      options: [
        "90% (18 / 20 = 0.90)",
        "18%, because accuracy equals the raw count of correct items",
        "80% (20 - 18 = 2 lost percentage points)",
        "95%, because false negatives are ignored"
      ],
      correctIndex: 0,
      explanation: "Classification accuracy is strictly calculated as (correct predictions) / (total predictions) = 18 / 20 = 0.90 (90%)."
    },
    checkQuestion: {
      prompt: "Why should model evaluation always be performed on unseen test reviews rather than the training reviews?",
      options: [
        "To ensure the model has generalized learned patterns rather than simply memorizing the training dataset (overfitting).",
        "Because Python deletes training data automatically after scoring.",
        "Test sets run 10x faster on CPU cores.",
        "Unseen reviews are required by the HTTP standard."
      ],
      correctIndex: 0,
      explanation: "Testing on held-out reviews tests true generalization, ensuring the model performs reliably on real future inputs."
    },
    buildStep: "Implement evaluate_accuracy to measure prediction accuracy across a labeled test dataset.",
    starterCode: `# Step 5: Test Corpus Evaluation
test_reviews = [
    ("This was brilliant and great", "Positive"),
    ("Boring, dull, total waste of time", "Negative"),
    ("Loved every single minute", "Positive"),
    ("Terrible acting and awful script", "Negative"),
]

weights = {
    "brilliant": 2.5, "great": 1.5, "loved": 2.0,
    "boring": -2.0, "dull": -1.5, "waste": -2.5, "terrible": -3.0, "awful": -3.0
}

def evaluate_accuracy(dataset, weights):
    correct = 0
    for text, true_label in dataset:
        result = classify_review_sentiment(text, weights)
        # TODO: Check if result["label"] matches true_label
        if result["label"] == ___:
            correct += 1
    return correct / len(dataset)

print("Test Accuracy:", evaluate_accuracy(test_reviews, weights))
`,
    solutionCode: `test_reviews = [
    ("This was brilliant and great", "Positive"),
    ("Boring, dull, total waste of time", "Negative"),
    ("Loved every single minute", "Positive"),
    ("Terrible acting and awful script", "Negative"),
]

weights = {
    "brilliant": 2.5, "great": 1.5, "loved": 2.0,
    "boring": -2.0, "dull": -1.5, "waste": -2.5, "terrible": -3.0, "awful": -3.0
}

def evaluate_accuracy(dataset, weights):
    correct = 0
    for text, true_label in dataset:
        result = classify_review_sentiment(text, weights)
        if result["label"] == true_label:
            correct += 1
    return correct / len(dataset)
`,
    testAssertion: `acc = evaluate_accuracy(test_reviews, weights)
assert acc == 1.0, f"Expected 1.0 accuracy on clean test reviews, got {acc}"
print("Assertion Passed: Sentiment accuracy evaluation verified!")
`
  },
  {
    id: "sentiment-live-deployment",
    title: "Live Sentiment Inference Endpoint",
    prereqs: ["evaluating-sentiment"],
    difficulty: 3,
    hook: "Package the sentiment analyzer into an atomic web service handler with confidence scores and clean status reporting.",
    explanationSummary:
      "Production deployment wraps preprocessing, prediction, and post-processing into a single atomic API function that accepts arbitrary strings and emits structured responses.",
    predictQuestion: {
      prompt: "Why should a production sentiment API return both a categorical label ('Positive') and a calibrated confidence percentage ('91.4%')?",
      options: [
        "Downstream systems can take automated actions on high-confidence predictions while routing low-confidence edge cases to human moderation.",
        "Because web servers cannot send strings without accompanying numbers.",
        "Confidence numbers are required by Python's JSON specification.",
        "To slow down the API response so client devices don't overheat."
      ],
      correctIndex: 0,
      explanation: "Exposing confidence percentages allows client applications to set custom risk tolerances and flag borderline reviews for manual review."
    },
    checkQuestion: {
      prompt: "In a production inference endpoint, what status should be returned alongside the sentiment payload?",
      options: [
        "A status like 'APPROVED' or 'OK' confirming that input parsing and prediction completed successfully without error.",
        "'TRAINING_STARTED' indicating the model was retrained on the review.",
        "'ERROR_404' to indicate the text was processed.",
        "'REJECTED' for all negative reviews."
      ],
      correctIndex: 0,
      explanation: "Structured status codes communicate operational health to downstream consumers."
    },
    buildStep: "Implement analyze_review_api to return structured sentiment classification and confidence percentage.",
    starterCode: `# Step 6: Production Sentiment Inference Endpoint
def analyze_review_api(review_text, weights, threshold=0.5):
    res = classify_review_sentiment(review_text, weights, threshold)
    confidence = res["positive_confidence"]
    label = res["label"]
    
    # TODO: Return dictionary with text, sentiment, and confidence_pct
    return {
        "text": review_text,
        "sentiment": label,
        "confidence_pct": round((confidence if label == "Positive" else (1 - confidence)) * 100, 1),
        "status": "APPROVED"
    }

w = {"brilliant": 2.5, "loved": 2.0, "terrible": -3.0, "boring": -2.0}
print(analyze_review_api("Brilliant film, loved it!", w))
`,
    solutionCode: `def analyze_review_api(review_text, weights, threshold=0.5):
    res = classify_review_sentiment(review_text, weights, threshold)
    confidence = res["positive_confidence"]
    label = res["label"]
    return {
        "text": review_text,
        "sentiment": label,
        "confidence_pct": round((confidence if label == "Positive" else (1 - confidence)) * 100, 1),
        "status": "APPROVED"
    }
`,
    testAssertion: `w = {"brilliant": 2.5, "loved": 2.0, "terrible": -3.0, "boring": -2.0}
api_res = analyze_review_api("Brilliant film, loved it!", w)
assert api_res["sentiment"] == "Positive"
assert api_res["confidence_pct"] > 70.0
print("Assertion Passed: Live sentiment inference endpoint operational!")
`
  }
];

export const SENTIMENT_ANALYSIS_EDGES: ConceptEdge[] = [
  { from: "sentiment-preprocessing", to: "sentiment-vocabulary-weights" },
  { from: "sentiment-vocabulary-weights", to: "logistic-sigmoid-activation" },
  { from: "logistic-sigmoid-activation", to: "sentiment-pipeline-decision" },
  { from: "sentiment-pipeline-decision", to: "evaluating-sentiment" },
  { from: "evaluating-sentiment", to: "sentiment-live-deployment" }
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
  },
  {
    id: "diag-sentiment-3",
    targetConceptId: "sentiment-vocabulary-weights",
    question: "A training set has 95% positive reviews and only 5% negative reviews. If a naive model always predicts 'Positive', what is its fatal flaw?",
    options: [
      {
        text: "It achieves 95% surface accuracy while failing to detect 100% of negative reviews, making it useless for finding criticism.",
        isCorrect: true,
        errorType: "NONE"
      },
      {
        text: "95% accuracy means the model is ready for enterprise production without changes.",
        isCorrect: false,
        errorType: "OVERCONFIDENT_MISCONCEPTION",
        rationale: "Class imbalance can yield high raw accuracy while failing the core detection objective."
      },
      {
        text: "Python cannot execute code on datasets where one class has under 10% representation.",
        isCorrect: false,
        errorType: "TERMINOLOGY_CONFUSION",
        rationale: "Python runs regardless; the issue is algorithmic class imbalance."
      },
      {
        text: "The dataset must always be reduced to exactly 10 positive reviews.",
        isCorrect: false,
        errorType: "CONCEPTUAL_GAP",
        rationale: "Downsampling or weighting classes resolves imbalance without discarding entire datasets."
      }
    ]
  },
  {
    id: "diag-sentiment-4",
    targetConceptId: "evaluating-sentiment",
    question: "You want your sentiment classifier to catch toxic customer reviews. Should you adjust the decision threshold θ from 0.50 to 0.30?",
    options: [
      {
        text: "Yes — lowering the threshold to 0.30 makes the model more sensitive, catching subtler negative reviews at the expense of a few more false alarms.",
        isCorrect: true,
        errorType: "NONE"
      },
      {
        text: "No — changing the threshold from 0.50 causes the model weights to reset to zero.",
        isCorrect: false,
        errorType: "CONCEPTUAL_GAP",
        rationale: "Thresholding operates during post-processing inference, leaving trained weights intact."
      },
      {
        text: "Thresholds can only be set to integers like 1, 2, or 3.",
        isCorrect: false,
        errorType: "TERMINOLOGY_CONFUSION",
        rationale: "Sigmoid outputs probabilities in [0.0, 1.0], so thresholds are decimal cutoffs."
      },
      {
        text: "The threshold has zero effect on precision or recall trade-offs.",
        isCorrect: false,
        errorType: "OVERCONFIDENT_MISCONCEPTION",
        rationale: "Threshold tuning directly controls the trade-off between false positives and false negatives."
      }
    ]
  }
];

