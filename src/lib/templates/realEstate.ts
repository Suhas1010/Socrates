import { Concept, ConceptEdge, DiagnosticQuestion } from "../types";

export const REAL_ESTATE_DATASET = [
  { sqft: 1200, bedrooms: 2, price: 250000 },
  { sqft: 2400, bedrooms: 4, price: 480000 },
  { sqft: 1800, bedrooms: 3, price: 360000 },
  { sqft: 1500, bedrooms: 3, price: 310000 },
  { sqft: 2100, bedrooms: 4, price: 430000 },
  { sqft: 950, bedrooms: 1, price: 195000 },
  { sqft: 2800, bedrooms: 5, price: 560000 },
  { sqft: 1650, bedrooms: 3, price: 340000 },
  { sqft: 1350, bedrooms: 2, price: 280000 },
  { sqft: 2250, bedrooms: 4, price: 460000 },
];

export const REAL_ESTATE_CONCEPTS: Concept[] = [
  {
    id: "problem-framing",
    title: "Problem Formulation: Real Estate Price Prediction",
    prereqs: [],
    difficulty: 1,
    hook: "Before an AI model can predict home prices, we must define what features it observes and what single quantity it predicts.",
    explanationSummary: "Supervised regression learns a mathematical mapping from observable features (like square footage and bedrooms) to a continuous target quantity (sale price in dollars).",
    corePrinciple: "Machine learning divides data into observable inputs (features X) and the ground truth outcome (target Y). If you accidentally include the target in your inputs, your model experiences Target Leakage — it memorizes the answer instead of learning true predictive relationships.",
    whyItMatters: "Defining the input/output contract prevents catastrophic target leakage and determines whether the task is regression (continuous dollar values) or classification (discrete labels).",
    workedExample: {
      scenario: "Given 3 real estate sales: [1200 sqft, 2 beds] -> $250k, [2400 sqft, 4 beds] -> $480k, [1800 sqft, 3 beds] -> $360k",
      calculationSteps: [
        "1. Identify observable features: sqft (size) and bedrooms (room count)",
        "2. Identify target quantity to predict: sale price ($)",
        "3. Specify task type: continuous numeric output = Regression"
      ],
      takeaway: "Inputs are what you know before the sale; Target is what you want the model to predict."
    },
    buildStep: "Define the input/output contract for Real estate price prediction by completing the blanks in define_project_spec().",
    starterCode: `# Step 1: Input/Output Contract for Real Estate Price Prediction
# Fill in the 3 blanks below:
# 1. Is this "regression" or "classification"?
# 2. What features does the model take in as inputs? (e.g. "sqft", "bedrooms")
# 3. What single value is the model predicting as the target? (e.g. "price")

def define_project_spec():
    return {
        "project": "Real estate price prediction",
        "task_type": ___,        # TODO: "regression" or "classification"?
        "inputs": [___],         # TODO: list the input feature names as strings
        "target": ___            # TODO: what single continuous value is it predicting?
    }

print("Spec:", define_project_spec())
`,
    solutionCode: `def define_project_spec():
    return {
        "project": "Real estate price prediction",
        "task_type": "regression",
        "inputs": ["sqft", "bedrooms"],
        "target": "price"
    }

print("Spec:", define_project_spec())
`,
    testAssertion: `spec = define_project_spec()
assert isinstance(spec, dict), "define_project_spec() must return a dictionary"

# Blank 1: task_type
task_type = str(spec.get("task_type", "")).lower().strip()
assert task_type != "___" and task_type != "", "Blank 'task_type' is not filled in yet. Choose 'regression' or 'classification'."
if task_type == "classification":
    raise AssertionError("TASK_TYPE_MISCONCEPTION: Predicting home price is predicting a continuous dollar amount, not discrete categories. This is regression, not classification.")
assert "regression" in task_type, f"Expected task_type to be 'regression', got '{spec.get('task_type')}'"

# Blank 2: inputs
inputs = spec.get("inputs", [])
assert isinstance(inputs, list), "'inputs' must be a list of feature names"
assert len(inputs) > 0 and inputs != ["___"], "Blank 'inputs' is not filled in yet. Provide the input feature names."
assert "price" not in [str(x).lower() for x in inputs], "TARGET_LEAKAGE: 'price' is what the model is trying to predict, so it cannot be in the inputs list!"
assert any("sqft" in str(x).lower() or "bed" in str(x).lower() or "size" in str(x).lower() or "room" in str(x).lower() for x in inputs), "Inputs should include predictor features like 'sqft' or 'bedrooms'"

# Blank 3: target
target = str(spec.get("target", "")).lower().strip()
assert target != "___" and target != "", "Blank 'target' is not filled in yet."
assert "price" in target or "cost" in target or "value" in target, f"Expected target to be 'price', got '{spec.get('target')}'"

print("Assertion Passed: Project specification and feature/target contract verified!")
`,
    predictQuestion: {
      prompt: "Here are 3 real estate listings: [sqft, bedrooms, price] = [1200, 2, 250000], [2400, 4, 480000], [1800, 3, 360000]. What should go in the model's `inputs` list, and what single value should `target` be?",
      options: [
        "inputs: ['sqft', 'bedrooms'], target: 'price' (Regression)",
        "inputs: ['price'], target: 'sqft' (Predicting size from price)",
        "inputs: ['sqft', 'bedrooms', 'price'], target: 'category' (Target leakage)",
        "inputs: ['address'], target: 'classification' (Discrete classification)"
      ],
      correctIndex: 0,
      explanation: "Inputs are the known features [sqft, bedrooms] and the target to predict is the continuous sale price."
    }
  },
  {
    id: "feature-engineering",
    title: "Feature Extraction & Data Normalization",
    prereqs: ["problem-framing"],
    difficulty: 2,
    hook: "Raw square footage (1200-2400) is 1000x larger than bedroom count (2-4), causing weights to explode unless scaled.",
    explanationSummary: "Feature scaling puts diverse measurements (square feet vs count of bedrooms) onto comparable numeric ranges so gradient descent converges smoothly.",
    corePrinciple: "When one feature is on a scale of 1000s and another is on a scale of 1-5, the loss surface becomes an elongated canyon. Normalizing features scales their gradients equally.",
    whyItMatters: "Without scaling, a model will oscillate wildy or ignore features with smaller raw numerical scales.",
    workedExample: {
      scenario: "Scaling Listing 1 (1200 sqft, 2 beds) vs Listing 2 (2400 sqft, 4 beds):",
      calculationSteps: [
        "1. Scale sqft: divide by 1000.0 -> 1200 / 1000.0 = 1.2",
        "2. Scale bedrooms: float(bedrooms) -> float(2) = 2.0",
        "3. Resulting feature vector: [1.2, 2.0] (both numbers are now near 1.0 - 5.0)"
      ],
      takeaway: "Scaling brings different units into harmonious mathematical balance."
    },
    buildStep: "Implement normalize_features(sqft, bedrooms) to scale square footage and format numeric feature vectors.",
    starterCode: `# Step 2: Feature Extraction & Normalization
# Complete the 2 blanks to scale sqft by dividing by 1000.0 and convert bedrooms to float:

def normalize_features(sqft: float, bedrooms: int) -> list[float]:
    scaled_sqft = ___            # TODO: scale sqft (e.g. sqft / 1000.0)
    scaled_beds = ___            # TODO: float(bedrooms)
    return [scaled_sqft, scaled_beds]

print("Listing 3 (1800 sqft, 3 beds) features:", normalize_features(1800, 3))
`,
    solutionCode: `def normalize_features(sqft: float, bedrooms: int) -> list[float]:
    scaled_sqft = sqft / 1000.0
    scaled_beds = float(bedrooms)
    return [scaled_sqft, scaled_beds]

print("Listing 3 (1800 sqft, 3 beds) features:", normalize_features(1800, 3))
`,
    testAssertion: `vec = normalize_features(1200, 2)
assert isinstance(vec, list), "normalize_features must return a list"
assert len(vec) == 2, "Feature vector must have exactly 2 elements: [scaled_sqft, scaled_beds]"
if vec[0] == 1200:
    raise AssertionError("CALCULATION_SLIP: sqft was not scaled down. Divide sqft by 1000.0 so gradient steps stay stable.")
assert abs(vec[0] - 1.2) < 0.01, f"Expected scaled_sqft to be 1.2, got {vec[0]}"
assert abs(vec[1] - 2.0) < 0.01, f"Expected scaled_beds to be 2.0, got {vec[1]}"
vec3 = normalize_features(1800, 3)
assert abs(vec3[0] - 1.8) < 0.01 and abs(vec3[1] - 3.0) < 0.01
print("Assertion Passed: Feature normalizer operational!")
`,
    predictQuestion: {
      prompt: "For Listing 3 with [sqft, bedrooms] = [1800, 3], if we scale sqft by dividing by 1000.0, what will the normalized feature vector be?",
      options: [
        "[1.8, 3.0] (Scaled square footage + bedroom count)",
        "[1800, 3] (Unscaled raw inputs)",
        "[0.18, 30] (Incorrect scaling factor)",
        "[360000, 1800] (Target mixed into features)"
      ],
      correctIndex: 0,
      explanation: "1800 / 1000.0 = 1.8 for sqft, and bedrooms is 3.0."
    }
  },
  {
    id: "model-architecture",
    title: "Linear Decision Function & Price Scoring",
    prereqs: ["feature-engineering"],
    difficulty: 3,
    hook: "Linear regression predicts price by multiplying each feature by a learned weight and adding a baseline intercept.",
    explanationSummary: "The model computes predicted_price = (w_sqft * scaled_sqft) + (w_beds * beds) + bias.",
    corePrinciple: "A linear model computes a weighted combination of inputs plus a bias. The bias acts as the baseline floor price for an empty lot, and the weights represent the dollar premium per unit of each feature.",
    whyItMatters: "Linear models form the foundational decision neuron inside every modern neural network.",
    workedExample: {
      scenario: "Predicting price with weights: w_sqft = $150,000 / 1k sqft, w_beds = $20,000 / bed, bias = $30,000",
      calculationSteps: [
        "Listing 1 [1.2, 2.0]: (1.2 * 150000) + (2.0 * 20000) + 30000 = 180000 + 40000 + 30000 = $250,000",
        "Listing 2 [2.4, 4.0]: (2.4 * 150000) + (4.0 * 20000) + 30000 = 360000 + 80000 + 30000 = $470,000",
        "Listing 3 [1.8, 3.0]: (1.8 * 150000) + (3.0 * 20000) + 30000 = 270000 + 60000 + 30000 = $360,000"
      ],
      takeaway: "Dot product of features and weights plus bias produces the predicted dollar amount."
    },
    buildStep: "Implement predict_price(features, weights, bias) to calculate predicted home values.",
    starterCode: `# Step 3: Linear Decision Function (Price Scoring)
# Formula: predicted_price = sum(feature * weight) + bias

def predict_price(features: list[float], weights: list[float], bias: float = 30000.0) -> float:
    # Fill in the 2 blanks:
    # 1. Sum up feature * weight for all features
    # 2. Add the baseline intercept (bias)
    weighted_sum = ___           # TODO: sum(f * w for f, w in zip(features, weights))
    prediction = ___             # TODO: weighted_sum + bias
    return prediction

# Test with weights: $150k per 1k sqft, $20k per bed, $30k bias
w = [150000.0, 20000.0]
print("Listing 3 predicted:", predict_price([1.8, 3.0], w, 30000.0))
`,
    solutionCode: `def predict_price(features: list[float], weights: list[float], bias: float = 30000.0) -> float:
    weighted_sum = sum(f * w for f, w in zip(features, weights))
    prediction = weighted_sum + bias
    return prediction

w = [150000.0, 20000.0]
print("Listing 3 predicted:", predict_price([1.8, 3.0], w, 30000.0))
`,
    testAssertion: `w = [150000.0, 20000.0]
pred1 = predict_price([1.2, 2.0], w, 30000.0)
if pred1 == 220000.0:
    raise AssertionError("CALCULATION_SLIP: Forgot to add the baseline intercept (bias = $30,000).")
assert abs(pred1 - 250000.0) < 1.0, f"Expected 250000.0, got {pred1}"
pred3 = predict_price([1.8, 3.0], w, 30000.0)
assert abs(pred3 - 360000.0) < 1.0, f"Expected 360000.0, got {pred3}"
print("Assertion Passed: Core decision function verified!")
`,
    predictQuestion: {
      prompt: "Using weights w_sqft = $150,000, w_beds = $20,000, and bias = $30,000, what is the exact price prediction for Listing 3: [sqft=1.8, beds=3.0]?",
      options: [
        "$360,000: (1.8 * 150000) + (3.0 * 20000) + 30000",
        "$270,000: (Forgot bedroom and bias contributions)",
        "$330,000: (Forgot baseline bias intercept)",
        "$450,000: (Double counted bedrooms)"
      ],
      correctIndex: 0,
      explanation: "1.8 * 150k = 270k; 3 * 20k = 60k; 270k + 60k + 30k = $360,000."
    }
  },
  {
    id: "loss-and-optimization",
    title: "Squared Error Loss & Gradient Step",
    prereqs: ["model-architecture"],
    difficulty: 3,
    hook: "When the model estimates $260k for a $250k home, squared loss measures the exact penalty and guides weights downhill.",
    explanationSummary: "Loss measures the gap between prediction and reality. Gradient descent subtracts a fraction of the gradient to reduce future error.",
    corePrinciple: "Squaring the error ((predicted - actual)^2) ensures that penalties are always positive and punishes large mistakes disproportionately.",
    whyItMatters: "Gradient descent is the universal engine powering training across all machine learning models.",
    workedExample: {
      scenario: "Listing 1 actual price is $250,000. Model currently predicts $260,000:",
      calculationSteps: [
        "1. Error = predicted - actual = 260000 - 250000 = +10,000",
        "2. Squared Loss = (10000)^2 = 100,000,000",
        "3. Gradient w.r.t weight is positive -> subtract gradient step to nudge prediction downwards"
      ],
      takeaway: "Gradient descent always steps in the negative direction of the gradient to minimize loss."
    },
    buildStep: "Implement compute_loss(predicted, actual) and update_weight(weight, gradient, lr) for model training.",
    starterCode: `# Step 4: Squared Error Loss & Gradient Step
# Fill in the blanks:
# 1. error = predicted - actual
# 2. squared_loss = error ** 2
# 3. new_weight = weight - (learning_rate * gradient)

def compute_loss(predicted: float, actual: float) -> tuple[float, float]:
    error = ___                  # TODO: predicted - actual
    squared_loss = ___           # TODO: error ** 2
    return error, squared_loss

def update_weight(weight: float, gradient: float, learning_rate: float = 0.01) -> float:
    # Gradient descent moves in the OPPOSITE direction of the slope
    new_weight = ___             # TODO: weight - (learning_rate * gradient)
    return new_weight

err, loss = compute_loss(260000, 250000)
print(f"Error: {err}, Squared Loss: {loss}")
`,
    solutionCode: `def compute_loss(predicted: float, actual: float) -> tuple[float, float]:
    error = predicted - actual
    squared_loss = error ** 2
    return error, squared_loss

def update_weight(weight: float, gradient: float, learning_rate: float = 0.01) -> float:
    new_weight = weight - (learning_rate * gradient)
    return new_weight

err, loss = compute_loss(260000, 250000)
print(f"Error: {err}, Squared Loss: {loss}")
`,
    testAssertion: `err, loss = compute_loss(260000, 250000)
assert err == 10000, f"Expected error 10000, got {err}"
assert loss == 100000000, f"Expected squared loss 100000000, got {loss}"
w_new = update_weight(150000.0, 5000.0, 0.01)
if w_new > 150000.0:
    raise AssertionError("CONCEPTUAL_GAP: Gradient descent subtracts the gradient step to move downhill; adding increases loss!")
assert abs(w_new - 149950.0) < 0.1, f"Expected 149950.0, got {w_new}"
print("Assertion Passed: Loss computation and optimization step verified!")
`,
    predictQuestion: {
      prompt: "If the model predicts $260,000 for a house whose actual price is $250,000 (positive error of $10,000), how should gradient descent adjust the weights?",
      options: [
        "Decrease weights: subtract the gradient step to lower future predictions",
        "Increase weights: add the gradient step to climb uphill",
        "Keep weights unchanged: $10,000 is small enough to ignore",
        "Multiply weights by zero: discard all learned parameters"
      ],
      correctIndex: 0,
      explanation: "Gradient descent steps in the negative gradient direction to reduce error."
    }
  },
  {
    id: "inference-pipeline",
    title: "Interactive Deployment: Real Estate Price Prediction",
    prereqs: ["loss-and-optimization"],
    difficulty: 4,
    hook: "We have our normalizer and decision weights. Now package them into an end-to-end valuation pipeline.",
    explanationSummary: "The inference pipeline takes a raw listing dict, scales features, applies learned weights, and returns a formatted price estimate.",
    corePrinciple: "An end-to-end production pipeline isolates internal numerical scaling from the user, presenting clean actionable predictions.",
    whyItMatters: "Deploying a working inference function turns mathematical code into a real-world software product.",
    workedExample: {
      scenario: "Evaluating a new user listing: 2,000 sqft, 3 bedrooms",
      calculationSteps: [
        "1. normalize_features(2000, 3) -> [2.0, 3.0]",
        "2. predict_price([2.0, 3.0], [150000, 20000], 30000) -> (2.0*150k) + (3.0*20k) + 30k = $390,000",
        "3. Package into user-facing dictionary with rounded price."
      ],
      takeaway: "Raw inputs go in, feature transforms execute, and an accurate price estimate comes out."
    },
    buildStep: "Package estimate_home_value(listing, weights, bias) to power live home valuations.",
    starterCode: `# Step 5: Full Real Estate Valuation Pipeline
# Fill in the blanks:
# 1. Call predict_price with normalized features
# 2. Round the estimated price

def estimate_home_value(listing: dict, weights: list[float], bias: float = 30000.0) -> dict:
    features = normalize_features(listing["sqft"], listing["bedrooms"])
    price_pred = ___             # TODO: predict_price(features, weights, bias)
    return {
        "sqft": listing["sqft"],
        "bedrooms": listing["bedrooms"],
        "estimated_price": round(___, 2)  # TODO: price_pred rounded to 2 decimals
    }

w = [150000.0, 20000.0]
sample_home = {"sqft": 2000, "bedrooms": 3}
print(estimate_home_value(sample_home, w, 30000.0))
`,
    solutionCode: `def estimate_home_value(listing: dict, weights: list[float], bias: float = 30000.0) -> dict:
    features = normalize_features(listing["sqft"], listing["bedrooms"])
    price_pred = predict_price(features, weights, bias)
    return {
        "sqft": listing["sqft"],
        "bedrooms": listing["bedrooms"],
        "estimated_price": round(price_pred, 2)
    }

w = [150000.0, 20000.0]
sample_home = {"sqft": 2000, "bedrooms": 3}
print(estimate_home_value(sample_home, w, 30000.0))
`,
    testAssertion: `w = [150000.0, 20000.0]
res = estimate_home_value({"sqft": 2000, "bedrooms": 3}, weights=w, bias=30000.0)
assert isinstance(res, dict), "estimate_home_value must return a dict"
assert "estimated_price" in res, "Result dict must contain 'estimated_price'"
assert res["estimated_price"] == 390000.0, f"Expected 390000.0, got {res.get('estimated_price')}"
print("Assertion Passed: Full real estate price prediction engine ready for deployment!")
`,
    predictQuestion: {
      prompt: "For a new 2,000 sqft, 3 bedroom listing with weights [150k, 20k] and bias $30k, what will the pipeline output for `estimated_price`?",
      options: [
        "$390,000: (2.0 * 150000) + (3.0 * 20000) + 30000",
        "$300,000: (Forgot bedroom and bias contributions)",
        "$360,000: (Underestimated square footage)",
        "$420,000: (Overestimated square footage)"
      ],
      correctIndex: 0,
      explanation: "2.0 * 150k = 300k, 3 * 20k = 60k, bias = 30k -> $390,000."
    }
  }
];

export const REAL_ESTATE_EDGES: ConceptEdge[] = [
  { from: "problem-framing", to: "feature-engineering" },
  { from: "feature-engineering", to: "model-architecture" },
  { from: "model-architecture", to: "loss-and-optimization" },
  { from: "loss-and-optimization", to: "inference-pipeline" }
];

export const REAL_ESTATE_DIAGNOSTIC_QUESTIONS: DiagnosticQuestion[] = [
  {
    id: "diag-re-1",
    targetConceptId: "problem-framing",
    question: "When predicting real estate prices from house attributes (sqft, bedrooms), what kind of machine learning problem are we solving?",
    options: [
      { text: "Supervised Regression (predicting a continuous numeric price)", isCorrect: true, errorType: "NONE" },
      { text: "Binary Classification (sorting into discrete categories)", isCorrect: false, errorType: "TERMINOLOGY_CONFUSION", rationale: "Prices are continuous quantities along a spectrum, not two discrete categories." },
      { text: "Unsupervised Clustering (grouping houses with no target)", isCorrect: false, errorType: "CONCEPTUAL_GAP", rationale: "We have historical sale prices as ground truth targets." },
      { text: "Reinforcement Learning (agent playing a video game)", isCorrect: false, errorType: "OVERCONFIDENT_MISCONCEPTION", rationale: "We are learning from a static dataset of sales, not an active environment." }
    ]
  },
  {
    id: "diag-re-2",
    targetConceptId: "feature-engineering",
    question: "Why do we scale square footage (e.g. dividing by 1000) before training a linear model?",
    options: [
      { text: "To prevent large numerical values from dominating the gradient updates", isCorrect: true, errorType: "NONE" },
      { text: "Because Python cannot multiply numbers greater than 100", isCorrect: false, errorType: "TERMINOLOGY_CONFUSION", rationale: "Python has arbitrary precision arithmetic; scaling is a mathematical stability technique." },
      { text: "To eliminate the need for training data", isCorrect: false, errorType: "CONCEPTUAL_GAP", rationale: "Scaling does not remove the need for training data." },
      { text: "Because real estate prices are secretly all equal", isCorrect: false, errorType: "OVERCONFIDENT_MISCONCEPTION", rationale: "Home prices vary dramatically based on features." }
    ]
  }
];
