"use client";

import React, { useState, useMemo } from "react";
import {
  Sparkles,
  Send,
  ShieldAlert,
  ShieldCheck,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Mail,
  Zap,
} from "lucide-react";
import { classifyLiveMessage } from "@/lib/inference";

export const LiveTestPanel: React.FC = () => {
  const [inputText, setInputText] = useState(
    "Congratulations! You won a $1,000 free Walmart giftcard today. Call now to claim!"
  );
  const [threshold, setThreshold] = useState(0.65);

  const sampleMessages = [
    {
      label: "Lottery Phishing",
      text: "WINNER! You won $10,000 in our weekly lottery cash draw! Claim your prize now!",
    },
    {
      label: "Work Email",
      text: "Hey, can you review the pull request on GitHub when you have a free moment?",
    },
    {
      label: "Bank Alert",
      text: "URGENT: Your bank account has been locked. Verify your password details immediately.",
    },
    {
      label: "Social Lunch",
      text: "Let's meet for lunch at the cafe around 12:30 PM tomorrow.",
    },
  ];

  const result = useMemo(() => {
    return classifyLiveMessage(inputText, threshold);
  }, [inputText, threshold]);

  const isSpam = result.prediction === "spam";

  return (
    <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Interactive Live Tester</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white mt-1">
            Live Model Test Panel
          </h3>
          <p className="text-xs text-zinc-300">
            Type or paste any real email or message below. Your custom AI model analyzes it live in your browser!
          </p>
        </div>

        {/* Sensitivity slider */}
        <div className="bg-zinc-950/70 p-3 rounded-2xl border border-white/5 flex items-center gap-3">
          <Sliders className="w-4 h-4 text-amber-400" />
          <div className="space-y-1">
            <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300">
              <span>Threshold:</span>
              <span className="text-amber-400 font-bold">
                {Math.round(threshold * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.4"
              max="0.95"
              step="0.05"
              value={threshold}
              onChange={(e) => setThreshold(parseFloat(e.target.value))}
              className="w-28 accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Preset pills */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="text-xs text-zinc-500 font-medium">Quick Presets:</span>
        {sampleMessages.map((msg) => (
          <button
            key={msg.label}
            type="button"
            onClick={() => setInputText(msg.text)}
            className="text-xs px-3 py-1 rounded-full bg-zinc-900/80 hover:bg-zinc-800 text-zinc-300 hover:text-white border border-white/5 hover:border-white/20 transition-all"
          >
            {msg.label}
          </button>
        ))}
      </div>

      {/* Input Text Box */}
      <div className="relative">
        <textarea
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          rows={3}
          placeholder="Type an incoming SMS or email..."
          className="w-full bg-zinc-950/80 border border-zinc-700/80 rounded-2xl p-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all resize-none leading-relaxed"
        />
      </div>

      {/* Classification Outcome Card */}
      <div
        className={`p-5 rounded-2xl border transition-all ${
          isSpam
            ? "bg-red-950/20 border-red-500/40 text-red-100"
            : "bg-emerald-950/20 border-emerald-500/40 text-emerald-100"
        }`}
      >
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div
              className={`w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                isSpam
                  ? "bg-red-500/20 border border-red-500/40 text-red-400"
                  : "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
              }`}
            >
              {isSpam ? (
                <ShieldAlert className="w-6 h-6" />
              ) : (
                <ShieldCheck className="w-6 h-6" />
              )}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-lg font-extrabold uppercase tracking-wide">
                  {isSpam ? "FLAGGED AS SPAM" : "DELIVERED TO INBOX"}
                </span>
                <span
                  className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded font-bold ${
                    isSpam
                      ? "bg-red-500 text-zinc-950"
                      : "bg-emerald-500 text-zinc-950"
                  }`}
                >
                  {isSpam ? "Junk Folder" : "Clean"}
                </span>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5 leading-relaxed">
                {result.explanation}
              </p>
            </div>
          </div>

          {/* Probability Bars */}
          <div className="w-full sm:w-48 space-y-1.5 flex-shrink-0 bg-zinc-950/60 p-3 rounded-xl border border-white/5">
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-red-400 font-semibold">Spam:</span>
              <span className="text-white font-bold">
                {(result.spamConfidence * 100).toFixed(1)}%
              </span>
            </div>
            <div className="w-full bg-zinc-800 rounded-full h-2 overflow-hidden flex">
              <div
                className="bg-red-500 transition-all duration-300"
                style={{ width: `${result.spamConfidence * 100}%` }}
              />
              <div
                className="bg-emerald-500 transition-all duration-300"
                style={{ width: `${result.hamConfidence * 100}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-mono">
              <span className="text-emerald-400 font-semibold">Legit (Ham):</span>
              <span className="text-white font-bold">
                {(result.hamConfidence * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        {/* Token Contribution Inspector */}
        <div className="pt-3 border-t border-white/10">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-mono uppercase text-zinc-300 font-semibold block">
              Word Clues Breakdown (How words shifted the verdict):
            </span>
            <span className="text-[10px] text-zinc-400 hidden sm:inline">
              <span className="text-red-400">Red = Spam clue</span> · <span className="text-emerald-400">Green = Normal clue</span>
            </span>
          </div>
          <div className="flex flex-wrap gap-1.5">
            {result.contributions.map((c, idx) => (
              <span
                key={idx}
                className={`text-xs font-mono px-2 py-1 rounded-md border flex items-center gap-1 ${
                  c.impact === "spam"
                    ? "bg-red-950/60 border-red-500/50 text-red-300"
                    : c.impact === "ham"
                    ? "bg-emerald-950/60 border-emerald-500/50 text-emerald-300"
                    : "bg-zinc-900 border-white/5 text-zinc-400"
                }`}
              >
                <span>{c.token}</span>
                <span className="text-[10px] opacity-75">
                  {c.score > 0 ? `+${c.score}` : c.score}
                </span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
