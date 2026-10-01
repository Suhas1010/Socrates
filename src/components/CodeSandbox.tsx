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
    <div className="flex flex-col h-full rounded-2xl overflow-hidden border border-white/10 bg-[#0C101A] shadow-2xl">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-zinc-900/80 border-b border-white/10">
        <div className="flex items-center gap-2">
          <Terminal className="w-4 h-4 text-amber-400" />
          <span className="text-xs font-mono font-semibold text-zinc-200">
            build_step.py
          </span>
          {stepComplete && (
            <span className="text-[10px] font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-500/40 px-2 py-0.5 rounded-full flex items-center gap-1">
              <Check className="w-3 h-3 text-emerald-400" />
              Passed
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          {concept.solutionCode && (
            <button
              type="button"
              onClick={() => setShowSolution(!showSolution)}
              className="text-xs text-zinc-400 hover:text-amber-300 transition-colors flex items-center gap-1 px-2.5 py-1 rounded hover:bg-zinc-800"
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>{showSolution ? "Hide Hint" : "Hint / Solution"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleReset}
            title="Reset code"
            className="text-xs text-zinc-400 hover:text-zinc-200 p-1.5 rounded hover:bg-zinc-800 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Solution drawer if toggled */}
      {showSolution && concept.solutionCode && (
        <div className="bg-amber-950/20 border-b border-amber-500/30 p-3.5 text-xs text-zinc-300 flex items-center justify-between gap-3">
          <div className="space-y-1">
            <span className="font-semibold text-amber-300">Solution Reference:</span>
            <pre className="font-mono text-[11px] text-amber-100/90 whitespace-pre-wrap max-h-24 overflow-y-auto">
              {concept.solutionCode.slice(0, 160)}...
            </pre>
          </div>
          <button
            type="button"
            onClick={handleUseSolution}
            className="px-3 py-1.5 rounded-lg bg-amber-500 text-zinc-950 font-bold text-xs hover:bg-amber-400 transition-colors flex-shrink-0"
          >
            Load Solution
          </button>
        </div>
      )}

      {/* Background-specific syntax hints */}
      {background === "beginner" && (
        <div className="bg-gold/10 border-b border-gold/20 px-3.5 py-2 text-xs text-cream flex items-start gap-2">
          <span className="text-sm">🌱</span>
          <div className="text-[11px] leading-relaxed">
            <span className="font-semibold text-gold font-mono mr-1.5">Python Syntax Tip:</span>
            <span className="text-muted">
              Blocks are indented with spaces (no curly braces). Functions start with <code className="text-gold font-mono">def name():</code>, lists use <code className="text-gold font-mono">[a, b]</code>, and <code className="text-gold font-mono">len(items)</code> counts items.
            </span>
          </div>
        </div>
      )}

      {background === "other_languages" && (
        <div className="bg-[#1D1B15] border-b border-gold/20 px-3.5 py-2 text-xs text-cream flex items-start gap-2">
          <span className="text-sm">⚡</span>
          <div className="text-[11px] leading-relaxed">
            <span className="font-semibold text-gold font-mono mr-1.5">C++/Java Bridge:</span>
            <span className="text-muted">
              No semicolons or braces; indentation defines scope. <code className="text-gold font-mono">dict.get(key, 0)</code> is like <code className="text-cream font-mono">map.getOrDefault()</code>, and <code className="text-gold font-mono">len(x)</code> is like <code className="text-cream font-mono">x.size()</code>.
            </span>
          </div>
        </div>
      )}

      {/* Code Textarea Area */}
      <div className="relative flex-1 min-h-[220px] bg-[#090D15]">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="w-full h-full p-4 bg-transparent font-mono text-xs md:text-sm text-amber-100 placeholder-zinc-600 focus:outline-none resize-none leading-relaxed selection:bg-amber-500/30"
          placeholder="# Write or complete Python code here..."
        />
      </div>

      {/* Terminal Output Console */}
      <div className="border-t border-white/10 bg-zinc-950 p-3 font-mono text-xs max-h-36 overflow-y-auto">
        <div className="flex items-center justify-between text-zinc-500 text-[10px] uppercase mb-1.5 font-bold tracking-wider">
          <span>Sandbox Output</span>
          {result?.usedFallback && (
            <span className="text-zinc-500 font-normal">Offline Fast Engine</span>
          )}
        </div>

        {isRunning ? (
          <div className="text-amber-400 animate-pulse flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            Executing Python code in Pyodide sandbox...
          </div>
        ) : result ? (
          <div className="space-y-1">
            {result.stdout && (
              <pre className="text-emerald-400 whitespace-pre-wrap">{result.stdout}</pre>
            )}
            {result.stderr && (
              <pre className="text-red-400 whitespace-pre-wrap">{result.stderr}</pre>
            )}
            {result.error && (
              <div className="text-red-400 font-semibold">{result.error}</div>
            )}
          </div>
        ) : (
          <span className="text-zinc-600">
            Click &quot;Run &amp; Validate Code&quot; to test your implementation.
          </span>
        )}
      </div>

      {/* Footer Run Controls */}
      <div className="p-3 bg-zinc-900/90 border-t border-white/10 flex items-center justify-between gap-3">
        <span className="text-[11px] text-zinc-400 hidden sm:inline">
          Fill in the blanks (<code className="text-amber-400">___</code>) and run assertions.
        </span>

        <div className="flex items-center gap-2 ml-auto">
          <button
            type="button"
            disabled={isRunning}
            onClick={handleRun}
            className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-xs border border-white/10 transition-all flex items-center gap-1.5"
          >
            <Play className="w-3.5 h-3.5 fill-current text-amber-400" />
            <span>Run Code</span>
          </button>

          {stepComplete && (
            <button
              type="button"
              onClick={onOpenTeachBack}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-400 hover:to-emerald-500 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/20 transition-all flex items-center gap-1.5 animate-pulse"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Step Passed! Teach-It-Back &rarr;</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
