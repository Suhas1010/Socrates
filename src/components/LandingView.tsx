"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, Lightbulb, Compass, Zap, Code, Terminal } from "lucide-react";
import { useSessionStore } from "@/lib/store";
import { CodingBackground } from "@/lib/types";
import { JargonBusterModal } from "./JargonBusterModal";

export const LandingView: React.FC = () => {
  const { generatePlanForGoal, isLoadingPlan, apiKey } = useSessionStore();
  const [goal, setGoal] = useState("");
  const [interests, setInterests] = useState("");
  const [codingBg, setCodingBg] = useState<CodingBackground>("beginner");
  const [isJargonModalOpen, setIsJargonModalOpen] = useState(false);

  // The 3 exact chips requested in Prompt 1
  const exampleChips = [
    { label: "a spam classifier", icon: "✉️", desc: "Naive Bayes & text filtering" },
    { label: "a handwriting recognizer", icon: "✍️", desc: "Neural net for handwritten digits" },
    { label: "how ChatGPT works", icon: "🤖", desc: "Tokenization, likelihoods & transformers" },
  ];

  // 3-way Coding Background Options
  const codingBgOptions: { id: CodingBackground; title: string; subtitle: string; icon: string }[] = [
    {
      id: "beginner",
      title: "New to Coding",
      subtitle: "Step-by-step Python syntax hints & zero assumed jargon",
      icon: "🌱",
    },
    {
      id: "other_languages",
      title: "C++ / Java / JS Dev",
      subtitle: "Python syntax bridge (no braces/semicolons, indentation rules)",
      icon: "⚡",
    },
    {
      id: "python",
      title: "Python Dev",
      subtitle: "Clean code cell, jump straight to AI math & model logic",
      icon: "🐍",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim() || isLoadingPlan) return;
    await generatePlanForGoal(goal.trim(), interests.trim(), codingBg);
  };

  const handleChipClick = async (chipText: string) => {
    setGoal(chipText);
    await generatePlanForGoal(chipText, interests.trim(), codingBg);
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-8 md:py-16 text-cream">
      {/* Hero Badge */}
      <div className="text-center mb-8 space-y-4">
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-gold/10 border border-gold/30 text-gold text-xs font-mono tracking-wide">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Socrates · Project-First AI Tutor</span>
        </div>

        {/* Primary Headline as required */}
        <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-cream">
          What do you want to build?
        </h1>

        <p className="text-base text-muted max-w-xl mx-auto leading-relaxed">
          Skip 40 hours of passive theory. Tell Socrates your project goal, and reverse-engineer the exact AI concepts you need right when you need them.
        </p>

        {/* Quick Jargon Buster trigger */}
        <div className="pt-1">
          <button
            type="button"
            onClick={() => setIsJargonModalOpen(true)}
            className="inline-flex items-center gap-1.5 text-xs text-gold hover:text-gold-300 bg-gold/10 hover:bg-gold/20 border border-gold/25 px-3 py-1.5 rounded-full transition-all"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>New to AI? Open the Beginner Jargon Buster</span>
          </button>
        </div>
      </div>

      {/* Main Goal Intake Card */}
      <div className="glass-panel p-6 md:p-8 rounded-2xl border border-gold/20 shadow-2xl relative overflow-hidden mb-10">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-56 h-56 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

        <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
          {/* Single large text input */}
          <div>
            <label
              htmlFor="goal-input"
              className="block text-sm font-semibold text-cream mb-2 flex items-center justify-between"
            >
              <span>Project Goal</span>
              <span className="text-xs text-gold font-mono">Takes &lt; 60s to start</span>
            </label>
            <input
              id="goal-input"
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. a spam classifier"
              required
              className="w-full bg-[#0b0a08]/90 border border-gold/30 focus:border-gold focus:ring-2 focus:ring-gold/20 text-cream placeholder-muted px-5 py-4 rounded-xl text-lg md:text-xl transition-all outline-none"
            />
          </div>

          {/* Three example chips */}
          <div className="space-y-2">
            <div className="text-xs text-muted font-medium">Click an example project:</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {exampleChips.map((chip) => (
                <button
                  type="button"
                  key={chip.label}
                  onClick={() => handleChipClick(chip.label)}
                  className={`text-left p-3.5 rounded-xl border transition-all flex flex-col justify-between ${
                    goal.toLowerCase() === chip.label.toLowerCase()
                      ? "bg-gold/15 border-gold text-cream shadow-md shadow-gold/10"
                      : "bg-[#14130F] border-gold/15 hover:border-gold/40 text-muted hover:text-cream"
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-base">{chip.icon}</span>
                    <span className="text-xs font-semibold text-cream capitalize">
                      {chip.label}
                    </span>
                  </div>
                  <span className="text-[11px] text-muted line-clamp-1">{chip.desc}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Coding Background Selector (Beginner / C++ & Java / Python) */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-cream">
              Your Coding Background:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {codingBgOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setCodingBg(opt.id)}
                  className={`p-3 rounded-xl border text-left transition-all flex flex-col justify-between ${
                    codingBg === opt.id
                      ? "bg-gold/15 border-gold text-cream shadow-md shadow-gold/10 ring-1 ring-gold/40"
                      : "bg-[#14130F] border-gold/15 hover:border-gold/30 text-muted hover:text-cream"
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-xs text-cream mb-1">
                    <span>{opt.icon}</span>
                    <span>{opt.title}</span>
                  </div>
                  <div className="text-[11px] text-muted leading-tight">
                    {opt.subtitle}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional smaller input: What are you into? */}
          <div>
            <label
              htmlFor="interests-input"
              className="block text-xs font-medium text-muted mb-1.5"
            >
              What are you into? (gaming, music, sports...)
            </label>
            <input
              id="interests-input"
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="Optional — used to create custom analogies from your interests"
              className="w-full bg-[#0b0a08]/80 border border-gold/20 text-cream placeholder-muted/60 px-4 py-2.5 rounded-lg text-sm focus:border-gold/50 outline-none transition-all"
            />
          </div>

          {/* Start button */}
          <button
            id="start-button"
            type="submit"
            disabled={!goal.trim() || isLoadingPlan}
            className="w-full py-4 px-6 rounded-xl bg-gold hover:bg-gold-400 text-[#0b0a08] font-bold text-base shadow-lg shadow-gold/20 flex items-center justify-center gap-2 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingPlan ? (
              <>
                <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>Reverse-Engineering AI Concepts...</span>
              </>
            ) : (
              <>
                <span>Start Learning & Building</span>
                <ArrowRight className="w-5 h-5 text-[#0b0a08]" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Philosophy cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
        <div className="p-4 rounded-xl bg-[#14130F] border border-gold/15 space-y-1.5">
          <div className="font-mono text-gold flex items-center gap-1.5 font-semibold">
            <Compass className="w-4 h-4" />
            <span>JUST-IN-TIME LEARNING</span>
          </div>
          <p className="text-muted leading-relaxed">
            Concepts are taught only at the moment your build step needs them, not weeks in advance.
          </p>
        </div>

        <div className="p-4 rounded-xl bg-[#14130F] border border-gold/15 space-y-1.5">
          <div className="font-mono text-gold flex items-center gap-1.5 font-semibold">
            <Zap className="w-4 h-4" />
            <span>TYPED ERROR DIAGNOSIS</span>
          </div>
          <p className="text-muted leading-relaxed">
            When you slip, Socrates pinpoints the exact cognitive failure mode and explains why.
          </p>
        </div>
      </div>

      {/* Jargon Modal */}
      <JargonBusterModal
        isOpen={isJargonModalOpen}
        onClose={() => setIsJargonModalOpen(false)}
      />
    </div>
  );
};
