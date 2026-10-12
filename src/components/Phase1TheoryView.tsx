"use client";

import React, { useState, useEffect } from "react";
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
import { getClientLLMConfig } from "@/lib/clientLLM";

export function formatDisplayFormula(formula: string): string {
  if (!formula) return "";
  let formatted = formula;

  // Replace \frac{A}{B} with (A) / (B)
  for (let i = 0; i < 5; i++) {
    if (!formatted.includes("\\frac")) break;
    formatted = formatted.replace(/\\frac\{([^{}]+)\}\{([^{}]+)\}/g, "($1) / ($2)");
  }

  // Replace \text{...} with inside content
  for (let i = 0; i < 5; i++) {
    if (!formatted.includes("\\text")) break;
    formatted = formatted.replace(/\\text\{([^{}]+)\}/g, "$1");
  }

  // Clean mathematical symbols to clean Unicode math notation
  formatted = formatted
    .replace(/\\cdot/g, " · ")
    .replace(/\\times/g, " × ")
    .replace(/\\prod/g, "∏")
    .replace(/\\sum/g, "∑")
    .replace(/\\propto/g, " ∝ ")
    .replace(/\\ge/g, " ≥ ")
    .replace(/\\le/g, " ≤ ")
    .replace(/\\approx/g, " ≈ ")
    .replace(/\\sqrt\{([^{}]+)\}/g, "√($1)")
    .replace(/\\sqrt/g, "√")
    .replace(/\\max/g, "max")
    .replace(/\\min/g, "min")
    .replace(/\\hat\{y\}/g, "ŷ")
    .replace(/\\hat\{([^{}]+)\}/g, "$1̂")
    .replace(/\\sigma/g, "σ")
    .replace(/\\theta/g, "θ")
    .replace(/\\eta/g, "η")
    .replace(/\\in/g, " ∈ ")
    .replace(/\\to/g, " → ")
    .replace(/\\subset/g, " ⊆ ")
    .replace(/\\subseteq/g, " ⊆ ")
    .replace(/\\mathcal\{([^{}]+)\}/g, "$1")
    .replace(/\\mathbb\{R\}/g, "ℝ")
    .replace(/\\mathbb\{I\}/g, "𝟙")
    .replace(/\\mid/g, " | ")
    .replace(/\\left\(/g, "(")
    .replace(/\\right\)/g, ")")
    .replace(/\\left\[/g, "[")
    .replace(/\\right\]/g, "]")
    .replace(/\\\{/g, "{")
    .replace(/\\\}/g, "}")
    .replace(/\\_/g, "_")
    .replace(/\\,/g, " ")
    .replace(/\\;/g, " ")
    .replace(/\\quad/g, "   ")
    .replace(/\\qquad/g, "      ");


  // Subscripts & Superscripts
  formatted = formatted
    .replace(/\^\{\s*([^{}]+)\s*\}/g, "^($1)")
    .replace(/_\{([^{}]+)\}/g, "($1)")
    .replace(/_1/g, "₁")
    .replace(/_2/g, "₂")
    .replace(/_3/g, "₃")
    .replace(/_4/g, "₄")
    .replace(/_i/g, "ᵢ")
    .replace(/_k/g, "ₖ")
    .replace(/_j/g, "ⱼ")
    .replace(/_n/g, "ₙ")
    .replace(/\^T/g, "ᵀ")
    .replace(/\^N/g, "ᴺ")
    .replace(/\^2/g, "²");

  // Remove any remaining stray backslashes
  formatted = formatted.replace(/\\([a-zA-Z]+)/g, "$1");

  return formatted.replace(/\s+/g, " ").trim();
}

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
    <div className="space-y-4 text-base sm:text-lg leading-relaxed text-zinc-100 font-sans font-normal">
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
            <div key={pIdx} className="space-y-2.5">
              {introLines.length > 0 && (
                <p className="font-bold text-white text-base sm:text-lg">
                  {renderFormattedInlineText(introLines.join(" "))}
                </p>
              )}
              <ul className="space-y-2.5 pt-0.5 pl-1">
                {listItems.map((item, itemIdx) => {
                  const isKeyTerm = item.includes("=");
                  return (
                    <li
                      key={itemIdx}
                      className={`flex items-start gap-3 text-base sm:text-lg leading-relaxed text-zinc-100 ${
                        isKeyTerm
                          ? "p-3 rounded-xl bg-zinc-950/70 border border-zinc-800/90 shadow-sm"
                          : ""
                      }`}
                    >
                      <span className="w-2 h-2 rounded-full bg-amber-400 mt-2.5 flex-shrink-0 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
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
            <p key={pIdx} className="font-bold text-white text-base sm:text-lg pt-1">
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

  // Concept-scoped state for intuition check: prevents Step 1 MCQ from leaking into Step 2 or any other step
  const [answersByConcept, setAnswersByConcept] = useState<
    Record<string, { selectedOption: number; feedback: { correct: boolean; explanation: string } }>
  >({});

  const activeQuestion = concept.predictQuestion || concept.checkQuestion;
  const currentAnswer = answersByConcept[concept.id];
  const selectedPredictOption = currentAnswer?.selectedOption ?? null;
  const predictFeedback = currentAnswer?.feedback ?? null;

  // Socrates AI floating question drawer state
  const [isSocratesOpen, setIsSocratesOpen] = useState(false);
  const [askText, setAskText] = useState("");
  const [isAsking, setIsAsking] = useState(false);
  const [socratesAnswer, setSocratesAnswer] = useState<{
    explanation: string;
    analogy?: string;
  } | null>(null);

  // Reset transient drawers and term inspection when concept changes
  useEffect(() => {
    setSelectedTerm(null);
    setIsSocratesOpen(false);
    setSocratesAnswer(null);
  }, [concept.id]);

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
    if (!activeQuestion) return;

    const feedback =
      idx === activeQuestion.correctIndex
        ? {
            correct: true,
            explanation: `Correct! ${activeQuestion.explanation}`,
          }
        : {
            correct: false,
            explanation: `Not quite: ${activeQuestion.explanation}`,
          };

    setAnswersByConcept((prev) => ({
      ...prev,
      [concept.id]: {
        selectedOption: idx,
        feedback,
      },
    }));
  };

  const handleAsk = async (presetText?: string) => {
    const q = presetText || askText;
    if (!q.trim() || isAsking) return;

    setIsAsking(true);
    setSocratesAnswer(null);

    try {
      const llmConfig = getClientLLMConfig();

      const res = await fetch("/api/ask", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...llmConfig.headers,
        },
        body: JSON.stringify({
          question: q,
          concept,
          conceptTitle: concept?.title,
          conceptHook: concept?.hook,
          goal,
          apiKey: llmConfig.apiKey,
          provider: llmConfig.provider,
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
      <div className="py-2 space-y-2 border-b border-zinc-800/80 pb-4">
        <div className="flex items-center gap-2">
          <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-amber-400">
            Phase 1 · Concept Masterclass
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold tracking-tight text-white font-sans">
          {concept.title}
        </h1>
        {concept.hook && (
          <p className="text-base sm:text-lg text-zinc-200 leading-relaxed max-w-3xl font-medium">
            {concept.hook}
          </p>
        )}
      </div>

      {/* 2. Uncluttered 3-Tab Navigator (ChaiUI Segmented Control) */}
      <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4">
        <div className="flex items-center gap-1 p-1 rounded-lg bg-neutral-900/90 border border-white/10">
          <button
            type="button"
            onClick={() => setActiveTab("intuition")}
            className={`px-3.5 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "intuition"
                ? "bg-white/15 text-white border border-white/20"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Lightbulb className="w-4 h-4 text-orange-400" />
            <span>1. Core Idea</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("math")}
            className={`px-3.5 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "math"
                ? "bg-white/15 text-white border border-white/20"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Calculator className="w-4 h-4 text-orange-400" />
            <span>2. Real Numbers</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("check")}
            className={`px-3.5 sm:px-4 py-2 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-2 ${
              activeTab === "check"
                ? "bg-white/15 text-white border border-white/20"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            {selectedPredictOption !== null && predictFeedback?.correct ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <HelpCircle className="w-4 h-4 text-orange-400" />
            )}
            <span>3. Quick Check</span>
          </button>
        </div>

        {/* Floating Socrates Ask Button */}
        <button
          type="button"
          onClick={() => setIsSocratesOpen(true)}
          className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-200 hover:text-white text-xs sm:text-sm font-medium transition-colors cursor-pointer"
        >
          <Sparkles className="w-4 h-4 text-orange-400" />
          <span className="hidden sm:inline">Ask Socrates</span>
          <span className="sm:hidden">Ask</span>
        </button>
      </div>

      {activeTab === "intuition" && (
        <div className="card-chai p-6 sm:p-8 space-y-6 animate-in fade-in duration-150">
          {/* Plain English Breakdown */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5 pb-2.5 border-b border-white/5">
              <span className="w-2 h-2 rounded-full bg-orange-400" />
              <h3 className="text-sm font-medium text-neutral-200 font-sans">
                Core explanation (plain English)
              </h3>
            </div>
            <div className="pt-1 text-neutral-200">
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
            <div className="rounded-xl border border-white/10 bg-black/25 p-5 sm:p-6 flex items-start gap-3.5 backdrop-blur-sm">
              <div className="w-8 h-8 rounded-lg bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0 text-orange-400 mt-0.5">
                <Lightbulb className="w-4 h-4 text-orange-400" />
              </div>
              <div className="space-y-1 flex-1 min-w-0">
                <span className="text-xs font-medium text-orange-200 block">
                  The everyday real-world analogy
                </span>
                <div className="text-sm sm:text-base leading-relaxed text-neutral-300">
                  <FormattedContent text={concept.corePrinciple} />
                </div>
              </div>
            </div>
          )}

          {/* Jargon Buster Clickable Pills */}
          {concept.technicalTerms && concept.technicalTerms.length > 0 && (
            <div className="space-y-2.5 pt-1">
              <div className="flex items-center gap-2">
                <BookOpen className="w-4 h-4 text-amber-400" />
                <span className="text-xs sm:text-sm font-mono font-bold uppercase tracking-wider text-zinc-300 block">
                  Technical Vocabulary:
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
                      className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 cursor-pointer ${
                        isSelected
                          ? "bg-amber-500/20 text-white border border-amber-400 shadow-sm"
                          : "bg-zinc-900 text-zinc-300 hover:text-white border border-zinc-800 hover:border-zinc-700"
                      }`}
                    >
                      <BookOpen className="w-3.5 h-3.5 opacity-70" />
                      <span>{termItem.term.split("(")[0].trim()}</span>
                    </button>
                  );
                })}
              </div>

              {/* Term Detail Box */}
              {selectedTerm && (
                <div className="p-5 rounded-2xl bg-zinc-950 border border-zinc-700 space-y-2.5 animate-in fade-in duration-150 shadow-lg">
                  <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                    <strong className="text-sm sm:text-base font-bold text-white">
                      {selectedTerm.term}
                    </strong>
                    <button
                      type="button"
                      onClick={() => setSelectedTerm(null)}
                      className="text-zinc-400 hover:text-white text-xs px-2.5 py-1 rounded-md bg-zinc-900 border border-zinc-800 transition-colors cursor-pointer"
                    >
                      Close ✕
                    </button>
                  </div>
                  <p className="text-sm sm:text-base text-zinc-200 leading-relaxed font-sans">
                    {selectedTerm.definition}
                  </p>
                  <p className="text-xs sm:text-sm text-amber-300/90 italic bg-amber-500/10 p-3 rounded-xl border border-amber-500/20">
                    💡 <strong>Analogy:</strong> {selectedTerm.analogy}
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {activeTab === "math" && (
        <div className="p-5 sm:p-7 rounded-2xl border border-zinc-800 bg-[#0d111a]/95 space-y-5 animate-in fade-in duration-150 shadow-xl">
          <div className="space-y-1.5 pb-3 border-b border-zinc-800/80">
            <h3 className="text-sm sm:text-base font-mono font-bold uppercase tracking-wider text-amber-400">
              The Math in Real Numbers
            </h3>
            <p className="text-sm text-zinc-300">
              What happens to numerical data when passing through this step:
            </p>
          </div>

          {concept.deepMath ? (
            <div className="space-y-4">
              {concept.deepMath.formulaName && (
                <div className="text-sm font-mono font-bold text-amber-300">
                  {concept.deepMath.formulaName}
                </div>
              )}

              {/* Formula */}
              <div className="p-4 sm:p-5 rounded-xl bg-zinc-950 border border-zinc-700 text-center font-mono text-base sm:text-lg font-bold text-amber-300 tracking-wide shadow-inner">
                {formatDisplayFormula(concept.deepMath.formulaLatex)}
              </div>

              {concept.deepMath.formulaExplanation && (
                <p className="text-sm sm:text-base text-zinc-200 leading-relaxed font-sans bg-zinc-950/40 p-3.5 rounded-xl border border-zinc-800/80">
                  {concept.deepMath.formulaExplanation}
                </p>
              )}

              {/* Given Inputs */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-zinc-950/80 border border-zinc-800 text-sm sm:text-base font-mono text-zinc-200 shadow-inner">
                <strong className="text-amber-400 font-bold">Inputs: </strong>
                {concept.deepMath.numericalExample.givenInputs}
              </div>

              {/* Steps */}
              <div className="space-y-2.5 pt-0.5">
                {concept.deepMath.numericalExample.stepByStepArithmetic.map((step, idx) => {
                  const cleanStep = step.replace(/^(?:Step\s*\d+:?\s*|\d+\.\s*)/i, "");
                  return (
                    <div
                      key={idx}
                      className="p-3.5 rounded-xl bg-zinc-950/60 border border-zinc-800/90 text-sm sm:text-base font-mono text-zinc-200 flex items-start gap-3 shadow-sm"
                    >
                      <span className="text-amber-400 font-bold flex-shrink-0">Step {idx + 1}:</span>
                      <span className="leading-relaxed">{cleanStep}</span>
                    </div>
                  );
                })}
              </div>

              {/* Final Result */}
              <div className="p-4 sm:p-5 rounded-xl bg-emerald-500/15 border border-emerald-500/30 text-sm sm:text-base font-mono font-bold text-emerald-300 flex items-center justify-between shadow-sm">
                <span>Output Result:</span>
                <span className="text-white text-sm sm:text-base font-black">{concept.deepMath.numericalExample.finalResult}</span>
              </div>
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-zinc-950 text-sm font-mono text-zinc-300">
              Passes input features directly into the model tensor.
            </div>
          )}
        </div>
      )}

      {activeTab === "check" && (
        <div className="p-5 sm:p-7 rounded-2xl border border-zinc-800 bg-[#0d111a]/95 space-y-5 animate-in fade-in duration-150 shadow-xl">
          <div className="space-y-1.5 pb-3 border-b border-zinc-800/80">
            <h3 className="text-sm sm:text-base font-mono font-bold uppercase tracking-wider text-amber-400">
              Concept Intuition Check
            </h3>
            <p className="text-sm text-zinc-300">
              Verify your understanding before moving to Python implementation:
            </p>
          </div>

          {activeQuestion ? (
            <div className="p-5 sm:p-6 rounded-2xl bg-zinc-950/90 border border-zinc-800 space-y-4">
              <p className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {activeQuestion.prompt}
              </p>

              <div className="space-y-3">
                {activeQuestion.options.map((opt, optIdx) => {
                  const isSelected = selectedPredictOption === optIdx;
                  const isCorrect = optIdx === activeQuestion.correctIndex;

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
                      className={`w-full text-left p-4 rounded-xl border text-base sm:text-lg transition-all flex items-start gap-3.5 cursor-pointer ${style}`}
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
                  className={`p-4 sm:p-5 rounded-xl border text-base sm:text-lg flex items-center gap-3.5 ${
                    predictFeedback.correct
                      ? "bg-emerald-950/30 border-emerald-500/30 text-emerald-200"
                      : "bg-zinc-900 border-zinc-700 text-zinc-200"
                  }`}
                >
                  <span className="text-lg sm:text-xl">{predictFeedback.correct ? "✓" : "💡"}</span>
                  <span className="leading-relaxed font-medium">{predictFeedback.explanation}</span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-4 rounded-xl bg-zinc-900 border border-zinc-800 text-base text-zinc-300">
              Intuition check for this concept is loading...
            </div>
          )}
        </div>
      )}

      {/* 4. Sleek Bottom Action: Advance to Code */}
      <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <span className="text-base sm:text-lg text-zinc-200 font-mono font-medium">
          Ready to implement in Python?
        </span>

        <button
          type="button"
          onClick={onProceedToBuild}
          className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-base sm:text-lg shadow-xl transition-all flex items-center justify-center gap-3 active:scale-95 cursor-pointer"
        >
          <span>Proceed to Phase 2: Build in Python</span>
          <ArrowRight className="w-5 h-5 sm:w-6 sm:h-6" />
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
