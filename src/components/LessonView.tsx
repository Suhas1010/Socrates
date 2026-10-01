"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  HelpCircle,
  Brain,
  AlertTriangle,
  Lightbulb,
  CheckCircle2,
  XCircle,
  ArrowRight,
  Code2,
  Workflow,
  ChevronLeft,
  ChevronRight,
  Send,
  Zap,
  Calculator,
  BookOpen,
  MessageSquare,
  Compass,
  Check,
  RotateCcw,
} from "lucide-react";
import { useSessionStore } from "@/lib/store";
import { ConceptMap } from "./ConceptMap";
import { CodeSandbox } from "./CodeSandbox";
import { TeachBackModal } from "./TeachBackModal";
import { LiveTestPanel } from "./LiveTestPanel";
import { ErrorType, ExplanationStrategy, Concept } from "@/lib/types";

export const LessonView: React.FC = () => {
  const {
    concepts,
    currentConceptId,
    mastery,
    status,
    teachBackPassed,
    lastDiagnosisCallout,
    submitLessonAnswer,
    completeBuildStep,
    advanceToNextConcept,
    selectConcept,
    clearDiagnosisCallout,
    interests,
    goal,
    background,
    projectParts,
  } = useSessionStore();

  const [activeTab, setActiveTab] = useState<"learn" | "test">("learn");
  const [isMapCollapsed, setIsMapCollapsed] = useState(false);
  const [showVisualMap, setShowVisualMap] = useState(false);
  const [isTeachBackOpen, setIsTeachBackOpen] = useState(false);

  // Socrates AI Question & Answer state
  const [askQuestionText, setAskQuestionText] = useState("");
  const [isAskingSocrates, setIsAskingSocrates] = useState(false);
  const [socratesAnswer, setSocratesAnswer] = useState<{
    title: string;
    explanation: string;
    exampleOrFormula?: string;
    takeaway?: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "test") {
        setActiveTab("test");
      }
    }
  }, []);

  // Predict question state
  const [selectedPredictOption, setSelectedPredictOption] = useState<number | null>(null);
  const [isPredictSubmitted, setIsPredictSubmitted] = useState(false);
  const [predictResult, setPredictResult] = useState<{
    correct: boolean;
    errorType: ErrorType;
    diagnosis: string;
    strategy: ExplanationStrategy;
    matchedExplanation: string;
    rootCauseId?: string;
  } | null>(null);

  const currentConcept =
    concepts.find((c) => c.id === currentConceptId) || concepts[0];

  useEffect(() => {
    setSelectedPredictOption(null);
    setIsPredictSubmitted(false);
    setPredictResult(null);
    setSocratesAnswer(null);
    setAskQuestionText("");
  }, [currentConceptId]);

  const currentStatus = status[currentConcept.id] || "unseen";
  const isMastered = currentStatus === "mastered";
  const isCodePassed = projectParts.some((p) => p.conceptId === currentConcept.id);

  const getFriendlyStatus = (st: string) => {
    switch (st) {
      case "mastered":
        return "Mastered! ✨";
      case "shaky":
        return "Needs Review";
      case "learning":
        return "In Progress";
      default:
        return "Not Started";
    }
  };

  const getFriendlyErrorTitle = (err: ErrorType) => {
    switch (err) {
      case "CONCEPTUAL_GAP":
        return "Tutor Coaching: Key Concept Clarification";
      case "TERMINOLOGY_CONFUSION":
        return "Tutor Coaching: Word & Term Clarification";
      case "CALCULATION_SLIP":
        return "Tutor Coaching: Quick Math / Number Check";
      case "OVERCONFIDENT_MISCONCEPTION":
        return "Tutor Coaching: Common Misconception Alert";
      default:
        return "Tutor Coaching Tip";
    }
  };

  const getFriendlyStrategy = (strat: ExplanationStrategy) => {
    switch (strat) {
      case "analogy":
        return "Helpful Analogy";
      case "contrast":
        return "Compare & Contrast";
      case "worked_example":
        return "Step-by-Step Example";
      case "counterexample":
        return "Clarifying Example";
      default:
        return "Intuitive Tip";
    }
  };

  const predictQuestion = currentConcept.predictQuestion || {
    prompt: `What is the key intuition behind ${currentConcept.title}?`,
    options: [
      "It transforms inputs into mathematically bounded evidence.",
      "It is an arbitrary trick that only applies to small numbers.",
      "It requires infinite compute to run.",
      "It eliminates the need for any training data.",
    ],
    correctIndex: 0,
    explanation:
      "Every machine learning component converts unstructured inputs into bounded mathematical evidence.",
  };

  const handlePredictSubmit = async (optionIdx: number) => {
    setSelectedPredictOption(optionIdx);
    setIsPredictSubmitted(true);

    const isCorrect = optionIdx === predictQuestion.correctIndex;
    const chosenText = predictQuestion.options[optionIdx];

    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept: currentConcept,
          question: predictQuestion.prompt,
          answer: chosenText,
        }),
      });
      const data = await res.json();

      const evaluation = {
        correct: isCorrect,
        errorType: isCorrect ? ("NONE" as ErrorType) : data.errorType || "CONCEPTUAL_GAP",
        diagnosis: isCorrect
          ? "Spot on intuition! You grasped the foundational concept."
          : data.diagnosis || "Identified a gap in the mental model.",
        strategy: (data.strategy as ExplanationStrategy) || "analogy",
        matchedExplanation:
          data.matchedExplanation ||
          "Let's review the concrete relationship in the project data.",
        rootCauseId: data.rootCauseConceptId,
      };

      setPredictResult(evaluation);

      submitLessonAnswer({
        conceptId: currentConcept.id,
        isCorrect,
        errorType: evaluation.errorType,
        diagnosis: evaluation.diagnosis,
        strategy: evaluation.strategy,
        matchedExplanation: evaluation.matchedExplanation,
        rootCauseConceptId: evaluation.rootCauseId,
      });
    } catch (err) {
      console.error("Evaluate error:", err);
      const evaluation = {
        correct: isCorrect,
        errorType: isCorrect ? ("NONE" as ErrorType) : "CONCEPTUAL_GAP",
        diagnosis: isCorrect
          ? "Spot on! That is the core mathematical principle."
          : "Identified a conceptual misunderstanding of the decision rule.",
        strategy: "analogy" as ExplanationStrategy,
        matchedExplanation:
          "Think of how you assess probability in daily life: you balance prior experience with new evidence.",
        rootCauseId: currentConcept.prereqs[0],
      };
      setPredictResult(evaluation);
      submitLessonAnswer({
        conceptId: currentConcept.id,
        isCorrect,
        errorType: evaluation.errorType,
        diagnosis: evaluation.diagnosis,
        strategy: evaluation.strategy,
        matchedExplanation: evaluation.matchedExplanation,
        rootCauseConceptId: evaluation.rootCauseId,
      });
    }
  };

  // Handle Ask Socrates question
  const handleAskSocrates = async (queryText?: string) => {
    const q = (queryText || askQuestionText).trim();
    if (!q) return;

    setIsAskingSocrates(true);
    setAskQuestionText(q);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept: currentConcept,
          question: q,
          background,
          goal: goal || "a spam classifier",
        }),
      });

      if (!res.ok) throw new Error("Failed to get Socrates response");
      const data = await res.json();
      setSocratesAnswer(data);
    } catch (err) {
      console.error("Ask Socrates error:", err);
      setSocratesAnswer({
        title: "Socrates Intuitive Coaching",
        explanation:
          currentConcept.corePrinciple ||
          "In machine learning, we transform raw unstructured data into numerical signals and evaluate likelihoods to make accurate decisions.",
        exampleOrFormula: currentConcept.workedExample
          ? currentConcept.workedExample.scenario
          : "P(A | B) = P(B | A) * P(A) / P(B)",
        takeaway: "Every AI algorithm is a pipeline turning data into certainty.",
      });
    } finally {
      setIsAskingSocrates(false);
    }
  };

  const currentIndex = concepts.findIndex((c) => c.id === currentConcept.id);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden px-3 py-2 md:px-4 md:py-2.5 bg-[#0b0a08]">
      {/* Top concept header bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 mb-2 border-b border-gold/15 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/25">
              Step {currentIndex + 1} of {concepts.length}
            </span>
            <span
              className={`text-xs font-mono px-2.5 py-1 rounded-md border font-semibold ${
                isMastered
                  ? "bg-emerald-950/70 border-emerald-500/50 text-emerald-300"
                  : currentStatus === "shaky"
                  ? "bg-red-950/70 border-red-500/50 text-red-300"
                  : "bg-amber-950/70 border-amber-500/50 text-amber-300"
              }`}
            >
              {getFriendlyStatus(currentStatus)}
            </span>
          </div>

          <h1 className="text-lg md:text-xl font-extrabold text-white truncate max-w-md sm:max-w-xl">
            {currentConcept.title}
          </h1>
        </div>

        {/* Tab switcher: Learn vs Live Test Panel + Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="flex items-center gap-1 bg-[#14130F] p-1 rounded-xl border border-gold/15">
            <button
              type="button"
              onClick={() => setActiveTab("learn")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "learn"
                  ? "bg-amber-400 text-zinc-950 shadow font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Studio &amp; Code</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("test")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "test"
                  ? "bg-amber-400 text-zinc-950 shadow font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              <span>Model Tester</span>
            </button>
          </div>

          {/* Quick Teach Back & Next Step in header */}
          {activeTab === "learn" && (
            <div className="hidden md:flex items-center gap-2">
              {isCodePassed && !isMastered && (
                <button
                  type="button"
                  onClick={() => setIsTeachBackOpen(true)}
                  className="px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Explain &amp; Earn Mastered ✨</span>
                </button>
              )}

              <button
                type="button"
                onClick={advanceToNextConcept}
                className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-bold text-xs shadow-md transition-all flex items-center gap-1"
              >
                <span>Next</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Studio Area */}
      {activeTab === "test" ? (
        <div className="flex-1 overflow-y-auto">
          <LiveTestPanel />
        </div>
      ) : (
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-3 overflow-hidden">
          {/* PANE 1: Roadmap Steps Navigator */}
          <div
            className={`transition-all duration-300 h-full flex flex-col min-h-0 ${
              isMapCollapsed ? "lg:col-span-1" : "lg:col-span-3"
            }`}
          >
            <div className="glass-panel p-3 rounded-2xl border border-gold/15 shadow-xl h-full flex flex-col overflow-hidden">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-gold/10 flex-shrink-0">
                {!isMapCollapsed && (
                  <div className="flex items-center gap-2">
                    <Workflow className="w-4 h-4 text-amber-300" />
                    <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                      Roadmap
                    </span>
                    <span className="text-[11px] font-mono text-zinc-400 ml-1">
                      ({concepts.filter((c) => status[c.id] === "mastered").length}/{concepts.length})
                    </span>
                  </div>
                )}

                <div className="flex items-center gap-1 ml-auto">
                  {!isMapCollapsed && (
                    <button
                      type="button"
                      onClick={() => setShowVisualMap(!showVisualMap)}
                      className={`text-[10px] px-2 py-0.5 rounded font-mono border transition-all ${
                        showVisualMap
                          ? "bg-amber-400 text-zinc-950 border-amber-300 font-bold"
                          : "text-zinc-400 border-zinc-700 hover:text-white"
                      }`}
                    >
                      {showVisualMap ? "List" : "Graph"}
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={() => setIsMapCollapsed(!isMapCollapsed)}
                    className="p-1 rounded hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 transition-colors"
                    title={isMapCollapsed ? "Expand roadmap" : "Collapse roadmap"}
                  >
                    {isMapCollapsed ? (
                      <ChevronRight className="w-4 h-4" />
                    ) : (
                      <ChevronLeft className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {!isMapCollapsed ? (
                showVisualMap ? (
                  <div className="flex-1 rounded-xl overflow-hidden border border-white/5 min-h-0">
                    <ConceptMap interactive={true} className="h-full w-full" />
                  </div>
                ) : (
                  <div className="flex-1 overflow-y-auto space-y-1.5 pr-1 min-h-0">
                    {concepts.map((c, idx) => {
                      const isSelected = c.id === currentConcept.id;
                      const cStatus = status[c.id] || "unseen";
                      const isStepMastered = cStatus === "mastered";

                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => selectConcept(c.id)}
                          className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-start gap-2.5 ${
                            isSelected
                              ? "bg-amber-500/15 border-amber-400/60 shadow-md ring-1 ring-amber-400/30"
                              : isStepMastered
                              ? "bg-emerald-950/20 border-emerald-500/20 hover:border-emerald-500/40 text-zinc-300"
                              : "bg-[#14130F] border-gold/10 hover:border-gold/25 text-zinc-400"
                          }`}
                        >
                          <div className="flex-shrink-0 mt-0.5">
                            {isStepMastered ? (
                              <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-400/60 flex items-center justify-center text-emerald-300">
                                <Check className="w-3 h-3 stroke-[3]" />
                              </div>
                            ) : (
                              <div
                                className={`w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-mono ${
                                  isSelected
                                    ? "bg-amber-400 text-zinc-950 border-amber-300 font-bold"
                                    : "border-zinc-700 text-zinc-400 bg-zinc-900"
                                }`}
                              >
                                {idx + 1}
                              </div>
                            )}
                          </div>

                          <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between gap-1">
                              <span
                                className={`text-xs font-semibold truncate ${
                                  isSelected ? "text-amber-200" : "text-zinc-200"
                                }`}
                              >
                                {c.title}
                              </span>
                            </div>
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className="text-[10px] text-zinc-400 font-mono truncate">
                                {c.buildStep}
                              </span>
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                )
              ) : (
                <div className="flex-1 flex flex-col items-center justify-center gap-4 py-4 text-center">
                  <span className="text-[11px] font-mono text-zinc-500 [writing-mode:vertical-rl] tracking-wider uppercase">
                    Roadmap ({concepts.length} Steps)
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* PANE 2: Deep AI Theory, Math, Worked Examples & Ask Socrates AI */}
          <div
            className={`h-full flex flex-col min-h-0 overflow-y-auto pr-1 space-y-3.5 ${
              isMapCollapsed ? "lg:col-span-6" : "lg:col-span-5"
            }`}
          >
            {/* 1. Curiosity Warm-Up Hook */}
            <div className="glass-panel p-4 rounded-2xl border border-gold/15 shadow-xl space-y-2 relative overflow-hidden flex-shrink-0">
              <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-300">
                <Lightbulb className="w-4 h-4 text-amber-300 animate-pulse flex-shrink-0" />
                <span className="font-bold">Ponder This 🤔 (Warm-Up Intuition)</span>
              </div>
              <p className="text-base font-semibold text-white leading-relaxed">
                &quot;{currentConcept.hook}&quot;
              </p>
              {currentConcept.explanationSummary && (
                <p className="text-xs text-zinc-300 leading-relaxed border-t border-gold/10 pt-2">
                  {currentConcept.explanationSummary}
                </p>
              )}
            </div>

            {/* 2. Deep Core AI Principle (Rigorous AI Theory) */}
            {currentConcept.corePrinciple && (
              <div className="glass-panel p-4 rounded-2xl border border-gold/20 shadow-xl space-y-2.5 flex-shrink-0 bg-[#14130F]">
                <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-amber-300">
                  <Brain className="w-4 h-4 text-amber-300 flex-shrink-0" />
                  <span className="font-bold">Core AI Mathematical Principle</span>
                </div>
                <div className="text-sm text-zinc-200 leading-relaxed">
                  {currentConcept.corePrinciple}
                </div>
                {currentConcept.whyItMatters && (
                  <div className="bg-amber-950/20 border-l-2 border-amber-400 p-2.5 rounded-r-xl text-xs text-amber-200/90 leading-relaxed">
                    <span className="font-bold text-amber-300 block mb-0.5">
                      Why this matters in real AI systems:
                    </span>
                    {currentConcept.whyItMatters}
                  </div>
                )}
              </div>
            )}

            {/* 3. Step-by-Step Worked Mathematical Example with Real Dataset Numbers */}
            {currentConcept.workedExample && (
              <div className="glass-panel p-4 rounded-2xl border border-emerald-500/30 bg-emerald-950/10 shadow-xl space-y-2.5 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-300 font-bold">
                    <Calculator className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                    <span>Worked Math Example (Dataset Calculations)</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded">
                    Real Numbers
                  </span>
                </div>

                <div className="text-xs text-zinc-200 font-semibold bg-zinc-950/70 p-2.5 rounded-xl border border-white/5">
                  <span className="text-emerald-300 font-bold mr-1">Scenario:</span>
                  {currentConcept.workedExample.scenario}
                </div>

                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono uppercase text-zinc-400 tracking-wider block">
                    Calculation Steps:
                  </span>
                  <div className="space-y-1 font-mono text-xs bg-zinc-950/80 p-3 rounded-xl border border-emerald-500/20">
                    {currentConcept.workedExample.calculationSteps.map((step, sIdx) => (
                      <div key={sIdx} className="text-emerald-200/90 flex items-start gap-2">
                        <span className="text-emerald-400 font-bold flex-shrink-0">›</span>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-emerald-900/20 border border-emerald-500/40 p-2.5 rounded-xl text-xs text-emerald-200">
                  <span className="font-bold text-emerald-300 block mb-0.5">Takeaway:</span>
                  {currentConcept.workedExample.takeaway}
                </div>
              </div>
            )}

            {/* 4. Interactive "Ask Socrates AI" (Live Gemini Guidance) */}
            <div className="glass-panel p-4 rounded-2xl border border-gold/25 shadow-xl space-y-3 flex-shrink-0 bg-gradient-to-b from-[#181611] to-[#12110D]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center">
                    <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  </div>
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Ask Socrates AI (Live Tutor)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-amber-300/80">
                  Powered by Gemini 2.5
                </span>
              </div>

              {/* Quick Prompt Chips */}
              <div className="flex flex-wrap gap-1.5">
                <button
                  type="button"
                  onClick={() => handleAskSocrates("Explain the mathematical intuition with an everyday analogy")}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-gold/15 transition-all"
                >
                  💡 Analogy
                </button>
                <button
                  type="button"
                  onClick={() => handleAskSocrates("Show me the exact mathematical formula and step-by-step numbers")}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-gold/15 transition-all"
                >
                  📐 Exact Formula
                </button>
                <button
                  type="button"
                  onClick={() => handleAskSocrates("How does modern AI / ChatGPT / LLMs use this exact principle?")}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-gold/15 transition-all"
                >
                  🤖 LLM Connection
                </button>
                <button
                  type="button"
                  onClick={() => handleAskSocrates("Explain this step in terms of C++/Java programming paradigms")}
                  className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-gold/15 transition-all"
                >
                  ☕ C++/Java View
                </button>
              </div>

              {/* Custom Question Input */}
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAskSocrates();
                }}
                className="flex items-center gap-2"
              >
                <input
                  type="text"
                  value={askQuestionText}
                  onChange={(e) => setAskQuestionText(e.target.value)}
                  placeholder="Ask Socrates any question about this step..."
                  className="flex-1 bg-zinc-950/80 border border-gold/20 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="submit"
                  disabled={isAskingSocrates || !askQuestionText.trim()}
                  className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs transition-all disabled:opacity-50 flex items-center gap-1"
                >
                  {isAskingSocrates ? (
                    <span className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Send className="w-3.5 h-3.5" />
                  )}
                  <span>Ask</span>
                </button>
              </form>

              {/* Socrates Answer Bubble */}
              {socratesAnswer && (
                <div className="p-3.5 rounded-xl bg-[#090D15] border border-amber-500/30 space-y-2 animate-in fade-in duration-300 text-xs">
                  <div className="flex items-center justify-between text-amber-300 font-bold">
                    <span>{socratesAnswer.title}</span>
                    <button
                      type="button"
                      onClick={() => setSocratesAnswer(null)}
                      className="text-zinc-500 hover:text-zinc-300 text-[10px]"
                    >
                      Clear
                    </button>
                  </div>
                  <p className="text-zinc-200 leading-relaxed">
                    {socratesAnswer.explanation}
                  </p>
                  {socratesAnswer.exampleOrFormula && (
                    <pre className="font-mono text-[11px] bg-zinc-950/80 p-2.5 rounded-lg border border-white/5 text-amber-200 whitespace-pre-wrap">
                      {socratesAnswer.exampleOrFormula}
                    </pre>
                  )}
                  {socratesAnswer.takeaway && (
                    <div className="text-[11px] text-zinc-300 bg-amber-500/10 p-2 rounded border border-amber-500/20">
                      <strong className="text-amber-300">Takeaway: </strong>
                      {socratesAnswer.takeaway}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 5. Predict Before Coding Challenge */}
            <div className="glass-panel p-4 rounded-2xl border border-gold/15 shadow-xl space-y-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-amber-300 flex-shrink-0" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Predict Before Coding
                  </h3>
                </div>
                <span className="text-[10px] text-zinc-400">
                  Active Recall Check
                </span>
              </div>
              <p className="text-xs font-medium text-zinc-200">
                {predictQuestion.prompt}
              </p>

              {/* Options */}
              <div className="space-y-2">
                {predictQuestion.options.map((opt, idx) => {
                  const isSelected = selectedPredictOption === idx;
                  const isCorrectAnswer = idx === predictQuestion.correctIndex;
                  const showFeedback = isPredictSubmitted;

                  let borderClass = "border-white/5 hover:border-gold/30";
                  let bgClass = "bg-zinc-900/60";

                  if (showFeedback) {
                    if (isCorrectAnswer) {
                      borderClass = "border-emerald-500/80 ring-1 ring-emerald-500/30";
                      bgClass = "bg-emerald-950/40 text-emerald-200";
                    } else if (isSelected && !isCorrectAnswer) {
                      borderClass = "border-red-500/80 ring-1 ring-red-500/30";
                      bgClass = "bg-red-950/40 text-red-200";
                    }
                  } else if (isSelected) {
                    borderClass = "border-amber-400 ring-1 ring-amber-400/40";
                    bgClass = "bg-amber-500/15 text-white";
                  }

                  return (
                    <button
                      key={idx}
                      type="button"
                      disabled={isPredictSubmitted}
                      onClick={() => handlePredictSubmit(idx)}
                      className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs font-medium leading-relaxed flex items-start gap-2.5 ${borderClass} ${bgClass}`}
                    >
                      <span className="w-4 h-4 rounded-full border border-zinc-600 flex items-center justify-center flex-shrink-0 text-[10px] font-mono mt-0.5">
                        {String.fromCharCode(65 + idx)}
                      </span>
                      <span>{opt}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Error diagnosis callout if wrong */}
            {predictResult && !predictResult.correct && (
              <div className="p-4 rounded-2xl bg-red-950/30 border border-red-500/50 shadow-xl space-y-2.5 animate-in fade-in duration-300 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />
                    <span className="text-xs font-mono uppercase font-bold text-red-300">
                      {getFriendlyErrorTitle(predictResult.errorType)}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono uppercase bg-red-900/60 text-red-200 px-2 py-0.5 rounded border border-red-500/40">
                    {getFriendlyStrategy(predictResult.strategy)}
                  </span>
                </div>

                <div className="text-xs font-semibold text-white">
                  &quot;{predictResult.diagnosis}&quot;
                </div>

                <div className="text-xs text-zinc-300 bg-zinc-950/60 p-2.5 rounded-xl border border-white/5 leading-relaxed">
                  <span className="text-amber-300 font-semibold block mb-0.5">
                    Helpful Explanation:
                  </span>
                  {predictResult.matchedExplanation}
                </div>

                {predictResult.rootCauseId &&
                  predictResult.rootCauseId !== currentConcept.id && (
                    <div className="pt-2 border-t border-red-500/20 flex items-center justify-between gap-2">
                      <span className="text-xs text-red-300">
                        Refresher on{" "}
                        <strong className="text-white">
                          {concepts.find((c) => c.id === predictResult.rootCauseId)?.title ||
                            predictResult.rootCauseId}
                        </strong>
                        ?
                      </span>
                      <button
                        type="button"
                        onClick={() => selectConcept(predictResult.rootCauseId!)}
                        className="text-xs px-2.5 py-1 rounded-lg bg-red-600 hover:bg-red-500 text-white font-bold transition-all shadow"
                      >
                        Revisit Step &rarr;
                      </button>
                    </div>
                  )}
              </div>
            )}
          </div>

          {/* PANE 3: Hands-On Code Sandbox Studio */}
          <div
            className={`h-full flex flex-col min-h-0 overflow-hidden ${
              isMapCollapsed ? "lg:col-span-5" : "lg:col-span-4"
            }`}
          >
            <div className="h-full flex flex-col min-h-0">
              <CodeSandbox
                concept={currentConcept}
                isAlreadyPassed={isCodePassed}
                onStepPassed={(code) => {
                  completeBuildStep(currentConcept.id, code);
                }}
                onOpenTeachBack={() => setIsTeachBackOpen(true)}
              />
            </div>
          </div>
        </div>
      )}

      {/* Teach Back Modal */}
      <TeachBackModal
        concept={currentConcept}
        isOpen={isTeachBackOpen}
        onClose={() => setIsTeachBackOpen(false)}
        onMastered={() => advanceToNextConcept()}
      />
    </div>
  );
};
