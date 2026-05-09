"use client";

import { useMemo, useState } from "react";
import { Background, Controls, Handle, MiniMap, Position, ReactFlow, type Edge, type Node } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import type { MockCommunityGraph } from "@/features/community/mock";

const EDGE_STYLE = {
  blood: { color: "#0284c7", width: 2 },
  marriage: { color: "#db2777", width: 2.2 },
  social: { color: "#16a34a", width: 1.8, dash: "6 4" },
  work: { color: "#7c3aed", width: 1.8 },
} as const;

function initials(name: string) {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return "?";
  return (parts[0][0] + (parts.length > 1 ? parts[parts.length - 1][0] : "")).toUpperCase();
}

type Props = {
  graph: MockCommunityGraph;
};

export default function StoryMapCanvas({ graph }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const nodes = useMemo<Node[]>(() => {
    const rows = new Map<number, typeof graph.people>();
    for (const person of graph.people) {
      const list = rows.get(person.generation) ?? [];
      list.push(person);
      rows.set(person.generation, list);
    }

    const generations = Array.from(rows.keys()).sort((a, b) => b - a);
    const top = generations[0] ?? 0;

    const result: Node[] = [];
    for (const generation of generations) {
      const row = (rows.get(generation) ?? []).slice().sort((a, b) => a.name.localeCompare(b.name, "vi"));
      row.forEach((person, index) => {
        const isSelected = selectedId === person.id;
        result.push({
          id: person.id,
          position: { x: index * 260, y: (top - generation) * 190 },
          data: {
            label: (
              <div
                className={`relative w-56 rounded-2xl border bg-white px-3 py-2 shadow-sm transition ${
                  isSelected ? "border-cyan-500 ring-2 ring-cyan-100" : "border-slate-200"
                }`}
                onClick={() => setSelectedId(person.id)}
              >
                <Handle type="target" position={Position.Top} className="!left-1/2 !top-0 !h-2.5 !w-2.5 !-translate-x-1/2 !border !border-cyan-600 !bg-white" />
                <Handle type="source" position={Position.Bottom} className="!bottom-0 !left-1/2 !h-2.5 !w-2.5 !-translate-x-1/2 !border !border-cyan-600 !bg-cyan-500" />
                <div className="flex items-center gap-2">
                  <div className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-cyan-100 to-blue-100 text-xs font-bold text-cyan-700">
                    {initials(person.name)}
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{person.name}</p>
                    <p className="truncate text-xs text-slate-500">{person.age} tuổi • {person.role}</p>
                  </div>
                </div>
              </div>
            ),
          },
        });
      });
    }
    return result;
  }, [graph.people, selectedId]);

  const edges = useMemo<Edge[]>(() => {
    return graph.links.map((link) => {
      const theme = EDGE_STYLE[link.relation];
      return {
        id: link.id,
        source: link.source,
        target: link.target,
        sourceHandle: null,
        targetHandle: null,
        type: "smoothstep",
        pathOptions: { borderRadius: 16 },
        label: link.label,
        style: {
          stroke: theme.color,
          strokeWidth: theme.width,
          strokeDasharray: "dash" in theme ? theme.dash : undefined,
          opacity: 0.95,
        },
        labelStyle: { fill: "#334155", fontWeight: 600 },
        interactionWidth: 24,
      };
    });
  }, [graph.links]);

  return (
    <div className="h-[540px] rounded-2xl border border-slate-200 bg-white">
      <ReactFlow fitView nodes={nodes} edges={edges}>
        <MiniMap pannable zoomable />
        <Controls />
        <Background />
      </ReactFlow>
    </div>
  );
}
