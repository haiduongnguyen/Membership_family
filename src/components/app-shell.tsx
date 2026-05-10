"use client";

import { useMemo, useState } from "react";
import { Archive, Bell, Building2, CalendarDays, Plus, Search, Settings, Users } from "lucide-react";
import AuthForm from "@/features/auth/components/AuthForm";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { hasSupabaseEnv, supabase } from "@/lib/supabase";
import { getMockCommunityGraph } from "@/features/community/mock";
import StoryMapCanvas from "@/features/community/components/StoryMapCanvas";
import RadialView from "@/features/community/components/RadialView";
import ListView from "@/features/community/components/ListView";
import TimelineView from "@/features/community/components/TimelineView";
import ClusterView from "@/features/community/components/ClusterView";
import type { MockCommunityGraph, MockPerson } from "@/features/community/mock";

type CommunityType = "family" | "company" | "friends" | "clan" | "other";
type CommunityStatus = "active" | "archived";

type Community = {
  id: string;
  name: string;
  type: CommunityType;
  description: string;
  members: number;
  events: number;
  updatedAt: string;
  status: CommunityStatus;
  cover: string;
};

type HubTab = "all" | CommunityType | "archived";
type ViewMode = "tree" | "radial" | "list" | "timeline" | "cluster";
type PersonFormState = { id?: string; name: string; role: string; age: string; generation: string };
type LinkFormState = {
  id?: string;
  source: string;
  target: string;
  relation: "blood" | "marriage" | "social" | "work";
  label: string;
};

const MOCK_COMMUNITIES: Community[] = [
  {
    id: "c1",
    name: "Gia đình nhỏ",
    type: "family",
    description: "Gia đình gần và các dịp sinh nhật hàng năm.",
    members: 24,
    events: 8,
    updatedAt: "Hôm nay",
    status: "active",
    cover: "from-cyan-400 via-sky-400 to-blue-500",
  },
  {
    id: "c2",
    name: "Dòng họ nội",
    type: "clan",
    description: "Nhánh bên nội và lịch giỗ, lễ Tết.",
    members: 116,
    events: 34,
    updatedAt: "2 ngày trước",
    status: "active",
    cover: "from-emerald-400 via-teal-400 to-cyan-500",
  },
  {
    id: "c3",
    name: "Bạn đại học",
    type: "friends",
    description: "Nhóm bạn thân, du lịch và họp lớp.",
    members: 19,
    events: 12,
    updatedAt: "5 ngày trước",
    status: "active",
    cover: "from-orange-400 via-rose-400 to-pink-500",
  },
  {
    id: "c4",
    name: "Công ty A - Team Product",
    type: "company",
    description: "Cơ cấu team và các mốc dự án.",
    members: 47,
    events: 21,
    updatedAt: "Hôm qua",
    status: "active",
    cover: "from-violet-400 via-indigo-400 to-blue-500",
  },
  {
    id: "c5",
    name: "Nhóm cũ đã lưu trữ",
    type: "other",
    description: "Tạm ẩn khỏi danh sách chính.",
    members: 10,
    events: 2,
    updatedAt: "1 tháng trước",
    status: "archived",
    cover: "from-slate-400 via-slate-500 to-slate-600",
  },
];

function typeLabel(type: CommunityType) {
  if (type === "family") return "Gia đình";
  if (type === "company") return "Công ty";
  if (type === "friends") return "Bạn bè";
  if (type === "clan") return "Dòng họ";
  return "Nhóm khác";
}

function tabLabel(tab: HubTab) {
  if (tab === "all") return "Tất cả";
  if (tab === "archived") return "Đã lưu trữ";
  return typeLabel(tab);
}

function cloneGraph(graph: MockCommunityGraph): MockCommunityGraph {
  return {
    people: graph.people.map((p) => ({ ...p })),
    links: graph.links.map((l) => ({ ...l })),
    timeline: graph.timeline.map((t) => ({ ...t })),
  };
}

export default function AppShell() {
  if (!hasSupabaseEnv || !supabase) {
    return (
      <main className="grid min-h-screen place-items-center p-6 text-slate-800">
        <div className="rounded-2xl border border-rose-200 bg-rose-50 px-5 py-4 text-center text-sm">
          Thiếu cấu hình Supabase. Vui lòng cập nhật file <code>.env.local</code>.
        </div>
      </main>
    );
  }

  const sb = supabase;
  const { userId, loading: isAuthLoading, message: authMessage, error: authError, login, register, logout } = useAuth(sb);

  const [query, setQuery] = useState("");
  const [tab, setTab] = useState<HubTab>("all");
  const [viewMode, setViewMode] = useState<ViewMode>("tree");
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isMembersExpanded, setIsMembersExpanded] = useState(false);
  const [isLinksExpanded, setIsLinksExpanded] = useState(false);
  const [communities, setCommunities] = useState<Community[]>(MOCK_COMMUNITIES);
  const [communityGraphs, setCommunityGraphs] = useState<Record<string, MockCommunityGraph>>(
    () =>
      MOCK_COMMUNITIES.reduce<Record<string, MockCommunityGraph>>((acc, community) => {
        acc[community.id] = cloneGraph(getMockCommunityGraph(community.type));
        return acc;
      }, {}),
  );
  const [activeCommunityId, setActiveCommunityId] = useState<string | null>(MOCK_COMMUNITIES[0]?.id ?? null);
  const [personForm, setPersonForm] = useState<PersonFormState | null>(null);
  const [linkForm, setLinkForm] = useState<LinkFormState | null>(null);

  const filteredCommunities = useMemo(() => {
    const q = query.trim().toLowerCase();
    return communities.filter((community) => {
      const matchText = !q || community.name.toLowerCase().includes(q) || community.description.toLowerCase().includes(q);
      const matchTab =
        tab === "all"
          ? community.status === "active"
          : tab === "archived"
            ? community.status === "archived"
            : community.type === tab && community.status === "active";
      return matchText && matchTab;
    });
  }, [communities, query, tab]);

  const activeCommunity = communities.find((community) => community.id === activeCommunityId) ?? null;
  const activeGraph = useMemo(() => {
    if (!activeCommunity) return null;
    return communityGraphs[activeCommunity.id] ?? null;
  }, [activeCommunity, communityGraphs]);

  function openCreatePerson() {
    setPersonForm({ name: "", role: "", age: "", generation: "1" });
  }

  function openEditPerson(person: MockPerson) {
    setPersonForm({
      id: person.id,
      name: person.name,
      role: person.role,
      age: String(person.age),
      generation: String(person.generation),
    });
  }

  function savePerson() {
    if (!activeCommunity || !personForm) return;
    const name = personForm.name.trim();
    const role = personForm.role.trim();
    const age = Number(personForm.age);
    const generation = Number(personForm.generation);
    if (!name || !role || Number.isNaN(age) || Number.isNaN(generation)) return;

    setCommunityGraphs((prev) => {
      const graph = prev[activeCommunity.id];
      if (!graph) return prev;
      if (personForm.id) {
        return {
          ...prev,
          [activeCommunity.id]: {
            ...graph,
            people: graph.people.map((p) =>
              p.id === personForm.id ? { ...p, name, role, age, generation } : p,
            ),
          },
        };
      }
      const nextPerson: MockPerson = {
        id: crypto.randomUUID(),
        name,
        role,
        age,
        generation,
      };
      return {
        ...prev,
        [activeCommunity.id]: {
          ...graph,
          people: [...graph.people, nextPerson],
        },
      };
    });
    setCommunities((prev) =>
      prev.map((community) =>
        community.id === activeCommunity.id
          ? { ...community, members: community.members + (personForm.id ? 0 : 1), updatedAt: "Vừa cập nhật" }
          : community,
      ),
    );
    setPersonForm(null);
  }

  function removePerson(personId: string) {
    if (!activeCommunity) return;
    setCommunityGraphs((prev) => {
      const graph = prev[activeCommunity.id];
      if (!graph) return prev;
      return {
        ...prev,
        [activeCommunity.id]: {
          ...graph,
          people: graph.people.filter((p) => p.id !== personId),
          links: graph.links.filter((l) => l.source !== personId && l.target !== personId),
        },
      };
    });
    setCommunities((prev) =>
      prev.map((community) =>
        community.id === activeCommunity.id
          ? { ...community, members: Math.max(0, community.members - 1), updatedAt: "Vừa cập nhật" }
          : community,
      ),
    );
  }

  function openCreateLink() {
    if (!activeGraph || activeGraph.people.length < 2) return;
    setLinkForm({
      source: activeGraph.people[0].id,
      target: activeGraph.people[1].id,
      relation: "blood",
      label: "Quan hệ mới",
    });
  }

  function openEditLink(link: MockCommunityGraph["links"][number]) {
    setLinkForm({
      id: link.id,
      source: link.source,
      target: link.target,
      relation: link.relation,
      label: link.label,
    });
  }

  function saveLink() {
    if (!activeCommunity || !linkForm) return;
    const label = linkForm.label.trim();
    if (!linkForm.source || !linkForm.target || !label) return;
    if (linkForm.source === linkForm.target) return;

    setCommunityGraphs((prev) => {
      const graph = prev[activeCommunity.id];
      if (!graph) return prev;
      if (linkForm.id) {
        return {
          ...prev,
          [activeCommunity.id]: {
            ...graph,
            links: graph.links.map((l) =>
              l.id === linkForm.id
                ? { ...l, source: linkForm.source, target: linkForm.target, relation: linkForm.relation, label }
                : l,
            ),
          },
        };
      }
      return {
        ...prev,
        [activeCommunity.id]: {
          ...graph,
          links: [
            ...graph.links,
            {
              id: crypto.randomUUID(),
              source: linkForm.source,
              target: linkForm.target,
              relation: linkForm.relation,
              label,
            },
          ],
        },
      };
    });
    setLinkForm(null);
  }

  function removeLink(linkId: string) {
    if (!activeCommunity) return;
    setCommunityGraphs((prev) => {
      const graph = prev[activeCommunity.id];
      if (!graph) return prev;
      return {
        ...prev,
        [activeCommunity.id]: {
          ...graph,
          links: graph.links.filter((l) => l.id !== linkId),
        },
      };
    });
  }

  if (!userId) {
    return <AuthForm loading={isAuthLoading} error={authError} message={authMessage} onLogin={login} onRegister={register} />;
  }

  return (
    <main className="min-h-screen bg-slate-100 text-slate-900">
      <div className="mx-auto max-w-[1440px] p-4 lg:p-6">
        <header className="mb-4 rounded-3xl border border-white/60 bg-white/80 p-4 shadow-md backdrop-blur">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xl font-semibold">
              <Building2 className="text-cyan-600" /> Ký Ức Quan Hệ
            </div>
            <div className="ml-auto flex items-center gap-2">
              <button title="Thông báo" className="rounded-xl bg-slate-100 p-2.5 text-slate-700 hover:bg-slate-200">
                <Bell size={18} />
              </button>
              <div className="relative">
                <button
                  title="Cài đặt"
                  className="rounded-xl bg-slate-100 p-2.5 text-slate-700 hover:bg-slate-200"
                  onClick={() => setIsSettingsOpen((prev) => !prev)}
                >
                  <Settings size={18} />
                </button>
                {isSettingsOpen && (
                  <div className="absolute right-0 top-12 z-20 w-40 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                    <button
                      className="w-full rounded-lg px-2 py-1.5 text-left text-sm text-rose-600 hover:bg-rose-50"
                      onClick={() => void logout()}
                    >
                      Đăng xuất
                    </button>
                  </div>
                )}
              </div>
              <div className="grid h-10 w-10 place-items-center rounded-full bg-gradient-to-br from-cyan-500 to-blue-500 text-sm font-semibold text-white">
                U
              </div>
            </div>
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            {(["all", "family", "company", "friends", "clan", "other", "archived"] as HubTab[]).map((item) => (
              <button
                key={item}
                onClick={() => setTab(item)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                  tab === item ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                }`}
              >
                {tabLabel(item)}
              </button>
            ))}
          </div>
        </header>

        <div className="grid gap-4 lg:grid-cols-[0.85fr_1.35fr]">
          <section className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-md backdrop-blur">
            <div className="mb-3 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold">Cộng đồng</h2>
                <p className="text-xs text-slate-500">{filteredCommunities.length} cộng đồng</p>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Search size={14} className="pointer-events-none absolute left-2 top-2.5 text-slate-400" />
                  <input
                    className="w-full rounded-xl border border-slate-200 bg-white px-8 py-2 text-sm"
                    placeholder="Tìm cộng đồng"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                  />
                </div>
                <button
                  className="inline-flex items-center gap-1 rounded-xl bg-cyan-600 px-3 py-2 text-sm font-medium text-white hover:bg-cyan-500"
                  onClick={() => {
                    const next: Community = {
                      id: crypto.randomUUID(),
                      name: `Cộng đồng mới ${communities.length + 1}`,
                      type: "other",
                      description: "Mô tả ngắn cho cộng đồng mới.",
                      members: 0,
                      events: 0,
                      updatedAt: "Vừa tạo",
                      status: "active",
                      cover: "from-sky-400 via-cyan-400 to-teal-500",
                    };
                    setCommunities((prev) => [next, ...prev]);
                    setCommunityGraphs((prev) => ({
                      ...prev,
                      [next.id]: cloneGraph(getMockCommunityGraph(next.type)),
                    }));
                    setActiveCommunityId(next.id);
                    setTab("all");
                  }}
                >
                  <Plus size={14} /> Thêm
                </button>
              </div>
            </div>

            {filteredCommunities.length === 0 ? (
              <div className="grid min-h-64 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
                <div>
                  <Archive className="mx-auto mb-2 text-slate-400" />
                  <p className="text-sm font-medium">Không có cộng đồng phù hợp</p>
                  <p className="text-xs text-slate-500">Thử từ khóa khác hoặc đổi bộ lọc.</p>
                </div>
              </div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {filteredCommunities.map((community) => {
                  const isActive = community.id === activeCommunityId;
                  return (
                    <button
                      key={community.id}
                      onClick={() => setActiveCommunityId(community.id)}
                      className={`overflow-hidden rounded-2xl border text-left transition ${
                        isActive ? "border-cyan-500 ring-2 ring-cyan-100" : "border-slate-200 hover:border-cyan-300"
                      }`}
                    >
                      <div className={`h-20 bg-gradient-to-r ${community.cover}`} />
                      <div className="space-y-1 bg-white p-3">
                        <p className="line-clamp-1 text-sm font-semibold">{community.name}</p>
                        <p className="line-clamp-2 text-xs text-slate-500">{community.description}</p>
                        <p className="text-xs text-slate-500">
                          {typeLabel(community.type)} • {community.members} thành viên
                        </p>
                        <p className="text-xs text-slate-400">Cập nhật: {community.updatedAt}</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            )}
          </section>

          <section className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-md backdrop-blur">
            <h2 className="text-lg font-semibold">Sơ đồ</h2>
            {!activeCommunity ? (
              <p className="mt-3 text-sm text-slate-500">Chọn một cộng đồng để xem chi tiết.</p>
            ) : (
              <div className="mt-3 space-y-3">
                <div className="rounded-2xl border border-slate-200 bg-white p-4">
                  <div className="mb-2 h-24 rounded-xl bg-gradient-to-r from-cyan-500 via-sky-500 to-blue-500" />
                  <p className="text-base font-semibold">{activeCommunity.name}</p>
                  <p className="text-sm text-slate-600">{activeCommunity.description}</p>
                  <div className="mt-2 flex flex-wrap gap-2 text-xs text-slate-500">
                    <span className="rounded-full bg-slate-100 px-2 py-1">{typeLabel(activeCommunity.type)}</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1">{activeCommunity.members} thành viên</span>
                    <span className="rounded-full bg-slate-100 px-2 py-1">{activeCommunity.events} sự kiện</span>
                  </div>
                  <div className="mt-3 rounded-xl border border-slate-100 bg-slate-50 p-2">
                    <p className="text-xs font-semibold text-slate-700">Sự kiện gần nhất</p>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
                      <CalendarDays size={14} />
                      <span>Sinh nhật Bố - 15/05/2026</span>
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-600">
                      <CalendarDays size={14} />
                      <span>Họp mặt gia đình - 01/06/2026</span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-wrap gap-2">
                  {([
                    { id: "tree", label: "Cây quan hệ" },
                    { id: "radial", label: "Vòng tròn" },
                    { id: "list", label: "Danh sách" },
                    { id: "timeline", label: "Timeline" },
                    { id: "cluster", label: "Nhóm cụm" },
                  ] as Array<{ id: ViewMode; label: string }>).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => setViewMode(item.id)}
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold ${
                        viewMode === item.id ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"
                      }`}
                    >
                      {item.label}
                    </button>
                  ))}
                </div>

                {activeGraph ? (
                  <>
                    {viewMode === "tree" && <StoryMapCanvas graph={activeGraph} />}
                    {viewMode === "radial" && <RadialView graph={activeGraph} />}
                    {viewMode === "list" && <ListView graph={activeGraph} />}
                    {viewMode === "timeline" && <TimelineView graph={activeGraph} />}
                    {viewMode === "cluster" && <ClusterView graph={activeGraph} />}
                  </>
                ) : (
                  <div className="grid min-h-44 place-items-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 text-center">
                    <div>
                      <Users className="mx-auto mb-2 text-slate-400" />
                      <p className="text-sm font-medium">Chưa có dữ liệu sơ đồ</p>
                    </div>
                  </div>
                )}

                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold">Thành viên</p>
                    <button
                      className="rounded-lg bg-cyan-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-cyan-500"
                      onClick={openCreatePerson}
                    >
                      + Thêm người
                    </button>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5">
                    <p className="text-xs text-slate-600">
                      {(activeGraph?.people ?? []).length} thành viên
                    </p>
                    <button
                      className="rounded bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-300"
                      onClick={() => setIsMembersExpanded((prev) => !prev)}
                    >
                      {isMembersExpanded ? "Thu gọn" : "Mở rộng"}
                    </button>
                  </div>
                  {isMembersExpanded && (
                    <div className="mt-2 grid gap-2 sm:grid-cols-2">
                      {(activeGraph?.people ?? []).map((person) => (
                        <div key={person.id} className="rounded-xl border border-slate-200 px-2 py-2">
                          <p className="text-xs font-semibold">{person.name}</p>
                          <p className="text-[11px] text-slate-500">{person.role} • {person.age} tuổi</p>
                          <div className="mt-1 flex gap-1">
                            <button
                              className="rounded bg-slate-100 px-2 py-0.5 text-[11px] hover:bg-slate-200"
                              onClick={() => openEditPerson(person)}
                            >
                              Sửa
                            </button>
                            <button
                              className="rounded bg-rose-50 px-2 py-0.5 text-[11px] text-rose-600 hover:bg-rose-100"
                              onClick={() => removePerson(person.id)}
                            >
                              Xóa
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div className="rounded-2xl border border-slate-200 bg-white p-3">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-sm font-semibold">Liên kết</p>
                    <button
                      className="rounded-lg bg-cyan-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-cyan-500"
                      onClick={openCreateLink}
                    >
                      + Thêm liên kết
                    </button>
                  </div>
                  <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-slate-50 px-2 py-1.5">
                    <p className="text-xs text-slate-600">
                      {(activeGraph?.links ?? []).length} liên kết
                    </p>
                    <button
                      className="rounded bg-slate-200 px-2 py-0.5 text-[11px] font-semibold text-slate-700 hover:bg-slate-300"
                      onClick={() => setIsLinksExpanded((prev) => !prev)}
                    >
                      {isLinksExpanded ? "Thu gọn" : "Mở rộng"}
                    </button>
                  </div>
                  {isLinksExpanded && (
                    <div className="mt-2 space-y-2">
                      {(activeGraph?.links ?? []).map((link) => {
                        const source = activeGraph?.people.find((p) => p.id === link.source)?.name ?? link.source;
                        const target = activeGraph?.people.find((p) => p.id === link.target)?.name ?? link.target;
                        return (
                          <div key={link.id} className="rounded-xl border border-slate-200 px-2 py-2">
                            <p className="text-xs font-semibold">{source} → {target}</p>
                            <p className="text-[11px] text-slate-500">{link.label} • {link.relation}</p>
                            <div className="mt-1 flex gap-1">
                              <button
                                className="rounded bg-slate-100 px-2 py-0.5 text-[11px] hover:bg-slate-200"
                                onClick={() => openEditLink(link)}
                              >
                                Sửa
                              </button>
                              <button
                                className="rounded bg-rose-50 px-2 py-0.5 text-[11px] text-rose-600 hover:bg-rose-100"
                                onClick={() => removeLink(link.id)}
                              >
                                Xóa
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </section>
        </div>
      </div>
      {personForm && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold">{personForm.id ? "Sửa thành viên" : "Thêm thành viên"}</h3>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Họ tên"
              value={personForm.name}
              onChange={(e) => setPersonForm((prev) => (prev ? { ...prev, name: e.target.value } : prev))}
            />
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Vai trò"
              value={personForm.role}
              onChange={(e) => setPersonForm((prev) => (prev ? { ...prev, role: e.target.value } : prev))}
            />
            <div className="grid grid-cols-2 gap-2">
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Tuổi"
                value={personForm.age}
                onChange={(e) => setPersonForm((prev) => (prev ? { ...prev, age: e.target.value } : prev))}
              />
              <input
                className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
                placeholder="Thế hệ"
                value={personForm.generation}
                onChange={(e) => setPersonForm((prev) => (prev ? { ...prev, generation: e.target.value } : prev))}
              />
            </div>
            <div className="flex justify-end gap-2 pt-1">
              <button className="rounded-lg border px-3 py-2 text-sm" onClick={() => setPersonForm(null)}>Hủy</button>
              <button className="rounded-lg bg-cyan-600 px-3 py-2 text-sm text-white" onClick={savePerson}>Lưu</button>
            </div>
          </div>
        </div>
      )}
      {linkForm && (
        <div className="fixed inset-0 z-30 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md space-y-2 rounded-2xl border border-slate-200 bg-white p-4">
            <h3 className="text-sm font-semibold">{linkForm.id ? "Sửa liên kết" : "Thêm liên kết"}</h3>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={linkForm.source}
              onChange={(e) => setLinkForm((prev) => (prev ? { ...prev, source: e.target.value } : prev))}
            >
              {(activeGraph?.people ?? []).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={linkForm.target}
              onChange={(e) => setLinkForm((prev) => (prev ? { ...prev, target: e.target.value } : prev))}
            >
              {(activeGraph?.people ?? []).map((p) => (
                <option key={p.id} value={p.id}>{p.name}</option>
              ))}
            </select>
            <select
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              value={linkForm.relation}
              onChange={(e) =>
                setLinkForm((prev) =>
                  prev ? { ...prev, relation: e.target.value as LinkFormState["relation"] } : prev,
                )
              }
            >
              <option value="blood">Huyết thống</option>
              <option value="marriage">Hôn nhân</option>
              <option value="social">Xã hội</option>
              <option value="work">Công việc</option>
            </select>
            <input
              className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm"
              placeholder="Nhãn liên kết"
              value={linkForm.label}
              onChange={(e) => setLinkForm((prev) => (prev ? { ...prev, label: e.target.value } : prev))}
            />
            <div className="flex justify-end gap-2 pt-1">
              <button className="rounded-lg border px-3 py-2 text-sm" onClick={() => setLinkForm(null)}>Hủy</button>
              <button className="rounded-lg bg-cyan-600 px-3 py-2 text-sm text-white" onClick={saveLink}>Lưu</button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
