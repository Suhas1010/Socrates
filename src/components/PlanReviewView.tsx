"use client";

import React from "react";
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Workflow,
  Target,
  FileCode,
} from "lucide-react";
import { useSessionStore } from "@/lib/store";
import { ConceptMap } from "./ConceptMap";

export const PlanReviewView: React.FC = () => {
  const {
    goal,
    interests,
    concepts,
    currentConceptId,
    mastery,
    confirmPlan,
    selectConcept,
  } = useSessionStore();

  const startingConcept =
    concepts.find((c) => c.id === currentConceptId) || concepts[0];

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pt-4 sm:pt-6 pb-16">
      {/* Friendly Approval Gate Header */}
      <div className="text-center max-w-2xl mx-auto mb-6 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-[11px] font-semibold">
          <ShieldCheck className="w-3.5 h-3.5" />
          <span>Step 3: Review Your Learning Plan</span>
        </div>

        <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
          Here is Your Tailored Learning Path
        </h2>

        <p className="text-xs sm:text-sm text-zinc-400 leading-relaxed">
          Based on your project <span className="text-amber-300 font-semibold">&quot;{goal}&quot;</span>,
          Socrates prepared a clear {concepts.length}-step roadmap. You&apos;ll build the project step by step
          with friendly explanations and interactive coding directly in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-5">
        {/* Left side: Concept Map */}
        <div className="lg:col-span-2 glass-panel p-3.5 sm:p-5 rounded-2xl border border-white/10 shadow-xl flex flex-col h-[450px]">
          <div className="flex items-center justify-between mb-2.5 px-1">
            <div className="flex items-center gap-1.5">
              <Workflow className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-[11px] font-bold text-zinc-200 uppercase tracking-wider">
                Project Roadmap ({concepts.length} Steps)
              </span>
            </div>
            <span className="text-[10px] text-zinc-400 font-mono">
              Click any step to inspect
            </span>
          </div>

          <div className="flex-1 rounded-xl overflow-hidden border border-white/5">
            <ConceptMap interactive={true} className="h-full w-full" />
          </div>
        </div>

        {/* Right side: Starting Concept & Approval Action */}
        <div className="glass-panel p-4 sm:p-5 rounded-2xl border border-white/10 shadow-xl flex flex-col justify-between space-y-4">
          <div className="space-y-3">
            <div className="flex items-center gap-1.5 text-[11px] font-semibold text-amber-400 uppercase tracking-wider">
              <Target className="w-3.5 h-3.5" />
              <span>Recommended First Step</span>
            </div>

            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 space-y-1.5">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-mono text-amber-300 uppercase">
                  Step 1
                </span>
                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-200">
                  Lv.{startingConcept.difficulty}
                </span>
              </div>
              <h3 className="text-sm sm:text-base font-bold text-white leading-tight">
                {startingConcept.title}
              </h3>
              <p className="text-xs text-zinc-300 italic">
                &quot;{startingConcept.hook}&quot;
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1">
                <FileCode className="w-3 h-3 text-zinc-400" />
                <span>What you will code in Step 1:</span>
              </span>
              <p className="text-xs text-zinc-400 bg-zinc-950/60 p-2.5 rounded-lg border border-white/5 leading-relaxed">
                {startingConcept.buildStep}
              </p>
            </div>

            <div className="text-[11px] text-zinc-400 space-y-1.5 pt-2 border-t border-white/10">
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span>Steps ordered logically (no confusing loops)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                <span>In-browser Python ready (no install needed)</span>
              </div>
              {interests && (
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400 flex-shrink-0" />
                  <span>Personalized analogies for: {interests}</span>
                </div>
              )}
            </div>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={confirmPlan}
            className="w-full py-2.5 px-4 rounded-xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-zinc-950 font-bold text-xs sm:text-sm shadow-md shadow-amber-500/25 flex items-center justify-center gap-1.5 transition-all transform active:scale-[0.99] cursor-pointer"
          >
            <span>Looks Great, Let&apos;s Start Step 1! 🚀</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
