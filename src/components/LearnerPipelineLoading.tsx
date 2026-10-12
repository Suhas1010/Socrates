"use client";

import React from "react";
import { Sparkles, CheckCircle2 } from "lucide-react";
import { AgentStatusEvent } from "@/lib/agents/types";
import {
  mapAgentEventToLearnerMessage,
  getLearnerProgressPercentage,
} from "@/lib/agents/mapper";

interface LearnerPipelineLoadingProps {
  events: AgentStatusEvent[];
  isComplete?: boolean;
  onContinue?: () => void;
}

/**
 * Clean, human-readable loading state for the main learner-facing UI (Bug 2 Fix).
 * Replaces the internal agent registry and raw event streams with simple,
 * friendly progress messages.
 */
export const LearnerPipelineLoading: React.FC<LearnerPipelineLoadingProps> = ({
  events,
  isComplete = false,
  onContinue,
}) => {
  const latestEvent = events[events.length - 1];
  const activeAgent = latestEvent?.agent;
  const currentMessage = mapAgentEventToLearnerMessage(activeAgent);
  const progressPercent = isComplete ? 100 : getLearnerProgressPercentage(activeAgent);

  const learnerStages = [
    { id: "scope", label: "Goal Scoping", active: !activeAgent || activeAgent === "scoper" },
    { id: "arch", label: "Architecture", active: activeAgent === "architect" },
    { id: "code", label: "Reference Code", active: activeAgent === "implementer" || activeAgent === "executor" },
    { id: "steps", label: "Step-by-Step Path", active: activeAgent === "slicer" },
    { id: "workspace", label: "Workspace Preparation", active: activeAgent === "pedagogue" || isComplete },
  ];

  return (
    <div className="w-full max-w-xl mx-auto p-6 rounded-2xl border border-zinc-800 bg-[#090b10] text-zinc-100 shadow-2xl space-y-6 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
          <Sparkles className="w-5 h-5 animate-pulse" />
        </div>
        <div>
          <h3 className="font-semibold text-base text-zinc-100 font-mono">
            {isComplete ? "Your Project is Ready!" : "Setting Up Your Learning Workspace"}
          </h3>
          <p className="text-xs text-zinc-400 font-mono">
            {isComplete ? "All build steps and tests have been compiled." : currentMessage}
          </p>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
          <span>{currentMessage}</span>
          <span>{progressPercent}%</span>
        </div>
        <div className="w-full h-2 rounded-full bg-zinc-900 border border-zinc-800 overflow-hidden">
          <div
            className="h-full bg-amber-500 transition-all duration-300 ease-out"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Human-Readable Stages (No agent names leaked) */}
      <div className="grid grid-cols-5 gap-1 pt-1">
        {learnerStages.map((st, i) => {
          const isDone = progressPercent >= (i + 1) * 20;
          return (
            <div key={st.id} className="text-center space-y-1">
              <div
                className={`h-1 rounded-full transition-colors ${
                  isDone
                    ? "bg-emerald-500"
                    : st.active
                    ? "bg-amber-400 animate-pulse"
                    : "bg-zinc-800"
                }`}
              />
              <span className="text-[10px] font-mono text-zinc-500 block truncate">
                {st.label}
              </span>
            </div>
          );
        })}
      </div>

      {/* Completion Action */}
      {isComplete && onContinue && (
        <div className="pt-2 flex justify-end">
          <button
            type="button"
            onClick={onContinue}
            className="px-4 py-2 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold font-mono text-xs transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Enter Workspace</span>
          </button>
        </div>
      )}
    </div>
  );
};
