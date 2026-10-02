"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  RotateCcw,
  Layers,
  CheckCircle2,
  Lightbulb,
  Cpu,
  User as UserIcon,
  LogOut,
} from "lucide-react";
import { useSessionStore } from "@/lib/store";
import { useAuth } from "@/lib/AuthContext";
import { JargonBusterModal } from "./JargonBusterModal";
import { ApiKeyModal } from "./ApiKeyModal";
import { PythonAcademyModal } from "./PythonAcademyModal";

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

  const { user, logout } = useAuth();
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

  const isLanding = currentScreen === "landing" || activeStage === "landing";

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-slate-800/80 bg-[#080B12]/95 backdrop-blur-md">
        <div className="w-full px-4 sm:px-6 md:px-10 h-20 flex items-center justify-between gap-4">
        {/* Logo and Tagline */}
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 font-semibold shadow-[0_0_15px_rgba(245,158,11,0.2)]">
            <Sparkles className="w-6 h-6 fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <span className="text-xl md:text-2xl font-black tracking-tight text-white font-sans">
                Socrates
              </span>
              <span className="text-xs uppercase font-mono tracking-wider px-2.5 py-0.5 rounded-md bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold">
                AI Tutor
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-300 font-medium hidden lg:block">
              Learn AI by building real projects · 0 setup
            </p>
          </div>
        </div>

        {/* Stage breadcrumb pills - only during active project workflow */}
        {!isLanding && (
          <div className="hidden md:flex items-center gap-1.5 bg-slate-900/90 p-1.5 rounded-xl border border-slate-800 shadow-sm">
            {stages.map((stage, idx) => {
              const isActive = currentScreen === stage.id;
              const isDone =
                stages.findIndex((s) => s.id === currentScreen) > idx;

              return (
                <div
                  key={stage.id}
                  className={`flex items-center gap-2 px-3.5 py-2 rounded-lg text-xs md:text-sm font-medium transition-all ${
                    isActive
                      ? "bg-amber-400/20 text-amber-300 border border-amber-400/40 shadow-sm font-bold"
                      : isDone
                      ? "text-emerald-400 hover:text-emerald-300 font-semibold"
                      : "text-slate-400"
                  }`}
                >
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  ) : (
                    <span className="text-xs font-mono opacity-80">{idx + 1}.</span>
                  )}
                  <span>{stage.label}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Right stats and controls */}
        <div className="flex items-center gap-3">
          {/* Beginner Jargon Buster Button */}
          <button
            type="button"
            onClick={() => setIsJargonModalOpen(true)}
            className="hidden sm:flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-slate-200 hover:text-white text-xs md:text-sm font-semibold transition-colors shadow-sm"
            title="Open plain-English glossary for confusing AI terms"
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>Jargon Buster</span>
          </button>

          {!isLanding && (
            <div className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900/80 border border-slate-800 text-xs md:text-sm font-semibold">
              <Layers className="w-4 h-4 text-amber-400" />
              <span className="text-slate-300 hidden sm:inline">Mastery:</span>
              <span className="font-mono font-bold text-white">
                {masteredCount}/{totalCount}
              </span>
              <div className="w-14 h-2 bg-slate-800 rounded-full overflow-hidden ml-1">
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
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700/80 hover:border-slate-600 text-xs md:text-sm font-mono text-slate-200 hover:text-white font-semibold transition-colors"
          >
            <Cpu className="w-4 h-4 text-amber-400" />
            <span className="hidden sm:inline">{apiKey ? "Gemini Live" : "AI Settings"}</span>
            <span className={`w-2 h-2 rounded-full ${apiKey ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.6)]"}`} />
          </button>

          {/* Dedicated Learn Python Academy Button */}
          <button
            type="button"
            onClick={openPythonAcademy}
            title="Open dedicated Python Academy: interactive Python tutorials and code playground"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500/15 hover:bg-emerald-500/25 border border-emerald-500/40 hover:border-emerald-500/60 text-xs md:text-sm text-emerald-300 hover:text-emerald-100 font-bold transition-all shadow-sm"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
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
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-700"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* User Account / Sign In */}
          {user ? (
            <div className="flex items-center gap-2 pl-2 border-l border-slate-800">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold font-mono text-zinc-950 shadow-sm"
                style={{ backgroundColor: user.avatarColor || "#F59E0B" }}
                title={`Logged in as ${user.name} (${user.email})`}
              >
                {user.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-semibold text-slate-200 hidden xl:inline max-w-[100px] truncate">
                  {user.name}
                </span>
                {user.isGuest && (
                  <span className="text-[10px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-300">
                    Guest
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={logout}
                title="Sign Out"
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800/80 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 hover:border-amber-400/50 text-amber-300 hover:text-amber-200 text-xs md:text-sm font-bold transition-all shadow-sm ml-1"
            >
              <UserIcon className="w-4 h-4 text-amber-400" />
              <span>Sign In</span>
            </Link>
          )}
        </div>
      </div>
    </header>

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
    </>
  );
};

