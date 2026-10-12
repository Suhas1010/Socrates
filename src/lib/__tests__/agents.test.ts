import { describe, it, expect } from "vitest";
import { runScoperAgent } from "../agents/scoper";
import { runArchitectAgent } from "../agents/architect";
import { runImplementerAgent } from "../agents/implementer";
import { runExecutorAgent } from "../agents/executor";
import { runSlicerAgent } from "../agents/slicer";
import {
  runPedagogueAgent,
  buildPedagogueMathPrompt,
  validateMathExplanationAgainstGoldenValues,
  generateReviewerValidatedMathWalkthrough,
} from "../agents/pedagogue";
import {
  mapAgentEventToLearnerMessage,
  AGENT_LEARNER_PROGRESS_MESSAGES,
} from "../agents/mapper";
import { runDiagnosticianAgent } from "../agents/diagnostician";
import { runTutorAgent } from "../agents/tutor";
import { executeMultiAgentPipeline } from "../agents/orchestrator";
import { executeRedTeamSuite } from "../redteam";
import { CATALOG_SPAM_CLASSIFIER } from "../catalog";
import {
  deriveStepSpecificMathWalkthrough,
  enrichConceptWithDeepTheory,
} from "../technicalDictionary";

describe("Autonomous AI Agents for Specific ML Tasks", () => {
  it("Scoper Agent: classifies task, extracts schema, and assigns tier", async () => {
    const output = await runScoperAgent("Predict hospital patient 30-day readmission", "Healthcare", "Intermediate Python");
    expect(output.spec).toBeDefined();
    expect(output.spec.task).toBe("classification");
    expect(output.spec.schema.length).toBeGreaterThan(0);
    expect(output.tier).toMatch(/^[ABC]$/);

    // Test absurd goal detection
    const absurd = await runScoperAgent("Build a time travel prediction machine");
    expect(absurd.spec.target).toBe("unpredictable");
  });

  it("Architect Agent: generates acyclic DAG call graph with topological sorting", async () => {
    const scoperOut = await runScoperAgent("Spam SMS Detector");
    const archOut = await runArchitectAgent(scoperOut.spec, "Spam SMS Detector");
    expect(archOut.functions.length).toBeGreaterThanOrEqual(3);
    expect(archOut.isAcyclic).toBe(true);
    expect(archOut.topologicalOrder.length).toBe(archOut.functions.length);
    expect(archOut.callGraph.edges.length).toBeGreaterThan(0);
  });

  it("Implementer Agent: synthesizes Python code with unit verification", async () => {
    const scoperOut = await runScoperAgent("Housing prices");
    const fnSpec = { name: "preprocess_features", signature: "preprocess_features(X)", dependsOn: [] };
    const implOut = await runImplementerAgent(fnSpec, scoperOut.spec);
    expect(implOut.code).toContain("def preprocess_features");
    expect(implOut.sampleInput).toBeDefined();
    expect(implOut.sampleOutput).toBeDefined();
  });

  it("Executor Agent: runs Pyodide harness, checks metrics, and applies repair loop", async () => {
    const scoperOut = await runScoperAgent("Spam classifier");
    const validCode = `
def preprocess_features(X):
    return [float(x) for x in X] if isinstance(X, list) else 0.0

def predict(X):
    return [1 if x > 0.5 else 0 for x in X] if isinstance(X, list) else 0
`;
    const execOut = await runExecutorAgent(validCode, scoperOut.spec);
    expect(typeof execOut.achievedMetric).toBe("number");
    expect(execOut.achievedMetric).toBeGreaterThanOrEqual(0.0);
  });

  it("Slicer Agent: cuts pipeline into 3+ branches with blanks and golden values", async () => {
    const scoperOut = await runScoperAgent("Detect spam messages");
    const sliceOut = await runSlicerAgent("Detect spam messages", scoperOut.spec);
    expect(sliceOut.steps.length).toBeGreaterThanOrEqual(3);
    expect(sliceOut.dag.nodes.length).toBeGreaterThanOrEqual(4);
    
    // Check that starter code contains blanks
    const stepWithBlank = sliceOut.steps.find((s) => s.starterCode.includes("___"));
    expect(stepWithBlank).toBeDefined();
  });

  it("Pedagogue Agent: crafts curiosity hooks and domain-grounded analogies", async () => {
    const scoperOut = await runScoperAgent("Credit fraud detector", "Finance");
    const step = {
      id: "step-1",
      title: "Feature Scaling",
      function: "scale",
      blanksCount: 1,
      starterCode: "def scale(x): return ___",
      solutionCode: "def scale(x): return x / 100",
      goldenValues: [{ inputs: [100], expectedOutput: 1.0, tolerance: 0.01 }],
      misconceptions: [],
      conceptId: "feature-scaling",
    };
    const pedOut = await runPedagogueAgent(step, scoperOut.spec, "Stock Market Trading");
    expect(pedOut.hook.toLowerCase()).toContain("feature scaling");
    expect(pedOut.analogy).toContain("Stock Market Trading");
    expect(pedOut.checkQuestion.prompt).toBeTruthy();
    expect(pedOut.checkQuestion.options.length).toBeGreaterThanOrEqual(3);
    expect(pedOut.mathWalkthrough).toBeDefined();
    expect(pedOut.mathWalkthrough?.numericalExample.givenInputs).toContain("100");
  });

  it("Bug 1: Pedagogue prompt is strictly constrained to golden values", () => {
    const scoperSpec = {
      task: "classification" as const,
      schema: [],
      target: "label",
      metric: "f1_score",
      threshold: 0.85,
      tier: "A" as const,
    };
    const step = {
      id: "step-bayes",
      title: "Calculate Posterior",
      function: "compute_posterior",
      blanksCount: 1,
      starterCode: "def compute_posterior(p_spam, p_ham): return ___",
      solutionCode: "def compute_posterior(p_spam, p_ham): return p_spam / (p_spam + p_ham)",
      goldenValues: [{ inputs: { p_spam: 0.12, p_ham: 0.04 }, expectedOutput: 0.75, tolerance: 0.01 }],
      misconceptions: [],
      conceptId: "posterior",
    };

    const promptObj = buildPedagogueMathPrompt(step, scoperSpec, step.goldenValues);
    expect(promptObj.systemPrompt).toContain("Use ONLY the exact inputs and outputs provided in the golden values.");
    expect(promptObj.systemPrompt).toContain("Do NOT invent numbers.");
    expect(promptObj.systemPrompt).toContain("If the function is not mathematical");
    expect(promptObj.userPrompt).toContain("0.12");
    expect(promptObj.userPrompt).toContain("0.75");
  });

  it("Bug 1: Reviewer Agent validates math numbers and rejects invented numbers", () => {
    const goldenTests = [{ inputs: [100], expectedOutput: 1.0, tolerance: 0.01 }];

    // Valid walkthrough using golden values
    const validWalkthrough = {
      formulaName: "Feature Scaling",
      formulaLatex: "y = x / 100",
      formulaExplanation: "Scale numeric value",
      variableDefinitions: [{ symbol: "x", meaning: "input" }],
      numericalExample: {
        givenInputs: "Features x = 100",
        stepByStepArithmetic: ["Step 1: Divide 100 by 100 = 1.0"],
        finalResult: "Computed Output = 1.0",
      },
    };

    const reviewPass = validateMathExplanationAgainstGoldenValues(validWalkthrough, goldenTests);
    expect(reviewPass.valid).toBe(true);

    // Invalid walkthrough that invented generic linear regression numbers ([0.80, 0.20], w=[2.0, -1.5])
    const inventedWalkthrough = {
      formulaName: "Linear Combination",
      formulaLatex: "z = wx + b",
      formulaExplanation: "Dot product",
      variableDefinitions: [{ symbol: "x", meaning: "input" }],
      numericalExample: {
        givenInputs: "Features x = [0.80, 0.20], Weights w = [2.0, -1.5], Bias b = 0.10",
        stepByStepArithmetic: ["Step 1: 0.80 * 2.0 = 1.60", "Step 2: 1.60 - 0.30 = 1.30"],
        finalResult: "Raw logit z = 1.40",
      },
    };

    const reviewFail = validateMathExplanationAgainstGoldenValues(inventedWalkthrough, goldenTests);
    expect(reviewFail.valid).toBe(false);
    expect(reviewFail.error).toContain("Reviewer Validation Failed");
  });

  it("Bug 2: Event mapper translates internal agent events to clean learner messages without leaking agent names", () => {
    // Check mapping
    expect(mapAgentEventToLearnerMessage("scoper")).toBe("Understanding your goal...");
    expect(mapAgentEventToLearnerMessage("architect")).toBe("Designing the project architecture...");
    expect(mapAgentEventToLearnerMessage("implementer")).toBe("Writing and verifying the reference code...");
    expect(mapAgentEventToLearnerMessage("executor")).toBe("Writing and verifying the reference code...");
    expect(mapAgentEventToLearnerMessage("slicer")).toBe("Creating your step-by-step path...");
    expect(mapAgentEventToLearnerMessage("pedagogue")).toBe("Preparing your workspace...");

    // Check that NO internal agent names (Scoper, Architect, Slicer, etc.) are leaked into the learner messages
    const roles: Array<keyof typeof AGENT_LEARNER_PROGRESS_MESSAGES> = [
      "scoper", "architect", "implementer", "executor", "slicer", "pedagogue"
    ];
    for (const r of roles) {
      const msg = mapAgentEventToLearnerMessage(r).toLowerCase();
      expect(msg).not.toMatch(/\bscoper\b/);
      expect(msg).not.toMatch(/\barchitect\b/);
      expect(msg).not.toMatch(/\bimplementer\b/);
      expect(msg).not.toMatch(/\bexecutor\b/);
      expect(msg).not.toMatch(/\bslicer\b/);
      expect(msg).not.toMatch(/\bpedagogue\b/);
      expect(msg).not.toContain("agent");
    }
  });

  it("Bug 1 Grounding: Step-specific math resolves authentic numbers and data-flow, never generic linear regression", () => {
    // 1. Text tokenization step (Spam Classifier step 1) must show tokenization data flow, NOT z = wx + b
    const tokenConcept = {
      id: "what-is-classification",
      title: "Classification & Decision Boundaries",
      prereqs: [],
      difficulty: 1,
      hook: "How does an SMS spam filter work?",
      buildStep: "Implement tokenizer",
    };
    const tokenMath = deriveStepSpecificMathWalkthrough(tokenConcept, "a spam classifier");
    expect(tokenMath.formulaLatex).toContain("tokenize");
    expect(tokenMath.numericalExample.givenInputs).not.toContain("[0.80, 0.20]");
    expect(tokenMath.numericalExample.givenInputs).toContain("WINNER");

    // 2. Vision pixel flattening step (MNIST step 1) must show pixel normalization, NOT z = wx + b
    const visionConcept = {
      id: "pixels-to-vectors",
      title: "Pixels to Flattened Numerical Vectors",
      prereqs: [],
      difficulty: 1,
      hook: "How does a CNN see images?",
      buildStep: "Flatten pixel matrix",
    };
    const visionMath = deriveStepSpecificMathWalkthrough(visionConcept, "digit recognizer");
    expect(visionMath.formulaLatex).toContain("255.0");
    expect(visionMath.numericalExample.givenInputs).toContain("28×28");

    // 3. ChatGPT self-attention step must show Q/K/V attention, NOT z = wx + b
    const attentionConcept = {
      id: "scaled-dot-product-attention",
      title: "Scaled Dot-Product Attention",
      prereqs: [],
      difficulty: 3,
      hook: "How does self-attention attend to words?",
      buildStep: "Compute attention weights",
    };
    const attentionMath = deriveStepSpecificMathWalkthrough(attentionConcept, "how ChatGPT works");
    expect(attentionMath.formulaLatex).toContain("softmax");
    expect(attentionMath.formulaLatex).toContain("Kᵀ");

    // 4. Concept with workedExample uses the authentic workedExample scenario and arithmetic
    const workedExampleConcept = {
      id: "features-from-text",
      title: "Bag-of-Words & Feature Counts",
      prereqs: [],
      difficulty: 2,
      hook: "Count word frequencies",
      buildStep: "Implement BoW",
      workedExample: {
        scenario: "Analyzing 100 emails (40 spam, 60 ham) for words 'urgent' and 'project'",
        calculationSteps: [
          "In 40 Spam emails: 'urgent' appears 35 times (87.5%)",
          "In 60 Ham emails: 'urgent' appears 3 times (5.0%)",
          "Frequency Ratio: 0.875 / 0.05 = 17.5x higher in spam!",
        ],
        takeaway: "Word counts provide strong statistical signals of intent.",
      },
    };
    const enrichedWorkedExample = enrichConceptWithDeepTheory(workedExampleConcept, "a spam classifier");
    expect(enrichedWorkedExample.deepMath).toBeDefined();
    expect(enrichedWorkedExample.deepMath!.numericalExample.givenInputs).toContain("100 emails");
    expect(enrichedWorkedExample.deepMath!.numericalExample.finalResult).toContain("signals of intent");
    expect(enrichedWorkedExample.deepMath!.numericalExample.stepByStepArithmetic[0]).not.toMatch(/^Step \d+:/);
  });


  it("Diagnostician Agent: diagnoses across 4-type error taxonomy with evidence", async () => {
    // 1. Calculation slip: sign error
    const signSlip = await runDiagnosticianAgent({
      conceptId: "gradient-descent",
      userCode: "w = w + lr * grad",
      goldenTest: { description: "step", inputs: {}, expectedOutput: 0.95, tolerance: 0.01 },
      actualOutput: -0.95,
    });
    expect(signSlip.errorType).toBe("CALCULATION_SLIP");
    expect(signSlip.strategy).toBe("worked_example");

    // 2. Conceptual gap: magnitude error
    const conceptGap = await runDiagnosticianAgent({
      conceptId: "feature-scaling",
      userCode: "def scale(x): return x * 100",
      goldenTest: { description: "step", inputs: {}, expectedOutput: 0.1, tolerance: 0.01 },
      actualOutput: 1000.0,
    });
    expect(conceptGap.errorType).toBe("CONCEPTUAL_GAP");
    expect(conceptGap.strategy).toBe("analogy");

    // 3. Terminology confusion: KeyError
    const termConf = await runDiagnosticianAgent({
      conceptId: "naive-bayes",
      userCode: "return word_counts['Spam']",
      errorTrace: "KeyError: 'Spam'",
    });
    expect(termConf.errorType).toBe("TERMINOLOGY_CONFUSION");
    expect(termConf.strategy).toBe("contrast");
  });

  it("Red-Team Agent: executes boundary, outlier, and OOD stress tests", async () => {
    const pythonCode = `
def classify(text="", threshold=0.65):
    if not text:
        return {"prediction": "ham", "prob": 0.0}
    return {"prediction": "ham", "prob": 0.1}
`;
    const tests = await executeRedTeamSuite(CATALOG_SPAM_CLASSIFIER.modelContract, pythonCode);
    expect(tests.length).toBe(4);
    expect(tests.every((t) => t.scenarioName && t.status)).toBe(true);
  });

  it("Runtime Socratic Tutor Agent: enforces Attempt-First lock without giving away code", async () => {
    // When locked and learner asks for code directly
    const lockedReply = await runTutorAgent({
      query: "Just give me the code for this step",
      conceptTitle: "Sigmoid Activation",
      attemptsCount: 1,
      isLocked: true,
      pastMisconceptions: [],
    });
    expect(lockedReply.strategy).toBe("socratic_hint");
    expect(lockedReply.response).toContain("Attempt-First");

    // When unlocked or asking a conceptual question
    const conceptReply = await runTutorAgent({
      query: "Why do we use the exponential function in sigmoid?",
      conceptTitle: "Sigmoid Activation",
      attemptsCount: 2,
      isLocked: false,
      pastMisconceptions: [],
    });
    expect(conceptReply.response.length).toBeGreaterThan(20);
    expect(conceptReply.strategy).toBe("socratic_hint");
  });

  it("Multi-Agent Orchestrator: coordinates full pipeline and emits progress events", async () => {
    const events: string[] = [];
    const result = await executeMultiAgentPipeline(
      "Real estate price prediction",
      "Architecture",
      "Beginner",
      (evt) => {
        events.push(`[${evt.agent}] ${evt.status}: ${evt.message}`);
      }
    );

    expect(result.success).toBe(true);
    expect(events.length).toBeGreaterThanOrEqual(6);
    expect(result.scoper.tier).toMatch(/^[ABC]$/);
    expect(result.architect.isAcyclic).toBe(true);
    expect(result.slicer.steps.length).toBeGreaterThanOrEqual(3);
  });
});
