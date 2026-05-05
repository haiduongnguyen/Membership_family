"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { type Edge, type Node } from "@xyflow/react";
import { CalendarDays, GalleryHorizontal, GitBranch, List, LogOut, MoreHorizontal, Plus, Search, Users, X } from "lucide-react";
import { hasSupabaseEnv, supabase } from "@/lib/supabase";
import type { EventItem, Person, Relationship, RelationshipGroup, RelationType } from "@/lib/models";
import AuthForm from "@/features/auth/components/AuthForm";
import { useAuth } from "@/features/auth/hooks/useAuth";
import { createGroupWithRoot, createPersonFromAnchor, deleteGroup, fetchGroups, renameGroup } from "@/features/groups/api";
import { fetchPersons, updatePerson } from "@/features/persons/api";
import PersonDetailPanel from "@/features/persons/components/PersonDetailPanel";
import {
  createRelationship,
  fetchRelationships,
  relationshipExists,
  validateRelationshipInput,
} from "@/features/relationships/api";
import { buildFamilyLayout } from "@/features/graph/layout/familyLayout";
import RelationshipGraph from "@/features/graph/components/RelationshipGraph";
import { findPathEdgeIds } from "@/features/graph/path";
import { findVisiblePersonIdsByDepth } from "@/features/graph/depth";
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
  const [quickAddAnchorId, setQuickAddAnchorId] = useState<string | null>(null);
  const [quickAddName, setQuickAddName] = useState("");
  const [quickAddRelationType, setQuickAddRelationType] = useState<RelationType>("child");
  const [quickAddSubmitting, setQuickAddSubmitting] = useState(false);
  const [isEventDialogOpen, setIsEventDialogOpen] = useState(false);
  const [isEventSubmitting, setIsEventSubmitting] = useState(false);
  const [isRelationshipDialogOpen, setIsRelationshipDialogOpen] = useState(false);
  const [isRelationshipSubmitting, setIsRelationshipSubmitting] = useState(false);
  const [eventFilterPersonId, setEventFilterPersonId] = useState<string>("");
  const [viewMode, setViewMode] = useState<ViewMode>("graph");
  const [graphMaxDepth, setGraphMaxDepth] = useState(2);
  const [query, setQuery] = useState("");
  const [isBootstrappingDb, setIsBootstrappingDb] = useState(false);
  const [openGroupMenuId, setOpenGroupMenuId] = useState<string | null>(null);
  const [isHiddenGroupsOpen, setIsHiddenGroupsOpen] = useState(false);
  const [groupPersonCount, setGroupPersonCount] = useState<Record<string, number>>({});
  const hasTriedBootstrapRef = useRef(false);
  const { pushToast } = useToast();
  const { userId, loading: isAuthLoading, message: authMessage, error: authError, login, register, logout } = useAuth(sb);
  const activeGroup = groups.find((group) => group.id === activeGroupId) ?? null;

  async function ensureDbSchemaOnce() {
    if (isBootstrappingDb || hasTriedBootstrapRef.current) return false;
    hasTriedBootstrapRef.current = true;
    setIsBootstrappingDb(true);
    const bootstrapResult = await bootstrapDatabaseIfNeeded();
    setIsBootstrappingDb(false);
    if ("error" in bootstrapResult) {
      pushToast(`Khởi tạo cơ sở dữ liệu thất bại: ${bootstrapResult.error}`, "error");
      return false;
    }
    pushToast("Đã cập nhật cấu trúc dữ liệu. Đang thử lại...", "success");
    return true;
  }

  useEffect(() => {
    if (!userId) return;
    fetchGroups(sb, userId).then(async (result) => {
      if (result.error?.includes("root_person_id") || result.error?.includes("relationship_groups")) {
        const bootstrapped = await ensureDbSchemaOnce();
        if (!bootstrapped) return;
        const retry = await fetchGroups(sb, userId);
        const retryList = retry.data ?? [];
        setGroups(retryList);
        if (retryList.length) setActiveGroupId((prev) => prev ?? retryList[0].id);
        return;
      }

      const list = result.data ?? [];
      setGroups(list);
      if (list.length) setActiveGroupId((prev) => prev ?? list[0].id);
    });
  }, [userId, sb, pushToast]);

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

  useEffect(() => {
    if (!groups.length) {
      setGroupPersonCount({});
      return;
    }
    const groupIds = groups.map((group) => group.id);
    sb.from("persons")
      .select("group_id")
      .in("group_id", groupIds)
      .then(({ data, error }) => {
        if (error || !data) return;
        const nextCount = groupIds.reduce<Record<string, number>>((acc, id) => {
          acc[id] = 0;
          return acc;
        }, {});
        for (const item of data as { group_id: string }[]) {
          nextCount[item.group_id] = (nextCount[item.group_id] ?? 0) + 1;
        }
        setGroupPersonCount(nextCount);
      });
  }, [groups, sb]);

  const filteredPeople = useMemo(
    () =>
      people.filter(
        (p) =>
          p.full_name.toLowerCase().includes(query.toLowerCase()) ||
          (p.relationship_to_user ?? "").toLowerCase().includes(query.toLowerCase()),
      ),
    [people, query],
  );

  const rootPersonId = activeGroup?.root_person_id ?? people[0]?.id ?? null;
  const visibleByDepth = useMemo(
    () => findVisiblePersonIdsByDepth(relationships, rootPersonId, graphMaxDepth),
    [relationships, rootPersonId, graphMaxDepth],
  );
  const graphPeople = useMemo(() => {
    if (viewMode !== "graph") return filteredPeople;
    if (!rootPersonId) return filteredPeople;
    return filteredPeople.filter((person) => visibleByDepth.has(person.id));
  }, [filteredPeople, visibleByDepth, viewMode, rootPersonId]);
  const layoutPoints = useMemo(
    () => buildFamilyLayout(graphPeople, relationships, rootPersonId),
    [graphPeople, relationships, rootPersonId],
  );
  const highlightedEdgeIds = useMemo(
    () => findPathEdgeIds(relationships, rootPersonId, selectedPerson?.id ?? null),
    [relationships, rootPersonId, selectedPerson?.id],
  );

  const nodes: Node[] = graphPeople.map((p) => {
    const point = layoutPoints.find((x) => x.id === p.id) ?? { x: 0, y: 0 };
    const isSelected = selectedPerson?.id === p.id;
    return {
      id: p.id,
      position: { x: point.x, y: point.y },
      data: {
        label: (
          <button
            className={`w-56 rounded-2xl border bg-white px-3 py-2 text-left shadow-sm transition hover:shadow-md ${
              isSelected ? "border-cyan-500 ring-2 ring-cyan-100" : "border-slate-200"
            }`}
            onClick={() => setSelectedPerson(p)}
          >
            <p className="truncate text-sm font-semibold text-slate-900">{p.full_name}</p>
            <p className="truncate text-xs text-slate-500">{p.relationship_to_user || "Chưa rõ quan hệ"}</p>
            <div className="mt-2 flex flex-wrap gap-1">
              <span
                className="inline-flex rounded-lg border border-cyan-200 bg-cyan-50 px-2 py-1 text-[11px] font-semibold text-cyan-700"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openQuickAdd(p.id, "father");
                }}
              >
                + Bố
              </span>
              <span
                className="inline-flex rounded-lg border border-cyan-200 bg-cyan-50 px-2 py-1 text-[11px] font-semibold text-cyan-700"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openQuickAdd(p.id, "mother");
                }}
              >
                + Mẹ
              </span>
              <span
                className="inline-flex rounded-lg border border-cyan-200 bg-cyan-50 px-2 py-1 text-[11px] font-semibold text-cyan-700"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openQuickAdd(p.id, "child");
                }}
              >
                + Con
              </span>
              <span
                className="inline-flex rounded-lg border border-cyan-200 bg-cyan-50 px-2 py-1 text-[11px] font-semibold text-cyan-700"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openQuickAdd(p.id, "spouse");
                }}
              >
                + Vợ/chồng
              </span>
              <span
                className="inline-flex rounded-lg border border-slate-200 bg-slate-50 px-2 py-1 text-[11px] font-semibold text-slate-700"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  openQuickAdd(p.id);
                }}
              >
                + Khác
              </span>
            </div>
          </button>
        ),
      },
    };
  });

  const edges: Edge[] = relationships
    .filter((r) => graphPeople.some((p) => p.id === r.source_person_id) && graphPeople.some((p) => p.id === r.target_person_id))
    .map((r) => ({
      id: r.id,
      source: r.source_person_id,
      target: r.target_person_id,
      label: RELATION_LABELS[r.relation_type] ?? r.relation_type,
    }));

  const visibleGroups = groups.slice(0, 5);
  const hiddenGroups = groups.slice(5);

  async function createNewGroup() {
    if (!userId) return;
    const inputName = window.prompt("Nhập tên nhóm mới:", "Nhóm mới");
    const groupName = inputName?.trim();
    if (!groupName) return;
    const result = await createGroupWithRoot(sb, userId, groupName, "other", "Tôi");
    if (result.data) {
      setGroups((prev) => [...prev, result.data as RelationshipGroup]);
      setGroupPersonCount((prev) => ({ ...prev, [result.data.id]: 1 }));
      setActiveGroupId(result.data.id);
      pushToast(`Đã tạo nhóm "${groupName}"`, "success");
    } else if (result.error) {
      if (result.error.includes("root_person_id")) {
        const bootstrapped = await ensureDbSchemaOnce();
        if (bootstrapped) {
          const retry = await createGroupWithRoot(sb, userId, groupName, "other", "Tôi");
          if (retry.data) {
            setGroups((prev) => [...prev, retry.data as RelationshipGroup]);
            setGroupPersonCount((prev) => ({ ...prev, [retry.data.id]: 1 }));
            setActiveGroupId(retry.data.id);
            pushToast(`Đã tạo nhóm "${groupName}"`, "success");
            return;
          }
          pushToast(retry.error ?? "Tạo nhóm thất bại", "error");
          return;
        }
      }
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
    setGroupPersonCount((prev) => {
      const next = { ...prev };
      delete next[groupId];
      return next;
    });
    if (activeGroupId === groupId) {
      setActiveGroupId(nextGroups[0]?.id ?? null);
    }
    pushToast("Đã xóa nhóm", "success");
  }

  function openQuickAdd(anchorPersonId: string | null, relationType: RelationType = "child") {
    if (!anchorPersonId) {
      pushToast("Nhóm này chưa có node gốc", "error");
      return;
    }
    setQuickAddAnchorId(anchorPersonId);
    setQuickAddName("");
    setQuickAddRelationType(relationType);
  }

  async function submitQuickAdd() {
    if (!activeGroupId || !quickAddAnchorId || !quickAddName.trim()) return;
    setQuickAddSubmitting(true);
    const result = await createPersonFromAnchor(
      sb,
      activeGroupId,
      quickAddAnchorId,
      quickAddName.trim(),
      quickAddRelationType,
    );
    if ("error" in result) {
      pushToast(result.error ?? "Thêm thành viên thất bại", "error");
      setQuickAddSubmitting(false);
      return;
    }
    const person = result.data.person as Person;
    const relationship = result.data.relationship as Relationship;
    setPeople((prev) => [...prev, person]);
    setRelationships((prev) => [...prev, relationship]);
    setGroupPersonCount((prev) => ({
      ...prev,
      [activeGroupId]: (prev[activeGroupId] ?? 0) + 1,
    }));
    setSelectedPerson(person);
    setQuickAddAnchorId(null);
    setQuickAddSubmitting(false);
    pushToast("Đã thêm thành viên từ sơ đồ", "success");
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

  function getGroupTypeLabel(groupType: RelationshipGroup["group_type"]) {
    if (groupType === "family") return "Gia đình";
    if (groupType === "company") return "Công ty";
    if (groupType === "friends") return "Bạn bè";
    if (groupType === "clan") return "Dòng họ";
    return "Nhóm khác";
  }

  return (
    <main className="min-h-screen text-slate-900">
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
      {quickAddAnchorId && (
        <div className="fixed inset-0 z-50 grid place-items-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <h3 className="font-semibold">Thêm người liên quan</h3>
            <p className="text-sm text-slate-500">
              Quan hệ với: {people.find((p) => p.id === quickAddAnchorId)?.full_name ?? "Nút neo"}
            </p>
            <input
              className="w-full rounded-lg border p-2 text-sm"
              placeholder="Họ tên"
              value={quickAddName}
              onChange={(e) => setQuickAddName(e.target.value)}
            />
            <select
              className="w-full rounded-lg border p-2 text-sm"
              value={quickAddRelationType}
              onChange={(e) => setQuickAddRelationType(e.target.value as RelationType)}
            >
              {Object.entries(RELATION_LABELS)
                .filter(([key]) => key !== "self")
                .map(([key, label]) => (
                  <option key={key} value={key}>
                    {label}
                  </option>
                ))}
            </select>
            <div className="flex justify-end gap-2">
              <button className="rounded-lg border px-3 py-2 text-sm" onClick={() => setQuickAddAnchorId(null)}>
                Hủy
              </button>
              <button
                disabled={quickAddSubmitting || !quickAddName.trim()}
                className="rounded-lg bg-cyan-600 px-3 py-2 text-sm text-white disabled:opacity-60"
                onClick={() => void submitQuickAdd()}
              >
                {quickAddSubmitting ? "Đang lưu..." : "Lưu"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-[1450px] p-4 lg:p-6">
        <div className="mb-4 rounded-3xl border border-white/50 bg-white/70 p-4 shadow-lg backdrop-blur">
          <div className="mb-3 flex items-start gap-3 pb-1">
            {visibleGroups.map((group) => {
              const isActive = group.id === activeGroupId;
              return (
                <div
                  key={group.id}
                  className={`min-w-[200px] shrink-0 rounded-2xl border px-4 py-3 text-left transition md:w-[calc((100%-4rem)/5)] ${
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
                      <p className="text-xs text-slate-500">{getGroupTypeLabel(group.group_type)}</p>
                      <p className="text-xs text-slate-400">{groupPersonCount[group.id] ?? 0} thành viên</p>
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
            {hiddenGroups.length > 0 && (
              <div className="relative min-w-[120px] shrink-0 md:w-[calc((100%-4rem)/5)]">
                <button
                  onClick={() => setIsHiddenGroupsOpen((prev) => !prev)}
                  className="flex h-full w-full items-center justify-center rounded-2xl border border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-cyan-400 hover:text-cyan-700"
                >
                  +{hiddenGroups.length}
                </button>
                {isHiddenGroupsOpen && (
                  <div className="absolute left-0 top-14 z-30 w-72 rounded-2xl border border-slate-200 bg-white p-2 shadow-xl">
                    <div className="mb-2 flex items-center justify-between px-2 pt-1">
                      <p className="text-sm font-semibold text-slate-800">Nhóm khác</p>
                      <button
                        className="rounded-lg p-1 text-slate-500 hover:bg-slate-100"
                        onClick={() => setIsHiddenGroupsOpen(false)}
                      >
                        <X size={14} />
                      </button>
                    </div>
                    <div className="space-y-1">
                      {hiddenGroups.map((group) => (
                        <button
                          key={group.id}
                          className="w-full rounded-xl px-2 py-2 text-left hover:bg-slate-100"
                          onClick={() => {
                            setActiveGroupId(group.id);
                            setIsHiddenGroupsOpen(false);
                          }}
                        >
                          <p className="truncate text-sm font-semibold text-slate-900">{group.name}</p>
                          <p className="text-xs text-slate-500">
                            {getGroupTypeLabel(group.group_type)} • {groupPersonCount[group.id] ?? 0} thành viên
                          </p>
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
            <button
              onClick={() => void createNewGroup()}
              className="flex min-w-[200px] shrink-0 items-center justify-center gap-2 rounded-2xl border border-dashed border-slate-300 bg-white px-4 py-3 text-sm font-semibold text-slate-700 hover:border-cyan-400 hover:text-cyan-700 md:w-[calc((100%-4rem)/5)]"
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
          <div className="text-sm text-slate-600">Chạm vào một box để mở nhóm tương ứng, sau đó thêm người trực tiếp từ node trên sơ đồ.</div>
          {viewMode === "graph" && (
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-slate-700">Độ sâu hiển thị:</span>
              <button
                onClick={() => setGraphMaxDepth(1)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${graphMaxDepth === 1 ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-700"}`}
              >
                1 bậc
              </button>
              <button
                onClick={() => setGraphMaxDepth(2)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${graphMaxDepth === 2 ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-700"}`}
              >
                2 bậc
              </button>
              <button
                onClick={() => setGraphMaxDepth(3)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${graphMaxDepth === 3 ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-700"}`}
              >
                3 bậc
              </button>
              <button
                onClick={() => setGraphMaxDepth(99)}
                className={`rounded-lg px-2.5 py-1.5 text-xs font-semibold ${graphMaxDepth >= 99 ? "bg-cyan-600 text-white" : "bg-slate-100 text-slate-700"}`}
              >
                Mở tất cả
              </button>
            </div>
          )}
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
                onClick={() => openQuickAdd(selectedPerson?.id ?? activeGroup?.root_person_id ?? people[0]?.id ?? null)}
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
            {viewMode === "graph" && (
              <RelationshipGraph
                nodes={nodes}
                edges={edges}
                highlightedEdgeIds={highlightedEdgeIds}
              />
            )}

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
