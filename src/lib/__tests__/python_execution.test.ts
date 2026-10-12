import { describe, it, expect } from "vitest";
import { SPAM_CLASSIFIER_CONCEPTS, SPAM_DATASET } from "../templates/spamClassifier";
import { REAL_ESTATE_CONCEPTS } from "../templates/realEstate";
import { PYTHON_TRACK_CONCEPTS } from "../templates/pythonTrack";
import { CHATGPT_CONCEPTS } from "../templates/chatGpt";
import { DIGIT_RECOGNIZER_CONCEPTS } from "../templates/digitRecognizer";
import { SENTIMENT_ANALYSIS_CONCEPTS } from "../templates/sentimentAnalysis";
import { spawnSync } from "child_process";
import { buildSafeModelExecutionScript } from "../pyodideRunner";
import { deriveModelContractForGoal } from "../inference";

describe("Python Execution Verification for all Concepts", () => {
  const allTemplates = [
    { name: "spam", concepts: SPAM_CLASSIFIER_CONCEPTS },
    { name: "realEstate", concepts: REAL_ESTATE_CONCEPTS },
    { name: "pythonTrack", concepts: PYTHON_TRACK_CONCEPTS },
    { name: "chatGpt", concepts: CHATGPT_CONCEPTS },
    { name: "digit", concepts: DIGIT_RECOGNIZER_CONCEPTS },
    { name: "sentiment", concepts: SENTIMENT_ANALYSIS_CONCEPTS },
  ];

  for (const track of allTemplates) {
    let priorCodes = "";
    for (const concept of track.concepts) {
      it(`[${track.name}] ${concept.id} runs in Python without assertion or runtime error`, () => {
        const fullCode = `
import math
import re
from collections import defaultdict

${track.name === "spam" ? `DATASET = ${JSON.stringify(SPAM_DATASET)}\n` : ""}
${priorCodes}
${concept.solutionCode || ""}
${concept.testAssertion || ""}
`;
        const res = spawnSync("python", ["-c", fullCode], { encoding: "utf-8" });
        if (res.status !== 0) {
          console.error(`[FAIL] ${track.name} -> ${concept.id}\nSTDERR: ${res.stderr}`);
        }
        expect(res.status).toBe(0);

        if (concept.solutionCode) {
          const clean = concept.solutionCode
            .split("\n")
            .filter((l) => !l.trim().startsWith("print(") && !l.trim().startsWith("assert "))
            .join("\n");
          priorCodes += clean + "\n";
        }
      });
    }
  }

  it("Cross-Project Isolation: executes digit recognizer without 'sqft' error even if previous session defined estimate_home_value", () => {
    // Assemble all solution code for Digit Recognizer
    const digitCode = DIGIT_RECOGNIZER_CONCEPTS.map((c: any) => c.solutionCode || "").join("\n\n");

    // Simulate dirty Pyodide environment contaminated with real estate globals:
    const dirtySetup = `
def estimate_home_value(listing, weights, bias):
    return listing['sqft'] * weights[0] + bias

w = [150.0]
b = 30000.0
`;

    // 1. Check deriveModelContractForGoal
    const contract = deriveModelContractForGoal("digit recognizer mnist");
    expect(contract.functionName).toBe("classify_digit");
    expect(contract.badge).toBe("Neural Digit Classifier");
    expect(contract.features.length).toBe(4);

    // 2. Generate execution script using buildSafeModelExecutionScript
    const inputs = {
      strokeDensity: 0.65,
      verticalBias: 0.85,
      loopRatio: 0.1,
      horizontalCross: 0.75,
    };

    const pythonScript = `
${dirtySetup}

${buildSafeModelExecutionScript({
  code: digitCode,
  inputs,
  functionName: contract.functionName,
  threshold: 0.5,
  outputMarker: "__RESULT__",
  mode: "prediction",
})}
`;

    const res = spawnSync("python", ["-c", pythonScript], { encoding: "utf-8" });
    expect(res.status).toBe(0);

    const match = (res.stdout || "").match(/__RESULT__:(.+)$/m);
    expect(match).toBeTruthy();
    const parsed = JSON.parse(match![1]);
    expect(parsed.error).toBeNull();
    expect(parsed.prediction).toBeDefined();
    expect(parsed.prediction.predicted_digit).toBeDefined();
    expect(typeof parsed.prediction.predicted_digit).toBe("number");
    expect(parsed.prediction.confidence).toBeGreaterThan(0);
    // Explicit assertion: 'sqft' was never accessed!
    expect(res.stdout).not.toContain("KeyError: 'sqft'");
    expect(res.stderr).not.toContain("KeyError: 'sqft'");
  });

  it("Red-Team Isolation: runs adversarial tests on digit recognizer with zero cross-project errors", () => {
    const digitCode = DIGIT_RECOGNIZER_CONCEPTS.map((c: any) => c.solutionCode || "").join("\n\n");
    const dirtySetup = `
def estimate_home_value(listing, weights, bias):
    return listing['sqft'] * weights[0] + bias
`;

    const pythonScript = `
${dirtySetup}

${buildSafeModelExecutionScript({
  code: digitCode,
  inputs: { strokeDensity: 0, verticalBias: 0, loopRatio: 0, horizontalCross: 0 },
  functionName: "classify_digit",
  threshold: 0.5,
  outputMarker: "__REDTEAM_RESULT__",
  mode: "redteam",
})}
`;

    const res = spawnSync("python", ["-c", pythonScript], { encoding: "utf-8" });
    expect(res.status).toBe(0);
    const match = (res.stdout || "").match(/__REDTEAM_RESULT__:(.+)$/m);
    expect(match).toBeTruthy();
    const parsed = JSON.parse(match![1]);
    expect(parsed.error).toBeNull();
    expect(parsed.output).toContain("Digit");
  });

  it("Generic Fallback Isolation: custom project with unknown goal executes cleanly without 'sqft' contamination", () => {
    const customContract = deriveModelContractForGoal("Drone Battery Depletion Forecast");
    const customLearnerCode = `
def predict(features):
    return sum(features.values()) * 0.85
`;

    const dirtySetup = `
def estimate_home_value(listing, weights, bias):
    return listing['sqft'] * 100
`;

    const pythonScript = `
${dirtySetup}

${buildSafeModelExecutionScript({
  code: customLearnerCode,
  inputs: { feature_1: 0.5, feature_2: 0.8 },
  functionName: customContract.functionName,
  threshold: 0.5,
  outputMarker: "__RESULT__",
  mode: "prediction",
})}
`;

    const res = spawnSync("python", ["-c", pythonScript], { encoding: "utf-8" });
    expect(res.status).toBe(0);
    const match = (res.stdout || "").match(/__RESULT__:(.+)$/m);
    expect(match).toBeTruthy();
    const parsed = JSON.parse(match![1]);
    expect(parsed.error).toBeNull();
    expect(parsed.prediction).toBeCloseTo(1.105, 2);
  });

  it("buildSafeModelExecutionScript serializes numpy scalar/ndarray return values without TypeError", () => {
    const mockNumpyModelScript = `
class MockNdarray(list):
    def tolist(self):
        return list(self)

class MockInt64:
    def __init__(self, val):
        self.val = int(val)
    def item(self):
        return self.val
    def __str__(self):
        return str(self.val)

def predict_patient_risk(features):
    # Simulates scikit-learn returning numpy int64 array
    return MockNdarray([MockInt64(1)])
`;

    const script = buildSafeModelExecutionScript({
      code: mockNumpyModelScript,
      inputs: { glucose: 145, bmi: 31, age: 52, bp: 138 },
      functionName: "predict_patient_risk",
      threshold: 0.5,
      outputMarker: "__RESULT__",
      mode: "prediction",
    });

    const res = spawnSync("python", ["-c", script], { encoding: "utf-8" });
    expect(res.status).toBe(0);
    expect(res.stderr).toBe("");
    const match = (res.stdout || "").match(/__RESULT__:(.+)$/m);
    expect(match).toBeTruthy();
    const parsed = JSON.parse(match![1]);
    expect(parsed.error).toBeNull();
    expect(parsed.prediction).toBe(1);
  });

  describe("Anti-Cheating & Sarcasm Regression Prevention", () => {
    it("never passes when learner writes print('HELLO SUHAS')", async () => {
      const { runPythonCode } = await import("../pyodideRunner");
      const digitStep = DIGIT_RECOGNIZER_CONCEPTS[5];

      const res = await runPythonCode('print("HELLO SUHAS")', digitStep.testAssertion);
      expect(res.assertionPassed).toBe(false);
      expect(res.error).toBeDefined();
    });

    it("never passes when learner writes print('hello suhas')", async () => {
      const { runPythonCode } = await import("../pyodideRunner");
      const res = await runPythonCode('print("hello suhas")', 'assert False, "Should fail"');
      expect(res.assertionPassed).toBe(false);
    });

    it("never passes when learner code contains '___' unfilled blank", async () => {
      const { runPythonCode } = await import("../pyodideRunner");
      const res = await runPythonCode('def classify(x):\n    return ___', 'assert True');
      expect(res.assertionPassed).toBe(false);
      expect(res.error).toContain("___");
    });

    it("never passes when learner code is stubbed with 'pass'", async () => {
      const { runPythonCode } = await import("../pyodideRunner");
      const res = await runPythonCode('def classify_digit(x):\n    pass', 'assert True');
      expect(res.assertionPassed).toBe(false);
    });

    it("Python Subprocess Scope Purge: verifies stale functions in memory are purged so print('HELLO SUHAS') fails with NameError", () => {
      const dirtyEnvironmentScript = `
# 1. Simulate prior run that defined classify_digit
def classify_digit(features, weights_matrix=None, biases=None):
    return {"predicted_digit": 7, "confidence": 0.99, "probabilities": [0.0]*10}

# 2. Scope purge preamble
_SYS_KEYS = {
    '__name__', '__doc__', '__package__', '__loader__', '__spec__',
    '__annotations__', '__builtins__', 'sys', 'types', 'math', 'json',
    'random', 're', 'collections', 'defaultdict', 'Counter', 'sklearn'
}
for _k in list(globals().keys()):
    if not _k.startswith('__') and _k not in _SYS_KEYS:
        try:
            del globals()[_k]
        except Exception:
            pass

# 3. Learner code for current run
print("HELLO SUHAS")

# 4. Step test assertion
res = classify_digit([1.0]*4)
assert res["predicted_digit"] == 7
`;
      const res = spawnSync("python", ["-c", dirtyEnvironmentScript], { encoding: "utf-8" });
      // Must exit with error because classify_digit was PURGED!
      expect(res.status).not.toBe(0);
      expect(res.stderr).toContain("NameError: name 'classify_digit' is not defined");
      expect(res.stdout).toContain("HELLO SUHAS");
    });
  });
});
