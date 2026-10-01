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
              <ul className="space-y-2.5 pt-1">
                {listItems.map((item, itemIdx) => (
                  <li
                    key={itemIdx}
                    className="flex items-start gap-3.5 bg-slate-900/80 p-4 rounded-2xl border border-white/10 shadow-sm"
                  >
                    <span className="w-2.5 h-2.5 rounded-full bg-amber-400 mt-2.5 flex-shrink-0 shadow-sm shadow-amber-400/60" />
                    <span className="flex-1 text-slate-100 text-base md:text-lg leading-relaxed">
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
            <p key={pIdx} className="font-bold text-amber-300 text-base md:text-lg tracking-wide pt-1">
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
        {/* Minimal 1-Line Breadcrumb Pipeline */}
        <div className="flex items-center justify-between gap-2 overflow-x-auto pb-1 text-xs md:text-sm">
          {pipelineStages.map((stg, sIdx) => {
            const isCurrent = sIdx === currentStageIndex;
            const isPast = sIdx < currentStageIndex;
            return (
              <React.Fragment key={stg.num}>
                <div
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl transition-all whitespace-nowrap ${
                    isCurrent
                      ? "bg-amber-400 text-zinc-950 font-black shadow-md shadow-amber-400/20 ring-2 ring-amber-400"
                      : isPast
                      ? "bg-slate-900/80 text-emerald-400 font-bold border border-emerald-500/30"
                      : "bg-slate-900/40 text-slate-500 border border-white/5"
                  }`}
                >
                  <span className="text-base">{stg.icon}</span>
                  <span className="font-bold">{stg.num}. {stg.name}</span>
                  {isCurrent && <span className="text-xs ml-1 bg-zinc-950/20 px-2 py-0.5 rounded-full font-black">ACTIVE</span>}
                </div>
                {sIdx < pipelineStages.length - 1 && (
                  <span className="text-slate-600 px-1 select-none font-bold">→</span>
                )}
              </React.Fragment>
            );
          })}
        </div>

        {/* Title and Simple Plain-English Hook */}
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <span className="text-xs md:text-sm font-mono font-bold uppercase tracking-wider text-amber-400">
              PHASE 1: CONCEPT MASTERCLASS
            </span>
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-white">
            {concept.title}
          </h2>
          <p className="text-sm md:text-base text-slate-300 leading-relaxed font-normal">
            {concept.hook}
          </p>
        </div>
      </div>

      {/* 2. Uncluttered 3-Tab Navigator */}
      <div className="flex items-center justify-between gap-3 border-b border-white/10 pb-3">
        <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-slate-900/80 border border-white/15 shadow-inner">
          <button
            type="button"
            onClick={() => setActiveTab("intuition")}
            className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-extrabold transition-all flex items-center gap-2 ${
              activeTab === "intuition"
                ? "bg-amber-400 text-zinc-950 shadow-md font-black"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Lightbulb className="w-4 h-4" />
            <span>1. Core Idea</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("math")}
            className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-extrabold transition-all flex items-center gap-2 ${
              activeTab === "math"
                ? "bg-amber-400 text-zinc-950 shadow-md font-black"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Calculator className="w-4 h-4" />
            <span>2. Real Numbers</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("check")}
            className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-extrabold transition-all flex items-center gap-2 ${
              activeTab === "check"
                ? "bg-amber-400 text-zinc-950 shadow-md font-black"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>3. Quick Check</span>
          </button>
        </div>

        {/* Floating Socrates Ask Button */}
        <button
          type="button"
          onClick={() => setIsSocratesOpen(true)}
          className="px-4 py-2.5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-amber-300 hover:text-white border border-amber-500/30 text-xs md:text-sm font-bold transition-all flex items-center gap-2 shadow-sm"
        >
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="hidden sm:inline">Ask Socrates</span>
          <span className="sm:hidden">Ask</span>
        </button>
      </div>

      {/* 3. Tab Contents: Focused & Breathing Room */}
      {activeTab === "intuition" && (
        <div className="glass-panel p-7 md:p-9 rounded-3xl border border-white/15 shadow-2xl space-y-7 animate-in fade-in duration-150 bg-slate-900/80">
          {/* Plain English Breakdown */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-white/10">
              <span className="w-3 h-3 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
              <h3 className="text-sm md:text-base font-mono font-black uppercase tracking-wider text-amber-400">
                Why We Are Doing This (In Plain English)
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
            <div className="p-6 md:p-7 rounded-2xl bg-amber-950/30 border border-amber-500/30 flex items-start gap-4 shadow-inner">
              <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center flex-shrink-0 text-2xl shadow-sm">
                💡
              </div>
              <div className="space-y-2 flex-1 min-w-0">
                <span className="text-xs md:text-sm font-mono font-bold text-amber-300 uppercase tracking-wider block">
                  The Everyday Real-World Analogy
                </span>
                <FormattedContent text={concept.corePrinciple} />
              </div>
            </div>
          )}

          {/* Jargon Buster Clickable Pills */}
          {concept.technicalTerms && concept.technicalTerms.length > 0 && (
            <div className="space-y-3.5 pt-2">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-slate-400" />
                <span className="text-xs md:text-sm font-mono font-bold uppercase tracking-wider text-slate-300 block">
                  Click Any Term to See Simple Meaning (0 Jargon):
                </span>
              </div>
              <div className="flex flex-wrap gap-2.5">
                {concept.technicalTerms.filter(Boolean).map((termItem) => {
                  const isSelected = selectedTerm?.term === termItem.term;
                  return (
                    <button
                      key={termItem.term}
                      type="button"
                      onClick={() => setSelectedTerm(isSelected ? null : termItem)}
                      className={`px-4 py-2.5 rounded-2xl text-xs md:text-sm font-semibold transition-all flex items-center gap-2 ${
                        isSelected
                          ? "bg-amber-400 text-zinc-950 font-black shadow-lg scale-[1.02]"
                          : "bg-slate-900/90 text-slate-200 hover:text-white border border-white/10 hover:border-amber-400/40"
                      }`}
                    >
                      <BookOpen className="w-4 h-4 opacity-75" />
                      <span>{termItem.term.split("(")[0].trim()}</span>
                    </button>
                  );
                })}
              </div>

              {/* Term Detail Box */}
              {selectedTerm && (
                <div className="p-5 md:p-6 rounded-2xl bg-slate-950 border border-amber-400/40 space-y-3 animate-in fade-in duration-150 shadow-2xl">
                  <div className="flex items-center justify-between border-b border-white/10 pb-3">
                    <strong className="text-base md:text-lg font-black text-amber-300">
                      {selectedTerm.term}
                    </strong>
                    <button
                      type="button"
                      onClick={() => setSelectedTerm(null)}
                      className="text-slate-400 hover:text-white text-xs px-3 py-1.5 rounded-xl bg-slate-900 border border-white/15 transition-colors font-medium"
                    >
                      Close ✕
                    </button>
                  </div>
                  <p className="text-base text-slate-100 leading-relaxed font-sans">
                    {selectedTerm.definition}
                  </p>
                  <p className="text-sm md:text-base text-amber-200 italic bg-amber-950/30 p-3.5 rounded-xl border border-amber-500/20">
                    💡 <strong>Analogy:</strong> {selectedTerm.analogy}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "math" && (
        <div className="glass-panel p-7 md:p-9 rounded-3xl border border-white/15 shadow-2xl space-y-6 animate-in fade-in duration-150 bg-slate-900/80">
          <div className="space-y-1.5 pb-2 border-b border-white/10">
            <h3 className="text-sm md:text-base font-mono font-black uppercase tracking-wider text-amber-400">
              The Math in Real Numbers (No Fluff)
            </h3>
            <p className="text-sm md:text-base text-slate-300">
              Here is what happens to actual numbers when they pass through this step:
            </p>
          </div>

          {concept.deepMath ? (
            <div className="space-y-4">
              {/* Formula */}
              <div className="p-5 rounded-2xl bg-slate-950 border border-white/15 text-center font-mono text-lg md:text-xl font-black text-amber-300 tracking-wide shadow-inner">
                {concept.deepMath.formulaLatex}
              </div>

              {/* Given Inputs */}
              <div className="p-4 rounded-2xl bg-slate-900 border border-white/10 text-base md:text-lg font-mono text-slate-100 shadow-inner">
                <strong className="text-amber-400 font-bold">Sample Inputs: </strong>
                {concept.deepMath.numericalExample.givenInputs}
              </div>

              {/* Steps */}
              <div className="space-y-3 pt-1">
                {concept.deepMath.numericalExample.stepByStepArithmetic.map((step, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-2xl bg-slate-950/80 border border-white/10 text-base md:text-lg font-mono text-slate-100 flex items-start gap-3.5 shadow-sm"
                  >
                    <span className="text-amber-400 font-black flex-shrink-0">Step {idx + 1}:</span>
                    <span className="leading-relaxed">{step}</span>
                  </div>
                ))}
              </div>

              {/* Final Result */}
              <div className="p-5 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 text-base md:text-lg font-mono font-black text-emerald-300 flex items-center justify-between shadow-md">
                <span>Output Result:</span>
                <span className="text-white text-lg md:text-xl font-black">{concept.deepMath.numericalExample.finalResult}</span>
              </div>
            </div>
          ) : (
            <div className="p-5 rounded-2xl bg-slate-950 text-base font-mono text-slate-300">
              Passes input features directly into the model tensor.
            </div>
          )}
        </div>
      )}

      {activeTab === "check" && (
        <div className="glass-panel p-7 md:p-9 rounded-3xl border border-white/15 shadow-2xl space-y-6 animate-in fade-in duration-150 bg-slate-900/80">
          <div className="space-y-1.5 pb-2 border-b border-white/10">
            <h3 className="text-sm md:text-base font-mono font-black uppercase tracking-wider text-amber-400">
              Quick Concept Intuition Check
            </h3>
            <p className="text-sm md:text-base text-slate-300">
              Check your understanding before moving to Python code:
            </p>
          </div>

          {concept.predictQuestion && (
            <div className="p-6 md:p-7 rounded-2xl bg-slate-950 border border-white/10 space-y-5">
              <p className="text-lg md:text-xl font-bold text-white leading-relaxed">
                {concept.predictQuestion.prompt}
              </p>

              <div className="space-y-3">
                {concept.predictQuestion.options.map((opt, optIdx) => {
                  const isSelected = selectedPredictOption === optIdx;
                  const isCorrect = optIdx === concept.predictQuestion?.correctIndex;

                  let style = "bg-slate-900/90 hover:bg-slate-800 text-slate-200 border-white/10";
                  if (selectedPredictOption !== null) {
                    if (isSelected) {
                      style = isCorrect
                        ? "bg-emerald-500/25 border-emerald-400 text-white font-bold ring-2 ring-emerald-400/40"
                        : "bg-rose-500/25 border-rose-400 text-white font-bold ring-2 ring-rose-400/40";
                    } else if (isCorrect) {
                      style = "bg-emerald-500/15 border-emerald-500/40 text-emerald-200";
                    }
                  }

                  return (
                    <button
                      key={optIdx}
                      type="button"
                      onClick={() => handlePredictSelect(optIdx)}
                      className={`w-full text-left p-4 md:p-5 rounded-2xl border text-base md:text-lg transition-all flex items-start gap-4 ${style}`}
                    >
                      <span className="font-mono text-amber-400 font-black mt-0.5">
                        {String.fromCharCode(65 + optIdx)}.
                      </span>
                      <span className="flex-1 leading-relaxed font-medium">{opt}</span>
                    </button>
                  );
                })}
              </div>

              {predictFeedback && (
                <div
                  className={`p-4 md:p-5 rounded-2xl border text-base flex items-center gap-3.5 shadow-md ${
                    predictFeedback.correct
                      ? "bg-emerald-950/40 border-emerald-500/40 text-emerald-200"
                      : "bg-amber-950/40 border-amber-500/40 text-amber-200"
                  }`}
                >
                  <span className="text-2xl">{predictFeedback.correct ? "✅" : "💡"}</span>
                  <span className="leading-relaxed font-medium">{predictFeedback.explanation}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 4. Sleek Bottom Action: Advance to Code */}
      <div className="pt-3 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-xs md:text-sm text-slate-400 font-mono">
          Ready to write the Python function?
        </span>

        <button
          type="button"
          onClick={onProceedToBuild}
          className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-sm md:text-base shadow-xl shadow-amber-400/25 transition-all flex items-center justify-center gap-2.5"
        >
          <span>Proceed to Phase 2: Build in Python</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>

      {/* 5. Minimal Slide-Out Socrates AI Drawer (No Clutter on Main Page) */}
      {isSocratesOpen && (
        <div className="fixed inset-y-0 right-0 w-full sm:w-[420px] bg-[#0E1526] border-l border-white/15 shadow-2xl z-50 p-6 flex flex-col space-y-5 animate-in slide-in-from-right duration-200">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div className="flex items-center gap-2.5 text-amber-400 font-black text-base md:text-lg">
              <Sparkles className="w-5 h-5" />
              <span>Ask Socrates AI</span>
            </div>
            <button
              type="button"
              onClick={() => setIsSocratesOpen(false)}
              className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <p className="text-sm text-slate-300 leading-relaxed">
            Ask any question in plain English. Socrates explains without intimidating jargon.
          </p>

          <div className="flex gap-2">
            <input
              type="text"
              value={askText}
              onChange={(e) => setAskText(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAsk()}
              placeholder="e.g. Why do we need weights? Give me an analogy..."
              className="flex-1 bg-slate-950 border border-white/15 rounded-2xl px-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-400"
            />
            <button
              type="button"
              onClick={() => handleAsk()}
              disabled={isAsking || !askText.trim()}
              className="px-4 py-3 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-sm transition-all disabled:opacity-40"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleAsk("Explain this like I am 10 years old")}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-xs text-slate-300 hover:text-white border border-white/10"
            >
              👶 Explain like I am 10
            </button>
            <button
              type="button"
              onClick={() => handleAsk("Why can't we just write if/else statements?")}
              className="px-3 py-1.5 rounded-xl bg-slate-900 text-xs text-slate-300 hover:text-white border border-white/10"
            >
              🤔 Why not if/else?
            </button>
          </div>

          {socratesAnswer && (
            <div className="p-4 rounded-2xl bg-slate-950 border border-amber-500/30 text-sm space-y-2.5 animate-in fade-in duration-150 overflow-y-auto">
              <p className="text-slate-200 leading-relaxed">{socratesAnswer.explanation}</p>
              {socratesAnswer.analogy && (
                <p className="text-amber-300 italic border-t border-white/10 pt-2 font-medium">
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
