"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { type Edge, type Node } from "@xyflow/react";
import { CalendarDays, GalleryHorizontal, GitBranch, List, LogOut, MoreHorizontal, Plus, Search, Users } from "lucide-react";
import { hasSupabaseEnv, supabase } from "@/lib/supabase";
import type { EventItem, Person, Relationship, RelationshipGroup, RelationType } from "@/lib/models";
import AuthForm from "@/features/auth/components/AuthForm";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { createGroup, deleteGroup, fetchGroups, renameGroup } from "@/features/groups/api";
import { createPerson, fetchPersons, updatePerson } from "@/features/persons/api";
import PersonFormDialog from "@/features/persons/components/PersonFormDialog";
import PersonDetailPanel from "@/features/persons/components/PersonDetailPanel";
import {
  createRelationship,
  fetchRelationships,
  relationshipExists,
  validateRelationshipInput,
} from "@/features/relationships/api";
import { buildFamilyLayout } from "@/features/graph/layout/familyLayout";
import RelationshipGraph from "@/features/graph/components/RelationshipGraph";
import {
  createEvent,
  fetchEvents,
  mapEventsToCalendar,
  updateEventPhoto,
} from "@/features/events/api";
import EventCalendar from "@/features/events/components/EventCalendar";
import EventFormDialog from "@/features/events/components/EventFormDialog";
import GalleryView from "@/features/media/components/GalleryView";
import ImageUploader from "@/features/media/components/ImageUploader";
import { uploadEventImage, uploadPersonAvatar } from "@/features/media/api";
import { useToast } from "@/components/app/toast";
import RelationshipFormDialog from "@/features/relationships/components/RelationshipFormDialog";
import { bootstrapDatabaseIfNeeded } from "@/lib/bootstrap-db";

type ViewMode = "graph" | "list" | "calendar" | "gallery";

const RELATION_LABELS: Record<RelationType, string> = {
  self: "Bản thân",
  father: "Bố",
  mother: "Mẹ",
  sibling: "Anh/chị/em ruột",
  grandparent: "Ông/bà",
  uncle_aunt: "Bác/cô/chú/dì/cậu",
  cousin: "Anh/chị/em họ",
  spouse: "Vợ/chồng",
  child: "Con",
  friend: "Bạn bè",
  colleague: "Đồng nghiệp",
  manager: "Quản lý",
  employee: "Nhân viên",
};

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
  const [groups, setGroups] = useState<RelationshipGroup[]>([]);
  const [activeGroupId, setActiveGroupId] = useState<string | null>(null);
  const [people, setPeople] = useState<Person[]>([]);
  const [relationships, setRelationships] = useState<Relationship[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedPerson, setSelectedPerson] = useState<Person | null>(null);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [isPersonDialogOpen, setIsPersonDialogOpen] = useState(false);
  const [isPersonSubmitting, setIsPersonSubmitting] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isEventSubmitting, setIsEventSubmitting] = useState(false);
  const [isRelationshipDialogOpen, setIsRelationshipDialogOpen] = useState(false);
  const [isRelationshipSubmitting, setIsRelationshipSubmitting] = useState(false);
  const [eventFilterPersonId, setEventFilterPersonId] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("graph");
  const [query, setQuery] = useState("");
  const [isBootstrappingDb, setIsBootstrappingDb] = useState(false);
  const [openGroupMenuId, setOpenGroupMenuId] = useState<string | null>(null);
  const hasTriedBootstrapRef = useRef(false);
  const { pushToast } = useToast();
  const { userId, loading: isAuthLoading, message: authMessage, error: authError, login, register, logout } = useAuth(sb);

  useEffect(() => {
    if (!userId) return;
    fetchGroups(sb, userId).then((result) => {
      if (result.error?.includes("relationship_groups") && !isBootstrappingDb && !hasTriedBootstrapRef.current) {
        hasTriedBootstrapRef.current = true;
        setIsBootstrappingDb(true);
        void bootstrapDatabaseIfNeeded().then((bootstrapResult) => {
          if ("error" in bootstrapResult) {
            pushToast(`Khởi tạo cơ sở dữ liệu thất bại: ${bootstrapResult.error}`, "error");
            setIsBootstrappingDb(false);
            return;
          }
          pushToast("Đã khởi tạo bảng dữ liệu tự động. Đang tải lại...", "success");
          setIsBootstrappingDb(false);
          void fetchGroups(sb, userId).then((retry) => {
            const retryList = retry.data ?? [];
            setGroups(retryList);
            if (retryList.length) setActiveGroupId((prev) => prev ?? retryList[0].id);
          });
        });
        return;
      }

      const list = result.data ?? [];
      setGroups(list);
      if (list.length) setActiveGroupId((prev) => prev ?? list[0].id);
    });
  }, [userId, sb, isBootstrappingDb, pushToast]);

  useEffect(() => {
    if (!activeGroupId) return;
    void Promise.all([
      fetchPersons(sb, activeGroupId),
      fetchRelationships(sb, activeGroupId),
      fetchEvents(sb, activeGroupId),
    ]).then(([p, r, e]) => {
      setPeople(p.data ?? []);
      setRelationships(r.data ?? []);
      setEvents(e.data ?? []);
    });
  }, [activeGroupId, sb]);

  const filteredPeople = useMemo(
    () =>
      people.filter(
        (p) =>
          p.full_name.toLowerCase().includes(query.toLowerCase()) ||
          (p.relationship_to_user ?? "").toLowerCase().includes(query.toLowerCase()),
      ),
    [people, query],
  );

  const layoutPoints = useMemo(() => buildFamilyLayout(filteredPeople, relationships), [filteredPeople, relationships]);

  const nodes: Node[] = filteredPeople.map((p) => {
    const point = layoutPoints.find((x) => x.id === p.id) ?? { x: 0, y: 0 };
    return {
      id: p.id,
      position: { x: point.x, y: point.y },
      data: {
        label: (
          <button
            className="w-48 rounded-2xl border border-slate-200 bg-white px-3 py-2 text-left shadow-sm transition hover:shadow-md"
            onClick={() => setSelectedPerson(p)}
          >
            <p className="truncate text-sm font-semibold text-slate-900">{p.full_name}</p>
            <p className="truncate text-xs text-slate-500">{p.relationship_to_user || "Chưa rõ quan hệ"}</p>
          </button>
        ),
      },
    };
  });

  const edges: Edge[] = relationships
    .filter((r) => filteredPeople.some((p) => p.id === r.source_person_id) && filteredPeople.some((p) => p.id === r.target_person_id))
    .map((r) => ({
      id: r.id,
      source: r.source_person_id,
      target: r.target_person_id,
      label: RELATION_LABELS[r.relation_type] ?? r.relation_type,
    }));

  async function createNewGroup() {
    if (!userId) return;
    const inputName = window.prompt("Nhập tên nhóm mới:", "Nhóm mới");
    const groupName = inputName?.trim();
    if (!groupName) return;
    const result = await createGroup(sb, userId, groupName, "other");
    if (result.data) {
      setGroups((prev) => [...prev, result.data as RelationshipGroup]);
      setActiveGroupId(result.data.id);
      pushToast(`Đã tạo nhóm "${groupName}"`, "success");
    } else if (result.error) {
      pushToast(result.error ?? "Tạo nhóm thất bại", "error");
    }
  }

  async function renameGroupById(groupId: string) {
    const current = groups.find((group) => group.id === groupId);
    if (!current) return;
    const inputName = window.prompt("Đổi tên nhóm:", current.name);
    const nextName = inputName?.trim();
    if (!nextName || nextName === current.name) return;
    const result = await renameGroup(sb, groupId, nextName);
    if (result.data) {
      setGroups((prev) => prev.map((group) => (group.id === groupId ? { ...group, name: nextName } : group)));
      pushToast("Đã đổi tên nhóm", "success");
    } else if (result.error) {
      pushToast(result.error ?? "Đổi tên nhóm thất bại", "error");
    }
  }

  async function deleteGroupById(groupId: string) {
    if (groups.length <= 1) {
      pushToast("Cần giữ lại ít nhất 1 nhóm", "error");
      return;
    }
    const current = groups.find((group) => group.id === groupId);
    if (!current) return;
    const confirmed = window.confirm(
      `Xóa nhóm "${current.name}"? Hành động này sẽ xóa toàn bộ thành viên, quan hệ và sự kiện của nhóm.`,
    );
    if (!confirmed) return;
    const result = await deleteGroup(sb, groupId);
    if ("error" in result) {
      pushToast(result.error ?? "Xóa nhóm thất bại", "error");
      return;
    }
    const nextGroups = groups.filter((group) => group.id !== groupId);
    setGroups(nextGroups);
    if (activeGroupId === groupId) {
      setActiveGroupId(nextGroups[0]?.id ?? null);
    }
    pushToast("Đã xóa nhóm", "success");
  }

  async function addPerson() {
    if (!activeGroupId) return;
    setIsPersonDialogOpen(true);
  }

  async function handleCreatePerson(input: { full_name: string; relationship_to_user: string }) {
    if (!activeGroupId) return;
    setIsPersonSubmitting(true);
    try {
      const result = await createPerson(sb, activeGroupId, input);
      if (result.data) {
        setPeople((prev) => [...prev, result.data as Person]);
        pushToast("Đã thêm thành viên", "success");
      } else if (result.error) {
        pushToast(result.error ?? "Thêm thành viên thất bại", "error");
      }
    } finally {
      setIsPersonSubmitting(false);
    }
  }

  async function addRelationship() {
    if (!activeGroupId || people.length < 2) return;
    setIsRelationshipDialogOpen(true);
  }

  async function handleCreateRelationship(input: { sourceId: string; targetId: string; relationType: RelationType }) {
    if (!activeGroupId) return;
    setIsRelationshipSubmitting(true);

    const { sourceId: source, targetId: target, relationType } = input;
    const validation = validateRelationshipInput({
      source_person_id: source,
      target_person_id: target,
      relation_type: relationType,
    });

    if ("error" in validation) {
      pushToast(validation.error ?? "Dữ liệu quan hệ không hợp lệ", "error");
      setIsRelationshipSubmitting(false);
      return;
    }

    if (relationshipExists(relationships, source, target, relationType)) {
      pushToast("Quan hệ đã tồn tại", "error");
      setIsRelationshipSubmitting(false);
      return;
    }

    const result = await createRelationship(sb, activeGroupId, source, target, relationType);
    if (result.data) {
      setRelationships((prev) => [...prev, result.data as Relationship]);
      pushToast("Đã thêm quan hệ", "success");
    } else if (result.error) {
      pushToast(result.error ?? "Thêm quan hệ thất bại", "error");
    }

    setIsRelationshipSubmitting(false);
  }

  async function addEvent() {
    if (!activeGroupId) return;
    setIsEventDialogOpen(true);
  }

  async function handleCreateEvent(input: {
    title: string;
    event_date: string;
    recurrence: "once" | "monthly" | "yearly";
    person_id: string | null;
    description?: string;
  }) {
    if (!activeGroupId) return;
    setIsEventSubmitting(true);
    try {
      const result = await createEvent(sb, activeGroupId, input);
      if (result.data) {
        setEvents((prev) => [...prev, result.data as EventItem]);
        pushToast("Đã thêm sự kiện", "success");
      } else if (result.error) {
        pushToast(result.error ?? "Thêm sự kiện thất bại", "error");
      }
    } finally {
      setIsEventSubmitting(false);
    }
  }

  async function savePerson(person: Person) {
    await updatePerson(sb, person);
    setPeople((prev) => prev.map((x) => (x.id === person.id ? person : x)));
    pushToast("Đã cập nhật hồ sơ", "success");
  }

  async function uploadAvatar(personId: string, file: File) {
    const uploaded = await uploadPersonAvatar(sb, personId, file);
    if (!("publicUrl" in uploaded)) {
      pushToast(uploaded.error ?? "Tải ảnh thất bại", "error");
      return;
    }

    const person = people.find((p) => p.id === personId);
    if (!person) return;

    const updated = { ...person, avatar_url: uploaded.publicUrl };
    await savePerson(updated);
    setSelectedPerson(updated);
    pushToast("Đã tải ảnh đại diện", "success");
  }

  async function uploadEventPhoto(eventId: string, file: File) {
    const uploaded = await uploadEventImage(sb, eventId, file);
    if (!("publicUrl" in uploaded)) {
      pushToast(uploaded.error ?? "Tải ảnh thất bại", "error");
      return;
    }

    await updateEventPhoto(sb, eventId, uploaded.publicUrl);
    setEvents((prev) => prev.map((x) => (x.id === eventId ? { ...x, photo_url: uploaded.publicUrl } : x)));
    pushToast("Đã tải ảnh sự kiện", "success");
  }

  const calendarEvents = useMemo(() => mapEventsToCalendar(events, eventFilterPersonId || null), [events, eventFilterPersonId]);

  if (!userId) {
    return <AuthForm loading={isAuthLoading} error={authError} message={authMessage} onLogin={login} onRegister={register} />;
  }

  return (
    <main className="min-h-screen text-slate-900">
      <PersonFormDialog
        open={isPersonDialogOpen}
        loading={isPersonSubmitting}
        onClose={() => setIsPersonDialogOpen(false)}
        onSubmit={handleCreatePerson}
      />
      <EventFormDialog
        open={isEventDialogOpen}
        people={people}
        loading={isEventSubmitting}
        onClose={() => setIsEventDialogOpen(false)}
        onSubmit={handleCreateEvent}
      />
      <RelationshipFormDialog
        open={isRelationshipDialogOpen}
        people={people}
        loading={isRelationshipSubmitting}
        onClose={() => setIsRelationshipDialogOpen(false)}
        onSubmit={handleCreateRelationship}
      />

      <div className="mx-auto max-w-[1450px] p-4 lg:p-6">
        <div className="mb-4 rounded-3xl border border-white/50 bg-white/70 p-4 shadow-lg backdrop-blur">
          <div className="mb-3 flex items-start gap-3 overflow-x-auto pb-1">
            {groups.map((group) => {
              const isActive = group.id === activeGroupId;
              return (
                <div
                  key={group.id}
                  className={`min-w-[160px] shrink-0 rounded-2xl border px-4 py-3 text-left transition md:w-[calc((100%-3rem)/5)] ${
                    isActive
                      ? "border-cyan-500 bg-cyan-50 shadow-sm"
                      : "border-slate-200 bg-white hover:border-cyan-300"
                  }`}
                >
                  <div className="mb-1 flex items-start justify-between gap-2">
                    <button
                      onClick={() => setActiveGroupId(group.id)}
                      className="flex-1 text-left"
                    >
                      <p className="truncate text-sm font-semibold text-slate-900">{group.name}</p>
                      <p className="text-xs text-slate-500">
                        {group.group_type === "family" ? "Gia đình" : "Nhóm quan hệ"}
                      </p>
                    </button>
                    <div className="relative">
                      <button
                        aria-label="Tùy chọn nhóm"
                        className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                        onClick={() => setOpenGroupMenuId((prev) => (prev === group.id ? null : group.id))}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                      {openGroupMenuId === group.id && (
                        <div className="absolute right-0 top-8 z-20 w-36 rounded-xl border border-slate-200 bg-white p-1 shadow-lg">
                          <button
                            className="w-full rounded-lg px-2 py-1.5 text-left text-sm hover:bg-slate-100"
                            onClick={() => {
                              setOpenGroupMenuId(null);
                              void renameGroupById(group.id);
                            }}
                          >
                            Đổi tên
                          </button>
                          <button
                            className="w-full rounded-lg px-2 py-1.5 text-left text-sm text-rose-600 hover:bg-rose-50 disabled:opacity-60"
                            disabled={groups.length <= 1}
                            onClick={() => {
                              setOpenGroupMenuId(null);
                              void deleteGroupById(group.id);
                            }}
                          >
                            Xóa nhóm
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            <button
              onClick={() => void createNewGroup()}
              className="flex min-w-[160px] shrink-0 items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-cyan-400 hover:text-cyan-700 md:w-[calc((100%-3rem)/5)]"
            >
              <Plus size={16} /> + Nhóm
            </button>

            <div className="ml-auto flex gap-2">
              {[
                { id: "graph", icon: GitBranch, title: "Sơ đồ" },
                { id: "list", icon: List, title: "Danh sách" },
                { id: "calendar", icon: CalendarDays, title: "Lịch" },
                { id: "gallery", icon: GalleryHorizontal, title: "Ảnh" },
              ].map((v) => (
                <button
                  key={v.id}
                  title={v.title}
                  onClick={() => setViewMode(v.id as ViewMode)}
                  className={`rounded-xl p-2.5 ${viewMode === v.id ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-slate-200"}`}
                >
                  <v.icon size={18} />
                </button>
              ))}

              <button
                title="Đăng xuất"
                className="rounded-xl bg-slate-100 p-2.5 text-slate-700 hover:bg-slate-200"
                onClick={() => void logout()}
              >
                <LogOut size={18} />
              </button>
            </div>
          </div>
          <div className="text-sm text-slate-600">Chạm vào một box để mở nhóm tương ứng.</div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[300px_1fr_340px]">
          <aside className="space-y-3 rounded-3xl border border-white/50 bg-white/70 p-4 shadow-lg backdrop-blur">
            <h2 className="flex items-center gap-2 text-lg font-semibold">
              <Users size={18} /> Thành viên
            </h2>

            <div className="relative">
              <Search size={14} className="absolute left-2 top-2.5 text-slate-400" />
              <input
                className="w-full rounded-xl border border-slate-200 bg-white px-8 py-2 text-sm"
                placeholder="Tìm tên hoặc quan hệ"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
            </div>

            <div className="max-h-[70vh] space-y-2 overflow-auto pr-1">
              {filteredPeople.map((p) => (
                <button
                  key={p.id}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2 text-left transition hover:bg-slate-50"
                  onClick={() => setSelectedPerson(p)}
                >
                  <p className="text-sm font-medium">{p.full_name}</p>
                  <p className="text-xs text-slate-500">{p.relationship_to_user || "-"}</p>
                </button>
              ))}
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                aria-label="Thêm thành viên"
                onClick={() => void addPerson()}
                className="flex items-center justify-center gap-1 rounded-xl bg-cyan-600 px-2 py-2 text-sm text-white hover:bg-cyan-500"
              >
                <Plus size={14} /> Người
              </button>
              <button
                aria-label="Thêm quan hệ"
                onClick={() => void addRelationship()}
                className="rounded-xl bg-slate-800 px-2 py-2 text-sm text-white hover:bg-slate-700"
              >
                + Quan hệ
              </button>
            </div>

            <button
              aria-label="Thêm sự kiện"
              onClick={() => void addEvent()}
              className="w-full rounded-xl border border-slate-200 bg-white px-2 py-2 text-sm hover:bg-slate-50"
            >
              + Sự kiện
            </button>
          </aside>

          <section className="min-h-[70vh] rounded-3xl border border-white/50 bg-white/70 p-2 shadow-lg backdrop-blur">
            {viewMode === "graph" && <RelationshipGraph nodes={nodes} edges={edges} />}

            {viewMode === "list" && (
              <div className="space-y-2 p-3">
                {filteredPeople.map((p) => (
                  <div key={p.id} className="rounded-xl border border-slate-200 bg-white p-3">
                    <p className="font-semibold">{p.full_name}</p>
                    <p className="text-sm text-slate-600">{p.occupation || "Chưa có nghề nghiệp"}</p>
                    <p className="text-sm">{p.relationship_to_user || "Chưa rõ quan hệ"}</p>
                  </div>
                ))}
              </div>
            )}

            {viewMode === "calendar" && (
              <div>
                <div className="p-3">
                  <select
                    className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm"
                    value={eventFilterPersonId}
                    onChange={(e) => setEventFilterPersonId(e.target.value)}
                  >
                    <option value="">Tất cả thành viên</option>
                    {people.map((person) => (
                      <option key={person.id} value={person.id}>
                        {person.full_name}
                      </option>
                    ))}
                  </select>
                </div>
                <EventCalendar events={calendarEvents} />
              </div>
            )}

            {viewMode === "gallery" && <GalleryView people={people} />}
          </section>

          <aside className="space-y-3 rounded-3xl border border-white/50 bg-white/70 p-4 shadow-lg backdrop-blur">
            <h3 className="text-lg font-semibold">Chi tiết thành viên</h3>

            <PersonDetailPanel
              person={selectedPerson}
              onChange={setSelectedPerson}
              onSave={async () => {
                if (selectedPerson) await savePerson(selectedPerson);
              }}
              onUploadAvatar={uploadAvatar}
            />

            <div className="border-t border-slate-200 pt-3">
              <h4 className="mb-2 text-sm font-semibold">Sự kiện gần đây</h4>
              <div className="max-h-56 space-y-2 overflow-auto">
                {events.map((event) => (
                  <div key={event.id} className="rounded-xl border border-slate-200 bg-white p-2">
                    <button className="w-full text-left" onClick={() => setSelectedEventId(event.id)}>
                      <p className="text-sm font-medium">{event.title}</p>
                      <p className="text-xs text-slate-500">{event.event_date}</p>
                    </button>

                    {selectedEventId === event.id && (
                      <div className="mt-2 space-y-2">
                        {event.photo_url && (
                          <img src={event.photo_url} alt={event.title} className="h-24 w-full rounded-xl object-cover" />
                        )}
                        <ImageUploader label="Ảnh sự kiện" onFileSelected={(file) => uploadEventPhoto(event.id, file)} />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
