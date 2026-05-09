"use client";

import type { MockCommunityGraph } from "@/features/community/mock";

type Props = { graph: MockCommunityGraph };

export default function TimelineView({ graph }: Props) {
  const items = graph.timeline.slice().sort((a, b) => a.date.localeCompare(b.date));

  return (
    <div className="h-[540px] overflow-auto rounded-2xl border border-slate-200 bg-white p-4">
      <div className="relative ml-4 border-l-2 border-cyan-200 pl-6">
        {items.map((item) => (
          <div key={item.id} className="relative mb-6">
            <span className="absolute -left-[34px] top-1.5 h-3 w-3 rounded-full bg-cyan-500" />
            <p className="text-xs text-slate-500">{item.date}</p>
            <p className="text-sm font-semibold text-slate-900">{item.title}</p>
            <p className="text-xs text-slate-600">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
