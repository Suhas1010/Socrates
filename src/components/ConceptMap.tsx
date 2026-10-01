"use client";

import React, { useMemo } from "react";
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  Node,
  Edge,
  MarkerType,
} from "@xyflow/react";
import { useSessionStore } from "@/lib/store";
import { CustomConceptNode } from "./CustomConceptNode";

const nodeTypes = {
  conceptNode: CustomConceptNode,
};

export const ConceptMap: React.FC<{
  interactive?: boolean;
  className?: string;
}> = ({ interactive = true, className = "h-full w-full" }) => {
  const {
    concepts,
    edges,
    status,
    mastery,
    currentConceptId,
    highlightedEdge,
    selectConcept,
  } = useSessionStore();

  // Layout concepts in a structured DAG flow
  const nodes: Node[] = useMemo(() => {
    return concepts.map((concept, index) => {
      // 2 columns or horizontal layout
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
    }
  };

  return (
    <div className={`relative ${className} bg-[#080B11] rounded-2xl overflow-hidden border border-white/10`}>
      <ReactFlow
        nodes={nodes}
        edges={flowEdges}
        nodeTypes={nodeTypes}
        onNodeClick={onNodeClick}
        fitView
        fitViewOptions={{ padding: 0.2 }}
        minZoom={0.5}
        maxZoom={1.5}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          color="#1F2937"
          gap={20}
          size={1}
          variant={BackgroundVariant.Dots}
        />
        <Controls
          className="!bg-zinc-900/90 !border-white/10 !fill-zinc-300"
          showInteractive={false}
        />
        <MiniMap
          nodeColor={(n) => {
            const nodeData = n.data as any;
            if (nodeData.status === "mastered") return "#10B981";
            if (nodeData.status === "shaky") return "#EF4444";
            if (nodeData.status === "learning") return "#F59E0B";
            return "#374151";
          }}
          className="!bg-zinc-950/90 !border-white/10 !rounded-lg"
          maskColor="rgba(0, 0, 0, 0.65)"
        />
      </ReactFlow>

      {/* Weak-prerequisite alert banner */}
      {highlightedEdge && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 bg-red-950/90 border border-red-500/80 px-4 py-1.5 rounded-full text-xs font-medium text-red-200 shadow-lg shadow-red-950/50 flex items-center gap-2 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-red-400 animate-ping" />
          Weak prerequisite detected! Traced back to rebuild foundation.
        </div>
      )}
    </div>
  );
};
