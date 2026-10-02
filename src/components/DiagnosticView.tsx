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
    <div className="w-full max-w-2xl mx-auto px-4 pt-4 sm:pt-6 pb-12 text-slate-100">
      {/* Header with goal context and progress dots */}
      <div className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <span className="text-[10px] sm:text-xs font-mono uppercase tracking-wider text-amber-300 bg-amber-400/15 px-2.5 py-1 rounded-full border border-amber-400/35 font-bold shadow-sm">
            Diagnostic · 1-Minute Skill Check
          </span>
          <h2 className="text-lg sm:text-xl font-bold text-white mt-2">
            Target Project: <span className="text-amber-300 font-extrabold">{goal || "Your AI Project"}</span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-400 mt-1 leading-relaxed font-normal">
            Personalizes your starting point so you skip concepts you already know.
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center gap-1.5 self-start sm:self-auto">
          {Array.from({ length: totalQuestions }).map((_, idx) => (
            <div
              key={idx}
              className={`h-2 rounded-full transition-all ${
                idx === diagnosticIndex
                  ? "w-6 bg-amber-400 shadow-sm shadow-amber-400/50"
                  : idx < diagnosticIndex
                  ? "w-2 bg-emerald-400"
                  : "w-2 bg-slate-800"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-panel p-4 sm:p-6 rounded-2xl border border-white/15 shadow-2xl space-y-4 bg-slate-900/80">
        <div className="flex items-start gap-3">
          <div className="w-7 h-7 rounded-lg bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 flex-shrink-0 mt-0.5 shadow-sm">
            <Brain className="w-3.5 h-3.5 text-amber-400" />
          </div>
          <div>
            <div className="text-[11px] font-mono text-amber-300 font-bold mb-1">
              Check {diagnosticIndex + 1} of {totalQuestions}
            </div>
            <h3 className="text-sm sm:text-base font-bold text-white leading-snug">
              {currentQuestion.question}
            </h3>
          </div>
        </div>

        {/* Options List */}
        <div className="space-y-2.5 pt-1">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedOption(idx)}
                className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-start gap-3 cursor-pointer ${
                  isSelected
                    ? "bg-amber-400/20 border-amber-400 text-white shadow-md shadow-amber-400/15 ring-1 ring-amber-400/40"
                    : "bg-slate-900/90 border-white/10 hover:border-amber-400/40 text-slate-300 hover:text-white"
                }`}
              >
                <div
                  className={`w-4.5 h-4.5 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    isSelected
                      ? "border-amber-400 bg-amber-400 text-zinc-950"
                      : "border-slate-500 bg-slate-800"
                  }`}
                >
                  {isSelected && <span className="w-2 h-2 rounded-full bg-zinc-950" />}
                </div>
                <span className="text-xs sm:text-sm font-medium leading-relaxed">{option.text}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="pt-3.5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-3">
          <button
            type="button"
            onClick={skipDiagnostic}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors py-1.5 px-2.5 rounded-lg hover:bg-slate-800 cursor-pointer"
          >
            <FastForward className="w-3.5 h-3.5 text-slate-400" />
            <span>Skip diagnostic &amp; start at beginning</span>
          </button>

          <button
            type="button"
            disabled={selectedOption === null || isSubmitting}
            onClick={handleNext}
            className="w-full sm:w-auto py-2.5 px-5 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-400/25 flex items-center justify-center gap-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer"
          >
            <span>{diagnosticIndex + 1 === totalQuestions ? "Review Plan" : "Continue"}</span>
            <ArrowRight className="w-4 h-4 text-zinc-950" />
          </button>
        </div>
      </div>
    </div>
  );
};
