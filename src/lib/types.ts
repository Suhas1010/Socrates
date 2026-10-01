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

export interface SessionState {
  id: string;
  goal: string;
  interests: string;
  background: CodingBackground;
  templateId: string | null;
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

