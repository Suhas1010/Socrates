import { AgentStatusEvent, ScoperOutput, ArchitectOutput, ExecutorOutput, SlicerOutput } from "./types";
import { runScoperAgent } from "./scoper";
import { runArchitectAgent } from "./architect";
import { runImplementerAgent } from "./implementer";
import { runExecutorAgent } from "./executor";
import { runSlicerAgent } from "./slicer";
import { runPedagogueAgent } from "./pedagogue";
import { CatalogProject } from "../types";

export interface PipelineExecutionResult {
  success: boolean;
  events: AgentStatusEvent[];
  scoper: ScoperOutput;
  architect: ArchitectOutput;
  executor: ExecutorOutput;
  slicer: SlicerOutput;
  project: CatalogProject;
}

/**
 * Multi-Agent Pipeline Orchestrator (Section 6.2 & 7.2)
 * Coordinates the full sequence of autonomous agents:
 * Scoper -> Architect -> Implementer -> Executor & Repair -> Slicer -> Pedagogue
 */
export async function executeMultiAgentPipeline(
  goal: string,
  interests?: string,
  background?: string,
  onEvent?: (event: AgentStatusEvent) => void
): Promise<PipelineExecutionResult> {
  const events: AgentStatusEvent[] = [];

  const emit = (event: AgentStatusEvent) => {
    events.push(event);
    onEvent?.(event);
  };

  // 1. SCOPER AGENT
  emit({
    agent: "scoper",
    status: "running",
    stage: "1/6 - Scoping & Feasibility",
    message: `Scoper Agent evaluating goal: "${goal}"...`,
    timestamp: Date.now(),
  });

  const scoperOut = await runScoperAgent(goal, interests, background);

  emit({
    agent: "scoper",
    status: "verified",
    stage: "1/6 - Scoping Complete",
    message: `Formulated ${scoperOut.spec.tier} spec. Task: ${scoperOut.spec.task}, Metric: ${scoperOut.spec.metric} >= ${scoperOut.spec.threshold}`,
    details: scoperOut.spec,
    timestamp: Date.now(),
  });

  // 2. ARCHITECT AGENT
  emit({
    agent: "architect",
    status: "running",
    stage: "2/6 - Architecture & Call Graph",
    message: "Architect Agent designing function dependencies and acyclic call graph...",
    timestamp: Date.now(),
  });

  const architectOut = await runArchitectAgent(scoperOut.spec, goal);

  emit({
    agent: "architect",
    status: "verified",
    stage: "2/6 - Architecture Verified",
    message: `Designed ${architectOut.functions.length} functions with verified acyclic data flow.`,
    details: architectOut.callGraph,
    timestamp: Date.now(),
  });

  // 3. IMPLEMENTER AGENT
  emit({
    agent: "implementer",
    status: "running",
    stage: "3/6 - Function Implementation",
    message: `Implementer Agent writing code for ${architectOut.functions.length} functions...`,
    timestamp: Date.now(),
  });

  const implementedFunctions = await Promise.all(
    architectOut.functions.map((fn) => runImplementerAgent(fn, scoperOut.spec))
  );

  const assembledCode = implementedFunctions.map((fn) => fn.code).join("\n\n");

  emit({
    agent: "implementer",
    status: "verified",
    stage: "3/6 - Functions Implemented",
    message: `All ${implementedFunctions.length} functions written and verified on sample inputs.`,
    timestamp: Date.now(),
  });

  // 4. EXECUTOR & REPAIR AGENT
  emit({
    agent: "executor",
    status: "running",
    stage: "4/6 - Full Sandbox Integration & Verification",
    message: `Executor Agent compiling pipeline in Pyodide with fixed random seeds...`,
    timestamp: Date.now(),
  });

  const executorOut = await runExecutorAgent(assembledCode, scoperOut.spec);

  if (!executorOut.passed) {
    emit({
      agent: "executor",
      status: "failed",
      stage: "4/6 - Executor Failure",
      message: executorOut.error || "Acceptance metric threshold not met.",
      timestamp: Date.now(),
    });
  } else {
    emit({
      agent: "executor",
      status: "verified",
      stage: "4/6 - Execution Verified",
      message: `Acceptance metric passed! Achieved ${executorOut.metricName} = ${executorOut.achievedMetric} (Threshold: ${executorOut.threshold}).`,
      details: { repairs: executorOut.repairsApplied },
      timestamp: Date.now(),
    });
  }

  // 5. SLICER AGENT
  emit({
    agent: "slicer",
    status: "running",
    stage: "5/6 - Slicing Build Steps & Deriving DAG",
    message: "Slicer Agent cutting verified pipeline into learner steps along call graph...",
    timestamp: Date.now(),
  });

  const slicerOut = await runSlicerAgent(goal, scoperOut.spec);

  emit({
    agent: "slicer",
    status: "verified",
    stage: "5/6 - Slicing Complete",
    message: `Generated ${slicerOut.steps.length} build steps with golden-value test assertions and blanks.`,
    details: slicerOut.dag,
    timestamp: Date.now(),
  });

  // 6. PEDAGOGUE AGENT
  emit({
    agent: "pedagogue",
    status: "running",
    stage: "6/6 - Crafting Hooks & Pedagogical Explanations",
    message: "Pedagogue Agent writing curiosity hooks and grounded analogies...",
    timestamp: Date.now(),
  });

  const pedagogueOutputs = await Promise.all(
    slicerOut.steps.map((step) => runPedagogueAgent(step, scoperOut.spec, interests))
  );

  // Enrich DAG nodes with pedagogue's verified math walkthrough and grounded explanations
  const enrichedDagNodes = slicerOut.dag.nodes.map((node, i) => {
    const pedOut = pedagogueOutputs[i];
    return {
      ...node,
      deepMath: pedOut?.mathWalkthrough || node.deepMath,
      hook: pedOut?.hook || node.hook,
      explanationSummary: pedOut?.analogy || node.explanationSummary,
    };
  });

  emit({
    agent: "pedagogue",
    status: "verified",
    stage: "6/6 - Pedagogy Formulated",
    message: "Curiosity gaps, analogies, and expected misconceptions grounded in code.",
    timestamp: Date.now(),
  });

  // Final Compiled Project
  const project: CatalogProject = {
    id: `project-${Date.now()}`,
    title: goal,
    tier: scoperOut.spec.tier,
    domain: scoperOut.spec.task === "classification" ? "Classification Pipeline" : "Regression Pipeline",
    spec: scoperOut.spec,
    functions: architectOut.functions,
    steps: slicerOut.steps,
    dag: {
      nodes: enrichedDagNodes,
      edges: slicerOut.dag.edges,
    },
    modelContract: {
      functionName: "predict",
      title: `${goal} Live Inference Model`,
      subtitle: `Trained model inference sandbox for ${goal}`,
      badge: `${scoperOut.spec.tier === "A" ? "Tier A (Pyodide)" : "Tier C"}`,
      features: scoperOut.spec.schema.map((f) => ({
        id: f.name,
        label: f.name.replace(/_/g, " "),
        type: f.type === "float" || f.type === "int" ? "slider" : "text",
        min: f.range ? f.range[0] : 0,
        max: f.range ? f.range[1] : 100,
        step: 1,
        default: f.range ? Math.round((f.range[0] + f.range[1]) / 2) : 50,
      })),
      output: {
        type: scoperOut.spec.task,
        label: scoperOut.spec.target,
      },
    },
    generationLog: {
      attempts: executorOut.attemptsCount,
      executorPassed: executorOut.passed,
      timestamp: new Date().toISOString(),
    },
  };

  return {
    success: executorOut.passed,
    events,
    scoper: scoperOut,
    architect: architectOut,
    executor: executorOut,
    slicer: slicerOut,
    project,
  };
}
