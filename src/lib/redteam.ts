import { ProjectModelContract, RedTeamTestResult } from "./types";
import { runPythonCode, buildSafeModelExecutionScript } from "./pyodideRunner";

/**
 * Executes adversarial red-team stress tests on the learner's assembled model in Pyodide.
 * Attacks the model's predict() / classify() function with boundary, outlier, and malformed inputs.
 */
export async function executeRedTeamSuite(
  contract: ProjectModelContract,
  assembledPythonCode: string
): Promise<RedTeamTestResult[]> {
  const results: RedTeamTestResult[] = [];
  const fn = contract.functionName || "predict";

  // 1. Scenario: All-Zero Vector
  const zeroInputs: Record<string, any> = {};
  contract.features.forEach((f) => {
    if (f.type === "slider" || f.type === "number") {
      zeroInputs[f.id] = 0;
    } else if (f.type === "text") {
      zeroInputs[f.id] = "";
    } else {
      zeroInputs[f.id] = f.default;
    }
  });

  const zeroResult = await runAdversarialTest(
    "zero_vector",
    "All-Zero Boundary Stress Test",
    "zero_values",
    zeroInputs,
    assembledPythonCode,
    fn
  );
  results.push(zeroResult);

  // 2. Scenario: Extreme Outliers (10x Maximum Scale)
  const outlierInputs: Record<string, any> = {};
  contract.features.forEach((f) => {
    if (f.type === "slider" || f.type === "number") {
      const maxVal = f.max || 100;
      outlierInputs[f.id] = maxVal * 15;
    } else if (f.type === "text") {
      outlierInputs[f.id] = "URGENT ".repeat(500);
    } else {
      outlierInputs[f.id] = f.default;
    }
  });

  const outlierResult = await runAdversarialTest(
    "outliers",
    "Massive Outlier & Gradient Explosion Test",
    "outliers",
    outlierInputs,
    assembledPythonCode,
    fn
  );
  results.push(outlierResult);

  // 3. Scenario: Negative Physical Quantities
  const negativeInputs: Record<string, any> = {};
  contract.features.forEach((f) => {
    if (f.type === "slider" || f.type === "number") {
      negativeInputs[f.id] = -500;
    } else if (f.type === "text") {
      negativeInputs[f.id] = "!@#$%^&*()_+{}[]:;\"'<>?,./";
    } else {
      negativeInputs[f.id] = f.default;
    }
  });

  const negResult = await runAdversarialTest(
    "negative_values",
    "Negative Magnitude & Invalid Domain Test",
    "negative_values",
    negativeInputs,
    assembledPythonCode,
    fn
  );
  results.push(negResult);

  // 4. Scenario: Pure Noise / Missing Tokens
  const noiseInputs: Record<string, any> = {};
  contract.features.forEach((f) => {
    if (f.type === "text") {
      noiseInputs[f.id] = "xyzabc123456 qwertyuiop asdfghjkl zxcvbnm";
    } else {
      noiseInputs[f.id] = f.default;
    }
  });

  const noiseResult = await runAdversarialTest(
    "unseen_vocab",
    "Out-of-Distribution Unseen Token Test",
    "type_mismatch",
    noiseInputs,
    assembledPythonCode,
    fn
  );
  results.push(noiseResult);

  return results;
}

/**
 * Helper to run an isolated adversarial execution inside Pyodide
 */
async function runAdversarialTest(
  id: string,
  scenarioName: string,
  category: "zero_values" | "outliers" | "negative_values" | "nan_missing" | "type_mismatch",
  inputs: Record<string, any>,
  code: string,
  functionName: string
): Promise<RedTeamTestResult> {
  const runnerScript = buildSafeModelExecutionScript({
    code,
    inputs,
    functionName,
    threshold: 0.5,
    outputMarker: "__REDTEAM_RESULT__",
    mode: "redteam",
  });

  try {
    const execRes = await runPythonCode(runnerScript);
    const stdout = execRes.stdout || "";
    const match = stdout.match(/__REDTEAM_RESULT__:(.+)$/m);

    if (match && match[1]) {
      const parsed = JSON.parse(match[1]);
      if (parsed.error) {
        return {
          id,
          scenarioName,
          category,
          inputs,
          status: "runtime_error",
          errorTrace: parsed.error,
          analysis: `Model crashed with an unhandled exception (${parsed.error}). Real production models should sanitize inputs and guard against division-by-zero or empty values.`,
        };
      }

      // Check for common ML vulnerabilities in output
      const outStr = String(parsed.output);
      if (outStr.includes("nan") || outStr.includes("inf")) {
        return {
          id,
          scenarioName,
          category,
          inputs,
          learnerOutput: outStr,
          status: "vulnerability_found",
          analysis: `Model produced a non-finite result (${outStr}). Numerical instability detected — check your normalization and log-probabilities!`,
        };
      }

      if (category === "negative_values" && (outStr.includes("-") && !outStr.includes("Normal"))) {
        return {
          id,
          scenarioName,
          category,
          inputs,
          learnerOutput: outStr,
          status: "vulnerability_found",
          analysis: `Model returned a negative outcome (${outStr}) for physical quantities that should be strictly bounded. Consider bounding activation outputs.`,
        };
      }

      return {
        id,
        scenarioName,
        category,
        inputs,
        learnerOutput: outStr,
        status: "safe",
        analysis: `Model handled input gracefully without crashing or returning invalid numbers (Returned: ${outStr}).`,
      };
    }

    if (!execRes.success && execRes.stderr) {
      return {
        id,
        scenarioName,
        category,
        inputs,
        status: "runtime_error",
        errorTrace: execRes.stderr,
        analysis: `Execution raised: ${execRes.stderr.slice(0, 150)}...`,
      };
    }

    return {
      id,
      scenarioName,
      category,
      inputs,
      status: "safe",
      analysis: "Test executed without fatal runtime crashes.",
    };
  } catch (err: any) {
    return {
      id,
      scenarioName,
      category,
      inputs,
      status: "runtime_error",
      errorTrace: String(err),
      analysis: `Runtime execution error: ${String(err)}`,
    };
  }
}
