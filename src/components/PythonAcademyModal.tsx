"use client";

import React, { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  Code2,
  Terminal,
  Sparkles,
  CheckCircle2,
  X,
  Play,
  RotateCcw,
  Lightbulb,
  Check,
  ChevronRight,
  ChevronLeft,
  BookOpen,
  ArrowRight,
  Cpu,
  Layers,
  HelpCircle,
  Copy,
} from "lucide-react";
import { useSessionStore } from "@/lib/store";
import { PYTHON_TRACK_CONCEPTS } from "@/lib/templates/pythonTrack";
import { runPythonCode, initPyodide, PythonExecutionResult } from "@/lib/pyodideRunner";
import { Concept } from "@/lib/types";

const sanitizeCode = (rawCode: string): string => {
  if (!rawCode) return "";
  return rawCode
    .replace(/print\(f["']Target\s*\(\{medTarget\}\):\s*\{y_train\}["']\)/g, 'print("Target:", y_train)')
    .replace(/print\(f["']Target\s*\(\{targetName\}\):\s*\{y_train\}["']\)/g, 'print("Target:", y_train)')
    .replace(/\{medTarget\}/g, '"target"')
    .replace(/\{targetName\}/g, '"target"');
};

export const PythonAcademyModal: React.FC = () => {
  const {
    isPythonAcademyOpen,
    closePythonAcademy,
    pythonMasteredModules,
    masterPythonModule,
  } = useSessionStore();

  const [mounted, setMounted] = useState(false);
  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"learn" | "code" | "playground">("learn");

  // Code editor states
  const activeConcept: Concept = PYTHON_TRACK_CONCEPTS[selectedModuleIndex] || PYTHON_TRACK_CONCEPTS[0];
  const [code, setCode] = useState(sanitizeCode(activeConcept.starterCode || ""));
  const [showDrawer, setShowDrawer] = useState(false);
  const [drawerTab, setDrawerTab] = useState<"hints" | "solution">("hints");
  const [copiedSolution, setCopiedSolution] = useState(false);
  const [solutionLoaded, setSolutionLoaded] = useState(false);
  const [isRunning, setIsRunning] = useState(false);
  const [execResult, setExecResult] = useState<PythonExecutionResult | null>(null);
  const [assertionPassed, setAssertionPassed] = useState(false);

  // Playground state
  const [playgroundCode, setPlaygroundCode] = useState(
    `# Socrates Free-Form Python Scratchpad\n# Experiment with any Python code here!\n\nimport math\n\ndef calculate_euclidean(p1, p2):\n    return math.sqrt(sum((a - b) ** 2 for a, b in zip(p1, p2)))\n\npoint_a = [1.0, 2.0]\npoint_b = [4.0, 6.0]\n\ndistance = calculate_euclidean(point_a, point_b)\nprint("Distance between points:", round(distance, 4))\n`
  );
  const [playgroundResult, setPlaygroundResult] = useState<PythonExecutionResult | null>(null);
  const [isPlaygroundRunning, setIsPlaygroundRunning] = useState(false);

  // Quiz states
  const [selectedPredictOption, setSelectedPredictOption] = useState<number | null>(null);
  const [isPredictSubmitted, setIsPredictSubmitted] = useState(false);
  const [selectedCheckOption, setSelectedCheckOption] = useState<number | null>(null);
  const [isCheckSubmitted, setIsCheckSubmitted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Keyboard shortcut: Escape to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isPythonAcademyOpen) {
        closePythonAcademy();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isPythonAcademyOpen, closePythonAcademy]);

  // When switching concepts, reset code and test states
  useEffect(() => {
    setCode(sanitizeCode(activeConcept.starterCode || ""));
    setShowDrawer(false);
    setDrawerTab("hints");
    setCopiedSolution(false);
    setSolutionLoaded(false);
    setExecResult(null);
    setAssertionPassed(pythonMasteredModules.includes(activeConcept.id));
    setSelectedPredictOption(null);
    setIsPredictSubmitted(false);
    setSelectedCheckOption(null);
    setIsCheckSubmitted(false);
  }, [selectedModuleIndex, activeConcept, pythonMasteredModules]);

  // Preload Pyodide
  useEffect(() => {
    if (isPythonAcademyOpen) {
      initPyodide().catch(() => {});
    }
  }, [isPythonAcademyOpen]);

  if (!isPythonAcademyOpen || !mounted) return null;

  const getExtractedHints = (): string[] => {
    if (activeConcept.hints && activeConcept.hints.length > 0) {
      return activeConcept.hints;
    }
    const lines = (activeConcept.starterCode || "").split("\n");
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
    if (extracted.length === 0 && activeConcept.corePrinciple) {
      extracted.push(activeConcept.corePrinciple);
    }
    if (extracted.length === 0 && activeConcept.buildStep) {
      extracted.push(activeConcept.buildStep);
    }
    return extracted;
  };

  const extractedHints = getExtractedHints();

  // Run student's code and evaluate test assertions
  const handleRunAndValidate = async () => {
    setIsRunning(true);
    setExecResult(null);

    const cleanCode = sanitizeCode(code);
    if (cleanCode !== code) {
      setCode(cleanCode);
    }

    try {
      const codeToRun = `${cleanCode}\n\n# Verification Test:\n${activeConcept.testAssertion || ""}`;
      const result = await runPythonCode(codeToRun);
      setExecResult(result);

      if (result.success && result.assertionPassed) {
        setAssertionPassed(true);
        masterPythonModule(activeConcept.id);
      } else {
        setAssertionPassed(false);
      }
    } catch (err: any) {
      setExecResult({
        stdout: "",
        stderr: err?.message || String(err),
        error: "Execution exception",
        success: false,
        assertionPassed: false,
      });
      setAssertionPassed(false);
    } finally {
      setIsRunning(false);
    }
  };

  const handleRunPlayground = async () => {
    setIsPlaygroundRunning(true);
    setPlaygroundResult(null);
    try {
      const result = await runPythonCode(playgroundCode);
      setPlaygroundResult(result);
    } catch (err: any) {
      setPlaygroundResult({
        stdout: "",
        stderr: err?.message || String(err),
        error: "Execution exception",
        success: false,
        assertionPassed: false,
      });
    } finally {
      setIsPlaygroundRunning(false);
    }
  };

  const handleUseSolution = () => {
    if (activeConcept.solutionCode) {
      setCode(sanitizeCode(activeConcept.solutionCode));
      setSolutionLoaded(true);
      setTimeout(() => setSolutionLoaded(false), 2000);
    }
  };

  const handleCopySolution = () => {
    if (activeConcept.solutionCode) {
      navigator.clipboard.writeText(sanitizeCode(activeConcept.solutionCode));
      setCopiedSolution(true);
      setTimeout(() => setCopiedSolution(false), 2000);
    }
  };

  const handleResetCode = () => {
    setCode(sanitizeCode(activeConcept.starterCode || ""));
    setExecResult(null);
    setAssertionPassed(false);
    setShowDrawer(false);
  };

  const masteredCount = pythonMasteredModules.length;
  const totalCount = PYTHON_TRACK_CONCEPTS.length;
  const percentComplete = Math.round((masteredCount / totalCount) * 100);

  return createPortal(
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 backdrop-blur-md p-3 sm:p-5 md:p-8 animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) closePythonAcademy();
      }}
    >
      <div
        className="relative w-full max-w-7xl h-[92vh] max-h-[94vh] flex flex-col rounded-2xl bg-[#090d16] border border-zinc-800 shadow-[0_0_50px_rgba(0,0,0,0.85)] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* 1. Header Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 bg-[#0d121f] border-b border-zinc-800 flex-shrink-0">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm flex-shrink-0">
              <Terminal className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider">
                  Python Academy
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-mono font-semibold">
                  {masteredCount} of {totalCount} Mastered ({percentComplete}%)
                </span>
              </div>
              <h2 className="text-base sm:text-xl font-bold text-white tracking-tight mt-0.5">
                Python Foundations for AI &amp; Machine Learning
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3 self-end sm:self-auto">
            {/* Progress bar */}
            <div className="hidden md:flex flex-col items-end gap-1 mr-2">
              <span className="text-xs font-mono text-zinc-400">
                Academy Progress: <strong className="text-zinc-200">{percentComplete}%</strong>
              </span>
              <div className="w-36 h-2 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-emerald-400 transition-all duration-300 rounded-full shadow-[0_0_8px_rgba(52,211,153,0.5)]"
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={closePythonAcademy}
              className="px-4 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-200 hover:text-white border border-zinc-700 text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 shadow-sm cursor-pointer"
            >
              <span>← Return to AI Project</span>
            </button>

            <button
              type="button"
              onClick={closePythonAcademy}
              className="p-2 rounded-xl text-zinc-400 hover:text-white hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 transition-colors cursor-pointer"
              title="Close Academy (Esc)"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Main Two-Column Layout */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Column: Module Navigation Index */}
          <div className="lg:w-80 xl:w-96 flex flex-col border-b lg:border-b-0 lg:border-r border-zinc-800 bg-[#070b13] p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-shrink-0">
            <div className="flex items-center justify-between pb-2.5 border-b border-zinc-800">
              <span className="text-xs font-mono uppercase text-zinc-400 font-bold tracking-wider">
                Curriculum Modules
              </span>
              <span className="text-xs text-amber-400 font-mono font-bold px-2 py-0.5 rounded bg-amber-400/10 border border-amber-400/20">
                6 Core Modules
              </span>
            </div>

            <div className="space-y-2">
              {PYTHON_TRACK_CONCEPTS.map((concept, idx) => {
                const isSelected = idx === selectedModuleIndex;
                const isMastered = pythonMasteredModules.includes(concept.id);

                return (
                  <button
                    key={concept.id}
                    type="button"
                    onClick={() => setSelectedModuleIndex(idx)}
                    className={`w-full text-left p-3.5 rounded-xl transition-all border flex items-start gap-3 ${
                      isSelected
                        ? "bg-amber-500/15 border-amber-500/40 shadow-sm ring-1 ring-amber-500/20"
                        : "bg-zinc-950/60 border-zinc-800/80 hover:bg-zinc-900/80 hover:border-zinc-700"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono font-bold flex-shrink-0 mt-0.5 ${
                        isMastered
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : isSelected
                          ? "bg-amber-400 text-zinc-950 shadow-sm shadow-amber-400/20"
                          : "bg-zinc-800/90 text-zinc-400 border border-zinc-700/60"
                      }`}
                    >
                      {isMastered ? <Check className="w-4 h-4 text-emerald-400" /> : idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-mono text-zinc-400 font-medium">
                          Module {idx + 1}
                        </span>
                        {isMastered && (
                          <span className="text-xs font-mono text-emerald-400 font-bold flex items-center gap-1">
                            Mastered ✓
                          </span>
                        )}
                      </div>
                      <h4
                        className={`text-sm font-semibold truncate mt-1 ${
                          isSelected ? "text-amber-200" : "text-zinc-200"
                        }`}
                      >
                        {concept.title.replace(/^\d+\.\s*/, "")}
                      </h4>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Quick Tips Box */}
            <div className="mt-auto p-4 rounded-xl bg-zinc-900/70 border border-zinc-800 space-y-2 text-xs text-zinc-300">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-xs">
                <Sparkles className="w-4 h-4 text-amber-400 flex-shrink-0" />
                <span>Zero Setup In-Browser</span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed font-normal">
                All Python code executes directly in your browser using Pyodide (WebAssembly). No terminal configuration or local Python install needed!
              </p>
            </div>
          </div>

          {/* Right Column: Active Module Workspace */}
          <div className="flex-1 min-h-0 flex flex-col bg-[#070b13] overflow-hidden">
            {/* Module Sub-Header & Tabs */}
            <div className="px-6 py-3.5 bg-[#0b0f19] border-b border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 flex-shrink-0">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
                  MODULE {selectedModuleIndex + 1} OF 6
                </span>
                <h3 className="text-base sm:text-xl font-bold text-white mt-0.5">
                  {activeConcept.title}
                </h3>
              </div>

              {/* View Tabs */}
              <div className="flex items-center p-1 rounded-xl bg-zinc-950 border border-zinc-800 self-start sm:self-auto shadow-sm">
                <button
                  type="button"
                  onClick={() => setActiveTab("learn")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${
                    activeTab === "learn"
                      ? "bg-amber-400/15 text-amber-300 border border-amber-400/40 font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>1. Concept &amp; Syntax</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("code")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${
                    activeTab === "code"
                      ? "bg-amber-400/15 text-amber-300 border border-amber-400/40 font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Code2 className="w-4 h-4" />
                  <span>2. Practice Sandbox</span>
                  {assertionPassed && (
                    <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-sm shadow-emerald-400" />
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("playground")}
                  className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium transition-all flex items-center gap-2 ${
                    activeTab === "playground"
                      ? "bg-amber-400/15 text-amber-300 border border-amber-400/40 font-semibold shadow-sm"
                      : "text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  <Terminal className="w-4 h-4" />
                  <span>3. Scratchpad</span>
                </button>
              </div>
            </div>

            {/* Tab 1: Learn & Syntax Guide */}
            {activeTab === "learn" && (
              <div className="flex-1 overflow-y-auto p-5 md:p-7 space-y-6">
                {/* Hook / Analogy Box */}
                <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3 shadow-sm">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-zinc-800">
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
                    <h4 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-amber-300">
                      The Big Picture Intuition
                    </h4>
                  </div>
                  <p className="text-sm sm:text-base text-zinc-100 leading-relaxed font-normal">
                    {activeConcept.hook}
                  </p>
                </div>

                {/* Explanation & Core Principle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3 shadow-sm">
                    <span className="text-xs font-mono uppercase text-zinc-400 font-bold tracking-wider block">
                      How Python Handles This
                    </span>
                    <p className="text-sm sm:text-base text-zinc-100 leading-relaxed font-normal">
                      {activeConcept.explanationSummary}
                    </p>
                  </div>

                  <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3 shadow-sm">
                    <span className="text-xs font-mono uppercase text-amber-400 font-bold tracking-wider block">
                      Core Syntax Principle
                    </span>
                    <p className="text-xs sm:text-sm text-amber-100 font-mono leading-relaxed bg-[#05080e] p-4 rounded-xl border border-amber-500/25">
                      {activeConcept.corePrinciple}
                    </p>
                  </div>
                </div>

                {/* Worked Example */}
                {activeConcept.workedExample && (
                  <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-4 shadow-sm">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-800 gap-1.5">
                      <span className="text-xs sm:text-sm font-mono uppercase text-cyan-300 font-bold tracking-wider block">
                        Step-by-Step Code Walkthrough
                      </span>
                      <span className="text-xs sm:text-sm text-zinc-400 font-mono">
                        {activeConcept.workedExample.scenario}
                      </span>
                    </div>

                    <div className="space-y-2.5 pt-1">
                      {activeConcept.workedExample.calculationSteps.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3 p-3.5 rounded-xl bg-[#060910] border border-zinc-800/90"
                        >
                          <span className="w-6 h-6 rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 text-xs font-mono font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-xs sm:text-sm font-mono text-zinc-200 leading-relaxed">
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="p-3.5 rounded-xl bg-cyan-950/30 border border-cyan-500/25 text-xs sm:text-sm font-mono text-cyan-200">
                      <strong className="text-cyan-300 font-sans font-semibold">Takeaway: </strong> {activeConcept.workedExample.takeaway}
                    </div>
                  </div>
                )}

                {/* Interactive Quick Quiz */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-zinc-300 flex items-center gap-2">
                    <HelpCircle className="w-4 h-4 text-amber-400" />
                    <span>Concept Comprehension Check</span>
                  </h4>

                  {/* Question 1: Predict */}
                  {activeConcept.predictQuestion && (
                    <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3.5 shadow-sm">
                      <span className="text-xs font-mono uppercase text-amber-400 font-bold block">
                        Question 1 · Syntax Predict
                      </span>
                      <p className="text-sm sm:text-base text-white font-medium leading-relaxed">
                        {activeConcept.predictQuestion.prompt}
                      </p>

                      <div className="space-y-2.5">
                        {activeConcept.predictQuestion.options.map((opt, oIdx) => {
                          const isChosen = selectedPredictOption === oIdx;
                          const isCorrect = oIdx === activeConcept.predictQuestion!.correctIndex;

                          let btnStyle = "bg-[#060910] border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700";
                          if (isPredictSubmitted) {
                            if (isCorrect) {
                              btnStyle = "bg-emerald-500/20 border-emerald-500/50 text-emerald-200 font-medium";
                            } else if (isChosen) {
                              btnStyle = "bg-rose-500/20 border-rose-500/50 text-rose-200 font-medium";
                            }
                          } else if (isChosen) {
                            btnStyle = "bg-amber-400/20 border-amber-400/50 text-amber-200 font-medium";
                          }

                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => {
                                setSelectedPredictOption(oIdx);
                                setIsPredictSubmitted(true);
                              }}
                              className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {isPredictSubmitted && isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {isPredictSubmitted && (
                        <div className="p-4 rounded-xl bg-[#060910] border border-zinc-800 text-xs sm:text-sm text-zinc-200 leading-relaxed font-mono">
                          <strong className="text-amber-300 font-sans font-semibold">Explanation: </strong>
                          {activeConcept.predictQuestion.explanation}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Question 2: Why it matters */}
                  {activeConcept.checkQuestion && (
                    <div className="p-5 sm:p-6 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-3.5 shadow-sm">
                      <span className="text-xs font-mono uppercase text-cyan-400 font-bold block">
                        Question 2 · AI Application
                      </span>
                      <p className="text-sm sm:text-base text-white font-medium leading-relaxed">
                        {activeConcept.checkQuestion.prompt}
                      </p>

                      <div className="space-y-2.5">
                        {activeConcept.checkQuestion.options.map((opt, oIdx) => {
                          const isChosen = selectedCheckOption === oIdx;
                          const isCorrect = oIdx === activeConcept.checkQuestion!.correctIndex;

                          let btnStyle = "bg-[#060910] border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:border-zinc-700";
                          if (isCheckSubmitted) {
                            if (isCorrect) {
                              btnStyle = "bg-emerald-500/20 border-emerald-500/50 text-emerald-200 font-medium";
                            } else if (isChosen) {
                              btnStyle = "bg-rose-500/20 border-rose-500/50 text-rose-200 font-medium";
                            }
                          } else if (isChosen) {
                            btnStyle = "bg-cyan-400/20 border-cyan-400/50 text-cyan-200 font-medium";
                          }

                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => {
                                setSelectedCheckOption(oIdx);
                                setIsCheckSubmitted(true);
                              }}
                              className={`w-full text-left p-3.5 rounded-xl border text-xs sm:text-sm transition-all flex items-center justify-between cursor-pointer ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {isCheckSubmitted && isCorrect && (
                                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {isCheckSubmitted && (
                        <div className="p-4 rounded-xl bg-[#060910] border border-zinc-800 text-xs sm:text-sm text-zinc-200 leading-relaxed font-mono">
                          <strong className="text-cyan-300 font-sans font-semibold">Explanation: </strong>
                          {activeConcept.checkQuestion.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom CTA to switch to Practice Sandbox */}
                <div className="pt-2 flex items-center justify-between pb-2">
                  <span className="text-xs sm:text-sm text-zinc-400">
                    Ready to write and run code?
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("code")}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
                  >
                    <span>Proceed to Practice Sandbox</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            {/* Tab 2: Practice Code Sandbox */}
            {activeTab === "code" && (
              <div className="flex-1 min-h-0 flex flex-col p-4 sm:p-6 space-y-4 overflow-hidden">
                {/* Build prompt banner */}
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm flex-shrink-0">
                  <div className="space-y-1">
                    <span className="text-xs font-mono uppercase text-amber-400 font-bold block tracking-wider">
                      Practice Objective
                    </span>
                    <p className="text-sm sm:text-base text-zinc-100 font-medium leading-relaxed">
                      {activeConcept.buildStep}
                    </p>
                  </div>
                  {assertionPassed && (
                    <div className="px-3.5 py-1.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-mono font-bold text-xs sm:text-sm flex items-center gap-2 flex-shrink-0 shadow-sm">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Module Mastered ✓</span>
                    </div>
                  )}
                </div>

                {/* Code Editor Container */}
                <div className="flex-1 min-h-0 flex flex-col rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-md">
                  {/* Editor Header */}
                  <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 bg-[#0b0f19] border-b border-zinc-800 flex-shrink-0">
                    <div className="flex items-center gap-2">
                      <Terminal className="w-4 h-4 text-amber-400" />
                      <span className="text-xs sm:text-sm font-mono font-semibold text-zinc-200">
                        {activeConcept.id}.py
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {activeConcept.solutionCode && (
                        <button
                          type="button"
                          onClick={() => setShowDrawer(!showDrawer)}
                          className={`text-xs sm:text-sm font-bold transition-all flex items-center gap-2 px-3.5 py-1.5 rounded-xl border cursor-pointer ${
                            showDrawer
                              ? "bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm"
                              : "bg-zinc-900 text-zinc-200 hover:text-white border-zinc-700/80 hover:bg-zinc-800"
                          }`}
                        >
                          <Lightbulb className="w-4 h-4 text-amber-400" />
                          <span>{showDrawer ? "Hide Assistant" : "Hints & Solution"}</span>
                        </button>
                      )}
                      <button
                        type="button"
                        onClick={handleResetCode}
                        title="Reset code"
                        className="text-xs text-zinc-400 hover:text-white p-2 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Comprehensive Hints & Solution Drawer */}
                  {showDrawer && (
                    <div className="bg-[#0b0f19] border-b border-zinc-800 p-4 sm:p-5 space-y-4 animate-in fade-in duration-150 flex-shrink-0">
                      <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
                        {/* Tabs */}
                        <div className="flex items-center gap-2.5">
                          <button
                            type="button"
                            onClick={() => setDrawerTab("hints")}
                            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                              drawerTab === "hints"
                                ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                                : "text-zinc-400 hover:text-zinc-200"
                            }`}
                          >
                            <Lightbulb className="w-4 h-4 text-amber-400" />
                            <span>Step Hints ({extractedHints.length})</span>
                          </button>
                          {activeConcept.solutionCode && (
                            <button
                              type="button"
                              onClick={() => setDrawerTab("solution")}
                              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-colors cursor-pointer ${
                                drawerTab === "solution"
                                  ? "bg-blue-500/20 text-blue-300 border border-blue-500/30"
                                  : "text-zinc-400 hover:text-zinc-200"
                              }`}
                            >
                              <CheckCircle2 className="w-4 h-4 text-blue-400" />
                              <span>Complete Solution</span>
                            </button>
                          )}
                        </div>

                        {/* Close button */}
                        <button
                          type="button"
                          onClick={() => setShowDrawer(false)}
                          className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
                          title="Close drawer"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>

                      {drawerTab === "hints" ? (
                        <div className="space-y-3">
                          <div className="flex items-center justify-between text-xs sm:text-sm text-zinc-400">
                            <span className="font-bold text-zinc-200">Guided Walkthrough for Blanks:</span>
                            {activeConcept.solutionCode && (
                              <button
                                type="button"
                                onClick={() => setDrawerTab("solution")}
                                className="text-amber-400 hover:text-amber-300 font-semibold inline-flex items-center gap-1 cursor-pointer"
                              >
                                Need complete code? View Solution &rarr;
                              </button>
                            )}
                          </div>

                          <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                            {extractedHints.map((hint, idx) => (
                              <div
                                key={idx}
                                className="flex items-start gap-3 p-3 rounded-xl bg-zinc-900/90 border border-zinc-800 text-xs sm:text-sm text-zinc-200"
                              >
                                <span className="w-6 h-6 rounded-full bg-amber-500/20 text-amber-300 font-bold flex items-center justify-center flex-shrink-0 text-xs border border-amber-500/30">
                                  {idx + 1}
                                </span>
                                <div className="leading-relaxed font-mono text-zinc-200 whitespace-pre-wrap">
                                  {hint}
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ) : (
                        activeConcept.solutionCode && (
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="text-xs sm:text-sm text-zinc-300 font-semibold">
                                Verified working reference solution (never truncated):
                              </span>
                              <div className="flex items-center gap-2">
                                <button
                                  type="button"
                                  onClick={handleCopySolution}
                                  className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs sm:text-sm font-semibold flex items-center gap-1.5 transition-colors border border-zinc-700 cursor-pointer"
                                >
                                  {copiedSolution ? (
                                    <>
                                      <Check className="w-4 h-4 text-emerald-400" />
                                      <span>Copied!</span>
                                    </>
                                  ) : (
                                    <>
                                      <Copy className="w-4 h-4 text-zinc-400" />
                                      <span>Copy Code</span>
                                    </>
                                  )}
                                </button>
                                <button
                                  type="button"
                                  onClick={handleUseSolution}
                                  className="px-3.5 py-1.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 text-xs sm:text-sm font-bold flex items-center gap-1.5 transition-colors shadow-sm cursor-pointer"
                                >
                                  {solutionLoaded ? (
                                    <>
                                      <Check className="w-4 h-4" />
                                      <span>Loaded into Editor!</span>
                                    </>
                                  ) : (
                                    <span>Load Solution into Editor</span>
                                  )}
                                </button>
                              </div>
                            </div>

                            <pre className="font-mono text-xs sm:text-sm text-zinc-200 bg-[#06090e] p-4 rounded-xl border border-zinc-800 max-h-52 overflow-y-auto whitespace-pre leading-relaxed select-text">
                              {sanitizeCode(activeConcept.solutionCode)}
                            </pre>
                          </div>
                        )
                      )}
                    </div>
                  )}

                  {/* Code Textarea */}
                  <div className="flex-1 min-h-[180px] bg-[#070A10] overflow-hidden">
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      spellCheck={false}
                      className="w-full h-full p-4 sm:p-5 bg-transparent font-mono text-xs sm:text-sm text-zinc-100 placeholder-zinc-600 focus:outline-none resize-none leading-relaxed selection:bg-amber-500/20"
                      placeholder="# Write your Python code here..."
                    />
                  </div>

                  {/* Terminal Execution Console */}
                  <div className="h-40 border-t border-zinc-800 bg-[#04070e] p-3.5 sm:p-4 font-mono text-xs sm:text-sm overflow-y-auto flex-shrink-0">
                    <div className="flex items-center justify-between text-zinc-400 text-xs uppercase mb-2 font-bold tracking-wider">
                      <span>Pyodide Sandbox Output</span>
                      {execResult?.success && (
                        <span className="text-emerald-400 font-bold">Assertions Passed ✓</span>
                      )}
                    </div>

                    {isRunning ? (
                      <div className="text-amber-400 animate-pulse flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping" />
                        Executing Python code in Pyodide...
                      </div>
                    ) : execResult ? (
                      <div className="space-y-1.5">
                        {execResult.stdout && (
                          <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
                            {execResult.stdout}
                          </pre>
                        )}
                        {execResult.stderr && (
                          <pre className="text-rose-400 whitespace-pre-wrap leading-relaxed">
                            {execResult.stderr}
                          </pre>
                        )}
                        {execResult.error && (
                          <div className="text-rose-400 font-semibold">{execResult.error}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-zinc-500 text-xs sm:text-sm">
                        Fill in the blanks (<code className="text-amber-400 font-bold">___</code>) and click &quot;Run &amp; Test Code&quot; below.
                      </span>
                    )}
                  </div>

                  {/* Editor Footer Actions */}
                  <div className="p-3.5 sm:p-4 bg-[#0b0f19] border-t border-zinc-800 flex items-center justify-between gap-3 flex-shrink-0">
                    <span className="text-xs sm:text-sm text-zinc-400 hidden sm:inline">
                      Fill in the blanks (<code className="text-amber-400 font-bold">___</code>) and run assertions.
                    </span>

                    <div className="flex items-center gap-3 ml-auto">
                      <button
                        type="button"
                        disabled={isRunning}
                        onClick={handleRunAndValidate}
                        className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                      >
                        <Play className="w-4 h-4 fill-current" />
                        <span>{isRunning ? "Running..." : "Run & Test Code"}</span>
                      </button>

                      {assertionPassed && selectedModuleIndex < PYTHON_TRACK_CONCEPTS.length - 1 && (
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedModuleIndex(selectedModuleIndex + 1);
                            setActiveTab("learn");
                          }}
                          className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
                        >
                          <span>Next Module &rarr;</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Tab 3: Free-Form Python Scratchpad */}
            {activeTab === "playground" && (
              <div className="flex-1 min-h-0 flex flex-col p-4 sm:p-6 space-y-4 overflow-hidden">
                <div className="p-4 sm:p-5 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-center justify-between gap-3 shadow-sm flex-shrink-0">
                  <div className="flex items-center gap-2.5 text-zinc-200 text-xs sm:text-sm font-semibold">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span>Free-Form Scratchpad · Write &amp; Test Any Python Script</span>
                  </div>
                  <button
                    type="button"
                    disabled={isPlaygroundRunning}
                    onClick={handleRunPlayground}
                    className="px-4 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-bold text-xs sm:text-sm transition-colors flex items-center gap-2 shadow-sm disabled:opacity-50 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{isPlaygroundRunning ? "Running..." : "Execute Script"}</span>
                  </button>
                </div>

                <div className="flex-1 min-h-0 flex flex-col rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-950 shadow-md">
                  <div className="flex-1 min-h-[220px] bg-[#070A10]">
                    <textarea
                      value={playgroundCode}
                      onChange={(e) => setPlaygroundCode(e.target.value)}
                      spellCheck={false}
                      className="w-full h-full p-4 sm:p-5 bg-transparent font-mono text-xs sm:text-sm text-cyan-100 placeholder-zinc-600 focus:outline-none resize-none leading-relaxed selection:bg-cyan-500/20"
                    />
                  </div>

                  <div className="h-44 border-t border-zinc-800 bg-[#04070e] p-3.5 sm:p-4 font-mono text-xs sm:text-sm overflow-y-auto flex-shrink-0">
                    <span className="text-zinc-400 text-xs uppercase mb-2 font-bold tracking-wider block">
                      Execution Output:
                    </span>
                    {isPlaygroundRunning ? (
                      <div className="text-cyan-400 animate-pulse flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                        Running Python code...
                      </div>
                    ) : playgroundResult ? (
                      <div className="space-y-1.5">
                        {playgroundResult.stdout && (
                          <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
                            {playgroundResult.stdout}
                          </pre>
                        )}
                        {playgroundResult.stderr && (
                          <pre className="text-rose-400 whitespace-pre-wrap leading-relaxed">
                            {playgroundResult.stderr}
                          </pre>
                        )}
                      </div>
                    ) : (
                      <span className="text-zinc-500 text-xs sm:text-sm">Output will appear here after clicking &quot;Execute Script&quot;.</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Module Stepper Bar */}
            <div className="px-6 py-3.5 bg-[#0b0f19] border-t border-zinc-800 flex items-center justify-between gap-3 flex-shrink-0">
              <button
                type="button"
                disabled={selectedModuleIndex === 0}
                onClick={() => {
                  setSelectedModuleIndex(Math.max(0, selectedModuleIndex - 1));
                  setActiveTab("learn");
                }}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Module</span>
              </button>

              <span className="text-xs sm:text-sm font-mono text-zinc-300 font-semibold">
                Module {selectedModuleIndex + 1} of {PYTHON_TRACK_CONCEPTS.length}
              </span>

              <button
                type="button"
                disabled={selectedModuleIndex === PYTHON_TRACK_CONCEPTS.length - 1}
                onClick={() => {
                  setSelectedModuleIndex(
                    Math.min(PYTHON_TRACK_CONCEPTS.length - 1, selectedModuleIndex + 1)
                  );
                  setActiveTab("learn");
                }}
                className="px-4 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-200 hover:text-white text-xs sm:text-sm font-semibold transition-colors flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none cursor-pointer"
              >
                <span>Next Module</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>,
    document.body
  );
};
