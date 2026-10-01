import { describe, it, expect } from "vitest";
import {
  updateMasteryScore,
  getConceptStatus,
  propagatePrerequisiteError,
  initializeMasteryFromDiagnostic,
} from "../mastery";

describe("Mastery Engine (§6.4)", () => {
  it("updates score with outcome=1 correctly using m <- m + 0.3*(1 - m)", () => {
    // Initial m = 0.2, outcome = 1.0 -> 0.2 + 0.3*(0.8) = 0.44
    const newScore = updateMasteryScore({ currentMastery: 0.2, outcome: 1.0 });
    expect(newScore).toBe(0.44);
  });

  it("penalizes score with outcome=0: m <- m + 0.3*(0 - m)", () => {
    // Initial m = 0.5, outcome = 0 -> 0.5 + 0.3*(-0.5) = 0.35
    const newScore = updateMasteryScore({ currentMastery: 0.5, outcome: 0.0 });
    expect(newScore).toBe(0.35);
  });

  it("evaluates concept statuses properly based on score and teachback gate", () => {
    expect(getConceptStatus(0, false)).toBe("unseen");
    expect(getConceptStatus(0.3, false)).toBe("shaky");
    expect(getConceptStatus(0.5, false)).toBe("learning");

    // Mastered requires >= 0.75 AND teach-it-back passed (PRD §5.6 F-29)
    expect(getConceptStatus(0.85, false)).toBe("learning");
    expect(getConceptStatus(0.85, true)).toBe("mastered");
    expect(getConceptStatus(0.70, true)).toBe("learning");
  });

  it("propagates prerequisite errors with 0.2 penalty", () => {
    const initialMastery = {
      "bayes-rule": 0.7,
      "probability-basics": 0.8,
    };
    const { updatedMastery } = propagatePrerequisiteError(
      initialMastery,
      "probability-basics"
    );
    expect(updatedMastery["probability-basics"]).toBe(0.6);
  });

  it("initializes mastery from diagnostic results (correct=0.6, wrong=0.2, unseen=0.0)", () => {
    const conceptIds = ["c1", "c2", "c3"];
    const answers = [
      { conceptId: "c1", isCorrect: true },
      { conceptId: "c2", isCorrect: false },
    ];
    const mastery = initializeMasteryFromDiagnostic(conceptIds, answers);
    expect(mastery["c1"]).toBe(0.6);
    expect(mastery["c2"]).toBe(0.2);
    expect(mastery["c3"]).toBe(0.0);
  });
});
