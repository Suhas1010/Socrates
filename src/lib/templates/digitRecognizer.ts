import { Concept, ConceptEdge, DiagnosticQuestion } from "../types";

export const DIGIT_RECOGNIZER_CONCEPTS: Concept[] = [
  {
    id: "pixels-to-vectors",
    title: "Pixels to Feature Vectors",
    prereqs: [],
    difficulty: 1,
    hook: "A handwritten '7' is just ink on paper. How does a computer see an image without eyes?",
    explanationSummary:
      "Digital images are 2D grids of pixel brightness values between 0 and 255. By flattening an 8x8 or 28x28 grid into a 1D vector of numbers, we give our mathematical model raw input features.",
    predictQuestion: {
      prompt: "Why do we divide raw pixel brightness values (0–255) by 255.0 to normalize them into [0.0, 1.0]?",
      options: [
        "Normalizing features into [0.0, 1.0] prevents large numerical values from dominating gradient updates and stabilizes learning.",
        "Because Python arrays cannot store numbers greater than 255.",
        "To turn color images into black and white images.",
        "Because floating point numbers are smaller in memory than 8-bit integers."
      ],
      correctIndex: 0,
      explanation: "Feature normalization ensures all pixel dimensions contribute on a consistent, stable scale to the mathematical model."
    },
    checkQuestion: {
      prompt: "If an image is a 2D grid with 8 rows and 8 columns, how many elements are in the flattened 1D feature vector?",
      options: [
        "64 elements (8 × 8 = 64)",
        "16 elements (8 + 8 = 16)",
        "256 elements",
        "8 elements"
      ],
      correctIndex: 0,
      explanation: "Flattening unrolls all rows into a single continuous sequence of length rows × columns = 8 × 8 = 64."
    },
    buildStep: "Flatten an 8x8 pixel grid into a 64-element normalized feature vector.",
    starterCode: `# Step 1: Image Flattening & Normalization
def preprocess_digit_image(pixel_grid_2d):
    """
    Flattens 2D grid (list of lists) and normalizes pixel values to [0.0, 1.0]
    """
    flattened = []
    for row in pixel_grid_2d:
        for pixel in row:
            # TODO: Normalize pixel from 0..255 to 0.0..1.0
            norm_val = pixel / ___
            flattened.append(norm_val)
    return flattened

# Example 8x8 test image
mock_img = [[0 for _ in range(8)] for _ in range(8)]
mock_img[2][4] = 255
print("Vector length:", len(preprocess_digit_image(mock_img)))
`,
    solutionCode: `def preprocess_digit_image(pixel_grid_2d):
    flattened = []
    for row in pixel_grid_2d:
        for pixel in row:
            norm_val = pixel / 255.0
            flattened.append(norm_val)
    return flattened
`,
    testAssertion: `grid = [[127.5, 255], [0, 51]]
vec = preprocess_digit_image(grid)
assert len(vec) == 4, "Vector must be 1D"
assert abs(vec[0] - 0.5) < 1e-4, "127.5 / 255 should be 0.5"
assert vec[1] == 1.0, "255 / 255 should be 1.0"
print("Assertion Passed: Digit image preprocessed and normalized!")
`
  },
  {
    id: "linear-model-weights",
    title: "Linear Combinations & Weights",
    prereqs: ["pixels-to-vectors"],
    difficulty: 2,
    hook: "Why does multiplying a pixel by a positive weight make the model think 'that is definitely an 8', while a negative weight says 'no way'?",
    explanationSummary:
      "Each class (0 through 9) learns a weight template. High positive weights highlight pixel regions where that digit usually has ink, while negative weights penalize ink in unexpected areas.",
    predictQuestion: {
      prompt: "In the linear model z = w · x + b, what does a large positive weight w_i for a specific pixel indicate?",
      options: [
        "Presence of ink at that pixel location strongly evidences in favor of this digit class.",
        "Presence of ink at that pixel location penalizes this digit class.",
        "That pixel is corrupted and should be deleted from the dataset.",
        "The model will automatically output 1.0 regardless of other pixels."
      ],
      correctIndex: 0,
      explanation: "Positive weights amplify the total score when corresponding pixels are active, learning the distinctive spatial shape of each digit."
    },
    checkQuestion: {
      prompt: "If features = [0.5, 1.0], weights = [2.0, -1.0], and bias = 0.5, what is the computed linear score z?",
      options: [
        "0.5 (0.5 + (0.5×2.0) + (1.0×-1.0) = 0.5 + 1.0 - 1.0 = 0.5)",
        "2.5",
        "0.0",
        "1.5"
      ],
      correctIndex: 0,
      explanation: "z = bias + sum(w_i * x_i) = 0.5 + (2.0*0.5) + (-1.0*1.0) = 0.5 + 1.0 - 1.0 = 0.5."
    },
    buildStep: "Compute the dot product z = w · x + b between weights and pixel inputs.",
    starterCode: `# Step 2: Linear Combination (Dot Product)
def compute_linear_score(features, weights, bias):
    """
    Computes dot product sum(w_i * x_i) + b
    """
    score = bias
    for x, w in zip(features, weights):
        # TODO: Multiply feature x by weight w and add to score
        score += ___ * ___
    return score

feat = [0.5, 1.0]
w = [2.0, -1.0]
print("Linear score:", compute_linear_score(feat, w, 0.5))
`,
    solutionCode: `def compute_linear_score(features, weights, bias):
    score = bias
    for x, w in zip(features, weights):
        score += x * w
    return score
`,
    testAssertion: `res = compute_linear_score([1.0, 2.0], [3.0, 4.0], 1.0)
assert res == 12.0, f"Expected 1 + 3*1 + 4*2 = 12, got {res}"
print("Assertion Passed: Dot product linear score computed!")
`
  },
  {
    id: "softmax-probabilities",
    title: "Softmax & Multiclass Probabilities",
    prereqs: ["linear-model-weights"],
    difficulty: 3,
    hook: "If raw scores for digits [0..9] are [2.1, -0.4, 7.8, ...], how do we convert them into true probabilities that sum up to 100%?",
    explanationSummary:
      "The Softmax function exponents each score to make it strictly positive, then normalizes by the sum of all exponentials: P(y=k) = exp(z_k) / sum(exp(z)).",
    predictQuestion: {
      prompt: "Why can't we use a simple binary Sigmoid when classifying digits from 0 through 9?",
      options: [
        "Digits 0–9 have 10 mutually exclusive classes; Softmax normalizes raw scores across all 10 classes so their sum equals exactly 1.0 (100%).",
        "Sigmoid only works with negative numbers, but pixel inputs are positive.",
        "Because Softmax runs faster on GPUs than Sigmoids.",
        "Sigmoid only outputs numbers greater than 10."
      ],
      correctIndex: 0,
      explanation: "Softmax generalises Sigmoid to multiclass problems, creating a valid probability distribution where ∑ P(y=k) = 1.0."
    },
    checkQuestion: {
      prompt: "Why is subtracting max(scores) from all scores (math.exp(s - max_s)) a standard numerical stability practice in Softmax?",
      options: [
        "It prevents math.exp from overflowing into infinity / NaN on large input scores while producing identical mathematical ratios.",
        "It speeds up execution by skipping negative numbers.",
        "It forces the smallest probability to be zero.",
        "It turns Softmax into a linear function."
      ],
      correctIndex: 0,
      explanation: "Subtracting a constant c from all exponent inputs cancels out in the fraction: exp(s-c)/∑exp(z-c) = exp(s)/∑exp(z), preventing floating-point overflow."
    },
    buildStep: "Implement the numerically stable Softmax function across 10 digit classes.",
    starterCode: `# Step 3: Numerically Stable Softmax
import math

def softmax(scores):
    """
    Turns arbitrary class scores into probabilities that sum to 1.0
    """
    max_s = max(scores) # Subtract max for numerical stability
    exp_scores = [math.exp(s - max_s) for s in scores]
    sum_exp = sum(exp_scores)
    # TODO: Divide each exp_score by sum_exp
    probabilities = [s / ___ for s in exp_scores]
    return probabilities

print("Probabilities:", [round(p, 3) for p in softmax([1.0, 2.0, 3.0])])
`,
    solutionCode: `import math

def softmax(scores):
    max_s = max(scores)
    exp_scores = [math.exp(s - max_s) for s in scores]
    sum_exp = sum(exp_scores)
    probabilities = [s / sum_exp for s in exp_scores]
    return probabilities
`,
    testAssertion: `probs = softmax([1.0, 2.0, 5.0])
assert abs(sum(probs) - 1.0) < 1e-5, "Probabilities must sum to 1.0"
assert probs[2] > probs[1] > probs[0], "Higher score must yield higher probability"
print("Assertion Passed: Softmax distribution verified!")
`
  },
  {
    id: "cross-entropy-loss",
    title: "Cross-Entropy Loss",
    prereqs: ["softmax-probabilities"],
    difficulty: 3,
    hook: "If the true digit is '3', but our model only gives '3' a 2% chance, how harshly should we punish the model?",
    explanationSummary:
      "Cross-entropy loss L = -log(P_true) measures surprise. If P_true = 1.0, loss is 0. If P_true approaches 0, loss skyrockets to infinity, giving immense gradient pressure to correct wrong predictions.",
    predictQuestion: {
      prompt: "If the true label is digit '3', but the model assigns a tiny probability P(3) = 0.01, what happens to the loss L = -log(P)?",
      options: [
        "The loss is very large (~4.60), heavily penalizing the confident incorrect mistake.",
        "The loss becomes zero because any probability is non-negative.",
        "The loss becomes negative, rewarding the model for exploring.",
        "The loss resets the model's weights to zero immediately."
      ],
      correctIndex: 0,
      explanation: "-log(P) approaches infinity as P approaches 0, penalizing confident wrong predictions heavily to drive gradient descent."
    },
    checkQuestion: {
      prompt: "What is the cross-entropy loss L = -log(P_true) when the model assigns 100% probability (P_true = 1.0) to the correct class?",
      options: [
        "0.0, because -log(1.0) = 0, indicating zero error or surprise.",
        "1.0",
        "-1.0",
        "Infinity"
      ],
      correctIndex: 0,
      explanation: "The natural log of 1 is 0, so when the prediction is completely correct and certain, the cross-entropy penalty is zero."
    },
    buildStep: "Calculate cross entropy loss given predicted probabilities and the true target label.",
    starterCode: `# Step 4: Cross-Entropy Loss
import math

def cross_entropy_loss(probabilities, true_label_index):
    """
    Loss = -log(P(true_label))
    """
    p_true = max(probabilities[true_label_index], 1e-12)
    # TODO: Compute negative natural logarithm of p_true
    loss = -math.log(___)
    return loss

p = [0.05, 0.90, 0.05]
print("Loss for correct guess:", cross_entropy_loss(p, 1))
print("Loss for wrong guess:", cross_entropy_loss(p, 0))
`,
    solutionCode: `import math

def cross_entropy_loss(probabilities, true_label_index):
    p_true = max(probabilities[true_label_index], 1e-12)
    loss = -math.log(p_true)
    return loss
`,
    testAssertion: `l_good = cross_entropy_loss([0.01, 0.99], 1)
l_bad = cross_entropy_loss([0.01, 0.99], 0)
assert l_good < 0.05, "Confident correct prediction must have tiny loss"
assert l_bad > 3.0, "Mistaken prediction must have high loss"
print("Assertion Passed: Cross-entropy penalty behaves as expected!")
`
  },
  {
    id: "gradient-descent",
    title: "Gradient Descent & Weight Updates",
    prereqs: ["cross-entropy-loss"],
    difficulty: 4,
    hook: "You are blindfolded on a foggy mountain and need to find the lowest valley. What is the only sensible step you can take?",
    explanationSummary:
      "Gradient descent feels the slope of the loss landscape and takes a step in the direction of steepest descent: w_new = w_old - learning_rate * gradient.",
    predictQuestion: {
      prompt: "In parameter update w_new = w_old - η · gradient, why is there a negative sign in front of the learning rate η?",
      options: [
        "Because the gradient points in the direction of steepest ASCENT; taking the negative steps toward lower loss.",
        "Because weights can never be positive numbers.",
        "To invert the matrix transpose during backpropagation.",
        "Because Python operators require alternating signs."
      ],
      correctIndex: 0,
      explanation: "The gradient vector points uphill towards higher error; we subtract it to descend towards minimum error."
    },
    checkQuestion: {
      prompt: "If current weight is 2.0, gradient is +0.5, and learning rate η = 0.1, what is the updated weight?",
      options: [
        "1.95 (2.0 - (0.1 × 0.5) = 2.0 - 0.05 = 1.95)",
        "2.05",
        "1.50",
        "2.50"
      ],
      correctIndex: 0,
      explanation: "w_new = w_old - η * grad = 2.0 - (0.1 * 0.5) = 2.0 - 0.05 = 1.95."
    },
    buildStep: "Implement the gradient step update for a weight parameter.",
    starterCode: `# Step 5: Gradient Descent Parameter Update
def update_weight(current_weight, gradient, learning_rate=0.01):
    """
    Formula: w_new = w_old - learning_rate * gradient
    """
    # TODO: Subtract (learning_rate * gradient) from current_weight
    new_weight = current_weight - (___ * ___)
    return new_weight

w = 1.5
grad = 0.8
print("Updated weight:", update_weight(w, grad, 0.1))
`,
    solutionCode: `def update_weight(current_weight, gradient, learning_rate=0.01):
    new_weight = current_weight - (learning_rate * gradient)
    return new_weight
`,
    testAssertion: `w_up = update_weight(2.0, 0.5, 0.1)
assert abs(w_up - 1.95) < 1e-5, f"Expected 1.95, got {w_up}"
print("Assertion Passed: Gradient descent update verified!")
`
  },
  {
    id: "digit-inference-pipeline",
    title: "Interactive Digit Recognizer",
    prereqs: ["gradient-descent"],
    difficulty: 4,
    hook: "You have weights, forward pass, and softmax. Can our model classify a brand new digit drawn on screen by a human?",
    explanationSummary:
      "Combining preprocessing, linear scoring, and softmax yields an end-to-end digit classification engine ready to inspect user drawn canvases in real-time.",
    predictQuestion: {
      prompt: "If the 10-class Softmax outputs are [0.01, 0.02, 0.01, 0.02, 0.01, 0.01, 0.01, 0.88, 0.02, 0.01], what is the predicted digit and confidence?",
      options: [
        "Digit 7 with 88.0% confidence, selected via argmax.",
        "Digit 0 with 1.0% confidence.",
        "Digit 9 with 99.0% confidence.",
        "Unclassified because total sum is less than 10."
      ],
      correctIndex: 0,
      explanation: "Argmax selects index 7 having the highest probability (0.88), making digit 7 the predicted class with 88% confidence."
    },
    checkQuestion: {
      prompt: "Why is it valuable for an interactive digit canvas to show the probability distribution bar across all 10 digits instead of just the top guess?",
      options: [
        "It visualizes model uncertainty—such as when a sloppy '4' looks 45% like a '4' and 40% like a '9'.",
        "Because canvas rendering is only permitted with 10 bars.",
        "To check whether the browser GPU is overclocked.",
        "It prevents users from drawing invalid numbers."
      ],
      correctIndex: 0,
      explanation: "Showing the full probability distribution lets users understand confidence and observe ambiguity between visually similar digits."
    },
    buildStep: "Package the full digit classifier to predict the top digit class and confidence.",
    starterCode: `# Step 6: Complete Digit Classifier
# Calibrated prototype weights for digits 0..9 across stroke features:
# [strokeDensity, verticalBias, loopRatio, horizontalCross]
DIGIT_PROTOTYPES = [
    [0.60, 0.65, 0.85, 0.20],  # 0: open loop, low crossbar
    [0.20, 0.95, 0.05, 0.10],  # 1: pure vertical, zero loops
    [0.45, 0.35, 0.05, 0.75],  # 2: base crossbar, no loops
    [0.55, 0.40, 0.15, 0.70],  # 3: open arches
    [0.55, 0.75, 0.45, 0.85],  # 4: triangle loop + crossbar
    [0.50, 0.40, 0.10, 0.85],  # 5: top horizontal + middle
    [0.70, 0.50, 0.60, 0.40],  # 6: bottom belly loop
    [0.40, 0.70, 0.02, 0.90],  # 7: strong crossbar + vertical drop, NO loops
    [0.85, 0.50, 0.90, 0.75],  # 8: dual loops + high density
    [0.60, 0.80, 0.60, 0.50],  # 9: top head loop + stem
]
_K = 55.0
DEFAULT_DIGIT_WEIGHTS = [[round(p[j] * _K, 2) for j in range(len(p))] for p in DIGIT_PROTOTYPES]
DEFAULT_DIGIT_BIASES = [round(-0.5 * _K * sum(p[j]**2 for j in range(len(p))), 2) for p in DIGIT_PROTOTYPES]

def classify_digit(features, weights_matrix=None, biases=None):
    """
    weights_matrix: list of 10 weight vectors (one per digit 0..9)
    biases: list of 10 bias values
    """
    if weights_matrix is None:
        weights_matrix = DEFAULT_DIGIT_WEIGHTS
    if biases is None:
        biases = DEFAULT_DIGIT_BIASES

    scores = []
    for digit_idx in range(10):
        s = compute_linear_score(features, weights_matrix[digit_idx], biases[digit_idx])
        scores.append(s)
        
    probs = softmax(scores)
    # TODO: Find index of maximum probability
    predicted_digit = probs.index(max(probs))
    confidence = max(probs)
    
    return {
        "predicted_digit": predicted_digit,
        "confidence": confidence,
        "probabilities": probs
    }
`,
    solutionCode: `DIGIT_PROTOTYPES = [
    [0.60, 0.65, 0.85, 0.20],  # 0
    [0.20, 0.95, 0.05, 0.10],  # 1
    [0.45, 0.35, 0.05, 0.75],  # 2
    [0.55, 0.40, 0.15, 0.70],  # 3
    [0.55, 0.75, 0.45, 0.85],  # 4
    [0.50, 0.40, 0.10, 0.85],  # 5
    [0.70, 0.50, 0.60, 0.40],  # 6
    [0.40, 0.70, 0.02, 0.90],  # 7
    [0.85, 0.50, 0.90, 0.75],  # 8
    [0.60, 0.80, 0.60, 0.50],  # 9
]
_K = 55.0
DEFAULT_DIGIT_WEIGHTS = [[round(p[j] * _K, 2) for j in range(len(p))] for p in DIGIT_PROTOTYPES]
DEFAULT_DIGIT_BIASES = [round(-0.5 * _K * sum(p[j]**2 for j in range(len(p))), 2) for p in DIGIT_PROTOTYPES]

def classify_digit(features, weights_matrix=None, biases=None):
    if weights_matrix is None:
        weights_matrix = DEFAULT_DIGIT_WEIGHTS
    if biases is None:
        biases = DEFAULT_DIGIT_BIASES

    scores = []
    for digit_idx in range(10):
        s = compute_linear_score(features, weights_matrix[digit_idx], biases[digit_idx])
        scores.append(s)
    probs = softmax(scores)
    predicted_digit = probs.index(max(probs))
    confidence = max(probs)
    return {
        "predicted_digit": predicted_digit,
        "confidence": confidence,
        "probabilities": probs
    }
`,
    testAssertion: `mock_w = [[0]*4 for _ in range(10)]
mock_w[7] = [5.0]*4
mock_b = [0.0]*10
res = classify_digit([1.0]*4, mock_w, mock_b)
assert res["predicted_digit"] == 7, "Should correctly pick digit 7"
# Test default calibrated weights on preset 7
res7 = classify_digit([0.40, 0.70, 0.02, 0.90])
assert res7["predicted_digit"] == 7, "Preset 7 must classify as Digit 7"
assert res7["confidence"] > 0.85, "Confidence on Digit 7 should exceed 85%"
print("Assertion Passed: Digit classifier pipeline operational!")
`
  }
];

export const DIGIT_RECOGNIZER_EDGES: ConceptEdge[] = [
  { from: "pixels-to-vectors", to: "linear-model-weights" },
  { from: "linear-model-weights", to: "softmax-probabilities" },
  { from: "softmax-probabilities", to: "cross-entropy-loss" },
  { from: "cross-entropy-loss", to: "gradient-descent" },
  { from: "gradient-descent", to: "digit-inference-pipeline" }
];

export const DIGIT_RECOGNIZER_DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: "diag-digit-1",
    targetConceptId: "pixels-to-vectors",
    question: "How does a neural network process an image of a handwritten digit?",
    options: [
      {
        text: "It flattens pixel brightness numbers into a numerical vector (e.g. 28x28 grid -> 784 numbers).",
        isCorrect: true,
        errorType: "NONE",
      },
      {
        text: "It prints out the image on paper and scans it with a laser.",
        isCorrect: false,
        errorType: "TERMINOLOGY_CONFUSION",
        rationale: "Images are processed digitally as numeric matrices.",
      },
      {
        text: "It ignores pixel brightness and counts the number of colors.",
        isCorrect: false,
        errorType: "CONCEPTUAL_GAP",
        rationale: "Grayscale digit recognizers rely on pixel intensity values.",
      },
      {
        text: "It requires human handwriting experts to grade each pixel live.",
        isCorrect: false,
        errorType: "OVERCONFIDENT_MISCONCEPTION",
        rationale: "Neural nets process features autonomously without manual grading.",
      },
    ],
  },
  {
    id: "diag-digit-2",
    targetConceptId: "softmax-probabilities",
    question: "For a handwritten digit with 10 possible classes (0 to 9), how does Softmax convert raw scores into probabilities?",
    options: [
      {
        text: "It exponentiates each score and divides by their sum so all 10 probabilities add up to 1.0 (100%).",
        isCorrect: true,
        errorType: "NONE",
      },
      {
        text: "It rounds all scores to 0 or 1 at random.",
        isCorrect: false,
        errorType: "CONCEPTUAL_GAP",
        rationale: "Softmax produces a continuous, calibrated probability distribution.",
      },
      {
        text: "It deletes negative scores from memory.",
        isCorrect: false,
        errorType: "TERMINOLOGY_CONFUSION",
        rationale: "Exponentiating converts negative scores into positive numbers (e^z > 0).",
      },
      {
        text: "It guarantees the predicted digit is always 100% correct.",
        isCorrect: false,
        errorType: "OVERCONFIDENT_MISCONCEPTION",
        rationale: "Softmax outputs probabilities, not guaranteed ground truth.",
      },
    ],
  },
  {
    id: "diag-digit-3",
    targetConceptId: "cross-entropy-loss",
    question: "If an image is a handwritten '3', but the model assigns 90% probability to '8' and only 2% to '3', what happens to cross-entropy loss?",
    options: [
      {
        text: "The loss explodes to a very high penalty (-log(0.02) ≈ 3.91) signaling a severe mistake.",
        isCorrect: true,
        errorType: "NONE",
      },
      {
        text: "The loss becomes zero because 90% is a high number.",
        isCorrect: false,
        errorType: "CONCEPTUAL_GAP",
        rationale: "Loss penalizes confidence in the WRONG class and rewards probability assigned to the TRUE class.",
      },
      {
        text: "The loss turns into a negative imaginary number.",
        isCorrect: false,
        errorType: "TERMINOLOGY_CONFUSION",
        rationale: "Cross-entropy loss is strictly non-negative real scalar.",
      },
      {
        text: "Nothing happens; neural networks ignore prediction mistakes.",
        isCorrect: false,
        errorType: "OVERCONFIDENT_MISCONCEPTION",
        rationale: "Loss provides the gradient feedback signal that allows the network to learn.",
      },
    ],
  },
  {
    id: "diag-digit-4",
    targetConceptId: "gradient-descent",
    question: "When training a digit recognizer, what does gradient descent achieve during each training iteration?",
    options: [
      {
        text: "It computes mathematical derivatives to nudge weights in the exact direction that decreases loss.",
        isCorrect: true,
        errorType: "NONE",
      },
      {
        text: "It increases model errors as much as possible to stress test the GPU.",
        isCorrect: false,
        errorType: "CONCEPTUAL_GAP",
        rationale: "Gradient descent minimizes loss, rather than maximizing error.",
      },
      {
        text: "It randomly shuffles dataset rows until lucky.",
        isCorrect: false,
        errorType: "TERMINOLOGY_CONFUSION",
        rationale: "Gradient descent computes analytic calculus derivatives to update weights.",
      },
      {
        text: "It deletes weights whenever a mistake is made.",
        isCorrect: false,
        errorType: "OVERCONFIDENT_MISCONCEPTION",
        rationale: "Weights are updated incrementally by learning rate * gradient.",
      },
    ],
  },
];
