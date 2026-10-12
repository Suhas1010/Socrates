"use client";

import React, { useMemo } from "react";
import {
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Workflow,
  Target,
  FileCode,
  Gauge,
  Check,
} from "lucide-react";
import { useSessionStore } from "@/lib/store";
import { ConceptMap } from "./ConceptMap";
import { findNearestCatalogProject } from "@/lib/catalog";

export const PlanReviewView: React.FC = () => {
  const {
    goal,
    interests,
    concepts,
    currentConceptId,
    confirmPlan,
  } = useSessionStore();

  const startingConcept =
    concepts.find((c) => c.id === currentConceptId) || concepts[0];

  const matchedCatalog = useMemo(() => {
    return findNearestCatalogProject(goal);
  }, [goal]);

  const tier = matchedCatalog.tier || "A";

  return (
    <div className="w-full max-w-5xl mx-auto px-4 py-6 text-zinc-100 space-y-6">
      {/* Approval Gate Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono text-zinc-400 mb-1">
            <span>Human Approval Gate (Step 3)</span>
            <span>·</span>
            <span
              className={`px-1.5 py-0.2 rounded font-bold ${
                tier === "A"
                  ? "bg-emerald-950 text-emerald-400 border border-emerald-500/30"
                  : "bg-zinc-800 text-zinc-300 border border-zinc-700"
              }`}
            >
              {tier === "A" ? "Tier A · 100% In-Browser WASM" : "Tier C · Google Colab Export"}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold font-mono text-zinc-100">
            Project Specification: {goal || "Machine Learning Pipeline"}
          </h2>
          <p className="text-xs text-zinc-400 mt-1 max-w-2xl leading-relaxed">
            Review the dependency DAG and starting milestone before compilation begins.
          </p>
        </div>

        {/* Acceptance Metric badge */}
        <div className="p-3 rounded-lg border border-zinc-800 bg-zinc-950 flex items-center gap-3 self-start md:self-auto font-mono text-xs">
          <Gauge className="w-4 h-4 text-amber-400" />
          <div>
            <div className="text-zinc-500 text-[10px]">ACCEPTANCE METRIC</div>
            <div className="font-semibold text-zinc-200">
              {matchedCatalog.spec.metric.toUpperCase()} &ge; {matchedCatalog.spec.threshold}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
        {/* Left side: Concept Map */}
        <div className="lg:col-span-2 p-4 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col h-[460px]">
          <div className="flex items-center justify-between mb-3 px-1">
            <div className="flex items-center gap-2">
              <Workflow className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-mono font-semibold text-zinc-200 uppercase tracking-wider">
                Prerequisite Call Graph ({concepts.length} Nodes)
              </span>
            </div>
            <span className="text-[11px] text-zinc-500 font-mono">
              Use Expand button to view full screen
            </span>
          </div>

          <div className="flex-1 rounded-lg overflow-hidden border border-zinc-800/80">
            <ConceptMap interactive={true} className="h-full w-full" allowExpand={true} />
          </div>
        </div>

        {/* Right side: Starting Concept & Approval Action */}
        <div className="p-5 rounded-xl border border-zinc-800 bg-zinc-950 flex flex-col justify-between space-y-4">
          <div className="space-y-4">
            <div className="flex items-center gap-1.5 text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
              <Target className="w-3.5 h-3.5" />
              <span>Recommended Milestone 1</span>
            </div>

            <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-amber-400">Step 1 of {concepts.length}</span>
                <span className="text-zinc-400">Lv.{startingConcept.difficulty}</span>
              </div>
              <h3 className="text-sm font-bold text-zinc-100 leading-tight">
                {startingConcept.title}
              </h3>
              <p className="text-xs text-zinc-400 italic">
                &quot;{startingConcept.hook}&quot;
              </p>
            </div>

            <div className="space-y-1.5">
              <span className="text-xs font-mono text-zinc-400 flex items-center gap-1.5">
                <FileCode className="w-3.5 h-3.5" />
                <span>Function Implementation Task:</span>
              </span>
              <p className="text-xs text-zinc-300 bg-zinc-900/60 p-2.5 rounded border border-zinc-800/80 leading-relaxed font-mono">
                {startingConcept.buildStep}
              </p>
            </div>

            <div className="text-xs text-zinc-400 space-y-1.5 pt-2 border-t border-zinc-800/80 font-mono">
              <div className="flex items-center gap-1.5 text-[11px]">
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Verified reference solution recorded</span>
              </div>
              <div className="flex items-center gap-1.5 text-[11px]">
                <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span>Golden-value assertion test armed</span>
              </div>
              {interests && (
                <div className="flex items-center gap-1.5 text-[11px]">
                  <Check className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                  <span>Domain analogy: {interests}</span>
                </div>
              )}
            </div>
          </div>

          {/* Confirm Button */}
          <button
            type="button"
            onClick={confirmPlan}
            className="w-full py-2.5 px-4 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold font-mono text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer shadow-md"
          >
            <span>Approve & Start Step 1</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
