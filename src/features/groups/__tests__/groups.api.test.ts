import { describe, expect, it, vi } from "vitest";
import { createGroup, fetchGroups } from "@/features/groups/api";

function makeClient() {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [{ id: "g1", user_id: "u1", name: "Gia dinh", group_type: "family", created_at: "" }],
        error: null,
      }),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: "g1", user_id: "u1", name: "Gia dinh", group_type: "family", created_at: "" },
        error: null,
      }),
    }),
  } as any;
}

describe("groups api", () => {
  it("fetchGroups returns list", async () => {
    const res = await fetchGroups(makeClient(), "u1");
    expect(res.data.length).toBe(1);
  });

  it("createGroup returns group", async () => {
    const res = await createGroup(makeClient(), "u1", "Gia dinh", "family");
    expect(res.data?.name).toBe("Gia dinh");
  });
});
