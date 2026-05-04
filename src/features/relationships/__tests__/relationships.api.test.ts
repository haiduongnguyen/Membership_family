import { describe, expect, it, vi } from "vitest";
import {
  createRelationship,
  fetchRelationships,
  relationshipExists,
  validateRelationshipInput,
} from "@/features/relationships/api";

function makeClient() {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockResolvedValue({
        data: [{ id: "r1", source_person_id: "p1", target_person_id: "p2", relation_type: "child", group_id: "g1", created_at: "" }],
        error: null,
      }),
      insert: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: "r1", source_person_id: "p1", target_person_id: "p2", relation_type: "child", group_id: "g1", created_at: "" },
        error: null,
      }),
    }),
  } as any;
}

describe("relationships api", () => {
  it("fetchRelationships returns list", async () => {
    const res = await fetchRelationships(makeClient(), "g1");
    expect(res.data.length).toBe(1);
  });

  it("validateRelationshipInput rejects self-link", () => {
    const res = validateRelationshipInput({ source_person_id: "p1", target_person_id: "p1", relation_type: "child" });
    expect("error" in res).toBe(true);
  });

  it("relationshipExists detects duplicate", () => {
    const exists = relationshipExists(
      [{ id: "r1", source_person_id: "p1", target_person_id: "p2", relation_type: "child", group_id: "g1", created_at: "" } as any],
      "p1",
      "p2",
      "child"
    );
    expect(exists).toBe(true);
  });

  it("createRelationship returns row", async () => {
    const res = await createRelationship(makeClient(), "g1", "p1", "p2", "child");
    expect(res.data?.id).toBe("r1");
  });
});
