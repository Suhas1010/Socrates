"use client";

import React, { useState } from "react";
import {
  Brain,
  ArrowRight,
  FastForward,
} from "lucide-react";
import { useSessionStore } from "@/lib/store";
import { generateDiagnosticQuestionsForGoal } from "@/lib/diagnostics";

export const DiagnosticView: React.FC = () => {
  const {
    diagnosticIndex,
    diagnosticQuestions,
    answerDiagnostic,
    skipDiagnostic,
    goal,
  } = useSessionStore();

  const [selectedOption, setSelectedOption] = useState<number | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const questionsList =
    diagnosticQuestions && diagnosticQuestions.length > 0
      ? diagnosticQuestions
      : generateDiagnosticQuestionsForGoal(goal);

  const totalQuestions = questionsList.length;
  const currentQuestion = questionsList[diagnosticIndex] || questionsList[0];

  if (!currentQuestion) {
    return null;
  }

  const handleNext = () => {
    if (selectedOption === null) return;
    setIsSubmitting(true);

    setTimeout(() => {
      answerDiagnostic(selectedOption);
      setSelectedOption(null);
      setIsSubmitting(false);
    }, 250);
  };

  return (
    <div className="w-full max-w-2xl mx-auto px-4 py-8 text-cream">
      {/* Header with goal context and progress dots */}
      <div className="mb-6 flex items-center justify-between">
        <div>
          <span className="text-[11px] font-mono uppercase tracking-wider text-gold bg-gold/10 px-2.5 py-1 rounded-full border border-gold/25">
            Diagnostic · 1-Minute Skill Check
          </span>
          <h2 className="text-xl font-bold text-cream mt-2">
            Target Project: <span className="text-gold font-medium">{goal || "Your AI Project"}</span>
          </h2>
          <p className="text-xs text-muted mt-1">
            Personalizes your starting point so you skip concepts you already know.
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center gap-1.5">
          {Array.from({ length: totalQuestions }).map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx === diagnosticIndex
                  ? "w-6 bg-gold"
                  : idx < diagnosticIndex
                  ? "w-2 bg-[#2ECC71]"
                  : "w-2 bg-[#24221A]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl border border-gold/20 shadow-2xl space-y-6">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-xl bg-gold/15 border border-gold/30 flex items-center justify-center text-gold flex-shrink-0 mt-0.5">
            <Brain className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-mono text-muted mb-1">
              Check {diagnosticIndex + 1} of {totalQuestions}
            </div>
            <h3 className="text-lg md:text-xl font-semibold text-cream leading-snug">
              {currentQuestion.question}
            </h3>
          </div>
        </div>

        {/* Options List */}
        <div className="space-y-3 pt-2">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedOption(idx)}
                className={`w-full text-left p-4 rounded-xl border transition-all flex items-start gap-3.5 ${
                  isSelected
                    ? "bg-gold/15 border-gold text-cream shadow-lg shadow-gold/10 ring-1 ring-gold/40"
                    : "bg-[#14130F] border-gold/15 hover:border-gold/30 text-muted hover:text-cream"
                }`}
              >
                <div
                  className={`w-5 h-5 rounded-full border flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    isSelected
                      ? "border-gold bg-gold text-[#0b0a08]"
                      : "border-muted/40 bg-[#1D1B15]"
                  }`}
                >
                  {isSelected && <span className="w-2 h-2 rounded-full bg-[#0b0a08]" />}
                </div>
                <span className="text-sm font-medium leading-relaxed">{option.text}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="pt-4 border-t border-gold/15 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={skipDiagnostic}
            className="flex items-center gap-1.5 text-xs text-muted hover:text-cream transition-colors py-2 px-3 rounded-lg hover:bg-[#1D1B15]"
          >
            <FastForward className="w-3.5 h-3.5 text-muted" />
            <span>Skip diagnostic &amp; start at beginning</span>
          </button>

          <button
            type="button"
            disabled={selectedOption === null || isSubmitting}
            onClick={handleNext}
            className="py-3 px-6 rounded-xl bg-gold hover:bg-gold-400 text-[#0b0a08] font-bold text-sm shadow-lg shadow-gold/20 flex items-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>{diagnosticIndex + 1 === totalQuestions ? "Review Plan" : "Continue"}</span>
            <ArrowRight className="w-4 h-4 text-[#0b0a08]" />
          </button>
        </div>
      </div>
    </div>
  );
};
