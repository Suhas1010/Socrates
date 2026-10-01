import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateStructuredLLM } from "@/lib/llm";
import { Concept, CodingBackground } from "@/lib/types";

const AskSocratesSchema = z.object({
  title: z.string(),
  explanation: z.string(),
  exampleOrFormula: z.string(),
  takeaway: z.string(),
});

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      concept,
      question,
      background = "beginner",
      goal = "a spam classifier",
    }: {
      concept: Concept;
      question: string;
      background: CodingBackground;
      goal: string;
    } = body;

    const conceptTitle = concept?.title || "Machine Learning Concepts";
    const corePrinciple = concept?.corePrinciple || concept?.explanationSummary || "";
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

    const fallbackData = {
      title: `${conceptTitle} Intuition`,
      explanation:
        corePrinciple ||
        `In ${conceptTitle}, machine learning turns raw sensory inputs into structured mathematical signals that an algorithm can evaluate with probability or geometry.`,
      exampleOrFormula:
        concept?.workedExample
          ? `${concept.workedExample.scenario}\n${concept.workedExample.calculationSteps.join("\n")}`
          : `P(Class | Evidence) ∝ P(Evidence | Class) × P(Class)`,
      takeaway:
        concept?.workedExample?.takeaway ||
        `Understanding ${conceptTitle} is the key bridge from raw data to an intelligent decision rule.`,
    };

    const result = await generateStructuredLLM({
      systemPrompt,
      userPrompt: `Question from learner: "${question}". Current concept: "${conceptTitle}".`,
      schema: AskSocratesSchema,
      fallbackData,
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
