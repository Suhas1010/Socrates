import { NextRequest, NextResponse } from "next/server";
import { generateStructuredLLM, PlanOutputSchema } from "@/lib/llm";
import {
  SPAM_CLASSIFIER_CONCEPTS,
  SPAM_CLASSIFIER_EDGES,
} from "@/lib/templates/spamClassifier";
import {
  DIGIT_RECOGNIZER_CONCEPTS,
  DIGIT_RECOGNIZER_EDGES,
} from "@/lib/templates/digitRecognizer";
import {
  CHATGPT_CONCEPTS,
  CHATGPT_EDGES,
} from "@/lib/templates/chatGpt";
import {
  SENTIMENT_ANALYSIS_CONCEPTS,
  SENTIMENT_ANALYSIS_EDGES,
} from "@/lib/templates/sentimentAnalysis";
import {
  REAL_ESTATE_CONCEPTS,
  REAL_ESTATE_EDGES,
} from "@/lib/templates/realEstate";
import {
  generateFallbackConceptsForGoal,
  generateFallbackEdgesForGoal,
} from "@/lib/diagnostics";

export async function POST(req: NextRequest) {
  let requestedGoal = "Your AI Project";
  try {
    const body = await req.json();
    const { goal, interests, background, apiKey } = body;
    if (goal) requestedGoal = goal;
    const headerKey = req.headers.get("x-gemini-api-key");
    const activeKey = apiKey || headerKey || undefined;

    const lowerGoal = (goal || "").toLowerCase();
    let templateId = "custom";
    let fallbackConcepts = generateFallbackConceptsForGoal(goal || "");
    let fallbackEdges = generateFallbackEdgesForGoal(fallbackConcepts);
    let rationale = `Custom AI path designed specifically to build "${goal}".`;

    if (
      lowerGoal.includes("chatgpt") ||
      lowerGoal.includes("gpt") ||
      lowerGoal.includes("llm") ||
      lowerGoal.includes("transformer") ||
      lowerGoal.includes("attention") ||
      lowerGoal.includes("language model")
    ) {
      templateId = "chatgpt";
      fallbackConcepts = CHATGPT_CONCEPTS;
      fallbackEdges = CHATGPT_EDGES;
      rationale =
        "Tailored transformer & generative language model path: from subword tokenization and high-dimensional embeddings to self-attention and autoregressive generation.";
    } else if (
      lowerGoal.includes("sentiment") ||
      lowerGoal.includes("movie") ||
      lowerGoal.includes("review") ||
      lowerGoal.includes("polarity")
    ) {
      templateId = "sentiment-analysis";
      fallbackConcepts = SENTIMENT_ANALYSIS_CONCEPTS;
      fallbackEdges = SENTIMENT_ANALYSIS_EDGES;
      rationale =
        "Tailored Natural Language Processing path to classify sentiment and reviews using vocabulary weights, text preprocessing, and calibrated probability modeling.";
    } else if (
      lowerGoal.includes("digit") ||
      lowerGoal.includes("handwriting") ||
      lowerGoal.includes("mnist") ||
      lowerGoal.includes("vision") ||
      lowerGoal.includes("image")
    ) {
      templateId = "digit-recognizer";
      fallbackConcepts = DIGIT_RECOGNIZER_CONCEPTS;
      fallbackEdges = DIGIT_RECOGNIZER_EDGES;
      rationale =
        "Tailored neural network path derived to recognize handwritten digits from raw pixels using linear scoring, softmax probabilities, and gradient optimization.";
    } else if (
      lowerGoal.includes("spam") ||
      lowerGoal.includes("email") ||
      lowerGoal.includes("bayes")
    ) {
      templateId = "spam-classifier";
      fallbackConcepts = SPAM_CLASSIFIER_CONCEPTS;
      fallbackEdges = SPAM_CLASSIFIER_EDGES;
      rationale =
        "Tailored machine learning path derived directly from your goal to build a high-performance text spam classifier from scratch using Bayesian principles.";
    } else if (
      lowerGoal.includes("real estate") ||
      lowerGoal.includes("house") ||
      lowerGoal.includes("housing") ||
      lowerGoal.includes("property") ||
      lowerGoal.includes("price prediction")
    ) {
      templateId = "real-estate";
      fallbackConcepts = REAL_ESTATE_CONCEPTS;
      fallbackEdges = REAL_ESTATE_EDGES;
      rationale =
        "Tailored machine learning regression path derived directly from your goal to predict real estate prices from house attributes.";
    } else {
      // Dynamic fallback for any arbitrary custom goal
      const safeGoalTitle = goal ? goal.slice(0, 40) : "Custom AI Project";
      templateId = "custom-project";
      rationale = `Custom AI architecture roadmap reverse-engineered for "${goal}". Each step guides you through building a functional component of your project.`;
      fallbackConcepts = [
        {
          id: "problem-framing",
          title: `Problem Formulation: ${safeGoalTitle}`,
          prereqs: [],
          difficulty: 1,
          hook: `Before writing code for ${safeGoalTitle}, what features does the model take in and what single quantity does it predict?`,
          explanationSummary: `Every machine learning project begins by defining the input features and target output space (continuous regression or discrete classification).`,
          buildStep: `Define the input/output specification contract for ${safeGoalTitle}.`,
          starterCode: `# Step 1: Input/Output Contract for ${safeGoalTitle}
# Fill in the blanks:
# 1. Is this "regression" or "classification"?
# 2. What input features does the model observe?
# 3. What is the target to predict?

def define_project_spec():
    return {
        "project": "${safeGoalTitle}",
        "task_type": ___,        # TODO: "regression" or "classification"?
        "inputs": [___],         # TODO: list the input feature names as strings
        "target": ___            # TODO: what single value is it predicting?
    }

print("Spec:", define_project_spec())
`,
          solutionCode: `def define_project_spec():
    return {
        "project": "${safeGoalTitle}",
        "task_type": "regression",
        "inputs": ["feature_1", "feature_2"],
        "target": "target_value"
    }

print("Spec:", define_project_spec())
`,
          testAssertion: `spec = define_project_spec()
assert isinstance(spec, dict), "define_project_spec() must return a dictionary"
task_type = str(spec.get("task_type", "")).lower().strip()
assert task_type != "___" and task_type != "", "Blank 'task_type' is not filled in yet. Choose 'regression' or 'classification'."
inputs = spec.get("inputs", [])
assert isinstance(inputs, list), "'inputs' must be a list of feature names"
assert len(inputs) > 0 and inputs != ["___"], "Blank 'inputs' is not filled in yet."
target = str(spec.get("target", "")).lower().strip()
assert target != "___" and target != "", "Blank 'target' is not filled in yet."
assert target not in [str(x).lower() for x in inputs], "TARGET_LEAKAGE: Target cannot be in the inputs list!"
print("Assertion Passed: Project specification verified!")
`,
          predictQuestion: {
            prompt: `For ${safeGoalTitle}, what should go into the model's 'inputs' list, and what should the 'target' be?`,
            options: [
              "inputs: observable features, target: outcome to predict",
              "inputs: target to predict, target: observable features",
              "inputs: model weights, target: gradient loss",
              "inputs: training code, target: compiler output"
            ],
            correctIndex: 0,
            explanation: "Inputs are the observable features known beforehand; target is what the model predicts."
          }
        },
        {
          id: "feature-engineering",
          title: "Feature Extraction & Data Representation",
          prereqs: ["problem-framing"],
          difficulty: 2,
          hook: `Raw real-world data is messy. How do we convert diverse inputs into a clean numeric matrix?`,
          explanationSummary: `Computers only perform arithmetic on numbers. Transforming domain-specific inputs into structured numerical tensors is the foundation of model learning.`,
          buildStep: `Build the normalization and numerical vectorization transform for incoming project data.`,
          starterCode: `# Step 2: Numerical Feature Vectorization
# Complete the blank to convert raw inputs into float values:

def vectorize_features(raw_data: list) -> list[float]:
    # Extract numerical vector by converting each valid item to float
    clean_vector = [___ for x in raw_data if isinstance(x, (int, float))]  # TODO: float(x)
    return clean_vector

print("Vector:", vectorize_features([10, 20.5, "ignore", 30]))
`,
          solutionCode: `def vectorize_features(raw_data: list) -> list[float]:
    clean_vector = [float(x) for x in raw_data if isinstance(x, (int, float))]
    return clean_vector

print("Vector:", vectorize_features([10, 20.5, "ignore", 30]))
`,
          testAssertion: `res = vectorize_features([1, 2, "a", 3.5])
assert res == [1.0, 2.0, 3.5], f"Expected [1.0, 2.0, 3.5], got {res}"
print("Assertion Passed: Feature vectorizer operational!")
`,
          predictQuestion: {
            prompt: "Why must non-numeric values (like text labels or missing markers) be converted or filtered during feature vectorization?",
            options: [
              "Matrix multiplication and gradient updates require pure numerical floats",
              "Text uses more disk storage than floats",
              "Python prohibits mixing strings and numbers in lists",
              "Neural networks can only run on integers"
            ],
            correctIndex: 0,
            explanation: "Mathematical optimization algorithms require numerical tensors to compute dot products and derivatives."
          }
        },
        {
          id: "model-architecture",
          title: "Core Decision Function & Scoring",
          prereqs: ["feature-engineering"],
          difficulty: 3,
          hook: `Once features are numbers, what mathematical function decides the output prediction?`,
          explanationSummary: `Machine learning models map feature vectors to predictions using parameterized mathematical functions whose weights are optimized during training.`,
          buildStep: `Implement the parameterized scoring function that maps features to class scores.`,
          starterCode: `# Step 3: Parameterized Decision Function
# Formula: score = sum(feature * weight) + bias

def predict_score(features: list[float], weights: list[float], bias: float = 0.0) -> float:
    # Fill in the blanks:
    # 1. Compute dot product
    # 2. Add bias intercept
    weighted_sum = ___           # TODO: sum(f * w for f, w in zip(features, weights))
    score = ___                  # TODO: weighted_sum + bias
    return score

print("Score:", predict_score([1.0, 2.0], [0.5, 1.5], 0.1))
`,
          solutionCode: `def predict_score(features: list[float], weights: list[float], bias: float = 0.0) -> float:
    weighted_sum = sum(f * w for f, w in zip(features, weights))
    score = weighted_sum + bias
    return score

print("Score:", predict_score([1.0, 2.0], [0.5, 1.5], 0.1))
`,
          testAssertion: `score = predict_score([2.0], [3.0], 1.0)
assert score == 7.0, f"Expected 7.0, got {score}"
print("Assertion Passed: Core decision function verified!")
`,
          predictQuestion: {
            prompt: "For input features [2.0] with weight [3.0] and bias 1.0, what is the computed linear prediction?",
            options: [
              "7.0: (2.0 * 3.0) + 1.0",
              "6.0: Forgot to add bias",
              "5.0: Subtracted bias instead of adding",
              "8.0: Multiplied by bias"
            ],
            correctIndex: 0,
            explanation: "(2.0 * 3.0) + 1.0 = 6.0 + 1.0 = 7.0."
          }
        },
        {
          id: "loss-and-optimization",
          title: "Loss Function & Model Optimization",
          prereqs: ["model-architecture"],
          difficulty: 3,
          hook: `When the model guesses wrong, how do we measure the exact error and guide it in the right direction?`,
          explanationSummary: `A loss function calculates the numerical distance between the model's prediction and ground truth. Gradients show how to adjust weights to reduce future mistakes.`,
          buildStep: `Calculate the prediction loss and compute weight updates via gradient descent.`,
          starterCode: `# Step 4: Loss Calculation & Gradient Update
# Fill in the blanks:
# 1. Calculate prediction error
# 2. Update weight: weight - (learning_rate * gradient)

def compute_loss_and_update(weight: float, feature: float, target: float, learning_rate: float = 0.01):
    prediction = weight * feature
    error = ___                  # TODO: prediction - target
    gradient = error * feature
    updated_weight = ___         # TODO: weight - (learning_rate * gradient)
    return updated_weight, error ** 2

w, loss = compute_loss_and_update(1.0, 2.0, 4.0)
print(f"Updated weight: {w}, Loss: {loss}")
`,
          solutionCode: `def compute_loss_and_update(weight: float, feature: float, target: float, learning_rate: float = 0.01):
    prediction = weight * feature
    error = prediction - target
    gradient = error * feature
    updated_weight = weight - (learning_rate * gradient)
    return updated_weight, error ** 2

w, loss = compute_loss_and_update(1.0, 2.0, 4.0)
print(f"Updated weight: {w}, Loss: {loss}")
`,
          testAssertion: `w, l = compute_loss_and_update(1.0, 2.0, 4.0)
assert w > 1.0, "Weight should increase towards target"
assert l == 4.0, f"Expected loss 4.0, got {l}"
print("Assertion Passed: Optimization step verified!")
`,
          predictQuestion: {
            prompt: "If current weight is 1.0, feature is 2.0 (prediction = 2.0), and target is 4.0, should the weight increase or decrease?",
            options: [
              "Increase: prediction is too low, weight must increase to reach 4.0",
              "Decrease: lower weights always reduce loss",
              "Stay at 1.0: 2.0 is close enough",
              "Reset to 0.0: restart optimization from scratch"
            ],
            correctIndex: 0,
            explanation: "Prediction (2.0) is below target (4.0), so the optimizer increases the weight."
          }
        },
        {
          id: "inference-pipeline",
          title: `Interactive Deployment: ${safeGoalTitle}`,
          prereqs: ["loss-and-optimization"],
          difficulty: 4,
          hook: `We have the model logic and weights. How do we wrap this into an interactive pipeline that users can test live?`,
          explanationSummary: `An inference pipeline connects feature transforms and model evaluation into a single call, generating real-time predictions for end users.`,
          buildStep: `Package the complete end-to-end inference engine for ${safeGoalTitle}.`,
          starterCode: `# Step 5: Complete Inference Engine for ${safeGoalTitle}
# Complete the blanks to vectorize and score incoming inputs:

def run_project_inference(user_input: list, weights: list[float]) -> dict:
    features = vectorize_features(user_input)
    score = ___                  # TODO: predict_score(features, weights)
    confidence = 1.0 / (1.0 + (2.71828 ** (-abs(score))))
    return {
        "input": user_input,
        "prediction": "Positive" if score >= 0 else "Negative",
        "confidence": round(___, 3)  # TODO: confidence rounded
    }

print(run_project_inference([1.0, 2.0], [0.5, 0.8]))
`,
          solutionCode: `def run_project_inference(user_input: list, weights: list[float]) -> dict:
    features = vectorize_features(user_input)
    score = predict_score(features, weights)
    confidence = 1.0 / (1.0 + (2.71828 ** (-abs(score))))
    return {
        "input": user_input,
        "prediction": "Positive" if score >= 0 else "Negative",
        "confidence": round(confidence, 3)
    }

print(run_project_inference([1.0, 2.0], [0.5, 0.8]))
`,
          testAssertion: `res = run_project_inference([2.0], [1.0])
assert "prediction" in res and "confidence" in res
print("Assertion Passed: Project inference pipeline operational!")
`,
          predictQuestion: {
            prompt: "What is the primary role of an end-to-end inference pipeline in production AI?",
            options: [
              "Transforms raw user input into features and evaluates the decision model in one call",
              "Retrains all network weights from scratch on every user query",
              "Disables all mathematical checks to run faster",
              "Deletes user inputs after prediction"
            ],
            correctIndex: 0,
            explanation: "An inference pipeline executes the trained feature transforms and scoring function on live inputs."
          }
        }
      ];
      fallbackEdges = [
        { from: "problem-framing", to: "feature-engineering" },
        { from: "feature-engineering", to: "model-architecture" },
        { from: "model-architecture", to: "loss-and-optimization" },
        { from: "loss-and-optimization", to: "inference-pipeline" }
      ];
    }

    const fallbackData = {
      templateId,
      rationale,
      concepts: fallbackConcepts,
      edges: fallbackEdges,
      startingConceptId: fallbackConcepts[0].id,
    };

    const systemPrompt = `You are Socrates, an expert AI tutor. A learner wants to build: "${goal}".
Learner coding background: "${background || "beginner"}".
Learner personal interests: "${interests || "general tech"}".
Generate a DAG concept plan (5 to 8 nodes).
RULES:
1. Every concept must be directly required for their project: "${goal}". Do NOT output a generic spam classifier unless their project is actually about spam!
2. Hook questions must create curiosity gaps, NEVER start with an abstract definition.
3. Every step has a concrete build task with starterCode in Python and a working testAssertion.
4. Output MUST strictly match the PlanOutputSchema.`;

    const plan = await generateStructuredLLM({
      systemPrompt,
      userPrompt: `Goal: "${goal}". Interests: "${interests}". Return the concept graph DAG JSON.`,
      schema: PlanOutputSchema,
      fallbackData,
      apiKeyOverride: activeKey,
    });

    return NextResponse.json(plan);
  } catch (error: any) {
    console.error("Error in /api/plan:", error);
    const safeGoal = requestedGoal;
    const fbConcepts = generateFallbackConceptsForGoal(safeGoal);
    const fbEdges = generateFallbackEdgesForGoal(fbConcepts);
    return NextResponse.json(
      {
        templateId: "custom",
        rationale: `Socrates learning roadmap for "${safeGoal}".`,
        concepts: fbConcepts,
        edges: fbEdges,
        startingConceptId: fbConcepts[0]?.id || "problem-framing",
      },
      { status: 200 }
    );
  }
}
