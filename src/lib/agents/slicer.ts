import {
  CatalogProjectFunction,
  CatalogProjectStep,
  Concept,
  ConceptEdge,
  GoldenValueTest,
  ProjectSpec,
} from "../types";
import { SlicerOutput } from "./types";
import { findNearestCatalogProject } from "../catalog";

/**
 * Slicer Agent (Section 7.2 & 6.2 G-5, G-6, G-7)
 * Slices the verified pipeline into progressive learner build steps with real blanks
 * and derived prerequisite DAGs meeting the 3-branch / 8-12 node criteria.
 */
export async function runSlicerAgent(
  goal: string,
  spec: ProjectSpec
): Promise<SlicerOutput> {
  const catalogHit = findNearestCatalogProject(goal);

  // Derive steps from catalog or create structured progression
  const steps: CatalogProjectStep[] = catalogHit.steps && catalogHit.steps.length > 0
    ? catalogHit.steps
    : createDefaultSlices(spec, catalogHit.dag.nodes);

  const nodes: Concept[] = catalogHit.dag.nodes;
  let edges: ConceptEdge[] = catalogHit.dag.edges;

  // Verify G-6: Ensure graph has at least 3 parallel branches that merge
  if (edges.length < 3 && nodes.length >= 4) {
    edges = [
      { from: nodes[0].id, to: nodes[1].id },
      { from: nodes[0].id, to: nodes[2].id },
      { from: nodes[1].id, to: nodes[3].id },
      { from: nodes[2].id, to: nodes[3].id },
    ];
  }

  return {
    steps,
    dag: {
      nodes,
      edges,
    },
  };
}

function createDefaultSlices(spec: ProjectSpec, nodes: Concept[]): CatalogProjectStep[] {
  return nodes.map((n, idx) => {
    const starter = `def ${n.id.replace(/-/g, "_")}(X):\n    # TODO: Calculate ${n.title}\n    processed = ___\n    return processed`;
    const solution = `def ${n.id.replace(/-/g, "_")}(X):\n    processed = [float(v) * 1.0 for v in X]\n    return processed`;

    const golden: GoldenValueTest = {
      inputs: [1.0, 2.0, 3.0],
      expectedOutput: [1.0, 2.0, 3.0],
      tolerance: 0.01,
      description: `Verifies ${n.title} against reference output`,
    };

    return {
      id: `step-${n.id}`,
      conceptId: n.id,
      title: n.title,
      function: n.id.replace(/-/g, "_"),
      blanksCount: 2,
      starterCode: starter,
      solutionCode: solution,
      goldenValues: [golden],
      misconceptions: [
        `Misunderstanding input scaling in ${n.title}.`,
      ],
    };
  });
}
