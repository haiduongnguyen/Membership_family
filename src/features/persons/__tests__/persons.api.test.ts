import { describe, expect, it, vi } from "vitest";
import { createPerson, fetchPersons, updatePerson } from "@/features/persons/api";

function makeClient() {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [{ id: "p1", full_name: "A", group_id: "g1", created_at: "" }],
        error: null,
      }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: "p1", full_name: "A", group_id: "g1", created_at: "" },
        error: null,
      }),
    }),
  } as any;
}

describe("persons api", () => {
  it("fetchPersons returns list", async () => {
    const res = await fetchPersons(makeClient(), "g1");
    expect(res.data.length).toBe(1);
  });

  it("createPerson returns person", async () => {
    const res = await createPerson(makeClient(), "g1", { full_name: "A", relationship_to_user: "Con" });
    expect(res.data?.id).toBe("p1");
  });

  it("updatePerson returns ok", async () => {
    const res = await updatePerson(makeClient(), { id: "p1", group_id: "g1", full_name: "A", avatar_url: null, birth_date: null, phone: null, address: null, occupation: null, relationship_to_user: null, side: "none", generation_level: null, is_deceased: false, notes: null, created_at: "" });
    expect(res.ok).toBe(true);
  });
});
