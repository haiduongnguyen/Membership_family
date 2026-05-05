import { Background, Controls, MiniMap, ReactFlow, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

type Props = {
  nodes: Node[];
  edges: Edge[];
  highlightedEdgeIds?: Set<string>;
  compactMode?: boolean;
};

function edgeColorByType(relationType: string | undefined) {
  if (!relationType) return "#94a3b8";
  if (["father", "mother", "child", "grandparent", "sibling", "uncle_aunt", "cousin"].includes(relationType)) return "#0284c7";
  if (["spouse"].includes(relationType)) return "#db2777";
  if (["manager", "employee", "colleague"].includes(relationType)) return "#7c3aed";
  if (["friend"].includes(relationType)) return "#16a34a";
  return "#94a3b8";
}

export default function RelationshipGraph({ nodes, edges, highlightedEdgeIds, compactMode }: Props) {
  const styledEdges = edges.map((edge) => {
    const relationType = (edge.data as { relationType?: string } | undefined)?.relationType;
    const baseColor = edgeColorByType(relationType);
    const highlighted = highlightedEdgeIds?.has(edge.id);
    return {
      ...edge,
      animated: Boolean(highlighted),
      style: highlighted
        ? { stroke: "#0891b2", strokeWidth: 2.5 }
        : { stroke: baseColor, strokeWidth: 1.4 },
      labelStyle: highlighted ? { fill: "#0e7490", fontWeight: 700 } : { fill: "#475569" },
    };
  });

  return (
    <div className={compactMode ? "h-[62vh]" : "h-[70vh]"}>
      <ReactFlow fitView nodes={nodes} edges={styledEdges}>
        {!compactMode && <MiniMap />}
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
