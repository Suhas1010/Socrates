import { Concept, ConceptEdge } from "../types";

export const PYTHON_TRACK_CONCEPTS: Concept[] = [
  {
    id: "python-vars",
    title: "1. Python Primitives & Feature Variables",
    prereqs: [],
    difficulty: 1,
    hook: "In machine learning, every patient vital, house measurement, or image pixel is stored as a variable. How does Python represent numbers, text, and flags?",
    explanationSummary: "Variables are named storage containers in computer memory. Python supports integers (e.g. age = 25), floating-point numbers with decimals (e.g. glucose = 142.5), text strings (e.g. label = 'Joy'), and booleans (e.g. is_high_risk = True).",
    corePrinciple: "Data types govern what mathematical operations are legal. Float and int variables allow arithmetic, while string variables store categorical labels.",
    workedExample: {
      scenario: "Storing patient vital measurements before feeding them into an ML model.",
      calculationSteps: [
        "Declare glucose as a floating-point number: glucose = 145.0",
        "Declare patient age as an integer: age = 52",
        "Compute scaled age ratio: age_ratio = age / 100.0 (evaluates to 0.52)",
      ],
      takeaway: "Floats and integers can be freely combined in mathematical expressions to create scaled numerical features.",
    },
    whyItMatters: "Clean variable typing prevents silent casting bugs when training neural networks and computing loss gradients.",
    buildStep: "Declare feature variables with correct data types and calculate the normalized age score.",
    starterCode: `# Step 1: Feature Variables in Python
# Fill in the blanks:
# 1. Assign glucose as a float (145.0)
# 2. Assign age as an integer (52)
# 3. Calculate age_ratio by dividing age by 100.0

def setup_feature_variables():
    glucose = ___      # TODO: assign float 145.0
    age = ___          # TODO: assign integer 52
    age_ratio = ___    # TODO: divide age by 100.0
    
    return {
        "glucose": glucose,
        "age": age,
        "age_ratio": round(age_ratio, 2)
    }

print("Features:", setup_feature_variables())
`,
    solutionCode: `def setup_feature_variables():
    glucose = 145.0
    age = 52
    age_ratio = age / 100.0
    return {
        "glucose": glucose,
        "age": age,
        "age_ratio": round(age_ratio, 2)
    }

print("Features:", setup_feature_variables())
`,
    testAssertion: `res = setup_feature_variables()
assert isinstance(res["glucose"], float), "glucose must be a float (e.g. 145.0)"
assert isinstance(res["age"], int), "age must be an integer (e.g. 52)"
assert res["age_ratio"] == 0.52, f"Expected age_ratio 0.52, got {res['age_ratio']}"
print("Assertion Passed: Python primitive feature variables verified!")
`,
    predictQuestion: {
      prompt: "In Python, what is the data type of the result when you evaluate: 52 / 2 ?",
      options: [
        "float (26.0) — standard division always produces a floating-point number.",
        "int (26) — because both inputs were integers.",
        "string ('26')",
        "An error, Python does not support slash division.",
      ],
      correctIndex: 0,
      explanation: "In Python 3, the / operator always performs true floating-point division, returning 26.0.",
    },
    checkQuestion: {
      prompt: "Why do machine learning algorithms require numerical floats rather than string representations of numbers?",
      options: [
        "Matrix multiplication and gradient descent calculus require continuous floating-point numbers.",
        "Because computers cannot print text.",
        "To make Python files smaller on disk.",
        "Strings only work on Tuesdays.",
      ],
      correctIndex: 0,
      explanation: "Mathematical operations (dot products, exponentiation, derivatives) operate strictly on numeric tensors.",
    },
  },

  {
    id: "python-collections",
    title: "2. Collections for Datasets (Lists & Dictionaries)",
    prereqs: ["python-vars"],
    difficulty: 2,
    hook: "A dataset isn't just one number; it's thousands of records with multiple attributes. How does Python organize tabular and structured data?",
    explanationSummary: "Lists ([1, 2, 3]) store ordered sequences of items, accessed by 0-based indices. Dictionaries ({'key': 'value'}) map unique identifiers to feature values. In ML, a single sample is typically a dictionary, and a dataset is a list of dictionaries.",
    corePrinciple: "List indexing: data[0] grabs the first element. Dictionary lookup: record['feature_name'] retrieves that specific feature in O(1) time.",
    workedExample: {
      scenario: "Representing a patient sample or home record as a dictionary inside a dataset list.",
      calculationSteps: [
        "Define sample = {'glucose': 140, 'bmi': 28.5, 'label': 1}",
        "Access sample['glucose'] -> 140",
        "Append sample to dataset list: dataset.append(sample)",
      ],
      takeaway: "Combining lists and dictionaries creates standard JSON-like tabular dataset structures.",
    },
    whyItMatters: "Nearly all AI datasets in Python (HuggingFace datasets, Pandas DataFrames, PyTorch dataloaders) are accessed using list indexing and dictionary keys.",
    buildStep: "Create a list of feature dictionaries and extract the first sample's target label.",
    starterCode: `# Step 2: Lists and Dictionaries for Datasets
# Fill in the blanks:
# 1. Create a list containing two sample dictionaries
# 2. Extract the label of the first sample using list index [0] and key "label"

def build_dataset_records():
    # Dataset containing two records
    dataset = [
        {"id": 1, "score": 0.85, "label": "positive"},
        {"id": 2, "score": 0.15, "label": "negative"}
    ]
    
    # Extract the first sample and its label
    first_record = dataset[___]         # TODO: index for first element (0)
    first_label = first_record[___]     # TODO: key for label string ("label")
    
    return {
        "dataset_size": len(dataset),
        "first_label": first_label
    }

print("Dataset:", build_dataset_records())
`,
    solutionCode: `def build_dataset_records():
    dataset = [
        {"id": 1, "score": 0.85, "label": "positive"},
        {"id": 2, "score": 0.15, "label": "negative"}
    ]
    first_record = dataset[0]
    first_label = first_record["label"]
    return {
        "dataset_size": len(dataset),
        "first_label": first_label
    }

print("Dataset:", build_dataset_records())
`,
    testAssertion: `res = build_dataset_records()
assert res["dataset_size"] == 2, "Dataset should have length 2"
assert res["first_label"] == "positive", f"Expected 'positive', got {res['first_label']}"
print("Assertion Passed: Python dataset collections verified!")
`,
    predictQuestion: {
      prompt: "If data = ['apple', 'banana', 'cherry'], what is data[1]?",
      options: [
        "'banana' — because Python lists are zero-indexed (index 0 is 'apple', index 1 is 'banana').",
        "'apple' — because index 1 is the first item.",
        "'cherry'",
        "An IndexError",
      ],
      correctIndex: 0,
      explanation: "Python indices begin at 0: index 0 is first, index 1 is second.",
    },
    checkQuestion: {
      prompt: "What is the primary advantage of using a dictionary {'glucose': 140} instead of a raw list [140] for data samples?",
      options: [
        "Dictionaries use explicit feature names as keys, preventing order confusion when columns change.",
        "Dictionaries are always alphabetical.",
        "Lists cannot store numbers greater than 100.",
        "Dictionaries delete themselves automatically.",
      ],
      correctIndex: 0,
      explanation: "Key-value mapping prevents accidental column swaps when preprocessing complex datasets.",
    },
  },

  {
    id: "python-conditions",
    title: "3. Decision Logic & Thresholds (If / Else)",
    prereqs: ["python-collections"],
    difficulty: 2,
    hook: "Once a model calculates a 78% probability, how does code decide whether to trigger an alarm or deliver to inbox?",
    explanationSummary: "Conditional statements (if, elif, else) branch execution based on boolean truth values. In classification models, a decision threshold (e.g. 0.50) partitions probabilities into positive and negative decisions.",
    corePrinciple: "if probability >= threshold: return POSITIVE else: return NEGATIVE.",
    workedExample: {
      scenario: "Applying a medical decision threshold of 0.40 to a calculated risk probability of 0.72.",
      calculationSteps: [
        "Evaluate condition: 0.72 >= 0.40 (True)",
        "Enter the 'if' block",
        "Return decision: 'HIGH RISK'",
      ],
      takeaway: "Comparison operators (>=, <=, ==, !=) convert continuous numbers into discrete triage decisions.",
    },
    whyItMatters: "All AI decision boundaries (from spam filters to autonomous braking) terminate in conditional decision logic.",
    buildStep: "Implement classify_risk_score with a customizable decision threshold.",
    starterCode: `# Step 3: Decision Logic and Thresholding
# Fill in the blanks:
# 1. Check if probability >= threshold
# 2. Return "POSITIVE" if condition is True, else "NEGATIVE"

def classify_risk_score(probability: float, threshold: float = 0.50) -> str:
    if probability ___ threshold:    # TODO: comparison operator for greater than or equal
        return "POSITIVE"
    else:
        return ___                   # TODO: return string "NEGATIVE"

print("Score 0.85:", classify_risk_score(0.85, 0.50))
print("Score 0.20:", classify_risk_score(0.20, 0.50))
`,
    solutionCode: `def classify_risk_score(probability: float, threshold: float = 0.50) -> str:
    if probability >= threshold:
        return "POSITIVE"
    else:
        return "NEGATIVE"

print("Score 0.85:", classify_risk_score(0.85, 0.50))
print("Score 0.20:", classify_risk_score(0.20, 0.50))
`,
    testAssertion: `assert classify_risk_score(0.85, 0.50) == "POSITIVE", "0.85 should classify as POSITIVE"
assert classify_risk_score(0.20, 0.50) == "NEGATIVE", "0.20 should classify as NEGATIVE"
assert classify_risk_score(0.50, 0.50) == "POSITIVE", "Exact threshold match should classify as POSITIVE"
print("Assertion Passed: Decision boundary logic verified!")
`,
    predictQuestion: {
      prompt: "If probability is 0.45 and the clinical threshold is set to 0.40, what does `probability >= threshold` evaluate to?",
      options: [
        "True — because 0.45 is strictly greater than 0.40.",
        "False — because 0.45 is less than 0.50.",
        "None",
        "0.05",
      ],
      correctIndex: 0,
      explanation: "0.45 is greater than 0.40, so the boolean comparison evaluates to True.",
    },
    checkQuestion: {
      prompt: "Why would a healthcare AI team lower their decision threshold from 0.50 to 0.35?",
      options: [
        "To increase clinical sensitivity (recall) and catch more at-risk patients, even if it causes a few more false alarms.",
        "To make the code execute twice as fast.",
        "Because computers prefer odd numbers.",
        "To delete healthy patient records.",
      ],
      correctIndex: 0,
      explanation: "Lowering the decision threshold makes the classifier more sensitive, prioritizing catching critical conditions over specificity.",
    },
  },

  {
    id: "python-functions",
    title: "4. Reusable Functions & Data Contracts (def)",
    prereqs: ["python-conditions"],
    difficulty: 3,
    hook: "You don't want to copy-paste math code for every single prediction. How do we wrap logic into clean, reusable functions?",
    explanationSummary: "Functions are declared using `def function_name(arguments):`. They accept inputs, execute an internal calculation pipeline, and return outputs. Modular functions allow building pipelines that scale to millions of predictions.",
    corePrinciple: "A function is a mathematical mapping f(x) -> y. Inputs are parameters; the output is specified by `return`.",
    workedExample: {
      scenario: "Creating a normalization function that maps any raw vital measurement into a 0.0 to 1.0 interval.",
      calculationSteps: [
        "Define def normalize(val, min_v, max_v):",
        "Compute ratio = (val - min_v) / (max_v - min_v)",
        "return max(0.0, min(1.0, ratio))",
      ],
      takeaway: "Encapsulating normalization inside a function guarantees consistent transformations across training and inference.",
    },
    whyItMatters: "Modern ML frameworks (PyTorch, Scikit-Learn) structure all transformers and model layers as modular callable functions or classes.",
    buildStep: "Write a complete normalize_feature function that maps raw values onto [0.0, 1.0].",
    starterCode: `# Step 4: Reusable Normalization Function
# Fill in the blanks:
# 1. Calculate the scaled fraction: (val - min_val) / (max_val - min_val)
# 2. Return the clamped value using max and min

def normalize_feature(val: float, min_val: float, max_val: float) -> float:
    # 1. Scale ratio
    span = max_val - min_val
    scaled = (val - ___) / span          # TODO: subtract which minimum value?
    
    # 2. Clamp between 0.0 and 1.0
    clamped = max(0.0, min(1.0, ___))     # TODO: clamp the scaled value
    return round(clamped, 3)

print("Normalizing 135 in range [70, 200]:", normalize_feature(135, 70, 200))
`,
    solutionCode: `def normalize_feature(val: float, min_val: float, max_val: float) -> float:
    span = max_val - min_val
    scaled = (val - min_val) / span
    clamped = max(0.0, min(1.0, scaled))
    return round(clamped, 3)

print("Normalizing 135 in range [70, 200]:", normalize_feature(135, 70, 200))
`,
    testAssertion: `assert normalize_feature(70, 70, 200) == 0.0, "Minimum value should scale to 0.0"
assert normalize_feature(200, 70, 200) == 1.0, "Maximum value should scale to 1.0"
assert normalize_feature(135, 70, 200) == 0.5, f"Midpoint 135 should scale to 0.5, got {normalize_feature(135, 70, 200)}"
assert normalize_feature(250, 70, 200) == 1.0, "Values above maximum should clamp to 1.0"
print("Assertion Passed: Reusable normalization function verified!")
`,
    predictQuestion: {
      prompt: "What happens if a Python function finishes execution without an explicit `return` statement?",
      options: [
        "It returns `None` automatically.",
        "It crashes the entire operating system.",
        "It returns 0.",
        "It repeats from the beginning forever.",
      ],
      correctIndex: 0,
      explanation: "Functions without a return statement implicitly return Python's None object.",
    },
    checkQuestion: {
      prompt: "Why is default parameter assignment (e.g. `def predict(x, threshold=0.50):`) useful in machine learning APIs?",
      options: [
        "It provides sensible baseline behavior out of the box while still allowing advanced tuning when needed.",
        "It disables all error messages.",
        "It forces the user to type more code.",
        "It makes variables global.",
      ],
      correctIndex: 0,
      explanation: "Default arguments provide ergonomic APIs where standard parameters are pre-configured.",
    },
  },

  {
    id: "python-loops",
    title: "5. Iterating Datasets & Accumulators (Loops & Comprehensions)",
    prereqs: ["python-functions"],
    difficulty: 3,
    hook: "A model must score 10,000 incoming user requests every minute. How do we iterate through collections efficiently in Python?",
    explanationSummary: "For loops iterate across sequences: `for item in dataset:`. Accumulators accumulate running metrics (e.g. calculating total squared error or mean accuracy). List comprehensions ([f(x) for x in list]) provide concise, expressive vector transformations.",
    corePrinciple: "List comprehension syntax: `[transform(x) for x in collection if condition]`. Iterates and transforms in a single optimized pass.",
    workedExample: {
      scenario: "Extracting all predictions from a cohort and calculating the average score.",
      calculationSteps: [
        "scores = [sample['prob'] for sample in cohort]",
        "total = sum(scores)",
        "mean = total / len(scores)",
      ],
      takeaway: "Combining sum(), len(), and list comprehensions computes aggregate performance metrics cleanly.",
    },
    whyItMatters: "Batch processing and mini-batch gradient descent loop through subsets of data on every optimization epoch.",
    buildStep: "Compute the average prediction confidence score across a list of test cohort samples.",
    starterCode: `# Step 5: Loops and Aggregations
# Fill in the blanks:
# 1. Extract all confidence scores using a list comprehension
# 2. Compute the mean by dividing the sum by the count

def calculate_cohort_mean(cohort_records: list) -> float:
    # 1. Extract scores from dictionary list
    scores = [record[___] for record in cohort_records]   # TODO: dictionary key "score"
    
    # 2. Compute average
    total = sum(scores)
    mean = total / ___                                    # TODO: divide by count using len()
    return round(mean, 3)

sample_cohort = [{"id": 1, "score": 0.90}, {"id": 2, "score": 0.70}, {"id": 3, "score": 0.80}]
print("Cohort Mean:", calculate_cohort_mean(sample_cohort))
`,
    solutionCode: `def calculate_cohort_mean(cohort_records: list) -> float:
    scores = [record["score"] for record in cohort_records]
    total = sum(scores)
    mean = total / len(scores)
    return round(mean, 3)

sample_cohort = [{"id": 1, "score": 0.90}, {"id": 2, "score": 0.70}, {"id": 3, "score": 0.80}]
print("Cohort Mean:", calculate_cohort_mean(sample_cohort))
`,
    testAssertion: `test_data = [{"score": 0.90}, {"score": 0.70}, {"score": 0.80}]
assert calculate_cohort_mean(test_data) == 0.80, f"Expected mean 0.80, got {calculate_cohort_mean(test_data)}"
single = [{"score": 0.42}]
assert calculate_cohort_mean(single) == 0.42, "Single item cohort mean should equal the item score"
print("Assertion Passed: Iteration and accumulator aggregation verified!")
`,
    predictQuestion: {
      prompt: "What does `[x * 2 for x in [1, 2, 3]]` evaluate to?",
      options: [
        "[2, 4, 6] — it applies `x * 2` to every item in the list.",
        "[1, 2, 3, 1, 2, 3]",
        "12",
        "[2, 2, 2]",
      ],
      correctIndex: 0,
      explanation: "List comprehensions iterate through each element, evaluate the expression (x * 2), and collect results into a new list.",
    },
    checkQuestion: {
      prompt: "Why are list comprehensions favored over manual for-loop appends in Python data science?",
      options: [
        "They are more concise, readable, and execute faster in Python's underlying C runtime.",
        "They use less electricity.",
        "Manual for-loops were removed from Python.",
        "List comprehensions never have bugs.",
      ],
      correctIndex: 0,
      explanation: "List comprehensions are optimized at the bytecode level, avoiding method lookup overhead of manual list.append().",
    },
  },

  {
    id: "python-math-ai",
    title: "6. Scientific Vector Math & Sigmoid Activation",
    prereqs: ["python-loops"],
    difficulty: 4,
    hook: "Neural networks and logistic regression are fundamentally built on two operations: the dot product and the Sigmoid activation. How do we code them in pure Python?",
    explanationSummary: "A linear model computes a dot product: z = sum(w * x) + bias. The Sigmoid activation function maps that raw score z into a calibrated probability between 0.0 and 1.0 using Euler's number: Sigmoid(z) = 1 / (1 + e^-z). In Python, we import the `math` library for `math.exp()`.",
    corePrinciple: "Vector dot product: sum(w * x for w, x in zip(weights, inputs)) + bias. Activation: 1.0 / (1.0 + math.exp(-z)).",
    workedExample: {
      scenario: "Computing an AI prediction from 3 normalized features using weights [2.0, 1.5, -1.0] and bias -0.5.",
      calculationSteps: [
        "Features x = [0.8, 0.6, 0.2]",
        "z = (2.0*0.8) + (1.5*0.6) + (-1.0*0.2) + (-0.5) = 1.6 + 0.9 - 0.2 - 0.5 = 1.8",
        "Probability = 1 / (1 + exp(-1.8)) = 1 / (1 + 0.1653) = 0.858 (85.8%)",
      ],
      takeaway: "Combining linear dot products with non-linear Sigmoid functions is the foundational atom of deep neural networks.",
    },
    whyItMatters: "Every artificial neuron in modern deep learning (from perceptrons to multi-billion parameter transformers) relies on weighted sums and activation functions.",
    buildStep: "Implement pure Python dot product and Sigmoid activation functions from scratch.",
    starterCode: `# Step 6: Scientific Math & Sigmoid Activation
# Fill in the blanks:
# 1. Compute dot product using zip(weights, features) and sum()
# 2. Implement Sigmoid using math.exp(-z)

import math

def compute_linear_logit(weights: list, features: list, bias: float) -> float:
    # Weighted dot product: sum(w * x) + bias
    weighted_sum = sum(w * x for w, x in ___(weights, features))  # TODO: built-in function to pair lists (zip)
    return weighted_sum + bias

def sigmoid_activation(z: float) -> float:
    # Sigmoid formula: 1 / (1 + e^-z)
    prob = 1.0 / (1.0 + math.exp(___))                           # TODO: negative z (-z)
    return round(prob, 4)

# Test run
test_weights = [2.0, 1.5, -1.0]
test_features = [0.8, 0.6, 0.2]
test_bias = -0.5

z = compute_linear_logit(test_weights, test_features, test_bias)
prob = sigmoid_activation(z)
print(f"Logit: {z}, Probability: {prob * 100}%")
`,
    solutionCode: `import math

def compute_linear_logit(weights: list, features: list, bias: float) -> float:
    weighted_sum = sum(w * x for w, x in zip(weights, features))
    return weighted_sum + bias

def sigmoid_activation(z: float) -> float:
    prob = 1.0 / (1.0 + math.exp(-z))
    return round(prob, 4)

test_weights = [2.0, 1.5, -1.0]
test_features = [0.8, 0.6, 0.2]
test_bias = -0.5
z = compute_linear_logit(test_weights, test_features, test_bias)
prob = sigmoid_activation(z)
print(f"Logit: {z}, Probability: {prob * 100}%")
`,
    testAssertion: `import math
z = compute_linear_logit([2.0, 1.5, -1.0], [0.8, 0.6, 0.2], -0.5)
assert round(z, 2) == 1.8, f"Expected logit 1.8, got {z}"
p = sigmoid_activation(0.0)
assert p == 0.5, f"Sigmoid(0.0) must equal 0.5, got {p}"
p_pos = sigmoid_activation(z)
assert p_pos > 0.85 and p_pos < 0.87, f"Expected prob ~0.858, got {p_pos}"
print("Assertion Passed: Full vector dot product and Sigmoid engine verified!")
`,
    predictQuestion: {
      prompt: "What does the Sigmoid function output when the input logit z is exactly 0.0?",
      options: [
        "0.50 (50%) — because 1 / (1 + e^0) = 1 / (1 + 1) = 1/2.",
        "0.0",
        "1.0",
        "Infinity",
      ],
      correctIndex: 0,
      explanation: "Since e^0 = 1, Sigmoid(0) = 1 / (1 + 1) = 0.5 (representing equal 50/50 uncertainty at the decision boundary).",
    },
    checkQuestion: {
      prompt: "What does the built-in `zip(list1, list2)` function do in Python?",
      options: [
        "It pairs corresponding elements from two lists into tuples: [(list1[0], list2[0]), (list1[1], list2[1]), ...].",
        "It compresses the lists into a .zip file on disk.",
        "It removes duplicate elements.",
        "It reverses the lists.",
      ],
      correctIndex: 0,
      explanation: "zip() pairs items from parallel sequences together, enabling clean simultaneous iteration over weights and features.",
    },
  },
];

export const PYTHON_TRACK_EDGES: ConceptEdge[] = [
  { from: "python-vars", to: "python-collections" },
  { from: "python-collections", to: "python-conditions" },
  { from: "python-conditions", to: "python-functions" },
  { from: "python-functions", to: "python-loops" },
  { from: "python-loops", to: "python-math-ai" },
];
