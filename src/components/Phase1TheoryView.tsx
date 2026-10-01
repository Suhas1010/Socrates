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
  // Regex to match code tokens like X_train, y_train, model.fit(), [x1, x2], etc., or `code`
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
          className="px-2.5 py-1 mx-1 rounded-lg bg-slate-900 border border-amber-400/40 text-amber-300 font-mono text-xs md:text-sm font-bold shadow-sm inline-block"
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

  // Split into paragraphs by double newlines or single newlines
  const paragraphs = text.split(/\n\s*\n/);

  return (
    <div className="space-y-4 text-base md:text-lg leading-relaxed md:leading-8 text-slate-100 font-sans">
      {paragraphs.map((para, pIdx) => {
        const lines = para.split("\n").map((l) => l.trim()).filter(Boolean);

        // Check if this paragraph contains bullet items
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
            <div key={pIdx} className="space-y-3">
              {introLines.length > 0 && (
                <p className="font-bold text-white text-base md:text-lg tracking-wide">
                  {renderFormattedInlineText(introLines.join(" "))}
                </p>
              )}
              <ul className="space-y-2 pt-1">
                {listItems.map((item, itemIdx) => (
                   <li
                    key={itemIdx}
                    className="flex items-start gap-3 bg-slate-900/60 p-3.5 rounded-lg border border-slate-800 text-sm md:text-base leading-relaxed text-slate-200"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                    <span className="flex-1">
                      {renderFormattedInlineText(item)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        // Standard paragraph or heading
        const isHeading =
          lines.length === 1 && (para.endsWith(":") || para.startsWith("🎓") || para.startsWith("💡"));

        if (isHeading) {
          return (
            <p key={pIdx} className="font-semibold text-amber-300 text-sm md:text-base tracking-wide pt-1">
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
    <div className="max-w-4xl mx-auto space-y-4 pb-10 animate-in fade-in duration-200">
      {/* 1. Sleek Compact Header with 1-Line Pipeline Stepper */}
      <div className="rounded-xl bg-slate-900/60 border border-slate-800 p-5 space-y-4 shadow-sm">
        {/* Minimal 1-Line Breadcrumb Pipeline */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs">
          {pipelineStages.map((stg, sIdx) => {
            const isCurrent = sIdx === currentStageIndex;
            const isPast = sIdx < currentStageIndex;
            return (
              <React.Fragment key={stg.num}>
                <div
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all whitespace-nowrap text-xs ${
                    isCurrent
                      ? "bg-amber-400/10 text-amber-300 border border-amber-400/30 font-semibold shadow-sm"
                      : isPast
                      ? "bg-slate-950/60 text-emerald-400 font-medium border border-emerald-500/20"
                      : "bg-slate-950/40 text-slate-500 border border-slate-800/60"
                  }`}
                >
                  <span className="font-mono text-[11px] opacity-75">{stg.num}.</span>
                  <span>{stg.name}</span>
                  {isCurrent && <span className="text-[10px] ml-1 bg-amber-400/20 px-1.5 py-0.2 rounded font-mono font-medium">ACTIVE</span>}
                </div>
                {sIdx < pipelineStages.length - 1 && (
                  <span className="text-slate-600 px-1 select-none text-xs">→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Title and Simple Plain-English Hook */}
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400">
              PHASE 1: CONCEPT MASTERCLASS
            </span>
          </div>
          <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
            {concept.title}
          </h2>
          <p className="text-xs md:text-sm text-slate-300 leading-relaxed font-normal">
            {concept.hook}
          </p>
        </div>
      </div>

      {/* 2. Uncluttered 3-Tab Navigator */}
      <div className="flex items-center justify-between gap-3 border-b border-slate-800 pb-3">
        <div className="flex items-center gap-1.5 p-1 rounded-lg bg-slate-900/60 border border-slate-800">
          <button
            type="button"
            onClick={() => setActiveTab("intuition")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "intuition"
                ? "bg-amber-400/10 text-amber-300 border border-amber-400/30 shadow-sm font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>1. Core Idea</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("math")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "math"
                ? "bg-amber-400/10 text-amber-300 border border-amber-400/30 shadow-sm font-semibold"
                : "text-slate-400 hover:text-slate-200"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>2. Real Numbers</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("check")}
            className={`px-3.5 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "check"
                ? "bg-amber-400/10 text-amber-300 border border-amber-400/30 shadow-sm font-semibold"
                : "text-slate-400 hover:text-slate-200"
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
          className="px-3 py-1.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Ask Socrates</span>
          <span className="sm:hidden">Ask</span>
        </button>
      </div>

      {activeTab === "intuition" && (
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-6 animate-in fade-in duration-150 shadow-sm">
          {/* Plain English Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-slate-800">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400">
                Why We Are Doing This (In Plain English)
              </h3>
            </div>
            <div className="pt-0.5">
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
            <div className="p-4 rounded-lg bg-amber-950/20 border border-amber-500/20 flex items-start gap-3.5">
              <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-amber-400 text-sm">
                <Lightbulb className="w-4 h-4 text-amber-400" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <span className="text-xs font-mono font-semibold text-amber-300 uppercase tracking-wider block">
                  The Everyday Real-World Analogy
                </span>
                <FormattedContent text={concept.corePrinciple} />
              </div>
            </div>
          )}

          {/* Jargon Buster Clickable Pills */}
          {concept.technicalTerms && concept.technicalTerms.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                <span className="text-xs font-mono font-medium uppercase tracking-wider text-slate-400 block">
                  Click Any Term to See Simple Meaning:
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
                      className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-amber-400/20 text-amber-300 border border-amber-400/50 shadow-sm"
                          : "bg-slate-950/60 text-slate-300 hover:text-white border border-slate-800 hover:border-slate-700"
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
                <div className="p-4 rounded-lg bg-slate-950 border border-amber-500/30 space-y-2 animate-in fade-in duration-150 shadow-md">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <strong className="text-sm font-semibold text-amber-300">
                      {selectedTerm.term}
                    </strong>
                    <button
                      type="button"
                      onClick={() => setSelectedTerm(null)}
                      className="text-slate-400 hover:text-white text-xs px-2 py-0.5 rounded bg-slate-900 border border-slate-800 transition-colors"
                    >
                      Close ✕
                    </button>
                  </div>
                  <p className="text-xs md:text-sm text-slate-200 leading-relaxed font-sans">
                    {selectedTerm.definition}
                  </p>
                  <p className="text-xs text-amber-200/90 italic bg-amber-950/20 p-2.5 rounded border border-amber-500/20">
                    💡 <strong>Analogy:</strong> {selectedTerm.analogy}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "math" && (
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-5 animate-in fade-in duration-150 shadow-sm">
          <div className="space-y-1 pb-2 border-b border-slate-800">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400">
              The Math in Real Numbers
            </h3>
            <p className="text-xs md:text-sm text-slate-400">
              What happens to numerical data when passing through this step:
            </p>
          </div>

          {concept.deepMath ? (
            <div className="space-y-3.5">
              {/* Formula */}
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-center font-mono text-base md:text-lg font-semibold text-amber-300 tracking-wide shadow-inner">
                {concept.deepMath.formulaLatex}
              </div>

              {/* Given Inputs */}
              <div className="p-3 rounded-lg bg-slate-950/80 border border-slate-800 text-xs md:text-sm font-mono text-slate-200 shadow-inner">
                <strong className="text-amber-400 font-semibold">Inputs: </strong>
                {concept.deepMath.numericalExample.givenInputs}
              </div>

              {/* Steps */}
              <div className="space-y-2 pt-1">
                {concept.deepMath.numericalExample.stepByStepArithmetic.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 text-xs md:text-sm font-mono text-slate-200 flex items-start gap-2.5"
                  >
                    <span className="text-amber-400 font-semibold flex-shrink-0">Step {idx + 1}:</span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>

              {/* Final Result */}
              <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs md:text-sm font-mono font-medium text-emerald-300 flex items-center justify-between">
                <span>Output Result:</span>
                <span className="text-white text-sm md:text-base font-semibold">{concept.deepMath.numericalExample.finalResult}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-slate-950 text-xs font-mono text-slate-400">
              Passes input features directly into the model tensor.
            </div>
          )}
        </div>
      )}

      {activeTab === "check" && (
        <div className="p-6 rounded-xl border border-slate-800 bg-slate-900/60 space-y-5 animate-in fade-in duration-150 shadow-sm">
          <div className="space-y-1 pb-2 border-b border-slate-800">
            <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-amber-400">
              Concept Intuition Check
            </h3>
            <p className="text-xs md:text-sm text-slate-400">
              Verify your understanding before moving to Python implementation:
            </p>
          </div>

          {concept.predictQuestion && (
            <div className="p-5 rounded-lg bg-slate-950/80 border border-slate-800 space-y-4">
              <p className="text-sm md:text-base font-medium text-white leading-relaxed">
                {concept.predictQuestion.prompt}
              </p>

              <div className="space-y-2">
                {concept.predictQuestion.options.map((opt, optIdx) => {
                  const isSelected = selectedPredictOption === optIdx;
                  const isCorrect = optIdx === concept.predictQuestion?.correctIndex;

                  let style = "bg-slate-900/60 hover:bg-slate-800 text-slate-300 border-slate-800";
                  if (selectedPredictOption !== null) {
                    if (isSelected) {
                      style = isCorrect
                        ? "bg-emerald-500/20 border-emerald-500/50 text-white font-medium ring-1 ring-emerald-500/40"
                        : "bg-rose-500/20 border-rose-500/50 text-white font-medium ring-1 ring-rose-500/40";
                    } else if (isCorrect) {
                      style = "bg-emerald-500/10 border-emerald-500/30 text-emerald-300";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handlePredictSelect(optIdx)}
                      className={`w-full text-left p-3.5 rounded-lg border text-xs md:text-sm transition-all flex items-start gap-3 ${style}`}
                    >
                      <span className="font-mono text-amber-400 font-semibold mt-0.5">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <span className="flex-1 leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {predictFeedback && (
                <div
                  className={`p-3.5 rounded-lg border text-xs md:text-sm flex items-center gap-3 ${
                    predictFeedback.correct
                      ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
                      : "bg-amber-950/30 border-amber-500/30 text-amber-200"
                  }`}
                >
                  <span className="text-base">{predictFeedback.correct ? "✓" : "💡"}</span>
                  <span className="leading-relaxed font-normal">{predictFeedback.explanation}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. Sleek Bottom Action: Advance to Code */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-xs text-slate-400 font-mono">
          Ready to implement in Python?
        </span>

        <button
          type="button"
          onClick={onProceedToBuild}
          className="w-full sm:w-auto px-6 py-2.5 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-xs md:text-sm shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <span>Proceed to Phase 2: Build in Python</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>

      {/* 5. Minimal Slide-Out Socrates AI Drawer (No Clutter on Main Page) */}
      {isSocratesOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[400px] bg-[#0E1526] border-l border-slate-800 shadow-2xl z-50 p-5 flex flex-col space-y-4 animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between border-b border-slate-800 pb-3">
            <div className="flex items-center gap-2 text-amber-400 font-semibold text-sm">
              <Sparkles className="w-4 h-4" />
              <span>Ask Socrates AI</span>
            </div>
            <button
              type="button"
              onClick={() => setIsSocratesOpen(false)}
              className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <p className="text-xs text-slate-400 leading-relaxed">
            Ask any question in plain English. Socrates explains without intimidating jargon.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={askText}
              onChange={(e) => setAskText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder="e.g. Why do we need weights? Give me an analogy..."
              className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={() => handleAsk()}
              disabled={isAsking || !askText.trim()}
              className="px-3 py-2 rounded-lg bg-amber-400 hover:bg-amber-300 text-zinc-950 font-semibold text-xs transition-all disabled:opacity-40"
            >
              <Send className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="flex flex-wrap gap-1.5 pt-0.5">
            <button
              type="button"
              onClick={() => handleAsk("Explain this with a simple everyday analogy")}
              className="px-2.5 py-1 rounded-md bg-slate-900 text-xs text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              Simple analogy
            </button>
            <button
              type="button"
              onClick={() => handleAsk("Why can't we just write if/else statements?")}
              className="px-2.5 py-1 rounded-md bg-slate-900 text-xs text-slate-400 hover:text-white border border-slate-800 transition-colors"
            >
              Why not if/else?
            </button>
          </div>

          {socratesAnswer && (
            <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 text-xs space-y-2 animate-in fade-in duration-150 overflow-y-auto">
              <p className="text-slate-200 leading-relaxed">{socratesAnswer.explanation}</p>
              {socratesAnswer.analogy && (
                <p className="text-amber-300/90 italic border-t border-slate-800/80 pt-2 font-medium">
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
