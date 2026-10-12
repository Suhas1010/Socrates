"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Navbar } from "@/components/Navbar";
import { LandingView } from "@/components/LandingView";
import { DiagnosticView } from "@/components/DiagnosticView";
import { PlanReviewView } from "@/components/PlanReviewView";
import { LessonView } from "@/components/LessonView";
import { ProjectSummaryModal } from "@/components/ProjectSummaryModal";
import { useSessionStore } from "@/lib/store";
import { useAuth } from "@/lib/AuthContext";

export default function Home() {
  const { activeStage, screen } = useSessionStore();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);
  const scrollContainerRef = React.useRef<HTMLDivElement>(null);

  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const q = params.get("screen");
      if (q) {
        useSessionStore.setState({ screen: q as any, activeStage: q as any });
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);
      }
    }
  }, []);

  // Strict Auth Gate: Zero access to the main page without logging in or signing up
  useEffect(() => {
    if (mounted && !authLoading && (!user || user.isGuest)) {
      router.replace("/login");
    }
  }, [mounted, authLoading, user, router]);

  // Derive current screen smoothly
  const currentScreen = screen || (
    activeStage === "plan_review" ? "plan" :
    activeStage === "learning" ? "learn" :
    activeStage === "completed" ? "complete" :
    activeStage
  );

  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTop = 0;
    }
  }, [currentScreen]);

  if (!mounted || authLoading || !user || user.isGuest) {
    return (
      <div className="min-h-screen bg-[#070A10] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3 text-amber-400 font-mono text-sm">
          <div className="w-8 h-8 rounded-full border-2 border-amber-400 border-t-transparent animate-spin" />
          <span className="text-zinc-400 text-xs">
            {!user && !authLoading ? "Redirecting to sign in..." : "Initializing Socrates..."}
          </span>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen w-full flex flex-col bg-[#0a0a0a] text-neutral-100 overflow-hidden chai-ambient-glow">
      <Navbar currentScreenOverride={currentScreen} />

      <main className="flex-1 min-h-0 overflow-hidden flex flex-col">
        {currentScreen === "learn" ? (
          <LessonView />
        ) : (
          <div id="main-scroll-container" ref={scrollContainerRef} className="flex-1 overflow-y-auto min-h-0">
            <div className="min-h-full flex flex-col justify-between">
              <div className="flex-1">
                {currentScreen === "landing" && <LandingView />}
                {currentScreen === "diagnostic" && <DiagnosticView />}
                {currentScreen === "plan" && <PlanReviewView />}
                {currentScreen === "complete" && <ProjectSummaryModal />}
              </div>
              {currentScreen !== "landing" && (
                <footer className="w-full border-t border-white/5 py-4 pb-6 text-center text-xs text-neutral-500 font-mono flex-shrink-0">
                  Socrates: Project-First AI Tutor (AI Build Challenge 2026)
                </footer>
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
