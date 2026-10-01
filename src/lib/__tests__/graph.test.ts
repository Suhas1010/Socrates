import { describe, it, expect } from "vitest";
import { validateConceptGraph, getNextConcept } from "../graph";
import {
  SPAM_CLASSIFIER_CONCEPTS,
  SPAM_CLASSIFIER_EDGES,
} from "../templates/spamClassifier";
import { ConceptStatus } from "../types";

describe("Concept Graph DAG & Routing Engine (§6.1, §6.5)", () => {
  it("validates the flagship spam classifier graph as an acyclic DAG with 8 nodes", () => {
    const res = validateConceptGraph(
      SPAM_CLASSIFIER_CONCEPTS,
      SPAM_CLASSIFIER_EDGES
    );
    expect(res.valid).toBe(true);
    expect(res.errors.length).toBe(0);
  });

  it("detects directed cycles in a broken graph", () => {
    const cyclicEdges = [
      { from: "what-is-classification", to: "features-from-text" },
      { from: "features-from-text", to: "what-is-classification" },
    ];
    const res = validateConceptGraph(
      SPAM_CLASSIFIER_CONCEPTS.slice(0, 5),
      cyclicEdges
    );
    expect(res.valid).toBe(false);
    expect(res.errors.some((e) => e.includes("cycle"))).toBe(true);
  });

  it("prioritizes queued weak prerequisites over general sequence", () => {
    const status: Record<string, ConceptStatus> = {
      "what-is-classification": "mastered",
      "features-from-text": "learning",
      "probability-basics": "shaky",
    };
    const queue = ["probability-basics"];

    const { nextConceptId, updatedQueue } = getNextConcept({
      concepts: SPAM_CLASSIFIER_CONCEPTS,
      edges: SPAM_CLASSIFIER_EDGES,
      status,
      queue,
    });

    expect(nextConceptId).toBe("probability-basics");
    expect(updatedQueue).toEqual([]);
  });

  it("routes to the next unmastered concept whose prerequisites are all mastered", () => {
    const status: Record<string, ConceptStatus> = {
      "what-is-classification": "mastered",
      "features-from-text": "unseen",
      "probability-basics": "unseen",
      "bayes-rule": "unseen",
      "naive-bayes": "unseen",
      "training-vs-testing": "unseen",
      "evaluating-accuracy": "unseen",
      "improving-the-model": "unseen",
    };

    const { nextConceptId } = getNextConcept({
      concepts: SPAM_CLASSIFIER_CONCEPTS,
      edges: SPAM_CLASSIFIER_EDGES,
      status,
      queue: [],
    });

    expect(nextConceptId).toBe("features-from-text");
  });
});
