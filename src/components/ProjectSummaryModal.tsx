"use client";

import React, { useEffect, useState } from "react";
import confetti from "canvas-confetti";
import {
  Trophy,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Download,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  Code2,
} from "lucide-react";
import { useSessionStore } from "@/lib/store";
import { ConceptMap } from "./ConceptMap";
import { LiveTestPanel } from "./LiveTestPanel";

export const ProjectSummaryModal: React.FC = () => {
  const {
    goal,
    concepts,
    projectParts,
    misconceptions,
    resetSession,
  } = useSessionStore();

  const [copied, setCopied] = useState(false);

  useEffect(() => {
    confetti({
      particleCount: 120,
      spread: 90,
      origin: { y: 0.5 },
      colors: ["#F59E0B", "#10B981", "#6366F1"],
    });
  }, []);

  const fullProjectPythonCode = `# ==========================================
# Socrates Project: ${goal || "Spam Classifier"}
# Built from scratch with Bayesian NLP
# ==========================================

import re
import math
from collections import defaultdict

# 1. Dataset
${projectParts.map((p) => `# Step: ${p.functionName}\n${p.code}\n`).join("\n")}
`;

  const handleCopyCode = () => {
    navigator.clipboard.writeText(fullProjectPythonCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full max-w-5xl mx-auto px-4 pt-6 pb-24 space-y-8 animate-in fade-in duration-300">
      {/* Celebration Header */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold tracking-wide">
          <Trophy className="w-4 h-4 text-emerald-400" />
          <span>Project Complete · All Concepts Mastered</span>
        </div>

        <h2 className="text-3xl md:text-5xl font-extrabold text-white">
          You Built a Working AI Project!
        </h2>

        <p className="text-base text-zinc-300 max-w-2xl mx-auto">
          You didn&apos;t just watch video lectures. You derived, implemented, tested,
          and proved conceptual mastery over every single component of your{" "}
          <span className="text-amber-300 font-semibold">{goal || "Spam Classifier"}</span>.
        </p>
      </div>

      {/* Concept Map Showing Final Mastered State */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
            <h3 className="text-base font-bold text-white">
              Mastered Concept Graph ({concepts.length}/{concepts.length} Green)
            </h3>
          </div>
          <span className="text-xs font-mono text-emerald-300 bg-emerald-950/60 px-3 py-1 rounded-full border border-emerald-500/40">
            100% Verified
          </span>
        </div>

        <div className="h-64 rounded-2xl overflow-hidden border border-white/5">
          <ConceptMap interactive={false} className="h-full w-full" />
        </div>
      </div>

      {/* Live Test Panel */}
      <LiveTestPanel />

      {/* Misconceptions Caught & Diagnosed (PRD §5.7 F-32) */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-amber-400" />
          <h3 className="text-base font-bold text-white">
            Misconceptions Caught &amp; Corrected ({misconceptions.length})
          </h3>
        </div>

        {misconceptions.length === 0 ? (
          <p className="text-xs text-zinc-400 italic">
            Zero slips detected! Flawless path through all concepts.
          </p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {misconceptions.map((m, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-xl bg-zinc-900/60 border border-amber-500/20 space-y-1"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-mono text-amber-300 uppercase font-semibold">
                    {m.errorType.replace(/_/g, " ")}
                  </span>
                  <span className="text-zinc-500 font-mono">
                    {concepts.find((c) => c.id === m.conceptId)?.title}
                  </span>
                </div>
                <p className="text-xs text-zinc-300">{m.note}</p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Export Project Code */}
      <div className="glass-panel p-6 rounded-3xl border border-white/10 shadow-2xl space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-amber-400" />
            <h3 className="text-base font-bold text-white">
              Export Complete Python Project
            </h3>
          </div>
          <button
            onClick={handleCopyCode}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-semibold border border-white/10 transition-colors"
          >
            {copied ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Python Script</span>
              </>
            )}
          </button>
        </div>

        <pre className="p-4 rounded-2xl bg-zinc-950 font-mono text-xs text-amber-100/90 max-h-48 overflow-y-auto leading-relaxed border border-white/5">
          {fullProjectPythonCode}
        </pre>
      </div>

      {/* Start New Project */}
      <div className="text-center pt-4">
        <button
          onClick={resetSession}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-zinc-800 hover:bg-zinc-700 text-white font-semibold text-sm border border-white/10 transition-all"
        >
          <RotateCcw className="w-4 h-4" />
          <span>Build Another AI Project with Socrates</span>
        </button>
      </div>
    </div>
  );
};
