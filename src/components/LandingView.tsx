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
    <div className="w-full max-w-4xl mx-auto px-4 py-10 md:py-16 text-slate-100">
      {/* Hero Badge */}
      <div className="text-center mb-10 space-y-5">
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-amber-400/15 border border-amber-400/35 text-amber-300 text-sm font-mono tracking-wide shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="font-bold">Socrates · Project-First AI Tutor</span>
        </div>

        {/* Primary Headline */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white leading-tight">
          What do you want to build?
        </h1>

        <p className="text-base sm:text-lg md:text-xl text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          Skip 40 hours of passive theory. Tell Socrates your project goal, and reverse-engineer the exact AI concepts you need right when you need them.
        </p>

        {/* Quick Jargon Buster trigger */}
        <div className="pt-2">
          <button
            type="button"
            onClick={() => setIsJargonModalOpen(true)}
            className="inline-flex items-center gap-2 text-sm text-amber-300 hover:text-white bg-amber-400/10 hover:bg-amber-400/20 border border-amber-400/30 px-4 py-2 rounded-full transition-all shadow-sm font-medium"
          >
            <Lightbulb className="w-4 h-4 text-amber-400" />
            <span>New to AI? Open the Beginner Jargon Buster</span>
          </button>
        </div>
      </div>

      {/* Main Goal Intake Card */}
      <div className="glass-panel p-7 md:p-10 rounded-3xl border border-white/15 shadow-2xl relative overflow-hidden mb-12 bg-slate-900/80">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-72 h-72 bg-amber-400/10 rounded-full blur-3xl pointer-events-none" />

        <form onSubmit={handleSubmit} className="space-y-7 relative z-10">
          {/* Single large text input */}
          <div className="space-y-2.5">
            <label
              htmlFor="goal-input"
              className="block text-base md:text-lg font-bold text-white flex items-center justify-between"
            >
              <span>Project Goal</span>
              <span className="text-xs md:text-sm text-amber-400 font-mono font-semibold">Takes &lt; 60s to start</span>
            </label>
            <input
              id="goal-input"
              type="text"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              placeholder="e.g. a spam classifier, facial emotion detector, or house price predictor"
              required
              className="w-full bg-[#080B12]/95 border border-white/20 focus:border-amber-400 focus:ring-4 focus:ring-amber-400/20 text-white placeholder-slate-500 px-6 py-4 md:py-5 rounded-2xl text-lg md:text-xl transition-all outline-none shadow-inner"
            />
          </div>

          {/* Three example chips */}
          <div className="space-y-2.5">
            <div className="text-xs md:text-sm text-slate-300 font-semibold uppercase tracking-wider">
              Or pick a popular starter project:
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {exampleChips.map((chip) => (
                <button
                  type="button"
                  key={chip.label}
                  onClick={() => handleChipClick(chip.label)}
                  className={`text-left p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    goal.toLowerCase() === chip.label.toLowerCase()
                      ? "bg-amber-400/20 border-amber-400 text-white shadow-lg shadow-amber-400/15 ring-2 ring-amber-400/40"
                      : "bg-slate-900/90 border-white/10 hover:border-amber-400/40 text-slate-300 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className="text-xl">{chip.icon}</span>
                    <span className="text-sm md:text-base font-bold text-white capitalize">
                      {chip.label}
                    </span>
                  </div>
                  <span className="text-xs md:text-sm text-slate-400 line-clamp-1 leading-relaxed">
                    {chip.desc}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Coding Background Selector (Beginner / C++ & Java / Python) */}
          <div className="space-y-2.5">
            <label className="block text-xs md:text-sm font-bold text-slate-200 uppercase tracking-wider">
              Your Coding Background:
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              {codingBgOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setCodingBg(opt.id)}
                  className={`p-4 rounded-2xl border text-left transition-all flex flex-col justify-between ${
                    codingBg === opt.id
                      ? "bg-amber-400/20 border-amber-400 text-white shadow-lg shadow-amber-400/15 ring-2 ring-amber-400/40"
                      : "bg-slate-900/90 border-white/10 hover:border-amber-400/30 text-slate-300 hover:text-white"
                  }`}
                >
                  <div className="flex items-center gap-2 font-bold text-sm md:text-base text-white mb-1.5">
                    <span className="text-lg">{opt.icon}</span>
                    <span>{opt.title}</span>
                  </div>
                  <div className="text-xs md:text-sm text-slate-400 leading-relaxed">
                    {opt.subtitle}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Optional smaller input: What are you into? */}
          <div className="space-y-2">
            <label
              htmlFor="interests-input"
              className="block text-xs md:text-sm font-medium text-slate-300"
            >
              What are you into? (gaming, music, sports, healthcare...)
            </label>
            <input
              id="interests-input"
              type="text"
              value={interests}
              onChange={(e) => setInterests(e.target.value)}
              placeholder="Optional — used by Socrates to generate analogies from your personal interests"
              className="w-full bg-[#080B12]/80 border border-white/15 text-white placeholder-slate-500 px-5 py-3 rounded-xl text-sm md:text-base focus:border-amber-400 focus:ring-2 focus:ring-amber-400/20 outline-none transition-all"
            />
          </div>

          {/* Start button */}
          <button
            id="start-button"
            type="submit"
            disabled={!goal.trim() || isLoadingPlan}
            className="w-full py-4 md:py-5 px-8 rounded-2xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-base md:text-lg shadow-xl shadow-amber-400/25 flex items-center justify-center gap-2.5 transition-all transform active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoadingPlan ? (
              <>
                <span className="w-5 h-5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                <span>Reverse-Engineering AI Concepts...</span>
              </>
            ) : (
              <>
                <span>Start Learning & Building</span>
                <ArrowRight className="w-5 h-5 text-zinc-950" />
              </>
            )}
          </button>
        </form>
      </div>

      {/* Philosophy cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2 shadow-lg">
          <div className="font-mono text-amber-400 flex items-center gap-2 font-bold text-sm md:text-base">
            <Compass className="w-5 h-5" />
            <span>JUST-IN-TIME LEARNING</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-sm md:text-[15px]">
            Concepts are taught only at the moment your build step needs them, not weeks in advance.
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/80 border border-white/10 space-y-2 shadow-lg">
          <div className="font-mono text-amber-400 flex items-center gap-2 font-bold text-sm md:text-base">
            <Zap className="w-5 h-5" />
            <span>TYPED ERROR DIAGNOSIS</span>
          </div>
          <p className="text-slate-300 leading-relaxed text-sm md:text-[15px]">
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
