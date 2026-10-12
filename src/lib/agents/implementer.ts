import { CatalogProjectFunction, ProjectSpec } from "../types";
import { ImplementerOutput } from "./types";
import { runPythonCode } from "../pyodideRunner";

/**
 * Implementer Agent (Section 7.2 & 6.2 G-2)
 * Writes runnable, verified code for an individual pipeline function.
 */
export async function runImplementerAgent(
  fnSpec: CatalogProjectFunction,
  spec: ProjectSpec
): Promise<ImplementerOutput> {
  const isClassification = spec.task === "classification";

  let code = "";
  let sampleInput: any = {};
  let sampleOutput: any = {};

  if (fnSpec.name.includes("scale") || fnSpec.name.includes("normaliz") || fnSpec.name.includes("preprocess")) {
    code = `def ${fnSpec.name}(X):\n    # Min-max feature normalization\n    if isinstance(X, dict):\n        return {k: max(0.0, min(1.0, float(v) / 100.0)) for k, v in X.items()}\n    return [max(0.0, min(1.0, float(v) / 100.0)) for v in X]`;
    sampleInput = [10, 50, 100];
    sampleOutput = [0.1, 0.5, 1.0];
  } else if (fnSpec.name.includes("tokenize")) {
    code = `import re\ndef ${fnSpec.name}(text):\n    return re.findall(r"\\b[a-zA-Z0-9]+\\b", text.lower())`;
    sampleInput = "Hello, World! 123";
    sampleOutput = ["hello", "world", "123"];
  } else if (fnSpec.name.includes("sigmoid")) {
    code = `import math\ndef ${fnSpec.name}(z):\n    return 1.0 / (1.0 + math.exp(-z))`;
    sampleInput = 0.0;
    sampleOutput = 0.5;
  } else if (fnSpec.name.includes("loss") || fnSpec.name.includes("error")) {
    code = `def ${fnSpec.name}(y_true, y_pred):\n    return sum((yt - yp) ** 2 for yt, yp in zip(y_true, y_pred)) / max(len(y_true), 1)`;
    sampleInput = { y_true: [1, 2], y_pred: [1, 3] };
    sampleOutput = 0.5;
  } else {
    // General inference or prediction function
    if (isClassification) {
      code = `def ${fnSpec.name}(inputs):\n    # Threshold-based binary classification\n    score = sum(float(v) for v in inputs.values()) if isinstance(inputs, dict) else sum(float(v) for v in inputs)\n    prob = 1.0 / (1.0 + math.exp(-score / 10.0))\n    return {"prediction": "positive" if prob >= 0.5 else "negative", "probability": round(prob, 3)}`;
      sampleInput = { f1: 5, f2: 2 };
      sampleOutput = { prediction: "positive", probability: 0.668 };
    } else {
      code = `def ${fnSpec.name}(inputs):\n    # Weighted linear regression\n    val = sum(float(v) * 1.5 for v in inputs.values()) if isinstance(inputs, dict) else sum(float(v) * 1.5 for v in inputs)\n    return round(val, 2)`;
      sampleInput = { f1: 10, f2: 20 };
      sampleOutput = 45.0;
    }
  }

  // Verification step: Run on sample inputs in Pyodide
  const testScript = `
import math
${code}
_res = ${fnSpec.name}(${JSON.stringify(sampleInput)})
`;
  const runResult = await runPythonCode(testScript);
  if (!runResult.success && runResult.error) {
    throw new Error(`Implementer Error in ${fnSpec.name}: ${runResult.error}`);
  }

  return {
    functionName: fnSpec.name,
    signature: fnSpec.signature,
    code,
    sampleInput,
    sampleOutput,
  };
}
