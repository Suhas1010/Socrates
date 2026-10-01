"use client";

import React from "react";
import { Handle, Position } from "@xyflow/react";
import { CheckCircle2, AlertTriangle, PlayCircle, Circle, Sparkles } from "lucide-react";
import { ConceptStatus } from "@/lib/types";

export interface CustomNodeData {
  id: string;
  title: string;
  difficulty: number;
  status: ConceptStatus;
  masteryScore: number;
  isActive: boolean;
  isWeakPrereq?: boolean;
}

export const CustomConceptNode: React.FC<{ data: CustomNodeData }> = ({ data }) => {
  const { title, difficulty, status, masteryScore, isActive, isWeakPrereq } = data;

  // Status visual configurations
  let statusBg = "bg-zinc-900/90 border-zinc-700/80 text-zinc-300";
  let statusGlow = "";
  let statusIcon = <Circle className="w-3.5 h-3.5 text-zinc-400" />;
  let statusBadge = "Not Started";
  let statusBadgeColor = "bg-zinc-800 text-zinc-400 border-zinc-700";

  if (status === "mastered") {
    statusBg = "bg-emerald-950/40 border-emerald-500/80 text-emerald-100";
    statusGlow = "shadow-[0_0_20px_-3px_rgba(16,185,129,0.35)]";
    statusIcon = <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />;
    statusBadge = "Mastered";
    statusBadgeColor = "bg-emerald-900/60 text-emerald-300 border-emerald-600/60";
  } else if (status === "shaky" || isWeakPrereq) {
    statusBg = "bg-red-950/40 border-red-500/80 text-red-100 animate-pulse";
    statusGlow = "shadow-[0_0_20px_-3px_rgba(239,68,68,0.4)]";
    statusIcon = <AlertTriangle className="w-3.5 h-3.5 text-red-400" />;
    statusBadge = "Needs Review";
    statusBadgeColor = "bg-red-900/60 text-red-300 border-red-600/60";
  } else if (status === "learning" || isActive) {
    statusBg = "bg-amber-950/40 border-amber-500/80 text-amber-100";
    statusGlow = "shadow-[0_0_20px_-3px_rgba(245,158,11,0.35)]";
    statusIcon = <PlayCircle className="w-3.5 h-3.5 text-amber-400 animate-pulse" />;
    statusBadge = "In Progress";
    statusBadgeColor = "bg-amber-900/60 text-amber-300 border-amber-600/60";
  }

  const activeRing = isActive
    ? "ring-2 ring-amber-400 ring-offset-2 ring-offset-[#080B11] scale-[1.03]"
    : "";

  return (
    <div
      className={`concept-node relative px-3.5 py-3 rounded-xl border backdrop-blur-md min-w-[210px] max-w-[240px] cursor-pointer transition-all duration-300 ${statusBg} ${statusGlow} ${activeRing}`}
    >
      <Handle
        type="target"
        position={Position.Left}
        className="!bg-amber-400 !w-2 !h-2 !border-2 !border-[#080B11]"
      />

      <div className="flex items-center justify-between gap-1.5 mb-1.5">
        <div className="flex items-center gap-1.5">
          {statusIcon}
          <span
            className={`text-[10px] font-medium tracking-wide uppercase px-1.5 py-0.5 rounded border ${statusBadgeColor}`}
          >
            {statusBadge}
          </span>
        </div>
        <span className="text-[10px] text-zinc-400 font-mono">
          Lv.{difficulty}
        </span>
      </div>

      <div className="text-xs font-semibold leading-tight tracking-tight line-clamp-2 mb-2">
        {title}
      </div>

      {/* Progress meter */}
      <div className="w-full bg-zinc-950/80 rounded-full h-1.5 overflow-hidden border border-white/5">
        <div
          className={`h-full transition-all duration-500 rounded-full ${
            status === "mastered"
              ? "bg-emerald-400"
              : status === "shaky"
              ? "bg-red-400"
              : "bg-amber-400"
          }`}
          style={{ width: `${Math.round(masteryScore * 100)}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-[9px] text-zinc-400 mt-1 font-mono">
        <span>Mastery</span>
        <span>{Math.round(masteryScore * 100)}%</span>
      </div>

      <Handle
        type="source"
        position={Position.Right}
        className="!bg-amber-400 !w-2 !h-2 !border-2 !border-[#080B11]"
      />
    </div>
  );
};
