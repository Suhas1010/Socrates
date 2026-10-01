import { ConceptStatus } from "./types";

export interface MasteryUpdateParams {
  currentMastery: number;
  outcome: number; // 1 for full correct, 0 for wrong, 0.6 for hinted/second try
  learningRate?: number; // default 0.3
}

/**
 * Updates a concept's mastery score according to the formula:
 * m_new = m + alpha * (outcome - m)
 * Clamped between 0 and 1.
 */
export function updateMasteryScore({
  currentMastery,
  outcome,
  learningRate = 0.3,
}: MasteryUpdateParams): number {
  const updated = currentMastery + learningRate * (outcome - currentMastery);
  return Math.max(0, Math.min(1, Math.round(updated * 1000) / 1000));
}

/**
 * Derives the visual state of a concept:
 * - 'mastered' (green): requires m >= 0.75 AND teach-it-back passed
 * - 'learning' (amber): 0.4 <= m < 0.75 (or m >= 0.75 pending teach-it-back)
 * - 'shaky' (red): 0 < m < 0.4 (or explicitly flagged as weak prereq)
 * - 'unseen' (gray): m === 0
 */
export function getConceptStatus(
  masteryScore: number,
  isTeachBackPassed: boolean,
  isShakyFlag: boolean = false
): ConceptStatus {
  if (masteryScore >= 0.75 && isTeachBackPassed) {
    return "mastered";
  }
  if (isShakyFlag || (masteryScore > 0 && masteryScore < 0.4)) {
    return "shaky";
  }
  if (masteryScore >= 0.4 || (masteryScore > 0 && !isTeachBackPassed)) {
    return "learning";
  }
  return "unseen";
}

/**
 * Weak-prerequisite propagation:
 * When an error diagnosis points to a rootCauseConceptId != currentConceptId,
 * reduces that prerequisite's mastery by 0.2 and queues it before the current concept.
 */
export function propagatePrerequisiteError(
  masteryRecord: Record<string, number>,
  rootCauseConceptId: string
): { updatedMastery: Record<string, number>; penaltyApplied: number } {
  const current = masteryRecord[rootCauseConceptId] ?? 0.5;
  const newScore = Math.max(0, Math.round((current - 0.2) * 1000) / 1000);
  
  return {
    updatedMastery: {
      ...masteryRecord,
      [rootCauseConceptId]: newScore,
    },
    penaltyApplied: 0.2,
  };
}

/**
 * Initialises mastery values from diagnostic results:
 * - correct = 0.6
 * - wrong = 0.2
 * - unseen = 0.0
 */
export function initializeMasteryFromDiagnostic(
  conceptIds: string[],
  answers: { conceptId: string; isCorrect: boolean }[]
): Record<string, number> {
  const result: Record<string, number> = {};
  for (const id of conceptIds) {
    result[id] = 0.0;
  }
  for (const a of answers) {
    result[a.conceptId] = a.isCorrect ? 0.6 : 0.2;
  }
  return result;
}
