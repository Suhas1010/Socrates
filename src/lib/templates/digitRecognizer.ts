import { Concept, ConceptEdge } from "../types";

export const DIGIT_RECOGNIZER_CONCEPTS: Concept[] = [
  {
    id: "pixels-to-vectors",
    title: "Pixels to Feature Vectors",
    prereqs: [],
    difficulty: 1,
    hook: "A handwritten '7' is just ink on paper. How does a computer see an image without eyes?",
    explanationSummary:
      "Digital images are 2D grids of pixel brightness values between 0 and 255. By flattening an 8x8 or 28x28 grid into a 1D vector of numbers, we give our mathematical model raw input features.",
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
    buildStep: "Package the full digit classifier to predict the top digit class and confidence.",
    starterCode: `# Step 6: Complete Digit Classifier
def classify_digit(features, weights_matrix, biases):
    """
    weights_matrix: list of 10 weight vectors (one per digit 0..9)
    biases: list of 10 bias values
    """
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
    solutionCode: `def classify_digit(features, weights_matrix, biases):
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
