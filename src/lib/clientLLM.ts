/**
 * Socrates Client-Side LLM Configuration & Header Resolver
 * Manages BYOK (Bring Your Own Key) retrieval and headers for xAI Grok and Google Gemini.
 */

export function getClientLLMConfig(sessionApiKey?: string): {
  apiKey: string;
  provider: string;
  headers: Record<string, string>;
} {
  if (typeof window === "undefined") {
    return { apiKey: sessionApiKey || "", provider: "gemini", headers: {} };
  }

  const savedProvider = (localStorage.getItem("socrates_llm_provider") || "grok").toLowerCase();
  const savedGrokKey = localStorage.getItem("socrates_grok_api_key");
  const savedGeminiKey = localStorage.getItem("socrates_gemini_api_key");
  const savedUserKey = localStorage.getItem("socrates_user_api_key");

  let apiKey = sessionApiKey?.trim() || "";
  if (!apiKey) {
    if (savedProvider === "grok" && savedGrokKey) {
      apiKey = savedGrokKey.trim();
    } else if (savedProvider === "gemini" && savedGeminiKey) {
      apiKey = savedGeminiKey.trim();
    } else {
      apiKey = (savedGrokKey || savedGeminiKey || savedUserKey || "").trim();
    }
  }

  const isGrok =
    apiKey.startsWith("xai-") ||
    savedProvider === "grok" ||
    (!apiKey && savedProvider === "grok");

  const resolvedProvider = isGrok ? "grok" : (savedProvider || "gemini");

  const headers: Record<string, string> = {};
  if (apiKey) {
    headers["x-api-key"] = apiKey;
    headers["x-llm-provider"] = resolvedProvider;
    if (resolvedProvider === "grok") {
      headers["x-grok-api-key"] = apiKey;
    } else {
      headers["x-gemini-api-key"] = apiKey;
    }
  }

  return { apiKey, provider: resolvedProvider, headers };
}
