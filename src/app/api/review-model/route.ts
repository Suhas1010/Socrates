import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { generateStructuredLLM, extractLLMRequestCredentials } from "@/lib/llm";
import { deriveModelContractForGoal } from "@/lib/inference";
import { ProjectModelContract } from "@/lib/types";

const ModelReviewSchema = z.object({
  overallScore: z.number().min(0).max(100),
  headline: z.string(),
  architectureStrengths: z.array(z.string()),
  potentialVulnerabilities: z.array(z.string()),
  numericalStabilityAnalysis: z.string(),
  productionReadinessAdvice: z.string(),
  recommendedNextSteps: z.array(z.string()),
});

import { deriveFallbackModelReview } from "@/lib/roadmapGenerator";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      goal = "Machine Learning Project",
      assembledCode = "",
      stepsBuilt = 6,
      totalSteps = 6,
      redTeamSummary = [],
    } = body;

    const contract = deriveModelContractForGoal(goal);
    const fallbackData = deriveFallbackModelReview(goal, contract, stepsBuilt, totalSteps);

    const systemPrompt = `You are Socrates, a Senior Machine Learning Systems Architect and AI Tutor.
You conduct rigorous, supportive, and mathematically grounded code and architecture reviews for learner-built AI models.
The learner built a Python machine learning pipeline for: "${goal}".
Domain / Model Type: ${contract.badge}.
Target Output: ${contract.output.label} (${contract.output.type}).
Input Features: ${contract.features.map((f) => `${f.label} (${f.id})`).join(", ")}.
Primary Model Function: ${contract.functionName}.
Completed Functions: ${stepsBuilt}/${totalSteps}.

Adversarial Stress Test Results:
${JSON.stringify(redTeamSummary, null, 2)}

Learner's Assembled Python Pipeline:
\`\`\`python
${assembledCode.slice(0, 3000)}
\`\`\`

Review Objectives:
1. Provide a numerical Production Readiness Score (0-100).
2. Give a sharp, encouraging headline summarizing the architectural quality of this specific ${goal} model.
3. List 2-3 specific architectural strengths in their code tailored to ${contract.badge}.
4. List 2 specific potential vulnerabilities for this specific domain.
5. Analyze numerical stability (gradient scaling, bounds, division by zero, float precision).
6. Give concrete production readiness advice for taking ${contract.functionName} to a real production service.
7. Outline 3 recommended next steps in their production roadmap.
Output ONLY valid JSON adhering to the specified schema.`;

    const { apiKey: activeKey, provider: activeProvider } = extractLLMRequestCredentials(req.headers, body);

    const result = await generateStructuredLLM({
      systemPrompt,
      userPrompt: `Please conduct an in-depth code and architecture review of the learner's assembled pipeline for "${goal}".`,
      schema: ModelReviewSchema,
      fallbackData,
      apiKeyOverride: activeKey,
      provider: activeProvider,
    });

    return NextResponse.json(result);
  } catch (err: any) {
    console.error("Error in /api/review-model:", err);
    const fallbackContract = deriveModelContractForGoal("Machine Learning Model");
    const fallbackData = deriveFallbackModelReview("Machine Learning Model", fallbackContract);
    return NextResponse.json(fallbackData, { status: 200 });
  }
}
