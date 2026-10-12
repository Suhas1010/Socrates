import { ProjectSpec, ProjectTier } from "../types";
import { ScoperOutput } from "./types";
import { findNearestCatalogProject } from "../catalog";

/**
 * Scoper Agent (Section 7.2 & 6.1)
 * Analyzes project goals and formulates a verified mathematical specification and tier.
 */
export async function runScoperAgent(
  goal: string,
  interests?: string,
  background?: string
): Promise<ScoperOutput> {
  const safeGoal = goal?.trim() || "Binary Classification Model";
  const lower = safeGoal.toLowerCase();

  // 1. Check for infeasible or absurd goals
  if (
    lower.includes("perpetual") ||
    lower.includes("time travel") ||
    lower.includes("faster than light") ||
    lower.includes("predict lotto")
  ) {
    return {
      spec: {
        task: "classification",
        schema: [{ name: "feature_1", type: "float", range: [0, 1] }],
        target: "unpredictable",
        metric: "accuracy",
        threshold: 0.5,
        tier: "A",
      },
      tier: "A",
      isFeasible: false,
      feasibilityNote: "This goal involves physically or mathematically impossible predictions.",
      suggestedAlternative: "predict random walk probabilities or synthetic noise patterns",
      rationale: "Mathematical models cannot predict purely unconstrained non-deterministic outcomes.",
    };
  }

  // 2. Check for Tier C projects (Large Foundation Model Fine-Tuning)
  if (
    lower.includes("llama 3 70b") ||
    lower.includes("gpt-4") ||
    lower.includes("bert fine-tun") ||
    lower.includes("stable diffusion") ||
    lower.includes("video generation")
  ) {
    return {
      spec: {
        task: "classification",
        schema: [
          { name: "text", type: "string", description: "Natural language input sequence" },
        ],
        target: "label_category",
        metric: "eval_loss",
        threshold: 0.35,
        tier: "C",
      },
      tier: "C",
      isFeasible: true,
      feasibilityNote: "Large 100M+ parameter foundation models exceed browser WebAssembly memory limits. Socrates will generate a fully annotated Google Colab PyTorch script (Tier C Export).",
      suggestedAlternative: "a lightweight NumPy self-attention transformer you can train right inside your browser",
      rationale: "Tier C projects export unverified Google Colab GPU notebooks.",
    };
  }

  // 3. Match against nearest verified catalog project
  const catalogHit = findNearestCatalogProject(safeGoal);

  // Specialize schema feature names based on user goal keywords
  let task: "classification" | "regression" = catalogHit.spec.task;
  let target = catalogHit.spec.target;
  let metric = catalogHit.spec.metric;
  let threshold = catalogHit.spec.threshold;
  let tier: ProjectTier = catalogHit.tier;

  if (lower.includes("price") || lower.includes("cost") || lower.includes("predict score") || lower.includes("forecast")) {
    task = "regression";
    metric = "r2_score";
    threshold = 0.82;
  }

  return {
    spec: {
      task,
      schema: catalogHit.spec.schema,
      target,
      metric,
      threshold,
      tier,
    },
    tier,
    isFeasible: true,
    rationale: `Formulated a verified ${tier === "A" ? "Tier A (Browser WASM)" : "Tier C"} spec for "${safeGoal}". Target metric: ${metric.toUpperCase()} >= ${threshold}.`,
  };
}
