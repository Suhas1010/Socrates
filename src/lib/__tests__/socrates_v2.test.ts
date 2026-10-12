import { describe, it, expect } from "vitest";
import { findNearestCatalogProject, ALL_CATALOG_PROJECTS } from "../catalog";
import { executeRedTeamSuite } from "../redteam";
import { CATALOG_SPAM_CLASSIFIER, CATALOG_REAL_ESTATE, CATALOG_BERT_TIER_C } from "../catalog";

describe("Socrates v2 Architecture & Feature Verification", () => {
  it("resolves catalog project and assigns verified tiers accurately", () => {
    // Spam email
    const spamProj = findNearestCatalogProject("detect phishing email messages");
    expect(spamProj.id).toBe("spam-classifier");
    expect(spamProj.tier).toBe("A");
    expect(spamProj.spec.metric).toBe("f1_score");

    // Real estate
    const housingProj = findNearestCatalogProject("predict house prices in california");
    expect(housingProj.id).toBe("real-estate");
    expect(housingProj.tier).toBe("A");
    expect(housingProj.spec.task).toBe("regression");

    // Foundation model fine-tuning (Tier C)
    const bertProj = findNearestCatalogProject("fine-tuning BERT for classification");
    expect(bertProj.id).toBe("bert-finetuning");
    expect(bertProj.tier).toBe("C");
  });

  it("ensures all catalog projects have valid DAGs and model contracts", () => {
    for (const project of ALL_CATALOG_PROJECTS) {
      expect(project.id).toBeTruthy();
      expect(project.tier).toMatch(/^[ABC]$/);
      expect(project.spec.task).toMatch(/^(classification|regression)$/);
      expect(project.dag.nodes.length).toBeGreaterThanOrEqual(1);
      expect(project.modelContract.functionName).toBeTruthy();
    }
  });

  it("executes red-team adversarial suite with boundary scenarios", async () => {
    // Provide a sample Python model implementation
    const samplePythonCode = `
def classify(text="", threshold=0.65):
    if not text:
        return {"prediction": "ham", "prob": 0.0}
    clean = text.lower()
    if "urgent" in clean or "win" in clean:
        return {"prediction": "spam", "prob": 0.95}
    return {"prediction": "ham", "prob": 0.10}
`;

    const results = await executeRedTeamSuite(CATALOG_SPAM_CLASSIFIER.modelContract, samplePythonCode);
    expect(results.length).toBe(4);

    const zeroTest = results.find((r) => r.id === "zero_vector");
    expect(zeroTest).toBeDefined();
    expect(zeroTest?.status).toMatch(/^(safe|vulnerability_found)$/);

    const outlierTest = results.find((r) => r.id === "outliers");
    expect(outlierTest).toBeDefined();

    const negTest = results.find((r) => r.id === "negative_values");
    expect(negTest).toBeDefined();

    const noiseTest = results.find((r) => r.id === "unseen_vocab");
    expect(noiseTest).toBeDefined();
  });

  it("verifies golden-value tolerance checks on step definitions", () => {
    const stepsWithGolden = CATALOG_REAL_ESTATE.steps.filter((s) => s.goldenValues && s.goldenValues.length > 0);
    expect(stepsWithGolden.length).toBeGreaterThan(0);

    const firstGolden = stepsWithGolden[0].goldenValues[0];
    expect(firstGolden.inputs).toBeDefined();
    expect(firstGolden.expectedOutput).toBeDefined();
    expect(typeof(firstGolden.tolerance)).toBe("number");
  });

  it("executes red-team adversarial suite on real estate valuation model without runtime errors", async () => {
    const realEstatePythonCode = `
def normalize_features(sqft: float, bedrooms: int) -> list[float]:
    return [sqft / 1000.0, float(bedrooms)]

def predict_price(features: list[float], weights: list[float], bias: float = 30000.0) -> float:
    return sum(f * w for f, w in zip(features, weights)) + bias

def estimate_home_value(listing: dict, weights: list[float] = [150000.0, 20000.0], bias: float = 30000.0) -> dict:
    features = normalize_features(listing["sqft"], listing["bedrooms"])
    price_pred = predict_price(features, weights, bias)
    return {
        "sqft": listing["sqft"],
        "bedrooms": listing["bedrooms"],
        "estimated_price": round(price_pred, 2)
    }

w = [150000.0, 20000.0]
`;

    const results = await executeRedTeamSuite(CATALOG_REAL_ESTATE.modelContract, realEstatePythonCode);
    expect(results.length).toBe(4);

    for (const r of results) {
      expect(r.status).not.toBe("runtime_error");
    }

    const zeroTest = results.find((r) => r.id === "zero_vector");
    expect(zeroTest?.status).toMatch(/^(safe|vulnerability_found)$/);

    const outlierTest = results.find((r) => r.id === "outliers");
    expect(outlierTest?.status).toMatch(/^(safe|vulnerability_found)$/);

    const negTest = results.find((r) => r.id === "negative_values");
    expect(negTest?.status).toMatch(/^(safe|vulnerability_found)$/);
  });
});
