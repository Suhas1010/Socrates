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
  Copy,
  X,
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
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"hints" | "solution">("hints");
  const [copiedSolution, setCopiedSolution] = useState(false);
  const [solutionLoaded, setSolutionLoaded] = useState(false);
  const [stepComplete, setStepComplete] = useState(isAlreadyPassed);

  useEffect(() => {
    setCode(concept.starterCode || "");
    setResult(null);
    setShowDrawer(false);
    setDrawerTab("hints");
    setCopiedSolution(false);
    setSolutionLoaded(false);
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

  const getExtractedHints = (): string[] => {
    if (concept.hints && concept.hints.length > 0) {
      return concept.hints;
    }
    const lines = (concept.starterCode || "").split("\n");
    const extracted: string[] = [];
    for (const line of lines) {
      const todoMatch = line.match(/#\s*(?:✏\s*)?TODO:\s*(.+)$/i);
      if (todoMatch && todoMatch[1]) {
        const hintText = todoMatch[1].trim();
        if (!extracted.includes(hintText)) {
          extracted.push(hintText);
        }
      }
    }
    if (extracted.length === 0 && concept.corePrinciple) {
      extracted.push(concept.corePrinciple);
    }
    if (extracted.length === 0 && concept.buildStep) {
      extracted.push(concept.buildStep);
    }
    return extracted;
  };

  const extractedHints = getExtractedHints();

  const handleReset = () => {
    setCode(concept.starterCode || "");
    setResult(null);
    setShowDrawer(false);
  };

  const handleUseSolution = () => {
    if (concept.solutionCode) {
      setCode(concept.solutionCode);
      setSolutionLoaded(true);
      setTimeout(() => setSolutionLoaded(false), 2000);
    }
  };

  const handleCopySolution = () => {
    if (concept.solutionCode) {
      navigator.clipboard.writeText(concept.solutionCode);
      setCopiedSolution(true);
      setTimeout(() => setCopiedSolution(false), 2000);
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

        <div className="flex items-center gap-2">
          {concept.solutionCode && (
            <button
              type="button"
              onClick={() => setShowDrawer(!showDrawer)}
              className={`text-xs font-semibold transition-all flex items-center gap-1.5 px-3 py-1.5 rounded-lg border ${
                showDrawer
                  ? "bg-amber-500/20 text-amber-300 border-amber-500/40"
                  : "bg-zinc-900 text-zinc-300 hover:text-white border-zinc-700/80 hover:bg-zinc-800"
              }`}
            >
              <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
              <span>{showDrawer ? "Hide Assistant" : "Hints & Solution"}</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleReset}
            title="Reset code to starter template"
            className="text-xs text-zinc-400 hover:text-zinc-200 p-1.5 rounded-md hover:bg-zinc-800/80 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Comprehensive Hints & Solution Drawer */}
      {showDrawer && (
        <div className="bg-[#0b0f19] border-b border-zinc-800 p-4 space-y-3.5 animate-in fade-in duration-150">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            {/* Tabs */}
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setDrawerTab("hints")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                  drawerTab === "hints"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                <span>Step Hints ({extractedHints.length})</span>
              </button>
              {concept.solutionCode && (
                <button
                  type="button"
                  onClick={() => setDrawerTab("solution")}
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-md text-xs font-semibold transition-colors ${
                    drawerTab === "solution"
                      ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-400" />
                  <span>Complete Solution</span>
                </button>
              )}
            </div>

            {/* Close button */}
            <button
              type="button"
              onClick={() => setShowDrawer(false)}
              className="text-zinc-400 hover:text-zinc-200 p-1 rounded hover:bg-zinc-800 transition-colors"
              title="Close drawer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {drawerTab === "hints" ? (
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-semibold text-zinc-300">Guided Walkthrough for Blanks:</span>
                {concept.solutionCode && (
                  <button
                    type="button"
                    onClick={() => setDrawerTab("solution")}
                    className="text-amber-400 hover:text-amber-300 font-medium inline-flex items-center gap-1 cursor-pointer"
                  >
                    Need complete code? View Solution &rarr;
                  </button>
                )}
              </div>

              <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
                {extractedHints.map((hint, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-2.5 p-2.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs text-zinc-200"
                  >
                    <span className="w-5 h-5 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center flex-shrink-0 text-[11px] border border-amber-500/30">
                      {idx + 1}
                    </span>
                    <div className="leading-relaxed font-mono text-zinc-300 whitespace-pre-wrap">
                      {hint}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            concept.solutionCode && (
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-zinc-400 font-medium">
                    Verified working reference solution (never truncated):
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={handleCopySolution}
                      className="px-2.5 py-1 rounded bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium flex items-center gap-1.5 transition-colors border border-zinc-700 cursor-pointer"
                    >
                      {copiedSolution ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-zinc-400" />
                          <span>Copy Code</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleUseSolution}
                      className="px-3 py-1 rounded bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                    >
                      {solutionLoaded ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Loaded into Editor!</span>
                        </>
                      ) : (
                        <span>Load Solution into Editor</span>
                      )}
                    </button>
                  </div>
                </div>

                <pre className="font-mono text-xs text-zinc-200 bg-[#06090e] p-3 rounded-lg border border-zinc-800 max-h-56 overflow-y-auto whitespace-pre leading-relaxed select-text">
                  {concept.solutionCode}
                </pre>
              </div>
            )
          )}
        </div>
      )}

      {/* Background-specific syntax hints */}
      {background === "beginner" && (
        <div className="bg-zinc-900/60 border-b border-zinc-800/80 px-4 py-2.5 text-xs sm:text-sm text-zinc-300 flex items-start gap-2">
          <span className="text-amber-400 font-mono font-bold">Tip:</span>
          <div className="leading-relaxed font-medium">
            <span>
              Indentation defines blocks. Define functions with <code className="text-amber-300 font-mono text-xs sm:text-sm px-1.5 py-0.5 rounded bg-zinc-800">def name():</code>, lists with <code className="text-amber-300 font-mono text-xs sm:text-sm px-1.5 py-0.5 rounded bg-zinc-800">[a, b]</code>, and count elements with <code className="text-amber-300 font-mono text-xs sm:text-sm px-1.5 py-0.5 rounded bg-zinc-800">len(items)</code>.
            </span>
          </div>
        </div>
      )}

      {background === "other_languages" && (
        <div className="bg-zinc-900/60 border-b border-zinc-800/80 px-4 py-2.5 text-xs sm:text-sm text-zinc-300 flex items-start gap-2">
          <span className="text-amber-400 font-mono font-bold">C++/Java Bridge:</span>
          <div className="leading-relaxed font-medium">
            <span>
              No semicolons or braces; indentation defines scope. <code className="text-amber-300 font-mono text-xs sm:text-sm px-1.5 py-0.5 rounded bg-zinc-800">dict.get(key, 0)</code> is like <code className="text-amber-300 font-mono text-xs sm:text-sm px-1.5 py-0.5 rounded bg-zinc-800">map.getOrDefault()</code>, and <code className="text-amber-300 font-mono text-xs sm:text-sm px-1.5 py-0.5 rounded bg-zinc-800">len(x)</code> is like <code className="text-amber-300 font-mono text-xs sm:text-sm px-1.5 py-0.5 rounded bg-zinc-800">x.size()</code>.
            </span>
          </div>
        </div>
      )}

      {/* Code Textarea Area */}
      <div className="relative flex-1 min-h-[260px] bg-[#07090e]">
        <textarea
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          className="w-full h-full p-4 sm:p-5 bg-transparent font-mono text-sm sm:text-base text-zinc-100 placeholder-zinc-600 focus:outline-none resize-none leading-relaxed selection:bg-zinc-800"
          placeholder="# Write or complete Python code here..."
        />
      </div>

      {/* Terminal Output Console */}
      <div className="border-t border-zinc-800/80 bg-zinc-950 p-4 font-mono text-xs sm:text-sm max-h-44 overflow-y-auto">
        <div className="flex items-center justify-between text-zinc-400 text-xs uppercase mb-2 font-bold tracking-wider">
          <span>Output Console</span>
          {result?.usedFallback && (
            <span className="text-zinc-500 font-normal">Offline Fast Engine</span>
          )}
        </div>

        {isRunning ? (
          <div className="text-amber-400 flex items-center gap-2 font-medium">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
            Executing in Pyodide sandbox...
          </div>
        ) : result ? (
          <div className="space-y-2">
            {result.stdout && (
              <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed font-medium">{result.stdout}</pre>
            )}
            {result.stderr && (
              <pre className="text-red-400 whitespace-pre-wrap leading-relaxed font-medium">{result.stderr}</pre>
            )}
            {result.error && (
              <div className="text-rose-400 font-bold">{result.error}</div>
            )}
            {result.friendlyTip && (
              <div className="mt-2 p-3 rounded-xl bg-zinc-900 border border-zinc-800 text-zinc-200 text-xs sm:text-sm flex items-start gap-2.5 shadow-sm">
                <span className="text-amber-400 text-base">💡</span>
                <span className="leading-relaxed">{result.friendlyTip}</span>
              </div>
            )}
          </div>
        ) : (
          <span className="text-zinc-500 font-mono">
            Click &quot;Run Code&quot; to test your implementation.
          </span>
        )}
      </div>

      {/* Footer Run Controls */}
      <div className="p-3.5 bg-zinc-900/80 border-t border-zinc-800/80 flex items-center justify-between gap-3">
        <span className="text-xs sm:text-sm text-zinc-400 hidden sm:inline">
          Fill in blanks (<code className="text-amber-300 font-mono font-bold">___</code>) and run assertions.
        </span>

        <div className="flex items-center gap-3 ml-auto">
          <button
            type="button"
            disabled={isRunning}
            onClick={handleRun}
            className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs sm:text-sm md:text-base transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-95 disabled:opacity-50"
          >
            <Play className="w-4 h-4 fill-current text-zinc-950" />
            <span>Run Code</span>
          </button>

          {stepComplete && (
            <button
              type="button"
              onClick={onOpenTeachBack}
              className="px-5 py-2.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/50 font-bold text-xs sm:text-sm md:text-base transition-all flex items-center gap-2 shadow-md cursor-pointer active:scale-95"
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <span>Step Passed! Teach-It-Back &rarr;</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
