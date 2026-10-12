"use client";

import React, { useState, useRef } from "react";
import Link from "next/link";
import {
  Sparkles,
  RotateCcw,
  Layers,
  CheckCircle2,
  Lightbulb,
  Cpu,
  Download,
  Upload,
  Bot,
  User as UserIcon,
  LogOut,
} from "lucide-react";
import { useSessionStore } from "@/lib/store";
import { useAuth } from "@/lib/AuthContext";
import { JargonBusterModal } from "./JargonBusterModal";
import { ApiKeyModal } from "./ApiKeyModal";
import { PythonAcademyModal } from "./PythonAcademyModal";

interface NavbarProps {
  currentScreenOverride?: string;
}

export const Navbar: React.FC<NavbarProps> = ({ currentScreenOverride }) => {
  const {
    activeStage,
    screen,
    concepts,
    status,
    resetSession,
    apiKey,
    openPythonAcademy,
  } = useSessionStore();

  const { user, exportProfile, importProfile, logout } = useAuth();
  const [isJargonModalOpen, setIsJargonModalOpen] = useState(false);
  const [isApiKeyModalOpen, setIsApiKeyModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const currentScreen =
    currentScreenOverride ||
    screen ||
    (activeStage === "plan_review"
      ? "plan"
      : activeStage === "learning"
      ? "learn"
      : activeStage === "completed"
      ? "complete"
      : activeStage);

  const masteredCount = concepts.filter((c) => status[c.id] === "mastered").length;
  const totalCount = concepts.length;

  const stages = [
    { id: "landing", label: "Goal" },
    { id: "diagnostic", label: "Diagnostic" },
    { id: "plan", label: "Plan" },
    { id: "learn", label: "Build" },
    { id: "complete", label: "Complete" },
  ];

  const isLanding = currentScreen === "landing" || activeStage === "landing";

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (content) {
        const ok = importProfile(content);
        if (!ok) alert("Invalid profile JSON format.");
      }
    };
    reader.readAsText(file);
  };

  return (
    <>
      <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-[#0a0a0a]/80 backdrop-blur-md">
        <div className="w-full max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Logo and Brand */}
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/" className="flex items-center gap-2.5 text-white hover:opacity-90 transition-opacity">
              <span className="flex items-center gap-1.5 font-sans font-semibold text-base sm:text-lg tracking-tight">
                <span className="w-2 h-2 rounded-full bg-orange-500 inline-block" />
                <span>Socrates</span>
                <span className="text-[11px] font-mono px-1.5 py-0.5 rounded border border-orange-500/25 text-orange-400 bg-orange-950/20 ml-0.5">
                  v2
                </span>
              </span>
              <span className="text-xs text-neutral-400 font-mono hidden md:inline border-l border-white/10 pl-2.5">
                Verified ML/DL
              </span>
            </Link>
          </div>

          {/* Stepper Breadcrumb */}
          {!isLanding && (
            <div className="hidden md:flex items-center gap-1.5 text-xs font-sans">
              {stages.map((stage, idx) => {
                const isActive = currentScreen === stage.id;
                const isDone = stages.findIndex((s) => s.id === currentScreen) > idx;

                return (
                  <div
                    key={stage.id}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-md transition-colors ${
                      isActive
                        ? "text-orange-200 font-medium bg-orange-950/40 border border-orange-500/20"
                        : isDone
                        ? "text-neutral-300"
                        : "text-neutral-500"
                    }`}
                  >
                    {isDone ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <span className="text-[10px] text-neutral-500 font-mono">{idx + 1}.</span>
                    )}
                    <span>{stage.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {/* Right Actions & Utilities */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-shrink-0">

            {/* Jargon Glossary Button */}
            <button
              type="button"
              onClick={() => setIsJargonModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-200 hover:text-white text-xs font-medium transition-colors"
              title="Plain-English AI Glossary"
            >
              <Lightbulb className="w-3.5 h-3.5 text-orange-300" />
              <span>Glossary</span>
            </button>

            {/* Python Academy Modal Trigger */}
            <button
              type="button"
              onClick={openPythonAcademy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-200 hover:text-white text-xs font-medium transition-colors"
              title="Python Foundations Course"
            >
              <span>Python Academy</span>
            </button>

            {/* Export / Import Profile (M-4) */}
            <div className="hidden lg:flex items-center gap-1 border-l border-white/10 pl-2">
              <button
                type="button"
                onClick={exportProfile}
                className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Export Progress File (JSON)"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <input
                ref={fileInputRef}
                type="file"
                accept=".json"
                onChange={handleFileUpload}
                className="hidden"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 rounded-md text-neutral-400 hover:text-white hover:bg-white/5 transition-colors"
                title="Import Progress File (JSON)"
              >
                <Upload className="w-3.5 h-3.5" />
              </button>
            </div>

            {/* Provider & BYOK Settings Button */}
            <button
              type="button"
              onClick={() => setIsApiKeyModalOpen(true)}
              title="AI Provider & Key Settings (BYOK)"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md border border-white/10 bg-white/5 hover:bg-white/10 text-neutral-200 hover:text-white text-xs font-medium transition-colors"
            >
              <Cpu className="w-3.5 h-3.5 text-neutral-300" />
              <span className="hidden sm:inline">Settings</span>
            </button>

            {/* Reset Session */}
            <button
              type="button"
              onClick={() => {
                if (window.confirm("Reset learning session and choose a new project goal?")) {
                  resetSession();
                }
              }}
              title="Reset and start over"
              className="p-1.5 rounded-md text-neutral-500 hover:text-neutral-300 hover:bg-white/5 transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>

            {/* Authentication Controls */}
            {user && !user.isGuest ? (
              <div className="flex items-center gap-2 border-l border-white/10 pl-2">
                <div
                  className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold text-white shadow-sm ring-1 ring-white/10"
                  style={{ backgroundColor: user.avatarColor || "#F59E0B" }}
                  title={`${user.name} (${user.email})`}
                >
                  {user.name ? user.name.charAt(0).toUpperCase() : "U"}
                </div>
                <div className="hidden xl:flex flex-col text-left">
                  <span className="text-xs font-semibold text-neutral-200 max-w-[100px] truncate leading-tight">
                    {user.name}
                  </span>
                  <span className="text-[10px] text-neutral-400 font-mono truncate max-w-[100px]">
                    {user.email}
                  </span>
                </div>
                <button
                  type="button"
                  onClick={logout}
                  title="Sign Out"
                  className="p-1.5 rounded-md text-neutral-400 hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2 border-l border-white/10 pl-2">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md bg-amber-500/15 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-amber-200 text-xs font-medium transition-all shadow-sm"
                  title="Sign In or Create Account"
                >
                  <UserIcon className="w-3.5 h-3.5 text-amber-400" />
                  <span>Sign In</span>
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>


      {/* Settings Modal */}
      <ApiKeyModal
        isOpen={isApiKeyModalOpen}
        onClose={() => setIsApiKeyModalOpen(false)}
      />

      {/* Jargon Glossary Modal */}
      <JargonBusterModal
        isOpen={isJargonModalOpen}
        onClose={() => setIsJargonModalOpen(false)}
      />

      {/* Python Academy Modal */}
      <PythonAcademyModal />
    </>
  );
};
