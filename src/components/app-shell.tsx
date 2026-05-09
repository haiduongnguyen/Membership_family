"use client";

import { useMemo, useState } from "react";
import { Archive, Building2, CalendarDays, LogOut, Plus, Search, Users } from "lucide-react";
import AuthForm from "@/features/auth/components/AuthForm";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { hasSupabaseEnv, supabase } from "@/lib/supabase";
import { getMockCommunityGraph } from "@/features/community/mock";
import StoryMapCanvas from "@/features/community/components/StoryMapCanvas";
import RadialView from "@/features/community/components/RadialView";
import ListView from "@/features/community/components/ListView";
import TimelineView from "@/features/community/components/TimelineView";
import ClusterView from "@/features/community/components/ClusterView";

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
  const [communities, setCommunities] = useState<Community[]>(MOCK_COMMUNITIES);
  const [activeCommunityId, setActiveCommunityId] = useState<string | null>(MOCK_COMMUNITIES[0]?.id ?? null);

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
  const activeGraph = useMemo(
    () => (activeCommunity ? getMockCommunityGraph(activeCommunity.type) : null),
    [activeCommunity],
  );

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
            <div className="relative ml-auto min-w-[260px] flex-1 sm:max-w-md">
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
                setActiveCommunityId(next.id);
                setTab("all");
              }}
            >
              <Plus size={14} /> Cộng đồng mới
            </button>
            <button
              title="Đăng xuất"
              className="rounded-xl bg-slate-100 p-2.5 text-slate-700 hover:bg-slate-200"
              onClick={() => void logout()}
            >
              <LogOut size={18} />
            </button>
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

        <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
          <section className="rounded-3xl border border-white/60 bg-white/80 p-4 shadow-md backdrop-blur">
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Community Hub</h2>
              <p className="text-xs text-slate-500">{filteredCommunities.length} cộng đồng</p>
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
            <h2 className="text-lg font-semibold">Community Detail</h2>
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
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="rounded-2xl border border-slate-200 bg-white p-3">
                    <p className="text-sm font-semibold">Nhánh nổi bật</p>
                    <ul className="mt-2 space-y-1 text-xs text-slate-600">
                      <li>• Nhánh gia đình chính</li>
                      <li>• Nhánh ông bà bên nội</li>
                      <li>• Nhánh anh chị em</li>
                    </ul>
                  </div>
                  <div className="rounded-2xl border border-slate-200 bg-white p-3">
                    <p className="text-sm font-semibold">Sự kiện gần nhất</p>
                    <div className="mt-2 flex items-center gap-2 text-xs text-slate-600">
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
              </div>
            )}
          </section>
        </div>
      </div>
    </main>
  );
}
