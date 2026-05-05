import { describe, expect, it, vi } from "vitest";
import { createGroup, createGroupWithRoot, createPersonFromAnchor, fetchGroups } from "@/features/groups/api";

function makeClientForFetchAndCreate() {
  const relationshipGroups = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    order: vi.fn().mockResolvedValue({
      data: [{ id: "g1", user_id: "u1", name: "Gia đình", group_type: "family", root_person_id: null, created_at: "" }],
      error: null,
    }),
    insert: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({
      data: { id: "g1", user_id: "u1", name: "Gia đình", group_type: "family", root_person_id: null, created_at: "" },
      error: null,
    }),
  };

  return {
    from: vi.fn(() => relationshipGroups),
  } as any;
}

function makeClientForCreateGroupWithRoot() {
  const relationshipGroups = {
    select: vi.fn().mockReturnThis(),
    eq: vi.fn().mockReturnThis(),
    insert: vi.fn().mockReturnThis(),
    update: vi.fn().mockReturnThis(),
    single: vi
      .fn()
      .mockResolvedValueOnce({
        data: { id: "g1", user_id: "u1", name: "Gia đình", group_type: "family", root_person_id: null, created_at: "" },
        error: null,
      })
      .mockResolvedValueOnce({
        data: { id: "g1", user_id: "u1", name: "Gia đình", group_type: "family", root_person_id: "p_root", created_at: "" },
        error: null,
      }),
  };

  const persons = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { id: "p_root", full_name: "Tôi" }, error: null }),
  };

  return {
    from: vi.fn((table: string) => (table === "relationship_groups" ? relationshipGroups : persons)),
  } as any;
}

function makeClientForCreatePersonFromAnchor() {
  const persons = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { id: "p2", full_name: "Mẹ" }, error: null }),
  };

  const relationships = {
    insert: vi.fn().mockReturnThis(),
    select: vi.fn().mockReturnThis(),
    single: vi.fn().mockResolvedValue({ data: { id: "r1", source_person_id: "p_root", target_person_id: "p2", relation_type: "mother" }, error: null }),
  };

  return {
    from: vi.fn((table: string) => (table === "persons" ? persons : relationships)),
  } as any;
}

describe("groups api", () => {
  it("fetchGroups returns list", async () => {
    const res = await fetchGroups(makeClientForFetchAndCreate(), "u1");
    expect(res.data.length).toBe(1);
  });

  it("createGroup returns group", async () => {
    const res = await createGroup(makeClientForFetchAndCreate(), "u1", "Gia đình", "family");
    expect(res.data?.name).toBe("Gia đình");
  });

  it("createGroupWithRoot creates group and root person", async () => {
    const res = await createGroupWithRoot(makeClientForCreateGroupWithRoot(), "u1", "Gia đình", "family", "Tôi");
    if ("error" in res) throw new Error(res.error);
    expect(res.data?.root_person_id).toBe("p_root");
    expect(res.rootPerson?.id).toBe("p_root");
  });

  it("createPersonFromAnchor creates person and relationship", async () => {
    const res = await createPersonFromAnchor(makeClientForCreatePersonFromAnchor(), "g1", "p_root", "Mẹ", "mother");
    if ("error" in res) throw new Error(res.error);
    expect((res.data.person as { id: string }).id).toBe("p2");
    expect((res.data.relationship as { relation_type: string }).relation_type).toBe("mother");
  });
});
