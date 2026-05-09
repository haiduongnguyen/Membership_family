"use client";

import type { MockCommunityGraph } from "@/features/community/mock";

type Props = { graph: MockCommunityGraph };

export default function RadialView({ graph }: Props) {
  const center = graph.people.find((p) => p.role.toLowerCase().includes("bản thân") || p.name === "Tôi") ?? graph.people[0];
  const others = graph.people.filter((p) => p.id !== center.id);

  return (
    <div className="h-[540px] rounded-2xl border border-slate-200 bg-white p-4">
      <div className="relative mx-auto mt-4 h-[480px] max-w-[520px] rounded-full border border-dashed border-slate-300">
        <div className="absolute left-1/2 top-1/2 z-20 grid h-24 w-24 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full border-4 border-cyan-200 bg-cyan-50 text-center">
          <p className="text-sm font-semibold">{center.name}</p>
          <p className="text-xs text-slate-500">{center.role}</p>
        </div>

        {others.map((person, idx) => {
          const angle = (idx / Math.max(others.length, 1)) * Math.PI * 2;
          const r = idx % 2 === 0 ? 180 : 220;
          const x = 260 + Math.cos(angle) * r;
          const y = 240 + Math.sin(angle) * r;
          return (
            <div
              key={person.id}
              className="absolute grid w-32 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-xl border border-slate-200 bg-white p-2 text-center shadow-sm"
              style={{ left: x, top: y }}
            >
              <p className="text-xs font-semibold">{person.name}</p>
              <p className="text-[11px] text-slate-500">{person.role}</p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
