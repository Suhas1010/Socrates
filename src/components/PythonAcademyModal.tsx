"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { useSessionStore } from "@/lib/store";
import { PYTHON_TRACK_CONCEPTS } from "@/lib/templates/pythonTrack";
import { runPythonCode, initPyodide, PythonExecutionResult } from "@/lib/pyodideRunner";
import { Concept } from "@/lib/types";

export const PythonAcademyModal: React.FC = () => {
  const {
    isPythonAcademyOpen,
    closePythonAcademy,
    pythonMasteredModules,
    masterPythonModule,
  } = useSessionStore();

  const [selectedModuleIndex, setSelectedModuleIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<"learn" | "code" | "playground">("learn");

  // Code editor states
  const activeConcept: Concept = PYTHON_TRACK_CONCEPTS[selectedModuleIndex] || PYTHON_TRACK_CONCEPTS[0];
  const [code, setCode] = useState(activeConcept.starterCode || "");
  const [showSolution, setShowSolution] = useState(false);
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

  // When switching concepts, reset code and test states
  useEffect(() => {
    setCode(activeConcept.starterCode || "");
    setShowSolution(false);
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

  if (!isPythonAcademyOpen) return null;

  // Run student's code and evaluate test assertions
  const handleRunAndValidate = async () => {
    setIsRunning(true);
    setExecResult(null);

    try {
      const codeToRun = `${code}\n\n# Verification Test:\n${activeConcept.testAssertion || ""}`;
      const result = await runPythonCode(codeToRun);
      setExecResult(result);

      if (result.success) {
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
      setCode(activeConcept.solutionCode);
      setShowSolution(false);
    }
  };

  const handleResetCode = () => {
    setCode(activeConcept.starterCode || "");
    setExecResult(null);
    setAssertionPassed(false);
  };

  const masteredCount = pythonMasteredModules.length;
  const totalCount = PYTHON_TRACK_CONCEPTS.length;
  const percentComplete = Math.round((masteredCount / totalCount) * 100);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/85 backdrop-blur-xl p-3 sm:p-5 md:p-8 animate-in fade-in duration-200">
      <div className="relative w-full max-w-7xl h-[92vh] flex flex-col rounded-3xl bg-slate-950 border border-white/20 shadow-2xl overflow-hidden">
        {/* 1. Header Toolbar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 md:px-8 py-5 bg-slate-900/95 border-b border-white/15 flex-shrink-0">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 text-2xl shadow-md">
              🐍
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <span className="text-xs md:text-sm font-mono font-black text-amber-300 uppercase tracking-wider">
                  Python Academy · Standalone Track
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
                  {masteredCount} of {totalCount} Mastered ({percentComplete}%)
                </span>
              </div>
              <h2 className="text-xl md:text-2xl font-black text-white mt-1">
                Python Foundations for AI & Machine Learning
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Progress bar */}
            <div className="hidden md:flex flex-col items-end gap-1 mr-2">
              <span className="text-xs font-mono text-slate-300">
                Academy Progress
              </span>
              <div className="w-36 h-2 bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-emerald-500 to-teal-400 transition-all duration-300"
                  style={{ width: `${percentComplete}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={closePythonAcademy}
              className="px-5 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs md:text-sm transition-all flex items-center gap-2 shadow-lg shadow-amber-400/20"
            >
              <span>← Return to My AI Project</span>
            </button>

            <button
              type="button"
              onClick={closePythonAcademy}
              className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Close Academy"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 2. Main Two-Column Layout */}
        <div className="flex-1 min-h-0 flex flex-col lg:flex-row overflow-hidden">
          {/* Left Column: Module Navigation Index */}
          <div className="lg:w-80 xl:w-96 flex flex-col border-b lg:border-b-0 lg:border-r border-white/10 bg-slate-900/60 p-4 md:p-5 overflow-y-auto space-y-3 flex-shrink-0">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-xs md:text-sm font-mono uppercase text-slate-300 font-bold tracking-wider">
                Curriculum Modules
              </span>
              <span className="text-xs text-amber-300 font-mono font-bold">
                6 Core Steps
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
                    className={`w-full text-left p-3.5 rounded-2xl transition-all border flex items-start gap-3 ${
                      isSelected
                        ? "bg-amber-400/15 border-amber-400/50 shadow-md ring-1 ring-amber-400/30"
                        : "bg-slate-950/70 border-white/5 hover:bg-slate-800/80 hover:border-white/15"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center text-xs font-mono font-black flex-shrink-0 mt-0.5 ${
                        isMastered
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
                          : isSelected
                          ? "bg-amber-400 text-zinc-950 font-black"
                          : "bg-slate-800 text-slate-400"
                      }`}
                    >
                      {isMastered ? <Check className="w-4 h-4 text-emerald-400" /> : idx + 1}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="text-xs font-mono text-slate-400">
                          Module {idx + 1}
                        </span>
                        {isMastered && (
                          <span className="text-[11px] font-mono text-emerald-400 font-bold">
                            Mastered ✓
                          </span>
                        )}
                      </div>
                      <h4
                        className={`text-sm font-bold truncate mt-0.5 ${
                          isSelected ? "text-amber-300 font-black" : "text-slate-200"
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
            <div className="mt-auto p-4 rounded-2xl bg-amber-950/30 border border-amber-500/20 space-y-2 text-xs md:text-sm text-slate-300">
              <div className="flex items-center gap-2 text-amber-300 font-bold">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Zero Setup In-Browser</span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed font-normal">
                All Python code executes directly in your browser using Pyodide (WebAssembly). No terminal configuration or Python install needed!
              </p>
            </div>
          </div>

          {/* Right Column: Active Module Workspace */}
          <div className="flex-1 min-h-0 flex flex-col bg-slate-950 overflow-hidden">
            {/* Module Sub-Header & Tabs */}
            <div className="px-6 md:px-8 py-4 bg-slate-900/80 border-b border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4 flex-shrink-0">
              <div>
                <span className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider block">
                  MODULE {selectedModuleIndex + 1} OF 6
                </span>
                <h3 className="text-xl md:text-2xl font-black text-white mt-1">
                  {activeConcept.title}
                </h3>
              </div>

              {/* View Tabs */}
              <div className="flex items-center p-1.5 rounded-2xl bg-slate-950 border border-white/15 self-start sm:self-auto shadow-inner">
                <button
                  type="button"
                  onClick={() => setActiveTab("learn")}
                  className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
                    activeTab === "learn"
                      ? "bg-amber-400 text-zinc-950 font-black shadow-md"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <BookOpen className="w-4 h-4" />
                  <span>1. Concept & Syntax</span>
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("code")}
                  className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
                    activeTab === "code"
                      ? "bg-amber-400 text-zinc-950 font-black shadow-md"
                      : "text-slate-300 hover:text-white"
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
                  className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
                    activeTab === "playground"
                      ? "bg-amber-400 text-zinc-950 font-black shadow-md"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  <Terminal className="w-4 h-4" />
                  <span>3. Scratchpad</span>
                </button>
              </div>
            </div>

            {/* Tab 1: Learn & Syntax Guide */}
            {activeTab === "learn" && (
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
                {/* Hook / Analogy Box */}
                <div className="p-6 md:p-7 rounded-3xl bg-slate-900/90 border border-white/15 space-y-3 shadow-xl">
                  <div className="flex items-center gap-2.5 pb-2 border-b border-white/10">
                    <span className="text-xl">💡</span>
                    <h4 className="text-base md:text-lg font-black text-amber-300 font-sans">
                      The Big Picture Intuition
                    </h4>
                  </div>
                  <p className="text-base md:text-lg text-slate-200 leading-relaxed font-normal">
                    {activeConcept.hook}
                  </p>
                </div>

                {/* Explanation & Core Principle */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 md:p-7 rounded-3xl bg-slate-900/90 border border-white/15 space-y-3.5 shadow-xl">
                    <span className="text-xs md:text-sm font-mono uppercase text-slate-300 font-black tracking-wider block">
                      📘 How Python Handles This
                    </span>
                    <p className="text-sm md:text-base text-slate-200 leading-relaxed">
                      {activeConcept.explanationSummary}
                    </p>
                  </div>

                  <div className="p-6 md:p-7 rounded-3xl bg-slate-900/90 border border-white/15 space-y-3.5 shadow-xl">
                    <span className="text-xs md:text-sm font-mono uppercase text-amber-400 font-black tracking-wider block">
                      ⚡ Core Syntax Principle
                    </span>
                    <p className="text-sm md:text-base text-amber-100 font-mono leading-relaxed bg-slate-950/80 p-4 rounded-2xl border border-amber-500/25">
                      {activeConcept.corePrinciple}
                    </p>
                  </div>
                </div>

                {/* Worked Example */}
                {activeConcept.workedExample && (
                  <div className="p-6 md:p-8 rounded-3xl bg-slate-900/90 border border-white/15 space-y-4 shadow-xl">
                    <div className="flex items-center justify-between pb-3 border-b border-white/10">
                      <span className="text-xs md:text-sm font-mono uppercase text-cyan-300 font-black tracking-wider block">
                        🔍 Step-by-Step Code Walkthrough
                      </span>
                      <span className="text-xs text-slate-400 font-mono">
                        {activeConcept.workedExample.scenario}
                      </span>
                    </div>

                    <div className="space-y-3 pt-1">
                      {activeConcept.workedExample.calculationSteps.map((step, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-3.5 p-4 rounded-2xl bg-slate-950/80 border border-white/10"
                        >
                          <span className="w-7 h-7 rounded-xl bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 text-xs font-mono font-bold flex items-center justify-center flex-shrink-0 mt-0.5">
                            {idx + 1}
                          </span>
                          <span className="text-sm md:text-base font-mono text-slate-100 leading-relaxed">
                            {step}
                          </span>
                        </div>
                      ))}
                    </div>

                    <div className="p-4 rounded-2xl bg-cyan-500/10 border border-cyan-500/25 text-xs md:text-sm font-mono text-cyan-200">
                      <strong>Takeaway: </strong> {activeConcept.workedExample.takeaway}
                    </div>
                  </div>
                )}

                {/* Interactive Quick Quiz */}
                <div className="space-y-4 pt-2">
                  <h4 className="text-base md:text-lg font-black text-white flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-amber-400" />
                    <span>Quick Concept Comprehension Check</span>
                  </h4>

                  {/* Question 1: Predict */}
                  {activeConcept.predictQuestion && (
                    <div className="p-6 md:p-7 rounded-3xl bg-slate-900/90 border border-white/15 space-y-4 shadow-xl">
                      <span className="text-xs font-mono uppercase text-amber-400 font-bold block">
                        Question 1 · Syntax Predict
                      </span>
                      <p className="text-base md:text-lg text-white font-bold leading-relaxed">
                        {activeConcept.predictQuestion.prompt}
                      </p>

                      <div className="space-y-2.5">
                        {activeConcept.predictQuestion.options.map((opt, oIdx) => {
                          const isChosen = selectedPredictOption === oIdx;
                          const isCorrect = oIdx === activeConcept.predictQuestion!.correctIndex;

                          let btnStyle = "bg-slate-950/80 border-white/10 text-slate-200 hover:bg-slate-800 hover:border-white/20";
                          if (isPredictSubmitted) {
                            if (isCorrect) {
                              btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                            } else if (isChosen) {
                              btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300 font-bold";
                            }
                          } else if (isChosen) {
                            btnStyle = "bg-amber-400/20 border-amber-400 text-amber-300 font-bold";
                          }

                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => {
                                setSelectedPredictOption(oIdx);
                                setIsPredictSubmitted(true);
                              }}
                              className={`w-full text-left p-4 rounded-2xl border text-sm md:text-base transition-all flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {isPredictSubmitted && isCorrect && (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {isPredictSubmitted && (
                        <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 text-xs md:text-sm text-slate-300 leading-relaxed font-mono">
                          <strong className="text-amber-300 font-sans">Explanation: </strong>
                          {activeConcept.predictQuestion.explanation}
                        </div>
                      )}
                    </div>
                  )}

                  {/* Question 2: Why it matters */}
                  {activeConcept.checkQuestion && (
                    <div className="p-6 md:p-7 rounded-3xl bg-slate-900/90 border border-white/15 space-y-4 shadow-xl">
                      <span className="text-xs font-mono uppercase text-cyan-400 font-bold block">
                        Question 2 · AI Application
                      </span>
                      <p className="text-base md:text-lg text-white font-bold leading-relaxed">
                        {activeConcept.checkQuestion.prompt}
                      </p>

                      <div className="space-y-2.5">
                        {activeConcept.checkQuestion.options.map((opt, oIdx) => {
                          const isChosen = selectedCheckOption === oIdx;
                          const isCorrect = oIdx === activeConcept.checkQuestion!.correctIndex;

                          let btnStyle = "bg-slate-950/80 border-white/10 text-slate-200 hover:bg-slate-800 hover:border-white/20";
                          if (isCheckSubmitted) {
                            if (isCorrect) {
                              btnStyle = "bg-emerald-500/20 border-emerald-500 text-emerald-300 font-bold";
                            } else if (isChosen) {
                              btnStyle = "bg-rose-500/20 border-rose-500 text-rose-300 font-bold";
                            }
                          } else if (isChosen) {
                            btnStyle = "bg-cyan-400/20 border-cyan-400 text-cyan-300 font-bold";
                          }

                          return (
                            <button
                              key={oIdx}
                              type="button"
                              onClick={() => {
                                setSelectedCheckOption(oIdx);
                                setIsCheckSubmitted(true);
                              }}
                              className={`w-full text-left p-4 rounded-2xl border text-sm md:text-base transition-all flex items-center justify-between ${btnStyle}`}
                            >
                              <span>{opt}</span>
                              {isCheckSubmitted && isCorrect && (
                                <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 ml-2" />
                              )}
                            </button>
                          );
                        })}
                      </div>

                      {isCheckSubmitted && (
                        <div className="p-4 rounded-2xl bg-slate-950 border border-white/10 text-xs md:text-sm text-slate-300 leading-relaxed font-mono">
                          <strong className="text-cyan-300 font-sans">Explanation: </strong>
                          {activeConcept.checkQuestion.explanation}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Bottom CTA to switch to Practice Sandbox */}
                <div className="pt-4 flex items-center justify-between">
                  <span className="text-xs md:text-sm text-slate-400">
                    Ready to write and run code?
                  </span>
                  <button
                    type="button"
                    onClick={() => setActiveTab("code")}
                    className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs md:text-sm transition-all flex items-center gap-2 shadow-lg shadow-amber-400/20"
                  >
                    <span>Proceed to Practice Sandbox</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* Tab 2: Practice Code Sandbox */}
            {activeTab === "code" && (
              <div className="flex-1 min-h-0 flex flex-col p-6 md:p-8 space-y-4 overflow-hidden">
                {/* Build prompt banner */}
                <div className="p-5 rounded-2xl bg-slate-900/90 border border-white/15 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md flex-shrink-0">
                  <div className="space-y-1">
                    <span className="text-xs font-mono uppercase text-amber-400 font-bold block">
                      🛠️ Practice Objective
                    </span>
                    <p className="text-sm md:text-base text-slate-200 font-medium">
                      {activeConcept.buildStep}
                    </p>
                  </div>
                  {assertionPassed && (
                    <div className="px-4 py-2 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 font-mono font-bold text-xs md:text-sm flex items-center gap-2 flex-shrink-0">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Module Mastered!</span>
                    </div>
                  )}
                </div>

                {/* Code Editor Container */}
                <div className="flex-1 min-h-0 flex flex-col rounded-3xl overflow-hidden border border-white/15 bg-slate-950 shadow-2xl">
                  {/* Editor Header */}
                  <div className="flex items-center justify-between px-5 py-3.5 bg-slate-900/90 border-b border-white/10 flex-shrink-0">
                    <div className="flex items-center gap-2.5">
                      <Terminal className="w-4 h-4 text-amber-400" />
                      <span className="text-xs md:text-sm font-mono font-bold text-slate-200">
                        {activeConcept.id}.py
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      {activeConcept.solutionCode && (
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
                        onClick={handleResetCode}
                        title="Reset code"
                        className="text-xs text-slate-400 hover:text-white p-2 rounded-xl hover:bg-slate-800 transition-colors"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Solution Preview Drawer */}
                  {showSolution && activeConcept.solutionCode && (
                    <div className="p-4 bg-amber-950/30 border-b border-amber-500/30 text-xs md:text-sm text-slate-300 flex items-center justify-between gap-4 flex-shrink-0">
                      <div className="space-y-1">
                        <span className="font-bold text-amber-300">Solution Reference:</span>
                        <pre className="font-mono text-xs text-amber-100 whitespace-pre-wrap max-h-24 overflow-y-auto">
                          {activeConcept.solutionCode}
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

                  {/* Code Textarea */}
                  <div className="flex-1 min-h-[180px] bg-[#070A10] overflow-hidden">
                    <textarea
                      value={code}
                      onChange={(e) => setCode(e.target.value)}
                      spellCheck={false}
                      className="w-full h-full p-5 bg-transparent font-mono text-sm md:text-base text-amber-100 placeholder-slate-600 focus:outline-none resize-none leading-relaxed selection:bg-amber-500/30"
                      placeholder="# Write your Python code here..."
                    />
                  </div>

                  {/* Terminal Execution Console */}
                  <div className="h-44 border-t border-white/10 bg-slate-950 p-4 font-mono text-xs md:text-sm overflow-y-auto flex-shrink-0">
                    <div className="flex items-center justify-between text-slate-400 text-xs uppercase mb-2 font-black tracking-wider">
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
                          <pre className="text-red-400 whitespace-pre-wrap leading-relaxed">
                            {execResult.stderr}
                          </pre>
                        )}
                        {execResult.error && (
                          <div className="text-rose-400 font-bold">{execResult.error}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500">
                        Fill in the blanks (<code className="text-amber-400">___</code>) and click &quot;Run &amp; Test Code&quot; below.
                      </span>
                    )}
                  </div>

                  {/* Editor Footer Actions */}
                  <div className="p-4 bg-slate-900/95 border-t border-white/15 flex items-center justify-between gap-3 flex-shrink-0">
                    <span className="text-xs md:text-sm text-slate-300 hidden sm:inline">
                      Fill in the blanks (<code className="text-amber-400 font-bold">___</code>) and run assertions.
                    </span>

                    <div className="flex items-center gap-3 ml-auto">
                      <button
                        type="button"
                        disabled={isRunning}
                        onClick={handleRunAndValidate}
                        className="px-6 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs md:text-sm transition-all flex items-center gap-2 shadow-lg shadow-amber-400/20 disabled:opacity-50"
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
                          className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black text-xs md:text-sm shadow-xl shadow-emerald-500/25 transition-all flex items-center gap-2 animate-pulse"
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
              <div className="flex-1 min-h-0 flex flex-col p-6 md:p-8 space-y-4 overflow-hidden">
                <div className="p-4 rounded-2xl bg-slate-900/90 border border-white/15 flex items-center justify-between gap-3 shadow-md flex-shrink-0">
                  <div className="flex items-center gap-2 text-slate-200 text-sm md:text-base font-bold">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span>Free-Form Scratchpad · Write &amp; Test Any Python Script</span>
                  </div>
                  <button
                    type="button"
                    disabled={isPlaygroundRunning}
                    onClick={handleRunPlayground}
                    className="px-5 py-2 rounded-xl bg-cyan-400 hover:bg-cyan-300 text-zinc-950 font-black text-xs md:text-sm transition-all flex items-center gap-2 shadow-md disabled:opacity-50"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>{isPlaygroundRunning ? "Running..." : "Execute Script"}</span>
                  </button>
                </div>

                <div className="flex-1 min-h-0 flex flex-col rounded-3xl overflow-hidden border border-white/15 bg-slate-950 shadow-2xl">
                  <div className="flex-1 min-h-[220px] bg-[#070A10]">
                    <textarea
                      value={playgroundCode}
                      onChange={(e) => setPlaygroundCode(e.target.value)}
                      spellCheck={false}
                      className="w-full h-full p-5 bg-transparent font-mono text-sm md:text-base text-cyan-100 placeholder-slate-600 focus:outline-none resize-none leading-relaxed selection:bg-cyan-500/30"
                    />
                  </div>

                  <div className="h-48 border-t border-white/10 bg-slate-950 p-4 font-mono text-xs md:text-sm overflow-y-auto flex-shrink-0">
                    <span className="text-slate-400 text-xs uppercase mb-2 font-black tracking-wider block">
                      Execution Output:
                    </span>
                    {isPlaygroundRunning ? (
                      <div className="text-cyan-400 animate-pulse flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 animate-ping" />
                        Running Python code...
                      </div>
                    ) : playgroundResult ? (
                      <div className="space-y-1">
                        {playgroundResult.stdout && (
                          <pre className="text-emerald-400 whitespace-pre-wrap leading-relaxed">
                            {playgroundResult.stdout}
                          </pre>
                        )}
                        {playgroundResult.stderr && (
                          <pre className="text-red-400 whitespace-pre-wrap leading-relaxed">
                            {playgroundResult.stderr}
                          </pre>
                        )}
                      </div>
                    ) : (
                      <span className="text-slate-500">Output will appear here after clicking &quot;Execute Script&quot;.</span>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Module Stepper Bar */}
            <div className="px-6 md:px-8 py-3.5 bg-slate-900/90 border-t border-white/10 flex items-center justify-between gap-3 flex-shrink-0">
              <button
                type="button"
                disabled={selectedModuleIndex === 0}
                onClick={() => {
                  setSelectedModuleIndex(Math.max(0, selectedModuleIndex - 1));
                  setActiveTab("learn");
                }}
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs md:text-sm font-bold transition-all flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none"
              >
                <ChevronLeft className="w-4 h-4" />
                <span>Previous Module</span>
              </button>

              <span className="text-xs md:text-sm font-mono text-slate-400">
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
                className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs md:text-sm font-bold transition-all flex items-center gap-1.5 disabled:opacity-30 disabled:pointer-events-none"
              >
                <span>Next Module</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
