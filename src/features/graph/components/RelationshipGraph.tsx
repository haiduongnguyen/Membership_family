import { Background, Controls, MiniMap, ReactFlow, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";

type Props = {
  nodes: Node[];
  edges: Edge[];
};

export default function RelationshipGraph({ nodes, edges }: Props) {
  return (
    <div className="h-[70vh]">
      <ReactFlow fitView nodes={nodes} edges={edges}>
        <MiniMap />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
