"use client";

import React, { useState } from "react";
import {
  Brain,
  Sparkles,
  BookOpen,
  Calculator,
  ArrowRight,
  HelpCircle,
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  MessageSquare,
  Send,
  RotateCcw,
  Zap,
} from "lucide-react";
import { Concept, ErrorType, ExplanationStrategy, TechnicalTerm } from "@/lib/types";
import { enrichConceptWithDeepTheory } from "@/lib/technicalDictionary";

interface Phase1TheoryViewProps {
  concept: Concept;
  goal: string;
  onProceedToBuild: () => void;
  onAskSocrates?: (question: string) => Promise<any>;
}

export const Phase1TheoryView: React.FC<Phase1TheoryViewProps> = ({
  concept: rawConcept,
  goal,
  onProceedToBuild,
}) => {
  // Enrich concept with deep technical glossary and math walkthrough
  const concept = enrichConceptWithDeepTheory(rawConcept, goal);

  const [selectedTerm, setSelectedTerm] = useState<TechnicalTerm | null>(
    concept.technicalTerms?.[0] || null
  );
  const [selectedPredictOption, setSelectedPredictOption] = useState<number | null>(null);
  const [predictFeedback, setPredictFeedback] = useState<{
    correct: boolean;
    explanation: string;
  } | null>(null);

  // Socrates AI inline coaching state
  const [askQuestionText, setAskQuestionText] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [socratesAnswer, setSocratesAnswer] = useState<{
    title: string;
    explanation: string;
    analogy?: string;
  } | null>(null);

  const handlePredictSelect = (index: number) => {
    setSelectedPredictOption(index);
    const pq = concept.predictQuestion;
    if (!pq) return;

    if (index === pq.correctIndex) {
      setPredictFeedback({
        correct: true,
        explanation: `Spot-on intuition! ${pq.explanation}`,
      });
    } else {
      setPredictFeedback({
        correct: false,
        explanation: `Not quite: ${pq.explanation}`,
      });
    }
  };

  const handleAskSocrates = async (queryText?: string) => {
    const q = queryText || askQuestionText;
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
          title: data.title || "Socrates Explanation",
          explanation: data.explanation || "Let's break this down intuitively...",
          analogy: data.exampleOrFormula,
        });
      } else {
        setSocratesAnswer({
          title: "Socrates Intuition Coach",
          explanation:
            "Every machine learning model is fundamentally a function that maps inputs (features) to outputs (predictions) using weights as adjustable dials.",
          analogy:
            "Think of tuning a radio: the dial position is the weight, the signal strength is the feature, and clear music is the prediction!",
        });
      }
    } catch {
      setSocratesAnswer({
        title: "Socrates Intuition Coach",
        explanation:
          "In machine learning, we don't hardcode fixed if/else rules. Instead, the model automatically discovers numerical weights that minimize error across thousands of training examples.",
        analogy: "Like learning to ride a bike through muscle feedback rather than reading a manual.",
      });
    } finally {
      setIsAsking(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-300">
      {/* 1. Masterclass Header Card */}
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-cyan-500/20 shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
        
        <div className="flex flex-wrap items-center gap-2.5 mb-3">
          <span className="px-3 py-1 rounded-full bg-cyan-500/15 border border-cyan-500/30 text-cyan-300 text-xs font-mono font-bold tracking-wide flex items-center gap-1.5">
            <Brain className="w-3.5 h-3.5" />
            PHASE 1: THEORY MASTERCLASS
          </span>
          <span className="px-2.5 py-0.5 rounded-full bg-zinc-900 border border-white/10 text-zinc-400 text-xs font-mono">
            Difficulty: {Array(concept.difficulty).fill("★").join("")}
          </span>
        </div>

        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight">
          {concept.title}
        </h2>

        {/* Curiosity Hook */}
        <div className="mt-4 p-4 rounded-2xl bg-zinc-950/70 border border-cyan-500/20 flex items-start gap-3.5">
          <div className="w-8 h-8 rounded-xl bg-cyan-500/20 border border-cyan-500/40 flex items-center justify-center flex-shrink-0 text-cyan-300">
            <Lightbulb className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-mono uppercase tracking-wider text-cyan-300 font-bold">
              The Real-World Problem to Solve
            </h4>
            <p className="text-sm md:text-base text-zinc-200 mt-1 leading-relaxed">
              {concept.hook}
            </p>
          </div>
        </div>

        {concept.explanationSummary && (
          <p className="text-xs md:text-sm text-zinc-300 mt-3.5 leading-relaxed">
            {concept.explanationSummary}
          </p>
        )}
      </div>

      {/* 2. Technical Terms Broken Down from Scratch (Jargon Buster) */}
      {concept.technicalTerms && concept.technicalTerms.length > 0 && (
        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
                <BookOpen className="w-4 h-4" />
              </div>
              <div>
                <h3 className="text-base md:text-lg font-bold text-white">
                  Technical Words Explained from Scratch
                </h3>
                <p className="text-xs text-zinc-400">
                  Every technical term defined in plain English with zero assumed jargon.
                </p>
              </div>
            </div>
            <span className="text-[11px] font-mono text-amber-400 font-semibold px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20">
              {concept.technicalTerms.length} Key Terms
            </span>
          </div>

          {/* Term Selector Pills */}
          <div className="flex flex-wrap gap-2">
            {concept.technicalTerms.map((termItem) => {
              const isSelected = selectedTerm?.term === termItem.term;
              return (
                <button
                  key={termItem.term}
                  type="button"
                  onClick={() => setSelectedTerm(termItem)}
                  className={`px-3.5 py-2 rounded-xl text-xs font-medium transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? "bg-amber-400 text-zinc-950 font-bold shadow-md shadow-amber-400/20 scale-[1.02]"
                      : "bg-zinc-900/90 text-zinc-300 hover:text-white hover:bg-zinc-800 border border-white/10"
                  }`}
                >
                  <span>{termItem.term.split("(")[0].trim()}</span>
                  {termItem.mathSymbolOrFormula && (
                    <span className="text-[10px] font-mono opacity-80">
                      [{termItem.term.includes("(") ? termItem.term.split("(")[1].replace(")", "") : ""}]
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Active Term Detailed Breakdown */}
          {selectedTerm && (
            <div className="p-5 rounded-2xl bg-zinc-950/80 border border-amber-400/30 space-y-4 animate-in fade-in duration-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h4 className="text-base font-bold text-amber-300">
                  {selectedTerm.term}
                </h4>
                {selectedTerm.mathSymbolOrFormula && (
                  <span className="font-mono text-xs text-amber-200 bg-amber-500/15 px-2.5 py-1 rounded-lg border border-amber-500/30">
                    Math: {selectedTerm.mathSymbolOrFormula}
                  </span>
                )}
              </div>

              {/* Definition */}
              <div className="space-y-1">
                <span className="text-[11px] font-mono uppercase text-zinc-400 font-bold tracking-wider">
                  📖 Plain-English Definition:
                </span>
                <p className="text-sm text-zinc-200 leading-relaxed font-sans">
                  {selectedTerm.definition}
                </p>
              </div>

              {/* Real World Physical Analogy */}
              <div className="p-3.5 rounded-xl bg-amber-950/30 border border-amber-500/20 flex items-start gap-3">
                <div className="w-6 h-6 rounded-lg bg-amber-500/20 flex items-center justify-center flex-shrink-0 text-amber-300 text-xs">
                  💡
                </div>
                <div>
                  <span className="text-[11px] font-mono uppercase text-amber-300 font-bold tracking-wider block">
                    Real-World Everyday Analogy:
                  </span>
                  <p className="text-xs text-zinc-300 mt-0.5 leading-relaxed">
                    {selectedTerm.analogy}
                  </p>
                </div>
              </div>

              {/* In this Project Context */}
              {selectedTerm.exampleUsage && (
                <div className="text-xs text-zinc-400 pt-1 border-t border-white/5 flex items-center gap-2">
                  <span className="text-emerald-400 font-mono font-bold">In This Project:</span>
                  <span>{selectedTerm.exampleUsage}</span>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* 3. Deep Mathematical Breakdown & Concrete Arithmetic */}
      {concept.deepMath && (
        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-500/20 border border-indigo-500/40 flex items-center justify-center text-indigo-300">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-white">
                Step-by-Step Mathematical Walkthrough
              </h3>
              <p className="text-xs text-zinc-400">
                How the mathematical engine computes numbers line-by-line.
              </p>
            </div>
          </div>

          {/* Formula Display Box */}
          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-indigo-500/30">
            <div className="flex items-center justify-between text-xs text-indigo-300 font-mono mb-2">
              <span>{concept.deepMath.formulaName}</span>
              <span className="text-zinc-500 font-mono text-[10px]">CORE FORMULA</span>
            </div>
            <div className="text-center py-2 px-3 bg-indigo-950/30 rounded-xl border border-indigo-500/20">
              <span className="font-mono text-base md:text-xl font-extrabold text-indigo-200 tracking-wider">
                {concept.deepMath.formulaLatex}
              </span>
            </div>
            <p className="text-xs text-zinc-300 mt-2.5 leading-relaxed">
              {concept.deepMath.formulaExplanation}
            </p>
          </div>

          {/* Variable Definitions */}
          {concept.deepMath.variableDefinitions && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {concept.deepMath.variableDefinitions.map((vd) => (
                <div
                  key={vd.symbol}
                  className="p-2.5 rounded-xl bg-zinc-900/60 border border-white/5 flex items-center gap-2 text-xs"
                >
                  <span className="font-mono font-bold text-indigo-300 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                    {vd.symbol}
                  </span>
                  <span className="text-zinc-300 text-[11px]">{vd.meaning}</span>
                </div>
              ))}
            </div>
          )}

          {/* Concrete Numerical Example */}
          <div className="p-5 rounded-2xl bg-zinc-950/90 border border-emerald-500/30 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono font-bold uppercase tracking-wider text-emerald-400">
                🔢 Concrete Numerical Calculation:
              </span>
              <span className="text-[10px] font-mono text-zinc-400">
                Real Numbers Walkthrough
              </span>
            </div>

            <div className="text-xs font-mono text-zinc-300 bg-zinc-900/80 p-2.5 rounded-xl border border-white/5">
              <strong className="text-amber-300">Given Inputs: </strong>
              {concept.deepMath.numericalExample.givenInputs}
            </div>

            <div className="space-y-1.5 pt-1">
              {concept.deepMath.numericalExample.stepByStepArithmetic.map((step, idx) => (
                <div
                  key={idx}
                  className="text-xs font-mono text-zinc-200 flex items-start gap-2 bg-emerald-950/20 p-2 rounded-lg border border-emerald-500/15"
                >
                  <span className="text-emerald-400 font-bold">[{idx + 1}]</span>
                  <span>{step}</span>
                </div>
              ))}
            </div>

            <div className="p-3 rounded-xl bg-emerald-500/15 border border-emerald-500/40 text-xs font-mono font-bold text-emerald-300 flex items-center justify-between">
              <span>Final Output:</span>
              <span className="text-white text-sm">
                {concept.deepMath.numericalExample.finalResult}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* 4. Interactive Intuition Check / Prediction */}
      {concept.predictQuestion && (
        <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-500/20 border border-purple-500/40 flex items-center justify-center text-purple-300">
              <Zap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base md:text-lg font-bold text-white">
                Concept Intuition Check
              </h3>
              <p className="text-xs text-zinc-400">
                Test your understanding of the concept before writing the code.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-950/80 border border-white/10">
            <p className="text-sm font-medium text-white mb-3 leading-relaxed">
              {concept.predictQuestion.prompt}
            </p>

            <div className="space-y-2">
              {concept.predictQuestion.options.map((opt, optIdx) => {
                const isSelected = selectedPredictOption === optIdx;
                const isCorrect = optIdx === concept.predictQuestion?.correctIndex;
                let btnStyle = "bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border-white/10";

                if (selectedPredictOption !== null) {
                  if (isSelected) {
                    btnStyle = isCorrect
                      ? "bg-emerald-500/20 border-emerald-500 text-emerald-200 font-medium"
                      : "bg-red-500/20 border-red-500 text-red-200";
                  } else if (isCorrect) {
                    btnStyle = "bg-emerald-500/10 border-emerald-500/40 text-emerald-300";
                  }
                }

                return (
                  <button
                    key={optIdx}
                    type="button"
                    onClick={() => handlePredictSelect(optIdx)}
                    className={`w-full text-left p-3 rounded-xl border text-xs md:text-sm transition-all flex items-start gap-2.5 ${btnStyle}`}
                  >
                    <span className="font-mono text-xs opacity-60 mt-0.5">
                      {String.fromCharCode(65 + optIdx)}.
                    </span>
                    <span className="flex-1 leading-snug">{opt}</span>
                    {selectedPredictOption !== null && isSelected && (
                      <span>
                        {isCorrect ? (
                          <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        ) : (
                          <AlertTriangle className="w-4 h-4 text-red-400 flex-shrink-0" />
                        )}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {predictFeedback && (
              <div
                className={`mt-4 p-3.5 rounded-xl border text-xs flex items-start gap-2.5 animate-in fade-in duration-200 ${
                  predictFeedback.correct
                    ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
                    : "bg-amber-950/30 border-amber-500/30 text-amber-200"
                }`}
              >
                <div className="mt-0.5">
                  {predictFeedback.correct ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <Lightbulb className="w-4 h-4 text-amber-400" />
                  )}
                </div>
                <p className="flex-1 leading-relaxed">{predictFeedback.explanation}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 5. Ask Socrates AI Inline Coach */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white">Ask Socrates AI</h3>
            <p className="text-xs text-zinc-400">
              Need another analogy or clarification on any term or formula?
            </p>
          </div>
        </div>

        <div className="flex gap-2">
          <input
            type="text"
            value={askQuestionText}
            onChange={(e) => setAskQuestionText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAskSocrates()}
            placeholder="e.g. Why do we need the bias term? Or give me an analogy for weights..."
            className="flex-1 bg-zinc-950/80 border border-white/10 rounded-2xl px-4 py-2.5 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400"
          />
          <button
            type="button"
            onClick={() => handleAskSocrates()}
            disabled={isAsking || !askQuestionText.trim()}
            className="px-4 py-2.5 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs transition-all flex items-center gap-1.5 disabled:opacity-50"
          >
            {isAsking ? (
              <RotateCcw className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>Ask</span>
          </button>
        </div>

        {/* Quick prompt suggestions */}
        <div className="flex flex-wrap gap-1.5">
          <button
            type="button"
            onClick={() => handleAskSocrates("Explain this to me like I am 12 years old")}
            className="px-2.5 py-1 rounded-lg bg-zinc-900/80 text-[11px] text-zinc-400 hover:text-white border border-white/5"
          >
            👶 Explain like I am 12
          </button>
          <button
            type="button"
            onClick={() => handleAskSocrates("Why can't we just write if/else statements instead of ML?")}
            className="px-2.5 py-1 rounded-lg bg-zinc-900/80 text-[11px] text-zinc-400 hover:text-white border border-white/5"
          >
            🤔 Why not just if/else?
          </button>
          <button
            type="button"
            onClick={() => handleAskSocrates("What is the difference between classification and regression?")}
            className="px-2.5 py-1 rounded-lg bg-zinc-900/80 text-[11px] text-zinc-400 hover:text-white border border-white/5"
          >
            ⚖️ Classification vs Regression
          </button>
        </div>

        {socratesAnswer && (
          <div className="p-4 rounded-2xl bg-zinc-950/90 border border-amber-500/30 space-y-2 animate-in fade-in duration-200">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-300">
              <Sparkles className="w-3.5 h-3.5" />
              <span>{socratesAnswer.title}</span>
            </div>
            <p className="text-xs text-zinc-200 leading-relaxed">
              {socratesAnswer.explanation}
            </p>
            {socratesAnswer.analogy && (
              <div className="p-2.5 rounded-xl bg-amber-950/30 border border-amber-500/20 text-xs text-amber-200">
                💡 <strong>Analogy:</strong> {socratesAnswer.analogy}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. Graduation CTA: Advance to Phase 2 Building Stage */}
      <div className="p-6 md:p-8 rounded-3xl bg-gradient-to-r from-amber-500/20 via-zinc-900 to-amber-500/10 border border-amber-500/30 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-xl">
        <div className="space-y-1">
          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            Concept Groundwork Complete
          </span>
          <h3 className="text-lg md:text-xl font-extrabold text-white">
            Ready to turn this theory into code?
          </h3>
          <p className="text-xs text-zinc-300">
            Phase 2 lets you build this exact mathematical pipeline in Python from scratch with blanks.
          </p>
        </div>

        <button
          type="button"
          onClick={onProceedToBuild}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-extrabold text-sm shadow-xl shadow-amber-400/20 transition-all flex items-center justify-center gap-2 flex-shrink-0"
        >
          <span>Graduate to Phase 2: Build Model</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
