"use client";

import React, { useState } from "react";
import {
  Code2,
  Brain,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  CheckCircle2,
  Layers,
  Zap,
  HelpCircle,
  FileCode,
  Check,
  AlertTriangle,
} from "lucide-react";
import { Concept, ProjectPart } from "@/lib/types";
import { CodeSandbox } from "./CodeSandbox";
import { AssembledProjectView } from "./AssembledProjectView";

interface Phase2BuildViewProps {
  concept: Concept;
  goal: string;
  concepts: Concept[];
  projectParts: ProjectPart[];
  isCodePassed: boolean;
  isMastered: boolean;
  onStepPassed: (code: string) => void;
  onOpenTeachBack: () => void;
  onBackToTheory: () => void;
  onProceedToTesting: () => void;
}

export const Phase2BuildView: React.FC<Phase2BuildViewProps> = ({
  concept,
  goal,
  concepts,
  projectParts,
  isCodePassed,
  isMastered,
  onStepPassed,
  onOpenTeachBack,
  onBackToTheory,
  onProceedToTesting,
}) => {
  const [viewMode, setViewMode] = useState<"step_editor" | "assembled_pipeline">("step_editor");
  const currentIndex = concepts.findIndex((c) => c.id === concept.id);
  const safeGoal = goal?.trim() || "Your AI Project";

  return (
    <div className="flex-1 flex flex-col min-h-0 space-y-4 animate-in fade-in duration-200">
      {/* 1. Header Toolbar: Mode Toggle (Step Code vs Pipeline) & Progression CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-5 py-3 rounded-2xl bg-zinc-900/60 border border-zinc-800/90 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shadow-sm">
            <Code2 className="w-5 h-5 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs sm:text-sm font-mono font-bold text-amber-400 uppercase tracking-wider">
                Phase 2 · Build Studio
              </span>
              <span className="text-xs sm:text-sm text-slate-400 font-mono font-medium">
                Step {currentIndex + 1} of {concepts.length}
              </span>
            </div>
            <h3 className="text-base sm:text-lg md:text-xl font-black text-white">
              {concept.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          {/* View toggle */}
          <div className="flex items-center p-1 rounded-xl bg-zinc-950 border border-zinc-800 shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode("step_editor")}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                viewMode === "step_editor"
                  ? "bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Step Code</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("assembled_pipeline")}
              className={`px-3.5 py-1.5 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 cursor-pointer ${
                viewMode === "assembled_pipeline"
                  ? "bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>main_model.py</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-amber-300 font-bold border border-zinc-700">
                {projectParts.length}/{concepts.length}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={onProceedToTesting}
            className="px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 text-emerald-300 hover:text-emerald-100 border border-emerald-500/40 text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
          >
            <Zap className="w-4 h-4 text-emerald-400" />
            <span>Test Live</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 2. Workspace Body */}
      {viewMode === "assembled_pipeline" ? (
        <div className="flex-1 overflow-y-auto">
          <AssembledProjectView />
        </div>
      ) : (
        <div className="flex-1 min-h-0 grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Left Column: Build Spec Guide */}
          <div className="lg:col-span-4 flex flex-col space-y-4 overflow-y-auto pr-1">
            {/* Build Objective Box */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0d111a]/95 border border-zinc-800 space-y-3.5 shadow-md">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/80">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]" />
                <span className="text-xs sm:text-sm font-mono uppercase text-amber-400 font-bold tracking-wider block">
                  Coding Objective
                </span>
              </div>
              <p className="text-sm sm:text-base text-zinc-100 leading-relaxed font-sans font-medium">
                {concept.buildStep}
              </p>

              {concept.corePrinciple && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/25 space-y-1.5 shadow-inner">
                  <span className="text-xs font-mono uppercase text-amber-400 font-bold block tracking-wider">
                    Underlying Principle
                  </span>
                  <p className="text-xs sm:text-sm text-amber-100 font-sans leading-relaxed font-normal">
                    {concept.corePrinciple}
                  </p>
                </div>
              )}
            </div>

            {/* Blanks Guided Checklist */}
            <div className="p-5 sm:p-6 rounded-2xl bg-[#0d111a]/95 border border-zinc-800 space-y-3.5 shadow-md">
              <span className="text-xs sm:text-sm font-mono uppercase text-amber-400 font-bold tracking-wider block">
                Implementation Guide:
              </span>
              <p className="text-xs sm:text-sm text-zinc-300 leading-relaxed">
                Find the <code className="px-2 py-0.5 rounded-md bg-zinc-800 border border-zinc-700 text-amber-300 font-mono text-xs sm:text-sm font-bold">___</code> blanks in the code editor:
              </p>
              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
                  <span className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                  <span className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
                    Replace each <code className="text-amber-300 font-mono text-xs sm:text-sm px-1.5 py-0.5 rounded bg-zinc-800 font-bold">___</code> blank with Python code.
                  </span>
                </div>
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
                  <span className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0 shadow-[0_0_6px_rgba(251,191,36,0.6)]" />
                  <span className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
                    Inspect the <code className="text-amber-300 font-mono text-xs sm:text-sm font-semibold"># TODO:</code> comments for hints.
                  </span>
                </div>
                <div className="flex items-start gap-3 p-3.5 rounded-xl bg-zinc-950/70 border border-zinc-800">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0 shadow-[0_0_6px_rgba(52,211,153,0.6)]" />
                  <span className="text-xs sm:text-sm text-zinc-200 leading-relaxed font-medium">
                    Click <strong className="text-white">Run Code</strong> to validate in Pyodide.
                  </span>
                </div>
              </div>
            </div>

            {/* Status & Feynman Action */}
            {isCodePassed && (
              <div className="p-5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-3 animate-in fade-in duration-200 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-base">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Step {currentIndex + 1} Passed</span>
                </div>
                <p className="text-xs sm:text-sm text-slate-200 leading-relaxed">
                  Your function has passed all unit tests and is automatically wired into the cumulative model pipeline.
                </p>

                {!isMastered && (
                  <button
                    type="button"
                    onClick={onOpenTeachBack}
                    className="w-full py-3 px-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs sm:text-sm shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-95"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>Teach Socrates (Feynman Check)</span>
                  </button>
                )}
              </div>
            )}

            {/* Back to Theory Button */}
            <button
              type="button"
              onClick={onBackToTheory}
              className="mt-auto py-2.5 px-4 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs sm:text-sm font-mono font-bold transition-all flex items-center justify-center gap-2 shadow-sm cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Review Phase 1 Theory</span>
            </button>
          </div>

          {/* Right Column: CodeSandbox with In-Browser Pyodide */}
          <div className="lg:col-span-8 flex flex-col min-h-[500px] h-full overflow-hidden">
            <CodeSandbox
              concept={concept}
              isAlreadyPassed={isCodePassed}
              onStepPassed={onStepPassed}
              onEvaluation={() => {}}
              onOpenTeachBack={onOpenTeachBack}
            />
          </div>
        </div>
      )}

      {/* 3. Bottom Navigation Bar */}
      <div className="flex items-center justify-between pt-3 border-t border-slate-800 flex-shrink-0">
        <button
          type="button"
          onClick={onBackToTheory}
          className="px-4 py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white border border-slate-700 text-xs sm:text-sm font-bold transition-colors flex items-center gap-2 shadow-sm cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Phase 1 Theory</span>
        </button>

        <button
          type="button"
          onClick={onProceedToTesting}
          className="px-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-xs sm:text-sm md:text-base shadow-lg transition-all flex items-center gap-2.5 cursor-pointer active:scale-95"
        >
          <span>Advance to Phase 3: Model Tester & Runner</span>
          <ArrowRight className="w-5 h-5" />
        </button>
      </div>
    </div>
  );
};
