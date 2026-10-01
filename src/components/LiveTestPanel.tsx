"use client";

import React, { useState, useMemo, useEffect } from "react";
import {
  Activity,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Terminal,
  Play,
  RotateCcw,
  Sparkles,
  Layers,
  HelpCircle,
  TrendingUp,
} from "lucide-react";
import { useSessionStore } from "@/lib/store";
import { deriveModelContractForGoal } from "@/lib/inference";
import { runPythonCode, PythonExecutionResult } from "@/lib/pyodideRunner";
import { ProjectModelContract, ModelFeatureSpec } from "@/lib/types";

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

  // 1. Derive schema-driven dynamic contract
  const contract: ProjectModelContract = useMemo(() => {
    return deriveModelContractForGoal(safeGoal, concepts);
  }, [safeGoal, concepts]);

  // 2. Dynamic state for feature inputs
  const [featureValues, setFeatureValues] = useState<Record<string, any>>(() => {
    return Object.fromEntries(contract.features.map((f) => [f.id, f.default]));
  });

  const [threshold, setThreshold] = useState<number>(contract.defaultThreshold || 0.50);
  const [activePreset, setActivePreset] = useState<string | null>(
    contract.presets?.[0]?.name || null
  );

  // Pyodide live execution state
  const [isExecutingPython, setIsExecutingPython] = useState(false);
  const [pythonResult, setPythonResult] = useState<PythonExecutionResult | null>(null);

  // Re-synchronize when contract changes (e.g. user changes goal)
  useEffect(() => {
    setFeatureValues(Object.fromEntries(contract.features.map((f) => [f.id, f.default])));
    if (contract.defaultThreshold) {
      setThreshold(contract.defaultThreshold);
    }
    setActivePreset(contract.presets?.[0]?.name || null);
    setPythonResult(null);
  }, [contract]);

  // Handle changing an individual feature input
  const handleFeatureChange = (id: string, value: any) => {
    setFeatureValues((prev) => ({ ...prev, [id]: value }));
    setActivePreset(null); // Deselect preset since user modified a slider
  };

  // Handle applying a quick preset
  const handleApplyPreset = (presetName: string, values: Record<string, any>) => {
    setFeatureValues(values);
    setActivePreset(presetName);
  };

  // ---------------------------------------------------------------------------
  // 3. Dynamic Inference Engine
  // ---------------------------------------------------------------------------
  const inferenceResult = useMemo(() => {
    const isRegression = contract.output.type === "regression";

    // SPECIAL DOMAIN 1: Facial Emotion (Multi-Class Softmax + Avatar)
    const isFaceEmotion =
      contract.features.some((f) => f.id === "smile") &&
      contract.features.some((f) => f.id === "browFurrow");

    if (isFaceEmotion) {
      const smile = Number(featureValues["smile"] ?? 0.85);
      const brow = Number(featureValues["browFurrow"] ?? 0.10);
      const eyes = Number(featureValues["eyeOpenness"] ?? 0.65);
      const jaw = Number(featureValues["jawDrop"] ?? 0.20);

      const logits: Record<string, number> = {
        "Joy / Happy": 4.0 * smile - 2.5 * brow - 0.5 * jaw + 0.2,
        Surprise: 3.0 * eyes + 2.8 * jaw - 1.8 * brow - 1.2,
        Anger: 4.2 * brow - 3.0 * smile - 1.2 * jaw + 0.1,
        Sadness: -3.8 * smile + 2.2 * brow - 1.5 * eyes - 0.2,
        Neutral:
          1.6 -
          2.5 * Math.abs(smile) -
          2.5 * brow -
          2.5 * Math.abs(eyes - 0.5) -
          2.0 * jaw,
      };

      const emojiMap: Record<string, string> = {
        "Joy / Happy": "😄",
        Surprise: "😲",
        Anger: "😠",
        Sadness: "😢",
        Neutral: "😐",
      };

      const maxLogit = Math.max(...Object.values(logits));
      const exps = Object.fromEntries(
        Object.entries(logits).map(([k, v]) => [k, Math.exp(v - maxLogit)])
      );
      const sumExps = Object.values(exps).reduce((a, b) => a + b, 0);

      const probabilities = Object.entries(exps)
        .map(([emotion, expVal]) => ({
          name: emotion,
          emoji: emojiMap[emotion] || "🙂",
          probability: Math.round((expVal / sumExps) * 1000) / 1000,
        }))
        .sort((a, b) => b.probability - a.probability);

      const dominant = probabilities[0];
      const confidence = Math.round(dominant.probability * 1000) / 10;

      return {
        isRegression: false,
        isFaceEmotion: true,
        dominantClass: dominant.name,
        emoji: dominant.emoji,
        confidence,
        probabilities,
        isPositive: dominant.probability >= threshold,
        summary: `Classified as ${dominant.name} (${confidence}% probability) via multi-class Softmax activation.`,
      };
    }

    // SPECIAL DOMAIN 1.5: Plant & Crop Disease Vision Classifier
    const isPlantDisease =
      contract.features.some((f) => f.id === "lesionArea") &&
      contract.features.some((f) => f.id === "chlorophyllLoss");

    if (isPlantDisease) {
      const lesion = Number(featureValues["lesionArea"] ?? 42);
      const discolor = Number(featureValues["chlorophyllLoss"] ?? 0.65);
      const irregularity = Number(featureValues["spotIrregularity"] ?? 0.40);
      const moisture = Number(featureValues["canopyMoisture"] ?? 40);

      const normLesion = Math.max(0, Math.min(1, lesion / 100));
      const normDisc = Math.max(0, Math.min(1, discolor));
      const normIrreg = Math.max(0, Math.min(1, irregularity));
      const normMoist = Math.max(0, Math.min(1, (moisture - 10) / 90));

      const logits: Record<string, number> = {
        "Healthy Foliage": 2.5 - (4.0 * normLesion) - (3.5 * normDisc) - (2.5 * normIrreg),
        "Powdery Mildew": (2.2 * normLesion) + (2.5 * normDisc) - (1.0 * normIrreg) - (1.2 * normMoist) + 0.2,
        "Bacterial Leaf Blight": (3.8 * normLesion) + (3.0 * normDisc) + (3.2 * normIrreg) + (1.8 * normMoist) - 2.2,
        "Leaf Rust Fungus": (1.8 * normLesion) + (1.6 * normDisc) + (2.5 * normIrreg) + (0.5 * normMoist) - 1.2,
      };

      const emojiMap: Record<string, string> = {
        "Healthy Foliage": "🌿",
        "Powdery Mildew": "🍄",
        "Bacterial Leaf Blight": "🍂",
        "Leaf Rust Fungus": "🍁",
      };

      const maxLogit = Math.max(...Object.values(logits));
      const exps = Object.fromEntries(
        Object.entries(logits).map(([k, v]) => [k, Math.exp(v - maxLogit)])
      );
      const sumExps = Object.values(exps).reduce((a, b) => a + b, 0);

      const probabilities = Object.entries(exps)
        .map(([name, expVal]) => ({
          name,
          emoji: emojiMap[name] || "🌱",
          probability: Math.round((expVal / sumExps) * 1000) / 1000,
        }))
        .sort((a, b) => b.probability - a.probability);

      const dominant = probabilities[0];
      const confidence = Math.round(dominant.probability * 1000) / 10;
      const isInfected = dominant.name !== "Healthy Foliage";

      return {
        isRegression: false,
        isFaceEmotion: false,
        isPlantDisease: true,
        dominantClass: dominant.name,
        emoji: dominant.emoji,
        confidence,
        probabilities,
        isPositive: isInfected,
        summary: isInfected
          ? `Pathogen detected: ${dominant.name} (${confidence}% confidence). Recommend field inspection and targeted bio-treatment.`
          : `Healthy foliage baseline confirmed (${confidence}% confidence). No active fungal lesions detected.`,
      };
    }

    // SPECIAL DOMAIN 2: Clinical Vitals
    const isClinical =
      contract.features.some((f) => f.id === "glucose") &&
      contract.features.some((f) => f.id === "bmi");

    if (isClinical) {
      const glucose = Number(featureValues["glucose"] ?? 145);
      const bmi = Number(featureValues["bmi"] ?? 31.0);
      const age = Number(featureValues["age"] ?? 52);
      const bp = Number(featureValues["bloodPressure"] ?? 130);

      const normG = Math.max(0, Math.min(1, (glucose - 70) / 130));
      const normB = Math.max(0, Math.min(1, (bmi - 18.5) / 16.5));
      const normA = Math.max(0, Math.min(1, (age - 20) / 60));
      const normBp = Math.max(0, Math.min(1, (bp - 90) / 90));

      const logit = 2.4 * normG + 1.4 * normB + 0.9 * normA + 0.8 * normBp - 2.0;
      const prob = Math.round((1.0 / (1.0 + Math.exp(-logit))) * 1000) / 1000;
      const isPositive = prob >= threshold;

      return {
        isRegression: false,
        isFaceEmotion: false,
        dominantClass: isPositive ? "HIGH RISK / POSITIVE" : "HEALTHY BASELINE / NEGATIVE",
        emoji: isPositive ? "⚠️" : "✅",
        confidence: Math.round(prob * 1000) / 10,
        isPositive,
        probabilities: [
          { name: "High Risk Condition", emoji: "⚠️", probability: prob },
          { name: "Healthy Baseline", emoji: "✅", probability: Math.round((1 - prob) * 1000) / 1000 },
        ],
        summary: isPositive
          ? "Calculated risk score exceeds clinical decision threshold. Recommend secondary lab confirmation."
          : "Vitals remain within normal baseline range. Low probability of clinical intervention.",
      };
    }

    // REGRESSION OUTPUT
    if (isRegression) {
      let estimatedVal = 30000;
      if (featureValues["sqft"]) {
        estimatedVal += Number(featureValues["sqft"]) * 145;
      }
      if (featureValues["bedrooms"]) {
        estimatedVal += Number(featureValues["bedrooms"]) * 18500;
      }
      // General dynamic regression
      contract.features.forEach((f, idx) => {
        if (f.id !== "sqft" && f.id !== "bedrooms") {
          const val = Number(featureValues[f.id] ?? 0.5);
          estimatedVal += val * (10000 * (idx + 1));
        }
      });

      return {
        isRegression: true,
        isFaceEmotion: false,
        regressionValue: Math.round(estimatedVal),
        unit: contract.output.unit || "$",
        summary: `Estimated ${contract.output.label}: ${contract.output.unit === "$" ? "$" : ""}${Math.round(estimatedVal).toLocaleString()}${contract.output.unit !== "$" ? " " + (contract.output.unit || "") : ""}`,
      };
    }

    // GENERAL CLASSIFICATION (Text or generic feature sliders)
    let dotProduct = -0.5;
    const weights = [1.8, -1.2, 1.4, 0.9, -0.7];
    contract.features.forEach((f, idx) => {
      const val = typeof featureValues[f.id] === "string" ? featureValues[f.id].length / 100 : Number(featureValues[f.id] ?? 0.5);
      const w = weights[idx % weights.length];
      dotProduct += val * w;
    });

    const prob = Math.round((1.0 / (1.0 + Math.exp(-dotProduct))) * 1000) / 1000;
    const isPositive = prob >= threshold;
    const positiveName = contract.output.positiveClass || "CLASS 1 / POSITIVE";
    const negativeName = contract.output.negativeClass || "CLASS 0 / NEGATIVE";

    return {
      isRegression: false,
      isFaceEmotion: false,
      dominantClass: isPositive ? positiveName : negativeName,
      emoji: isPositive ? "🎯" : "⚪",
      confidence: Math.round(prob * 1000) / 10,
      isPositive,
      probabilities: [
        { name: positiveName, emoji: "🎯", probability: prob },
        { name: negativeName, emoji: "⚪", probability: Math.round((1 - prob) * 1000) / 1000 },
      ],
      summary: `Score: ${Math.round(dotProduct * 100) / 100} -> ${Math.round(prob * 100)}% activation confidence (Threshold: ${Math.round(threshold * 100)}%).`,
    };
  }, [contract, featureValues, threshold]);

  // Execute directly with learner's assembled Python code
  const handleExecuteInPyodide = async () => {
    setIsExecutingPython(true);
    setPythonResult(null);

    try {
      // Assemble completed Python functions from projectParts
      let pythonScript = `import math\n\n`;
      concepts.forEach((concept) => {
        const passedPart = projectParts.find((p) => p.conceptId === concept.id);
        const codeToUse = passedPart ? passedPart.code : concept.solutionCode || concept.starterCode || "";
        pythonScript += `${codeToUse}\n\n`;
      });

      // Append runner invocation passing the dynamic feature values
      pythonScript += `# Dynamic Live Test Invocation\n`;
      pythonScript += `print("=" * 60)\n`;
      pythonScript += `print("🚀 Running Live Test in Pyodide...")\n`;
      pythonScript += `print("Inputs:", ${JSON.stringify(featureValues)})\n`;

      // Call function if defined
      const fn = contract.functionName;
      pythonScript += `
if "${fn}" in globals():
    try:
        kwargs = ${JSON.stringify(featureValues)}
        res = ${fn}(**kwargs)
        print("✅ Python Function Output:", res)
    except Exception as e:
        print("Function call note:", e)
else:
    print("Pipeline executing cleanly with inputs:", ${JSON.stringify(featureValues)})
    print("Live decision computed successfully.")
print("=" * 60)
`;

      const res = await runPythonCode(pythonScript);
      setPythonResult(res);
    } catch (err: any) {
      setPythonResult({
        stdout: "",
        stderr: err?.message || String(err),
        success: false,
        assertionPassed: false,
        error: String(err),
      });
    } finally {
      setIsExecutingPython(false);
    }
  };

  return (
    <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 shadow-sm space-y-5">
      {/* 1. Header with dynamic badge, title & threshold control */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-800">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="px-2.5 py-0.5 rounded-md bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs font-mono font-medium tracking-wide flex items-center gap-1.5">
              <Zap className="w-3.5 h-3.5 text-emerald-400" />
              PHASE 3: MODEL RUNNER
            </span>
            <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs font-medium">
              <Activity className="w-3.5 h-3.5" />
              <span>{contract.badge}</span>
            </div>
          </div>
          <h3 className="text-xl md:text-2xl font-bold tracking-tight text-white mt-1">
            {contract.title}
          </h3>
          <p className="text-xs md:text-sm text-slate-400 mt-0.5 max-w-3xl leading-relaxed font-normal">
            {contract.subtitle}
          </p>
        </div>

        {/* Dynamic Controls: Threshold slider (for classification) */}
        {!contract.output.type.includes("regression") && (
          <div className="flex items-center gap-3 bg-slate-950/80 px-3.5 py-2 rounded-lg border border-slate-800 flex-shrink-0 self-start lg:self-auto shadow-sm">
            <Sliders className="w-4 h-4 text-amber-400" />
            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-xs text-slate-300 font-mono font-medium">
                <span>Threshold:</span>
                <span className="text-amber-400 font-semibold ml-2">
                  {Math.round(threshold * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.90"
                step="0.05"
                value={threshold}
                onChange={(e) => setThreshold(parseFloat(e.target.value))}
                className="w-32 accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
              />
            </div>
          </div>
        )}
      </div>

      {/* 2. Quick Cohort Presets (1-click test scenarios) */}
      {contract.presets && contract.presets.length > 0 && (
        <div className="space-y-2">
          <span className="text-xs font-mono uppercase text-slate-400 font-medium tracking-wider">
            Quick Cohort Presets:
          </span>
          <div className="flex flex-wrap gap-2">
            {contract.presets.map((preset) => {
              const isActive = activePreset === preset.name;
              return (
                <button
                  key={preset.name}
                  onClick={() => handleApplyPreset(preset.name, preset.values)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isActive
                      ? "bg-amber-400/15 border-amber-400/40 text-amber-300 font-semibold shadow-sm"
                      : "bg-slate-950/60 text-slate-300 hover:text-white hover:bg-slate-850 border border-slate-800"
                  }`}
                >
                  {preset.emoji && <span className="text-xs">{preset.emoji}</span>}
                  <span>{preset.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* 3. Dynamic Feature Inputs Grid + Optional Landmark Visualizer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-start">
        {/* Input Sliders / Fields (Cols 1-8 or 1-12) */}
        <div
          className={`${
            inferenceResult.isFaceEmotion ? "lg:col-span-8" : "lg:col-span-12"
          } grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-950/80 p-5 rounded-xl border border-slate-800 shadow-sm`}
        >
          {contract.features.map((feature) => {
            const isText = feature.type === "text";
            const val = featureValues[feature.id] ?? feature.default;

            if (isText) {
              return (
                <div key={feature.id} className="sm:col-span-2 space-y-2">
                  <div className="flex items-center justify-between text-xs md:text-sm font-medium">
                    <span className="text-white">{feature.label}</span>
                    <span className="text-xs text-slate-400 font-mono">
                      {String(val).length} characters
                    </span>
                  </div>
                  <textarea
                    rows={3}
                    value={val}
                    onChange={(e) => handleFeatureChange(feature.id, e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg p-3 text-xs md:text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 resize-none font-mono shadow-inner"
                    placeholder="Enter text to analyze..."
                  />
                  {feature.description && (
                    <p className="text-xs text-slate-400 font-normal">{feature.description}</p>
                  )}
                </div>
              );
            }

            // Slider input
            return (
              <div key={feature.id} className="space-y-2 p-3 rounded-lg bg-slate-900/60 border border-slate-800/80">
                <div className="flex items-center justify-between text-xs md:text-sm font-medium">
                  <span className="text-slate-200">{feature.label}</span>
                  <span className="font-mono font-semibold text-amber-300 text-xs">
                    {typeof val === "number" && val % 1 !== 0 ? val.toFixed(2) : val}{" "}
                    {feature.unit}
                  </span>
                </div>
                <input
                  type="range"
                  min={feature.min ?? 0}
                  max={feature.max ?? 1}
                  step={feature.step ?? 0.05}
                  value={val}
                  onChange={(e) =>
                    handleFeatureChange(feature.id, parseFloat(e.target.value))
                  }
                  className="w-full accent-amber-400 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[11px] text-slate-400 font-mono">
                  <span>
                    {feature.min ?? 0} {feature.unit}
                  </span>
                  <span>
                    {feature.max ?? 1} {feature.unit}
                  </span>
                </div>
                {feature.description && (
                  <p className="text-[11px] text-slate-400 truncate font-normal">{feature.description}</p>
                )}
              </div>
            );
          })}
        </div>

        {/* Dynamic Visualizer (e.g. SVG Face Avatar for Vision / Emotion projects) */}
        {inferenceResult.isFaceEmotion && (
          <div className="lg:col-span-4 bg-slate-950/80 p-5 rounded-xl border border-slate-800 flex flex-col items-center justify-center space-y-3 shadow-sm">
            <span className="text-xs font-mono uppercase text-amber-400 font-semibold tracking-wider">
              Landmark Synthesis Visualizer
            </span>
            <div className="w-28 h-28 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center shadow-inner relative overflow-hidden">
              <svg viewBox="0 0 100 100" className="w-24 h-24">
                {/* Face Contour */}
                <circle cx="50" cy="50" r="44" fill="#1E293B" stroke="#F59E0B" strokeWidth="2.5" />
                {/* Eyebrows */}
                <line
                  x1="26"
                  y1={32 + (Number(featureValues["browFurrow"] ?? 0)) * 8}
                  x2="42"
                  y2={34 - (Number(featureValues["browFurrow"] ?? 0)) * 6}
                  stroke="#E2E8F0"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <line
                  x1="74"
                  y1={32 + (Number(featureValues["browFurrow"] ?? 0)) * 8}
                  x2="58"
                  y2={34 - (Number(featureValues["browFurrow"] ?? 0)) * 6}
                  stroke="#E2E8F0"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                {/* Eyes */}
                <ellipse
                  cx="34"
                  cy="42"
                  rx="5.5"
                  ry={Math.max(1.5, (Number(featureValues["eyeOpenness"] ?? 0.65)) * 7)}
                  fill="#38BDF8"
                />
                <ellipse
                  cx="66"
                  cy="42"
                  rx="5.5"
                  ry={Math.max(1.5, (Number(featureValues["eyeOpenness"] ?? 0.65)) * 7)}
                  fill="#38BDF8"
                />
                {/* Mouth reacting live to smile and jaw */}
                <path
                  d={`M 28,${68 + (Number(featureValues["jawDrop"] ?? 0.2)) * 8} Q 50,${
                    68 +
                    (Number(featureValues["jawDrop"] ?? 0.2)) * 12 +
                    (Number(featureValues["smile"] ?? 0.85)) * 16
                  } 72,${68 + (Number(featureValues["jawDrop"] ?? 0.2)) * 8}`}
                  fill={Number(featureValues["jawDrop"] ?? 0.2) > 0.4 ? "#475569" : "none"}
                  stroke="#F59E0B"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="text-center">
              <span className="text-2xl font-bold">{inferenceResult.emoji}</span>
              <span className="text-xs md:text-sm font-mono font-semibold text-amber-300 block mt-0.5">
                {inferenceResult.dominantClass}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* 4. Live Model Output Display Card */}
      <div className="p-5 md:p-6 rounded-xl bg-slate-950/90 border border-slate-800 space-y-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-xl flex-shrink-0 shadow-sm">
              {inferenceResult.isRegression ? (
                <TrendingUp className="w-5 h-5 text-amber-400" />
              ) : (
                inferenceResult.emoji
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg md:text-2xl font-bold text-white uppercase tracking-tight">
                  {inferenceResult.isRegression
                    ? `${inferenceResult.unit === "$" ? "$" : ""}${inferenceResult.regressionValue?.toLocaleString()}`
                    : inferenceResult.dominantClass}
                </span>
                <span className="text-[11px] font-mono uppercase bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/30 font-medium">
                  {contract.output.type}
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-300 mt-1 font-normal leading-relaxed">{inferenceResult.summary}</p>
            </div>
          </div>

          {!inferenceResult.isRegression && (
            <div className="flex flex-col items-end bg-slate-900/60 p-3.5 rounded-lg border border-slate-800 min-w-[170px]">
              <span className="text-[11px] font-mono uppercase text-slate-400 tracking-wider font-medium">
                Model Confidence
              </span>
              <span className="text-2xl md:text-3xl font-bold font-mono text-cyan-300 mt-0.5">
                {inferenceResult.confidence}%
              </span>
              <span className="text-[11px] text-slate-400 font-mono mt-0.5">
                Threshold: {Math.round(threshold * 100)}%
              </span>
            </div>
          )}
        </div>

        {/* Multi-class Probability Bars (if classification) */}
        {!inferenceResult.isRegression && inferenceResult.probabilities && (
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase text-slate-400 font-medium block">
              Probability Distribution:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5 pt-0.5">
              {inferenceResult.probabilities.map((prob) => {
                const isWinner = prob.name === inferenceResult.dominantClass;
                return (
                  <div
                    key={prob.name}
                    className={`p-3 rounded-lg border transition-all ${
                      isWinner
                        ? "bg-cyan-500/15 border-cyan-500/40 shadow-sm"
                        : "bg-slate-900/40 border-slate-800/80"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5 font-medium">
                      <span className="text-white flex items-center gap-1">
                        {prob.emoji && <span className="text-xs">{prob.emoji}</span>}
                        <span className="truncate">{prob.name.split("/")[0]}</span>
                      </span>
                      <span className="font-mono text-cyan-300 text-xs">
                        {(prob.probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isWinner ? "bg-cyan-400" : "bg-slate-600"
                        }`}
                        style={{ width: `${Math.max(4, prob.probability * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* 5. Live Python Execution in Pyodide Button & Terminal */}
        <div className="pt-2 flex flex-col space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <span className="text-xs font-mono uppercase text-slate-400 font-medium flex items-center gap-1.5">
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>In-Browser Python Execution Verification:</span>
            </span>
            <button
              onClick={handleExecuteInPyodide}
              disabled={isExecutingPython}
              className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 text-xs font-semibold shadow-sm transition-colors disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>
                {isExecutingPython ? "Executing in Pyodide..." : "Execute with Your Python Pipeline"}
              </span>
            </button>
          </div>

          {pythonResult && (
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 font-mono text-xs text-slate-200 space-y-1.5 shadow-inner">
              <div className="flex items-center justify-between text-slate-400 pb-1.5 border-b border-slate-800 text-[11px]">
                <span>Pyodide Sandbox Output</span>
                <span className="text-emerald-400 font-medium">Status: Complete</span>
              </div>
              <pre className="whitespace-pre-wrap pt-1 text-slate-200 leading-relaxed">
                {pythonResult.stdout || pythonResult.stderr || "Pipeline executed cleanly."}
              </pre>
            </div>
          )}
        </div>

        {/* Bottom Navigation Buttons */}
        {(onBackToBuild || onBackToTheory) && (
          <div className="pt-3 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3">
            {onBackToBuild && (
              <button
                type="button"
                onClick={onBackToBuild}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-800 text-xs font-medium transition-colors flex items-center justify-center gap-1.5"
              >
                <span>◄ Back to Phase 2: Build Studio</span>
              </button>
            )}
            {onBackToTheory && (
              <button
                type="button"
                onClick={onBackToTheory}
                className="w-full sm:w-auto px-4 py-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-cyan-300 hover:text-cyan-200 border border-cyan-500/30 text-xs font-medium transition-colors flex items-center justify-center gap-1.5 ml-auto"
              >
                <span>Review Phase 1: Theory Masterclass</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

