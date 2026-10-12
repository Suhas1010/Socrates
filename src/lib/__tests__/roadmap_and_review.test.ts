import { describe, it, expect } from "vitest";
import { generateProjectRoadmap, deriveFallbackModelReview } from "../roadmapGenerator";
import { deriveModelContractForGoal } from "../inference";

describe("Dynamic Production Roadmap & Review Generator", () => {
  describe("Roadmap generation for diverse projects", () => {
    it("generates digit recognition specific phases and code for MNIST", () => {
      const goal = "Build a Hand-written Digit Recognizer";
      const contract = deriveModelContractForGoal(goal);
      const roadmap = generateProjectRoadmap(goal, contract);

      expect(roadmap.phases).toHaveLength(5);
      // Phase 1 should refer to handwriting / stroke / 28x28 metrics
      expect(roadmap.phases[0].desc.toLowerCase()).toMatch(/handwriting|stroke|28x28|pixel/);
      // Phase 2 should refer to 10-class weights matrix
      expect(roadmap.phases[1].desc.toLowerCase()).toMatch(/10-class|weights/);

      // app.py should import FastAPI, use the contract function, and have digit payloads
      expect(roadmap.appPyCode).toContain("from fastapi import FastAPI");
      expect(roadmap.appPyCode).toContain(contract.functionName);
      expect(roadmap.appPyCode).not.toContain("Real Estate");
      expect(roadmap.appPyCode).not.toContain("sqft");

      // client.tsx should have React component named for Digit Recognizer
      expect(roadmap.clientTsxCode).toContain("Digit");
      expect(roadmap.clientTsxCode).not.toContain("PropertyValuationWidget");

      // weights.json should contain 10-class / digit structure
      const parsedWeights = JSON.parse(roadmap.weightsJsonCode);
      expect(parsedWeights.model_name).toContain("digit");
      expect(parsedWeights.target_function).toBe(contract.functionName);
    });

    it("generates NLP spam classifier specific phases and code for Spam detection", () => {
      const goal = "Build a Spam Message Classifier";
      const contract = deriveModelContractForGoal(goal);
      const roadmap = generateProjectRoadmap(goal, contract);

      // Phase 1 should talk about text messages / tokenization
      expect(roadmap.phases[0].desc.toLowerCase()).toMatch(/text|token|message/);
      expect(roadmap.phases[1].desc.toLowerCase()).toMatch(/vocabulary|laplace|prior/);

      // Code artifacts shouldn't mention real estate or bedrooms
      expect(roadmap.appPyCode).toContain(contract.functionName);
      expect(roadmap.appPyCode).not.toContain("bedrooms");
      expect(roadmap.clientTsxCode).not.toContain("sqft");

      const parsedWeights = JSON.parse(roadmap.weightsJsonCode);
      expect(parsedWeights.model_name).toContain("spam");
    });

    it("generates real estate specific phases and code for House Price predictor", () => {
      const goal = "Real Estate House Price Predictor";
      const contract = deriveModelContractForGoal(goal);
      const roadmap = generateProjectRoadmap(goal, contract);

      expect(roadmap.phases[0].desc.toLowerCase()).toMatch(/listing|property|square|footage/);
      expect(roadmap.appPyCode).toContain("sqft");
      expect(roadmap.clientTsxCode).toContain("RealEstate");
    });

    it("dynamically adapts to any arbitrary custom project", () => {
      const goal = "E-Commerce Customer Churn Predictor";
      const contract = deriveModelContractForGoal(goal);
      const roadmap = generateProjectRoadmap(goal, contract);

      expect(roadmap.phases).toHaveLength(5);
      expect(roadmap.appPyCode).toContain(contract.functionName);
      expect(roadmap.appPyCode).toContain("FastAPI");
      expect(roadmap.clientTsxCode).toContain("Churn");

      const parsedWeights = JSON.parse(roadmap.weightsJsonCode);
      expect(parsedWeights.target_function).toBe(contract.functionName);
    });
  });

  describe("AI Model Review generation for diverse projects", () => {
    it("derives domain-grounded review for Digit Recognizer", () => {
      const goal = "Build a Hand-written Digit Recognizer";
      const contract = deriveModelContractForGoal(goal);
      const review = deriveFallbackModelReview(goal, contract);

      expect(review.headline).toContain("Digit Classifier");
      expect(review.architectureStrengths.some((s) => s.toLowerCase().includes("softmax"))).toBe(true);
      expect(review.numericalStabilityAnalysis.toLowerCase()).toContain("overflow");
      expect(review.productionReadinessAdvice).toContain(contract.functionName);
    });

    it("derives domain-grounded review for Spam Classifier", () => {
      const goal = "Build a Spam Message Classifier";
      const contract = deriveModelContractForGoal(goal);
      const review = deriveFallbackModelReview(goal, contract);

      expect(review.headline).toContain("NLP");
      expect(review.architectureStrengths.some((s) => s.toLowerCase().includes("laplace"))).toBe(true);
      expect(review.numericalStabilityAnalysis.toLowerCase()).toContain("log");
    });

    it("derives domain-grounded review for Clinical / Diabetes model", () => {
      const goal = "Clinical Diabetes Risk Predictor";
      const contract = deriveModelContractForGoal(goal);
      const review = deriveFallbackModelReview(goal, contract);

      expect(review.headline).toContain("Clinical");
      expect(review.architectureStrengths.some((s) => s.toLowerCase().includes("clinical") || s.toLowerCase().includes("vitals"))).toBe(true);
      expect(review.potentialVulnerabilities.some((v) => v.toLowerCase().includes("metabolic") || v.toLowerCase().includes("sensor"))).toBe(true);
    });

    it("derives clean, domain-adapted review for arbitrary custom project", () => {
      const goal = "Satellite Ocean Plastic Classifier";
      const contract = deriveModelContractForGoal(goal);
      const review = deriveFallbackModelReview(goal, contract);

      expect(review.headline).toContain("Satellite Ocean Plastic Classifier");
      expect(review.overallScore).toBeGreaterThanOrEqual(80);
      expect(review.productionReadinessAdvice).toContain(contract.functionName);
      expect(review.architectureStrengths.length).toBeGreaterThan(0);
      expect(review.potentialVulnerabilities.length).toBeGreaterThan(0);
    });
  });
});
