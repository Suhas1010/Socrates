"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Bot,
  Play,
  CheckCircle2,
  AlertTriangle,
  Layers,
  ArrowRight,
  ShieldCheck,
  Cpu,
  Workflow,
  Sparkles,
  Stethoscope,
  Terminal,
  Copy,
  Check,
  RotateCcw,
  Code2,
  HelpCircle,
  Bug,
  Brain,
  Sliders,
  ArrowLeft,
} from "lucide-react";
import { executeMultiAgentPipeline, PipelineExecutionResult } from "@/lib/agents/orchestrator";
import {
  AgentStatusEvent,
  AgentRole,
  ScoperOutput,
  ArchitectOutput,
  ImplementerOutput,
  ExecutorOutput,
  SlicerOutput,
  PedagogueOutput,
  DiagnosticianOutput,
  TutorOutput,
} from "@/lib/agents/types";
import { runScoperAgent } from "@/lib/agents/scoper";
import { runArchitectAgent } from "@/lib/agents/architect";
import { runImplementerAgent } from "@/lib/agents/implementer";
import { runExecutorAgent } from "@/lib/agents/executor";
import { runSlicerAgent } from "@/lib/agents/slicer";
import { runPedagogueAgent } from "@/lib/agents/pedagogue";
import { runDiagnosticianAgent } from "@/lib/agents/diagnostician";
import { runTutorAgent } from "@/lib/agents/tutor";
import { executeRedTeamSuite } from "@/lib/redteam";
import { CATALOG_SPAM_CLASSIFIER } from "@/lib/catalog";
import { useSessionStore } from "@/lib/store";
import { RedTeamTestResult } from "@/lib/types";

export default function AdminDebugPage() {
  const { goal, interests, background } = useSessionStore();
  const [activeTab, setActiveTab] = useState<"pipeline" | "single">("pipeline");

  // Pipeline State
  const [customTask, setCustomTask] = useState(goal || "Credit card fraud detector");
  const [isPipelineRunning, setIsPipelineRunning] = useState(false);
  const [events, setEvents] = useState<AgentStatusEvent[]>([]);
  const [pipelineResult, setPipelineResult] = useState<PipelineExecutionResult | null>(null);

  // Single Agent Task Runner State
  const [selectedAgent, setSelectedAgent] = useState<AgentRole>("scoper");
  const [isSingleRunning, setIsSingleRunning] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);

  // Single Agent Inputs
  const [singleGoal, setSingleGoal] = useState("Hospital 30-day readmission predictor");
  const [singleInterests, setSingleInterests] = useState(interests || "Healthcare");
  const [singleBackground, setSingleBackground] = useState<string>(background || "Intermediate");
  const [singleFnName, setSingleFnName] = useState("preprocess_features");
  const [singleCode, setSingleCode] = useState(
    `def predict(X):\n    # Threshold classification\n    return [1 if x > 0.5 else 0 for x in X]`
  );
  const [singleStepTitle, setSingleStepTitle] = useState("Feature Normalization");
  const [singleConceptId, setSingleConceptId] = useState("gradient-descent");
  const [singleErrorTrace, setSingleErrorTrace] = useState("ZeroDivisionError: division by zero in normalization step");
  const [singleStudentCode, setSingleStudentCode] = useState("def normalize(x):\n    return x / (max_val - min_val)");
  const [singleTutorQuery, setSingleTutorQuery] = useState("Why does my gradient descent loss oscillate instead of converging?");
  const [singleAttempts, setSingleAttempts] = useState(1);

  // Single Agent Outputs
  const [scoperResult, setScoperResult] = useState<ScoperOutput | null>(null);
  const [architectResult, setArchitectResult] = useState<ArchitectOutput | null>(null);
  const [implementerResult, setImplementerResult] = useState<ImplementerOutput | null>(null);
  const [executorResult, setExecutorResult] = useState<ExecutorOutput | null>(null);
  const [slicerResult, setSlicerResult] = useState<SlicerOutput | null>(null);
  const [pedagogueResult, setPedagogueResult] = useState<PedagogueOutput | null>(null);
  const [diagnosticianResult, setDiagnosticianResult] = useState<DiagnosticianOutput | null>(null);
  const [redteamResult, setRedteamResult] = useState<RedTeamTestResult[] | null>(null);
  const [tutorResult, setTutorResult] = useState<TutorOutput | null>(null);

  const agentDefinitions: Array<{
    role: AgentRole;
    name: string;
    description: string;
    badge: string;
    icon: React.ComponentType<{ className?: string }>;
  }> = [
    { role: "scoper", name: "Scoper Agent", description: "Formulates mathematical task specs, data schemas, metrics & hardware Tier.", badge: "Spec & Tier", icon: Bot },
    { role: "architect", name: "Architect Agent", description: "Decomposes pipeline into modular functions and verifies acyclic call graph DAG.", badge: "Call Graph", icon: Workflow },
    { role: "implementer", name: "Implementer Agent", description: "Synthesizes Python functions and verifies execution on isolated sample inputs.", badge: "Code Gen", icon: Code2 },
    { role: "executor", name: "Executor Agent", description: "Runs pipeline in Pyodide WASM, validates metric thresholds & executes repair loops.", badge: "WASM Repair", icon: Terminal },
    { role: "slicer", name: "Slicer Agent", description: "Cuts pipeline into progressive build steps with blanks (___) and golden values.", badge: "DAG & Blanks", icon: Layers },
    { role: "pedagogue", name: "Pedagogue Agent", description: "Derives curiosity hooks, intuitive analogies, and expected misconceptions.", badge: "Pedagogy", icon: Brain },
    { role: "diagnostician", name: "Diagnostician Agent", description: "Evidence-based classifier across the 4-type error taxonomy.", badge: "Error Taxonomy", icon: Stethoscope },
    { role: "redteam", name: "Red-Team Agent", description: "Attacks running models with boundary zeros, outliers, and OOD noise.", badge: "Stress Testing", icon: ShieldCheck },
    { role: "tutor", name: "Runtime Tutor Agent", description: "Bounded Socratic assistant enforcing Attempt-First locking rules.", badge: "Bounded Socratic", icon: HelpCircle },
  ];

  const handleRunPipeline = async () => {
    if (!customTask.trim()) return;
    setIsPipelineRunning(true);
    setEvents([]);
    setPipelineResult(null);

    try {
      const res = await executeMultiAgentPipeline(
        customTask.trim(),
        interests,
        background,
        (evt) => {
          setEvents((prev) => [...prev, evt]);
        }
      );
      setPipelineResult(res);
    } catch (e: any) {
      console.error("Pipeline failure:", e);
    } finally {
      setIsPipelineRunning(false);
    }
  };

  const handleRunSingleAgent = async () => {
    setIsSingleRunning(true);
    try {
      if (selectedAgent === "scoper") {
        const out = await runScoperAgent(singleGoal, singleInterests, singleBackground);
        setScoperResult(out);
      } else if (selectedAgent === "architect") {
        const scoperOut = await runScoperAgent(singleGoal);
        const out = await runArchitectAgent(scoperOut.spec, singleGoal);
        setArchitectResult(out);
      } else if (selectedAgent === "implementer") {
        const scoperOut = await runScoperAgent(singleGoal);
        const out = await runImplementerAgent(
          { name: singleFnName, signature: `${singleFnName}(X)`, dependsOn: [] },
          scoperOut.spec
        );
        setImplementerResult(out);
      } else if (selectedAgent === "executor") {
        const scoperOut = await runScoperAgent(singleGoal);
        const out = await runExecutorAgent(singleCode, scoperOut.spec);
        setExecutorResult(out);
      } else if (selectedAgent === "slicer") {
        const scoperOut = await runScoperAgent(singleGoal);
        const out = await runSlicerAgent(singleGoal, scoperOut.spec);
        setSlicerResult(out);
      } else if (selectedAgent === "pedagogue") {
        const scoperOut = await runScoperAgent(singleGoal);
        const out = await runPedagogueAgent(
          {
            id: "step-target",
            conceptId: singleConceptId,
            title: singleStepTitle,
            function: singleFnName,
            blanksCount: 1,
            starterCode: `def step(x): return ___`,
            solutionCode: `def step(x): return x`,
            goldenValues: [],
            misconceptions: [],
          },
          scoperOut.spec,
          singleInterests
        );
        setPedagogueResult(out);
      } else if (selectedAgent === "diagnostician") {
        const out = await runDiagnosticianAgent({
          conceptId: singleConceptId,
          userCode: singleStudentCode,
          errorTrace: singleErrorTrace,
          goldenTest: {
            description: "Check output",
            inputs: {},
            expectedOutput: 1.0,
            tolerance: 0.01,
          },
        });
        setDiagnosticianResult(out);
      } else if (selectedAgent === "redteam") {
        const tests = await executeRedTeamSuite(CATALOG_SPAM_CLASSIFIER.modelContract, singleCode);
        setRedteamResult(tests);
      } else if (selectedAgent === "tutor") {
        const out = await runTutorAgent({
          query: singleTutorQuery,
          conceptTitle: singleStepTitle,
          attemptsCount: singleAttempts,
          isLocked: singleAttempts < 2,
          pastMisconceptions: [],
        });
        setTutorResult(out);
      }
    } catch (e: any) {
      console.error("Single agent execution error:", e);
    } finally {
      setIsSingleRunning(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const getAgentEvent = (role: AgentRole) => {
    return events.filter((e) => e.agent === role).slice(-1)[0];
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-zinc-200 p-6 sm:p-10 font-mono">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Top Header */}
        <div className="flex items-center justify-between border-b border-zinc-800 pb-5">
          <div className="flex items-center gap-3">
            <Link
              href="/"
              className="p-2 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white transition-colors"
              title="Return to Learner UI"
            >
              <ArrowLeft className="w-4 h-4" />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-lg font-bold text-zinc-100 font-mono">
                  Socrates Agent Orchestration & Debug Console
                </h1>
                <span className="px-2 py-0.5 rounded text-[10px] bg-red-950/40 text-red-400 border border-red-500/30">
                  Hidden /admin/debug Route
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                Internal telemetry, active agent registry, and raw pipeline event streams.
              </p>
            </div>
          </div>

          <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setActiveTab("pipeline")}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                activeTab === "pipeline"
                  ? "bg-amber-500 text-zinc-950 font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Autonomous Pipeline
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("single")}
              className={`px-3 py-1.5 rounded-md text-xs transition-colors ${
                activeTab === "single"
                  ? "bg-amber-500 text-zinc-950 font-bold"
                  : "text-zinc-400 hover:text-zinc-200"
              }`}
            >
              Task-Specific Agent Runner
            </button>
          </div>
        </div>

        {/* TAB 1: FULL PIPELINE & REGISTRY */}
        {activeTab === "pipeline" && (
          <div className="space-y-6">
            {/* Task Launcher Bar */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-3">
              <div className="flex items-center justify-between">
                <label htmlFor="debug-task-input" className="text-xs font-semibold text-zinc-300">
                  Dispatch Multi-Agent Pipeline for Custom ML/DL Goal:
                </label>
                <span className="text-[11px] text-zinc-500">6-Stage Orchestration</span>
              </div>
              <div className="flex items-center gap-2">
                <input
                  id="debug-task-input"
                  type="text"
                  value={customTask}
                  onChange={(e) => setCustomTask(e.target.value)}
                  placeholder="e.g. Hospital readmission predictor, crop disease classifier..."
                  className="flex-1 px-3.5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700/80 text-xs text-zinc-200 focus:outline-none focus:border-amber-500"
                />
                <button
                  type="button"
                  onClick={handleRunPipeline}
                  disabled={isPipelineRunning || !customTask.trim()}
                  className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isPipelineRunning ? (
                    <>
                      <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                      <span>Orchestrating...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Launch Pipeline</span>
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Active Agent Registry */}
            <div className="space-y-3">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-bold text-zinc-300 uppercase tracking-wider">
                  Active Agent Registry
                </span>
                <span>{events.length} Live Agent Events</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {agentDefinitions.map((agent) => {
                  const latestEvt = getAgentEvent(agent.role);
                  const isWorking = latestEvt?.status === "running";
                  const isDone = latestEvt?.status === "verified";
                  const isErr = latestEvt?.status === "failed";
                  const IconComp = agent.icon;

                  return (
                    <div
                      key={agent.role}
                      className={`p-3.5 rounded-xl border text-xs space-y-2 transition-all ${
                        isWorking
                          ? "border-amber-500/80 bg-amber-500/10 shadow-sm"
                          : isDone
                          ? "border-emerald-500/50 bg-emerald-950/20"
                          : isErr
                          ? "border-red-500/50 bg-red-950/20"
                          : "border-zinc-800 bg-zinc-950"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <IconComp className="w-3.5 h-3.5 text-amber-400" />
                          <span className="font-bold text-zinc-200">{agent.name}</span>
                        </div>
                        <span
                          className={`text-[10px] px-1.5 py-0.5 rounded ${
                            isDone
                              ? "bg-emerald-900/60 text-emerald-300 border border-emerald-600/40"
                              : isWorking
                              ? "bg-amber-900/60 text-amber-300 border border-amber-600/40 animate-pulse"
                              : "bg-zinc-900 text-zinc-500 border border-zinc-800"
                          }`}
                        >
                          {isDone ? "Verified" : isWorking ? "Active" : agent.badge}
                        </span>
                      </div>

                      <p className="text-[11px] text-zinc-400 leading-relaxed">
                        {agent.description}
                      </p>

                      {latestEvt && (
                        <div className="pt-2 border-t border-zinc-800/80 text-[10px] text-zinc-300 truncate">
                          &gt; {latestEvt.message}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pipeline Event Stream */}
            {events.length > 0 && (
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-2">
                <span className="text-xs uppercase text-zinc-400 tracking-wider font-bold">
                  Pipeline Event Stream
                </span>
                <div className="space-y-1.5 max-h-56 overflow-y-auto text-[11px] text-zinc-400 pr-1">
                  {events.map((evt, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-zinc-600">[{new Date(evt.timestamp).toLocaleTimeString()}]</span>
                      <span className="text-amber-400 uppercase font-semibold">[{evt.agent}]</span>
                      <span className="text-zinc-300">{evt.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: TASK-SPECIFIC AGENT RUNNER */}
        {activeTab === "single" && (
          <div className="space-y-6">
            {/* Agent Selector */}
            <div className="space-y-2">
              <span className="text-xs text-zinc-400 font-bold uppercase">Select Agent to Test:</span>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-9 gap-1.5">
                {agentDefinitions.map((ag) => {
                  const isSelected = selectedAgent === ag.role;
                  return (
                    <button
                      key={ag.role}
                      type="button"
                      onClick={() => setSelectedAgent(ag.role)}
                      className={`p-2 rounded-lg border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                        isSelected
                          ? "bg-amber-500/20 border-amber-500/80 text-amber-300 shadow-sm"
                          : "bg-zinc-950 border-zinc-800 text-zinc-400 hover:text-zinc-200 hover:border-zinc-700"
                      }`}
                    >
                      <ag.icon className="w-4 h-4" />
                      <span className="text-[10px] truncate w-full">{ag.name.replace(" Agent", "")}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Agent Specific Test Config & Execution */}
            <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-4">
              <div className="flex items-center justify-between border-b border-zinc-800 pb-2">
                <span className="text-xs font-bold text-amber-400 uppercase">
                  [{selectedAgent}] Test Configuration
                </span>
                <button
                  type="button"
                  onClick={handleRunSingleAgent}
                  disabled={isSingleRunning}
                  className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
                >
                  {isSingleRunning ? (
                    <>
                      <div className="w-3 h-3 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                      <span>Executing...</span>
                    </>
                  ) : (
                    <>
                      <Play className="w-3 h-3 fill-current" />
                      <span>Run {selectedAgent.toUpperCase()}</span>
                    </>
                  )}
                </button>
              </div>

              {selectedAgent === "scoper" && (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400">ML Project Goal:</label>
                    <input
                      type="text"
                      value={singleGoal}
                      onChange={(e) => setSingleGoal(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400">Learner Interests:</label>
                    <input
                      type="text"
                      value={singleInterests}
                      onChange={(e) => setSingleInterests(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400">Coding Background:</label>
                    <input
                      type="text"
                      value={singleBackground}
                      onChange={(e) => setSingleBackground(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200"
                    />
                  </div>
                </div>
              )}

              {selectedAgent === "diagnostician" && (
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] text-zinc-400">Concept ID:</label>
                      <input
                        type="text"
                        value={singleConceptId}
                        onChange={(e) => setSingleConceptId(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] text-zinc-400">Error Traceback:</label>
                      <input
                        type="text"
                        value={singleErrorTrace}
                        onChange={(e) => setSingleErrorTrace(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200"
                      />
                    </div>
                  </div>
                </div>
              )}

              {selectedAgent === "pedagogue" && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400">Step Title:</label>
                    <input
                      type="text"
                      value={singleStepTitle}
                      onChange={(e) => setSingleStepTitle(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[11px] text-zinc-400">Learner Interest:</label>
                    <input
                      type="text"
                      value={singleInterests}
                      onChange={(e) => setSingleInterests(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs text-zinc-200"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Results Inspection */}
            {(scoperResult || diagnosticianResult || pedagogueResult) && (
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-2 text-xs">
                <span className="text-zinc-400 uppercase font-bold text-[11px]">
                  Agent Output Verification:
                </span>
                <pre className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 overflow-x-auto whitespace-pre-wrap max-h-52">
                  {JSON.stringify(scoperResult || diagnosticianResult || pedagogueResult, null, 2)}
                </pre>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
