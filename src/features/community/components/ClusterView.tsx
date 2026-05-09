"use client";

import { useMemo } from "react";
import type { MockCommunityGraph } from "@/features/community/mock";

type Props = { graph: MockCommunityGraph };

function clusterKey(role: string) {
  const lower = role.toLowerCase();
  if (lower.includes("ông") || lower.includes("bà")) return "Thế hệ ông bà";
  if (lower.includes("bố") || lower.includes("mẹ") || lower.includes("manager") || lower.includes("head")) return "Nhóm quản lý / cha mẹ";
  if (lower.includes("con") || lower.includes("em") || lower.includes("designer") || lower.includes("dev") || lower.includes("analyst")) return "Thành viên chính";
  return "Nhóm khác";
}

export default function ClusterView({ graph }: Props) {
  const groups = useMemo(() => {
    const map = new Map<string, typeof graph.people>();
    for (const person of graph.people) {
      const key = clusterKey(person.role);
      const list = map.get(key) ?? [];
      list.push(person);
      map.set(key, list);
    }
    return Array.from(map.entries());
  }, [graph.people]);

  return (
    <div className="h-[540px] overflow-auto rounded-2xl border border-slate-200 bg-white p-4">
      <div className="grid gap-3 sm:grid-cols-2">
        {groups.map(([key, people]) => (
          <div key={key} className="rounded-2xl border border-slate-200 bg-slate-50 p-3">
            <p className="mb-2 text-sm font-semibold text-slate-800">{key}</p>
            <div className="space-y-1">
              {people.map((person) => (
                <div key={person.id} className="rounded-lg border border-white bg-white px-2 py-1.5">
                  <p className="text-xs font-semibold">{person.name}</p>
                  <p className="text-[11px] text-slate-500">{person.role} • {person.age} tuổi</p>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
