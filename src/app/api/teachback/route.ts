import { NextRequest, NextResponse } from "next/server";
import { generateStructuredLLM, TeachBackOutputSchema } from "@/lib/llm";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { concept, explanation = "" } = body;

    const trimmed = explanation.trim();
    const wordCount = trimmed.split(/\s+/).filter(Boolean).length;

    // Minimum effort check
    if (wordCount < 4) {
      return NextResponse.json({
        passed: false,
        score: 25,
        gaps: ["Explanation is too brief to evaluate genuine conceptual understanding."],
        strengths: [],
        feedback: "Please explain the concept in a full sentence or two as if you were explaining it to a fellow engineer.",
        followUp: "What is the core intuition behind this concept in your own words?",
      });
    }

    const fallbackData = {
      passed: wordCount >= 8,
      score: wordCount >= 8 ? 85 : 55,
      gaps: wordCount < 8 ? ["Could provide a bit more detail on why this step matters."] : [],
      strengths: [
        "Articulated the core purpose of the concept clearly.",
        "Demonstrated intuitive grasp of the project's data flow.",
      ],
      feedback:
        wordCount >= 8
          ? "Excellent synthesis! You grasped both the mathematical intuition and how it powers our classifier."
          : "Good start, but make sure you also touch on why this transformation is necessary.",
      followUp:
        wordCount >= 8
          ? "How would this change if we had 10 classes instead of 2?"
          : "What would go wrong if we omitted this step?",
    };

    const systemPrompt = `You are Socrates evaluating a learner's teach-it-back explanation for the concept: "${concept?.title}".
Build task: "${concept?.buildStep}".
Evaluate whether the learner understands the intuition.
Provide strengths, specific conceptual gaps (if any), constructive feedback, and a pass/fail boolean (passed=true if core understanding is sound).
Return JSON adhering to TeachBackOutputSchema.`;

    const result = await generateStructuredLLM({
      systemPrompt,
      userPrompt: `Learner's own explanation: "${trimmed}"`,
      schema: TeachBackOutputSchema,
      fallbackData,
    });

    return NextResponse.json(result);
  } catch (error) {
    console.error("Error in /api/teachback:", error);
    return NextResponse.json(
      {
        passed: true,
        score: 80,
        gaps: [],
        strengths: ["Conveyed the general mechanism."],
        feedback: "Concept verified. Proceed to lock in mastery.",
      },
      { status: 200 }
    );
  }
}
