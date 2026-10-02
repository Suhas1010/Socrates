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
    <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#080B12]/95 backdrop-blur-md">
      <div className="w-full px-4 sm:px-6 md:px-8 h-16 flex items-center justify-between gap-4">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-semibold shadow-sm">
            <Sparkles className="w-4 h-4 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base md:text-lg font-bold tracking-tight text-white font-sans">
                Socrates
              </span>
              <span className="text-xs uppercase font-mono tracking-wider px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 border border-amber-500/20 font-semibold">
                AI Tutor
              </span>
            </div>
            <p className="text-xs text-slate-400 font-normal hidden lg:block">
              Learn AI by building real projects · 0 setup
            </p>
          </div>
        </div>

        {/* Stage breadcrumb pills */}
        <div className="hidden md:flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 shadow-sm">
          {stages.map((stage, idx) => {
            const isActive = currentScreen === stage.id;
            const isDone =
              stages.findIndex((s) => s.id === currentScreen) > idx;

            return (
              <div
                key={stage.id}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                  isActive
                    ? "bg-amber-400/15 text-amber-300 border border-amber-400/30 shadow-sm font-semibold"
                    : isDone
                    ? "text-emerald-400 hover:text-emerald-300 font-medium"
                    : "text-slate-400"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="text-[11px] font-mono opacity-70">{idx + 1}.</span>
                )}
                <span>{stage.label}</span>
              </div>
            );
          })}
        </div>

        {/* Right stats and controls */}
        <div className="flex items-center gap-2.5">
          {/* Beginner Jargon Buster Button */}
          <button
            type="button"
            onClick={() => setIsJargonModalOpen(true)}
            className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white text-xs font-medium transition-colors shadow-sm"
            title="Open plain-English glossary for confusing AI terms"
          >
            <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
            <span>Jargon Buster</span>
          </button>

          {currentScreen !== "landing" && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 border border-slate-800 text-xs font-medium">
              <Layers className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-slate-400 hidden sm:inline">Mastery:</span>
              <span className="font-mono font-semibold text-white">
                {masteredCount}/{totalCount}
              </span>
              <div className="w-12 h-1.5 bg-slate-800 rounded-full overflow-hidden ml-1">
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
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 text-xs font-mono text-slate-300 hover:text-white transition-colors"
          >
            <Cpu className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">{apiKey ? "Gemini Live" : "AI Settings"}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${apiKey ? "bg-emerald-400" : "bg-amber-400"}`} />
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

