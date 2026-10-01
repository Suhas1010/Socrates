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

  const currentConcept =
    concepts.find((c) => c.id === currentConceptId) || concepts[0];
  const currentIndex = concepts.findIndex((c) => c.id === currentConcept?.id);

  const currentStatus = status[currentConcept?.id] || "unseen";
  const isMastered = currentStatus === "mastered";
  const isCodePassed = projectParts.some((p) => p.conceptId === currentConcept?.id);

  return (
    <div className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-8 py-3.5 space-y-3">
      {/* ========================================================================= */}
      {/* 1. TOP BAR: PROJECT STEP + 3-PHASE STEPPER + TRACK SWITCHER               */}
      {/* ========================================================================= */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-3 px-4 py-3 rounded-2xl bg-zinc-950/90 border border-white/10 shadow-xl flex-shrink-0">
        {/* Left: Step indicator & Roadmap drawer trigger */}
        <div className="flex items-center gap-2.5">
          <button
            type="button"
            onClick={() => setShowRoadmapDrawer(!showRoadmapDrawer)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-white/10 text-xs font-semibold transition-all text-zinc-200"
          >
            <Workflow className="w-3.5 h-3.5 text-amber-400" />
            <span className="font-mono text-amber-300 font-bold">
              Step {currentIndex + 1} of {concepts.length}
            </span>
            <span className="text-zinc-400 truncate max-w-[140px] sm:max-w-[200px]">
              {currentConcept?.title}
            </span>
            <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
          </button>

          <button
            type="button"
            onClick={() => setShowVisualGraph(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl bg-zinc-900/60 hover:bg-zinc-800 text-[11px] text-zinc-400 hover:text-white border border-white/5 transition-all"
          >
            <span>DAG Graph</span>
          </button>
        </div>

        {/* Center: THE 3-PHASE PROGRESSION STEPPER */}
        <div className="flex items-center justify-center p-1 rounded-2xl bg-zinc-900/90 border border-white/10 shadow-inner overflow-x-auto">
          {/* Phase 1 Button */}
          <button
            type="button"
            onClick={() => setLearningPhase("theory")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              learningPhase === "theory"
                ? "bg-cyan-500 text-zinc-950 shadow-lg shadow-cyan-500/25 scale-[1.02]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>1. ML/DL Theory</span>
          </button>

          <span className="text-zinc-600 px-1 text-xs select-none">──►</span>

          {/* Phase 2 Button */}
          <button
            type="button"
            onClick={() => setLearningPhase("building")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              learningPhase === "building"
                ? "bg-amber-400 text-zinc-950 shadow-lg shadow-amber-400/25 scale-[1.02]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>2. Build from Scratch</span>
            {projectParts.length > 0 && (
              <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${
                learningPhase === "building" ? "bg-zinc-950/20 text-zinc-950 font-bold" : "bg-zinc-800 text-amber-300"
              }`}>
                {projectParts.length}/{concepts.length}
              </span>
            )}
          </button>

          <span className="text-zinc-600 px-1 text-xs select-none">──►</span>

          {/* Phase 3 Button */}
          <button
            type="button"
            onClick={() => setLearningPhase("testing")}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 whitespace-nowrap ${
              learningPhase === "testing"
                ? "bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-400/25 scale-[1.02]"
                : "text-zinc-400 hover:text-white"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>3. Model Tester & Runner</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>

        {/* Right: Actions, Track Toggle & Advance */}
        <div className="flex items-center gap-2 self-end xl:self-auto">
          {/* Python Foundation Switcher */}
          <button
            type="button"
            onClick={() =>
              setLearningTrack(
                learningTrack === "python_foundation" ? "project" : "python_foundation"
              )
            }
            className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all flex items-center gap-1.5 border ${
              learningTrack === "python_foundation"
                ? "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-md shadow-emerald-500/10"
                : "bg-zinc-900/90 text-zinc-300 hover:text-white border-white/10"
            }`}
          >
            <span>🐍</span>
            <span>
              {learningTrack === "python_foundation"
                ? "Back to Project"
                : "Need Python?"}
            </span>
          </button>

          {/* Teach Socrates Button */}
          {isCodePassed && !isMastered && (
            <button
              type="button"
              onClick={() => setIsTeachBackOpen(true)}
              className="px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Teach Socrates ✨</span>
            </button>
          )}

          {/* Next Step in Roadmap */}
          <button
            type="button"
            onClick={advanceToNextConcept}
            className="px-3.5 py-1.5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-bold text-xs shadow-md transition-all flex items-center gap-1"
          >
            <span>Next Step</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 2. UNCLUTTERED DEDICATED WORKSPACE FOR THE ACTIVE PHASE                   */}
      {/* ========================================================================= */}
      <div className="flex-1 min-h-0 overflow-y-auto">
        {learningPhase === "theory" ? (
          <Phase1TheoryView
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
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-start justify-center pt-20 p-4 animate-in fade-in duration-200">
          <div className="bg-[#12110D] border border-gold/30 rounded-3xl p-6 max-w-xl w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <Workflow className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Roadmap Steps Navigator
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowRoadmapDrawer(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
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
                    className={`w-full text-left p-3.5 rounded-2xl border transition-all flex items-center justify-between gap-3 ${
                      isCurrent
                        ? "bg-amber-500/15 border-amber-500 text-white font-semibold shadow-md"
                        : "bg-zinc-900/60 border-white/5 text-zinc-300 hover:bg-zinc-800 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-full bg-zinc-800 text-zinc-400 font-mono text-xs flex items-center justify-center font-bold">
                        {idx + 1}
                      </span>
                      <div>
                        <span className="text-xs font-bold block">{c.title}</span>
                        <span className="text-[10px] text-zinc-500 truncate max-w-xs block">
                          {c.hook}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0">
                      {isPartDone && (
                        <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-mono">
                          Built ✓
                        </span>
                      )}
                      {cStatus === "mastered" && (
                        <span className="px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 text-[10px] font-mono">
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-[#12110D] border border-gold/30 rounded-3xl p-6 max-w-4xl w-full h-[80vh] shadow-2xl flex flex-col space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3 flex-shrink-0">
              <div className="flex items-center gap-2">
                <Workflow className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">
                  Concept Dependency Graph (DAG)
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setShowVisualGraph(false)}
                className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-zinc-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="flex-1 min-h-0 rounded-2xl overflow-hidden border border-white/5">
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
