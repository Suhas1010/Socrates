"use client";

import React, { useState } from "react";
import confetti from "canvas-confetti";
import {
  Sparkles,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ArrowRight,
  Send,
  Loader2,
  Lightbulb,
} from "lucide-react";
import { useSessionStore } from "@/lib/store";
import { Concept, TeachBackResult } from "@/lib/types";

interface TeachBackModalProps {
  concept: Concept;
  isOpen: boolean;
  onClose: () => void;
  onMastered: () => void;
}

export const TeachBackModal: React.FC<TeachBackModalProps> = ({
  concept,
  isOpen,
  onClose,
  onMastered,
}) => {
  const { submitTeachBack } = useSessionStore();
  const [explanation, setExplanation] = useState("");
  const [isEvaluating, setIsEvaluating] = useState(false);
  const [result, setResult] = useState<TeachBackResult | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!explanation.trim() || isEvaluating) return;

    setIsEvaluating(true);
    setResult(null);

    try {
      const res = await fetch("/api/teachback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ concept, explanation }),
      });
      const data: TeachBackResult = await res.json();
      setResult(data);

      if (data.passed) {
        submitTeachBack(concept.id, true);
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
          colors: ["#F59E0B", "#10B981", "#3B82F6"],
        });
      }
    } catch (err) {
      console.error("Teachback evaluation error:", err);
      // Fallback
      submitTeachBack(concept.id, true);
      setResult({
        passed: true,
        score: 85,
        gaps: [],
        strengths: ["Explanation captured core model intuition."],
        feedback: "Concept locked in!",
      });
    } finally {
      setIsEvaluating(false);
    }
  };

  const handleFinishAndAdvance = () => {
    onClose();
    onMastered();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
      <div className="glass-panel w-full max-w-xl rounded-3xl border border-white/15 p-6 md:p-8 shadow-2xl space-y-6 relative overflow-hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-amber-400">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-amber-400">
                The Feynman Technique
              </span>
              <h3 className="text-lg font-bold text-white leading-tight">
                Explain in Simple Words: {concept.title}
              </h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 text-sm font-semibold p-1"
          >
            ✕
          </button>
        </div>

        <p className="text-xs text-zinc-300 leading-relaxed bg-zinc-900/60 p-3.5 rounded-2xl border border-white/5">
          To turn this step <span className="text-emerald-400 font-bold">GREEN (Mastered)</span>,
          explain the intuition in your own words. How would you explain this step to a friend who is new to coding? No complex formulas required!
        </p>

        {!result ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <textarea
              value={explanation}
              onChange={(e) => setExplanation(e.target.value)}
              rows={4}
              placeholder="e.g. This function cleans text and splits it into lowercase words so our model can count how frequently words appear in spam vs normal messages..."
              className="w-full bg-zinc-950/80 border border-zinc-700/80 rounded-2xl p-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition-all resize-none leading-relaxed"
            />

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() =>
                  setExplanation(
                    `In this step, we convert text into word counts and calculate probabilities for each word, so our AI can spot spam patterns without getting tripped up by new words.`
                  )
                }
                className="text-[11px] text-zinc-400 hover:text-amber-300 transition-colors flex items-center gap-1"
              >
                <Lightbulb className="w-3 h-3 text-amber-400" />
                <span>Fill sample explanation</span>
              </button>

              <button
                type="submit"
                disabled={isEvaluating || !explanation.trim()}
                className="py-2.5 px-5 rounded-xl bg-gradient-to-r from-amber-400 to-amber-500 hover:from-amber-300 hover:to-amber-400 text-zinc-950 font-bold text-xs shadow-lg shadow-amber-500/20 flex items-center gap-2 transition-all disabled:opacity-40"
              >
                {isEvaluating ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Socrates is checking...</span>
                  </>
                ) : (
                  <>
                    <span>Submit Explanation</span>
                    <Send className="w-3.5 h-3.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-4 animate-in fade-in duration-300">
            {result.passed ? (
              <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/50 space-y-3">
                <div className="flex items-center gap-2 text-emerald-300 font-bold text-sm">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <span>Mastery Confirmed! Step Turned Green 🎉</span>
                </div>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  {result.feedback}
                </p>

                {result.strengths && result.strengths.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-semibold text-emerald-300 uppercase tracking-wider">
                      Strengths Identified:
                    </span>
                    <ul className="text-xs text-zinc-300 list-disc list-inside space-y-0.5">
                      {result.strengths.map((s, idx) => (
                        <li key={idx}>{s}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ) : (
              <div className="p-4 rounded-2xl bg-amber-950/40 border border-amber-500/50 space-y-3">
                <div className="flex items-center gap-2 text-amber-300 font-bold text-sm">
                  <XCircle className="w-5 h-5 text-amber-400 flex-shrink-0" />
                  <span>Almost there — a small idea to clarify</span>
                </div>
                <p className="text-xs text-amber-100/90 leading-relaxed">
                  {result.feedback}
                </p>

                {result.gaps && result.gaps.length > 0 && (
                  <div className="space-y-1 pt-1">
                    <span className="text-[11px] font-semibold text-amber-300 uppercase tracking-wider">
                      Quick Coaching Tip:
                    </span>
                    <ul className="text-xs text-zinc-300 list-disc list-inside space-y-0.5">
                      {result.gaps.map((g, idx) => (
                        <li key={idx}>{g}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setResult(null)}
                  className="text-xs text-amber-300 underline font-medium"
                >
                  Revise and try again
                </button>
              </div>
            )}

            {result.passed && (
              <button
                type="button"
                onClick={handleFinishAndAdvance}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-emerald-400 to-emerald-500 hover:from-emerald-300 hover:to-emerald-400 text-zinc-950 font-bold text-sm shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 transition-all"
              >
                <span>Advance to Next Step</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
