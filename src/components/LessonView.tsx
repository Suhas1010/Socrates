"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Brain,
  Code2,
  Zap,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
  ChevronDown,
  Workflow,
  CheckCircle2,
  X,
  Layers,
  BookOpen,
} from "lucide-react";
import { useSessionStore } from "@/lib/store";
import { Phase1TheoryView } from "./Phase1TheoryView";
import { Phase2BuildView } from "./Phase2BuildView";
import { LiveTestPanel } from "./LiveTestPanel";
import { TeachBackModal } from "./TeachBackModal";
import { ConceptMap } from "./ConceptMap";

export const LessonView: React.FC = () => {
  const {
    concepts,
    currentConceptId,
    mastery,
    status,
    teachBackPassed,
    completeBuildStep,
    advanceToNextConcept,
    selectConcept,
    goal,
    projectParts,
    learningPhase,
    learningTrack,
    setLearningPhase,
    setLearningTrack,
    openPythonAcademy,
  } = useSessionStore();

  const safeGoal = goal?.trim() || "Your AI Project";

  const [isTeachBackOpen, setIsTeachBackOpen] = useState(false);
  const [showRoadmapDrawer, setShowRoadmapDrawer] = useState(false);
  const [showVisualGraph, setShowVisualGraph] = useState(false);

  // Sync tab/phase with query parameters if present
  useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const tabParam = params.get("tab");
      const phaseParam = params.get("phase");

      if (tabParam === "test" || phaseParam === "testing") {
        setLearningPhase("testing");
      } else if (phaseParam === "building") {
        setLearningPhase("building");
      } else if (phaseParam === "theory") {
        setLearningPhase("theory");
      }
    }
  }, [setLearningPhase]);

  // If user's stored session was left in python_foundation track, automatically restore clean project view
  useEffect(() => {
    if (learningTrack === "python_foundation") {
      setLearningTrack("project");
    }
  }, [learningTrack, setLearningTrack]);

  const currentConcept =
    concepts.find((c) => c.id === currentConceptId) || concepts[0];
  const currentIndex = concepts.findIndex((c) => c.id === currentConcept?.id);

  const currentStatus = status[currentConcept?.id] || "unseen";
  const isMastered = currentStatus === "mastered";
  const isCodePassed = projectParts.some((p) => p.conceptId === currentConcept?.id);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden px-3 sm:px-6 md:px-8 pt-3 pb-6 space-y-4 text-slate-100">
      {/* ========================================================================= */}
      {/* 1. TOP BAR: PROJECT STEP + 3-PHASE STEPPER + TRACK SWITCHER               */}
      {/* ========================================================================= */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 px-4 sm:px-5 py-2.5 rounded-xl bg-neutral-950/70 border border-white/10 flex-shrink-0 backdrop-blur-md">
        {/* Left: Step indicator & Roadmap drawer trigger */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowRoadmapDrawer(!showRoadmapDrawer)}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 border border-white/10 text-xs sm:text-sm font-medium transition-colors text-white cursor-pointer"
          >
            <Workflow className="w-4 h-4 text-orange-400" />
            <span className="font-mono text-orange-200 font-medium">
              Step {currentIndex + 1}/{concepts.length}
            </span>
            <span className="text-neutral-300 truncate max-w-[160px] sm:max-w-[220px]">
              {currentConcept?.title}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-neutral-400" />
          </button>

          <button
            type="button"
            onClick={() => setShowVisualGraph(true)}
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-900/90 hover:bg-neutral-800 text-xs sm:text-sm text-neutral-300 hover:text-white border border-white/10 transition-colors font-medium cursor-pointer"
          >
            <span>DAG Graph</span>
          </button>
        </div>

        {/* Center: THE 3-PHASE PROGRESSION STEPPER (ChaiUI Segmented Control) */}
        <div className="flex items-center justify-center p-1 rounded-lg bg-neutral-900/90 border border-white/10 gap-1 overflow-x-auto">
          {/* Phase 1 Button */}
          <button
            type="button"
            onClick={() => setLearningPhase("theory")}
            className={`px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              learningPhase === "theory"
                ? "bg-white/15 text-white border border-white/20"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Brain className="w-3.5 h-3.5" />
            <span>1. Theory</span>
          </button>

          <span className="text-neutral-600 px-0.5 text-xs select-none">→</span>

          {/* Phase 2 Button */}
          <button
            type="button"
            onClick={() => setLearningPhase("building")}
            className={`px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              learningPhase === "building"
                ? "bg-white/15 text-white border border-white/20"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Code2 className="w-3.5 h-3.5" />
            <span>2. Build</span>
            {projectParts.length > 0 && (
              <span className="text-[11px] font-mono px-1.5 py-0.5 rounded bg-white/10 text-orange-200">
                {projectParts.length}/{concepts.length}
              </span>
            )}
          </button>

          <span className="text-neutral-600 px-0.5 text-xs select-none">→</span>

          {/* Phase 3 Button */}
          <button
            type="button"
            onClick={() => setLearningPhase("testing")}
            className={`px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-medium transition-colors flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
              learningPhase === "testing"
                ? "bg-white/15 text-white border border-white/20"
                : "text-neutral-400 hover:text-neutral-200"
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            <span>3. Test &amp; Runner</span>
          </button>
        </div>

        {/* Right: Actions, Track Toggle & Advance */}
        <div className="flex items-center gap-2 self-end xl:self-auto">
          {/* Dedicated Python Academy Opener */}
          <button
            type="button"
            onClick={openPythonAcademy}
            title="Open dedicated Python Academy"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-200 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
          >
            <span>Python Academy</span>
          </button>

          {/* Teach Socrates Button */}
          {isCodePassed && !isMastered && (
            <button
              type="button"
              onClick={() => setIsTeachBackOpen(true)}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-emerald-500/30 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs sm:text-sm font-medium transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Teach-Back</span>
            </button>
          )}

          {/* Next Step in Roadmap (ChaiUI Solid Button) */}
          <button
            type="button"
            onClick={advanceToNextConcept}
            className="btn-asym inline-flex items-center gap-1.5 px-4 py-1.5 bg-white hover:bg-neutral-200 text-black font-semibold text-xs sm:text-sm transition-colors duration-200 cursor-pointer"
          >
            <span>Next Step</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. UNCLUTTERED DEDICATED WORKSPACE FOR THE ACTIVE PHASE                   */}
      {/* ========================================================================= */}
      <div className="flex-1 min-h-0 overflow-y-auto pb-8">
        {learningPhase === "theory" ? (
          <Phase1TheoryView
            key={currentConcept?.id || "theory-view"}
            concept={currentConcept}
            goal={goal}
            onProceedToBuild={() => setLearningPhase("building")}
          />
        ) : learningPhase === "building" ? (
          <Phase2BuildView
            concept={currentConcept}
            goal={goal}
            concepts={concepts}
            projectParts={projectParts}
            isCodePassed={isCodePassed}
            isMastered={isMastered}
            onStepPassed={(code) => completeBuildStep(currentConcept.id, code)}
            onOpenTeachBack={() => setIsTeachBackOpen(true)}
            onBackToTheory={() => setLearningPhase("theory")}
            onProceedToTesting={() => setLearningPhase("testing")}
          />
        ) : (
          <LiveTestPanel
            onBackToBuild={() => setLearningPhase("building")}
            onBackToTheory={() => setLearningPhase("theory")}
          />
        )}
      </div>

      {/* ========================================================================= */}
      {/* 3. ROADMAP DRAWER (QUICK STEP SWITCHER WITHOUT CLUTTER)                    */}
      {/* ========================================================================= */}
      {showRoadmapDrawer && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-start justify-center pt-16 md:pt-20 p-4 animate-in fade-in duration-150">
          <div className="bg-slate-950 border border-slate-800 rounded-xl p-5 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
              <div className="flex items-center gap-2.5">
                <Workflow className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold tracking-wider text-slate-100 uppercase font-mono">
                  Roadmap Steps Navigator
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRoadmapDrawer(false)}
                className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-2 max-h-[60vh] overflow-y-auto pr-1">
              {concepts.map((c, idx) => {
                const isCurrent = c.id === currentConcept?.id;
                const cStatus = status[c.id] || "unseen";
                const isPartDone = projectParts.some((p) => p.conceptId === c.id);

                return (
                  <button
                    key={c.id}
                    type="button"
                    onClick={() => {
                      selectConcept(c.id);
                      setShowRoadmapDrawer(false);
                    }}
                    className={`w-full text-left p-3 rounded-lg border transition-all flex items-start justify-between gap-3 ${
                      isCurrent
                        ? "bg-slate-900 border-amber-500/40 text-slate-100 ring-1 ring-amber-500/20 shadow-sm"
                        : "bg-slate-950/60 border-slate-800/80 text-slate-300 hover:bg-slate-900/60 hover:border-slate-700 hover:text-white"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span
                        className={`w-6 h-6 rounded-md font-mono text-xs font-semibold flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isCurrent
                            ? "bg-amber-400/15 border border-amber-400/30 text-amber-300"
                            : "bg-slate-900 border border-slate-800 text-slate-400"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <span
                          className={`text-sm font-semibold tracking-tight block ${
                            isCurrent ? "text-amber-300" : "text-slate-100"
                          }`}
                        >
                          {c.title}
                        </span>
                        <span className="text-xs text-slate-400 mt-0.5 block leading-normal line-clamp-1 font-normal">
                          {c.hook}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-1.5 flex-shrink-0 mt-0.5">
                      {isPartDone && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-mono font-medium">
                          Built ✓
                        </span>
                      )}
                      {cStatus === "mastered" && (
                        <span className="px-2 py-0.5 rounded bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-[11px] font-mono font-medium">
                          Mastered ★
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. VISUAL DAG GRAPH MODAL                                                 */}
      {/* ========================================================================= */}
      {showVisualGraph && (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-white/20 rounded-3xl p-6 md:p-8 max-w-5xl w-full h-[85vh] shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-4 flex-shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-sm">
                  <Workflow className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-lg md:text-xl font-black text-white">
                    Concept Dependency Graph (DAG)
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Visual knowledge graph showing prerequisites, dependencies, and mastery flow
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowVisualGraph(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0 rounded-2xl overflow-hidden border border-white/15 bg-slate-900/60 shadow-inner">
              <ConceptMap />
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 5. TEACH BACK FEYNMAN MODAL                                               */}
      {/* ========================================================================= */}
      <TeachBackModal
        isOpen={isTeachBackOpen}
        onClose={() => setIsTeachBackOpen(false)}
        onMastered={() => setIsTeachBackOpen(false)}
        concept={currentConcept}
      />
    </div>
  );
};
