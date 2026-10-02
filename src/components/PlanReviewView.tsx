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
    <div className="w-full max-w-6xl mx-auto px-4 pt-6 pb-20 md:pb-24">
      {/* Friendly Approval Gate Header */}
      <div className="text-center max-w-3xl mx-auto mb-8 space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
          <ShieldCheck className="w-4 h-4" />
          <span>Step 3: Review Your Learning Plan</span>
        </div>

        <h2 className="text-3xl md:text-4xl font-extrabold text-white">
          Here is Your Tailored Learning Path
        </h2>

        <p className="text-sm md:text-base text-zinc-300 leading-relaxed">
          Based on your project <span className="text-amber-300 font-semibold">&quot;{goal}&quot;</span>,
          Socrates prepared a clear {concepts.length}-step roadmap. You&apos;ll build the project step by step
          with friendly explanations and interactive coding directly in your browser.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left side: Concept Map */}
        <div className="lg:col-span-2 glass-panel p-4 md:p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col h-[520px]">
          <div className="flex items-center justify-between mb-3 px-2">
            <div className="flex items-center gap-2">
              <Workflow className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-zinc-200 uppercase tracking-wider">
                Project Roadmap ({concepts.length} Steps)
              </span>
            </div>
            <span className="text-[11px] text-zinc-400 font-mono">
              Click any step to inspect
            </span>
          </div>

          <div className="flex-1 rounded-2xl overflow-hidden border border-white/5">
            <ConceptMap interactive={true} className="h-full w-full" />
          </div>
        </div>

        {/* Right side: Starting Concept & Approval Action */}
        <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <div className="flex items-center gap-2 text-xs font-semibold text-amber-400 uppercase tracking-wider">
              <Target className="w-4 h-4" />
              <span>Recommended First Step</span>
            </div>

            <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/30 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-amber-300 uppercase">
                  Step 1
                </span>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/20 text-amber-200">
                  Lv.{startingConcept.difficulty}
                </span>
              </div>
              <h3 className="text-lg font-bold text-white leading-tight">
                {startingConcept.title}
              </h3>
              <p className="text-xs text-zinc-300 italic">
                &quot;{startingConcept.hook}&quot;
              </p>
            </div>

            <div className="space-y-2">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5 text-zinc-400" />
                <span>What you will code in Step 1:</span>
              </span>
              <p className="text-xs text-zinc-400 bg-zinc-950/60 p-3 rounded-xl border border-white/5 leading-relaxed">
                {startingConcept.buildStep}
              </p>
            </div>

            <div className="text-xs text-zinc-300 space-y-2 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Steps ordered logically (no confusing loops)</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>In-browser Python ready (no install needed)</span>
              </div>
              {interests && (
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Personalized analogies for: {interests}</span>
                </div>
              )}
            </div>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={confirmPlan}
            className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-amber-400 via-amber-500 to-amber-600 hover:from-amber-300 hover:to-amber-500 text-zinc-950 font-bold text-base shadow-xl shadow-amber-500/25 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99]"
          >
            <span>Looks Great, Let&apos;s Start Step 1! 🚀</span>
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    </div>
  );
};
