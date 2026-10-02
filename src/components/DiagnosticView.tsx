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
    <div className="w-full max-w-3xl mx-auto px-4 pt-8 pb-16 md:pb-24 text-slate-100">
      {/* Header with goal context and progress dots */}
      <div className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-xs md:text-sm font-mono uppercase tracking-wider text-amber-300 bg-amber-400/15 px-3.5 py-1.5 rounded-full border border-amber-400/35 font-bold shadow-sm">
            Diagnostic · 1-Minute Skill Check
          </span>
          <h2 className="text-2xl md:text-3xl font-black text-white mt-3">
            Target Project: <span className="text-amber-300 font-extrabold">{goal || "Your AI Project"}</span>
          </h2>
          <p className="text-sm md:text-base text-slate-300 mt-1.5 leading-relaxed font-normal">
            Personalizes your starting point so you skip concepts you already know.
          </p>
        </div>

        {/* Progress Dots */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {Array.from({ length: totalQuestions }).map((_, idx) => (
            <div
              key={idx}
              className={`h-2.5 rounded-full transition-all ${
                idx === diagnosticIndex
                  ? "w-8 bg-amber-400 shadow-md shadow-amber-400/50"
                  : idx < diagnosticIndex
                  ? "w-2.5 bg-emerald-400"
                  : "w-2.5 bg-slate-800"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Question Card */}
      <div className="glass-panel p-7 md:p-10 rounded-3xl border border-white/15 shadow-2xl space-y-7 bg-slate-900/80">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-amber-300 flex-shrink-0 mt-0.5 shadow-sm">
            <Brain className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="text-xs md:text-sm font-mono text-amber-300 font-bold mb-1.5">
              Check {diagnosticIndex + 1} of {totalQuestions}
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white leading-snug">
              {currentQuestion.question}
            </h3>
          </div>
        </div>

        {/* Options List */}
        <div className="space-y-3.5 pt-2">
          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === idx;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedOption(idx)}
                className={`w-full text-left p-5 rounded-2xl border transition-all flex items-start gap-4 ${
                  isSelected
                    ? "bg-amber-400/20 border-amber-400 text-white shadow-xl shadow-amber-400/15 ring-2 ring-amber-400/40"
                    : "bg-slate-900/90 border-white/10 hover:border-amber-400/40 text-slate-300 hover:text-white"
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors ${
                    isSelected
                      ? "border-amber-400 bg-amber-400 text-zinc-950"
                      : "border-slate-500 bg-slate-800"
                  }`}
                >
                  {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-zinc-950" />}
                </div>
                <span className="text-base md:text-lg font-medium leading-relaxed">{option.text}</span>
              </button>
            );
          })}
        </div>

        {/* Action Controls */}
        <div className="pt-5 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4">
          <button
            type="button"
            onClick={skipDiagnostic}
            className="flex items-center gap-2 text-xs md:text-sm text-slate-400 hover:text-white transition-colors py-2 px-3 rounded-xl hover:bg-slate-800"
          >
            <FastForward className="w-4 h-4 text-slate-400" />
            <span>Skip diagnostic &amp; start at beginning</span>
          </button>

          <button
            type="button"
            disabled={selectedOption === null || isSubmitting}
            onClick={handleNext}
            className="w-full sm:w-auto py-4 px-8 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-base md:text-lg shadow-xl shadow-amber-400/25 flex items-center justify-center gap-2.5 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <span>{diagnosticIndex + 1 === totalQuestions ? "Review Plan" : "Continue"}</span>
            <ArrowRight className="w-5 h-5 text-zinc-950" />
          </button>
        </div>
      </div>
    </div>
  );
};
