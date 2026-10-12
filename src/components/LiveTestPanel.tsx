"use client";

import React, { useState, useMemo, useEffect, useRef } from "react";
import {
  Sliders,
  Play,
  RotateCcw,
  ShieldAlert,
  ShieldCheck,
  Zap,
  Terminal,
  AlertTriangle,
  CheckCircle2,
  Cpu,
  Layers,
  ArrowRight,
  Rocket,
  Sparkles,
  Copy,
  Check,
  Download,
  BookOpen,
  FileCode,
  ExternalLink,
  HelpCircle,
} from "lucide-react";
import { useSessionStore } from "@/lib/store";
import { deriveModelContractForGoal } from "@/lib/inference";
import { runPythonCode, initPyodide, PythonExecutionResult, buildSafeModelExecutionScript } from "@/lib/pyodideRunner";
import { ProjectModelContract, RedTeamTestResult } from "@/lib/types";
import { executeRedTeamSuite } from "@/lib/redteam";
import {
  generateProjectRoadmap,
  deriveFallbackModelReview,
  ModelReviewData,
} from "@/lib/roadmapGenerator";
import { getClientLLMConfig } from "@/lib/clientLLM";

export interface LiveTestPanelProps {
  onBackToBuild?: () => void;
  onBackToTheory?: () => void;
}

export const LiveTestPanel: React.FC<LiveTestPanelProps> = ({
  onBackToBuild,
  onBackToTheory,
}) => {
  const { goal, concepts, projectParts } = useSessionStore();
  const safeGoal = goal?.trim() || "Your Machine Learning Project";

  // Derive model specification contract
  const contract: ProjectModelContract = useMemo(() => {
    return deriveModelContractForGoal(safeGoal, concepts);
  }, [safeGoal, concepts]);

  // Feature input state
  const [featureValues, setFeatureValues] = useState<Record<string, any>>(() => {
    return Object.fromEntries(contract.features.map((f) => [f.id, f.default]));
  });
  const [threshold, setThreshold] = useState<number>(contract.defaultThreshold || 0.5);
  const [activePreset, setActivePreset] = useState<string | null>(
    contract.presets?.[0]?.name || null
  );

  // Pipeline completeness check
  const builtStepsCount = concepts.filter((c) => projectParts.some((p) => p.conceptId === c.id)).length;
  const isPipelineComplete = builtStepsCount >= concepts.length && concepts.length > 0;
  const [useReferencePreview, setUseReferencePreview] = useState(builtStepsCount === 0);

  // Live Pyodide Execution State
  const [isExecuting, setIsExecuting] = useState(false);
  const [liveOutput, setLiveOutput] = useState<{
    prediction: any;
    rawText: string;
    isError: boolean;
    errorText?: string;
    executionTimeMs: number;
    source: "learner_code" | "reference_preview";
  } | null>(null);

  // Differential Testing State
  const [differentialResult, setDifferentialResult] = useState<{
    referencePrediction: any;
    matches: boolean;
    differenceNote: string;
  } | null>(null);

  // Red-Team Adversarial Suite State
  const [redTeamResults, setRedTeamResults] = useState<RedTeamTestResult[] | null>(null);
  const [isRunningRedTeam, setIsRunningRedTeam] = useState(false);
  const [activeTab, setActiveTab] = useState<"runner" | "differential" | "redteam" | "review" | "roadmap">("runner");

  // AI Review State
  const [aiReview, setAiReview] = useState<ModelReviewData | null>(null);
  const [isLoadingAiReview, setIsLoadingAiReview] = useState(false);

  // Dynamic fallback AI review computed specifically for this project
  const fallbackAiReview = useMemo(() => {
    return deriveFallbackModelReview(safeGoal, contract, builtStepsCount, concepts.length);
  }, [safeGoal, contract, builtStepsCount, concepts.length]);

  const activeAiReview = aiReview || fallbackAiReview;

  // Roadmap & Export State
  const [roadmapCodeTab, setRoadmapCodeTab] = useState<"app" | "client" | "weights">("app");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const handleCopyText = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Warm up Pyodide runtime on mount
  useEffect(() => {
    initPyodide().catch(() => {});
  }, []);

  // Re-synchronize when contract changes
  useEffect(() => {
    setFeatureValues(Object.fromEntries(contract.features.map((f) => [f.id, f.default])));
    if (contract.defaultThreshold) setThreshold(contract.defaultThreshold);
    setActivePreset(contract.presets?.[0]?.name || null);
    setLiveOutput(null);
    setDifferentialResult(null);
    setRedTeamResults(null);
  }, [contract]);

  // Assemble Python code to run
  const assembledCode = useMemo(() => {
    let script = `import math\nimport sys\nfrom collections import defaultdict\n\n`;
    concepts.forEach((concept) => {
      const passedPart = projectParts.find((p) => p.conceptId === concept.id);
      // If user selected their code, use their passedPart if available; otherwise use verified solutionCode so uncompleted steps don't break the pipeline with '___'
      const codeToUse = (!useReferencePreview && passedPart)
        ? passedPart.code
        : (concept.solutionCode || "");

      const cleanLines = codeToUse
        .split("\n")
        .filter((l) => !l.trim().startsWith("assert "))
        .join("\n");
      script += `${cleanLines}\n\n`;
    });
    return script;
  }, [concepts, projectParts, useReferencePreview]);

  // Verified Reference Code for Differential Testing
  const referenceAssembledCode = useMemo(() => {
    let script = `import math\nimport sys\nfrom collections import defaultdict\n\n`;
    concepts.forEach((concept) => {
      const cleanLines = (concept.solutionCode || "")
        .split("\n")
        .filter((l) => !l.trim().startsWith("assert "))
        .join("\n");
      script += `${cleanLines}\n\n`;
    });
    return script;
  }, [concepts]);

  // Dynamic Production Deployment Roadmap & Code Artifacts
  const roadmapData = useMemo(() => {
    return generateProjectRoadmap(safeGoal, contract, assembledCode);
  }, [safeGoal, contract, assembledCode]);

  // Format prediction values uniformly for regression, classification, or objects
  const formatPredictionDisplay = (pred: any): string => {
    if (pred === null || pred === undefined) return "None";
    if (typeof pred === "object") {
      if (pred.estimated_price !== undefined) {
        return `$${Number(pred.estimated_price).toLocaleString()} (Estimated Property Value)`;
      }
      if (pred.predicted_digit !== undefined) {
        const conf = pred.confidence ? Math.round(pred.confidence * (pred.confidence <= 1 ? 100 : 1)) : 0;
        return `Digit ${pred.predicted_digit}${conf > 0 ? ` (${conf}% Confidence)` : ""}`;
      }
      if (pred.label !== undefined) {
        const conf = pred.confidence_pct ?? pred.positive_confidence;
        return `${pred.label}${conf !== undefined ? ` (${Math.round(conf * (conf <= 1 ? 100 : 1))}%)` : ""}`;
      }
      if (pred.prediction !== undefined) {
        return String(pred.prediction);
      }
      return JSON.stringify(pred);
    }
    if (typeof pred === "number") {
      if (contract.output.type === "regression" && contract.output.unit === "$") {
        return `$${pred.toLocaleString()}`;
      }
      if (contract.output.classes && contract.output.classes[pred]) {
        return contract.output.classes[pred].name;
      }
      if (contract.output.label?.toLowerCase().includes("digit")) {
        return `Digit ${pred}`;
      }
      return String(pred);
    }
    return String(pred);
  };

  // Rich dynamic visualization metadata from live Python execution
  const outputDetails = useMemo(() => {
    if (!liveOutput || liveOutput.isError || !liveOutput.prediction) return null;
    const pred = liveOutput.prediction;

    let probabilityBars: Array<{ label: string; percent: number; isWinner: boolean; emoji?: string }> | null = null;
    let binaryBar: { labelA: string; percentA: number; labelB: string; percentB: number } | null = null;
    let mainLabel = "";
    let mainConfidence: number | null = null;
    let badgeEmoji = "🎯";

    if (typeof pred === "object") {
      // 1. Multi-class probabilities (e.g. 10 digit classes from Softmax)
      if (pred.probabilities && Array.isArray(pred.probabilities)) {
        const topIdx = pred.predicted_digit !== undefined
          ? pred.predicted_digit
          : pred.probabilities.indexOf(Math.max(...pred.probabilities));

        probabilityBars = pred.probabilities.map((prob: number, idx: number) => {
          const rawPct = Number(prob) <= 1 ? Number(prob) * 100 : Number(prob);
          const pct = Math.round(rawPct * 10) / 10;
          const classMeta = contract.output.classes?.[idx];
          return {
            label: classMeta?.name || `Digit ${idx}`,
            percent: pct,
            isWinner: idx === topIdx,
            emoji: classMeta?.emoji,
          };
        });

        mainLabel = `Digit ${topIdx}`;
        mainConfidence = pred.confidence !== undefined
          ? Math.round(Number(pred.confidence) <= 1 ? Number(pred.confidence) * 100 : Number(pred.confidence))
          : Math.round(probabilityBars?.[topIdx]?.percent || 0);
        badgeEmoji = contract.output.classes?.[topIdx]?.emoji || "🔢";
      }
      // 2. Binary / Clinical / Plant Disease
      else if (pred.infection_probability !== undefined) {
        const pInf = Math.round(Number(pred.infection_probability) * 100);
        binaryBar = {
          labelA: "Healthy",
          percentA: 100 - pInf,
          labelB: "Infected",
          percentB: pInf,
        };
        mainLabel = pred.diagnosis || (pred.is_infected ? "Infection Detected" : "Healthy Foliage");
        mainConfidence = pred.is_infected ? pInf : 100 - pInf;
        badgeEmoji = pred.is_infected ? "🍂" : "🌿";
      }
      // 3. Spam Classifier
      else if (pred.label === "spam" || pred.label === "ham") {
        const rawConf = pred.confidence !== undefined ? Number(pred.confidence) : (pred.confidence_pct ? Number(pred.confidence_pct) / 100 : 0.85);
        const pSpam = Math.round((rawConf <= 1 ? rawConf : rawConf / 100) * 100);
        binaryBar = {
          labelA: "Ham (Inbox)",
          percentA: pred.label === "spam" ? 100 - pSpam : pSpam,
          labelB: "Spam",
          percentB: pred.label === "spam" ? pSpam : 100 - pSpam,
        };
        mainLabel = pred.label === "spam" ? "Spam Flagged" : "Delivered to Inbox (Ham)";
        mainConfidence = pred.label === "spam" ? pSpam : (100 - pSpam);
        badgeEmoji = pred.label === "spam" ? "🚫" : "📨";
      }
      // 4. Sentiment Analysis
      else if (pred.positive_confidence !== undefined || pred.label === "Positive" || pred.label === "Negative") {
        const pPos = pred.positive_confidence !== undefined ? Math.round(Number(pred.positive_confidence) * 100) : 50;
        binaryBar = {
          labelA: "Negative",
          percentA: 100 - pPos,
          labelB: "Positive",
          percentB: pPos,
        };
        mainLabel = `${pred.label} Sentiment`;
        mainConfidence = pred.label === "Positive" ? pPos : 100 - pPos;
        badgeEmoji = pred.label === "Positive" ? "😊" : "😞";
      }
      // 5. Property Valuation
      else if (pred.estimated_price !== undefined) {
        mainLabel = `$${Number(pred.estimated_price).toLocaleString()} USD`;
        badgeEmoji = "🏡";
      }
      // 6. Generic Custom / AI-Agent Generated ML Models
      else {
        const dynamicProb = pred.probability ?? pred.confidence ?? pred.score ?? pred.prob ?? pred.confidence_pct;
        if (dynamicProb !== undefined && typeof dynamicProb === "number") {
          const rawPct = dynamicProb <= 1 ? dynamicProb * 100 : dynamicProb;
          const confPct = Math.min(100, Math.max(0, Math.round(rawPct * 10) / 10));
          mainConfidence = Math.round(confPct);
          const labelText = pred.prediction ?? pred.label ?? pred.status ?? (confPct >= 50 ? "Positive Outcome" : "Negative Outcome");
          mainLabel = `${labelText} (${confPct}% Confidence)`;
          binaryBar = {
            labelA: "Negative / Baseline",
            percentA: Math.round(100 - confPct),
            labelB: "Positive / Flagged",
            percentB: Math.round(confPct),
          };
          badgeEmoji = confPct >= 50 ? "⚡" : "🛡️";
        } else if (pred.prediction !== undefined) {
          mainLabel = String(pred.prediction);
          badgeEmoji = "🎯";
        } else {
          mainLabel = JSON.stringify(pred);
          badgeEmoji = "⚙️";
        }
      }
    } else if (typeof pred === "number") {
      if (contract.output.type === "regression" && contract.output.unit === "$") {
        mainLabel = `$${pred.toLocaleString()}`;
        badgeEmoji = "🏡";
      } else if (contract.output.classes && contract.output.classes[pred]) {
        mainLabel = contract.output.classes[pred].name;
        badgeEmoji = contract.output.classes[pred].emoji || "🎯";
      } else if (pred >= 0 && pred <= 1) {
        // Calibrated decimal probability from custom model
        const confPct = Math.round(pred * 100);
        mainConfidence = confPct;
        mainLabel = `${confPct >= 50 ? "Positive Class" : "Negative Class"} (${confPct}% Confidence)`;
        binaryBar = {
          labelA: "Class 0",
          percentA: 100 - confPct,
          labelB: "Class 1",
          percentB: confPct,
        };
        badgeEmoji = confPct >= 50 ? "🎯" : "📊";
      } else {
        mainLabel = String(pred);
      }
    } else {
      mainLabel = String(pred);
    }

    return {
      mainLabel,
      mainConfidence,
      badgeEmoji,
      probabilityBars,
      binaryBar,
    };
  }, [liveOutput, contract]);

  // Run in-browser Pyodide execution
  const executeInPyodide = async (inputs: Record<string, any>, currentThreshold: number) => {
    setIsExecuting(true);
    const startTime = performance.now();
    const fn = contract.functionName || "predict";

    const codeToRun = useReferencePreview ? referenceAssembledCode : assembledCode;
    const runnerScript = buildSafeModelExecutionScript({
      code: codeToRun,
      inputs,
      functionName: fn,
      threshold: currentThreshold,
      outputMarker: "__RESULT__",
      mode: "prediction",
    });

    // Differential runner script
    const diffScript = buildSafeModelExecutionScript({
      code: referenceAssembledCode,
      inputs,
      functionName: fn,
      threshold: 0.5,
      outputMarker: "__REF_RESULT__",
      mode: "prediction",
    });

    try {
      // Execute sequentially in Pyodide to prevent WASM stdout clobbering
      const res = await runPythonCode(runnerScript);
      const elapsed = Math.round(performance.now() - startTime);

      const match = (res.stdout || "").match(/__RESULT__:(.+)$/m);
      if (match && match[1]) {
        try {
          const parsed = JSON.parse(match[1].trim());
          if (parsed.error) {
            setLiveOutput({
              prediction: null,
              rawText: "",
              isError: true,
              errorText: parsed.error,
              executionTimeMs: elapsed,
              source: useReferencePreview ? "reference_preview" : "learner_code",
            });
          } else {
            const formattedText = formatPredictionDisplay(parsed.prediction);

            setLiveOutput({
              prediction: parsed.prediction,
              rawText: formattedText || "Done",
              isError: false,
              executionTimeMs: elapsed,
              source: useReferencePreview ? "reference_preview" : "learner_code",
            });
          }
        } catch {
          setLiveOutput({
            prediction: null,
            rawText: "Output parsed with error",
            isError: false,
            executionTimeMs: elapsed,
            source: useReferencePreview ? "reference_preview" : "learner_code",
          });
        }
      } else {
        const errText = res.stderr || res.error || "Model execution returned no output. Verify that your model function is defined and executes correctly.";
        setLiveOutput({
          prediction: null,
          rawText: "",
          isError: true,
          errorText: errText,
          executionTimeMs: elapsed,
          source: useReferencePreview ? "reference_preview" : "learner_code",
        });
      }

      // Check differential sequentially
      try {
        const refRes = await runPythonCode(diffScript);
        const refMatch = (refRes.stdout || "").match(/__REF_RESULT__:(.+)$/m);
        if (refMatch && refMatch[1] && match && match[1]) {
          const refParsed = JSON.parse(refMatch[1].trim());
          const learnerParsed = JSON.parse(match[1].trim());
          const learnerVal = learnerParsed.prediction;
          const refVal = refParsed.prediction;

          const extractVal = (v: any) => {
            if (!v || typeof v !== "object") return v;
            if (v.predicted_digit !== undefined) return v.predicted_digit;
            if (v.label !== undefined) return v.label;
            if (v.estimated_price !== undefined) return v.estimated_price;
            if (v.prediction !== undefined) return v.prediction;
            return v;
          };
          const lVal = extractVal(learnerVal);
          const rVal = extractVal(refVal);

          const isMatch =
            JSON.stringify(learnerVal) === JSON.stringify(refVal) ||
            JSON.stringify(lVal) === JSON.stringify(rVal) ||
            (typeof lVal === "number" && typeof rVal === "number" && Math.abs(lVal - rVal) < 0.05);

          setDifferentialResult({
            referencePrediction: refVal,
            matches: isMatch,
            differenceNote: isMatch
              ? (builtStepsCount === 0
                  ? `You haven't completed any code steps yet (0/${concepts.length}). Complete steps in Stage 2 (Build) to test your own code.`
                  : builtStepsCount < concepts.length
                  ? `Hybrid model (${builtStepsCount}/${concepts.length} steps written) agrees with reference.`
                  : "100% agreement with verified reference solution.")
              : `Divergence detected: Learner model returned ${JSON.stringify(learnerVal)}, while reference returned ${JSON.stringify(refVal)}.`,
          });
        }
      } catch (diffErr) {
        console.warn("Differential execution warning:", diffErr);
      }
    } catch (err: any) {
      setLiveOutput({
        prediction: null,
        rawText: "",
        isError: true,
        errorText: String(err),
        executionTimeMs: Math.round(performance.now() - startTime),
        source: useReferencePreview ? "reference_preview" : "learner_code",
      });
    } finally {
      setIsExecuting(false);
    }
  };

  // Debounced execution on feature change
  useEffect(() => {
    // If learner selected "Run My Built Model" but has not built any steps, do not execute
    if (!useReferencePreview && builtStepsCount === 0) {
      setLiveOutput(null);
      setIsExecuting(false);
      return;
    }
    const timer = setTimeout(() => {
      executeInPyodide(featureValues, threshold);
    }, 280);
    return () => clearTimeout(timer);
  }, [featureValues, threshold, useReferencePreview, assembledCode, referenceAssembledCode, builtStepsCount]);

  const handleFeatureChange = (id: string, value: any) => {
    setFeatureValues((prev) => ({ ...prev, [id]: value }));
    setActivePreset(null);
  };

  const handleApplyPreset = (presetName: string, values: Record<string, any>) => {
    setFeatureValues(values);
    setActivePreset(presetName);
  };

  const handleRunRedTeam = async () => {
    setIsRunningRedTeam(true);
    setActiveTab("redteam");
    try {
      const results = await executeRedTeamSuite(contract, assembledCode);
      setRedTeamResults(results);
    } catch (e) {
      console.error("Red-team execution error:", e);
    } finally {
      setIsRunningRedTeam(false);
    }
  };

  const handleFetchAiReview = async () => {
    setIsLoadingAiReview(true);
    try {
      const llmConfig = getClientLLMConfig();

      const res = await fetch("/api/review-model", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...llmConfig.headers,
        },
        body: JSON.stringify({
          goal: safeGoal,
          assembledCode,
          stepsBuilt: builtStepsCount,
          totalSteps: concepts.length,
          redTeamSummary: redTeamResults ? redTeamResults.map(r => ({ name: r.scenarioName, status: r.status, analysis: r.analysis })) : [],
          apiKey: llmConfig.apiKey,
          provider: llmConfig.provider,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setAiReview(data);
      }
    } catch (e) {
      console.error("AI review fetch error:", e);
    } finally {
      setIsLoadingAiReview(false);
    }
  };

  return (
    <div className="p-5 sm:p-6 rounded-xl border border-zinc-800 bg-[#090b10] shadow-lg space-y-6">
      {/* 1. Header & Mode Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800/80">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1">
            <span>Stage 3: Live Verification</span>
            <span>·</span>
            <span className="text-amber-400">{contract.badge}</span>
          </div>
          <h2 className="text-xl font-bold text-zinc-100">{contract.title}</h2>
          <p className="text-xs text-zinc-400 mt-0.5">{contract.subtitle}</p>
        </div>

        {/* Tab switcher */}
        <div className="flex flex-wrap items-center gap-1 p-1 rounded-lg bg-zinc-900 border border-zinc-800 self-start md:self-auto">
          <button
            onClick={() => setActiveTab("runner")}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors flex items-center gap-1.5 ${
              activeTab === "runner"
                ? "bg-zinc-800 text-zinc-100 font-semibold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Live Runner</span>
          </button>
          <button
            onClick={() => setActiveTab("differential")}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors flex items-center gap-1.5 ${
              activeTab === "differential"
                ? "bg-zinc-800 text-zinc-100 font-semibold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            <span>Differential Test</span>
          </button>
          <button
            onClick={() => setActiveTab("redteam")}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors flex items-center gap-1.5 ${
              activeTab === "redteam"
                ? "bg-zinc-800 text-amber-300 font-semibold shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
            <span>Red-Team</span>
          </button>
          <button
            onClick={() => {
              setActiveTab("review");
              if (!aiReview) handleFetchAiReview();
            }}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors flex items-center gap-1.5 ${
              activeTab === "review"
                ? "bg-zinc-800 text-purple-300 font-semibold shadow-sm"
                : "text-zinc-400 hover:text-purple-300"
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-purple-400" />
            <span>AI Review</span>
          </button>
          <button
            onClick={() => setActiveTab("roadmap")}
            className={`px-3 py-1.5 rounded-md text-xs font-mono transition-colors flex items-center gap-1.5 ${
              activeTab === "roadmap"
                ? "bg-zinc-800 text-emerald-300 font-semibold shadow-sm"
                : "text-zinc-400 hover:text-emerald-300"
            }`}
          >
            <Rocket className="w-3.5 h-3.5 text-emerald-400" />
            <span>Roadmap & Deploy</span>
          </button>
        </div>
      </div>

      {/* Model Execution Engine Source Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3 rounded-lg bg-zinc-950 border border-zinc-800/80 text-xs">
        <div className="flex items-center gap-2 text-zinc-300">
          <Layers className="w-4 h-4 text-amber-400" />
          <span>
            Active Model Source:{" "}
            <strong className="text-zinc-100">
              {useReferencePreview
                ? "Verified Reference Implementation"
                : builtStepsCount === 0
                ? `Model Not Built Yet (0/${concepts.length} Steps Completed)`
                : builtStepsCount < concepts.length
                ? `Hybrid Code (${builtStepsCount}/${concepts.length} Steps Built + Reference Scaffold)`
                : `Your Assembled Code (${builtStepsCount}/${concepts.length} Steps Completed)`}
            </strong>
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setUseReferencePreview(true)}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
              useReferencePreview
                ? "bg-blue-500/20 border border-blue-500/60 text-blue-300 font-bold shadow-sm"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Run Reference Model
          </button>
          <button
            type="button"
            onClick={() => setUseReferencePreview(false)}
            className={`px-3 py-1.5 rounded text-xs font-mono transition-all cursor-pointer ${
              !useReferencePreview
                ? "bg-amber-400/20 border border-amber-400/60 text-amber-300 font-bold shadow-sm"
                : "bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-zinc-200"
            }`}
          >
            Run My Built Model ({builtStepsCount}/{concepts.length})
          </button>
        </div>
      </div>

      {/* Scaffold Explanation Callout when learner steps are incomplete */}
      {!useReferencePreview && builtStepsCount === 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg bg-amber-500/10 border border-amber-500/30 text-xs text-amber-300">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>
              <strong>Model not built yet (0/{concepts.length} steps):</strong> You selected to run your custom model, but you haven&apos;t written any steps yet in <strong>Stage 2: Build</strong>. Switch to <strong>Run Reference Model</strong> to see live predictions, or start writing your code in Stage 2.
            </span>
          </div>
          <div className="flex items-center gap-2 self-start sm:self-auto flex-shrink-0">
            <button
              onClick={() => setUseReferencePreview(true)}
              className="px-2.5 py-1 rounded bg-blue-500/20 hover:bg-blue-500/30 text-blue-300 text-xs font-semibold transition-colors cursor-pointer"
            >
              Run Reference Model
            </button>
            {onBackToBuild && (
              <button
                onClick={onBackToBuild}
                className="px-2.5 py-1 rounded bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 text-xs font-semibold transition-colors flex items-center gap-1 cursor-pointer"
              >
                Go to Stage 2 (Build) <ArrowRight className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>
      )}

      {!useReferencePreview && builtStepsCount > 0 && builtStepsCount < concepts.length && (
        <div className="flex items-center justify-between gap-3 px-3.5 py-2 rounded-lg bg-blue-500/10 border border-blue-500/30 text-xs text-blue-300">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-blue-400 flex-shrink-0" />
            <span>
              <strong>Partial Pipeline ({builtStepsCount}/{concepts.length} steps):</strong> Running steps 1–{builtStepsCount} from your code, and borrowing the reference solution for uncompleted steps so you can test incrementally.
            </span>
          </div>
        </div>
      )}



      {/* 2. TAB 1: Live Runner */}
      {activeTab === "runner" && (
        <div className="space-y-6">
          {/* Quick Presets */}
          {contract.presets && contract.presets.length > 0 && (
            <div className="space-y-2">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Test Scenarios</span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
                {contract.presets.map((preset) => {
                  const isSelected = activePreset === preset.name;
                  return (
                    <button
                      key={preset.name}
                      onClick={() => handleApplyPreset(preset.name, preset.values)}
                      className={`p-3 rounded-lg border text-left transition-all ${
                        isSelected
                          ? "border-amber-500/60 bg-amber-500/10 text-zinc-100"
                          : "border-zinc-800 bg-zinc-900/60 hover:bg-zinc-900 text-zinc-300"
                      }`}
                    >
                      <div className="flex items-center gap-2 text-sm font-semibold mb-1">
                        <span>{preset.emoji || "🎯"}</span>
                        <span>{preset.name}</span>
                      </div>
                      {preset.description && (
                        <p className="text-xs text-zinc-400 line-clamp-1">{preset.description}</p>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Interactive Inputs & Result Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
            {/* Inputs Column */}
            <div className="lg:col-span-3 space-y-4">
              <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider">Feature Inputs</span>
              <div className="space-y-3.5 bg-zinc-900/40 p-4 rounded-lg border border-zinc-800">
                {contract.features.map((feature) => (
                  <div key={feature.id} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label htmlFor={`feature-${feature.id}`} className="font-medium text-zinc-200">
                        {feature.label}
                      </label>
                      <span className="font-mono text-zinc-400">
                        {featureValues[feature.id]} {feature.unit || ""}
                      </span>
                    </div>

                    {feature.type === "slider" ? (
                      <input
                        id={`feature-${feature.id}`}
                        type="range"
                        min={feature.min ?? 0}
                        max={feature.max ?? 100}
                        step={feature.step ?? 1}
                        value={featureValues[feature.id] ?? feature.default}
                        onChange={(e) => handleFeatureChange(feature.id, parseFloat(e.target.value))}
                        className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                      />
                    ) : (
                      <textarea
                        id={`feature-${feature.id}`}
                        rows={2}
                        value={featureValues[feature.id] ?? ""}
                        onChange={(e) => handleFeatureChange(feature.id, e.target.value)}
                        className="w-full px-3 py-2 rounded bg-zinc-950 border border-zinc-800 text-zinc-200 text-xs font-mono focus:outline-none focus:border-amber-500/60"
                      />
                    )}
                  </div>
                ))}

                {/* Threshold Slider for Classification */}
                {contract.output.type === "classification" && (
                  <div className="pt-2 border-t border-zinc-800 space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <label htmlFor="classification-threshold" className="font-medium text-zinc-300">
                        Decision Threshold:
                      </label>
                      <span className="font-mono text-amber-400">{Math.round(threshold * 100)}%</span>
                    </div>
                    <input
                      id="classification-threshold"
                      type="range"
                      min={0.1}
                      max={0.9}
                      step={0.05}
                      value={threshold}
                      onChange={(e) => setThreshold(parseFloat(e.target.value))}
                      className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Live Output Card */}
            <div className="lg:col-span-2 flex flex-col justify-between p-4 rounded-lg border border-zinc-800 bg-zinc-950 space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400 border-b border-zinc-800 pb-2">
                  <span className="flex items-center gap-1.5">
                    <Terminal className="w-3.5 h-3.5 text-zinc-400" />
                    <span>In-Browser Output</span>
                  </span>
                  <span className="text-zinc-500">
                    {isExecuting ? "Executing..." : `${liveOutput?.executionTimeMs || 0}ms`}
                  </span>
                </div>

                {!useReferencePreview && builtStepsCount === 0 ? (
                  <div className="p-6 rounded-xl bg-zinc-900/60 border border-zinc-800 text-center space-y-3.5 my-auto">
                    <div className="w-10 h-10 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                      <Layers className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-zinc-100">
                        Model Not Built Yet (0/{concepts.length} Steps Completed)
                      </h4>
                      <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1 leading-relaxed">
                        You selected <strong>Run My Built Model</strong>, but you haven&apos;t written any code steps in <strong>Stage 2: Build</strong> yet.
                      </p>
                    </div>
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => setUseReferencePreview(true)}
                        className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                      >
                        Run Reference Model Instead
                      </button>
                      {onBackToBuild && (
                        <button
                          type="button"
                          onClick={onBackToBuild}
                          className="w-full sm:w-auto px-3.5 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold transition-colors flex items-center justify-center gap-1 cursor-pointer"
                        >
                          Go to Stage 2: Build <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                ) : liveOutput?.isError ? (
                  <div className="p-3 rounded bg-red-950/40 border border-red-500/50 text-red-300 text-xs font-mono">
                    <div className="font-bold mb-1">Execution Traceback:</div>
                    <div className="text-[11px] whitespace-pre-wrap">{liveOutput.errorText}</div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {/* Primary Prediction Banner */}
                    <div className="p-3.5 rounded-xl bg-zinc-900 border border-zinc-800 flex items-center justify-between">
                      <div>
                        <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                          Model Prediction
                        </span>
                        <div className="text-sm sm:text-base font-bold text-zinc-100 flex items-center gap-2 mt-0.5">
                          <span>{outputDetails?.badgeEmoji || "🎯"}</span>
                          <span>{outputDetails?.mainLabel || liveOutput?.rawText || "Computing..."}</span>
                        </div>
                      </div>
                      {outputDetails?.mainConfidence !== null && outputDetails?.mainConfidence !== undefined && (
                        <div className="text-right">
                          <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block">
                            Confidence
                          </span>
                          <span
                            className={`text-sm sm:text-base font-mono font-bold ${
                              outputDetails.mainConfidence >= 75
                                ? "text-emerald-400"
                                : outputDetails.mainConfidence >= 50
                                ? "text-amber-400"
                                : "text-zinc-300"
                            }`}
                          >
                            {outputDetails.mainConfidence}%
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Live Multiclass Probability Distribution (e.g. 10 Softmax Digit Classes) */}
                    {outputDetails?.probabilityBars && outputDetails.probabilityBars.length > 0 && (
                      <div className="space-y-2 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                          <span>Softmax Probability Distribution</span>
                          <span>{outputDetails.probabilityBars.length} classes</span>
                        </div>
                        <div className="space-y-1.5 pt-1 max-h-56 overflow-y-auto pr-1">
                          {outputDetails.probabilityBars.map((item) => (
                            <div key={item.label} className="space-y-0.5">
                              <div className="flex items-center justify-between text-[11px] font-mono">
                                <span className={item.isWinner ? "font-bold text-amber-400" : "text-zinc-400"}>
                                  {item.emoji ? `${item.emoji} ` : ""}{item.label}
                                </span>
                                <span className={item.isWinner ? "font-bold text-amber-400" : "text-zinc-500"}>
                                  {item.percent}%
                                </span>
                              </div>
                              <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                                <div
                                  className={`h-full transition-all duration-150 rounded-full ${
                                    item.isWinner ? "bg-amber-400" : "bg-zinc-600/60"
                                  }`}
                                  style={{ width: `${Math.max(item.percent, 0.5)}%` }}
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Two-Class Binary Probability Distribution */}
                    {outputDetails?.binaryBar && (
                      <div className="space-y-2 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
                        <div className="flex items-center justify-between text-[11px] font-mono text-zinc-400">
                          <span className={outputDetails.binaryBar.percentA > outputDetails.binaryBar.percentB ? "text-blue-400 font-bold" : ""}>
                            {outputDetails.binaryBar.labelA}: {outputDetails.binaryBar.percentA}%
                          </span>
                          <span className={outputDetails.binaryBar.percentB > outputDetails.binaryBar.percentA ? "text-amber-400 font-bold" : ""}>
                            {outputDetails.binaryBar.labelB}: {outputDetails.binaryBar.percentB}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden flex">
                          <div
                            className="h-full bg-blue-500 transition-all duration-150"
                            style={{ width: `${outputDetails.binaryBar.percentA}%` }}
                          />
                          <div
                            className="h-full bg-amber-400 transition-all duration-150"
                            style={{ width: `${outputDetails.binaryBar.percentB}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Integrity Label */}
              <div className="pt-3 border-t border-zinc-800/80 text-[11px] font-mono text-zinc-500 flex items-center justify-between">
                <span>
                  Source:{" "}
                  {useReferencePreview
                    ? "Verified Reference Implementation"
                    : builtStepsCount === 0
                    ? `Not Built Yet (0/${concepts.length} steps)`
                    : builtStepsCount < concepts.length
                    ? `Hybrid (${builtStepsCount}/${concepts.length} your code + scaffold)`
                    : "Your Assembled Python Code"}
                </span>
                <span className="text-emerald-400">Pyodide WASM</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 3. TAB 2: Differential Testing */}
      {activeTab === "differential" && (
        <div className="space-y-4">
          <div className="p-4 sm:p-5 rounded-xl bg-zinc-900/40 border border-zinc-800 space-y-3">
            <h3 className="text-base font-semibold text-zinc-100">Differential Consistency Analysis</h3>
            <p className="text-sm text-zinc-300 leading-relaxed font-sans">
              We execute the exact same input through both your assembled Python code and the verified reference implementation.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5 pt-2">
              <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-sm">
                <span className="text-zinc-400 block mb-1 text-xs">Your Model Output:</span>
                <span className="text-zinc-100 font-semibold">{liveOutput?.rawText || "None"}</span>
              </div>
              <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-sm">
                <span className="text-zinc-400 block mb-1 text-xs">Reference Output:</span>
                <span className="text-zinc-100 font-semibold">
                  {differentialResult ? formatPredictionDisplay(differentialResult.referencePrediction) : "Computing..."}
                </span>
              </div>
            </div>

            {differentialResult && (
              <div
                className={`p-3.5 rounded-lg border text-sm font-mono flex items-center gap-2.5 ${
                  differentialResult.matches
                    ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                    : "bg-amber-950/30 border-amber-500/40 text-amber-300"
                }`}
              >
                {differentialResult.matches ? (
                  <CheckCircle2 className="w-5 h-5 flex-shrink-0 text-emerald-400" />
                ) : (
                  <AlertTriangle className="w-5 h-5 flex-shrink-0 text-amber-400" />
                )}
                <span>{differentialResult.differenceNote}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 4. TAB 3: Red-Team Adversarial Suite */}
      {activeTab === "redteam" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2">
            <div>
              <h3 className="text-base font-semibold text-zinc-100">Adversarial Edge-Case Stress Suite</h3>
              <p className="text-sm text-zinc-300 font-sans">
                Attacks your model with zero vectors, massive numeric outliers, negative values, and OOD noise.
              </p>
            </div>
            <button
              onClick={handleRunRedTeam}
              disabled={isRunningRedTeam}
              className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 text-xs sm:text-sm font-mono font-bold transition-colors disabled:opacity-50 flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              {isRunningRedTeam ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  <span>Attacking Model...</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Run Red-Team Suite</span>
                </>
              )}
            </button>
          </div>

          {redTeamResults ? (
            <div className="space-y-3">
              {redTeamResults.map((result) => (
                <div
                  key={result.id}
                  className={`p-4 rounded-xl border text-sm space-y-2 ${
                    result.status === "safe"
                      ? "bg-zinc-900/60 border-zinc-800 text-zinc-200"
                      : result.status === "vulnerability_found"
                      ? "bg-amber-950/20 border-amber-500/40 text-amber-200"
                      : "bg-red-950/20 border-red-500/40 text-red-200"
                  }`}
                >
                  <div className="flex items-center justify-between font-mono">
                    <span className="font-semibold text-sm sm:text-base">{result.scenarioName}</span>
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-md font-bold uppercase ${
                        result.status === "safe"
                          ? "bg-emerald-950 border border-emerald-500/40 text-emerald-300"
                          : result.status === "vulnerability_found"
                          ? "bg-amber-950 border border-amber-500/40 text-amber-300"
                          : "bg-red-950 border border-red-500/40 text-red-300"
                      }`}
                    >
                      {result.status.replace("_", " ")}
                    </span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed font-sans">{result.analysis}</p>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center border border-dashed border-zinc-800 rounded-xl text-sm text-zinc-400">
              Click &quot;Run Red-Team Suite&quot; to execute adversarial tests directly on your compiled Python model.
            </div>
          )}
        </div>
      )}

      {/* 5. TAB 4: AI Model Review */}
      {activeTab === "review" && (
        <div className="space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-xl bg-purple-950/20 border border-purple-500/30">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl bg-purple-500/20 border border-purple-500/40 flex flex-col items-center justify-center font-mono flex-shrink-0">
                <span className="text-xl font-black text-purple-300">{activeAiReview.overallScore}</span>
                <span className="text-xs text-purple-400/80 font-semibold">/100</span>
              </div>
              <div>
                <span className="text-xs font-mono uppercase tracking-wider text-purple-400 block font-bold">
                  Socrates AI Model Architecture & Code Review
                </span>
                <h3 className="text-base sm:text-lg font-bold text-zinc-100">
                  {activeAiReview.headline}
                </h3>
              </div>
            </div>

            <button
              onClick={handleFetchAiReview}
              disabled={isLoadingAiReview}
              className="px-4 py-2.5 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-mono text-xs sm:text-sm font-bold transition-all flex items-center gap-2 self-start sm:self-auto cursor-pointer"
            >
              <Sparkles className={`w-4 h-4 ${isLoadingAiReview ? "animate-spin" : ""}`} />
              <span>{isLoadingAiReview ? "Analyzing Code..." : "Re-Analyze Model"}</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Strengths Card */}
            <div className="p-4 sm:p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3.5">
              <div className="flex items-center gap-2.5 text-sm sm:text-base font-mono font-bold text-emerald-400">
                <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
                <span>Architecture Strengths</span>
              </div>
              <ul className="space-y-3 text-sm sm:text-[15px] text-zinc-200 leading-relaxed font-sans">
                {activeAiReview.architectureStrengths.map((s, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold text-base leading-tight mt-0.5">✓</span>
                    <span>{s}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Potential Vulnerabilities */}
            <div className="p-4 sm:p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3.5">
              <div className="flex items-center gap-2.5 text-sm sm:text-base font-mono font-bold text-amber-400">
                <AlertTriangle className="w-5 h-5 flex-shrink-0" />
                <span>Potential Production Vulnerabilities</span>
              </div>
              <ul className="space-y-3 text-sm sm:text-[15px] text-zinc-200 leading-relaxed font-sans">
                {activeAiReview.potentialVulnerabilities.map((v, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-amber-400 font-bold text-base leading-tight mt-0.5">⚠</span>
                    <span>{v}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Numerical Stability & Production Advice */}
          <div className="p-4 sm:p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
            <span className="text-xs sm:text-sm font-mono text-zinc-300 font-bold uppercase tracking-wider block">
              Numerical Stability & Gradient Dynamics
            </span>
            <p className="text-sm sm:text-[15px] text-zinc-200 leading-relaxed font-sans">
              {activeAiReview.numericalStabilityAnalysis}
            </p>
          </div>

          <div className="p-4 sm:p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2.5">
            <span className="text-xs sm:text-sm font-mono text-zinc-300 font-bold uppercase tracking-wider block">
              Socrates Production Readiness Verdict
            </span>
            <p className="text-sm sm:text-[15px] text-zinc-200 leading-relaxed font-sans">
              {activeAiReview.productionReadinessAdvice}
            </p>
          </div>

          {activeAiReview.recommendedNextSteps && activeAiReview.recommendedNextSteps.length > 0 && (
            <div className="p-4 sm:p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-3">
              <span className="text-xs sm:text-sm font-mono text-zinc-300 font-bold uppercase tracking-wider block">
                Recommended Architectural Next Steps
              </span>
              <ul className="space-y-2.5 text-sm sm:text-[15px] text-zinc-200 font-sans leading-relaxed">
                {activeAiReview.recommendedNextSteps.map((step, idx) => (
                  <li key={idx} className="flex items-start gap-2.5">
                    <span className="text-purple-400 font-bold font-mono text-xs sm:text-sm mt-0.5">0{idx + 1}.</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}

      {/* 6. TAB 5: Production Roadmap & Integration */}
      {activeTab === "roadmap" && (
        <div className="space-y-6">
          <div className="p-4 sm:p-5 rounded-xl bg-emerald-950/20 border border-emerald-500/30 space-y-2">
            <div className="flex items-center gap-2.5 text-sm sm:text-base font-mono font-bold text-emerald-400">
              <Rocket className="w-5 h-5" />
              <span>Full Production Deployment Roadmap</span>
            </div>
            <p className="text-sm sm:text-[15px] text-zinc-200 leading-relaxed font-sans">
              Step-by-step architectural guide to export your built {safeGoal} model and embed it as a live API microservice in your actual application.
            </p>
          </div>

          {/* 5-Phase Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-3.5">
            {roadmapData.phases.map((p, idx) => (
              <div key={idx} className="p-4 rounded-xl bg-zinc-950 border border-zinc-800 space-y-2 flex flex-col justify-between">
                <div>
                  <span className="text-xs font-mono font-bold text-emerald-400 block">{p.num}</span>
                  <h4 className="text-sm font-bold text-zinc-100 mt-1">{p.title}</h4>
                  <p className="text-xs sm:text-[13px] text-zinc-300 mt-1.5 leading-relaxed font-sans">{p.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Export Code Artifacts */}
          <div className="p-4 sm:p-5 rounded-xl bg-zinc-950 border border-zinc-800 space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-zinc-800">
              <div>
                <h4 className="text-sm font-mono font-bold uppercase text-zinc-200 tracking-wider">
                  Production Integration Code Artifacts
                </h4>
                <p className="text-sm text-zinc-300 mt-0.5">
                  Ready-to-deploy backend service, frontend client hook, and serialized parameters.
                </p>
              </div>

              {/* Code Tab Switcher */}
              <div className="flex items-center gap-1 p-1 rounded-lg bg-zinc-900 border border-zinc-800">
                <button
                  type="button"
                  onClick={() => setRoadmapCodeTab("app")}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    roadmapCodeTab === "app" ? "bg-zinc-800 text-zinc-100 font-semibold" : "text-zinc-400"
                  }`}
                >
                  app.py (FastAPI)
                </button>
                <button
                  type="button"
                  onClick={() => setRoadmapCodeTab("client")}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    roadmapCodeTab === "client" ? "bg-zinc-800 text-zinc-100 font-semibold" : "text-zinc-400"
                  }`}
                >
                  client.tsx (React)
                </button>
                <button
                  type="button"
                  onClick={() => setRoadmapCodeTab("weights")}
                  className={`px-2.5 py-1 rounded text-xs font-mono transition-colors ${
                    roadmapCodeTab === "weights" ? "bg-zinc-800 text-zinc-100 font-semibold" : "text-zinc-400"
                  }`}
                >
                  weights.json
                </button>
              </div>
            </div>

            {/* Code Snippet Box */}
            <div className="relative rounded-lg bg-zinc-900/90 border border-zinc-800 p-4 font-mono text-xs overflow-x-auto">
              <button
                type="button"
                onClick={() => {
                  let text = "";
                  if (roadmapCodeTab === "app") {
                    text = roadmapData.appPyCode;
                  } else if (roadmapCodeTab === "client") {
                    text = roadmapData.clientTsxCode;
                  } else {
                    text = roadmapData.weightsJsonCode;
                  }
                  handleCopyText(text, roadmapCodeTab);
                }}
                className="absolute top-3 right-3 px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-300 font-mono text-[11px] flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                {copiedKey === roadmapCodeTab ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>

              <pre className="text-zinc-200 leading-relaxed whitespace-pre-wrap">
                {roadmapCodeTab === "app" && roadmapData.appPyCode}
                {roadmapCodeTab === "client" && roadmapData.clientTsxCode}
                {roadmapCodeTab === "weights" && roadmapData.weightsJsonCode}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
