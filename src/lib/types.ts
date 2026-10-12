export type ErrorType =
  | "CONCEPTUAL_GAP"
  | "TERMINOLOGY_CONFUSION"
  | "CALCULATION_SLIP"
  | "OVERCONFIDENT_MISCONCEPTION"
  | "NONE";

export type ExplanationStrategy =
  | "analogy"
  | "contrast"
  | "worked_example"
  | "counterexample";

export type ConceptStatus = "unseen" | "learning" | "shaky" | "mastered";

export type ScreenType = "landing" | "diagnostic" | "plan" | "learn" | "complete";

export type CodingBackground = "beginner" | "other_languages" | "python";

export type LearningPhase = "theory" | "building" | "testing";

export interface TechnicalTerm {
  term: string;
  definition: string;
  analogy: string;
  mathSymbolOrFormula?: string;
  exampleUsage?: string;
}

export interface DeepMathWalkthrough {
  formulaName: string;
  formulaLatex: string;
  formulaExplanation: string;
  variableDefinitions: { symbol: string; meaning: string }[];
  numericalExample: {
    givenInputs: string;
    stepByStepArithmetic: string[];
    finalResult: string;
  };
}

export interface Concept {
  id: string;
  title: string;
  prereqs: string[];
  hook: string;
  buildStep: string;
  difficulty: number; // 1-5
  // Interactive learning and build specifications
  explanationSummary?: string;
  corePrinciple?: string;
  workedExample?: {
    scenario: string;
    calculationSteps: string[];
    takeaway: string;
  };
  whyItMatters?: string;
  starterCode?: string;
  solutionCode?: string;
  testAssertion?: string;
  hints?: string[];
  predictQuestion?: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  checkQuestion?: {
    prompt: string;
    options: string[];
    correctIndex: number;
    explanation: string;
  };
  technicalTerms?: TechnicalTerm[];
  deepMath?: DeepMathWalkthrough;
  goldenTest?: GoldenValueTest;
}

export interface ConceptEdge {
  from: string;
  to: string;
  isWeakPrereq?: boolean;
}

export interface DiagnosticQuestion {
  id: string;
  targetConceptId: string;
  question: string;
  options: {
    text: string;
    isCorrect: boolean;
    errorType?: ErrorType;
    rationale?: string;
  }[];
}

export interface DiagnosticResponse {
  question?: DiagnosticQuestion;
  done: boolean;
  mastery?: Record<string, number>;
  recommendedStartingConceptId?: string;
}

export interface MisconceptionRecord {
  conceptId: string;
  errorType: ErrorType;
  note: string;
  diagnosis?: string;
  timestamp: number;
  rootCauseConceptId?: string;
}

export interface ProjectPart {
  conceptId: string;
  functionName?: string;
  description?: string;
  code: string;
  passedAt?: number;
  timestamp?: number;
  passedAssertions?: boolean;
}

export interface EvaluationResult {
  correct: boolean;
  errorType: ErrorType;
  rootCauseConceptId?: string;
  diagnosis: string;
  feedback: string;
  strategy: ExplanationStrategy;
  matchedExplanation: string;
}

export interface TeachBackResult {
  passed: boolean;
  score: number; // 0 - 100
  gaps: string[];
  strengths: string[];
  feedback: string;
  followUp?: string;
}

export type FeatureInputType = "slider" | "text" | "number" | "boolean" | "select";

export interface ModelFeatureSpec {
  id: string;
  label: string;
  type: FeatureInputType;
  min?: number;
  max?: number;
  step?: number;
  default: any;
  unit?: string;
  description?: string;
  options?: string[];
}

export interface ModelOutputClass {
  name: string;
  emoji?: string;
  color?: string;
}

export interface ModelOutputSpec {
  type: "classification" | "regression";
  label: string;
  unit?: string;
  classes?: ModelOutputClass[];
  positiveClass?: string;
  negativeClass?: string;
}

export interface ModelPresetCohort {
  name: string;
  emoji?: string;
  description?: string;
  values: Record<string, any>;
}

export interface ProjectModelContract {
  functionName: string;
  title: string;
  subtitle: string;
  badge: string;
  features: ModelFeatureSpec[];
  output: ModelOutputSpec;
  defaultThreshold?: number;
  presets?: ModelPresetCohort[];
}

export interface PlanGenerationResult {
  templateId?: string;
  rationale: string;
  concepts: Concept[];
  edges: ConceptEdge[];
  startingConceptId: string;
  modelContract?: ProjectModelContract;
}

export type ProjectTier = "A" | "B" | "C";

export interface GoldenValueTest {
  inputs: Record<string, any> | any;
  expectedOutput: any;
  tolerance?: number;
  description?: string;
}

export interface ProjectSpec {
  task: "classification" | "regression";
  schema: Array<{
    name: string;
    type: "float" | "int" | "string" | "boolean";
    range?: [number, number];
    options?: string[];
    description?: string;
  }>;
  target: string;
  metric: string;
  threshold: number;
  tier: ProjectTier;
}

export interface CatalogProjectFunction {
  name: string;
  signature: string;
  dependsOn: string[];
  docstring?: string;
}

export interface CatalogProjectStep {
  id: string;
  conceptId: string;
  title: string;
  function: string;
  blanksCount: number;
  starterCode: string;
  solutionCode: string;
  goldenValues: GoldenValueTest[];
  misconceptions: string[];
}

export interface CatalogProject {
  id: string;
  title: string;
  tier: ProjectTier;
  domain: string;
  spec: ProjectSpec;
  functions: CatalogProjectFunction[];
  steps: CatalogProjectStep[];
  dag: {
    nodes: Concept[];
    edges: ConceptEdge[];
  };
  modelContract: ProjectModelContract;
  generationLog?: {
    attempts: number;
    executorPassed: boolean;
    timestamp: string;
  };
}

export interface RedTeamTestResult {
  id: string;
  scenarioName: string;
  category: "zero_values" | "outliers" | "negative_values" | "nan_missing" | "type_mismatch";
  inputs: Record<string, any>;
  learnerOutput?: any;
  referenceOutput?: any;
  status: "safe" | "vulnerability_found" | "runtime_error";
  errorTrace?: string;
  analysis: string;
}

export interface SessionState {
  id: string;
  goal: string;
  interests: string;
  background: CodingBackground;
  templateId: string | null;
  tier?: ProjectTier;
  concepts: Concept[];
  edges: ConceptEdge[];
  mastery: Record<string, number>;
  status: Record<string, ConceptStatus>;
  teachBackPassed: Record<string, boolean>;
  misconceptions: MisconceptionRecord[];
  projectParts: ProjectPart[];
  queue: string[];
  currentConceptId: string | null;
  screen: ScreenType;
  activeStage: "landing" | "diagnostic" | "plan_review" | "learning" | "completed";
  highlightedEdge: { from: string; to: string } | null;
  isPyodideReady: boolean;
  pyodideError: string | null;
  modelContract?: ProjectModelContract | null;
}


