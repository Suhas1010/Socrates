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
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 px-4 py-2.5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 shadow-sm flex-shrink-0">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-200 shadow-sm">
            <Code2 className="w-3.5 h-3.5 text-zinc-300" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-mono font-medium text-zinc-400 uppercase tracking-wider">
                Phase 2 · Build Studio
              </span>
              <span className="text-[11px] text-zinc-500 font-mono">
                Step {currentIndex + 1} of {concepts.length}
              </span>
            </div>
            <h3 className="text-sm md:text-base font-semibold text-zinc-100">
              {concept.title}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className="flex items-center p-0.5 rounded-lg bg-zinc-950 border border-zinc-800/80">
            <button
              type="button"
              onClick={() => setViewMode("step_editor")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                viewMode === "step_editor"
                  ? "bg-zinc-800 text-zinc-100 shadow-sm font-medium"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Step Code</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode("assembled_pipeline")}
              className={`px-3 py-1 rounded-md text-xs font-medium transition-all flex items-center gap-1.5 ${
                viewMode === "assembled_pipeline"
                  ? "bg-zinc-800 text-zinc-100 shadow-sm font-medium"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              <span>main_model.py</span>
              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-zinc-850 text-zinc-300 font-medium border border-zinc-750">
                {projectParts.length}/{concepts.length}
              </span>
            </button>
          </div>

          <button
            type="button"
            onClick={onProceedToTesting}
            className="px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
          >
            <Zap className="w-3.5 h-3.5 text-emerald-400" />
            <span>Test Live</span>
            <ArrowRight className="w-3.5 h-3.5" />
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
            <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-3 shadow-sm">
              <div className="flex items-center gap-2 pb-2 border-b border-zinc-800/80">
                <span className="w-1.5 h-1.5 rounded-full bg-zinc-400" />
                <span className="text-xs font-mono uppercase text-zinc-400 font-medium tracking-wider block">
                  Coding Objective
                </span>
              </div>
              <p className="text-xs md:text-sm text-zinc-300 leading-relaxed font-sans font-normal">
                {concept.buildStep}
              </p>

              {concept.corePrinciple && (
                <div className="p-3 rounded-lg bg-zinc-950/80 border border-zinc-800 space-y-1">
                  <span className="text-[11px] font-mono uppercase text-zinc-400 font-medium block tracking-wide">
                    Underlying Principle
                  </span>
                  <p className="text-xs text-zinc-400 font-sans leading-relaxed">
                    {concept.corePrinciple}
                  </p>
                </div>
              )}
            </div>

            {/* Blanks Guided Checklist */}
            <div className="p-5 rounded-xl bg-zinc-900/40 border border-zinc-800/80 space-y-3 shadow-sm">
              <span className="text-xs font-mono uppercase text-zinc-400 font-medium tracking-wider block">
                Implementation Guide:
              </span>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Find the <code className="px-1.5 py-0.5 rounded bg-zinc-800 border border-zinc-700/60 text-zinc-200 font-mono text-xs">___</code> blanks in the code editor:
              </p>
              <div className="space-y-2 pt-1">
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-300 leading-relaxed">
                    Replace each <code className="text-zinc-200 font-mono text-xs px-1 rounded bg-zinc-800">___</code> blank with Python code.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-500 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-300 leading-relaxed">
                    Inspect the <code className="text-zinc-400 font-mono text-xs"># TODO:</code> comments for hints.
                  </span>
                </div>
                <div className="flex items-start gap-2.5 p-3 rounded-lg bg-zinc-950/60 border border-zinc-800/80">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mt-1.5 flex-shrink-0" />
                  <span className="text-xs text-zinc-300 leading-relaxed">
                    Click <strong>Run Code</strong> to validate in Pyodide.
                  </span>
                </div>
              </div>
            </div>

            {/* Status & Feynman Action */}
            {isCodePassed && (
              <div className="p-5 rounded-xl bg-emerald-950/30 border border-emerald-500/40 space-y-3 animate-in fade-in duration-200 shadow-sm">
                <div className="flex items-center gap-2 text-emerald-300 font-semibold text-sm">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>Step {currentIndex + 1} Passed</span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Your function has passed all unit tests and is automatically wired into the cumulative model pipeline.
                </p>

                {!isMastered && (
                  <button
                    type="button"
                    onClick={onOpenTeachBack}
                    className="w-full py-2.5 px-3.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs shadow-sm transition-colors flex items-center justify-center gap-1.5"
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
              className="mt-auto py-2 px-3.5 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-mono font-medium transition-colors flex items-center justify-center gap-1.5 shadow-sm"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
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
      <div className="flex items-center justify-between pt-2 border-t border-slate-800 flex-shrink-0">
        <button
          type="button"
          onClick={onBackToTheory}
          className="px-4 py-2 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-300 hover:text-white border border-slate-800 text-xs font-medium transition-colors flex items-center gap-1.5 shadow-sm"
        >
          <ChevronLeft className="w-3.5 h-3.5" />
          <span>Back to Phase 1 Theory</span>
        </button>

        <button
          type="button"
          onClick={onProceedToTesting}
          className="px-5 py-2.5 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-semibold text-xs md:text-sm shadow-sm transition-all flex items-center gap-2"
        >
          <span>Advance to Phase 3: Model Tester & Runner</span>
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
