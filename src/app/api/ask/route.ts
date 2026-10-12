import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateStructuredLLM, extractLLMRequestCredentials } from "@/lib/llm";
import { Concept, CodingBackground } from "@/lib/types";

const AskSocratesSchema = z.object({
  title: z.string(),
  explanation: z.string(),
  exampleOrFormula: z.string(),
  takeaway: z.string(),
});

function getContextualFallback(
  question: string,
  conceptTitle: string,
  corePrinciple: string,
  goal: string,
  background: CodingBackground,
  concept?: Concept
) {
  const q = (question || "").toLowerCase();

  if (q.includes("supervised") || q.includes("supervise")) {
    return {
      title: "Supervised Learning Explained",
      explanation: `In supervised learning, the algorithm learns from pairs of inputs and known ground-truth labels (for example, patient vitals paired with known disease risk). It adjusts internal mathematical weights so that when presented with a new, unseen patient, it can predict the correct label with high accuracy.`,
      exampleOrFormula: `Training Pair: (x = [heart_rate: 130, blood_pressure: 155], y = 1 [High Risk])\nModel Function: ŷ = σ(w₁·x₁ + w₂·x₂ + b)`,
      takeaway: "Supervised learning gives the model both the inputs and the answer key during training so it learns from its mistakes.",
    };
  }

  if (q.includes("if/else") || q.includes("if else") || q.includes("why not if")) {
    return {
      title: "Why Machine Learning Instead of If/Else Rules",
      explanation: `Handcrafting if/else statements requires human engineers to anticipate every combination of variables, edge cases, and noisy inputs. In real-world data with dozens of continuous measurements (like patient vitals, pixel values, or word frequencies), rules quickly explode into thousands of conflicting conditions that break easily. Machine learning replaces brittle rules with continuous numerical weights that balance all evidence simultaneously.`,
      exampleOrFormula: `Brittle Code: if age > 50 and bp > 140 and chol > 220: ... (fails if bp is 139)\nML Weighting: z = 0.42*age + 0.81*bp + 0.55*chol (gracefully balances all features)`,
      takeaway: "Machine learning trades rigid human-coded boundaries for smooth probabilistic weights that naturally absorb noise and nuance.",
    };
  }

  if (q.includes("analogy") || q.includes("simple analogy") || q.includes("real world")) {
    return {
      title: "An Everyday Intuitive Analogy",
      explanation: `Think of learning to identify ripe fruit at a grocery store. Nobody gave you an exact mathematical formula or a 100-page decision tree. Instead, you observed dozens of past fruits (color, softness, smell) and remembered which ones tasted sweet. Over time, your brain tuned an internal sense of which signals predict a good fruit.`,
      exampleOrFormula: `Features (Color, Softness, Aroma) → Weighted Experience → Accurate Prediction`,
      takeaway: "Like developing an expert intuition, machine learning discovers patterns through repeated exposure to real examples.",
    };
  }

  if (q.includes("unsupervised") || q.includes("clustering")) {
    return {
      title: "Unsupervised Learning Explained",
      explanation: `In unsupervised learning, there are no target labels or answer keys. The algorithm analyzes raw data to discover natural groupings, clusters, or hidden geometric structures on its own.`,
      exampleOrFormula: `Clustering: Grouping patients by vitals into k clusters without pre-existing disease labels.`,
      takeaway: "Unsupervised learning discovers hidden patterns and natural clusters when nobody has labeled the data.",
    };
  }

  if (q.includes("gradient") || q.includes("descent") || q.includes("optimization")) {
    return {
      title: "Gradient Descent Intuition",
      explanation: `Gradient descent is the optimization engine that trains models. It calculates how much the prediction error changes when each weight is tweaked (the gradient), and moves the weights downhill in the direction of lower error.`,
      exampleOrFormula: `Weight Update Rule: w_new = w_old - learning_rate × ∇Loss(w)`,
      takeaway: "Gradient descent rolls the model's parameters downhill like a marble finding the lowest valley of error.",
    };
  }

  if (q.includes("loss") || q.includes("cost") || q.includes("error")) {
    return {
      title: "Loss Functions Explained",
      explanation: `A loss function is a mathematical scoreboard. It compares the model's predicted output against the actual ground-truth target and produces a single penalty number. A lower loss means better predictions.`,
      exampleOrFormula: `Binary Cross-Entropy Loss: -[y·log(p) + (1-y)·log(1-p)]`,
      takeaway: "The loss function gives the model precise mathematical feedback on how badly it missed the target.",
    };
  }

  if (q.includes("feature") || q.includes("vector") || q.includes("pixel") || q.includes("input")) {
    return {
      title: "Feature Vectors Explained",
      explanation: `Computers cannot process raw abstract concepts like 'health' or 'images'. A feature vector converts real-world measurements into an ordered list of numbers so mathematical algorithms can compute distances, dot products, and probabilities.`,
      exampleOrFormula: `Patient Vector: x = [age: 54, bmi: 28.4, resting_hr: 78, sys_bp: 135]`,
      takeaway: "Feature vectors turn messy physical observations into coordinates in high-dimensional mathematical space.",
    };
  }

  // Dynamic context-aware fallback grounded in question, concept, and goal
  return {
    title: `${conceptTitle}: ${question.slice(0, 30)}`,
    explanation: `When working on "${goal}" in the step "${conceptTitle}": ${question.replace(/\?+$/, "")} is fundamental because machine learning models evaluate mathematical representations of data to make predictions. ${corePrinciple || "By adjusting numerical parameters, the algorithm finds the optimal decision boundary between different classes."}`,
    exampleOrFormula: concept?.workedExample
      ? `${concept.workedExample.scenario}\n${concept.workedExample.calculationSteps.slice(0, 2).join("\n")}`
      : `Prediction = Function(Weights · Features + Bias)`,
    takeaway: `Mastering this intuition ensures your Python code for ${conceptTitle} produces dependable, verifiable predictions.`,
  };
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      concept,
      conceptTitle: rawConceptTitle,
      conceptHook: rawConceptHook,
      question,
      background = "beginner",
      goal = "a machine learning project",
    } = body;

    const conceptTitle = concept?.title || rawConceptTitle || "Machine Learning Concepts";
    const corePrinciple = concept?.corePrinciple || concept?.explanationSummary || rawConceptHook || "";
    const buildStep = concept?.buildStep || "";

    // Background adaptation guidelines
    let backgroundGuideline = "";
    if (background === "beginner") {
      backgroundGuideline = "The learner has NO previous coding experience. Use accessible real-life analogies, no intimidating jargon, explain what variables and numbers mean.";
    } else if (background === "other_languages") {
      backgroundGuideline = "The learner knows C++, Java, or JavaScript, but is new to Python and ML. Connect concepts to typed languages (hash maps, arrays, methods, scope) and point out Python idioms.";
    } else {
      backgroundGuideline = "The learner knows Python. Focus directly on the machine learning math, algorithmic efficiency, and probabilistic principles.";
    }

    const systemPrompt = `You are Socrates, a renowned AI and Machine Learning tutor.
You provide deep, intuitive, and mathematically sound explanations.
The learner is building: "${goal}".
Current Step: "${conceptTitle}".
Current Build Task: "${buildStep}".
Foundational Theory: "${corePrinciple}".
Learner Background: ${backgroundGuideline}

RULES:
1. Be concise, intellectually honest, and deeply illuminating.
2. Directly answer their question: "${question}".
3. Provide a concrete worked example with numbers or a short code snippet.
4. Give a memorable one-sentence takeaway.
5. Output ONLY valid JSON adhering to AskSocratesSchema.`;

    const fallbackData = getContextualFallback(
      question,
      conceptTitle,
      corePrinciple,
      goal,
      background as CodingBackground,
      concept
    );

    const { apiKey: activeKey, provider: activeProvider } = extractLLMRequestCredentials(req.headers, body);

    const result = await generateStructuredLLM({
      systemPrompt,
      userPrompt: `Question from learner: "${question}". Current concept: "${conceptTitle}".`,
      schema: AskSocratesSchema,
      fallbackData,
      apiKeyOverride: activeKey,
      provider: activeProvider,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Error in /api/ask:", err);
    return NextResponse.json(
      {
        title: "Socrates Intuition Guide",
        explanation:
          "Machine learning algorithms build mathematical models based on sample data to make predictions without being explicitly programmed.",
        exampleOrFormula: "P(A|B) = P(B|A) * P(A) / P(B)",
        takeaway: "Every machine learning model is an engine converting evidence into decisions.",
      },
      { status: 200 }
    );
  }
}
