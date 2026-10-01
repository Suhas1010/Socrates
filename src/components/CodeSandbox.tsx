"use client";

import React, { useState, useEffect } from "react";
import {
  Play,
  RotateCcw,
  CheckCircle2,
  AlertCircle,
  Terminal,
  Lightbulb,
  Check,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { runPythonCode, initPyodide, PythonExecutionResult } from "@/lib/pyodideRunner";
import { Concept } from "@/lib/types";
import { SPAM_DATASET } from "@/lib/templates/spamClassifier";
import { useSessionStore } from "@/lib/store";

interface CodeSandboxProps {
  concept: Concept;
  onStepPassed: (code: string) => void;
  onOpenTeachBack: () => void;
  isAlreadyPassed: boolean;
  onEvaluation?: (evalResult: any) => void;
}

export const CodeSandbox: React.FC<CodeSandboxProps> = ({
  concept,
  onStepPassed,
  onOpenTeachBack,
  isAlreadyPassed,
  onEvaluation,
}) => {
  const { background, concepts, projectParts } = useSessionStore();
  const [code, setCode] = useState(concept.starterCode || "");
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<PythonExecutionResult | null>(null);
  const [showSolution, setShowSolution] = useState(false);
  const [stepComplete, setStepComplete] = useState(isAlreadyPassed);

  useEffect(() => {
    setCode(concept.starterCode || "");
    setResult(null);
    setShowSolution(false);
    setStepComplete(isAlreadyPassed);
  }, [concept.id, isAlreadyPassed]);

  // Preload Pyodide in background
  useEffect(() => {
    initPyodide().catch(() => { });
  }, []);

  const getPrerequisitesCode = (
    currentConcept: Concept,
    allConcepts: Concept[],
    parts: { conceptId: string; code: string }[]
  ): string => {
    const currentIndex = allConcepts.findIndex((c) => c.id === currentConcept.id);
    if (currentIndex <= 0) return "";

    const priorConcepts = allConcepts.slice(0, currentIndex);
    let preamble = "# === Socrates Prerequisites Runtime ===\nimport re\nimport math\nfrom collections import defaultdict\n\n";

    for (const prior of priorConcepts) {
      const passedPart = parts.find((p) => p.conceptId === prior.id);
      const sourceCode = passedPart ? passedPart.code : (prior.solutionCode || "");

      // Extract function/class definitions, ignoring standalone calls / test runs / prints
      const cleanLines = sourceCode
        .split("\n")
        .filter((line) => {
          const trimmed = line.trim();
          return (
            !trimmed.startsWith("print(") &&
            !trimmed.startsWith("print(f\"") &&
            !trimmed.startsWith("sample =") &&
            !trimmed.startsWith("spam_c,") &&
            !trimmed.startsWith("metrics =") &&
            !trimmed.startsWith("train_set,") &&
            !trimmed.startsWith("assert ")
          );
        })
        .join("\n");

      preamble += `# [Prereq: ${prior.title}]\n${cleanLines}\n\n`;
    }

    // Common runtime objects for downstream steps
    if (priorConcepts.some((c) => c.id === "training-vs-testing")) {
      preamble += `\nif 'train_set' not in globals() and 'train_test_split' in globals():\n    train_set, test_set = train_test_split(DATASET)\n`;
    }
    if (priorConcepts.some((c) => c.id === "naive-bayes")) {
      preamble += `\nif 'model' not in globals() and 'SocratesSpamClassifier' in globals():\n    model = SocratesSpamClassifier(DATASET)\n`;
    }

    return preamble;
  };

  const handleRun = async () => {
    setIsRunning(true);
    setResult(null);

    // Bundle dataset variable and prerequisite functions in python environment
    const datasetPyCode = `DATASET = ${JSON.stringify(SPAM_DATASET)}\n\n`;
    const prereqsPyCode = getPrerequisitesCode(concept, concepts, projectParts);
    const setupCode = datasetPyCode + prereqsPyCode;

    const res = await runPythonCode(code, concept.testAssertion, setupCode);
    setResult(res);
    setIsRunning(false);

    if (res.assertionPassed) {
      setStepComplete(true);
      onStepPassed(code);
      onEvaluation?.({ correct: true });
    } else if (res.error) {
      onEvaluation?.({ correct: false, error: res.error });
    }
  };

  const handleReset = () => {
    setCode(concept.starterCode || "");
    setResult(null);
    setShowSolution(false);
  };

  const handleUseSolution = () => {
    if (concept.solutionCode) {
      setCode(concept.solutionCode);
      setShowSolution(false);
    }
  };

  return (
    <div className="flex flex-col h-full rounded-3xl overflow-hidden border border-white/15 bg-slate-950 shadow-2xl">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-5 py-4 bg-slate-900/90 border-b border-white/10">
        <div className="flex items-center gap-3">
          <Terminal className="w-5 h-5 text-amber-400" />
          <span className="text-xs md:text-sm font-mono font-bold text-slate-200">
            build_step.py
          </span>
          {stepComplete && (
            <span className="text-xs font-mono font-bold text-emerald-300 bg-emerald-950/80 border border-emerald-500/40 px-2.5 py-1 rounded-full flex items-center gap-1.5 shadow-sm">
              <Check className="w-3.5 h-3.5 text-emerald-400" />
              Passed
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          {concept.solutionCode && (
            <button
              type="button"
              onClick={() => setShowSolution(!showSolution)}
              className="text-xs md:text-sm font-bold text-slate-300 hover:text-amber-300 transition-colors flex items-center gap-1.5 px-3 py-1.5 rounded-xl hover:bg-slate-800"
            >
              <Lightbulb className="w-4 h-4 text-amber-400" />
              <span>{showSolution ? "Hide Hint" : "Hint / Solution"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleReset}
            title="Reset code"
            className="text-xs md:text-sm text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Solution drawer if toggled */}
      {showSolution && concept.solutionCode && (
        <div className="bg-amber-950/30 border-b border-amber-500/30 p-4 text-xs md:text-sm text-slate-300 flex items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="font-bold text-amber-300">Solution Reference:</span>
            <pre className="font-mono text-xs text-amber-100/90 whitespace-pre-wrap max-h-24 overflow-y-auto">
              {concept.solutionCode.slice(0, 160)}...
            </pre>
          </div>
          <button
            type="button"
            onClick={handleUseSolution}
            className="px-4 py-2 rounded-xl bg-amber-400 text-zinc-950 font-black text-xs md:text-sm hover:bg-amber-300 transition-colors flex-shrink-0 shadow-md"
          >
            Load Solution
          </button>
        </div>
      )}

      {/* Background-specific syntax hints */}
      {background === "beginner" && (
        <div className="bg-amber-500/10 border-b border-amber-500/20 px-5 py-3 text-xs md:text-sm text-slate-200 flex items-start gap-2.5">
          <span className="text-base">🌱</span>
          <div className="leading-relaxed">
            <span className="font-bold text-amber-300 font-mono mr-2">Python Syntax Tip:</span>
            <span className="text-slate-300">
              Blocks are indented with spaces (no curly braces). Functions start with <code className="text-amber-300 font-mono font-bold">def name():</code>, lists use <code className="text-amber-300 font-mono font-bold">[a, b]</code>, and <code className="text-amber-300 font-mono font-bold">len(items)</code> counts items.
            </span>
          </div>
        </div>
      )}

      {background === "other_languages" && (
        <div className="bg-cyan-500/10 border-b border-cyan-500/20 px-5 py-3 text-xs md:text-sm text-slate-200 flex items-start gap-2.5">
          <span className="text-base">⚡</span>
          <div className="leading-relaxed">
            <span className="font-bold text-cyan-300 font-mono mr-2">C++/Java Bridge:</span>
            <span className="text-slate-300">
              No semicolons or braces; indentation defines scope. <code className="text-cyan-300 font-mono font-bold">dict.get(key, 0)</code> is like <code className="text-slate-100 font-mono">map.getOrDefault()</code>, and <code className="text-cyan-300 font-mono font-bold">len(x)</code> is like <code className="text-slate-100 font-mono">x.size()</code>.
            </span>
          </div>
        </div>
      )}

      {/* Code Textarea Area */}
      <div className="relative flex-1 min-h-[240px] bg-[#070A10]">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="w-full h-full p-5 bg-transparent font-mono text-sm md:text-base text-amber-100 placeholder-slate-600 focus:outline-none resize-none leading-relaxed selection:bg-amber-500/30"
          placeholder="# Write or complete Python code here..."
        />
      </div>

      {/* Terminal Output Console */}
      <div className="border-t border-white/10 bg-slate-950 p-4 font-mono text-xs md:text-sm max-h-44 overflow-y-auto">
        <div className="flex items-center justify-between text-slate-400 text-xs uppercase mb-2 font-black tracking-wider">
          <span>Sandbox Output</span>
          {result?.usedFallback && (
            <span className="text-slate-400 font-medium">Offline Fast Engine</span>
          )}
        </div>

        {isRunning ? (
          <div className="text-amber-400 animate-pulse flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            Executing Python code in Pyodide sandbox...
          </div>
        ) : result ? (
          <div className="space-y-1.5">
            {result.stdout && (
              <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">{result.stdout}</pre>
            )}
            {result.stderr && (
              <pre className="text-red-400 whitespace-pre-wrap leading-relaxed">{result.stderr}</pre>
            )}
            {result.error && (
              <div className="text-rose-400 font-bold">{result.error}</div>
            )}
            {result.friendlyTip && (
              <div className="mt-2.5 p-3.5 rounded-2xl bg-amber-950/40 border border-amber-500/35 text-amber-200 text-xs md:text-sm flex items-start gap-2.5">
                <span className="text-base">💡</span>
                <span className="leading-relaxed">{result.friendlyTip}</span>
              </div>
            )}
          </div>
        ) : (
          <span className="text-slate-500">
            Click &quot;Run &amp; Validate Code&quot; to test your implementation.
          </span>
        )}
      </div>

      {/* Footer Run Controls */}
      <div className="p-4 bg-slate-900/95 border-t border-white/15 flex items-center justify-between gap-3">
        <span className="text-xs md:text-sm text-slate-300 hidden sm:inline">
          Fill in the blanks (<code className="text-amber-400 font-bold">___</code>) and run assertions.
        </span>

        <div className="flex items-center gap-3 ml-auto">
          <button
            type="button"
            disabled={isRunning}
            onClick={handleRun}
            className="px-5 py-2.5 rounded-2xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs md:text-sm border border-white/15 transition-all flex items-center gap-2 shadow-md"
          >
            <Play className="w-4 h-4 fill-current text-amber-400" />
            <span>Run Code</span>
          </button>

          {stepComplete && (
            <button
              type="button"
              onClick={onOpenTeachBack}
              className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-black text-xs md:text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center gap-2 animate-pulse"
            >
              <Sparkles className="w-4 h-4" />
              <span>Step Passed! Teach-It-Back &rarr;</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
