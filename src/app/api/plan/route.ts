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
    const isPlantOrAgri =
      lowerGoal.includes("plant") ||
      lowerGoal.includes("crop") ||
      lowerGoal.includes("leaf") ||
      lowerGoal.includes("leaves") ||
      lowerGoal.includes("botan") ||
      lowerGoal.includes("agri") ||
      lowerGoal.includes("tree") ||
      lowerGoal.includes("garden") ||
      lowerGoal.includes("farm") ||
      lowerGoal.includes("flora");

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
    } else if (isPlantOrAgri) {
      templateId = "plant-disease";
      fallbackConcepts = generateFallbackConceptsForGoal(goal || "");
      fallbackEdges = generateFallbackEdgesForGoal(fallbackConcepts);
      rationale = `Custom agricultural computer vision architecture roadmap reverse-engineered for "${goal}". Guides you through 8 progressive stages: problem formulation, visual feature normalization, pathogen base rates, logit calculation, cross-entropy loss, gradient descent, agronomic triage sensitivity, and an interactive live leaf classifier.`;
    } else if (
      !isPlantOrAgri &&
      (lowerGoal.includes("diabet") ||
        (lowerGoal.includes("disease") && !isPlantOrAgri) ||
        lowerGoal.includes("cancer") ||
        lowerGoal.includes("medical") ||
        lowerGoal.includes("patient") ||
        (lowerGoal.includes("health") && !isPlantOrAgri) ||
        lowerGoal.includes("clinic") ||
        lowerGoal.includes("heart") ||
        lowerGoal.includes("tumor") ||
        lowerGoal.includes("glucose") ||
        (lowerGoal.includes("diagnosis") && !isPlantOrAgri))
    ) {
      templateId = "clinical-diagnosis";
      fallbackConcepts = generateFallbackConceptsForGoal(goal || "");
      fallbackEdges = generateFallbackEdgesForGoal(fallbackConcepts);
      rationale = `Custom clinical diagnostic architecture roadmap reverse-engineered for "${goal}". Guides you through 8 progressive stages: problem formulation, feature normalization, logit scoring, sigmoid risk mapping, cross-entropy loss, gradient descent, clinical triage sensitivity, and an interactive deployment inference pipeline.`;
    } else {
      // Dynamic fallback for any arbitrary custom goal using generateFallbackConceptsForGoal
      templateId = "custom-project";
      fallbackConcepts = generateFallbackConceptsForGoal(goal || "");
      fallbackEdges = generateFallbackEdgesForGoal(fallbackConcepts);
      rationale = `Custom AI architecture roadmap reverse-engineered for "${goal}". Each step guides you through building a functional component of your project pipeline.`;
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
Generate a beginner-friendly DAG concept plan (5 to 8 nodes).

CRITICAL RULES (MUST FOLLOW, NO EXCEPTIONS):
1. DOMAIN-SPECIFIC FEATURES ONLY: Every concept's starterCode and solutionCode must use REAL, named features specific to "${goal}".
   - If goal is "weather predictor" → use temperature, humidity, pressure, wind_speed, cloud_cover
   - If goal is "house price predictor" → use sqft, bedrooms, bathrooms, location_score
   - NEVER use placeholder names like "feature_1", "feature_2", "target_value", "inputs", or any generic names.
2. REAL TRAINING REQUIRED: The model-building step MUST actually train a model on a real synthetic dataset using sklearn.
   - Use sklearn.linear_model, sklearn.ensemble, or sklearn.tree based on what is appropriate.
   - Generate synthetic training data (X_train, y_train) with realistic, domain-specific values.
   - Call model.fit(X_train, y_train) — do NOT just hand-supply weights to a formula.
   - Show model.predict() on new unseen examples.
3. BEGINNER FRIENDLY: Avoid advanced concepts not needed for the project. No abstract math unless essential.
4. Hook questions must create curiosity gaps, NEVER start with an abstract definition.
5. Every step has a concrete build task with starterCode in Python and a working testAssertion.
6. Output MUST strictly match the PlanOutputSchema.`;


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
