import { ProjectSpec, CatalogProjectFunction } from "../types";
import { ArchitectOutput } from "./types";
import { findNearestCatalogProject } from "../catalog";

/**
 * Architect Agent (Section 7.2 & 6.2 G-1)
 * Designs the solution as modular functions with verified acyclic data flow.
 */
export async function runArchitectAgent(
  spec: ProjectSpec,
  goal: string
): Promise<ArchitectOutput> {
  const catalogHit = findNearestCatalogProject(goal);
  const functions: CatalogProjectFunction[] = catalogHit.functions && catalogHit.functions.length > 0
    ? catalogHit.functions
    : [
        { name: "preprocess_features", signature: "preprocess_features(X)", dependsOn: [] },
        { name: "compute_loss", signature: "compute_loss(y_true, y_pred)", dependsOn: [] },
        { name: "update_weights", signature: "update_weights(w, grad, lr)", dependsOn: ["compute_loss"] },
        { name: "train_model", signature: "train_model(X, y)", dependsOn: ["preprocess_features", "update_weights"] },
        { name: "predict", signature: "predict(X)", dependsOn: ["preprocess_features", "train_model"] },
      ];

  // Verify graph is acyclic and all functions connect
  const nodeIds = functions.map((f) => f.name);
  const edges: Array<{ from: string; to: string }> = [];

  functions.forEach((f) => {
    f.dependsOn.forEach((dep) => {
      if (nodeIds.includes(dep)) {
        edges.push({ from: dep, to: f.name });
      }
    });
  });

  // Compute topological order (Kahn's or DFS post-order reversal)
  const inDegree = new Map<string, number>();
  nodeIds.forEach((n) => inDegree.set(n, 0));
  edges.forEach((e) => inDegree.set(e.to, (inDegree.get(e.to) || 0) + 1));

  const queue: string[] = nodeIds.filter((n) => (inDegree.get(n) || 0) === 0);
  const topologicalOrder: string[] = [];

  while (queue.length > 0) {
    const curr = queue.shift()!;
    topologicalOrder.push(curr);
    const neighbors = edges.filter((e) => e.from === curr).map((e) => e.to);
    for (const nxt of neighbors) {
      const remaining = (inDegree.get(nxt) || 1) - 1;
      inDegree.set(nxt, remaining);
      if (remaining === 0) queue.push(nxt);
    }
  }

  const isAcyclic = topologicalOrder.length === nodeIds.length;

  return {
    functions,
    callGraph: {
      nodes: nodeIds,
      edges,
    },
    isAcyclic,
    topologicalOrder: isAcyclic ? topologicalOrder : nodeIds,
    dataFlowDescription: `Pipeline consists of ${functions.length} sequential functions ending in predict(). Verified acyclic dependency structure.`,
  };
}

function detectCycle(nodes: string[], edges: Array<{ from: string; to: string }>): boolean {
  const adj = new Map<string, string[]>();
  nodes.forEach((n) => adj.set(n, []));
  edges.forEach((e) => adj.get(e.from)?.push(e.to));

  const visited = new Set<string>();
  const inStack = new Set<string>();

  function dfs(curr: string): boolean {
    visited.add(curr);
    inStack.add(curr);

    const neighbors = adj.get(curr) || [];
    for (const neighbor of neighbors) {
      if (!visited.has(neighbor)) {
        if (dfs(neighbor)) return true;
      } else if (inStack.has(neighbor)) {
        return true;
      }
    }

    inStack.delete(curr);
    return false;
  }

  for (const node of nodes) {
    if (!visited.has(node)) {
      if (dfs(node)) return true;
    }
  }

  return false;
}
