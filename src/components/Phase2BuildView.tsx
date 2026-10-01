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
    <div className="flex-1 flex flex-col min-h-0 space-y-5 animate-in fade-in duration-300">
      {/* 1. Header Toolbar: Mode Toggle (Step Code vs Pipeline) & Progression CTA */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-6 py-4 rounded-3xl bg-slate-900/90 border border-white/15 shadow-xl flex-shrink-0">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 shadow-md">
            <Code2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xs md:text-sm font-mono font-black text-amber-300 uppercase tracking-wider">
                PHASE 2: BUILD STUDIO
              </span>
              <span className="text-xs text-slate-300 font-mono font-medium">
                Step {currentIndex + 1} of {concepts.length}
              </span>
            </div>
            <h3 className="text-base md:text-lg font-black text-white">
              {concept.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* View toggle */}
          <div className="flex items-center p-1.5 rounded-2xl bg-slate-950 border border-white/15 shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode("step_editor")}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
                viewMode === "step_editor"
                  ? "bg-amber-400 text-zinc-950 font-black shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <FileCode className="w-4 h-4" />
              <span>Step Code</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("assembled_pipeline")}
              className={`px-4 py-2 rounded-xl text-xs md:text-sm font-bold transition-all flex items-center gap-2 ${
                viewMode === "assembled_pipeline"
                  ? "bg-amber-400 text-zinc-950 font-black shadow-md"
                  : "text-slate-300 hover:text-white"
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>main_model.py</span>
              <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-slate-900 text-amber-300 font-bold border border-white/10">
                {projectParts.length}/{concepts.length}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={onProceedToTesting}
            className="px-4 py-2.5 rounded-2xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 text-xs md:text-sm font-bold transition-all flex items-center gap-2 shadow-md"
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
          <div className="lg:col-span-4 flex flex-col space-y-5 overflow-y-auto pr-1">
            {/* Build Objective Box */}
            <div className="p-6 md:p-7 rounded-3xl bg-slate-900/90 border border-white/15 space-y-4 shadow-xl">
              <div className="flex items-center gap-2.5 pb-3 border-b border-white/10">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-sm shadow-amber-400/50" />
                <span className="text-xs md:text-sm font-mono uppercase text-amber-400 font-black tracking-wider block">
                  🛠️ Coding Objective
                </span>
              </div>
              <p className="text-base md:text-lg text-slate-200 leading-relaxed font-sans font-medium">
                {concept.buildStep}
              </p>

              {concept.corePrinciple && (
                <div className="p-4 rounded-2xl bg-amber-950/30 border border-amber-500/30 space-y-1.5 shadow-inner">
                  <span className="text-xs font-mono uppercase text-amber-300 font-black block tracking-wide">
                    Mathematical Principle
                  </span>
                  <p className="text-sm md:text-base text-amber-100 font-mono font-medium">
                    {concept.corePrinciple}
                  </p>
                </div>
              )}
            </div>

            {/* Blanks Guided Checklist */}
            <div className="p-6 md:p-7 rounded-3xl bg-slate-900/90 border border-white/15 space-y-3.5 shadow-xl">
              <span className="text-xs md:text-sm font-mono uppercase text-slate-300 font-black tracking-wider block">
                📝 Implementation Checklist:
              </span>
              <p className="text-sm md:text-base text-slate-300 leading-relaxed">
                Find the <code className="px-2.5 py-1 rounded-lg bg-slate-950 border border-amber-400/40 text-amber-300 font-mono text-sm font-bold">___</code> blanks in the code editor:
              </p>
              <div className="space-y-2.5 pt-1">
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                  <span className="text-sm md:text-base text-slate-200 leading-relaxed">
                    Replace every <code className="text-amber-300 font-mono text-sm font-bold">___</code> blank with Python logic.
                  </span>
                </div>
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-amber-400 mt-2 flex-shrink-0" />
                  <span className="text-sm md:text-base text-slate-200 leading-relaxed">
                    Read the inline <code className="text-slate-400 font-mono text-sm font-bold"># TODO:</code> comments for step-by-step hints.
                  </span>
                </div>
                <div className="flex items-start gap-3 p-3.5 rounded-2xl bg-slate-950/80 border border-white/10">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 mt-2 flex-shrink-0" />
                  <span className="text-sm md:text-base text-slate-200 leading-relaxed">
                    Click <strong>Run Code</strong> to test assertions in Pyodide.
                  </span>
                </div>
              </div>
            </div>

            {/* Status & Feynman Action */}
            {isCodePassed && (
              <div className="p-6 md:p-7 rounded-3xl bg-emerald-950/50 border border-emerald-500/50 space-y-4 animate-in fade-in duration-200 shadow-2xl">
                <div className="flex items-center gap-2.5 text-emerald-300 font-black text-base md:text-lg">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Step {currentIndex + 1} Passed!</span>
                </div>
                <p className="text-sm md:text-base text-slate-200 leading-relaxed">
                  Your function has passed all unit tests and is automatically wired into the cumulative model pipeline.
                </p>

                {!isMastered && (
                  <button
                    type="button"
                    onClick={onOpenTeachBack}
                    className="w-full py-3.5 px-4 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-black text-sm md:text-base shadow-xl transition-all flex items-center justify-center gap-2"
                  >
                    <Sparkles className="w-5 h-5" />
                    <span>Teach Socrates (Feynman Check)</span>
                  </button>
                )}
              </div>
            )}

            {/* Back to Theory Button */}
            <button
              type="button"
              onClick={onBackToTheory}
              className="mt-auto py-3 px-5 rounded-2xl bg-slate-900/90 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/15 text-xs md:text-sm font-mono font-bold transition-all flex items-center justify-center gap-2 shadow-md"
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
      <div className="flex items-center justify-between pt-3 border-t border-white/10 flex-shrink-0">
        <button
          type="button"
          onClick={onBackToTheory}
          className="px-5 py-3 rounded-2xl bg-slate-900 hover:bg-slate-800 text-slate-300 hover:text-white border border-white/15 text-xs md:text-sm font-bold transition-all flex items-center gap-2 shadow-md"
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Phase 1 Theory</span>
        </button>

        <button
          type="button"
          onClick={onProceedToTesting}
          className="px-6 py-3.5 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-zinc-950 font-black text-sm md:text-base shadow-xl shadow-emerald-500/25 transition-all flex items-center gap-2"
        >
          <span>Advance to Phase 3: Model Tester & Runner</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
