"use client";

import React, { useState } from "react";
import {
  Brain,
  Sparkles,
  Lightbulb,
  Calculator,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  HelpCircle,
  MessageSquare,
  Send,
  X,
  BookOpen,
} from "lucide-react";
import { Concept, TechnicalTerm } from "@/lib/types";
import { enrichConceptWithDeepTheory } from "@/lib/technicalDictionary";

interface Phase1TheoryViewProps {
  concept: Concept;
  goal: string;
  onProceedToBuild: () => void;
}

export const Phase1TheoryView: React.FC<Phase1TheoryViewProps> = ({
  concept: rawConcept,
  goal,
  onProceedToBuild,
}) => {
  const concept = enrichConceptWithDeepTheory(rawConcept, goal);

  // Clean 3-Tab View State
  const [activeTab, setActiveTab] = useState<"intuition" | "math" | "check">("intuition");
  const [selectedTerm, setSelectedTerm] = useState<TechnicalTerm | null>(null);
  const [selectedPredictOption, setSelectedPredictOption] = useState<number | null>(null);
  const [predictFeedback, setPredictFeedback] = useState<{
    correct: boolean;
    explanation: string;
  } | null>(null);

  // Socrates AI floating question drawer state
  const [isSocratesOpen, setIsSocratesOpen] = useState(false);
  const [askText, setAskText] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [socratesAnswer, setSocratesAnswer] = useState<{
    explanation: string;
    analogy?: string;
  } | null>(null);

  // Derive which pipeline stage this concept is in (0 to 3)
  const lowerTitle = (concept.title || "").toLowerCase();
  const lowerId = (concept.id || "").toLowerCase();
  let currentStageIndex = 1;
  if (lowerId.includes("framing") || lowerId.includes("spec") || lowerTitle.includes("contract")) {
    currentStageIndex = 0;
  } else if (lowerId.includes("feature") || lowerTitle.includes("landmark") || lowerTitle.includes("normaliz")) {
    currentStageIndex = 1;
  } else if (lowerId.includes("weight") || lowerTitle.includes("linear") || lowerTitle.includes("dot")) {
    currentStageIndex = 2;
  } else if (lowerId.includes("activation") || lowerId.includes("decision") || lowerTitle.includes("threshold")) {
    currentStageIndex = 3;
  }

  const pipelineStages = [
    { num: 1, name: "Real Data", icon: "📷" },
    { num: 2, name: "Feature Numbers", icon: "🔢" },
    { num: 3, name: "Weighted Brain", icon: "⚖️" },
    { num: 4, name: "Decision Gate", icon: "🎯" },
  ];

  const handlePredictSelect = (idx: number) => {
    setSelectedPredictOption(idx);
    const pq = concept.predictQuestion;
    if (!pq) return;

    if (idx === pq.correctIndex) {
      setPredictFeedback({
        correct: true,
        explanation: `Correct! ${pq.explanation}`,
      });
    } else {
      setPredictFeedback({
        correct: false,
        explanation: `Not quite: ${pq.explanation}`,
      });
    }
  };

  const handleAsk = async (presetText?: string) => {
    const q = presetText || askText;
    if (!q.trim() || isAsking) return;

    setIsAsking(true);
    setSocratesAnswer(null);

    try {
      const res = await fetch("/api/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          question: q,
          conceptTitle: concept.title,
          conceptHook: concept.hook,
          goal,
        }),
      });

      if (res.ok) {
        const data = await res.json();
        setSocratesAnswer({
          explanation: data.explanation || "In machine learning, we teach the computer using examples rather than hardcoding static rules.",
          analogy: data.exampleOrFormula,
        });
      } else {
        setSocratesAnswer({
          explanation: "In machine learning, we don't write 10,000 if/else statements. We let the computer adjust numerical weights until it gets the answers right.",
          analogy: "Like learning to ride a bicycle through muscle memory rather than reading a rulebook.",
        });
      }
    } catch {
      setSocratesAnswer({
        explanation: "Machine learning takes numerical features and multiplies them by learned weights to make a prediction.",
        analogy: "Think of tuning volume sliders on a sound mixer to get clear music.",
      });
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-4 pb-10 animate-in fade-in duration-200">
      {/* 1. Sleek Compact Header with 1-Line Pipeline Stepper */}
      <div className="glass-panel p-5 md:p-6 rounded-3xl border border-white/10 shadow-xl space-y-4">
        {/* Minimal 1-Line Breadcrumb Pipeline */}
        <div className="flex items-center justify-between gap-1 overflow-x-auto pb-1 text-xs">
          {pipelineStages.map((stg, sIdx) => {
            const isCurrent = sIdx === currentStageIndex;
            const isPast = sIdx < currentStageIndex;
            return (
              <React.Fragment key={stg.num}>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1 rounded-xl transition-all whitespace-nowrap ${
                    isCurrent
                      ? "bg-amber-400 text-zinc-950 font-bold shadow-md shadow-amber-400/20 ring-1 ring-amber-400"
                      : isPast
                      ? "bg-zinc-900/80 text-emerald-400 font-medium border border-emerald-500/20"
                      : "bg-zinc-900/40 text-zinc-500 border border-white/5"
                  }`}
                >
                  <span>{stg.icon}</span>
                  <span>{stg.num}. {stg.name}</span>
                  {isCurrent && <span className="text-[10px] ml-1 bg-zinc-950/20 px-1.5 py-0.2 rounded-full font-bold">ACTIVE</span>}
                </div>
                {sIdx < pipelineStages.length - 1 && (
                  <span className="text-zinc-600 px-1 select-none">→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Title and Simple Plain-English Hook */}
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-amber-400">
              PHASE 1: CONCEPT MASTERCLASS
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-extrabold text-white">
            {concept.title}
          </h2>
          <p className="text-xs md:text-sm text-zinc-300 mt-1.5 leading-relaxed">
            {concept.hook}
          </p>
        </div>
      </div>

      {/* 2. Uncluttered 3-Tab Navigator */}
      <div className="flex items-center justify-between gap-2 border-b border-white/10 pb-2">
        <div className="flex items-center gap-2 p-1 rounded-2xl bg-zinc-900/80 border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("intuition")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "intuition"
                ? "bg-amber-400 text-zinc-950 shadow font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>1. Core Idea</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("math")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "math"
                ? "bg-amber-400 text-zinc-950 shadow font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>2. Real Numbers</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("check")}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 ${
              activeTab === "check"
                ? "bg-amber-400 text-zinc-950 shadow font-bold"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>3. Quick Check</span>
          </button>
        </div>

        {/* Floating Socrates Ask Button */}
        <button
          type="button"
          onClick={() => setIsSocratesOpen(true)}
          className="px-3.5 py-2 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-amber-300 hover:text-white border border-amber-500/20 text-xs font-semibold transition-all flex items-center gap-1.5"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Ask Socrates</span>
          <span className="sm:hidden">Ask</span>
        </button>
      </div>

      {/* 3. Tab Contents: Focused & Breathing Room */}
      {activeTab === "intuition" && (
        <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl space-y-5 animate-in fade-in duration-150">
          {/* Plain English Breakdown */}
          <div className="space-y-2">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-amber-400">
              Why We Are Doing This (In Plain English)
            </h3>
            <p className="text-sm text-zinc-200 leading-relaxed font-sans">
              {concept.explanationSummary ||
                "Computers cannot feel emotions or understand images directly. They need numbers. In this step, we extract physical measurements from the data so our Python code has something to calculate with."}
            </p>
          </div>

          {/* Everyday Analogy Card */}
          {concept.corePrinciple && (
            <div className="p-4 rounded-2xl bg-amber-950/20 border border-amber-500/20 flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div className="space-y-1">
                <span className="text-xs font-bold text-amber-300 block">
                  The Everyday Real-World Analogy:
                </span>
                <p className="text-xs text-zinc-300 leading-relaxed">
                  {concept.corePrinciple}
                </p>
              </div>
            </div>
          )}

          {/* Jargon Buster Clickable Pills */}
          {concept.technicalTerms && concept.technicalTerms.length > 0 && (
            <div className="space-y-2.5 pt-2">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-zinc-400 block">
                Click Any Term to See Simple Meaning (0 Jargon):
              </span>
              <div className="flex flex-wrap gap-2">
                {concept.technicalTerms.map((termItem) => {
                  const isSelected = selectedTerm?.term === termItem.term;
                  return (
                    <button
                      key={termItem.term}
                      type="button"
                      onClick={() => setSelectedTerm(isSelected ? null : termItem)}
                      className={`px-3 py-1.5 rounded-xl text-xs transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-amber-400 text-zinc-950 font-bold shadow-md scale-[1.02]"
                          : "bg-zinc-900/90 text-zinc-300 hover:text-white border border-white/10"
                      }`}
                    >
                      <BookOpen className="w-3 h-3 opacity-70" />
                      <span>{termItem.term.split("(")[0].trim()}</span>
                    </button>
                  );
                })}
              </div>

              {/* Term Detail Box */}
              {selectedTerm && (
                <div className="p-4 rounded-2xl bg-zinc-950 border border-amber-400/30 space-y-2 animate-in fade-in duration-150">
                  <div className="flex items-center justify-between border-b border-white/10 pb-2">
                    <strong className="text-xs font-bold text-amber-300">
                      {selectedTerm.term}
                    </strong>
                    <button
                      type="button"
                      onClick={() => setSelectedTerm(null)}
                      className="text-zinc-500 hover:text-white text-xs"
                    >
                      Close ✕
                    </button>
                  </div>
                  <p className="text-xs text-zinc-200 leading-relaxed">
                    {selectedTerm.definition}
                  </p>
                  <p className="text-xs text-amber-200/90 italic">
                    💡 <strong>Analogy:</strong> {selectedTerm.analogy}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "math" && (
        <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl space-y-4 animate-in fade-in duration-150">
          <div className="space-y-1">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-amber-400">
              The Math in Real Numbers (No Fluff)
            </h3>
            <p className="text-xs text-zinc-400">
              Here is what happens to actual numbers when they pass through this step:
            </p>
          </div>

          {concept.deepMath ? (
            <div className="space-y-3">
              {/* Formula */}
              <div className="p-3.5 rounded-2xl bg-zinc-950 border border-white/10 text-center font-mono text-sm md:text-base font-bold text-amber-300">
                {concept.deepMath.formulaLatex}
              </div>

              {/* Given Inputs */}
              <div className="p-3 rounded-xl bg-zinc-900/80 border border-white/5 text-xs font-mono text-zinc-300">
                <strong className="text-white">Sample Inputs: </strong>
                {concept.deepMath.numericalExample.givenInputs}
              </div>

              {/* Steps */}
              <div className="space-y-2 pt-1">
                {concept.deepMath.numericalExample.stepByStepArithmetic.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-2.5 rounded-xl bg-zinc-950/70 border border-white/5 text-xs font-mono text-zinc-300 flex items-start gap-2"
                  >
                    <span className="text-amber-400 font-bold">Step {idx + 1}:</span>
                    <span>{step}</span>
                  </div>
                ))}
              </div>

              {/* Final Result */}
              <div className="p-3.5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs font-mono font-bold text-emerald-300 flex items-center justify-between">
                <span>Output Result:</span>
                <span className="text-white text-sm">{concept.deepMath.numericalExample.finalResult}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-zinc-950 text-xs font-mono text-zinc-300">
              Passes input features directly into the model tensor.
            </div>
          )}
        </div>
      )}

      {activeTab === "check" && (
        <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-xl space-y-4 animate-in fade-in duration-150">
          <div className="space-y-1">
            <h3 className="text-sm font-mono font-bold uppercase tracking-wider text-amber-400">
              Quick Concept Intuition Check
            </h3>
            <p className="text-xs text-zinc-400">
              Check your understanding before moving to Python code:
            </p>
          </div>

          {concept.predictQuestion && (
            <div className="p-4 rounded-2xl bg-zinc-950 border border-white/10 space-y-3">
              <p className="text-sm font-semibold text-white">
                {concept.predictQuestion.prompt}
              </p>

              <div className="space-y-2">
                {concept.predictQuestion.options.map((opt, optIdx) => {
                  const isSelected = selectedPredictOption === optIdx;
                  const isCorrect = optIdx === concept.predictQuestion?.correctIndex;

                  let style = "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-white/10";
                  if (selectedPredictOption !== null) {
                    if (isSelected) {
                      style = isCorrect
                        ? "bg-emerald-500/20 border-emerald-500 text-emerald-200"
                        : "bg-red-500/20 border-red-500 text-red-200";
                    } else if (isCorrect) {
                      style = "bg-emerald-500/10 border-emerald-500/30 text-emerald-300";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handlePredictSelect(optIdx)}
                      className={`w-full text-left p-3 rounded-xl border text-xs transition-all flex items-start gap-2.5 ${style}`}
                    >
                      <span className="font-mono text-zinc-500 font-bold">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <span className="flex-1">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {predictFeedback && (
                <div
                  className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                    predictFeedback.correct
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                      : "bg-amber-950/40 border-amber-500/40 text-amber-200"
                  }`}
                >
                  <span>{predictFeedback.correct ? "✅" : "💡"}</span>
                  <span>{predictFeedback.explanation}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. Sleek Bottom Action: Advance to Code */}
      <div className="pt-2 flex items-center justify-between">
        <span className="text-xs text-zinc-400 font-mono">
          Ready to write the Python function?
        </span>

        <button
          type="button"
          onClick={onProceedToBuild}
          className="px-6 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-extrabold text-xs shadow-lg shadow-amber-400/20 transition-all flex items-center gap-2"
        >
          <span>Proceed to Phase 2: Build in Python</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 5. Minimal Slide-Out Socrates AI Drawer (No Clutter on Main Page) */}
      {isSocratesOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-[#100f0c] border-l border-white/10 shadow-2xl z-50 p-5 flex flex-col space-y-4 animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-3">
            <div className="flex items-center gap-2 text-amber-400 font-bold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Ask Socrates AI</span>
            </div>
            <button
              type="button"
              onClick={() => setIsSocratesOpen(false)}
              className="p-1 rounded-lg text-zinc-400 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-zinc-400">
            Ask any question in plain English. Socrates explains without intimidating jargon.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={askText}
              onChange={(e) => setAskText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder="e.g. Why do we need weights? Give me an analogy..."
              className="flex-1 bg-zinc-950 border border-white/10 rounded-xl px-3 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={() => handleAsk()}
              disabled={isAsking || !askText.trim()}
              className="px-3 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs transition-all disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-1">
            <button
              type="button"
              onClick={() => handleAsk("Explain this like I am 10 years old")}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 text-[11px] text-zinc-400 hover:text-white border border-white/5"
            >
              👶 Explain like I am 10
            </button>
            <button
              type="button"
              onClick={() => handleAsk("Why can't we just write if/else statements?")}
              className="px-2.5 py-1 rounded-lg bg-zinc-900 text-[11px] text-zinc-400 hover:text-white border border-white/5"
            >
              🤔 Why not if/else?
            </button>
          </div>

          {socratesAnswer && (
            <div className="p-3.5 rounded-xl bg-zinc-950 border border-amber-500/30 text-xs space-y-2 animate-in fade-in duration-150 overflow-y-auto">
              <p className="text-zinc-200 leading-relaxed">{socratesAnswer.explanation}</p>
              {socratesAnswer.analogy && (
                <p className="text-amber-300 italic border-t border-white/5 pt-1.5">
                  💡 {socratesAnswer.analogy}
                </p>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
