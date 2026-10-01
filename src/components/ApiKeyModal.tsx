"use client";

import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Key,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  X,
  Cpu,
  ShieldCheck,
  RefreshCw,
} from "lucide-react";
import { useSessionStore } from "@/lib/store";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const { apiKey, setApiKey } = useSessionStore();
  const [inputKey, setInputKey] = useState(apiKey || "");
  const [model, setModel] = useState("gemini-2.5-flash");
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    setInputKey(apiKey || "");
  }, [apiKey, isOpen]);

  if (!isOpen) return null;

  const handleSave = () => {
    setApiKey(inputKey.trim());
    if (typeof window !== "undefined") {
      localStorage.setItem("socrates_gemini_api_key", inputKey.trim());
      localStorage.setItem("socrates_llm_model", model);
    }
    onClose();
  };

  const handleTestKey = async () => {
    if (!inputKey.trim()) {
      setErrorMessage("Please enter an API key first.");
      setTestStatus("error");
      return;
    }

    setTesting(true);
    setTestStatus("idle");
    setErrorMessage("");

    try {
      const res = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${inputKey.trim()}`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            contents: [
              {
                role: "user",
                parts: [{ text: "Hello! Respond with: Socrates AI Ready." }],
              },
            ],
          }),
        }
      );

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error?.message || `HTTP ${res.status}: Invalid API Key`);
      }

      setTestStatus("success");
      setApiKey(inputKey.trim());
      if (typeof window !== "undefined") {
        localStorage.setItem("socrates_gemini_api_key", inputKey.trim());
      }
    } catch (err: any) {
      setTestStatus("error");
      setErrorMessage(err.message || "Could not verify API key.");
    } finally {
      setTesting(false);
    }
  };

  const hasKey = !!(apiKey || inputKey.trim());

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex min-h-screen items-center justify-center p-4 text-center sm:p-0">
      <div className="glass-panel inline-block w-full max-w-lg rounded-3xl border border-gold/30 shadow-2xl bg-[#0e0d0a] text-cream text-left overflow-hidden align-middle">
        {/* Header */}
        <div className="px-6 py-5 border-b border-gold/15 flex items-center justify-between bg-gradient-to-r from-gold/10 via-transparent to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gold/20 border border-gold/40 flex items-center justify-center text-gold">
              <Cpu className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-base text-cream">AI Engine & Gemini API Key</h3>
              <p className="text-xs text-muted">Power dynamic concept graphs for any project</p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-muted hover:text-cream hover:bg-white/5 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-5">
          {/* Status Banner */}
          <div
            className={`p-3.5 rounded-2xl border flex items-start gap-3 text-xs leading-relaxed ${
              hasKey
                ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
                : "bg-amber-500/10 border-amber-500/30 text-amber-200"
            }`}
          >
            {hasKey ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-amber-400 mt-0.5 flex-shrink-0" />
            )}
            <div>
              <span className="font-semibold block mb-0.5">
                {hasKey ? "Live LLM Inference Mode" : "Offline Intelligent Heuristic Mode"}
              </span>
              <span>
                {hasKey
                  ? "Socrates will use Gemini to dynamically reverse-engineer tailored concept graphs, code tasks, and diagnosis for ANY project goal."
                  : "Without an API key, Socrates uses built-in templates (Spam Classifier, Digit Recognizer, How ChatGPT Works, Sentiment Analysis) or custom heuristic roadmaps."}
              </span>
            </div>
          </div>

          {/* Model Selection */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
              <span>Model Selection</span>
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#14130F] border border-gold/20 text-cream text-xs font-mono focus:outline-none focus:border-gold"
            >
              <option value="gemini-2.5-flash">Gemini 2.5 Flash (Recommended - Fastest & SOTA)</option>
              <option value="gemini-2.0-flash">Gemini 2.0 Flash</option>
              <option value="gemini-1.5-flash">Gemini 1.5 Flash</option>
            </select>
          </div>

          {/* API Key Input */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <label className="font-semibold text-zinc-300 flex items-center gap-1.5">
                <Key className="w-3.5 h-3.5 text-gold" />
                <span>Google Gemini API Key</span>
              </label>
              <a
                href="https://aistudio.google.com/app/apikey"
                target="_blank"
                rel="noreferrer"
                className="text-gold hover:underline inline-flex items-center gap-1 text-[11px]"
              >
                <span>Get Free Key at Google AI Studio</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="relative">
              <input
                type="password"
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setTestStatus("idle");
                }}
                placeholder="AIzaSy..."
                className="w-full px-4 py-3 rounded-xl bg-[#14130F] border border-gold/25 text-cream font-mono text-xs placeholder:text-muted/50 focus:outline-none focus:border-gold transition-all"
              />
            </div>

            <p className="text-[11px] text-muted leading-relaxed">
              Your key stays safely in your browser session or local environment and is sent directly to Google AI Studio.
            </p>
          </div>

          {/* Test Status feedback */}
          {testStatus === "success" && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 text-xs">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Connection Verified! Gemini is ready to teach any project.</span>
            </div>
          )}

          {testStatus === "error" && (
            <div className="flex items-center gap-2 p-2.5 rounded-xl bg-ruby/10 border border-ruby/30 text-ruby text-xs">
              <AlertCircle className="w-4 h-4 text-ruby" />
              <span>{errorMessage}</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-gold/15 bg-[#14130F] flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleTestKey}
            disabled={testing || !inputKey.trim()}
            className="px-4 py-2.5 rounded-xl border border-gold/30 hover:border-gold/60 text-xs text-gold font-medium flex items-center gap-2 transition-all disabled:opacity-40"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${testing ? "animate-spin" : ""}`} />
            <span>{testing ? "Testing..." : "Verify Key"}</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-xs text-muted hover:text-cream transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-gold to-amber-500 hover:from-gold-300 hover:to-amber-400 text-zinc-950 font-bold text-xs shadow-lg shadow-gold/20 flex items-center gap-1.5 transition-all"
            >
              <ShieldCheck className="w-4 h-4" />
              <span>Save & Apply</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
