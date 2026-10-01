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
  X,
  Layers,
} from "lucide-react";
import { useSessionStore } from "@/lib/store";
import { ConceptMap } from "./ConceptMap";
import { CodeSandbox } from "./CodeSandbox";
import { TeachBackModal } from "./TeachBackModal";
import { LiveTestPanel } from "./LiveTestPanel";
import { AssembledProjectView } from "./AssembledProjectView";
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
    templateId,
    learningPhase,
    learningTrack,
    setLearningPhase,
    setLearningTrack,
  } = useSessionStore();

  const safeGoal = goal?.trim() || "Your AI Project";

  const [activeTab, setActiveTab] = useState<"learn" | "assembled" | "test">("learn");
  const [selectedPredictOption, setSelectedPredictOption] = useState<number | null>(null);
  const [isMapCollapsed, setIsMapCollapsed] = useState(false);
  const [showVisualMap, setShowVisualMap] = useState(false);
  const [isTeachBackOpen, setIsTeachBackOpen] = useState(false);
  const [isSocratesDrawerOpen, setIsSocratesDrawerOpen] = useState(false);

  // Socrates AI Question & Answer state
  const [askQuestionText, setAskQuestionText] = useState("");
  const [isAskingSocrates, setIsAskingSocrates] = useState(false);
  const [socratesAnswer, setSocratesAnswer] = useState<{
    title: string;
    explanation: string;
    exampleOrFormula?: string;
    takeaway?: string;
  } | null>(null);

  // Grounded Prediction State
  const [predInputs, setPredInputs] = useState("");
  const [predTarget, setPredTarget] = useState("");
  const [isPredictChecked, setIsPredictChecked] = useState(false);
  const [predictSuccess, setPredictSuccess] = useState<string | null>(null);

  // Active Diagnosis Callout (from prediction or code run)
  const [activeDiagnosis, setActiveDiagnosis] = useState<{
    errorType: ErrorType;
    diagnosis: string;
    strategy: ExplanationStrategy;
    matchedExplanation: string;
    rootCauseId?: string;
  } | null>(null);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("tab") === "test") {
        setActiveTab("test");
      }
    }
  }, []);

  const currentConcept =
    concepts.find((c) => c.id === currentConceptId) || concepts[0];

  useEffect(() => {
    setPredInputs("");
    setPredTarget("");
    setIsPredictChecked(false);
    setPredictSuccess(null);
    setActiveDiagnosis(null);
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
        return "Diagnosis: CONCEPTUAL GAP";
      case "TERMINOLOGY_CONFUSION":
        return "Diagnosis: TERMINOLOGY CONFUSION";
      case "CALCULATION_SLIP":
        return "Diagnosis: CALCULATION SLIP";
      case "OVERCONFIDENT_MISCONCEPTION":
        return "Diagnosis: OVERCONFIDENT MISCONCEPTION";
      default:
        return "Diagnosis: COACHING TIP";
    }
  };

  const getFriendlyStrategy = (strat: ExplanationStrategy) => {
    switch (strat) {
      case "analogy":
        return "Helpful Analogy";
      case "contrast":
        return "Compare & Contrast";
      case "worked_example":
        return "Worked Example";
      case "counterexample":
        return "Clarifying Counterexample";
      default:
        return "Intuitive Tip";
    }
  };

  // Domain flags
  const lowerGoal = (goal || "").toLowerCase();
  const isEmotionOrFace =
    lowerGoal.includes("emotion") ||
    lowerGoal.includes("face") ||
    lowerGoal.includes("facial") ||
    lowerGoal.includes("expression") ||
    lowerGoal.includes("smile") ||
    lowerGoal.includes("mood");

  const isMedical =
    lowerGoal.includes("diabet") ||
    lowerGoal.includes("disease") ||
    lowerGoal.includes("cancer") ||
    lowerGoal.includes("medical") ||
    lowerGoal.includes("patient") ||
    lowerGoal.includes("health") ||
    lowerGoal.includes("heart") ||
    lowerGoal.includes("clinic");

  const isRealEstate =
    templateId === "real-estate" ||
    lowerGoal.includes("real estate") ||
    lowerGoal.includes("house") ||
    lowerGoal.includes("housing") ||
    lowerGoal.includes("property") ||
    lowerGoal.includes("price prediction");

  const isSpam =
    templateId === "spam-classifier" ||
    lowerGoal.includes("spam") ||
    lowerGoal.includes("email") ||
    lowerGoal.includes("bayes");

  // Handle Multiple-Choice Prediction Selection
  const handleSelectPredictOption = (optIdx: number) => {
    setSelectedPredictOption(optIdx);
    const pq = currentConcept?.predictQuestion;
    if (!pq) return;

    if (optIdx === pq.correctIndex) {
      setPredictSuccess(`Spot-on intuition! ${pq.explanation}`);
      setActiveDiagnosis(null);
    } else {
      setPredictSuccess(null);
      setActiveDiagnosis({
        errorType: "CONCEPTUAL_GAP",
        diagnosis: "Not quite — consider the underlying mathematical relationship.",
        strategy: "contrast",
        matchedExplanation: pq.explanation,
      });
    }
  };

  // Grounded Prediction Submission Handler
  const handleCheckPrediction = async () => {
    setIsPredictChecked(true);
    setPredictSuccess(null);
    setActiveDiagnosis(null);

    const inputVal = predInputs.trim().toLowerCase();
    const targetVal = predTarget.trim().toLowerCase();

    // Check for target leakage
    if (
      inputVal.includes("price") ||
      inputVal.includes("target") ||
      inputVal.includes("diabetes") ||
      inputVal.includes("diagnosis") ||
      inputVal.includes("spam")
    ) {
      const diag = {
        errorType: "CONCEPTUAL_GAP" as ErrorType,
        diagnosis: "Target Leakage: The prediction target cannot be included in the input features list!",
        strategy: "analogy" as ExplanationStrategy,
        matchedExplanation:
          "Think of taking an exam with the answers already printed on the question sheet. If the model is fed the target as an input, it never learns how features influence outcomes — it simply memorizes the target directly!",
      };
      setActiveDiagnosis(diag);
      return;
    }

    // Check for classification confusion on regression projects
    if (isRealEstate && (targetVal.includes("classification") || targetVal.includes("category"))) {
      const diag = {
        errorType: "TERMINOLOGY_CONFUSION" as ErrorType,
        diagnosis: "Terminology Confusion: Home prices are continuous numbers along a spectrum (regression), not discrete categories (classification).",
        strategy: "contrast" as ExplanationStrategy,
        matchedExplanation: "Contrast regression with classification: Classification sorts inputs into discrete buckets (like positive or negative). Regression predicts a continuous numeric quantity (like $250,000 for a house).",
      };
      setActiveDiagnosis(diag);
      return;
    }

    // Domain checks
    if (isMedical) {
      const hasMedicalInputs = inputVal.includes("glucose") || inputVal.includes("bmi") || inputVal.includes("age") || inputVal.includes("vital") || inputVal.includes("feature");
      const hasMedicalTarget = targetVal.includes("diabet") || targetVal.includes("disease") || targetVal.includes("positive") || targetVal.includes("class") || targetVal.includes("diagnosis") || targetVal.includes("risk");
      if (hasMedicalInputs && hasMedicalTarget) {
        setPredictSuccess("Spot on intuition! The model observes patient vitals ['glucose', 'bmi', 'age'] and predicts clinical diagnosis. Now fill in the code blanks below!");
        return;
      }
    } else if (isRealEstate) {
      const hasInputs = inputVal.includes("sqft") || inputVal.includes("bed") || inputVal.includes("feature");
      const hasTarget = targetVal.includes("price") || targetVal.includes("value") || targetVal.includes("cost") || targetVal.includes("dollar");
      if (hasInputs && hasTarget) {
        setPredictSuccess("Spot on intuition! The model takes in ['sqft', 'bedrooms'] and predicts the continuous 'price'. Now fill in the blanks in the code cell below!");
        return;
      }
    } else {
      if (inputVal.length > 2 && targetVal.length > 2) {
        setPredictSuccess(`Spot on intuition! Model observes features [${predInputs}] and learns to predict [${predTarget}]. Now fill in the blanks below!`);
        return;
      }
    }

    // Fallback evaluate
    try {
      const res = await fetch("/api/evaluate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          concept: currentConcept,
          question: `What should go in inputs and target for ${goal || "the project"}?`,
          answer: `inputs: ${predInputs}, target: ${predTarget}`,
        }),
      });
      const data = await res.json();
      setActiveDiagnosis({
        errorType: data.errorType || "CONCEPTUAL_GAP",
        diagnosis: data.diagnosis || "Check what features are observable beforehand vs what is being predicted.",
        strategy: data.strategy || "analogy",
        matchedExplanation: data.matchedExplanation || "Inputs are what you observe and target is the value to predict.",
      });
    } catch (err) {
      setActiveDiagnosis({
        errorType: "CONCEPTUAL_GAP",
        diagnosis: "Remember: Inputs are observable features known beforehand, and Target is the single outcome being predicted.",
        strategy: "analogy",
        matchedExplanation: "Consider the project spec: features in the inputs must never contain the target answer.",
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
          goal: goal || "Real estate price prediction",
        }),
      });

      if (!res.ok) throw new Error("Failed to get Socrates response");
      const data = await res.json();
      setSocratesAnswer(data);
    } catch (err) {
      console.error("Ask Socrates error:", err);
      setSocratesAnswer({
        title: "Socrates Coaching",
        explanation:
          currentConcept.corePrinciple ||
          "In machine learning, we map observable inputs to continuous target quantities using mathematical optimization.",
        exampleOrFormula: "predicted_price = (w_sqft * sqft) + (w_beds * beds) + bias",
        takeaway: "Inputs are features; target is the prediction outcome.",
      });
    } finally {
      setIsAskingSocrates(false);
    }
  };

  const currentIndex = concepts.findIndex((c) => c.id === currentConcept.id);

  return (
    <div className="w-full h-full flex flex-col overflow-hidden px-3 py-2 md:px-5 md:py-3 bg-[#0b0a08] relative">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2.5 mb-2 border-b border-gold/15 flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono uppercase tracking-wider text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-md border border-amber-500/25 font-bold">
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

          <h1 className="text-base md:text-lg font-extrabold text-white truncate max-w-md sm:max-w-xl">
            {currentConcept.title}
          </h1>
        </div>

        {/* Tab switcher + Ask Socrates AI Button + Advance */}
        <div className="flex items-center gap-2.5 flex-shrink-0">
          <button
            type="button"
            onClick={() => setIsSocratesDrawerOpen(!isSocratesDrawerOpen)}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-amber-300 font-bold text-xs border border-amber-500/30 transition-all flex items-center gap-1.5 shadow"
          >
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Ask Socrates AI ✨</span>
          </button>

          <div className="flex items-center gap-1.5 bg-[#14130F] p-1 rounded-xl border border-gold/25 shadow-inner">
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
              <span>Step Studio</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab("assembled")}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                activeTab === "assembled"
                  ? "bg-amber-400 text-zinc-950 shadow font-bold"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>Built Model</span>
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full border ${
                activeTab === "assembled"
                  ? "bg-zinc-950/20 text-zinc-950 border-zinc-950/30 font-bold"
                  : "bg-amber-400/10 text-amber-300 border-amber-400/25"
              }`}>
                {projectParts.length}/{concepts.length}
              </span>
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
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </button>
          </div>

          {isCodePassed && !isMastered && (
            <button
              type="button"
              onClick={() => setIsTeachBackOpen(true)}
              className="hidden md:flex px-3 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all items-center gap-1.5 shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Teach Socrates ✨</span>
            </button>
          )}

          <button
            type="button"
            onClick={advanceToNextConcept}
            className="px-3.5 py-1.5 rounded-lg bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-bold text-xs shadow-md transition-all flex items-center gap-1"
          >
            <span>Next Step</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* 2-Phase Learning Journey Bar & Python Track Toggle */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2.5 px-4 py-2 rounded-2xl bg-zinc-950/80 border border-white/10 mb-2.5 shadow-md flex-shrink-0">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center p-1 rounded-xl bg-zinc-900 border border-white/10">
            <button
              type="button"
              onClick={() => setLearningPhase("theory")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                learningPhase === "theory"
                  ? "bg-cyan-500 text-black shadow-md shadow-cyan-500/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Brain className="w-3.5 h-3.5" />
              <span>Phase 1: ML/DL Theory</span>
            </button>
            <button
              type="button"
              onClick={() => setLearningPhase("building")}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                learningPhase === "building"
                  ? "bg-amber-400 text-black shadow-md shadow-amber-400/20"
                  : "text-zinc-400 hover:text-white"
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Phase 2: Project Building</span>
            </button>
          </div>

          <span className="text-[11px] text-zinc-400 hidden lg:inline">
            {learningPhase === "theory"
              ? "Master mathematical and intuitive foundations before writing code."
              : "Implement the pipeline in Python, fill blanks, and test live."}
          </span>
        </div>

        {/* Python Track Switcher */}
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() =>
              setLearningTrack(
                learningTrack === "python_foundation" ? "project" : "python_foundation"
              )
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 border ${
              learningTrack === "python_foundation"
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-500/10"
                : "bg-zinc-900/90 text-zinc-300 hover:text-white border-white/10"
            }`}
          >
            <span>🐍</span>
            <span>
              {learningTrack === "python_foundation"
                ? "Return to AI Project"
                : "Need Python Basics?"}
            </span>
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      {activeTab === "test" ? (
        <div className="flex-1 overflow-y-auto">
          <LiveTestPanel />
        </div>
      ) : activeTab === "assembled" ? (
        <div className="flex-1 overflow-y-auto">
          <AssembledProjectView />
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
                            <span
                              className={`text-xs font-semibold block truncate ${
                                isSelected ? "text-amber-200" : "text-zinc-200"
                              }`}
                            >
                              {c.title}
                            </span>
                            <span className="text-[10px] text-zinc-400 font-mono block truncate mt-0.5">
                              {c.buildStep}
                            </span>
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

          {/* ACTIVE STUDIO AREA: Attempt First -> Hook -> Grounded Prediction -> Code with Real Blanks -> Typed Diagnosis */}
          <div
            className={`h-full flex flex-col min-h-0 overflow-y-auto pr-1 space-y-3 ${
              isMapCollapsed ? "lg:col-span-11" : "lg:col-span-9"
            }`}
          >
            {learningPhase === "theory" ? (
              /* ========================================================================= */
              /* PHASE 1: ML / DEEP LEARNING THEORY & CONCEPTUAL FOUNDATIONS               */
              /* ========================================================================= */
              <div className="space-y-4 pb-6">
                {/* 1. Curiosity Inquiry (Hook) */}
                <div className="p-4 rounded-2xl bg-[#14130F] border border-cyan-500/30 flex items-start gap-3 shadow-lg">
                  <Lightbulb className="w-5 h-5 text-cyan-400 animate-pulse flex-shrink-0 mt-0.5" />
                  <div>
                    <span className="text-xs font-mono uppercase text-cyan-400 font-bold block mb-1">
                      Curiosity Inquiry (Hook):
                    </span>
                    <p className="text-sm font-medium text-zinc-100 leading-relaxed">
                      {currentConcept.hook}
                    </p>
                  </div>
                </div>

                {/* 2. Core Mathematical & Algorithmic Principle */}
                <div className="p-5 rounded-2xl bg-zinc-950/80 border border-white/10 space-y-3">
                  <div className="flex items-center gap-2 text-cyan-400">
                    <Brain className="w-4 h-4" />
                    <span className="text-xs font-mono uppercase font-bold tracking-wider">
                      Core Mathematical &amp; Algorithmic Principle:
                    </span>
                  </div>
                  <p className="text-sm text-zinc-200 leading-relaxed font-sans">
                    {currentConcept.corePrinciple ||
                      currentConcept.explanationSummary ||
                      "In machine learning, we learn a parameter matrix to map input tensors to output probability distributions."}
                  </p>
                  {currentConcept.explanationSummary && (
                    <div className="p-3.5 rounded-xl bg-cyan-950/20 border border-cyan-500/20 text-xs text-cyan-100 leading-relaxed">
                      <strong className="text-cyan-300 font-bold block mb-0.5">
                        Conceptual Foundation:
                      </strong>
                      {currentConcept.explanationSummary}
                    </div>
                  )}
                </div>

                {/* 3. Step-by-Step Worked Numerical Example */}
                {currentConcept.workedExample && (
                  <div className="p-5 rounded-2xl bg-[#12110D] border border-amber-500/20 space-y-3">
                    <div className="flex items-center gap-2 text-amber-400">
                      <Calculator className="w-4 h-4" />
                      <span className="text-xs font-mono uppercase font-bold tracking-wider">
                        Step-by-Step Worked Numerical Example:
                      </span>
                    </div>
                    <p className="text-xs text-zinc-300 italic">
                      {currentConcept.workedExample.scenario}
                    </p>
                    <div className="space-y-1.5 pl-2 border-l-2 border-amber-500/40 font-mono text-xs text-amber-200/90">
                      {currentConcept.workedExample.calculationSteps.map((step, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <span className="text-amber-400/60 font-bold">{i + 1}.</span>
                          <span>{step}</span>
                        </div>
                      ))}
                    </div>
                    <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 font-medium">
                      💡 {currentConcept.workedExample.takeaway}
                    </div>
                  </div>
                )}

                {/* 4. Why It Matters in Real Production Systems */}
                {currentConcept.whyItMatters && (
                  <div className="p-4 rounded-2xl bg-zinc-900/60 border border-white/5 space-y-1.5">
                    <span className="text-[11px] font-mono uppercase text-zinc-400 font-bold tracking-wider block">
                      Why It Matters In Real-World Machine Learning:
                    </span>
                    <p className="text-xs text-zinc-300 leading-relaxed">
                      {currentConcept.whyItMatters}
                    </p>
                  </div>
                )}

                {/* 5. Conceptual Predict Check (Ponder & Predict) */}
                {currentConcept.predictQuestion && (
                  <div className="p-5 rounded-2xl bg-[#13120E] border border-gold/30 shadow-xl space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono uppercase text-amber-400 font-bold tracking-wider flex items-center gap-1.5">
                        <Zap className="w-4 h-4 text-amber-400" />
                        <span>Interactive Theory Mastery Check:</span>
                      </span>
                      <span className="text-[10px] font-mono text-zinc-400 uppercase">
                        Mastery Assessment
                      </span>
                    </div>
                    <p className="text-sm font-semibold text-white">
                      {currentConcept.predictQuestion.prompt}
                    </p>
                    <div className="space-y-2">
                      {currentConcept.predictQuestion.options.map((opt, optIdx) => {
                        const isSelected = selectedPredictOption === optIdx;
                        const isCorrect =
                          optIdx === currentConcept.predictQuestion?.correctIndex;
                        const hasChecked = selectedPredictOption !== null;

                        return (
                          <button
                            key={optIdx}
                            type="button"
                            onClick={() => setSelectedPredictOption(optIdx)}
                            className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${
                              hasChecked
                                ? isCorrect
                                  ? "bg-emerald-950/40 border-emerald-500 text-emerald-200"
                                  : isSelected
                                  ? "bg-red-950/40 border-red-500 text-red-200"
                                  : "bg-zinc-900/40 border-white/5 text-zinc-400"
                                : isSelected
                                ? "bg-amber-400/20 border-amber-400 text-white"
                                : "bg-zinc-900/60 border-white/10 text-zinc-300 hover:border-amber-400/40"
                            }`}
                          >
                            <span className="font-mono font-bold text-zinc-400 flex-shrink-0">
                              {String.fromCharCode(65 + optIdx)}.
                            </span>
                            <span className="flex-1">{opt}</span>
                            {hasChecked && isCorrect && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                            )}
                            {hasChecked && isSelected && !isCorrect && (
                              <XCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
                            )}
                          </button>
                        );
                      })}
                    </div>

                    {selectedPredictOption !== null && (
                      <div
                        className={`p-3.5 rounded-xl border text-xs leading-relaxed ${
                          selectedPredictOption ===
                          currentConcept.predictQuestion.correctIndex
                            ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-200"
                            : "bg-red-950/30 border-red-500/40 text-red-200"
                        }`}
                      >
                        <p>{currentConcept.predictQuestion.explanation}</p>
                      </div>
                    )}
                  </div>
                )}

                {/* 6. Graduate to Phase 2: Implementation CTA */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3 p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 shadow-md">
                  <div className="space-y-0.5">
                    <span className="text-xs font-bold text-amber-300 block">
                      Theory Understood? Graduate to Coding:
                    </span>
                    <p className="text-[11px] text-zinc-300">
                      Proceed to Phase 2 to write the Python implementation, fill the blanks, and execute assertions in Pyodide.
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLearningPhase("building")}
                    className="px-5 py-2.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-400/20 transition-all flex items-center gap-1.5 flex-shrink-0"
                  >
                    <span>Graduate to Phase 2: Build in Python</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              /* ========================================================================= */
              /* PHASE 2: PROJECT ARCHITECTURE & HANDS-ON CODING                           */
              /* ========================================================================= */
              <div className="space-y-3 flex-1 flex flex-col min-h-0">
                {/* Phase 2 Banner with Back to Theory link */}
                <div className="flex items-center justify-between p-3 rounded-xl bg-amber-500/10 border border-amber-500/25 flex-shrink-0">
                  <div className="flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span className="text-xs font-mono font-bold text-amber-300 truncate">
                      Phase 2 Active: Implement &quot;{currentConcept.title}&quot; in Python
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setLearningPhase("theory")}
                    className="text-xs text-cyan-400 hover:text-cyan-300 flex items-center gap-1 font-mono underline ml-2 flex-shrink-0"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                    <span>Review Theory</span>
                  </button>
                </div>

            {/* 2. Grounded Prediction Card (Sitting Directly Above Code Editor) */}
            <div className="p-4 rounded-2xl bg-[#12110D] border border-gold/20 shadow-xl space-y-3 flex-shrink-0">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="w-4 h-4 text-amber-300 flex-shrink-0" />
                  <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                    Predict Before Coding (Grounded in Project Data)
                  </h3>
                </div>
                <span className="text-[10px] font-mono text-zinc-400">
                  Step 1 of 2
                </span>
              </div>

              {/* Dynamic Domain-Grounded Project Data Sample */}
              <div className="bg-zinc-950/80 p-3 rounded-xl border border-white/5 space-y-1 text-xs">
                <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider block font-bold">
                  Project Data Sample ({safeGoal}):
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 font-mono text-xs text-amber-200/90 pt-1">
                  {isEmotionOrFace ? (
                    <>
                      <div className="bg-zinc-900/60 p-2 rounded-lg border border-white/5">
                        <strong className="text-zinc-200">Face 1:</strong> Smile: +0.85, Brow: 0.05 &rarr; <span className="text-amber-300 font-bold">😄 Happy (94%)</span>
                      </div>
                      <div className="bg-zinc-900/60 p-2 rounded-lg border border-white/5">
                        <strong className="text-zinc-200">Face 2:</strong> Eyes: 0.95, Jaw: 0.85 &rarr; <span className="text-cyan-400 font-bold">😲 Surprise (89%)</span>
                      </div>
                      <div className="bg-zinc-900/60 p-2 rounded-lg border border-white/5">
                        <strong className="text-zinc-200">Face 3:</strong> Brow: 0.85, Smile: -0.40 &rarr; <span className="text-rose-400 font-bold">😠 Anger (91%)</span>
                      </div>
                    </>
                  ) : isMedical ? (
                    <>
                      <div className="bg-zinc-900/60 p-2 rounded-lg border border-white/5">
                        <strong className="text-zinc-200">Patient 1:</strong> Glucose: 168 mg/dL, BMI: 32.4 &rarr; <span className="text-rose-400 font-bold">Positive (High Risk)</span>
                      </div>
                      <div className="bg-zinc-900/60 p-2 rounded-lg border border-white/5">
                        <strong className="text-zinc-200">Patient 2:</strong> Glucose: 88 mg/dL, BMI: 22.1 &rarr; <span className="text-emerald-400 font-bold">Negative (Healthy)</span>
                      </div>
                      <div className="bg-zinc-900/60 p-2 rounded-lg border border-white/5">
                        <strong className="text-zinc-200">Patient 3:</strong> Glucose: 142 mg/dL, BMI: 29.5 &rarr; <span className="text-amber-400 font-bold">Elevated (Pre-diabetic)</span>
                      </div>
                    </>
                  ) : isSpam ? (
                    <>
                      <div className="bg-zinc-900/60 p-2 rounded-lg border border-white/5">
                        <strong className="text-zinc-200">Email 1:</strong> &quot;Claim free $1,000 gift card now!&quot; &rarr; <span className="text-rose-400 font-bold">SPAM (1)</span>
                      </div>
                      <div className="bg-zinc-900/60 p-2 rounded-lg border border-white/5">
                        <strong className="text-zinc-200">Email 2:</strong> &quot;Hey, are we still meeting for lunch?&quot; &rarr; <span className="text-emerald-400 font-bold">HAM (0)</span>
                      </div>
                      <div className="bg-zinc-900/60 p-2 rounded-lg border border-white/5">
                        <strong className="text-zinc-200">Email 3:</strong> &quot;Urgent: Verify your account immediately!&quot; &rarr; <span className="text-rose-400 font-bold">SPAM (1)</span>
                      </div>
                    </>
                  ) : isRealEstate ? (
                    <>
                      <div className="bg-zinc-900/60 p-2 rounded-lg border border-white/5">
                        <strong className="text-zinc-200">Listing 1:</strong> 1,200 sqft, 2 beds &rarr; <span className="text-emerald-400">$250,000</span>
                      </div>
                      <div className="bg-zinc-900/60 p-2 rounded-lg border border-white/5">
                        <strong className="text-zinc-200">Listing 2:</strong> 2,400 sqft, 4 beds &rarr; <span className="text-emerald-400">$480,000</span>
                      </div>
                      <div className="bg-zinc-900/60 p-2 rounded-lg border border-white/5">
                        <strong className="text-zinc-200">Listing 3:</strong> 1,800 sqft, 3 beds &rarr; <span className="text-emerald-400">$360,000</span>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="bg-zinc-900/60 p-2 rounded-lg border border-white/5">
                        <strong className="text-zinc-200">Sample 1:</strong> Features [12.4, 3.1, 0.85] &rarr; <span className="text-amber-300 font-bold">Class 1</span>
                      </div>
                      <div className="bg-zinc-900/60 p-2 rounded-lg border border-white/5">
                        <strong className="text-zinc-200">Sample 2:</strong> Features [3.2, 0.9, 0.12] &rarr; <span className="text-amber-300 font-bold">Class 0</span>
                      </div>
                      <div className="bg-zinc-900/60 p-2 rounded-lg border border-white/5">
                        <strong className="text-zinc-200">Sample 3:</strong> Features [18.9, 4.5, 0.92] &rarr; <span className="text-amber-300 font-bold">Class 1</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Grounded Prediction Question & Structured Inputs */}
              {currentConcept.predictQuestion ? (
                <div className="space-y-2.5">
                  <p className="text-xs text-zinc-200 font-medium">
                    <strong className="text-amber-300 font-semibold mr-1">Prediction Question:</strong>
                    {currentConcept.predictQuestion.prompt || (currentConcept.predictQuestion as any).question}
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1">
                    {currentConcept.predictQuestion.options.map((opt, optIdx) => {
                      const isSelected = selectedPredictOption === optIdx;
                      const isCorrect = optIdx === currentConcept.predictQuestion?.correctIndex;
                      return (
                        <button
                          key={optIdx}
                          type="button"
                          onClick={() => handleSelectPredictOption(optIdx)}
                          className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-start gap-2 ${
                            isSelected && isCorrect
                              ? "bg-emerald-950/60 border-emerald-500 text-emerald-200 shadow-md ring-1 ring-emerald-500/50"
                              : isSelected && !isCorrect
                              ? "bg-rose-950/60 border-rose-500 text-rose-200 shadow-md ring-1 ring-rose-500/50"
                              : "bg-zinc-900/60 border-white/10 hover:border-gold/30 text-zinc-300 hover:text-white"
                          }`}
                        >
                          <span
                            className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-mono font-bold flex-shrink-0 mt-0.5 border ${
                              isSelected && isCorrect
                                ? "bg-emerald-500 text-zinc-950 border-emerald-400"
                                : isSelected && !isCorrect
                                ? "bg-rose-500 text-zinc-950 border-rose-400"
                                : "border-zinc-700 bg-zinc-800 text-zinc-400"
                            }`}
                          >
                            {String.fromCharCode(65 + optIdx)}
                          </span>
                          <span className="flex-1 leading-snug">{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {predictSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{predictSuccess}</span>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-zinc-200 font-medium">
                    Before you see the code: what should go in the model&apos;s <code className="text-amber-300 font-mono">inputs</code> list, and what single value should <code className="text-amber-300 font-mono">target</code> be?
                  </p>

                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 pt-1">
                    <div className="sm:col-span-5">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                        Model Inputs (Features)
                      </label>
                      <input
                        type="text"
                        value={predInputs}
                        onChange={(e) => setPredInputs(e.target.value)}
                        placeholder={
                          isEmotionOrFace
                            ? "e.g. smile, brow_furrow, eye_openness"
                            : isMedical
                            ? "e.g. glucose, bmi, age"
                            : isSpam
                            ? "e.g. message_text, word_counts"
                            : isRealEstate
                            ? "e.g. sqft, bedrooms"
                            : "e.g. feature_1, feature_2"
                        }
                        className="w-full bg-zinc-950 border border-gold/20 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="sm:col-span-4">
                      <label className="text-[10px] font-mono text-zinc-400 uppercase tracking-wider block mb-1">
                        Target (Prediction Goal)
                      </label>
                      <input
                        type="text"
                        value={predTarget}
                        onChange={(e) => setPredTarget(e.target.value)}
                        placeholder={
                          isEmotionOrFace
                            ? "e.g. emotion_class"
                            : isMedical
                            ? "e.g. diabetes_diagnosis"
                            : isSpam
                            ? "e.g. is_spam"
                            : isRealEstate
                            ? "e.g. price"
                            : "e.g. target_value"
                        }
                        className="w-full bg-zinc-950 border border-gold/20 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-amber-400"
                      />
                    </div>

                    <div className="sm:col-span-3 flex items-end">
                      <button
                        type="button"
                        onClick={handleCheckPrediction}
                        disabled={!predInputs.trim() && !predTarget.trim()}
                        className="w-full px-4 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs transition-all shadow disabled:opacity-40"
                      >
                        Check Prediction
                      </button>
                    </div>
                  </div>

                  {predictSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/50 text-emerald-200 text-xs flex items-center gap-2 animate-in fade-in duration-200">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                      <span>{predictSuccess}</span>
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* 3. UNMISSABLE TYPED DIAGNOSIS & MATCHED EXPLANATION CALLOUT */}
            {activeDiagnosis && (
              <div className="p-4 rounded-2xl bg-red-950/40 border-2 border-red-500/70 shadow-2xl space-y-3 animate-in fade-in duration-300 flex-shrink-0">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0" />
                    <span className="text-sm font-mono font-bold uppercase tracking-wide text-red-300">
                      {getFriendlyErrorTitle(activeDiagnosis.errorType)}
                    </span>
                  </div>
                  <span className="text-xs font-mono uppercase bg-red-900/80 text-red-200 px-2.5 py-1 rounded-md border border-red-500/50 font-semibold">
                    {getFriendlyStrategy(activeDiagnosis.strategy)}
                  </span>
                </div>

                <div className="text-sm font-bold text-white bg-red-950/60 p-3 rounded-xl border border-red-500/30">
                  {activeDiagnosis.diagnosis}
                </div>

                <div className="text-xs text-zinc-200 bg-[#0E0C09] p-3.5 rounded-xl border border-gold/20 leading-relaxed space-y-1.5">
                  <span className="text-amber-300 font-bold block text-xs">
                    💡 Matched Explanation ({getFriendlyStrategy(activeDiagnosis.strategy)}):
                  </span>
                  <p>{activeDiagnosis.matchedExplanation}</p>
                </div>
              </div>
            )}

            {/* Model Assembly Progress Bar */}
            <div className="flex flex-wrap items-center justify-between gap-2 px-3.5 py-2 rounded-xl bg-zinc-900/90 border border-gold/20 shadow-md flex-shrink-0">
              <div className="flex items-center gap-2.5">
                <div className="w-6 h-6 rounded-lg bg-amber-400/15 border border-amber-400/30 flex items-center justify-center text-amber-300">
                  <Layers className="w-3.5 h-3.5" />
                </div>
                <div>
                  <span className="text-xs font-bold text-white block">
                    {safeGoal}: Pipeline Assembly
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Step {currentIndex + 1} of {concepts.length} · {projectParts.length} functions assembled into main_model.py
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab("assembled")}
                  className="px-3 py-1.5 rounded-lg bg-amber-400/15 hover:bg-amber-400/25 text-amber-300 border border-amber-400/30 text-xs font-bold transition-all flex items-center gap-1.5 hover:text-white"
                >
                  <Layers className="w-3.5 h-3.5" />
                  <span>View Built Model (Python)</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab("test")}
                  className="px-3 py-1.5 rounded-lg bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5 hover:text-white"
                >
                  <Zap className="w-3.5 h-3.5" />
                  <span>Test Model Live</span>
                </button>
              </div>
            </div>

            {/* Step Passed Action Callout */}
            {isCodePassed && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-500/60 flex items-center justify-between text-xs animate-in fade-in duration-200 flex-shrink-0">
                <div className="flex items-center gap-2 text-emerald-200">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                  <span>
                    <strong>Step {currentIndex + 1} Passed!</strong> Function code integrated into your assembled model script.
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveTab("assembled")}
                    className="px-3 py-1 rounded-lg bg-emerald-500 text-zinc-950 font-bold text-xs hover:bg-emerald-400 transition-all flex items-center gap-1"
                  >
                    <Layers className="w-3 h-3" />
                    <span>Run Built Model</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab("test")}
                    className="px-3 py-1 rounded-lg bg-amber-400 text-zinc-950 font-bold text-xs hover:bg-amber-300 transition-all flex items-center gap-1"
                  >
                    <Zap className="w-3 h-3" />
                    <span>Test Model Live</span>
                  </button>
                </div>
              </div>
            )}

            {/* 4. The Code Cell with Real Blanks */}
            <div className="flex-1 min-h-[420px] flex flex-col overflow-hidden">
              <CodeSandbox
                concept={currentConcept}
                isAlreadyPassed={isCodePassed}
                onStepPassed={(code) => {
                  completeBuildStep(currentConcept.id, code);
                  setActiveDiagnosis(null);
                }}
                onEvaluation={(evalResult) => {
                  if (evalResult && !evalResult.correct) {
                    setActiveDiagnosis(evalResult);
                  } else {
                    setActiveDiagnosis(null);
                  }
                }}
                onOpenTeachBack={() => setIsTeachBackOpen(true)}
              />
            </div>
          </div>
        )}
          </div>
        </div>
      )}

      {/* Optional "Ask Socrates AI" Slide-Out Help Drawer */}
      {isSocratesDrawerOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[#0E0D0A] border-l border-gold/25 shadow-2xl z-50 flex flex-col animate-in slide-in-from-right duration-300">
          <div className="p-4 border-b border-gold/15 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-300" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">
                Ask Socrates AI (Help Desk)
              </h3>
            </div>
            <button
              type="button"
              onClick={() => setIsSocratesDrawerOpen(false)}
              className="p-1 rounded-lg hover:bg-zinc-800 text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
            <div className="text-xs text-zinc-300">
              Need intuition or stuck on a blank? Ask Socrates anything about <strong className="text-amber-300">{currentConcept.title}</strong>:
            </div>

            {/* Quick Prompt Chips */}
            <div className="flex flex-wrap gap-1.5">
              <button
                type="button"
                onClick={() => handleAskSocrates("Explain the core intuition with a quick real-world analogy")}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-gold/15 transition-all"
              >
                💡 Analogy
              </button>
              <button
                type="button"
                onClick={() => handleAskSocrates("Show the exact mathematical formula and step-by-step numbers")}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-gold/15 transition-all"
              >
                📐 Exact Formula
              </button>
              <button
                type="button"
                onClick={() => handleAskSocrates("Give me a hint for filling in the blanks in this step")}
                className="text-[11px] px-2.5 py-1 rounded-lg bg-zinc-900 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-gold/15 transition-all"
              >
                🔍 Hint for Blanks
              </button>
            </div>

            {/* Response Bubble */}
            {socratesAnswer && (
              <div className="p-3.5 rounded-xl bg-zinc-950 border border-amber-500/30 space-y-2 text-xs">
                <span className="font-bold text-amber-300 block">{socratesAnswer.title}</span>
                <p className="text-zinc-200 leading-relaxed">{socratesAnswer.explanation}</p>
                {socratesAnswer.exampleOrFormula && (
                  <pre className="font-mono text-[11px] bg-black/60 p-2.5 rounded-lg border border-white/5 text-amber-200 whitespace-pre-wrap">
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

          {/* Question Input */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskSocrates();
            }}
            className="p-3 border-t border-gold/15 bg-zinc-950 flex items-center gap-2"
          >
            <input
              type="text"
              value={askQuestionText}
              onChange={(e) => setAskQuestionText(e.target.value)}
              placeholder="Ask Socrates a question..."
              className="flex-1 bg-zinc-900 border border-gold/20 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
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
