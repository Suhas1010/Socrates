"use client";

import React, { useState, useMemo } from "react";
import {
  Activity,
  Sliders,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Home,
  Heart,
  User,
  Scale,
  Sparkles,
  Smile,
  Eye,
  Camera,
  Layers,
  RotateCcw,
} from "lucide-react";
import {
  classifyLiveMessage,
  predictClinicalDiabetes,
  predictHomeValue,
  predictFacialEmotion,
  DiabetesPatient,
  FacialEmotionFeatures,
} from "@/lib/inference";
import { useSessionStore } from "@/lib/store";

export const LiveTestPanel: React.FC = () => {
  const { goal, templateId } = useSessionStore();
  const lowerGoal = (goal || "").toLowerCase();
  const safeGoal = goal?.trim() || "Your Machine Learning Project";

  // Determine which domain tester to display
  const isEmotionOrFace =
    lowerGoal.includes("emotion") ||
    lowerGoal.includes("face") ||
    lowerGoal.includes("facial") ||
    lowerGoal.includes("expression") ||
    lowerGoal.includes("smile") ||
    lowerGoal.includes("mood");

  const isMedical =
    lowerGoal.includes("diabet") ||
    lowerGoal.includes("disease") ||
    lowerGoal.includes("cancer") ||
    lowerGoal.includes("medical") ||
    lowerGoal.includes("patient") ||
    lowerGoal.includes("health") ||
    lowerGoal.includes("heart") ||
    lowerGoal.includes("clinic") ||
    lowerGoal.includes("tumor");

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

  // State for Emotion / Facial Action Units tester
  const [faceFeatures, setFaceFeatures] = useState<FacialEmotionFeatures>({
    smile: 0.80,
    browFurrow: 0.10,
    eyeOpenness: 0.65,
    jawDrop: 0.20,
  });
  const [emotionThreshold, setEmotionThreshold] = useState(0.40);

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

  // State for General Custom ML tester
  const [customFeatures, setCustomFeatures] = useState([0.75, 0.40, 0.60, 0.30]);
  const [customThreshold, setCustomThreshold] = useState(0.50);

  // Computations
  const emotionResult = useMemo(() => {
    return predictFacialEmotion(faceFeatures, emotionThreshold);
  }, [faceFeatures, emotionThreshold]);

  const clinicalResult = useMemo(() => {
    return predictClinicalDiabetes(patient, medicalThreshold);
  }, [patient, medicalThreshold]);

  const housingResult = useMemo(() => {
    return predictHomeValue(sqft, bedrooms);
  }, [sqft, bedrooms]);

  const spamResult = useMemo(() => {
    return classifyLiveMessage(inputText, spamThreshold);
  }, [inputText, spamThreshold]);

  // General Custom dot-product inference
  const customResult = useMemo(() => {
    const weights = [1.8, -1.2, 0.9, 1.4];
    const bias = -0.6;
    const dotProduct = customFeatures.reduce((acc, f, i) => acc + f * weights[i], 0) + bias;
    const prob = Math.round((1.0 / (1.0 + Math.exp(-dotProduct))) * 1000) / 1000;
    const isPositive = prob >= customThreshold;
    return {
      dotProduct: Math.round(dotProduct * 100) / 100,
      probability: prob,
      confidence: Math.round(prob * 1000) / 10,
      isPositive,
      prediction: isPositive ? "POSITIVE / CLASS 1" : "NEGATIVE / CLASS 0",
    };
  }, [customFeatures, customThreshold]);

  // ---------------------------------------------------------------------------
  // 1. RENDER: FACIAL EMOTION / FACE ANALYZER TESTER
  // ---------------------------------------------------------------------------
  if (isEmotionOrFace) {
    const emotionPresets = [
      {
        name: "Joy / Happy",
        emoji: "😄",
        features: { smile: 0.85, browFurrow: 0.05, eyeOpenness: 0.65, jawDrop: 0.20 },
      },
      {
        name: "Surprise",
        emoji: "😲",
        features: { smile: 0.05, browFurrow: 0.15, eyeOpenness: 0.95, jawDrop: 0.85 },
      },
      {
        name: "Anger",
        emoji: "😠",
        features: { smile: -0.40, browFurrow: 0.85, eyeOpenness: 0.40, jawDrop: 0.10 },
      },
      {
        name: "Sadness",
        emoji: "😢",
        features: { smile: -0.70, browFurrow: 0.45, eyeOpenness: 0.35, jawDrop: 0.15 },
      },
      {
        name: "Neutral",
        emoji: "😐",
        features: { smile: 0.00, browFurrow: 0.05, eyeOpenness: 0.50, jawDrop: 0.05 },
      },
    ];

    return (
      <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
              <Camera className="w-3.5 h-3.5" />
              <span>Facial Emotion Model Tester</span>
            </div>
            <h3 className="text-xl md:text-2xl font-bold text-white mt-1">
              Live Facial Emotion Analyzer
            </h3>
            <p className="text-xs text-zinc-300">
              Test your vision classifier on extracted facial action units (smile curvature, brow tension, eye aperture, jaw position) in real time.
            </p>
          </div>

          {/* Threshold Slider */}
          <div className="flex items-center gap-3 bg-zinc-950/80 px-4 py-2.5 rounded-2xl border border-white/10">
            <Sliders className="w-4 h-4 text-cyan-400" />
            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                <span>Confidence Threshold:</span>
                <span className="text-cyan-400 font-bold ml-2">
                  {Math.round(emotionThreshold * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.20"
                max="0.80"
                step="0.05"
                value={emotionThreshold}
                onChange={(e) => setEmotionThreshold(parseFloat(e.target.value))}
                className="w-28 accent-cyan-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* 1-Click Emotion Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold mr-1">
            Expression Presets:
          </span>
          {emotionPresets.map((preset) => {
            const isMatch =
              Math.abs(faceFeatures.smile - preset.features.smile) < 0.15 &&
              Math.abs(faceFeatures.browFurrow - preset.features.browFurrow) < 0.15;
            return (
              <button
                key={preset.name}
                type="button"
                onClick={() => setFaceFeatures(preset.features)}
                className={`px-3 py-1.5 rounded-xl border text-xs font-bold transition-all flex items-center gap-1.5 ${
                  isMatch
                    ? "bg-cyan-500/20 border-cyan-400 text-cyan-200 shadow-md ring-1 ring-cyan-400/50"
                    : "bg-zinc-900/60 border-white/10 text-zinc-300 hover:border-gold/30 hover:text-white"
                }`}
              >
                <span>{preset.emoji}</span>
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>

        {/* Facial Sliders & Dynamic Face Avatar */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Sliders (8 cols) */}
          <div className="lg:col-span-8 grid grid-cols-1 sm:grid-cols-2 gap-4 bg-zinc-950/70 p-5 rounded-3xl border border-white/5">
            {/* Smile / Mouth Curvature */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Smile className="w-3.5 h-3.5 text-amber-400" />
                  Smile Curvature (AU12)
                </span>
                <span className="font-mono font-bold text-amber-300">
                  {faceFeatures.smile > 0 ? `+${faceFeatures.smile.toFixed(2)}` : faceFeatures.smile.toFixed(2)}
                </span>
              </div>
              <input
                type="range"
                min="-1.0"
                max="1.0"
                step="0.05"
                value={faceFeatures.smile}
                onChange={(e) => setFaceFeatures({ ...faceFeatures, smile: parseFloat(e.target.value) })}
                className="w-full accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>-1.0 (Frown)</span>
                <span>0.0 (Neutral)</span>
                <span>+1.0 (Broad Smile)</span>
              </div>
            </div>

            {/* Brow Furrow */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Activity className="w-3.5 h-3.5 text-rose-400" />
                  Brow Furrow (AU4)
                </span>
                <span className="font-mono font-bold text-rose-400">
                  {Math.round(faceFeatures.browFurrow * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={faceFeatures.browFurrow}
                onChange={(e) => setFaceFeatures({ ...faceFeatures, browFurrow: parseFloat(e.target.value) })}
                className="w-full accent-rose-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>0% (Relaxed)</span>
                <span>50% (Tension)</span>
                <span>100% (Deep Furrow)</span>
              </div>
            </div>

            {/* Eye Openness */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <Eye className="w-3.5 h-3.5 text-cyan-400" />
                  Eye Aperture / Openness (AU5)
                </span>
                <span className="font-mono font-bold text-cyan-300">
                  {Math.round(faceFeatures.eyeOpenness * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.10"
                max="1.0"
                step="0.05"
                value={faceFeatures.eyeOpenness}
                onChange={(e) => setFaceFeatures({ ...faceFeatures, eyeOpenness: parseFloat(e.target.value) })}
                className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>10% (Squint)</span>
                <span>50% (Standard)</span>
                <span>100% (Wide Open)</span>
              </div>
            </div>

            {/* Jaw Drop */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs">
                <span className="text-zinc-400 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-purple-400" />
                  Jaw Drop / Openness (AU26)
                </span>
                <span className="font-mono font-bold text-purple-300">
                  {Math.round(faceFeatures.jawDrop * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.0"
                max="1.0"
                step="0.05"
                value={faceFeatures.jawDrop}
                onChange={(e) => setFaceFeatures({ ...faceFeatures, jawDrop: parseFloat(e.target.value) })}
                className="w-full accent-purple-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
              <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
                <span>0% (Closed)</span>
                <span>50% (Parted)</span>
                <span>100% (Dropped)</span>
              </div>
            </div>
          </div>

          {/* Dynamic Interactive Face Graphic (4 cols) */}
          <div className="lg:col-span-4 bg-zinc-950/90 p-5 rounded-3xl border border-white/10 flex flex-col items-center justify-center text-center space-y-3">
            <span className="text-[11px] font-mono uppercase text-zinc-400 tracking-wider">
              Landmark Synthesis Visualizer
            </span>

            {/* Dynamic SVG Face Avatar */}
            <div className="relative w-36 h-36 flex items-center justify-center">
              <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
                {/* Face Contour */}
                <circle cx="50" cy="50" r="45" fill="#181714" stroke="#D4AF37" strokeWidth="2.5" />
                
                {/* Eyebrows (react to browFurrow) */}
                <line
                  x1="26"
                  y1={32 + faceFeatures.browFurrow * 8}
                  x2="42"
                  y2={34 - faceFeatures.browFurrow * 6}
                  stroke="#E5E7EB"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
                <line
                  x1="74"
                  y1={32 + faceFeatures.browFurrow * 8}
                  x2="58"
                  y2={34 - faceFeatures.browFurrow * 6}
                  stroke="#E5E7EB"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />

                {/* Eyes (react to eyeOpenness) */}
                <ellipse
                  cx="34"
                  cy="42"
                  rx="5.5"
                  ry={Math.max(1.5, faceFeatures.eyeOpenness * 7)}
                  fill="#67E8F9"
                />
                <ellipse
                  cx="66"
                  cy="42"
                  rx="5.5"
                  ry={Math.max(1.5, faceFeatures.eyeOpenness * 7)}
                  fill="#67E8F9"
                />

                {/* Mouth (reacts to smile curvature and jaw drop) */}
                <path
                  d={`M 28,${68 + faceFeatures.jawDrop * 8} Q 50,${
                    68 + faceFeatures.jawDrop * 12 + faceFeatures.smile * 16
                  } 72,${68 + faceFeatures.jawDrop * 8}`}
                  fill={faceFeatures.jawDrop > 0.35 ? "#3F3F46" : "none"}
                  stroke="#F59E0B"
                  strokeWidth="3.5"
                  strokeLinecap="round"
                />
              </svg>
            </div>

            <div className="text-center">
              <span className="text-2xl font-bold">{emotionResult.emoji}</span>
              <span className="text-xs font-mono font-bold text-amber-300 block mt-0.5">
                {emotionResult.dominantEmotion}
              </span>
            </div>
          </div>
        </div>

        {/* Live Model Output Display */}
        <div className="p-6 rounded-3xl bg-zinc-950/90 border border-white/10 space-y-5">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4 border-b border-white/10">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-3xl flex-shrink-0">
                {emotionResult.emoji}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-extrabold text-white uppercase tracking-wide">
                    {emotionResult.dominantEmotion}
                  </span>
                  <span className="text-xs font-mono uppercase bg-cyan-900/60 text-cyan-200 px-2.5 py-0.5 rounded-full border border-cyan-500/40 font-bold">
                    Classified
                  </span>
                </div>
                <p className="text-xs text-zinc-300 mt-1">
                  Facial expression features mapped via logistic weights &amp; multi-class Softmax activation.
                </p>
              </div>
            </div>

            <div className="flex flex-col items-end bg-[#14130F] p-4 rounded-2xl border border-white/5 min-w-[180px]">
              <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">
                Model Confidence
              </span>
              <span className="text-3xl font-extrabold font-mono text-cyan-300 mt-0.5">
                {emotionResult.confidence}%
              </span>
              <span className="text-[10px] text-zinc-500 font-mono mt-1">
                Threshold: {Math.round(emotionThreshold * 100)}%
              </span>
            </div>
          </div>

          {/* Softmax Probability Distribution Chart */}
          <div className="space-y-2">
            <span className="text-xs font-mono uppercase text-zinc-400 font-bold block">
              Softmax Probability Distribution Across Emotion Classes:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2.5 pt-1">
              {emotionResult.probabilities.map((prob) => {
                const isWinner = prob.emotion === emotionResult.dominantEmotion;
                return (
                  <div
                    key={prob.emotion}
                    className={`p-3 rounded-xl border transition-all ${
                      isWinner
                        ? "bg-cyan-500/15 border-cyan-400 shadow-md ring-1 ring-cyan-400/40"
                        : "bg-zinc-900/50 border-white/5"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs mb-1.5">
                      <span className="font-semibold text-zinc-200 flex items-center gap-1">
                        <span>{prob.emoji}</span>
                        <span className="truncate">{prob.emotion.split("/")[0]}</span>
                      </span>
                      <span className="font-mono font-bold text-cyan-300">
                        {(prob.probability * 100).toFixed(1)}%
                      </span>
                    </div>
                    <div className="w-full bg-zinc-800 h-2 rounded-full overflow-hidden">
                      <div
                        className={`h-full transition-all duration-300 ${
                          isWinner ? "bg-cyan-400" : "bg-zinc-600"
                        }`}
                        style={{ width: `${Math.max(4, prob.probability * 100)}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Unit Breakdown */}
          <div className="pt-2">
            <span className="text-xs font-mono uppercase text-zinc-400 font-bold block mb-2">
              Action Unit Feature Breakdown:
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {emotionResult.actionUnits.map((au, i) => (
                <div key={i} className="text-xs p-2.5 rounded-xl bg-zinc-900/80 border border-white/5 space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-mono text-zinc-400 truncate">{au.unit.split("(")[0]}</span>
                    <span className="font-mono font-bold text-amber-300">{au.activation}</span>
                  </div>
                  <p className="text-[11px] text-zinc-300 leading-tight">{au.interpretation}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. RENDER: MEDICAL / DIABETES TESTER
  // ---------------------------------------------------------------------------
  if (isMedical) {
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

          {/* Threshold Slider */}
          <div className="flex items-center gap-3 bg-zinc-950/80 px-4 py-2.5 rounded-2xl border border-white/10">
            <Sliders className="w-4 h-4 text-amber-400" />
            <div className="space-y-0.5">
              <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
                <span>Decision Threshold:</span>
                <span className="text-amber-400 font-bold ml-2">
                  {Math.round(medicalThreshold * 100)}%
                </span>
              </div>
              <input
                type="range"
                min="0.10"
                max="0.80"
                step="0.05"
                value={medicalThreshold}
                onChange={(e) => setMedicalThreshold(parseFloat(e.target.value))}
                className="w-28 accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
              />
            </div>
          </div>
        </div>

        {/* Cohort Quick Presets */}
        <div className="flex flex-wrap items-center gap-2 pt-1">
          <span className="text-xs font-mono text-zinc-400 uppercase tracking-wider font-semibold mr-1">
            Quick Cohort Presets:
          </span>
          <button
            type="button"
            onClick={() =>
              setPatient({ glucose: 175, age: 58, bmi: 33.5, bloodPressure: 142 })
            }
            className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-rose-400" />
            <span>High Risk Screening Patient</span>
          </button>
          <button
            type="button"
            onClick={() =>
              setPatient({ glucose: 86, age: 24, bmi: 21.0, bloodPressure: 110 })
            }
            className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            <span>Healthy Baseline Adult</span>
          </button>
          <button
            type="button"
            onClick={() =>
              setPatient({ glucose: 128, age: 49, bmi: 28.0, bloodPressure: 128 })
            }
            className="px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 text-xs font-bold transition-all flex items-center gap-1.5"
          >
            <span className="w-2 h-2 rounded-full bg-amber-400" />
            <span>Borderline Pre-Diabetic</span>
          </button>
        </div>

        {/* Interactive Sliders */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-zinc-950/70 p-5 rounded-3xl border border-white/5">
          {/* Fasting Glucose */}
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 flex items-center gap-1">
                <Activity className="w-3.5 h-3.5 text-amber-400" />
                Fasting Glucose
              </span>
              <span
                className={`font-mono font-bold ${
                  patient.glucose >= 126
                    ? "text-rose-400"
                    : patient.glucose >= 100
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {patient.glucose} mg/dL
              </span>
            </div>
            <input
              type="range"
              min="70"
              max="200"
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
                <Scale className="w-3.5 h-3.5 text-cyan-400" />
                Body Mass Index (BMI)
              </span>
              <span
                className={`font-mono font-bold ${
                  patient.bmi >= 30
                    ? "text-rose-400"
                    : patient.bmi >= 25
                    ? "text-amber-400"
                    : "text-emerald-400"
                }`}
              >
                {patient.bmi.toFixed(1)} kg/m²
              </span>
            </div>
            <input
              type="range"
              min="18.5"
              max="40.0"
              step="0.5"
              value={patient.bmi}
              onChange={(e) => setPatient({ ...patient, bmi: parseFloat(e.target.value) })}
              className="w-full accent-cyan-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
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
              <span
                className={`font-mono font-bold ${
                  patient.bloodPressure >= 130 ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {patient.bloodPressure} mmHg
              </span>
            </div>
            <input
              type="range"
              min="85"
              max="180"
              step="1"
              value={patient.bloodPressure}
              onChange={(e) =>
                setPatient({ ...patient, bloodPressure: parseInt(e.target.value) })
              }
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
                    className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                      clinicalResult.category === "HIGH_RISK"
                        ? "bg-rose-900/60 text-rose-300 border-rose-500/50"
                        : clinicalResult.category === "MODERATE_RISK"
                        ? "bg-amber-900/60 text-amber-300 border-amber-500/50"
                        : "bg-emerald-900/60 text-emerald-300 border-emerald-500/50"
                    }`}
                  >
                    {clinicalResult.category}
                  </span>
                </div>
                <p className="text-xs text-zinc-300">{clinicalResult.recommendation}</p>
              </div>
            </div>

            <div className="flex flex-col items-end bg-[#14130F] p-4 rounded-2xl border border-white/5 min-w-[180px]">
              <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">
                Calculated Risk Score
              </span>
              <span
                className={`text-3xl font-extrabold font-mono mt-0.5 ${
                  clinicalResult.isPositive ? "text-rose-400" : "text-emerald-400"
                }`}
              >
                {(clinicalResult.riskProbability * 100).toFixed(1)}%
              </span>
              <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className={`h-full ${
                    clinicalResult.isPositive ? "bg-rose-500" : "bg-emerald-400"
                  }`}
                  style={{ width: `${Math.min(100, clinicalResult.riskProbability * 100)}%` }}
                />
              </div>
              <span className="text-[10px] text-zinc-500 font-mono mt-1">
                Threshold: {Math.round(medicalThreshold * 100)}%
              </span>
            </div>
          </div>

          <div className="mt-5 pt-4 border-t border-white/10 space-y-2">
            <span className="text-[10px] font-mono uppercase text-zinc-400 font-bold block">
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

  // ---------------------------------------------------------------------------
  // 3. RENDER: REAL ESTATE MODEL TESTER
  // ---------------------------------------------------------------------------
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

  // ---------------------------------------------------------------------------
  // 4. RENDER: SPAM CLASSIFIER TESTER
  // ---------------------------------------------------------------------------
  if (isSpam) {
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
            <p className="text-xs text-zinc-300">
              Type or paste any message to observe token frequency weights and Bayesian spam scoring live.
            </p>
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
  }

  // ---------------------------------------------------------------------------
  // 5. RENDER: GENERAL CUSTOM ML MODEL TESTER (For all other custom projects)
  // ---------------------------------------------------------------------------
  return (
    <div className="glass-panel p-6 md:p-8 rounded-3xl border border-white/10 shadow-2xl space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-semibold">
            <Layers className="w-3.5 h-3.5" />
            <span>Interactive Model Tester</span>
          </div>
          <h3 className="text-xl md:text-2xl font-bold text-white mt-1">
            Live Model Inference Engine: {safeGoal}
          </h3>
          <p className="text-xs text-zinc-300">
            Simulate incoming feature vectors through your trained scoring function and decision boundary in real time.
          </p>
        </div>

        {/* Threshold Slider */}
        <div className="flex items-center gap-3 bg-zinc-950/80 px-4 py-2.5 rounded-2xl border border-white/10">
          <Sliders className="w-4 h-4 text-amber-400" />
          <div className="space-y-0.5">
            <div className="flex items-center justify-between text-[11px] text-zinc-400 font-mono">
              <span>Decision Threshold:</span>
              <span className="text-amber-400 font-bold ml-2">
                {Math.round(customThreshold * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.10"
              max="0.90"
              step="0.05"
              value={customThreshold}
              onChange={(e) => setCustomThreshold(parseFloat(e.target.value))}
              className="w-28 accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
          </div>
        </div>
      </div>

      {/* Feature Input Sliders */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-zinc-950/70 p-5 rounded-3xl border border-white/5">
        {customFeatures.map((val, idx) => (
          <div key={idx} className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-zinc-400 font-mono">Feature {idx + 1} (x{idx + 1})</span>
              <span className="font-mono font-bold text-amber-300">{val.toFixed(2)}</span>
            </div>
            <input
              type="range"
              min="0.0"
              max="1.0"
              step="0.05"
              value={val}
              onChange={(e) => {
                const next = [...customFeatures];
                next[idx] = parseFloat(e.target.value);
                setCustomFeatures(next);
              }}
              className="w-full accent-amber-400 cursor-pointer h-1.5 bg-zinc-800 rounded-lg"
            />
            <div className="flex justify-between text-[10px] text-zinc-500 font-mono">
              <span>0.0</span>
              <span>0.5</span>
              <span>1.0</span>
            </div>
          </div>
        ))}
      </div>

      {/* Output Decision Card */}
      <div
        className={`p-6 rounded-3xl border transition-all ${
          customResult.isPositive
            ? "bg-amber-950/25 border-amber-500/50 text-amber-100"
            : "bg-zinc-900/60 border-zinc-700/60 text-zinc-300"
        }`}
      >
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div
              className={`w-14 h-14 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                customResult.isPositive
                  ? "bg-amber-500/20 border border-amber-500/40 text-amber-400"
                  : "bg-zinc-800 border border-zinc-700 text-zinc-400"
              }`}
            >
              {customResult.isPositive ? (
                <CheckCircle2 className="w-7 h-7" />
              ) : (
                <AlertTriangle className="w-7 h-7" />
              )}
            </div>
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xl font-extrabold uppercase tracking-wide">
                  {customResult.prediction}
                </span>
                <span className="text-xs font-mono uppercase bg-zinc-800 px-2.5 py-0.5 rounded-full border border-white/10 font-bold">
                  Score: {customResult.dotProduct}
                </span>
              </div>
              <p className="text-xs text-zinc-400">
                Formula: z = sum(w * x) + bias &rarr; Sigmoid(z) = 1 / (1 + e^-z)
              </p>
            </div>
          </div>

          <div className="flex flex-col items-end bg-[#14130F] p-4 rounded-2xl border border-white/5 min-w-[180px]">
            <span className="text-[10px] font-mono uppercase text-zinc-400 tracking-wider">
              Activation Confidence
            </span>
            <span className="text-3xl font-extrabold font-mono text-amber-400 mt-0.5">
              {customResult.confidence}%
            </span>
            <div className="w-full bg-zinc-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div
                className="h-full bg-amber-400"
                style={{ width: `${customResult.confidence}%` }}
              />
            </div>
            <span className="text-[10px] text-zinc-500 font-mono mt-1">
              Threshold: {Math.round(customThreshold * 100)}%
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
