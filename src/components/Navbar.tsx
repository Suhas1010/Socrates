"use client";

import React, { useState } from "react";
import {
  Sparkles,
  RotateCcw,
  Layers,
  CheckCircle2,
  Lightbulb,
} from "lucide-react";
import { useSessionStore } from "@/lib/store";
import { JargonBusterModal } from "./JargonBusterModal";
import { ApiKeyModal } from "./ApiKeyModal";
import { PythonAcademyModal } from "./PythonAcademyModal";
import { Cpu } from "lucide-react";

export const Navbar: React.FC = () => {
  const {
    activeStage,
    screen,
    concepts,
    status,
    resetSession,
    apiKey,
    openPythonAcademy,
  } = useSessionStore();

  const [isJargonModalOpen, setIsJargonModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      if (params.get("jargon") === "true") {
        setIsJargonModalOpen(true);
      }
      if (params.get("settings") === "true" || params.get("api_key") === "true") {
        setIsApiKeyModalOpen(true);
      }
    }
  }, []);

  const currentScreen = screen || (activeStage === "plan_review" ? "plan" : activeStage === "learning" ? "learn" : activeStage === "completed" ? "complete" : activeStage);

  const masteredCount = concepts.filter(
    (c) => status[c.id] === "mastered"
  ).length;
  const totalCount = concepts.length;
  const progressPercent = Math.round((masteredCount / totalCount) * 100);

  const stages = [
    { id: "landing", label: "Goal" },
    { id: "diagnostic", label: "Diagnostic" },
    { id: "plan", label: "Plan" },
    { id: "learn", label: "Learn & Code" },
    { id: "complete", label: "Complete" },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/90 backdrop-blur-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-14 flex items-center justify-between gap-4">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-lg bg-zinc-800 border border-zinc-700/60 flex items-center justify-center text-zinc-100 font-semibold shadow-sm">
            <Sparkles className="w-3.5 h-3.5 fill-current text-zinc-200" />
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold tracking-tight text-zinc-100 font-sans">
              Socrates
            </span>
            <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-zinc-800/80 text-zinc-400 border border-zinc-700/50 font-medium">
              AI Tutor
            </span>
          </div>
        </div>

        {/* Stage breadcrumb pills */}
        <div className="hidden md:flex items-center gap-1 bg-zinc-900/60 p-1 rounded-lg border border-zinc-800/80 shadow-sm">
          {stages.map((stage, idx) => {
            const isActive = currentScreen === stage.id;
            const isDone =
              stages.findIndex((s) => s.id === currentScreen) > idx;

            return (
              <div
                key={stage.id}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? "bg-zinc-800 text-zinc-100 shadow-sm font-medium"
                    : isDone
                    ? "text-emerald-400 hover:text-emerald-300"
                    : "text-zinc-500"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="text-[10px] font-mono opacity-70">{idx + 1}.</span>
                )}
                <span>{stage.label}</span>
              </div>
            );
          })}
        </div>

        {/* Right stats and controls */}
        <div className="flex items-center gap-2">
          {/* Beginner Jargon Buster Button */}
          <button
            type="button"
            onClick={() => setIsJargonModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-zinc-400 hover:text-zinc-200 text-xs font-medium transition-colors shadow-sm"
            title="Open plain-English glossary for confusing AI terms"
          >
            <Lightbulb className="w-3.5 h-3.5 text-zinc-400" />
            <span>Jargon Buster</span>
          </button>

          {currentScreen !== "landing" && (
            <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-zinc-900/60 border border-zinc-800/80 text-xs font-medium">
              <Layers className="w-3.5 h-3.5 text-zinc-400" />
              <span className="text-zinc-500 hidden sm:inline">Mastery</span>
              <span className="font-mono text-zinc-200">
                {masteredCount}/{totalCount}
              </span>
              <div className="w-10 h-1 bg-zinc-800 rounded-full overflow-hidden ml-0.5">
                <div
                  className="h-full bg-emerald-400 transition-all duration-300 rounded-full"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>
          )}

          {/* AI Settings button */}
          <button
            type="button"
            onClick={() => setIsApiKeyModalOpen(true)}
            title="Configure Google Gemini API Key and AI model settings"
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-zinc-900/60 hover:bg-zinc-800 border border-zinc-800 hover:border-zinc-700 text-xs font-mono text-zinc-400 hover:text-zinc-200 transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 text-zinc-400" />
            <span className="hidden sm:inline">{apiKey ? "Gemini Live" : "AI Settings"}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${apiKey ? "bg-emerald-400" : "bg-zinc-600"}`} />
          </button>

          {/* Dedicated Learn Python Academy Button */}
          <button
            type="button"
            onClick={openPythonAcademy}
            title="Open dedicated Python Academy: interactive Python tutorials and code playground"
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 hover:border-emerald-500/50 text-xs text-emerald-300 hover:text-emerald-200 font-medium transition-all shadow-sm"
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Learn Python</span>
          </button>

          {/* Reset session button */}
          <button
            onClick={() => {
              if (
                window.confirm(
                  "Reset tutor session and choose a new project goal?"
                )
              ) {
                resetSession();
              }
            }}
            title="Reset and start over"
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-800"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* AI Key & Settings Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

      {/* Jargon Buster Modal */}
      <JargonBusterModal
        isOpen={isJargonModalOpen}
        onClose={() => setIsJargonModalOpen(false)}
      />

      {/* Dedicated Python Academy Modal */}
      <PythonAcademyModal />
    </header>
  );
};

