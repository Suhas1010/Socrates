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
import { Cpu } from "lucide-react";

export const Navbar: React.FC = () => {
  const {
    activeStage,
    screen,
    concepts,
    status,
    resetSession,
    apiKey,
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
    <header className="sticky top-0 z-50 w-full border-b border-gold/15 bg-[#0b0a08]/90 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between gap-4">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gold flex items-center justify-center shadow-lg shadow-gold/20 text-[#0b0a08]">
            <Sparkles className="w-5 h-5 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-base font-bold tracking-tight text-cream font-sans">
                Socrates
              </span>
              <span className="text-[10px] uppercase font-mono tracking-wider px-1.5 py-0.5 rounded bg-gold/15 text-gold border border-gold/30">
                AI Tutor
              </span>
            </div>
            <p className="text-xs text-muted hidden sm:block">
              Learn AI by building real projects · Zero setup
            </p>
          </div>
        </div>

        {/* Stage breadcrumb pills */}
        <div className="hidden md:flex items-center gap-1.5 bg-[#14130F] p-1 rounded-full border border-gold/15">
          {stages.map((stage, idx) => {
            const isActive = currentScreen === stage.id;
            const isDone =
              stages.findIndex((s) => s.id === currentScreen) > idx;

            return (
              <div
                key={stage.id}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all ${
                  isActive
                    ? "bg-gold text-[#0b0a08] shadow-md font-semibold"
                    : isDone
                    ? "text-[#2ECC71]"
                    : "text-muted"
                }`}
              >
                {isDone ? (
                  <CheckCircle2 className="w-3 h-3 text-[#2ECC71]" />
                ) : (
                  <span className="text-[10px] font-mono">{idx + 1}.</span>
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
            className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-gold/10 hover:bg-gold/20 border border-gold/20 text-gold hover:text-gold-400 text-xs font-medium transition-all"
            title="Open plain-English glossary for confusing AI terms"
          >
            <Lightbulb className="w-3.5 h-3.5 text-gold" />
            <span>Jargon Buster</span>
          </button>

          {currentScreen !== "landing" && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[#14130F] border border-gold/15 text-xs">
              <Layers className="w-3.5 h-3.5 text-gold" />
              <span className="text-muted hidden sm:inline">Mastery:</span>
              <span className="font-mono font-semibold text-cream">
                {masteredCount}/{totalCount}
              </span>
              <div className="w-12 h-1.5 bg-[#24221A] rounded-full overflow-hidden">
                <div
                  className="h-full bg-[#2ECC71] transition-all duration-500 rounded-full"
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
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#14130F] hover:bg-[#1D1B15] border border-gold/25 hover:border-gold text-[11px] font-mono text-gold transition-all"
          >
            <Cpu className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">{apiKey ? "Gemini AI Live" : "AI Settings"}</span>
            <span className={`w-1.5 h-1.5 rounded-full ${apiKey ? "bg-[#2ECC71] shadow-sm shadow-[#2ECC71]" : "bg-amber-400"}`} />
          </button>

          {/* Sandbox status pill */}
          <div
            title="Python executes securely directly in your browser — zero installation needed"
            className="hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#14130F] border border-gold/15 text-[11px] text-cream font-mono"
          >
            <span className="w-2 h-2 rounded-full bg-[#2ECC71] animate-pulse" />
            <span>In-Browser Python</span>
          </div>

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
            className="p-2 rounded-lg text-muted hover:text-cream hover:bg-[#1D1B15] transition-colors border border-transparent hover:border-gold/20"
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
    </header>
  );
};
