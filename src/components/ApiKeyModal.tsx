"use client";

import React, { useState, useEffect } from "react";
import {
  Key,
  CheckCircle2,
  AlertCircle,
  X,
  Cpu,
  ShieldCheck,
  Zap,
  Globe,
  Settings2,
} from "lucide-react";
import { useSessionStore } from "@/lib/store";

interface ApiKeyModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export type LLMProviderType = "grok" | "gemini" | "groq" | "openrouter" | "custom";

export const ApiKeyModal: React.FC<ApiKeyModalProps> = ({ isOpen, onClose }) => {
  const { apiKey, setApiKey } = useSessionStore();
  const [provider, setProvider] = useState<LLMProviderType>("grok");
  const [inputKey, setInputKey] = useState(apiKey || "");
  const [model, setModel] = useState("grok-2-latest");
  const [customBaseUrl, setCustomBaseUrl] = useState("https://api.x.ai/v1");
  const [testing, setTesting] = useState(false);
  const [testStatus, setTestStatus] = useState<"idle" | "success" | "error">("idle");
  const [errorMessage, setErrorMessage] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedProvider = (localStorage.getItem("socrates_llm_provider") as LLMProviderType) || "grok";
      const savedKey =
        localStorage.getItem("socrates_grok_api_key") ||
        localStorage.getItem("socrates_user_api_key") ||
        apiKey ||
        "";
      const savedModel = localStorage.getItem("socrates_llm_model") || "grok-2-latest";
      const savedUrl = localStorage.getItem("socrates_custom_base_url") || "https://api.x.ai/v1";

      setProvider(savedProvider);
      setInputKey(savedKey);
      setModel(savedModel);
      setCustomBaseUrl(savedUrl);
    }
  }, [isOpen, apiKey]);

  if (!isOpen) return null;

  const handleProviderChange = (newProvider: LLMProviderType) => {
    setProvider(newProvider);
    setTestStatus("idle");
    setErrorMessage("");

    if (newProvider === "grok") {
      setModel("grok-2-latest");
      setCustomBaseUrl("https://api.x.ai/v1");
    } else if (newProvider === "gemini") {
      setModel("gemini-2.5-flash");
      setCustomBaseUrl("https://generativelanguage.googleapis.com/v1beta");
    } else if (newProvider === "groq") {
      setModel("llama-3.3-70b-versatile");
      setCustomBaseUrl("https://api.groq.com/openai/v1");
    } else if (newProvider === "openrouter") {
      setModel("meta-llama/llama-3.3-70b-instruct:free");
      setCustomBaseUrl("https://openrouter.ai/api/v1");
    } else if (newProvider === "custom") {
      setModel("gpt-4o-mini");
      setCustomBaseUrl("https://api.openai.com/v1");
    }
  };

  const handleSave = () => {
    const trimmed = inputKey.trim();
    setApiKey(trimmed);
    if (typeof window !== "undefined") {
      localStorage.setItem("socrates_llm_provider", provider);
      localStorage.setItem("socrates_user_api_key", trimmed);
      localStorage.setItem("socrates_llm_model", model);
      localStorage.setItem("socrates_custom_base_url", customBaseUrl.trim());
      if (provider === "grok") {
        localStorage.setItem("socrates_grok_api_key", trimmed);
      } else if (provider === "gemini") {
        localStorage.setItem("socrates_gemini_api_key", trimmed);
      }
    }
    onClose();
  };

  const handleClearKey = () => {
    setInputKey("");
    setApiKey("");
    if (typeof window !== "undefined") {
      localStorage.removeItem("socrates_user_api_key");
      localStorage.removeItem("socrates_gemini_api_key");
      localStorage.removeItem("socrates_grok_api_key");
    }
    setTestStatus("idle");
  };

  const handleTestConnection = async () => {
    if (!inputKey.trim()) {
      setErrorMessage("Please enter an API key first.");
      setTestStatus("error");
      return;
    }

    setTesting(true);
    setTestStatus("idle");
    setErrorMessage("");

    try {
      if (provider === "gemini") {
        const res = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${inputKey.trim()}`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              contents: [{ role: "user", parts: [{ text: "Respond: OK" }] }],
            }),
          }
        );
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error?.message || `HTTP ${res.status}: Verification failed`);
        }
      } else {
        // Groq, OpenRouter, Custom (OpenAI-compatible)
        const endpoint = `${customBaseUrl.replace(/\/+$/, "")}/chat/completions`;
        const res = await fetch(endpoint, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${inputKey.trim()}`,
          },
          body: JSON.stringify({
            model: model,
            messages: [{ role: "user", content: "Ping" }],
            max_tokens: 5,
          }),
        });
        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          throw new Error(err?.error?.message || `HTTP ${res.status}: Verification failed`);
        }
      }

      setTestStatus("success");
      setApiKey(inputKey.trim());
      if (typeof window !== "undefined") {
        localStorage.setItem("socrates_llm_provider", provider);
        localStorage.setItem("socrates_user_api_key", inputKey.trim());
        localStorage.setItem("socrates_llm_model", model);
      }
    } catch (err: any) {
      setTestStatus("error");
      setErrorMessage(err.message || "Connection failed.");
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-lg rounded-2xl border border-zinc-800 bg-[#090b10] text-zinc-200 text-left overflow-hidden shadow-2xl space-y-0">
        {/* Header */}
        <div className="px-5 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
          <div className="flex items-center gap-2.5">
            <Settings2 className="w-4 h-4 text-amber-400" />
            <h3 className="font-semibold text-sm text-zinc-100 font-mono">
              AI Provider & BYOK Settings (P-3)
            </h3>
          </div>
          <button
            onClick={onClose}
            className="text-zinc-400 hover:text-zinc-200 p-1 rounded hover:bg-zinc-800 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-5 space-y-4 text-xs">
          {/* Provider Selector */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 font-medium">Select LLM Provider</label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {(["grok", "gemini", "groq", "openrouter", "custom"] as LLMProviderType[]).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => handleProviderChange(p)}
                  className={`py-2 px-1.5 rounded-lg border text-center font-mono font-semibold transition-all text-[11px] truncate ${
                    provider === p
                      ? "border-amber-500/80 bg-amber-500/10 text-amber-300"
                      : "border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  {p === "grok" ? "xAI (Grok)" : p.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Model input / selector */}
          <div className="space-y-1.5">
            <label className="text-zinc-400 font-medium">Model ID</label>
            <input
              type="text"
              value={model}
              onChange={(e) => setModel(e.target.value)}
              placeholder="e.g. grok-2-latest, gemini-2.5-flash, llama-3.3-70b-versatile"
              className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-zinc-200 focus:outline-none focus:border-amber-500/60 text-xs"
            />
          </div>

          {/* Custom Base URL if custom or openrouter */}
          {(provider === "custom" || provider === "openrouter" || provider === "grok") && (
            <div className="space-y-1.5">
              <label className="text-zinc-400 font-medium">Endpoint Base URL</label>
              <input
                type="text"
                value={customBaseUrl}
                onChange={(e) => setCustomBaseUrl(e.target.value)}
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-zinc-200 focus:outline-none focus:border-amber-500/60 text-xs"
              />
            </div>
          )}

          {/* Personal API Key (BYOK) */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-zinc-400 font-medium">Personal API Key (BYOK)</label>
              {inputKey && (
                <button
                  type="button"
                  onClick={handleClearKey}
                  className="text-[11px] text-zinc-500 hover:text-red-400 font-mono underline"
                >
                  Clear Key
                </button>
              )}
            </div>
            <div className="relative">
              <input
                type="password"
                value={inputKey}
                onChange={(e) => {
                  setInputKey(e.target.value);
                  setTestStatus("idle");
                }}
                placeholder={
                  provider === "grok"
                    ? "xai-..."
                    : provider === "gemini"
                    ? "AIzaSy..."
                    : provider === "groq"
                    ? "gsk_..."
                    : "sk-..."
                }
                className="w-full px-3 py-2 rounded-lg bg-zinc-950 border border-zinc-800 font-mono text-zinc-200 focus:outline-none focus:border-amber-500/60 text-xs"
              />
            </div>
            <p className="text-[11px] text-zinc-500 leading-relaxed">
              Your key stays strictly in your browser (localStorage) and is never saved or logged on any server.
            </p>
          </div>

          {/* Test Status feedback */}
          {testStatus === "success" && (
            <div className="p-2.5 rounded bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs flex items-center gap-2 font-mono">
              <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Connection verified successfully with {provider}!</span>
            </div>
          )}

          {testStatus === "error" && (
            <div className="p-2.5 rounded bg-red-950/40 border border-red-500/40 text-red-300 text-xs flex items-start gap-2 font-mono">
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Free Cascade Status note */}
          {!inputKey && (
            <div className="p-2.5 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 text-[11px] flex items-center gap-2 font-mono">
              <Zap className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
              <span>Default mode active: Socrates uses verified offline catalogs and shared free cascades.</span>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between">
          <button
            type="button"
            onClick={handleTestConnection}
            disabled={testing || !inputKey.trim()}
            className="px-3 py-1.5 rounded-lg bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-zinc-200 font-mono text-xs disabled:opacity-50 transition-colors flex items-center gap-1.5"
          >
            {testing ? "Testing..." : "Test Connection"}
          </button>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-3 py-1.5 rounded-lg text-zinc-400 hover:text-zinc-200 text-xs font-mono transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs font-mono transition-colors"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
