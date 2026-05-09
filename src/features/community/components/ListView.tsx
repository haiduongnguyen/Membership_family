"use client";

import type { MockCommunityGraph } from "@/features/community/mock";

type Props = { graph: MockCommunityGraph };

export default function ListView({ graph }: Props) {
  return (
    <div className="h-[540px] overflow-auto rounded-2xl border border-slate-200 bg-white p-3">
      <table className="w-full text-left text-sm">
        <thead>
          <tr className="border-b border-slate-200 text-slate-600">
            <th className="px-2 py-2">Họ tên</th>
            <th className="px-2 py-2">Vai trò</th>
            <th className="px-2 py-2">Tuổi</th>
            <th className="px-2 py-2">Thế hệ</th>
          </tr>
        </thead>
        <tbody>
          {graph.people.map((person) => (
            <tr key={person.id} className="border-b border-slate-100 hover:bg-slate-50">
              <td className="px-2 py-2 font-medium">{person.name}</td>
              <td className="px-2 py-2 text-slate-600">{person.role}</td>
              <td className="px-2 py-2">{person.age}</td>
              <td className="px-2 py-2">{person.generation}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
