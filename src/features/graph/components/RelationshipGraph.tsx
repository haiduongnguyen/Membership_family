import {
  Background,
  Controls,
  MiniMap,
  ReactFlow,
  type Connection,
  type Edge,
  type EdgeMouseHandler,
  type Node,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

type Props = {
  nodes: Node[];
  edges: Edge[];
  highlightedEdgeIds?: Set<string>;
  compactMode?: boolean;
  onConnectNodes?: (connection: Connection) => void;
  onNodePositionChange?: (nodeId: string, position: { x: number; y: number }) => void;
  onEdgeSelect?: (edgeId: string) => void;
};

const EDGE_THEME: Record<string, { color: string; width?: number; dashed?: boolean }> = {
  father: { color: "#0284c7", width: 1.8 },
  mother: { color: "#0284c7", width: 1.8 },
  child: { color: "#0284c7", width: 1.8 },
  grandparent: { color: "#0369a1", width: 1.8 },
  sibling: { color: "#0ea5e9", width: 1.6 },
  uncle_aunt: { color: "#0ea5e9", width: 1.6 },
  cousin: { color: "#38bdf8", width: 1.6 },
  spouse: { color: "#db2777", width: 2.0 },
  manager: { color: "#7c3aed", width: 1.8 },
  employee: { color: "#7c3aed", width: 1.8 },
  colleague: { color: "#8b5cf6", width: 1.6, dashed: true },
  friend: { color: "#16a34a", width: 1.6, dashed: true },
};

export default function RelationshipGraph({
  nodes,
  edges,
  highlightedEdgeIds,
  compactMode,
  onConnectNodes,
  onNodePositionChange,
  onEdgeSelect,
}: Props) {
  const styledEdges = edges.map((edge) => {
    const relationType = (edge.data as { relationType?: string } | undefined)?.relationType ?? "";
    const theme = EDGE_THEME[relationType] ?? { color: "#94a3b8", width: 1.4 };
    const highlighted = highlightedEdgeIds?.has(edge.id);
    return {
      ...edge,
      type: "smoothstep",
      pathOptions: { borderRadius: 16 },
      animated: Boolean(highlighted),
      style: highlighted
        ? { stroke: "#0891b2", strokeWidth: 2.8 }
        : {
            stroke: theme.color,
            strokeWidth: theme.width ?? 1.4,
            strokeDasharray: theme.dashed ? "6 4" : undefined,
            opacity: 0.95,
          },
      labelStyle: highlighted ? { fill: "#0e7490", fontWeight: 700 } : { fill: "#334155" },
      interactionWidth: 26,
    };
  });

  const handleEdgeClick: EdgeMouseHandler = (_, edge) => {
    onEdgeSelect?.(edge.id);
  };

  return (
    <div className={compactMode ? "h-[62vh]" : "h-[70vh]"}>
      <ReactFlow
        fitView
        nodes={nodes}
        edges={styledEdges}
        onConnect={onConnectNodes}
        onEdgeClick={handleEdgeClick}
        onNodeDragStop={(_, node) => onNodePositionChange?.(node.id, node.position)}
      >
        {!compactMode && <MiniMap />}
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
