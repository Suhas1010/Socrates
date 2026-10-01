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
    <div className="flex-1 flex flex-col h-full overflow-hidden px-4 md:px-8 py-4 space-y-4 text-slate-100">
      {/* ========================================================================= */}
      {/* 1. TOP BAR: PROJECT STEP + 3-PHASE STEPPER + TRACK SWITCHER               */}
      {/* ========================================================================= */}
      <div className="flex flex-col xl:flex-row xl:items-center justify-between gap-4 px-5 py-4 rounded-3xl bg-slate-900/90 border border-white/15 shadow-2xl flex-shrink-0 backdrop-blur-xl">
        {/* Left: Step indicator & Roadmap drawer trigger */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setShowRoadmapDrawer(!showRoadmapDrawer)}
            className="flex items-center gap-2.5 px-4 py-2.5 rounded-2xl bg-slate-800/90 hover:bg-slate-700/90 border border-white/15 text-sm md:text-base font-bold transition-all text-white shadow-sm"
          >
            <Workflow className="w-4 h-4 text-amber-400" />
            <span className="font-mono text-amber-300 font-extrabold">
              Step {currentIndex + 1} of {concepts.length}
            </span>
            <span className="text-slate-300 truncate max-w-[160px] sm:max-w-[240px] font-semibold">
              {currentConcept?.title}
            </span>
            <ChevronDown className="w-4 h-4 text-slate-400" />
          </button>

          <button
            type="button"
            onClick={() => setShowVisualGraph(true)}
            className="hidden sm:flex items-center gap-2 px-3 py-2 rounded-2xl bg-slate-800/60 hover:bg-slate-700/60 text-xs md:text-sm text-slate-300 hover:text-white border border-white/10 transition-all font-medium"
          >
            <span>DAG Graph</span>
          </button>
        </div>

        {/* Center: THE 3-PHASE PROGRESSION STEPPER */}
        <div className="flex items-center justify-center p-1.5 rounded-2xl bg-slate-950/80 border border-white/15 shadow-inner overflow-x-auto">
          {/* Phase 1 Button */}
          <button
            type="button"
            onClick={() => setLearningPhase("theory")}
            className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
              learningPhase === "theory"
                ? "bg-cyan-500 text-zinc-950 shadow-lg shadow-cyan-500/25 scale-[1.02]"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Brain className="w-4 h-4" />
            <span>1. ML/DL Theory</span>
          </button>

          <span className="text-slate-500 px-1 text-xs select-none">──►</span>

          {/* Phase 2 Button */}
          <button
            type="button"
            onClick={() => setLearningPhase("building")}
            className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
              learningPhase === "building"
                ? "bg-amber-400 text-zinc-950 shadow-lg shadow-amber-400/25 scale-[1.02]"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>2. Build from Scratch</span>
            {projectParts.length > 0 && (
              <span className={`text-xs font-mono px-2 py-0.5 rounded-full ${
                learningPhase === "building" ? "bg-zinc-950/20 text-zinc-950 font-black" : "bg-slate-800 text-amber-300"
              }`}>
                {projectParts.length}/{concepts.length}
              </span>
            )}
          </button>

          <span className="text-slate-500 px-1 text-xs select-none">──►</span>

          {/* Phase 3 Button */}
          <button
            type="button"
            onClick={() => setLearningPhase("testing")}
            className={`px-4 py-2.5 rounded-xl text-xs md:text-sm font-extrabold transition-all flex items-center gap-2 whitespace-nowrap ${
              learningPhase === "testing"
                ? "bg-emerald-400 text-zinc-950 shadow-lg shadow-emerald-400/25 scale-[1.02]"
                : "text-slate-300 hover:text-white"
            }`}
          >
            <Zap className="w-4 h-4" />
            <span>3. Model Tester & Runner</span>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          </button>
        </div>

        {/* Right: Actions, Track Toggle & Advance */}
        <div className="flex items-center gap-2.5 self-end xl:self-auto">
          {/* Dedicated Python Academy Opener */}
          <button
            type="button"
            onClick={openPythonAcademy}
            title="Open dedicated Python Academy: interactive Python tutorials and code playground"
            className="px-4 py-2.5 rounded-2xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 border bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 border-emerald-500/40 shadow-sm hover:scale-[1.02]"
          >
            <span className="text-base">🐍</span>
            <span>Learn Python Academy</span>
          </button>

          {/* Teach Socrates Button */}
          {isCodePassed && !isMastered && (
            <button
              type="button"
              onClick={() => setIsTeachBackOpen(true)}
              className="px-3.5 py-2 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs md:text-sm transition-all flex items-center gap-1.5 shadow-md"
            >
              <Sparkles className="w-4 h-4" />
              <span>Teach Socrates ✨</span>
            </button>
          )}

          {/* Next Step in Roadmap */}
          <button
            type="button"
            onClick={advanceToNextConcept}
            className="px-4 py-2 rounded-2xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-black text-xs md:text-sm shadow-md transition-all flex items-center gap-1.5"
          >
            <span>Next Step</span>
            <ArrowRight className="w-4 h-4" />
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
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-start justify-center pt-16 md:pt-24 p-4 animate-in fade-in duration-200">
          <div className="bg-slate-950 border border-white/20 rounded-3xl p-6 md:p-8 max-w-2xl w-full shadow-2xl space-y-5">
            <div className="flex items-center justify-between border-b border-white/10 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-sm">
                  <Workflow className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h3 className="text-base md:text-lg font-black text-white uppercase tracking-wider">
                    Roadmap Steps Navigator
                  </h3>
                  <span className="text-xs text-slate-400 font-mono">
                    Select any concept in your personalized learning sequence
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setShowRoadmapDrawer(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-[65vh] overflow-y-auto pr-1">
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
                    className={`w-full text-left p-4 md:p-5 rounded-2xl border transition-all flex items-start justify-between gap-4 ${
                      isCurrent
                        ? "bg-amber-400/15 border-amber-400 ring-2 ring-amber-400/40 text-white font-bold shadow-lg"
                        : "bg-slate-900/80 border-white/10 text-slate-200 hover:bg-slate-800 hover:border-white/25 hover:text-white"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <span
                        className={`w-9 h-9 rounded-2xl font-mono text-sm md:text-base font-black flex items-center justify-center flex-shrink-0 mt-0.5 ${
                          isCurrent
                            ? "bg-amber-400 text-zinc-950 shadow-md"
                            : "bg-slate-800 text-amber-300 border border-white/10"
                        }`}
                      >
                        {idx + 1}
                      </span>
                      <div className="min-w-0">
                        <span
                          className={`text-base md:text-lg font-black block ${
                            isCurrent ? "text-amber-300" : "text-white"
                          }`}
                        >
                          {c.title}
                        </span>
                        <span className="text-xs md:text-sm text-slate-300 mt-1 block leading-relaxed line-clamp-2 font-normal">
                          {c.hook}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 flex-shrink-0 mt-1">
                      {isPartDone && (
                        <span className="px-3 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-mono font-bold">
                          Built ✓
                        </span>
                      )}
                      {cStatus === "mastered" && (
                        <span className="px-3 py-1 rounded-full bg-cyan-500/20 border border-cyan-500/40 text-cyan-300 text-xs font-mono font-bold">
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
