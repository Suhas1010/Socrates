import { Concept, ConceptEdge, ConceptStatus } from "./types";

export interface GraphValidationResult {
  valid: boolean;
  errors: string[];
}

/**
 * Validates a concept DAG according to PRD §6.1:
 * - 4 to 12 nodes (target 6-10)
 * - acyclic (DAG: no directed cycles)
 * - every prereq ID exists in concepts list
 * - at least one leaf node mapping to the project's final capability
 */
export function validateConceptGraph(
  concepts: Concept[],
  edges: ConceptEdge[]
): GraphValidationResult {
  const errors: string[] = [];
  const conceptMap = new Map(concepts.map((c) => [c.id, c]));

  if (concepts.length < 4 || concepts.length > 12) {
    errors.push(`Graph node count ${concepts.length} outside expected range [4, 12].`);
  }

  // Check every prerequisite exists
  for (const c of concepts) {
    for (const p of c.prereqs) {
      if (!conceptMap.has(p)) {
        errors.push(`Concept '${c.id}' references non-existent prerequisite '${p}'.`);
      }
    }
  }

  // Check edge validity
  for (const edge of edges) {
    if (!conceptMap.has(edge.from)) {
      errors.push(`Edge references missing source '${edge.from}'.`);
    }
    if (!conceptMap.has(edge.to)) {
      errors.push(`Edge references missing destination '${edge.to}'.`);
    }
  }

  // Cycle detection via DFS
  const adjacency = new Map<string, string[]>();
  for (const c of concepts) {
    adjacency.set(c.id, []);
  }
  for (const edge of edges) {
    adjacency.get(edge.from)?.push(edge.to);
  }

  const visited = new Set<string>();
  const recursionStack = new Set<string>();
  let hasCycle = false;

  function dfs(nodeId: string): boolean {
    visited.add(nodeId);
    recursionStack.add(nodeId);

    const neighbors = adjacency.get(nodeId) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (recursionStack.has(neighbor)) {
        return true;
      }
    }

    recursionStack.delete(nodeId);
    return false;
  }

  for (const c of concepts) {
    if (!visited.has(c.id)) {
      if (dfs(c.id)) {
        hasCycle = true;
        break;
      }
    }
  }

  if (hasCycle) {
    errors.push("Graph contains a directed cycle (must be a strictly acyclic DAG).");
  }

  // Check for at least one leaf (no outgoing edges)
  const outgoingCounts = new Map<string, number>();
  for (const c of concepts) {
    outgoingCounts.set(c.id, 0);
  }
  for (const edge of edges) {
    outgoingCounts.set(edge.from, (outgoingCounts.get(edge.from) || 0) + 1);
  }

  const leaves = concepts.filter((c) => (outgoingCounts.get(c.id) || 0) === 0);
  if (leaves.length === 0) {
    errors.push("Graph has no terminal/leaf node to serve as final project build step.");
  }

  return {
    valid: errors.length === 0,
    errors,
  };
}

export interface NextConceptParams {
  concepts: Concept[];
  edges: ConceptEdge[];
  status: Record<string, ConceptStatus>;
  queue: string[];
  lastErrorConceptId?: string | null;
}

/**
 * §6.5 Next-concept selection:
 * 1. If a queued prerequisite exists, take it.
 * 2. Otherwise the unmastered concept whose prerequisites are all mastered,
 *    ordered by the project's build sequence.
 * 3. If several tie, prefer the one the learner's last error pointed toward.
 */
export function getNextConcept({
  concepts,
  status,
  queue,
  lastErrorConceptId,
}: NextConceptParams): { nextConceptId: string | null; updatedQueue: string[] } {
  // 1. Queued prerequisite has first priority
  if (queue.length > 0) {
    const [nextId, ...restQueue] = queue;
    if (status[nextId] !== "mastered") {
      return { nextConceptId: nextId, updatedQueue: restQueue };
    }
  }

  // 2. Find all unmastered concepts whose prerequisites are all mastered
  const readyCandidates = concepts.filter((concept) => {
    if (status[concept.id] === "mastered") return false;
    const prereqs = concept.prereqs;
    const allPrereqsMastered = prereqs.every((p) => status[p] === "mastered");
    return allPrereqsMastered;
  });

  if (readyCandidates.length === 0) {
    // If no candidate has all prereqs mastered, look for any unmastered concept in sequence
    const anyUnmastered = concepts.find((c) => status[c.id] !== "mastered");
    return { nextConceptId: anyUnmastered ? anyUnmastered.id : null, updatedQueue: queue };
  }

  // 3. Prefer matching lastErrorConceptId if tied
  if (lastErrorConceptId) {
    const errorMatch = readyCandidates.find((c) => c.id === lastErrorConceptId);
    if (errorMatch) {
      return { nextConceptId: errorMatch.id, updatedQueue: queue };
    }
  }

  // Default to first ready in build sequence
  return { nextConceptId: readyCandidates[0].id, updatedQueue: queue };
}
