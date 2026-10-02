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

function renderFormattedInlineText(text: string): React.ReactNode {
  const codeRegex = /(`[^`]+`|\bX_train\b|\by_train\b|\bX_test\b|\by_test\b|\bmodel\.fit\b|\bmodel\.predict\b|\[[a-zA-Z0-9_, -]+\])/g;
  const parts = text.split(codeRegex);

  return parts.map((part, i) => {
    if (!part) return null;
    if (
      (part.startsWith("`") && part.endsWith("`")) ||
      part === "X_train" ||
      part === "y_train" ||
      part === "X_test" ||
      part === "y_test" ||
      part === "model.fit" ||
      part === "model.predict" ||
      (part.startsWith("[") && part.endsWith("]"))
    ) {
      const clean = part.replace(/^`|`$/g, "");
      return (
        <code
          key={i}
          className="px-2.5 py-0.5 mx-1 rounded-lg bg-zinc-800/90 border border-zinc-700/70 text-amber-300 font-mono text-sm md:text-base font-bold inline-block shadow-sm"
        >
          {clean}
        </code>
      );
    }
    return <span key={i}>{part}</span>;
  });
}

function FormattedContent({ text }: { text: string }) {
  if (!text) return null;

  const paragraphs = text.split(/\n\s*\n/);

  return (
    <div className="space-y-3.5 text-xs sm:text-sm leading-relaxed text-zinc-200 font-sans">
      {paragraphs.map((para, pIdx) => {
        const lines = para.split("\n").map((l) => l.trim()).filter(Boolean);
        const hasBullets = lines.some((l) => l.startsWith("•") || l.startsWith("-") || /^\d+\.\s/.test(l));

        if (hasBullets) {
          const introLines: string[] = [];
          const listItems: string[] = [];

          for (const line of lines) {
            if (line.startsWith("•") || line.startsWith("-") || /^\d+\.\s/.test(line)) {
              listItems.push(line.replace(/^[•\-\*]\s*|^\d+\.\s*/, ""));
            } else {
              introLines.push(line);
            }
          }

          return (
            <div key={pIdx} className="space-y-2">
              {introLines.length > 0 && (
                <p className="font-bold text-white text-xs sm:text-sm">
                  {renderFormattedInlineText(introLines.join(" "))}
                </p>
              )}
              <ul className="space-y-2 pt-0.5 pl-1">
                {listItems.map((item, itemIdx) => {
                  const isKeyTerm = item.includes("=");
                  return (
                    <li
                      key={itemIdx}
                      className={`flex items-start gap-2.5 text-xs sm:text-sm leading-relaxed text-zinc-200 ${
                        isKeyTerm
                          ? "p-2.5 rounded-xl bg-zinc-950/60 border border-zinc-800/90 shadow-sm"
                          : ""
                      }`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                      <span className="flex-1 font-normal">
                        {renderFormattedInlineText(item)}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </div>
          );
        }

        const isHeading =
          lines.length === 1 && (para.endsWith(":") || para.startsWith("🎓") || para.startsWith("💡"));

        if (isHeading) {
          return (
            <p key={pIdx} className="font-bold text-white text-xs sm:text-sm pt-0.5">
              {renderFormattedInlineText(para)}
            </p>
          );
        }

        return (
          <p key={pIdx} className="leading-relaxed">
            {renderFormattedInlineText(para.replace(/\n/g, " "))}
          </p>
        );
      })}
    </div>
  );
}

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
    { num: 1, name: "Raw Data" },
    { num: 2, name: "Features" },
    { num: 3, name: "Model Weights" },
    { num: 4, name: "Decision Gate" },
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
    <div className="max-w-4xl mx-auto space-y-4 pb-16 animate-in fade-in duration-200">
      {/* 1. Sleek Concept Header */}
      <div className="py-1.5 space-y-1.5 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-1.5">
          <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-wider text-amber-400">
            Phase 1 · Concept Masterclass
          </span>
        </div>
        <h1 className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight text-white font-sans">
          {concept.title}
        </h1>
        {concept.hook && (
          <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed max-w-3xl font-normal">
            {concept.hook}
          </p>
        )}
      </div>

      {/* 2. Uncluttered 3-Tab Navigator */}
      <div className="flex items-center justify-between gap-4 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-zinc-900/80 border border-zinc-800">
          <button
            type="button"
            onClick={() => setActiveTab("intuition")}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === "intuition"
                ? "bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>1. Core Idea</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("math")}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === "math"
                ? "bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Calculator className="w-4 h-4 text-amber-400" />
            <span>2. Real Numbers</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("check")}
            className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
              activeTab === "check"
                ? "bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>3. Quick Check</span>
          </button>
        </div>

        {/* Floating Socrates Ask Button */}
        <button
          type="button"
          onClick={() => setIsSocratesOpen(true)}
          className="px-4 py-2 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 hover:text-amber-200 border border-amber-500/30 hover:border-amber-500/50 text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Ask Socrates</span>
          <span className="sm:hidden">Ask</span>
        </button>
      </div>

      {activeTab === "intuition" && (
        <div className="p-6 sm:p-8 rounded-2xl border border-zinc-800 bg-[#0d111a]/95 space-y-7 animate-in fade-in duration-150 shadow-xl">
          {/* Plain English Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-zinc-800/80">
              <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
              <h3 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-amber-400">
                Core Explanation (Plain English)
              </h3>
            </div>
            <div className="pt-1">
              <FormattedContent
                text={
                  concept.explanationSummary ||
                  "Computers cannot feel emotions or understand images directly. They need numbers. In this step, we extract physical measurements from the data so our Python code has something to calculate with."
                }
              />
            </div>
          </div>

          {/* Everyday Analogy Card */}
          {concept.corePrinciple && (
            <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-amber-500/15 via-amber-500/5 to-transparent border border-amber-500/35 flex items-start gap-3 shadow-md">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center flex-shrink-0 text-amber-400 shadow-sm">
                <Lightbulb className="w-4 h-4 text-amber-400" />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <span className="text-[11px] font-mono font-bold text-amber-400 uppercase tracking-wider block">
                  The Everyday Real-World Analogy
                </span>
                <div className="text-xs sm:text-sm leading-relaxed text-amber-100 font-medium">
                  <FormattedContent text={concept.corePrinciple} />
                </div>
              </div>
            </div>
          )}

          {/* Jargon Buster Clickable Pills */}
          {concept.technicalTerms && concept.technicalTerms.length > 0 && (
            <div className="space-y-2 pt-1">
              <div className="flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-300 block">
                  Technical Vocabulary:
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                {concept.technicalTerms.filter(Boolean).map((termItem) => {
                  const isSelected = selectedTerm?.term === termItem.term;
                  return (
                    <button
                      key={termItem.term}
                      type="button"
                      onClick={() => setSelectedTerm(isSelected ? null : termItem)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 cursor-pointer ${
                        isSelected
                          ? "bg-amber-500/20 text-white border border-amber-400 shadow-sm"
                          : "bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700"
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
                <div className="p-4 rounded-xl bg-zinc-950 border border-zinc-700 space-y-2 animate-in fade-in duration-150 shadow-lg">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-1.5">
                    <strong className="text-xs sm:text-sm font-bold text-white">
                      {selectedTerm.term}
                    </strong>
                    <button
                      type="button"
                      onClick={() => setSelectedTerm(null)}
                      className="text-zinc-400 hover:text-white text-xs px-2 py-0.5 rounded-md bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
                    >
                      Close ✕
                    </button>
                  </div>
                  <p className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-sans">
                    {selectedTerm.definition}
                  </p>
                  <p className="text-[11px] sm:text-xs text-amber-300/90 italic bg-amber-500/10 p-2.5 rounded-lg border border-amber-500/20">
                    💡 <strong>Analogy:</strong> {selectedTerm.analogy}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "math" && (
        <div className="p-4 sm:p-6 rounded-2xl border border-zinc-800 bg-[#0d111a]/95 space-y-4 animate-in fade-in duration-150 shadow-xl">
          <div className="space-y-1 pb-2 border-b border-zinc-800/80">
            <h3 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-amber-400">
              The Math in Real Numbers
            </h3>
            <p className="text-xs text-zinc-400">
              What happens to numerical data when passing through this step:
            </p>
          </div>

          {concept.deepMath ? (
            <div className="space-y-3">
              {/* Formula */}
              <div className="p-3 sm:p-4 rounded-xl bg-zinc-950 border border-zinc-700 text-center font-mono text-xs sm:text-sm font-bold text-amber-300 tracking-wide shadow-inner">
                {concept.deepMath.formulaLatex}
              </div>

              {/* Given Inputs */}
              <div className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800 text-xs sm:text-sm font-mono text-zinc-200 shadow-inner">
                <strong className="text-amber-400 font-semibold">Inputs: </strong>
                {concept.deepMath.numericalExample.givenInputs}
              </div>

              {/* Steps */}
              <div className="space-y-2 pt-0.5">
                {concept.deepMath.numericalExample.stepByStepArithmetic.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-xl bg-zinc-950/60 border border-zinc-800/90 text-xs sm:text-sm font-mono text-zinc-200 flex items-start gap-2.5 shadow-sm"
                  >
                    <span className="text-amber-400 font-bold flex-shrink-0">Step {idx + 1}:</span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>

              {/* Final Result */}
              <div className="p-3 sm:p-4 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-xs sm:text-sm font-mono font-bold text-emerald-300 flex items-center justify-between shadow-sm">
                <span>Output Result:</span>
                <span className="text-white text-xs sm:text-sm font-black">{concept.deepMath.numericalExample.finalResult}</span>
              </div>
            </div>
          ) : (
            <div className="p-3 rounded-xl bg-zinc-950 text-xs font-mono text-zinc-400">
              Passes input features directly into the model tensor.
            </div>
          )}
        </div>
      )}

      {activeTab === "check" && (
        <div className="p-4 sm:p-6 rounded-2xl border border-zinc-800 bg-[#0d111a]/95 space-y-4 animate-in fade-in duration-150 shadow-xl">
          <div className="space-y-1 pb-2 border-b border-zinc-800/80">
            <h3 className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-amber-400">
              Concept Intuition Check
            </h3>
            <p className="text-xs text-zinc-400">
              Verify your understanding before moving to Python implementation:
            </p>
          </div>

          {concept.predictQuestion && (
            <div className="p-4 sm:p-5 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-3.5">
              <p className="text-xs sm:text-sm font-bold text-white leading-relaxed">
                {concept.predictQuestion.prompt}
              </p>

              <div className="space-y-3">
                {concept.predictQuestion.options.map((opt, optIdx) => {
                  const isSelected = selectedPredictOption === optIdx;
                  const isCorrect = optIdx === concept.predictQuestion?.correctIndex;

                  let style = "bg-zinc-900/80 hover:bg-zinc-850 text-zinc-200 border-zinc-800";
                  if (selectedPredictOption !== null) {
                    if (isSelected) {
                      style = isCorrect
                        ? "bg-emerald-500/20 border-emerald-500/50 text-emerald-100 font-bold"
                        : "bg-rose-500/20 border-rose-500/50 text-rose-100 font-bold";
                    } else if (isCorrect) {
                      style = "bg-emerald-500/15 border-emerald-500/30 text-emerald-200 font-semibold";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handlePredictSelect(optIdx)}
                      className={`w-full text-left p-4 rounded-xl border text-sm sm:text-base transition-all flex items-start gap-3 cursor-pointer ${style}`}
                    >
                      <span className="font-mono text-zinc-400 font-bold mt-0.5">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <span className="flex-1 leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {predictFeedback && (
                <div
                  className={`p-4 rounded-xl border text-sm sm:text-base flex items-center gap-3 ${
                    predictFeedback.correct
                      ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
                      : "bg-zinc-900 border-zinc-700 text-zinc-200"
                  }`}
                >
                  <span className="text-base sm:text-lg">{predictFeedback.correct ? "✓" : "💡"}</span>
                  <span className="leading-relaxed font-medium">{predictFeedback.explanation}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. Sleek Bottom Action: Advance to Code */}
      <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-sm text-zinc-400 font-mono">
          Ready to implement in Python?
        </span>

        <button
          type="button"
          onClick={onProceedToBuild}
          className="w-full sm:w-auto px-7 py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-sm sm:text-base shadow-lg transition-all flex items-center justify-center gap-2.5 active:scale-95 cursor-pointer"
        >
          <span>Proceed to Phase 2: Build in Python</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* 5. Minimal Slide-Out Socrates AI Drawer (No Clutter on Main Page) */}
      {isSocratesOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-zinc-950 border-l border-zinc-800 shadow-2xl z-50 p-5 flex flex-col space-y-4 animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between border-b border-zinc-800/80 pb-3">
            <div className="flex items-center gap-2 text-zinc-200 font-medium text-xs md:text-sm">
              <Sparkles className="w-4 h-4 text-zinc-400" />
              <span>Ask Socrates AI</span>
            </div>
            <button
              type="button"
              onClick={() => setIsSocratesOpen(false)}
              className="p-1 rounded-md text-zinc-400 hover:text-white hover:bg-zinc-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-zinc-400 leading-relaxed">
            Ask any question in plain English. Socrates explains without intimidating jargon.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={askText}
              onChange={(e) => setAskText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder="e.g. Why do we need weights? Give me an analogy..."
              className="flex-1 bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-700"
            />
            <button
              type="button"
              onClick={() => handleAsk()}
              disabled={isAsking || !askText.trim()}
              className="px-3 py-2 rounded-lg bg-zinc-100 hover:bg-white text-zinc-900 font-medium text-xs transition-all disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => handleAsk("Explain this with a simple everyday analogy")}
              className="px-2.5 py-1 rounded-md bg-zinc-900 text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors"
            >
              Simple analogy
            </button>
            <button
              type="button"
              onClick={() => handleAsk("Why can't we just write if/else statements?")}
              className="px-2.5 py-1 rounded-md bg-zinc-900 text-xs text-zinc-400 hover:text-zinc-200 border border-zinc-800 transition-colors"
            >
              Why not if/else?
            </button>
          </div>

          {socratesAnswer && (
            <div className="p-3.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs space-y-2 animate-in fade-in duration-150 overflow-y-auto">
              <p className="text-zinc-300 leading-relaxed">{socratesAnswer.explanation}</p>
              {socratesAnswer.analogy && (
                <p className="text-zinc-400 italic border-t border-zinc-800/80 pt-2 font-normal">
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
