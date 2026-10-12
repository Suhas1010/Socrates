"use client";

import React, { useMemo, useState, useEffect } from "react";
import {
  ReactFlow,
  Controls,
  Background,
  BackgroundVariant,
  Node,
  Edge,
  MarkerType,
} from "@xyflow/react";
import { Maximize2, Minimize2, X, Info } from "lucide-react";
import { useSessionStore } from "@/lib/store";
import { CustomConceptNode } from "./CustomConceptNode";

const nodeTypes = {
  conceptNode: CustomConceptNode,
};

export const ConceptMap: React.FC<{
  interactive?: boolean;
  className?: string;
  allowExpand?: boolean;
}> = ({ interactive = true, className = "h-full w-full", allowExpand = true }) => {
  const {
    concepts,
    edges,
    status,
    mastery,
    currentConceptId,
    highlightedEdge,
    selectConcept,
  } = useSessionStore();

  const [isFullscreen, setIsFullscreen] = useState(false);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isFullscreen) {
        setIsFullscreen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen]);

  // Layout concepts in a structured DAG flow
  const nodes: Node[] = useMemo(() => {
    return concepts.map((concept, index) => {
      const col = index % 2;
      const row = Math.floor(index / 2);
      const x = 50 + col * 280;
      const y = 40 + row * 130;

      return {
        id: concept.id,
        type: "conceptNode",
        position: { x, y },
        data: {
          id: concept.id,
          title: concept.title,
          difficulty: concept.difficulty,
          status: status[concept.id] || "unseen",
          masteryScore: mastery[concept.id] || 0,
          isActive: currentConceptId === concept.id,
          isWeakPrereq: status[concept.id] === "shaky",
        },
      };
    });
  }, [concepts, status, mastery, currentConceptId]);

  const flowEdges: Edge[] = useMemo(() => {
    return edges.map((edge) => {
      const isHighlighted =
        highlightedEdge?.from === edge.from && highlightedEdge?.to === edge.to;

      return {
        id: `e-${edge.from}-${edge.to}`,
        source: edge.from,
        target: edge.to,
        animated: isHighlighted,
        style: {
          stroke: isHighlighted ? "#EF4444" : "#4B5563",
          strokeWidth: isHighlighted ? 3 : 1.5,
          strokeDasharray: isHighlighted ? "5,5" : undefined,
        },
        markerEnd: {
          type: MarkerType.ArrowClosed,
          color: isHighlighted ? "#EF4444" : "#4B5563",
          width: 14,
          height: 14,
        },
      };
    });
  }, [edges, highlightedEdge]);

  const onNodeClick = (_: any, node: Node) => {
    if (interactive) {
      selectConcept(node.id);
      if (isFullscreen) {
        setIsFullscreen(false);
      }
    }
  };

  const renderFlowContent = (isModal: boolean = false) => (
    <div className={`relative h-full w-full bg-[#090b10] ${isModal ? "" : "rounded-xl overflow-hidden border border-zinc-800"}`}>
      <ReactFlow
        nodes={nodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.25 }}
        minZoom={0.4}
        maxZoom={1.6}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="#27272a"
          gap={24}
          size={1}
          variant={BackgroundVariant.Dots}
        />
        <Controls
          className="!bg-zinc-900/90 !border-zinc-800 !fill-zinc-300"
          showInteractive={false}
        />
      </ReactFlow>

      {/* Expand / Collapse Button */}
      {allowExpand && !isModal && (
        <button
          onClick={() => setIsFullscreen(true)}
          className="absolute top-3 right-3 p-1.5 rounded-lg bg-zinc-900/90 hover:bg-zinc-800 border border-zinc-700/80 text-zinc-300 hover:text-white transition-colors z-10 flex items-center gap-1.5 text-xs font-mono"
          title="Expand Flowchart to Fullscreen"
          aria-label="Expand Flowchart to Fullscreen"
        >
          <Maximize2 className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Expand</span>
        </button>
      )}

      {/* Weak-prerequisite alert banner */}
      {highlightedEdge && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-red-950/90 border border-red-500/80 px-3.5 py-1.5 rounded-lg text-xs font-medium text-red-200 shadow-md flex items-center gap-2 z-10">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-pulse" />
          Weak prerequisite detected. Rerouted to rebuild foundation.
        </div>
      )}
    </div>
  );

  return (
    <>
      <div className={`relative ${className}`}>
        {renderFlowContent(false)}
      </div>

      {/* Fullscreen Flowchart Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-[#090b10] flex flex-col">
          <div className="h-14 border-b border-zinc-800 px-6 flex items-center justify-between bg-zinc-950/80 flex-shrink-0">
            <div className="flex items-center gap-3">
              <span className="font-semibold text-sm text-zinc-100 font-mono">
                Project Prerequisite Graph ({concepts.length} Nodes)
              </span>
              <span className="text-xs text-zinc-400 hidden sm:inline">
                Click any step to inspect or jump directly
              </span>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsFullscreen(false)}
                className="px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-mono flex items-center gap-1.5 border border-zinc-700 transition-colors"
              >
                <Minimize2 className="w-3.5 h-3.5" />
                <span>Exit Fullscreen (Esc)</span>
              </button>
            </div>
          </div>
          <div className="flex-1 w-full h-full relative">
            {renderFlowContent(true)}
          </div>
        </div>
      )}
    </>
  );
};
