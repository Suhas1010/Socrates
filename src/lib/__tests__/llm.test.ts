import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getGeminiModelPriorityList, DEFAULT_GEMINI_MODELS, generateStructuredLLM } from "../llm";
import { z } from "zod";

describe("Gemini Model Hierarchy & Priority Cascade", () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    process.env = { ...originalEnv };
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  it("returns the default priority list from highest to lowest capability", () => {
    delete process.env.GEMINI_MODELS;
    delete process.env.LLM_MODEL;

    const list = getGeminiModelPriorityList();
    expect(list.length).toBeGreaterThanOrEqual(7);
    expect(list[0]).toBe("gemini-3.1-pro-preview");
    expect(list).toContain("gemini-pro-latest");
    expect(list).toContain("gemini-2.5-flash");
    expect(list).toContain("gemini-3-flash-preview");
    expect(list).toContain("gemini-3.1-flash-lite-preview");
    expect(list).toContain("gemini-flash-lite-latest");
    expect(list).toContain("gemini-flash-latest");
  });

  it("parses GEMINI_MODELS environment variable preserving the specified hierarchy", () => {
    process.env.GEMINI_MODELS = "gemini-3.1-pro-preview,gemini-3-flash-preview,gemini-flash-lite-latest";
    const list = getGeminiModelPriorityList();
    expect(list).toEqual([
      "gemini-3.1-pro-preview",
      "gemini-3-flash-preview",
      "gemini-flash-lite-latest",
    ]);
  });

  it("cascades down the model priority list when higher tier models fail", async () => {
    process.env.GEMINI_KEY = "test-key";
    process.env.GEMINI_MODELS = "model-high-tier,model-low-tier";

    const attemptedModels: string[] = [];

    // Mock global fetch to simulate model-high-tier returning 429 and model-low-tier succeeding
    vi.spyOn(globalThis, "fetch").mockImplementation(async (url: any) => {
      const urlStr = String(url);
      if (urlStr.includes("model-high-tier")) {
        attemptedModels.push("model-high-tier");
        return new Response(JSON.stringify({ error: { code: 429, message: "Resource exhausted" } }), {
          status: 429,
          headers: { "Content-Type": "application/json" },
        });
      }
      if (urlStr.includes("model-low-tier")) {
        attemptedModels.push("model-low-tier");
        return new Response(
          JSON.stringify({
            candidates: [
              {
                content: {
                  parts: [{ text: JSON.stringify({ message: "Success from low-tier model" }) }],
                },
              },
            ],
          }),
          {
            status: 200,
            headers: { "Content-Type": "application/json" },
          }
        );
      }
      return new Response("Not found", { status: 404 });
    });

    const schema = z.object({ message: z.string() });
    const result = await generateStructuredLLM({
      systemPrompt: "Test System",
      userPrompt: "Test User",
      schema,
      fallbackData: { message: "Fallback" },
      apiKeyOverride: "mock-key",
    });

    expect(attemptedModels).toEqual(["model-high-tier", "model-low-tier"]);
    expect(result.message).toBe("Success from low-tier model");
  });
});
