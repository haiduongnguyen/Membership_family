import { Background, Controls, MiniMap, ReactFlow, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

type Props = {
  nodes: Node[];
  edges: Edge[];
  highlightedEdgeIds?: Set<string>;
};

export default function RelationshipGraph({ nodes, edges, highlightedEdgeIds }: Props) {
  const styledEdges = edges.map((edge) => {
    const highlighted = highlightedEdgeIds?.has(edge.id);
    return {
      ...edge,
      animated: Boolean(highlighted),
      style: highlighted
        ? { stroke: "#0891b2", strokeWidth: 2.5 }
        : { stroke: "#94a3b8", strokeWidth: 1.2 },
      labelStyle: highlighted ? { fill: "#0e7490", fontWeight: 700 } : { fill: "#475569" },
    };
  });

  return (
    <div className="h-[70vh]">
      <ReactFlow fitView nodes={nodes} edges={styledEdges}>
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
