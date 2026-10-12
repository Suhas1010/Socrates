import { TutorOutput } from "./types";
import { MisconceptionRecord } from "../types";

/**
 * Runtime Tutor Agent (Section 7.2 & 7.4)
 * Provides Socratic guidance and hints using bounded tools.
 * Hard constraint: Cannot unlock solutions outside Attempt-First criteria.
 */
export async function runTutorAgent(context: {
  query: string;
  conceptTitle: string;
  attemptsCount: number;
  isLocked: boolean;
  pastMisconceptions: MisconceptionRecord[];
}): Promise<TutorOutput> {
  const { query, conceptTitle, attemptsCount, isLocked, pastMisconceptions } = context;
  const qLower = query.toLowerCase();

  // If learner is asking directly for the complete answer/solution while locked
  if (isLocked && (qLower.includes("give me the code") || qLower.includes("what is the answer") || qLower.includes("solution"))) {
    return {
      response: `I cannot give you the completed solution directly yet! Under the Attempt-First protocol (L-5), you must make at least 2 attempts to write and test your own code first (Attempts so far: ${attemptsCount}/2). Try filling the blanks and running the code in the terminal to see what happens.`,
      strategy: "socratic_hint",
    };
  }

  // Check if learner made a past misconception related to this
  const relevantPast = pastMisconceptions.find((m) =>
    conceptTitle.toLowerCase().includes(m.conceptId.replace(/-/g, " ")) ||
    qLower.includes(m.errorType.toLowerCase())
  );

  let pastReference = "";
  if (relevantPast) {
    pastReference = `Remember earlier when you encountered ${relevantPast.errorType} ("${relevantPast.diagnosis || relevantPast.note}")? A similar intuition applies here.`;
  }

  return {
    response: `In ${conceptTitle}, focus on how each transformation changes the input data dimensions. ${pastReference ? "\n\n" + pastReference : ""}\n\nWhat output do you expect the function to produce when fed a simple sample input?`,
    strategy: "socratic_hint",
    referencedPastMisconception: relevantPast ? relevantPast.note : undefined,
    toolUsed: "get_misconception_history",
  };
}
