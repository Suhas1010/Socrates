import { describe, it, expect } from "vitest";
import { SPAM_CLASSIFIER_CONCEPTS, SPAM_DATASET } from "../templates/spamClassifier";
import { REAL_ESTATE_CONCEPTS } from "../templates/realEstate";
import { PYTHON_TRACK_CONCEPTS } from "../templates/pythonTrack";
import { CHATGPT_CONCEPTS } from "../templates/chatGpt";
import { DIGIT_RECOGNIZER_CONCEPTS } from "../templates/digitRecognizer";
import { SENTIMENT_ANALYSIS_CONCEPTS } from "../templates/sentimentAnalysis";
import { spawnSync } from "child_process";

describe("Python Execution Verification for all Concepts", () => {
  const allTemplates = [
    { name: "spam", concepts: SPAM_CLASSIFIER_CONCEPTS },
    { name: "realEstate", concepts: REAL_ESTATE_CONCEPTS },
    { name: "pythonTrack", concepts: PYTHON_TRACK_CONCEPTS },
    { name: "chatGpt", concepts: CHATGPT_CONCEPTS },
    { name: "digit", concepts: DIGIT_RECOGNIZER_CONCEPTS },
    { name: "sentiment", concepts: SENTIMENT_ANALYSIS_CONCEPTS },
  ];

  for (const track of allTemplates) {
    let priorCodes = "";
    for (const concept of track.concepts) {
      it(`[${track.name}] ${concept.id} runs in Python without assertion or runtime error`, () => {
        const fullCode = `
import math
import re
from collections import defaultdict

${track.name === "spam" ? `DATASET = ${JSON.stringify(SPAM_DATASET)}\n` : ""}
${priorCodes}
${concept.solutionCode || ""}
${concept.testAssertion || ""}
`;
        const res = spawnSync("python", ["-c", fullCode], { encoding: "utf-8" });
        if (res.status !== 0) {
          console.error(`[FAIL] ${track.name} -> ${concept.id}\nSTDERR: ${res.stderr}`);
        }
        expect(res.status).toBe(0);

        if (concept.solutionCode) {
          const clean = concept.solutionCode
            .split("\n")
            .filter((l) => !l.trim().startsWith("print(") && !l.trim().startsWith("assert "))
            .join("\n");
          priorCodes += clean + "\n";
        }
      });
    }
  }
});
