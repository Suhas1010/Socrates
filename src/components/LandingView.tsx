"use client";

import React, { useState } from "react";
import { ArrowUpRight, Terminal, Sparkles, Bot, Workflow, Code2, Stethoscope } from "lucide-react";
import { useSessionStore } from "@/lib/store";
import { CodingBackground } from "@/lib/types";

export const LandingView: React.FC = () => {
  const { generatePlanForGoal, isLoadingPlan } = useSessionStore();
  const [goal, setGoal] = useState("");
  const [interests, setInterests] = useState("");
  const [codingBg, setCodingBg] = useState<CodingBackground>("beginner");

  const exampleChips = [
    {
      label: "a spam classifier",
      tier: "Tier A",
      tag: "15 min · NLP",
      title: "Spam Classifier",
      desc: "Tokenization, likelihoods, Laplace smoothing and Naive Bayes in NumPy",
    },
    {
      label: "house price regression",
      tier: "Tier A",
      tag: "20 min · Tabular",
      title: "Real Estate Predictor",
      desc: "Feature scaling, mean squared error, gradient descent and R2 evaluation",
    },
    {
      label: "digit recognizer mnist",
      tier: "Tier A",
      tag: "25 min · Vision",
      title: "MNIST Digit Classifier",
      desc: "Pixel arrays, dense forward pass, ReLU, Softmax and cross-entropy",
    },
    {
      label: "clinical diabetes risk",
      tier: "Tier A",
      tag: "20 min · Medical",
      title: "Clinical Risk Model",
      desc: "Min-max normalization, logistic sigmoid and decision thresholds",
    },
    {
      label: "how ChatGPT works",
      tier: "Tier A",
      tag: "30 min · LLMs",
      title: "Self-Attention Mechanism",
      desc: "Token embeddings, Q/K/V dot products and temperature-scaled Softmax",
    },
    {
      label: "fine-tuning BERT",
      tier: "Tier C",
      tag: "Export · GPU",
      title: "BERT Sequence Classifier",
      desc: "Pretrained Transformer head fine-tuning (exports Google Colab notebook)",
    },
  ];

  const codingBgOptions: { id: CodingBackground; title: string; subtitle: string }[] = [
    {
      id: "beginner",
      title: "Beginner",
      subtitle: "Plain English · Guided concepts",
    },
    {
      id: "other_languages",
      title: "C++ / Java / JS Dev",
      subtitle: "Python syntax bridges",
    },
    {
      id: "python",
      title: "Python Developer",
      subtitle: "Straight to AI math & algorithms",
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

  React.useEffect(() => {
    window.scrollTo(0, 0);
    const scrollParent = document.getElementById("main-scroll-container");
    if (scrollParent) scrollParent.scrollTop = 0;
  }, []);

  return (
    <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 pt-4 pb-12 sm:pt-8 sm:pb-16 text-neutral-100 space-y-8 sm:space-y-10">
      {/* Hero Section */}
      <div className="text-center space-y-3.5">
        {/* Animated Badge */}
        <div className="flex justify-center">
          <span className="relative inline-flex w-fit overflow-hidden rounded-full p-px">
            <span
              aria-hidden
              className="absolute top-1/2 left-1/2 h-5 w-[300px] rounded-full bg-gradient-to-r from-transparent via-transparent to-orange-500 animate-[chai-spin_4s_linear_infinite]"
              style={{ transform: "translate(-50%,-50%)" }}
            />
            <span className="relative z-10 flex items-center gap-2 rounded-full bg-stone-900/95 px-3.5 py-1.5 text-xs font-medium text-neutral-200 border border-white/5 backdrop-blur-sm">
              <Terminal className="w-3.5 h-3.5 text-orange-400" />
              Execution-verified machine learning tutor
            </span>
          </span>
        </div>

        <h1 className="text-3xl sm:text-4xl md:text-5xl font-semibold tracking-tight text-white font-sans max-w-3xl mx-auto leading-tight">
          Build any ML model from scratch.
        </h1>

        <p className="text-sm sm:text-base text-neutral-400 max-w-2xl mx-auto leading-relaxed">
          Socrates has no passive curriculum. Name a project goal, build each function step by step in your browser with real Python, and verify every milestone with <span className="highlight">golden-value tests</span>.
        </p>
      </div>

      {/* Main Goal Intake Card */}
      <div className="rounded-2xl border border-white/10 bg-neutral-950/60 p-6 sm:p-8 backdrop-blur-md space-y-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label htmlFor="goal-input" className="block text-sm font-medium text-neutral-200">
              What do you want to build?
            </label>
            <div className="flex flex-col sm:flex-row items-stretch gap-2.5">
              <div className="relative flex-1">
                <input
                  id="goal-input"
                  type="text"
                  value={goal}
                  onChange={(e) => setGoal(e.target.value)}
                  placeholder="e.g. credit card fraud detector, crop disease classifier, house price predictor"
                  className="w-full px-4 py-3.5 rounded-xl bg-neutral-900/90 border border-white/10 text-neutral-100 placeholder-neutral-500 text-sm focus:outline-none focus:border-white/30 transition-colors"
                  disabled={isLoadingPlan}
                />
              </div>
              <button
                type="submit"
                disabled={!goal.trim() || isLoadingPlan}
                className="btn-asym inline-flex h-12 sm:h-auto items-center justify-center gap-2 bg-white px-6 text-sm font-semibold text-black transition-colors duration-200 hover:bg-neutral-200 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer flex-shrink-0"
              >
                {isLoadingPlan ? (
                  <>
                    <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                    <span>Verifying spec...</span>
                  </>
                ) : (
                  <>
                    <span>Generate spec</span>
                    <ArrowUpRight className="w-4 h-4" aria-hidden />
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Real-Time AI Agent Synthesis Pipeline */}
          {isLoadingPlan && (
            <div className="p-4 sm:p-5 rounded-xl border border-orange-500/20 bg-orange-950/15 space-y-3.5 animate-in fade-in duration-300">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-orange-500/10 text-orange-400">
                    <Sparkles className="w-4 h-4 animate-spin" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-neutral-100">
                      Autonomous AI agents active
                    </h4>
                    <p className="text-xs text-neutral-400">
                      Formulating custom architecture and code milestones for &quot;{goal}&quot;
                    </p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-orange-300 px-2.5 py-0.5 rounded border border-orange-500/20 bg-orange-950/30">
                  Gemini Agent Mesh
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 font-mono text-xs">
                <div className="p-2.5 rounded-lg bg-neutral-900/90 border border-white/5 flex items-center gap-2">
                  <Bot className="w-3.5 h-3.5 text-orange-400 animate-pulse flex-shrink-0" />
                  <span className="text-neutral-300 text-[11px] truncate">1. Task Spec</span>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-900/90 border border-white/5 flex items-center gap-2">
                  <Workflow className="w-3.5 h-3.5 text-orange-400 animate-pulse flex-shrink-0" />
                  <span className="text-neutral-300 text-[11px] truncate">2. DAG Graph</span>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-900/90 border border-white/5 flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-orange-400 animate-pulse flex-shrink-0" />
                  <span className="text-neutral-300 text-[11px] truncate">3. Code & Tests</span>
                </div>
                <div className="p-2.5 rounded-lg bg-neutral-900/90 border border-white/5 flex items-center gap-2">
                  <Stethoscope className="w-3.5 h-3.5 text-orange-400 animate-pulse flex-shrink-0" />
                  <span className="text-neutral-300 text-[11px] truncate">4. Diagnostic</span>
                </div>
              </div>
            </div>
          )}

          {/* Optional Interests & Coding Background */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-3 border-t border-white/5">
            <div className="space-y-1.5">
              <label htmlFor="interests-input" className="block text-xs font-medium text-neutral-400">
                Interests (used to ground analogies)
              </label>
              <input
                id="interests-input"
                type="text"
                value={interests}
                onChange={(e) => setInterests(e.target.value)}
                placeholder="e.g. healthcare, gaming, finance, robotics..."
                className="w-full px-3.5 py-2.5 rounded-lg bg-neutral-900/80 border border-white/10 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-white/25 transition-colors"
              />
            </div>

            <div className="space-y-1.5">
              <label className="block text-xs font-medium text-neutral-400">
                Coding background
              </label>
              <div className="flex p-1 rounded-lg border border-white/10 bg-neutral-900/80 gap-1">
                {codingBgOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setCodingBg(opt.id)}
                    className={`flex-1 py-1.5 px-2 rounded-md text-center transition-all text-xs font-medium ${
                      codingBg === opt.id
                        ? "bg-white/15 text-white border border-white/20 shadow-sm"
                        : "text-neutral-400 hover:text-neutral-200"
                    }`}
                  >
                    <span className="block truncate">{opt.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </form>

        {/* Verified Catalog Blueprints */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 text-xs text-neutral-400">
            <div className="flex items-center gap-2">
              <span className="font-medium text-neutral-200 text-sm">
                Verified catalog blueprints
              </span>
              <span className="text-neutral-500">· Instant start</span>
            </div>
            <span className="text-[11px] font-mono text-neutral-500">
              100% tested in Pyodide
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
            {exampleChips.map((chip) => (
              <button
                key={chip.label}
                type="button"
                onClick={() => handleChipClick(chip.label)}
                disabled={isLoadingPlan}
                className="card-chai p-4 text-left transition-all duration-200 group cursor-pointer flex flex-col justify-between gap-3 hover:-translate-y-0.5"
              >
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-montserrat text-sm font-semibold text-neutral-200 group-hover:text-white transition-colors">
                      {chip.title}
                    </span>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border flex-shrink-0 ${
                        chip.tier === "Tier A"
                          ? "border-emerald-500/30 text-emerald-400 bg-emerald-500/5"
                          : "border-neutral-700 text-neutral-400 bg-neutral-800/40"
                      }`}
                    >
                      {chip.tier}
                    </span>
                  </div>
                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {chip.desc}
                  </p>
                </div>
                <div className="flex items-center justify-between text-[11px] text-neutral-500 pt-1.5 border-t border-white/5">
                  <span>{chip.tag}</span>
                  <span className="text-neutral-400 group-hover:text-white flex items-center gap-1 text-[11px] font-medium transition-colors">
                    Start <ArrowUpRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
