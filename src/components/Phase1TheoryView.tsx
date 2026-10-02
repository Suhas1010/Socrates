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
          className="px-2 py-0.5 mx-1 rounded bg-zinc-800/80 border border-zinc-700/50 text-zinc-200 font-mono text-xs md:text-sm font-normal inline-block"
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
    <div className="space-y-4 text-sm md:text-base leading-relaxed text-zinc-300 font-sans">
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
                <p className="font-medium text-zinc-100 text-sm md:text-base">
                  {renderFormattedInlineText(introLines.join(" "))}
                </p>
              )}
              <ul className="space-y-2 pt-1 pl-1">
                {listItems.map((item, itemIdx) => (
                  <li
                    key={itemIdx}
                    className="flex items-start gap-2.5 text-sm md:text-base leading-relaxed text-zinc-300"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 mt-2 flex-shrink-0" />
                    <span className="flex-1">
                      {renderFormattedInlineText(item)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          );
        }

        const isHeading =
          lines.length === 1 && (para.endsWith(":") || para.startsWith("🎓") || para.startsWith("💡"));

        if (isHeading) {
          return (
            <p key={pIdx} className="font-medium text-zinc-200 text-sm md:text-base pt-1">
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
    <div className="max-w-4xl mx-auto space-y-5 pb-10 animate-in fade-in duration-200">
      {/* 1. Sleek Concept Header */}
      <div className="py-2 space-y-2 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-mono font-medium uppercase tracking-wider text-zinc-400">
            Phase 1 · Concept Masterclass
          </span>
        </div>
        <h1 className="text-xl md:text-2xl font-semibold tracking-tight text-zinc-100 font-sans">
          {concept.title}
        </h1>
        {concept.hook && (
          <p className="text-xs md:text-sm text-zinc-400 leading-relaxed max-w-3xl">
            {concept.hook}
          </p>
        )}
      </div>

      {/* 2. Uncluttered 3-Tab Navigator */}
      <div className="flex items-center justify-between gap-3 border-b border-zinc-800/80 pb-3">
        <div className="flex items-center gap-1 p-0.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80">
          <button
            type="button"
            onClick={() => setActiveTab("intuition")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "intuition"
                ? "bg-zinc-800 text-zinc-100 shadow-sm font-medium"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>1. Core Idea</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("math")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "math"
                ? "bg-zinc-800 text-zinc-100 shadow-sm font-medium"
                : "text-zinc-400 hover:text-zinc-200"
            }`}
          >
            <Calculator className="w-3.5 h-3.5" />
            <span>2. Real Numbers</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("check")}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
              activeTab === "check"
                ? "bg-zinc-800 text-zinc-100 shadow-sm font-medium"
                : "text-zinc-400 hover:text-zinc-200"
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
          className="px-3 py-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-700 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <Sparkles className="w-3.5 h-3.5 text-zinc-400" />
          <span className="hidden sm:inline">Ask Socrates</span>
          <span className="sm:hidden">Ask</span>
        </button>
      </div>

      {activeTab === "intuition" && (
        <div className="p-6 rounded-xl border border-zinc-800/80 bg-zinc-900/40 space-y-6 animate-in fade-in duration-150 shadow-sm">
          {/* Plain English Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/80">
              <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
              <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-400">
                Core Explanation (Plain English)
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
            <div className="p-4 rounded-lg bg-zinc-900/80 border border-zinc-800 flex items-start gap-3.5">
              <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center flex-shrink-0 text-zinc-300 text-xs">
                <Lightbulb className="w-3.5 h-3.5 text-zinc-300" />
              </div>
              <div className="space-y-1.5 flex-1 min-w-0">
                <span className="text-xs font-mono font-medium text-zinc-400 uppercase tracking-wider block">
                  Everyday Analogy
                </span>
                <FormattedContent text={concept.corePrinciple} />
              </div>
            </div>
          )}

          {/* Jargon Buster Clickable Pills */}
          {concept.technicalTerms && concept.technicalTerms.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-zinc-400" />
                <span className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-400 block">
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
                      className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                        isSelected
                          ? "bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm"
                          : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200 border border-zinc-800 hover:border-zinc-750"
                      }`}
                    >
                      <BookOpen className="w-3 h-3 opacity-60" />
                      <span>{termItem.term.split("(")[0].trim()}</span>
                    </button>
                  );
                })}
              </div>

              {/* Term Detail Box */}
              {selectedTerm && (
                <div className="p-4 rounded-lg bg-zinc-950 border border-zinc-800 space-y-2 animate-in fade-in duration-150 shadow-md">
                  <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                    <strong className="text-xs font-semibold text-zinc-200">
                      {selectedTerm.term}
                    </strong>
                    <button
                      type="button"
                      onClick={() => setSelectedTerm(null)}
                      className="text-zinc-500 hover:text-zinc-300 text-xs px-2 py-0.5 rounded bg-zinc-900 border border-zinc-800 transition-colors"
                    >
                      Close ✕
                    </button>
                  </div>
                  <p className="text-xs md:text-sm text-zinc-300 leading-relaxed font-sans">
                    {selectedTerm.definition}
                  </p>
                  <p className="text-xs text-zinc-400 italic bg-zinc-900/80 p-2.5 rounded border border-zinc-800">
                    💡 <strong>Analogy:</strong> {selectedTerm.analogy}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "math" && (
        <div className="p-6 rounded-xl border border-zinc-800/80 bg-zinc-900/40 space-y-5 animate-in fade-in duration-150 shadow-sm">
          <div className="space-y-1 pb-2 border-b border-zinc-800/80">
            <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-400">
              The Math in Real Numbers
            </h3>
            <p className="text-xs text-zinc-500">
              What happens to numerical data when passing through this step:
            </p>
          </div>

          {concept.deepMath ? (
            <div className="space-y-3">
              {/* Formula */}
              <div className="p-3.5 rounded-lg bg-zinc-950 border border-zinc-800 text-center font-mono text-sm md:text-base font-medium text-zinc-200 tracking-wide shadow-inner">
                {concept.deepMath.formulaLatex}
              </div>

              {/* Given Inputs */}
              <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 text-xs font-mono text-zinc-300 shadow-inner">
                <strong className="text-zinc-400 font-medium">Inputs: </strong>
                {concept.deepMath.numericalExample.givenInputs}
              </div>

              {/* Steps */}
              <div className="space-y-2 pt-1">
                {concept.deepMath.numericalExample.stepByStepArithmetic.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80 text-xs font-mono text-zinc-300 flex items-start gap-2.5"
                  >
                    <span className="text-zinc-400 font-medium flex-shrink-0">Step {idx + 1}:</span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>

              {/* Final Result */}
              <div className="p-3.5 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-xs font-mono font-medium text-emerald-300 flex items-center justify-between">
                <span>Output Result:</span>
                <span className="text-zinc-100 text-sm font-semibold">{concept.deepMath.numericalExample.finalResult}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-lg bg-zinc-950 text-xs font-mono text-zinc-500">
              Passes input features directly into the model tensor.
            </div>
          )}
        </div>
      )}

      {activeTab === "check" && (
        <div className="p-6 rounded-xl border border-zinc-800/80 bg-zinc-900/40 space-y-5 animate-in fade-in duration-150 shadow-sm">
          <div className="space-y-1 pb-2 border-b border-zinc-800/80">
            <h3 className="text-xs font-mono font-medium uppercase tracking-wider text-zinc-400">
              Concept Intuition Check
            </h3>
            <p className="text-xs text-zinc-500">
              Verify your understanding before moving to Python implementation:
            </p>
          </div>

          {concept.predictQuestion && (
            <div className="p-5 rounded-lg bg-zinc-950/80 border border-zinc-800 space-y-4">
              <p className="text-xs md:text-sm font-medium text-zinc-200 leading-relaxed">
                {concept.predictQuestion.prompt}
              </p>

              <div className="space-y-2">
                {concept.predictQuestion.options.map((opt, optIdx) => {
                  const isSelected = selectedPredictOption === optIdx;
                  const isCorrect = optIdx === concept.predictQuestion?.correctIndex;

                  let style = "bg-zinc-900/60 hover:bg-zinc-850 text-zinc-300 border-zinc-800";
                  if (selectedPredictOption !== null) {
                    if (isSelected) {
                      style = isCorrect
                        ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-200 font-medium"
                        : "bg-rose-500/15 border-rose-500/40 text-rose-200 font-medium";
                    } else if (isCorrect) {
                      style = "bg-emerald-500/10 border-emerald-500/20 text-emerald-300";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handlePredictSelect(optIdx)}
                      className={`w-full text-left p-3 rounded-lg border text-xs md:text-sm transition-all flex items-start gap-2.5 ${style}`}
                    >
                      <span className="font-mono text-zinc-500 font-medium mt-0.5">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <span className="flex-1 leading-relaxed">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {predictFeedback && (
                <div
                  className={`p-3 rounded-lg border text-xs flex items-center gap-2.5 ${
                    predictFeedback.correct
                      ? "bg-emerald-950/20 border-emerald-500/20 text-emerald-300"
                      : "bg-zinc-900 border-zinc-700 text-zinc-300"
                  }`}
                >
                  <span className="text-sm">{predictFeedback.correct ? "✓" : "💡"}</span>
                  <span className="leading-relaxed font-normal">{predictFeedback.explanation}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. Sleek Bottom Action: Advance to Code */}
      <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-xs text-zinc-500 font-mono">
          Ready to implement in Python?
        </span>

        <button
          type="button"
          onClick={onProceedToBuild}
          className="w-full sm:w-auto px-5 py-2.5 rounded-lg bg-zinc-100 hover:bg-white text-zinc-900 font-medium text-xs md:text-sm shadow-sm transition-all flex items-center justify-center gap-2"
        >
          <span>Proceed to Phase 2: Build in Python</span>
          <ArrowRight className="w-4 h-4" />
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
