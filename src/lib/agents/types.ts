import {
  ProjectSpec,
  ProjectTier,
  CatalogProjectFunction,
  CatalogProjectStep,
  GoldenValueTest,
  Concept,
  ConceptEdge,
  ErrorType,
  ExplanationStrategy,
  ProjectModelContract,
  DeepMathWalkthrough,
} from "../types";

export type AgentRole =
  | "scoper"
  | "architect"
  | "implementer"
  | "executor"
  | "slicer"
  | "pedagogue"
  | "diagnostician"
  | "redteam"
  | "tutor";

export interface AgentStatusEvent {
  agent: AgentRole;
  status: "idle" | "running" | "verified" | "repairing" | "failed";
  stage: string;
  message: string;
  details?: any;
  timestamp: number;
}

export interface ScoperOutput {
  spec: ProjectSpec;
  tier: ProjectTier;
  isFeasible: boolean;
  feasibilityNote?: string;
  suggestedAlternative?: string;
  rationale: string;
}

export interface ArchitectOutput {
  functions: CatalogProjectFunction[];
  callGraph: {
    nodes: string[];
    edges: Array<{ from: string; to: string }>;
  };
  isAcyclic: boolean;
  topologicalOrder: string[];
  dataFlowDescription: string;
}

export interface ImplementerOutput {
  functionName: string;
  signature: string;
  code: string;
  sampleInput: any;
  sampleOutput: any;
}

export interface ExecutorOutput {
  passed: boolean;
  achievedMetric: number;
  threshold: number;
  metricName: string;
  attemptsCount: number;
  repairsApplied: string[];
  finalPipelineCode: string;
  stdoutLogs: string;
  error?: string;
}

export interface SlicerOutput {
  steps: CatalogProjectStep[];
  dag: {
    nodes: Concept[];
    edges: ConceptEdge[];
  };
}

export interface PedagogueOutput {
  conceptId: string;
  hook: string;
  analogy: string;
  checkQuestion: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  expectedMisconceptions: string[];
  mathWalkthrough?: DeepMathWalkthrough;
}

export interface DiagnosticianOutput {
  correct: boolean;
  errorType: ErrorType;
  rootCauseConceptId?: string;
  diagnosis: string;
  evidence: string;
  feedback: string;
  strategy: ExplanationStrategy;
  matchedExplanation: string;
}

export interface TutorOutput {
  response: string;
  strategy: "socratic_hint" | "syntax_clarification" | "conceptual_probe";
  referencedPastMisconception?: string;
  toolUsed?: string;
}
