import { NextRequest, NextResponse } from "next/server";
import { generateStructuredLLM, TeachOutputSchema } from "@/lib/llm";
import { SPAM_CLASSIFIER_CONCEPTS } from "@/lib/templates/spamClassifier";
import { DIGIT_RECOGNIZER_CONCEPTS } from "@/lib/templates/digitRecognizer";
import { generateFallbackConceptsForGoal } from "@/lib/diagnostics";

export async function POST(req: NextRequest) {
  let reqConcept: any = null;
  let reqProfile: any = {};
  try {
    const body = await req.json();
    const { concept, profile = {}, lastDiagnosis } = body;
    reqConcept = concept;
    reqProfile = profile;

    const allConcepts = [...SPAM_CLASSIFIER_CONCEPTS, ...DIGIT_RECOGNIZER_CONCEPTS];
    const matchedConcept =
      (concept && concept.title ? concept : null) ||
      allConcepts.find((c) => c.id === concept?.id) ||
      generateFallbackConceptsForGoal(profile.goal || "")[0] ||
      SPAM_CLASSIFIER_CONCEPTS[0];

    // Determine strategy based on last diagnosis (§6.3)
    let strategy: "analogy" | "contrast" | "worked_example" | "counterexample" = "analogy";
    if (lastDiagnosis?.errorType === "TERMINOLOGY_CONFUSION") {
      strategy = "contrast";
    } else if (lastDiagnosis?.errorType === "CALCULATION_SLIP") {
      strategy = "worked_example";
    } else if (lastDiagnosis?.errorType === "OVERCONFIDENT_MISCONCEPTION") {
      strategy = "counterexample";
    }

    const interests = profile.interests || "everyday applications";
    const projectTitle = profile.goal || "your machine learning project";
    const isSpam = projectTitle.toLowerCase().includes("spam") || projectTitle.toLowerCase().includes("email");

    // Build tailored explanation based on strategy and learner interests
    let explanationText = matchedConcept.explanationSummary || "";
    let exampleText = "";

    if (strategy === "analogy") {
      explanationText = `Think of this like in ${interests}: When filtering signal from noise for ${projectTitle}, your system pattern matches critical feature indicators. ${explanationText}`;
      exampleText = isSpam
        ? `For instance, if someone offers you a "FREE luxury car", you immediately assess how rare that is compared to normal messages.`
        : `For instance, when evaluating ${projectTitle}, key predictive features strongly shift your model's confidence toward the target outcome.`;
    } else if (strategy === "contrast") {
      explanationText = `Notice the crucial contrast: We are not just matching surface values; we are calculating conditional likelihood ratios. ${explanationText}`;
      exampleText = isSpam
        ? `Contrast P(Word | Spam) with P(Spam | Word): One is how frequently spammers use the phrase; the other is your posterior certainty upon reading it.`
        : `Contrast P(Feature | Target) with P(Target | Feature): One is the feature prevalence in the target cohort; the other is your posterior probability upon observing the measurement.`;
    } else if (strategy === "worked_example") {
      explanationText = `Let's work through the exact numbers from our dataset for ${projectTitle}: ${explanationText}`;
      exampleText = isSpam
        ? `Given 100 spam messages and 100 normal messages: If 'win' appears in 40 spam and 2 normal, smoothed likelihood is (40+1)/(100+V) vs (2+1)/(100+V).`
        : `Given 100 historical training samples: If an indicator appears in 40 target cases and only 2 negative cases, the evidence strongly increases posterior risk.`;
    } else if (strategy === "counterexample") {
      explanationText = `Here is a counterexample that breaks the intuition: ${explanationText}`;
      exampleText = isSpam
        ? `Imagine a word that appears 100% of the time in spam, but also 100% of the time in personal emails. Its predictive power is zero!`
        : `Imagine a feature that appears with equal frequency in both target and non-target cases. Its diagnostic predictive power is zero!`;
    }

    const fallbackData = {
      hook: matchedConcept.hook,
      explanation: explanationText,
      strategy,
      example: exampleText,
      checkQuestion: matchedConcept.checkQuestion || {
        prompt: `Why is understanding ${matchedConcept.title} essential for building our project?`,
        options: [
          "It defines the mathematical decision boundary used by our classifier.",
          "It is required by the Python language syntax.",
          "It converts the computer screen to high resolution.",
          "It slows down model execution to prevent overheating."
        ],
        correctIndex: 0,
        explanation: "Every component directly maps to the machine learning decision function."
      },
      buildTask: matchedConcept.buildStep,
      starterCode: matchedConcept.starterCode,
    };

    const systemPrompt = `You are Socrates, a project-first AI tutor.
The learner is building: "${profile.goal || "their machine learning project"}".
Concept: "${matchedConcept.title}".
Strategy: "${strategy}".
Interests: "${interests}".
RULES:
1. Hook MUST be a curiosity gap, NEVER a definition.
2. Ground all examples directly in "${projectTitle}".
3. Keep explanation concise, punchy, and crystal clear.
4. Output JSON adhering to TeachOutputSchema.`;

    const result = await generateStructuredLLM({
      systemPrompt,
      userPrompt: `Teach concept: ${matchedConcept.title}. Last error diagnosis: ${lastDiagnosis?.diagnosis || "none"}.`,
      schema: TeachOutputSchema,
      fallbackData,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/teach:", error);
    const fallbackConcept = reqConcept || generateFallbackConceptsForGoal(reqProfile?.goal || "")[0] || SPAM_CLASSIFIER_CONCEPTS[0];
    return NextResponse.json(
      {
        hook: fallbackConcept.hook,
        explanation: fallbackConcept.explanationSummary,
        strategy: "analogy",
        example: `Consider how key indicators in ${reqProfile?.goal || "your project"} separate signal from noise.`,
        checkQuestion: fallbackConcept.checkQuestion,
        buildTask: fallbackConcept.buildStep,
        starterCode: fallbackConcept.starterCode,
      },
      { status: 200 }
    );
  }
}
