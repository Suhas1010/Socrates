"use client";

import React, { useEffect, useState } from "react";
import { Navbar } from "@/components/Navbar";
import { LandingView } from "@/components/LandingView";
import { DiagnosticView } from "@/components/DiagnosticView";
import { PlanReviewView } from "@/components/PlanReviewView";
import { LessonView } from "@/components/LessonView";
import { ProjectSummaryModal } from "@/components/ProjectSummaryModal";
import { useSessionStore } from "@/lib/store";

export default function Home() {
  const { activeStage, screen } = useSessionStore();
  const [mounted, setMounted] = useState(false);
  const [urlScreen, setUrlScreen] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("screen");
      if (q) setUrlScreen(q);
    }
  }, []);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-[#0b0a08] flex items-center justify-center">
        <div className="flex items-center gap-2 text-gold font-mono text-sm animate-pulse">
          <span className="w-2.5 h-2.5 rounded-full bg-gold animate-ping" />
          <span>Initializing Socrates AI Tutor...</span>
        </div>
      </div>
    );
  }

  // Derive current screen smoothly
  const currentScreen = (urlScreen as any) || screen || (
    activeStage === "plan_review" ? "plan" :
    activeStage === "learning" ? "learn" :
    activeStage === "completed" ? "complete" :
    activeStage
  );

  return (
    <div className="h-screen w-screen flex flex-col bg-[#0b0a08] text-cream overflow-hidden">
      <Navbar />

      <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {currentScreen === "learn" ? (
          <LessonView />
        ) : (
          <div className="flex-1 overflow-y-auto flex flex-col justify-between">
            <div className="flex-1 flex flex-col">
              {currentScreen === "landing" && <LandingView />}
              {currentScreen === "diagnostic" && <DiagnosticView />}
              {currentScreen === "plan" && <PlanReviewView />}
              {currentScreen === "complete" && <ProjectSummaryModal />}
            </div>
            {currentScreen !== "landing" && (
              <footer className="w-full border-t border-zinc-800/80 py-3 text-center text-xs text-zinc-500 font-mono flex-shrink-0">
                Socrates · Project-First AI Tutor · BFWAI / AI Build Challenge 2026
              </footer>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
