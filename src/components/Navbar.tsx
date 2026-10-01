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
    <header className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#080B12]/90 backdrop-blur-2xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-20 flex items-center justify-between gap-4">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-amber-400 flex items-center justify-center shadow-lg shadow-amber-400/25 text-zinc-950 font-bold">
            <Sparkles className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg md:text-xl font-black tracking-tight text-white font-sans">
                Socrates
              </span>
              <span className="text-xs uppercase font-mono tracking-wider px-2 py-0.5 rounded-md bg-amber-400/20 text-amber-300 border border-amber-400/40 font-bold">
                AI Tutor
              </span>
            </div>
            <p className="text-xs md:text-sm text-slate-300 font-medium hidden sm:block">
              Learn AI by building real projects · 0 setup
            </p>
          </div>
        </div>

        {/* Stage breadcrumb pills */}
        <div className="hidden md:flex items-center gap-2 bg-slate-900/80 p-1.5 rounded-full border border-white/10 shadow-inner">
          {stages.map((stage, idx) => {
            const isActive = currentScreen === stage.id;
            const isDone =
              stages.findIndex((s) => s.id === currentScreen) > idx;

            return (
              <div
                key={stage.id}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs md:text-sm font-semibold transition-all ${
                  isActive
                    ? "bg-amber-400 text-zinc-950 shadow-md font-bold"
                    : isDone
                    ? "text-emerald-400"
                    : "text-slate-400"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ) : (
                  <span className="text-xs font-mono opacity-70">{idx + 1}.</span>
                )}
                <span>{stage.label}</span>
              </div>
            );
          })}
        </div>

        {/* Right stats and controls */}
        <div className="flex items-center gap-3">
          {/* Beginner Jargon Buster Button */}
          <button
            type="button"
            onClick={() => setIsJargonModalOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 text-amber-300 hover:text-white text-xs md:text-sm font-semibold transition-all shadow-sm"
            title="Open plain-English glossary for confusing AI terms"
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Jargon Buster</span>
          </button>

          {currentScreen !== "landing" && (
            <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-slate-900/90 border border-white/10 text-xs md:text-sm font-medium">
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300 hidden sm:inline">Mastery:</span>
              <span className="font-mono font-bold text-white">
                {masteredCount}/{totalCount}
              </span>
              <div className="w-14 h-2 bg-slate-800 rounded-full overflow-hidden ml-1">
                <div
                  className="h-full bg-emerald-400 transition-all duration-500 rounded-full shadow-sm shadow-emerald-400/50"
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
            className="flex items-center gap-2 px-3 py-2 rounded-xl bg-slate-900/90 hover:bg-slate-800 border border-white/10 hover:border-amber-400/40 text-xs md:text-sm font-mono text-amber-300 transition-all"
          >
            <Cpu className="w-4 h-4" />
            <span className="hidden sm:inline">{apiKey ? "Gemini Live" : "AI Settings"}</span>
            <span className={`w-2 h-2 rounded-full ${apiKey ? "bg-emerald-400 shadow-sm shadow-emerald-400" : "bg-amber-400"}`} />
          </button>

          {/* Dedicated Learn Python Academy Button */}
          <button
            type="button"
            onClick={openPythonAcademy}
            title="Open dedicated Python Academy: interactive Python tutorials and code playground"
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 hover:border-emerald-400 text-xs md:text-sm text-emerald-300 font-bold transition-all shadow-sm"
          >
            <span className="text-sm">🐍</span>
            <span>Learn Python</span>
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse shadow-sm shadow-emerald-400/50" />
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
            className="p-2.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-transparent hover:border-white/10"
          >
            <RotateCcw className="w-4 h-4" />
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

