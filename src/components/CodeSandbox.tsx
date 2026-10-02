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
      preamble += `\nif 'SocratesSpamClassifier' in globals():\n    if 'model' not in globals():\n        model = SocratesSpamClassifier(DATASET)\n    if 'clf' not in globals():\n        clf = model\n`;
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
    <div className="flex flex-col h-full rounded-xl overflow-hidden border border-zinc-800/80 bg-zinc-950 shadow-xl">
      {/* Editor Header */}
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-900/60 border-b border-zinc-800/80">
        <div className="flex items-center gap-2.5">
          <Terminal className="w-4 h-4 text-zinc-400" />
          <span className="text-xs md:text-sm font-mono font-medium text-zinc-300">
            build_step.py
          </span>
          {stepComplete && (
            <span className="text-xs font-mono font-medium text-emerald-300 bg-emerald-950/40 border border-emerald-500/30 px-2 py-0.5 rounded-md flex items-center gap-1.5 shadow-sm">
              <Check className="w-3 h-3 text-emerald-400" />
              Passed
            </span>
          )}
        </div>

        <div className="flex items-center gap-1.5">
          {concept.solutionCode && (
            <button
              type="button"
              onClick={() => setShowSolution(!showSolution)}
              className="text-xs font-medium text-zinc-400 hover:text-zinc-200 transition-colors flex items-center gap-1.5 px-2.5 py-1 rounded-md hover:bg-zinc-800/80"
            >
              <Lightbulb className="w-3.5 h-3.5 text-zinc-400" />
              <span>{showSolution ? "Hide Hint" : "Hint / Solution"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleReset}
            title="Reset code"
            className="text-xs text-zinc-400 hover:text-zinc-200 p-1.5 rounded-md hover:bg-zinc-800/80 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Solution drawer if toggled */}
      {showSolution && concept.solutionCode && (
        <div className="bg-zinc-900/90 border-b border-zinc-800 p-3.5 text-xs text-zinc-300 flex items-center justify-between gap-4">
          <div className="space-y-1 overflow-hidden">
            <span className="font-medium text-zinc-200 text-xs">Solution Reference:</span>
            <pre className="font-mono text-[11px] text-zinc-400 whitespace-pre-wrap max-h-20 overflow-y-auto">
              {concept.solutionCode.slice(0, 160)}...
            </pre>
          </div>
          <button
            type="button"
            onClick={handleUseSolution}
            className="px-3.5 py-1.5 rounded-md bg-zinc-100 hover:bg-white text-zinc-950 font-medium text-xs transition-colors flex-shrink-0 shadow-sm"
          >
            Load Solution
          </button>
        </div>
      )}

      {/* Background-specific syntax hints */}
      {background === "beginner" && (
        <div className="bg-zinc-900/40 border-b border-zinc-800/60 px-4 py-2 text-xs text-zinc-400 flex items-start gap-2">
          <span className="text-zinc-500 font-mono">Tip:</span>
          <div className="leading-relaxed">
            <span className="text-zinc-300">
              Indentation defines blocks. Define functions with <code className="text-zinc-200 font-mono">def name():</code>, lists with <code className="text-zinc-200 font-mono">[a, b]</code>, and count elements with <code className="text-zinc-200 font-mono">len(items)</code>.
            </span>
          </div>
        </div>
      )}

      {background === "other_languages" && (
        <div className="bg-zinc-900/40 border-b border-zinc-800/60 px-4 py-2 text-xs text-zinc-400 flex items-start gap-2">
          <span className="text-zinc-500 font-mono">C++/Java Bridge:</span>
          <div className="leading-relaxed">
            <span className="text-zinc-300">
              No semicolons or braces; indentation defines scope. <code className="text-zinc-200 font-mono">dict.get(key, 0)</code> is like <code className="text-zinc-200 font-mono">map.getOrDefault()</code>, and <code className="text-zinc-200 font-mono">len(x)</code> is like <code className="text-zinc-200 font-mono">x.size()</code>.
            </span>
          </div>
        </div>
      )}

      {/* Code Textarea Area */}
      <div className="relative flex-1 min-h-[240px] bg-[#09090b]">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="w-full h-full p-4 bg-transparent font-mono text-xs md:text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none resize-none leading-relaxed selection:bg-zinc-800"
          placeholder="# Write or complete Python code here..."
        />
      </div>

      {/* Terminal Output Console */}
      <div className="border-t border-zinc-800/80 bg-zinc-950 p-3.5 font-mono text-xs max-h-40 overflow-y-auto">
        <div className="flex items-center justify-between text-zinc-500 text-[11px] uppercase mb-1.5 font-medium tracking-wider">
          <span>Output Console</span>
          {result?.usedFallback && (
            <span className="text-zinc-500 font-normal">Offline Fast Engine</span>
          )}
        </div>

        {isRunning ? (
          <div className="text-zinc-400 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-zinc-400 animate-ping" />
            Executing in Pyodide sandbox...
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
              <div className="text-rose-400 font-medium">{result.error}</div>
            )}
            {result.friendlyTip && (
              <div className="mt-2 p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs flex items-start gap-2">
                <span className="text-zinc-400">💡</span>
                <span className="leading-relaxed">{result.friendlyTip}</span>
              </div>
            )}
          </div>
        ) : (
          <span className="text-zinc-600">
            Click &quot;Run Code&quot; to test your implementation.
          </span>
        )}
      </div>

      {/* Footer Run Controls */}
      <div className="p-3 bg-zinc-900/60 border-t border-zinc-800/80 flex items-center justify-between gap-3">
        <span className="text-xs text-zinc-500 hidden sm:inline">
          Fill in blanks (<code className="text-zinc-300 font-mono">___</code>) and run assertions.
        </span>

        <div className="flex items-center gap-2.5 ml-auto">
          <button
            type="button"
            disabled={isRunning}
            onClick={handleRun}
            className="px-4 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-900 font-medium text-xs md:text-sm transition-all flex items-center gap-2 shadow-sm"
          >
            <Play className="w-3.5 h-3.5 fill-current text-zinc-900" />
            <span>Run Code</span>
          </button>

          {stepComplete && (
            <button
              type="button"
              onClick={onOpenTeachBack}
              className="px-4 py-2 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 font-medium text-xs md:text-sm transition-all flex items-center gap-2 shadow-sm"
            >
              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
              <span>Step Passed! Teach-It-Back &rarr;</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
