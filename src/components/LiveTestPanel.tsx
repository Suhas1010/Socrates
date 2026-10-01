"use client";

import React, { useState, useMemo } from "react";
import {
  Activity,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Home,
  ShieldAlert,
  ShieldCheck,
  Heart,
  Thermometer,
  User,
  Scale,
  Sparkles,
} from "lucide-react";
import {
  classifyLiveMessage,
  predictClinicalDiabetes,
  predictHomeValue,
  DiabetesPatient,
} from "@/lib/inference";
import { useSessionStore } from "@/lib/store";

export const LiveTestPanel: React.FC = () => {
  const { goal, templateId } = useSessionStore();
  const lowerGoal = (goal || "").toLowerCase();

  // Determine which domain tester to display
  const isMedical =
    lowerGoal.includes("diabet") ||
    lowerGoal.includes("disease") ||
    lowerGoal.includes("cancer") ||
    lowerGoal.includes("medical") ||
    lowerGoal.includes("patient") ||
    lowerGoal.includes("health") ||
    lowerGoal.includes("heart") ||
    lowerGoal.includes("clinic");

  const isRealEstate =
    templateId === "real-estate" ||
    lowerGoal.includes("real estate") ||
    lowerGoal.includes("house") ||
    lowerGoal.includes("housing") ||
    lowerGoal.includes("property") ||
    lowerGoal.includes("price prediction");

  const isSpam =
    templateId === "spam-classifier" ||
    lowerGoal.includes("spam") ||
    lowerGoal.includes("email") ||
    lowerGoal.includes("bayes");

  // State for Medical / Diabetes tester
  const [patient, setPatient] = useState<DiabetesPatient>({
    glucose: 145,
    age: 52,
    bmi: 31.0,
    bloodPressure: 130,
  });
  const [medicalThreshold, setMedicalThreshold] = useState(0.40);

  // State for Real Estate tester
  const [sqft, setSqft] = useState(1800);
  const [bedrooms, setBedrooms] = useState(3);

  // State for Spam tester
  const [inputText, setInputText] = useState(
    "Congratulations! You won a $1,000 free Walmart giftcard today. Call now to claim!"
  );
  const [spamThreshold, setSpamThreshold] = useState(0.65);

  // Clinical Diagnosis computation
  const clinicalResult = useMemo(() => {
    return predictClinicalDiabetes(patient, medicalThreshold);
  }, [patient, medicalThreshold]);

  // Housing calculation
  const housingResult = useMemo(() => {
    return predictHomeValue(sqft, bedrooms);
  }, [sqft, bedrooms]);

  // Spam calculation
  const spamResult = useMemo(() => {
    return classifyLiveMessage(inputText, spamThreshold);
  }, [inputText, spamThreshold]);

  // -------------------------------------------------------------
  // RENDER: MEDICAL / DIABETES TESTER
  // -------------------------------------------------------------
  if (isMedical || (!isRealEstate && !isSpam)) {
    return (
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
              <Activity className="w-3.5 h-3.5" />
              <span>Clinical Model Tester</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mt-1">
              Live Clinical Diagnostic Predictor
            </h3>
            <p className="text-xs text-zinc-300">
              Test your built diagnostic pipeline on patient vitals. Move sliders to simulate incoming clinical records live in your browser!
            </p>
          </div>

          {/* Clinical Sensitivity Threshold Slider */}
          <div className="bg-zinc-950/70 p-3 rounded-2xl border border-white/5 flex items-center gap-3">
            <Sliders className="w-4 h-4 text-amber-400" />
            <div className="space-y-1">
              <div className="flex items-center justify-between text-[11px] font-mono text-zinc-300">
                <span>Decision Threshold:</span>
                <span className="text-amber-400 font-bold">
                  {(medicalThreshold * 100).toFixed(0)}%
                </span>
              </div>
              <input
                type="range"
                min="0.20"
                max="0.80"
                step="0.05"
                value={medicalThreshold}
                onChange={(e) => setMedicalThreshold(parseFloat(e.target.value))}
                className="w-32 accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Preset Patient Cohorts */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs text-zinc-500 font-medium">Quick Cohort Presets:</span>
          <button
            type="button"
            onClick={() => setPatient({ glucose: 175, age: 58, bmi: 34.0, bloodPressure: 145 })}
            className="text-xs px-3 py-1 rounded-full bg-rose-950/60 hover:bg-rose-900/80 text-rose-200 border border-rose-500/30 transition-all flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-rose-400"></span>
            <span>High Risk Screening Patient</span>
          </button>
          <button
            type="button"
            onClick={() => setPatient({ glucose: 86, age: 24, bmi: 21.0, bloodPressure: 112 })}
            className="text-xs px-3 py-1 rounded-full bg-emerald-950/60 hover:bg-emerald-900/80 text-emerald-200 border border-emerald-500/30 transition-all flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span>Healthy Baseline Adult</span>
          </button>
          <button
            type="button"
            onClick={() => setPatient({ glucose: 128, age: 49, bmi: 27.8, bloodPressure: 132 })}
            className="text-xs px-3 py-1 rounded-full bg-amber-950/60 hover:bg-amber-900/80 text-amber-200 border border-amber-500/30 transition-all flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400"></span>
            <span>Borderline Pre-Diabetic</span>
          </button>
        </div>

        {/* Patient Vitals Input Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-zinc-950/70 p-4 rounded-2xl border border-white/5">
          {/* Fasting Glucose */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 flex items-center gap-1">
                <Thermometer className="w-3.5 h-3.5 text-amber-400" />
                Fasting Glucose
              </span>
              <span className={`font-mono font-bold ${patient.glucose >= 126 ? "text-rose-400" : patient.glucose >= 100 ? "text-amber-400" : "text-emerald-400"}`}>
                {patient.glucose} mg/dL
              </span>
            </div>
            <input
              type="range"
              min="65"
              max="240"
              step="1"
              value={patient.glucose}
              onChange={(e) => setPatient({ ...patient, glucose: parseInt(e.target.value) })}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>70 (Normal)</span>
              <span>100 (Pre)</span>
              <span>126+ (Diabetic)</span>
            </div>
          </div>

          {/* BMI */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 flex items-center gap-1">
                <Scale className="w-3.5 h-3.5 text-sky-400" />
                Body Mass Index (BMI)
              </span>
              <span className={`font-mono font-bold ${patient.bmi >= 30 ? "text-rose-400" : patient.bmi >= 25 ? "text-amber-400" : "text-emerald-400"}`}>
                {patient.bmi.toFixed(1)} kg/m²
              </span>
            </div>
            <input
              type="range"
              min="16"
              max="45"
              step="0.5"
              value={patient.bmi}
              onChange={(e) => setPatient({ ...patient, bmi: parseFloat(e.target.value) })}
              className="w-full accent-sky-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>18.5 (Normal)</span>
              <span>25 (Overweight)</span>
              <span>30+ (Obese)</span>
            </div>
          </div>

          {/* Age */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 flex items-center gap-1">
                <User className="w-3.5 h-3.5 text-purple-400" />
                Patient Age
              </span>
              <span className="font-mono font-bold text-zinc-200">
                {patient.age} years
              </span>
            </div>
            <input
              type="range"
              min="18"
              max="85"
              step="1"
              value={patient.age}
              onChange={(e) => setPatient({ ...patient, age: parseInt(e.target.value) })}
              className="w-full accent-purple-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>18</span>
              <span>45 (Risk Tier)</span>
              <span>85</span>
            </div>
          </div>

          {/* Blood Pressure */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 flex items-center gap-1">
                <Heart className="w-3.5 h-3.5 text-rose-400" />
                Blood Pressure
              </span>
              <span className={`font-mono font-bold ${patient.bloodPressure >= 130 ? "text-rose-400" : "text-emerald-400"}`}>
                {patient.bloodPressure} mmHg
              </span>
            </div>
            <input
              type="range"
              min="85"
              max="180"
              step="1"
              value={patient.bloodPressure}
              onChange={(e) => setPatient({ ...patient, bloodPressure: parseInt(e.target.value) })}
              className="w-full accent-rose-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>90 (Optimal)</span>
              <span>120 (Standard)</span>
              <span>140+ (High)</span>
            </div>
          </div>
        </div>

        {/* Live Model Output Display */}
        <div
          className={`p-6 rounded-3xl border transition-all ${
            clinicalResult.isPositive
              ? "bg-rose-950/25 border-rose-500/50 text-rose-100"
              : "bg-emerald-950/25 border-emerald-500/50 text-emerald-100"
          }`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div
                className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                  clinicalResult.isPositive
                    ? "bg-rose-500/20 border border-rose-500/40 text-rose-400"
                    : "bg-emerald-500/20 border border-emerald-500/40 text-emerald-400"
                }`}
              >
                {clinicalResult.isPositive ? (
                  <AlertTriangle className="w-7 h-7" />
                ) : (
                  <CheckCircle2 className="w-7 h-7" />
                )}
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-extrabold uppercase tracking-wide">
                    {clinicalResult.diagnosis}
                  </span>
                  <span
                    className={`text-xs font-mono uppercase px-2.5 py-0.5 rounded-full font-bold ${
                      clinicalResult.isPositive
                        ? "bg-rose-500 text-zinc-950"
                        : "bg-emerald-500 text-zinc-950"
                    }`}
                  >
                    {clinicalResult.category}
                  </span>
                </div>
                <p className="text-xs text-zinc-300 max-w-xl">
                  {clinicalResult.recommendation}
                </p>
              </div>
            </div>

            {/* Risk Gauge */}
            <div className="bg-zinc-950/80 p-4 rounded-2xl border border-white/10 text-center min-w-[160px]">
              <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-wider block">
                Calculated Risk Score
              </span>
              <div
                className={`text-3xl font-extrabold font-mono mt-1 ${
                  clinicalResult.isPositive ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {(clinicalResult.riskProbability * 100).toFixed(1)}%
              </div>
              <div className="w-full bg-zinc-800 h-2 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-300 ${
                    clinicalResult.isPositive ? "bg-rose-500" : "bg-emerald-500"
                  }`}
                  style={{ width: `${Math.min(100, clinicalResult.riskProbability * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-400 block mt-1">
                Threshold: {(medicalThreshold * 100).toFixed(0)}%
              </span>
            </div>
          </div>

          {/* Breakdown Factor Chips */}
          <div className="mt-5 pt-4 border-t border-white/10">
            <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider block mb-2 font-semibold">
              Model Factor Analysis:
            </span>
            <div className="flex flex-wrap gap-2">
              {clinicalResult.factors.map((f, i) => (
                <div
                  key={i}
                  className={`text-xs px-3 py-1 rounded-xl border flex items-center gap-1.5 ${
                    f.severity === "high"
                      ? "bg-rose-950/40 border-rose-500/30 text-rose-300 font-medium"
                      : f.severity === "moderate"
                      ? "bg-amber-950/40 border-amber-500/30 text-amber-300"
                      : "bg-zinc-900 border-zinc-700 text-zinc-300"
                  }`}
                >
                  <span className="font-semibold">{f.name}:</span>
                  <span>{f.impact}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: REAL ESTATE MODEL TESTER
  // -------------------------------------------------------------
  if (isRealEstate) {
    return (
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
              <Home className="w-3.5 h-3.5" />
              <span>Real Estate Model Tester</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mt-1">
              Live Property Value Estimator
            </h3>
            <p className="text-xs text-zinc-300">
              Input square footage and bedrooms to see your trained linear regression model estimate prices in real time.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-950/70 p-4 rounded-2xl border border-white/5">
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Square Footage (sqft)</span>
              <span className="font-mono font-bold text-amber-300">{sqft} sqft</span>
            </div>
            <input
              type="range"
              min="600"
              max="4500"
              step="50"
              value={sqft}
              onChange={(e) => setSqft(parseInt(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-zinc-400">Bedrooms</span>
              <span className="font-mono font-bold text-amber-300">{bedrooms} beds</span>
            </div>
            <input
              type="range"
              min="1"
              max="6"
              step="1"
              value={bedrooms}
              onChange={(e) => setBedrooms(parseInt(e.target.value))}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
          </div>
        </div>

        <div className="p-6 rounded-3xl bg-amber-950/20 border border-amber-500/40 text-amber-100 flex items-center justify-between">
          <div>
            <span className="text-xs font-mono uppercase text-zinc-400 block">
              Estimated Market Value
            </span>
            <span className="text-3xl font-extrabold text-amber-300 font-mono mt-1 block">
              ${housingResult.estimatedPrice.toLocaleString()}
            </span>
            <span className="text-xs text-zinc-400 mt-1 block">
              ${housingResult.pricePerSqft} per sqft based on learned regression weights
            </span>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------
  // RENDER: SPAM CLASSIFIER TESTER
  // -------------------------------------------------------------
  const isSpamFlagged = spamResult.prediction === "spam";
  return (
    <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-semibold">
            <Zap className="w-3.5 h-3.5" />
            <span>Spam Inference Engine</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white mt-1">
            Live Message Analyzer
          </h3>
        </div>
      </div>

      <textarea
        value={inputText}
        onChange={(e) => setInputText(e.target.value)}
        rows={3}
        className="w-full bg-zinc-950/80 border border-zinc-700/80 rounded-2xl p-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-amber-400 resize-none"
      />

      <div
        className={`p-5 rounded-2xl border ${
          isSpamFlagged
            ? "bg-red-950/20 border-red-500/40 text-red-100"
            : "bg-emerald-950/20 border-emerald-500/40 text-emerald-100"
        }`}
      >
        <span className="text-lg font-bold">
          {isSpamFlagged ? "FLAGGED AS SPAM" : "DELIVERED TO INBOX"}
        </span>
        <p className="text-xs text-zinc-300 mt-1">{spamResult.explanation}</p>
      </div>
    </div>
  );
};
