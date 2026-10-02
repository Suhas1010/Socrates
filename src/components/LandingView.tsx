"use client";

import React, { useState } from "react";
import { Sparkles, ArrowRight, Compass, Zap, Brain, Terminal } from "lucide-react";
import { useSessionStore } from "@/lib/store";
import { CodingBackground } from "@/lib/types";
import { JargonBusterModal } from "./JargonBusterModal";

export const LandingView: React.FC = () => {
  const { generatePlanForGoal, isLoadingPlan } = useSessionStore();
  const [goal, setGoal] = useState("");
  const [interests, setInterests] = useState("");
  const [codingBg, setCodingBg] = useState<CodingBackground>("beginner");
  const [isJargonModalOpen, setIsJargonModalOpen] = useState(false);

  // The 3 starter blueprints
  const exampleChips = [
    {
      label: "a spam classifier",
      tag: "Beginner · 15 min",
      icon: "✉️",
      title: "Spam Classifier",
      desc: "Naive Bayes, TF-IDF & probabilistic text filtering",
    },
    {
      label: "a handwriting recognizer",
      tag: "Intermediate · 25 min",
      icon: "✍️",
      title: "Digit Recognizer",
      desc: "Neural networks, PyTorch tensors & Softmax",
    },
    {
      label: "how ChatGPT works",
      tag: "Advanced · 35 min",
      icon: "🤖",
      title: "How ChatGPT Works",
      desc: "Tokenization, likelihoods & attention mechanisms",
    },
  ];

  // 3-way Coding Background Options
  const codingBgOptions: { id: CodingBackground; title: string; subtitle: string; icon: string }[] = [
    {
      id: "beginner",
      title: "New to Coding",
      subtitle: "Plain English · 0 Jargon",
      icon: "🌱",
    },
    {
      id: "other_languages",
      title: "C++ / Java / JS Dev",
      subtitle: "Python syntax bridge",
      icon: "⚡",
    },
    {
      id: "python",
      title: "Python Developer",
      subtitle: "Straight to AI math & logic",
      icon: "🐍",
    },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!goal.trim() || isLoadingPlan) return;
    await generatePlanForGoal(goal.trim(), interests.trim(), codingBg);
  };

  const handleChipClick = async (chipLabel: string) => {
    setGoal(chipLabel);
    await generatePlanForGoal(chipLabel, interests.trim(), codingBg);
  };

  return (
    <div className="relative w-full max-w-5xl md:max-w-6xl mx-auto px-4 sm:px-6 pt-3 sm:pt-5 pb-10 sm:pb-12 text-slate-100 flex flex-col justify-between min-h-full">
      {/* Ambient background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[700px] h-[300px] bg-gradient-to-b from-amber-500/15 via-amber-500/5 to-transparent blur-3xl pointer-events-none -z-10" />

      {/* Hero Header */}
      <div className="text-center pt-1 sm:pt-2 space-y-2 flex-shrink-0">
        <div className="inline-flex items-center gap-2.5 px-4 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs sm:text-sm font-mono tracking-wide shadow-sm">
          <Sparkles className="w-4 h-4 text-amber-400" />
          <span className="font-bold">Project-First AI Tutor</span>
          <span className="text-slate-500">•</span>
          <span className="text-slate-300">Zero Passive Theory</span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black tracking-tight text-white leading-tight">
          What do you want to build?
        </h1>

        <p className="text-sm sm:text-base md:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
          Skip 40 hours of passive lectures. Tell Socrates your project goal, and learn the exact math, algorithms, and code just-in-time.
        </p>
      </div>

      {/* Main Glass Intake Panel */}
      <div className="p-5 sm:p-7 md:p-8 rounded-3xl border border-slate-700/80 bg-[#0d111a]/95 backdrop-blur-xl shadow-2xl relative my-1 sm:my-2 flex-shrink-0">
        <form onSubmit={handleSubmit} className="space-y-4 md:space-y-5">
          {/* Search/Goal Input with Embedded Submit */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm md:text-base font-bold text-slate-200">
              <span className="flex items-center gap-2 text-white">
                <Terminal className="w-4 h-4 md:w-5 md:h-5 text-amber-400" />
                Describe your project:
              </span>
              <span className="text-xs sm:text-sm text-amber-400 font-mono font-semibold">
                Takes &lt; 60s to generate
              </span>
            </div>

            <div className="relative flex items-center">
              <input
                id="goal-input"
                type="text"
                value={goal}
                onChange={(e) => setGoal(e.target.value)}
                placeholder="e.g. a spam classifier, facial emotion detector, or house price predictor"
                required
                className="w-full bg-[#07090e] border border-slate-700 focus:border-amber-400 focus:ring-2 focus:ring-amber-400/25 text-white placeholder-slate-500 pl-5 pr-44 py-3.5 sm:py-4 rounded-2xl text-base sm:text-lg outline-none shadow-inner transition-all font-sans font-medium"
              />
              <button
                id="start-button"
                type="submit"
                disabled={!goal.trim() || isLoadingPlan}
                className="absolute right-2 px-5 sm:px-6 py-2.5 sm:py-3 rounded-xl bg-amber-400 hover:bg-amber-300 text-zinc-950 font-black text-xs sm:text-sm md:text-base transition-all flex items-center gap-2 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 cursor-pointer"
              >
                {isLoadingPlan ? (
                  <>
                    <span className="w-4 h-4 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                    <span>Planning...</span>
                  </>
                ) : (
                  <>
                    <span>Start Building</span>
                    <ArrowRight className="w-4 h-4 md:w-5 md:h-5" />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Starter Project Blueprints */}
          <div className="space-y-2">
            <div className="text-xs sm:text-sm text-slate-300 font-bold uppercase tracking-wider flex items-center justify-between">
              <span>Or pick a popular starter blueprint:</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4">
              {exampleChips.map((chip) => {
                const isSelected = goal.toLowerCase() === chip.label.toLowerCase();
                return (
                  <button
                    type="button"
                    key={chip.label}
                    onClick={() => handleChipClick(chip.label)}
                    className={`text-left p-3.5 sm:p-4 rounded-2xl border transition-all flex flex-col justify-between group relative overflow-hidden cursor-pointer ${
                      isSelected
                        ? "bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-400/50 shadow-md"
                        : "bg-[#080B12]/90 border-slate-700/80 hover:border-amber-400/50 text-slate-200 hover:text-white"
                    }`}
                  >
                    <div className="flex items-center justify-between w-full mb-1.5">
                      <span className="text-2xl md:text-3xl">{chip.icon}</span>
                      <span className="text-[10px] sm:text-xs uppercase font-mono px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 border border-slate-700 font-bold">
                        {chip.tag}
                      </span>
                    </div>
                    <div>
                      <div className="text-sm sm:text-base md:text-lg font-black text-white group-hover:text-amber-300 transition-colors">
                        {chip.title}
                      </div>
                      <div className="text-xs sm:text-sm text-slate-300 line-clamp-1 leading-normal font-medium mt-0.5">
                        {chip.desc}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Coding Background Selector */}
          <div className="space-y-2">
            <div className="text-xs sm:text-sm text-slate-300 font-bold uppercase tracking-wider">
              Your Coding Background:
            </div>
            <div className="grid grid-cols-3 gap-3 md:gap-4">
              {codingBgOptions.map((opt) => (
                <button
                  type="button"
                  key={opt.id}
                  onClick={() => setCodingBg(opt.id)}
                  className={`p-3 sm:p-3.5 rounded-2xl border text-left transition-all flex items-center gap-3 cursor-pointer ${
                    codingBg === opt.id
                      ? "bg-amber-500/20 border-amber-400 text-white ring-2 ring-amber-400/50"
                      : "bg-[#080B12]/80 border-slate-700/80 hover:border-amber-400/40 text-slate-200 hover:text-white"
                  }`}
                >
                  <span className="text-2xl md:text-3xl flex-shrink-0">{opt.icon}</span>
                  <div className="min-w-0 flex-1">
                    <div className="text-xs sm:text-sm md:text-base font-bold text-white truncate">{opt.title}</div>
                    <div className="text-xs sm:text-sm text-slate-300 truncate font-medium">{opt.subtitle}</div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </form>
      </div>

      {/* Micro Trust Indicators / Bottom Row */}
      <div className="flex items-center justify-between text-xs sm:text-sm text-slate-300 px-3 py-3.5 mt-4 border-t border-slate-800/80 flex-shrink-0 font-medium">
        <div className="flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span>In-browser Python (0 install)</span>
        </div>
        <div className="hidden sm:flex items-center gap-2">
          <Compass className="w-4 h-4 text-amber-400" />
          <span>Just-in-Time Theory</span>
        </div>
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-amber-400" />
          <span>Real-time Diagnosis</span>
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
