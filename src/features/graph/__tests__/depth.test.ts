import { describe, expect, it } from "vitest";
import { findVisiblePersonIdsByDepth } from "@/features/graph/depth";
import type { Relationship } from "@/lib/models";

const relationships: Relationship[] = [
  { id: "r1", group_id: "g1", source_person_id: "me", target_person_id: "father", relation_type: "father", created_at: "" },
  { id: "r2", group_id: "g1", source_person_id: "father", target_person_id: "uncle", relation_type: "sibling", created_at: "" },
  { id: "r3", group_id: "g1", source_person_id: "uncle", target_person_id: "cousin", relation_type: "child", created_at: "" },
];

describe("findVisiblePersonIdsByDepth", () => {
  it("keeps only root at depth 0", () => {
    const ids = findVisiblePersonIdsByDepth(relationships, "me", 0);
    expect(ids.size).toBe(1);
    expect(ids.has("me")).toBe(true);
  });

  it("includes nearby nodes by depth", () => {
    const ids = findVisiblePersonIdsByDepth(relationships, "me", 2);
    expect(ids.has("me")).toBe(true);
    expect(ids.has("father")).toBe(true);
    expect(ids.has("uncle")).toBe(true);
    expect(ids.has("cousin")).toBe(false);
  });
});

