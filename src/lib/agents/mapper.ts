import { AgentRole } from "./types";

/**
 * Maps internal autonomous agent roles to clean, human-readable progress messages
 * for the learner-facing UI (Bug 2 Fix).
 * Ensures internal agent names (Scoper, Architect, etc.) are never leaked to learners.
 */
export const AGENT_LEARNER_PROGRESS_MESSAGES: Record<AgentRole, string> = {
  scoper: "Understanding your goal...",
  architect: "Designing the project architecture...",
  implementer: "Writing and verifying the reference code...",
  executor: "Writing and verifying the reference code...",
  slicer: "Creating your step-by-step path...",
  pedagogue: "Preparing your workspace...",
  diagnostician: "Checking for learning misconceptions...",
  redteam: "Verifying model robustness...",
  tutor: "Preparing your workspace...",
};

/**
 * Returns a human-friendly loading message corresponding to the active agent stage.
 */
export function mapAgentEventToLearnerMessage(agent?: AgentRole): string {
  if (!agent) return "Initializing your learning environment...";
  return AGENT_LEARNER_PROGRESS_MESSAGES[agent] || "Configuring your project environment...";
}

/**
 * Calculates a clean progress percentage (0 - 100%) based on the agent pipeline stage.
 */
export function getLearnerProgressPercentage(agent?: AgentRole): number {
  switch (agent) {
    case "scoper":
      return 20;
    case "architect":
      return 40;
    case "implementer":
      return 60;
    case "executor":
      return 75;
    case "slicer":
      return 90;
    case "pedagogue":
      return 100;
    default:
      return 10;
  }
}
