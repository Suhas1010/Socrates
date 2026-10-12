"use client";

import React, { useState } from "react";
import {
  X,
  Bot,
  Play,
  CheckCircle2,
  Clock,
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
} from "lucide-react";
import { executeMultiAgentPipeline, PipelineExecutionResult } from "@/lib/agents/orchestrator";
import { AgentStatusEvent, AgentRole, ScoperOutput, ArchitectOutput, ImplementerOutput, ExecutorOutput, SlicerOutput, PedagogueOutput, DiagnosticianOutput, TutorOutput } from "@/lib/agents/types";
import { runScoperAgent } from "@/lib/agents/scoper";
import { runArchitectAgent } from "@/lib/agents/architect";
import { runImplementerAgent } from "@/lib/agents/implementer";
import { runExecutorAgent } from "@/lib/agents/executor";
import { runSlicerAgent } from "@/lib/agents/slicer";
import { runPedagogueAgent } from "@/lib/agents/pedagogue";
import { runDiagnosticianAgent } from "@/lib/agents/diagnostician";
import { runTutorAgent } from "@/lib/agents/tutor";
import { executeRedTeamSuite } from "@/lib/redteam";
import { CATALOG_SPAM_CLASSIFIER, CATALOG_REAL_ESTATE } from "@/lib/catalog";
import { useSessionStore } from "@/lib/store";
import { RedTeamTestResult } from "@/lib/types";
import { usePathname } from "next/navigation";
import { LearnerPipelineLoading } from "./LearnerPipelineLoading";

interface AgentPipelineModalProps {
  isOpen: boolean;
  onClose: () => void;
  debugMode?: boolean;
}

export const AgentPipelineModal: React.FC<AgentPipelineModalProps> = ({
  isOpen,
  onClose,
  debugMode,
}) => {
  const pathname = usePathname();
  const isDebugRoute = debugMode ?? (pathname?.startsWith("/admin/debug") || pathname?.startsWith("/dev/logs"));
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
  const [singleInterests, setSingleInterests] = useState<string>(interests || "Healthcare");
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

  if (!isOpen) return null;

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

  // Pipeline Execution
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

  // Single Agent Execution
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

  // Learner-facing UI mode: No agent names or internal debug streams leaked
  if (!isDebugRoute) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
        <div className="w-full max-w-xl rounded-2xl border border-zinc-800 bg-[#090b10] text-zinc-200 text-left overflow-hidden shadow-2xl flex flex-col">
          {/* Clean Learner Header */}
          <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Sparkles className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-semibold text-sm text-zinc-100 font-mono">
                  Personalized Learning Path Setup
                </h3>
                <p className="text-[11px] text-zinc-500 font-mono">
                  Synthesizing your execution-verified machine learning environment
                </p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Clean Learner Body */}
          <div className="p-6 space-y-5">
            {!isPipelineRunning && events.length === 0 ? (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label htmlFor="learner-goal-input" className="text-xs font-mono font-semibold text-zinc-300">
                    What model or ML task do you want to build?
                  </label>
                  <input
                    id="learner-goal-input"
                    type="text"
                    value={customTask}
                    onChange={(e) => setCustomTask(e.target.value)}
                    placeholder="e.g. Credit card fraud detector, housing price predictor..."
                    className="w-full px-3.5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700/80 text-xs font-mono text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                </div>
                <button
                  type="button"
                  onClick={handleRunPipeline}
                  disabled={!customTask.trim()}
                  className="w-full py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold font-mono text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-current" />
                  <span>Initialize Learning Workspace</span>
                </button>
              </div>
            ) : (
              <LearnerPipelineLoading
                events={events}
                isComplete={Boolean(pipelineResult?.success)}
                onContinue={onClose}
              />
            )}
          </div>

          {/* Clean Learner Footer */}
          <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between text-xs font-mono text-zinc-500">
            <span>Socrates · Execution-Verified Learning</span>
            <button
              type="button"
              onClick={onClose}
              className="px-3.5 py-1 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-300 transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Debug & Developer mode: Rendered only on /admin/debug route
  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-5xl rounded-2xl border border-zinc-800 bg-[#090b10] text-zinc-200 text-left overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-zinc-800 flex items-center justify-between bg-zinc-950/80 flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-400">
              <Bot className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-sm text-zinc-100 font-mono">
                  Socrates AI Multi-Agent Architecture
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-zinc-800 text-zinc-300 border border-zinc-700">
                  9 Task-Specific Agents
                </span>
              </div>
              <p className="text-[11px] text-zinc-500 font-mono">
                Scoper, Architect, Implementer, Executor, Slicer, Pedagogue, Diagnostician, Red-Team & Tutor
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Mode Tabs */}
            <div className="flex items-center bg-zinc-900 border border-zinc-800 rounded-lg p-0.5">
              <button
                type="button"
                onClick={() => setActiveTab("pipeline")}
                className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
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
                className={`px-3 py-1 rounded-md text-xs font-mono transition-colors ${
                  activeTab === "single"
                    ? "bg-amber-500 text-zinc-950 font-bold"
                    : "text-zinc-400 hover:text-zinc-200"
                }`}
              >
                Task-Specific Agent Runner
              </button>
            </div>

            <button
              onClick={onClose}
              className="text-zinc-400 hover:text-zinc-200 p-1.5 rounded-lg hover:bg-zinc-800 transition-colors ml-2"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1">
          {/* TAB 1: AUTONOMOUS MULTI-AGENT PIPELINE */}
          {activeTab === "pipeline" && (
            <div className="space-y-6">
              {/* Task Launcher Bar */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-3">
                <div className="flex items-center justify-between">
                  <label htmlFor="agent-task-input" className="text-xs font-mono font-semibold text-zinc-300">
                    Dispatch Multi-Agent Pipeline for Custom ML/DL Goal:
                  </label>
                  <span className="text-[11px] font-mono text-zinc-500">Autonomous 6-Stage Execution</span>
                </div>
                <div className="flex items-center gap-2">
                  <input
                    id="agent-task-input"
                    type="text"
                    value={customTask}
                    onChange={(e) => setCustomTask(e.target.value)}
                    placeholder="e.g. Hospital readmission predictor, crop disease classifier, loan default model..."
                    className="flex-1 px-3.5 py-2.5 rounded-lg bg-zinc-900 border border-zinc-700/80 text-xs font-mono text-zinc-200 focus:outline-none focus:border-amber-500"
                  />
                  <button
                    type="button"
                    onClick={handleRunPipeline}
                    disabled={isPipelineRunning || !customTask.trim()}
                    className="px-4 py-2.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold font-mono text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 flex-shrink-0 cursor-pointer"
                  >
                    {isPipelineRunning ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-zinc-950 border-t-transparent rounded-full animate-spin" />
                        <span>Orchestrating...</span>
                      </>
                    ) : (
                      <>
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Launch Full Pipeline</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              {/* Specialized Agents Grid */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-mono text-zinc-400">
                  <span>Active Agent Registry</span>
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
                        <div className="flex items-center justify-between font-mono">
                          <div className="flex items-center gap-1.5">
                            <IconComp className="w-3.5 h-3.5 text-amber-400" />
                            <span className="font-bold text-zinc-200">{agent.name}</span>
                          </div>
                          <span
                            className={`text-[10px] px-1.5 py-0.5 rounded font-mono ${
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
                          <div className="pt-2 border-t border-zinc-800/80 text-[10px] font-mono text-zinc-300 truncate">
                            &gt; {latestEvt.message}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Live Pipeline Activity Logs */}
              {events.length > 0 && (
                <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-2">
                  <span className="text-xs font-mono uppercase text-zinc-400 tracking-wider">
                    Pipeline Event Stream
                  </span>
                  <div className="space-y-1.5 max-h-40 overflow-y-auto font-mono text-[11px] text-zinc-400 pr-1">
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

              {/* Completed Project Summary */}
              {pipelineResult && pipelineResult.success && (
                <div className="p-4 rounded-xl border border-emerald-500/40 bg-emerald-950/20 text-xs font-mono space-y-3">
                  <div className="flex items-center gap-2 text-emerald-300 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Multi-Agent Task Compilation Complete!</span>
                  </div>
                  <p className="text-zinc-300 leading-relaxed">
                    The autonomous agents successfully scoped the task, verified {pipelineResult.architect.functions.length} pipeline functions, ran Pyodide acceptance tests ({pipelineResult.executor.metricName} = {pipelineResult.executor.achievedMetric}), sliced {pipelineResult.slicer.steps.length} progressive build steps, and synthesized domain analogies.
                  </p>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="px-2 py-0.5 rounded bg-emerald-900/40 border border-emerald-600/30 text-emerald-300 font-mono">
                      Tier: {pipelineResult.scoper.tier === "A" ? "Tier A (Browser WASM)" : "Tier C (Colab Export)"}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-900/40 border border-emerald-600/30 text-emerald-300 font-mono">
                      Metric: {pipelineResult.executor.metricName} &gt;= {pipelineResult.executor.threshold}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-emerald-900/40 border border-emerald-600/30 text-emerald-300 font-mono">
                      Acyclic DAG: {pipelineResult.architect.isAcyclic ? "Verified" : "Cycle Detected"}
                    </span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: TASK-SPECIFIC AGENT RUNNER */}
          {activeTab === "single" && (
            <div className="space-y-6">
              {/* Agent Selector Bar */}
              <div className="space-y-2">
                <span className="text-xs font-mono text-zinc-400">Select Specific AI Agent to Execute:</span>
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
                        <span className="text-[10px] font-mono truncate w-full">{ag.name.replace(" Agent", "")}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Dynamic Task Inputs for Selected Agent */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-4">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-amber-400 uppercase">
                      [{selectedAgent}] Task Configuration
                    </span>
                    <span className="text-[11px] font-mono text-zinc-500">
                      {agentDefinitions.find((a) => a.role === selectedAgent)?.description}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleRunSingleAgent}
                    disabled={isSingleRunning}
                    className="px-3.5 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-zinc-950 font-bold font-mono text-xs transition-colors disabled:opacity-50 flex items-center gap-1.5 cursor-pointer"
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

                {/* Specific Fields per Agent */}
                {selectedAgent === "scoper" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-zinc-400">ML Project Goal:</label>
                      <input
                        type="text"
                        value={singleGoal}
                        onChange={(e) => setSingleGoal(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-zinc-400">Learner Interests:</label>
                      <input
                        type="text"
                        value={singleInterests}
                        onChange={(e) => setSingleInterests(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-zinc-400">Coding Background:</label>
                      <input
                        type="text"
                        value={singleBackground}
                        onChange={(e) => setSingleBackground(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200"
                      />
                    </div>
                  </div>
                )}

                {selectedAgent === "architect" && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-zinc-400">Goal to Decompose into Acyclic Call Graph:</label>
                    <input
                      type="text"
                      value={singleGoal}
                      onChange={(e) => setSingleGoal(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200"
                    />
                  </div>
                )}

                {selectedAgent === "implementer" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-zinc-400">Target Function Name:</label>
                      <input
                        type="text"
                        value={singleFnName}
                        onChange={(e) => setSingleFnName(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-zinc-400">Associated Project Goal:</label>
                      <input
                        type="text"
                        value={singleGoal}
                        onChange={(e) => setSingleGoal(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200"
                      />
                    </div>
                  </div>
                )}

                {selectedAgent === "executor" && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono text-zinc-400">Python Pipeline Code to Verify & Repair:</label>
                    <textarea
                      value={singleCode}
                      onChange={(e) => setSingleCode(e.target.value)}
                      rows={5}
                      className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200 resize-none"
                    />
                  </div>
                )}

                {selectedAgent === "slicer" && (
                  <div className="space-y-1">
                    <label className="text-[11px] font-mono text-zinc-400">Project Goal to Slice into Build Steps & Blanks:</label>
                    <input
                      type="text"
                      value={singleGoal}
                      onChange={(e) => setSingleGoal(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200"
                    />
                  </div>
                )}

                {selectedAgent === "pedagogue" && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-zinc-400">Milestone Title:</label>
                      <input
                        type="text"
                        value={singleStepTitle}
                        onChange={(e) => setSingleStepTitle(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-zinc-400">Learner Interest for Analogy Grounding:</label>
                      <input
                        type="text"
                        value={singleInterests}
                        onChange={(e) => setSingleInterests(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200"
                      />
                    </div>
                  </div>
                )}

                {selectedAgent === "diagnostician" && (
                  <div className="space-y-3">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-zinc-400">Concept ID:</label>
                        <input
                          type="text"
                          value={singleConceptId}
                          onChange={(e) => setSingleConceptId(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-[11px] font-mono text-zinc-400">Error Traceback or Discrepancy:</label>
                        <input
                          type="text"
                          value={singleErrorTrace}
                          onChange={(e) => setSingleErrorTrace(e.target.value)}
                          className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200"
                        />
                      </div>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-zinc-400">Student Code:</label>
                      <textarea
                        value={singleStudentCode}
                        onChange={(e) => setSingleStudentCode(e.target.value)}
                        rows={3}
                        className="w-full p-2.5 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200 resize-none"
                      />
                    </div>
                  </div>
                )}

                {selectedAgent === "redteam" && (
                  <div className="space-y-2">
                    <label className="text-[11px] font-mono text-zinc-400">Model Python Code to Attack (Boundary Zeros, Outliers, OOD):</label>
                    <textarea
                      value={singleCode}
                      onChange={(e) => setSingleCode(e.target.value)}
                      rows={5}
                      className="w-full p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200 resize-none"
                    />
                  </div>
                )}

                {selectedAgent === "tutor" && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="md:col-span-2 space-y-1">
                      <label className="text-[11px] font-mono text-zinc-400">Learner Query:</label>
                      <input
                        type="text"
                        value={singleTutorQuery}
                        onChange={(e) => setSingleTutorQuery(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200"
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-[11px] font-mono text-zinc-400">Attempts Made (Lock &lt; 2):</label>
                      <input
                        type="number"
                        min={0}
                        max={10}
                        value={singleAttempts}
                        onChange={(e) => setSingleAttempts(parseInt(e.target.value) || 0)}
                        className="w-full px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 text-xs font-mono text-zinc-200"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* Agent Output Viewer */}
              <div className="p-4 rounded-xl border border-zinc-800 bg-zinc-950 space-y-3">
                <div className="flex items-center justify-between border-b border-zinc-800/80 pb-2">
                  <span className="text-xs font-mono uppercase text-zinc-400 tracking-wider">
                    {selectedAgent.toUpperCase()} Agent Output & Verification
                  </span>
                  <span className="text-[11px] font-mono text-zinc-500">Autonomous Result</span>
                </div>

                {/* Scoper Output */}
                {selectedAgent === "scoper" && scoperResult && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Tier {scoperResult.tier} {scoperResult.tier === "A" ? "(Browser WASM)" : "(Colab GPU)"}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                        Task: {scoperResult.spec.task.toUpperCase()}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                        Metric: {scoperResult.spec.metric} &gt;= {scoperResult.spec.threshold}
                      </span>
                    </div>
                    <p className="text-zinc-300 text-xs leading-relaxed">{scoperResult.rationale}</p>
                    <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1">
                      <span className="text-zinc-500 text-[11px]">Feature Schema:</span>
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {scoperResult.spec.schema.map((f, i) => (
                          <span key={i} className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-300 text-[11px]">
                            {f.name} ({f.type})
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Architect Output */}
                {selectedAgent === "architect" && architectResult && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded ${architectResult.isAcyclic ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-red-500/20 text-red-300"}`}>
                        {architectResult.isAcyclic ? "Acyclic DAG Verified (No Cycles)" : "Cyclic Dependency"}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                        {architectResult.functions.length} Modular Functions
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800/80 space-y-1.5">
                      <span className="text-zinc-500 text-[11px]">Topological Order:</span>
                      <div className="flex items-center gap-2 text-amber-300 text-xs overflow-x-auto py-1">
                        {architectResult.topologicalOrder.map((fn, idx) => (
                          <React.Fragment key={fn}>
                            <span className="px-2 py-0.5 rounded bg-zinc-800 border border-zinc-700">{fn}</span>
                            {idx < architectResult.topologicalOrder.length - 1 && <ArrowRight className="w-3 h-3 text-zinc-600 flex-shrink-0" />}
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Implementer Output */}
                {selectedAgent === "implementer" && implementerResult && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Verified Isolated Function: {implementerResult.signature}
                      </span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(implementerResult.code)}
                        className="text-xs text-zinc-400 hover:text-zinc-200 flex items-center gap-1 cursor-pointer"
                      >
                        {copiedCode ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>{copiedCode ? "Copied" : "Copy Code"}</span>
                      </button>
                    </div>
                    <pre className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                      {implementerResult.code}
                    </pre>
                  </div>
                )}

                {/* Executor Output */}
                {selectedAgent === "executor" && executorResult && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded ${executorResult.passed ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30" : "bg-red-500/20 text-red-300 border border-red-500/30"}`}>
                        {executorResult.passed ? "Passed Threshold" : "Threshold Failure"}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                        Achieved: {executorResult.achievedMetric} (Target: &gt;= {executorResult.threshold})
                      </span>
                    </div>
                    {executorResult.repairsApplied.length > 0 && (
                      <div className="p-2.5 rounded-lg bg-amber-950/20 border border-amber-500/30 text-amber-300 text-[11px]">
                        Repair Loops Applied: {executorResult.repairsApplied.join(", ")}
                      </div>
                    )}
                    <pre className="p-3 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-300 overflow-x-auto whitespace-pre-wrap max-h-36">
                      {executorResult.stdoutLogs || "Pyodide execution completed without errors."}
                    </pre>
                  </div>
                )}

                {/* Slicer Output */}
                {selectedAgent === "slicer" && slicerResult && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-300 border border-blue-500/30">
                        {slicerResult.steps.length} Progressive Build Steps
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                        {slicerResult.dag.nodes.length} Concept Nodes, {slicerResult.dag.edges.length} Branches
                      </span>
                    </div>
                    <div className="space-y-2 max-h-40 overflow-y-auto">
                      {slicerResult.steps.map((st, i) => (
                        <div key={st.id} className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 flex items-center justify-between">
                          <div>
                            <span className="text-amber-400 font-bold">{i + 1}. {st.title}</span>
                            <span className="text-zinc-500 text-[11px] block">{st.function}()</span>
                          </div>
                          <span className="px-2 py-0.5 rounded bg-zinc-800 text-zinc-400 text-[10px]">
                            {st.goldenValues?.length || 0} Golden Tests
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Pedagogue Output */}
                {selectedAgent === "pedagogue" && pedagogueResult && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1">
                      <span className="text-amber-400 font-bold text-[11px] uppercase">Curiosity Hook:</span>
                      <p className="text-zinc-200">{pedagogueResult.hook}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1">
                      <span className="text-blue-400 font-bold text-[11px] uppercase">Domain-Grounded Analogy:</span>
                      <p className="text-zinc-200">{pedagogueResult.analogy}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1.5">
                      <span className="text-emerald-400 font-bold text-[11px] uppercase">Check Question:</span>
                      <p className="text-zinc-300">{pedagogueResult.checkQuestion.prompt}</p>
                      <p className="text-zinc-500 text-[11px]">{pedagogueResult.checkQuestion.explanation}</p>
                    </div>
                  </div>
                )}

                {/* Diagnostician Output */}
                {selectedAgent === "diagnostician" && diagnosticianResult && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30 font-bold">
                        Taxonomy: {diagnosticianResult.errorType}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-300 border border-zinc-800">
                        Repair Strategy: {diagnosticianResult.strategy.toUpperCase()}
                      </span>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1">
                      <span className="text-zinc-500 text-[11px]">Diagnosis:</span>
                      <p className="text-zinc-200">{diagnosticianResult.diagnosis}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1">
                      <span className="text-zinc-500 text-[11px]">Numeric / Traceback Evidence:</span>
                      <p className="text-amber-300">{diagnosticianResult.evidence}</p>
                    </div>
                    <div className="p-3 rounded-lg bg-purple-950/20 border border-purple-500/30 text-purple-200">
                      {diagnosticianResult.matchedExplanation}
                    </div>
                  </div>
                )}

                {/* Red-Team Output */}
                {selectedAgent === "redteam" && redteamResult && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex items-center justify-between">
                      <span className="px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30 font-bold">
                        4 Adversarial Scenarios Evaluated
                      </span>
                      <span className="text-zinc-400">
                        Safe: {redteamResult.filter((r) => r.status === "safe").length}/4
                      </span>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                      {redteamResult.map((res) => (
                        <div key={res.id} className="p-2.5 rounded-lg bg-zinc-900/60 border border-zinc-800 space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-zinc-200 font-bold text-[11px]">{res.scenarioName}</span>
                            <span className={`text-[10px] px-1.5 py-0.5 rounded ${res.status === "safe" ? "bg-emerald-950 text-emerald-300 border border-emerald-600/30" : "bg-red-950 text-red-300 border border-red-600/30"}`}>
                              {res.status}
                            </span>
                          </div>
                          <p className="text-zinc-400 text-[11px] leading-relaxed">{res.analysis}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tutor Output */}
                {selectedAgent === "tutor" && tutorResult && (
                  <div className="space-y-3 font-mono text-xs">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                        Strategy: {tutorResult.strategy}
                      </span>
                      <span className="px-2 py-0.5 rounded bg-zinc-900 text-zinc-400 border border-zinc-800">
                        Attempt-First Protocol Enforced
                      </span>
                    </div>
                    <div className="p-3.5 rounded-lg bg-zinc-900 border border-zinc-800 text-zinc-200 leading-relaxed">
                      {tutorResult.response}
                    </div>
                  </div>
                )}

                {/* Default prompt when no output is yet generated */}
                {!scoperResult && !architectResult && !implementerResult && !executorResult && !slicerResult && !pedagogueResult && !diagnosticianResult && !redteamResult && !tutorResult && (
                  <div className="p-6 text-center text-zinc-500 font-mono text-xs">
                    Click &quot;Run {selectedAgent.toUpperCase()}&quot; above to dispatch the agent on this task.
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 border-t border-zinc-800 bg-zinc-950 flex items-center justify-between flex-shrink-0">
          <span className="text-xs font-mono text-zinc-500">
            Socrates v2 Autonomous Multi-Agent Framework
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono transition-colors cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
