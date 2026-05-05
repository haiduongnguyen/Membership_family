import { describe, expect, it } from "vitest";
import { findPathEdgeIds } from "@/features/graph/path";
import type { Relationship } from "@/lib/models";

const relationships: Relationship[] = [
  {
    id: "r1",
    group_id: "g1",
    source_person_id: "me",
    target_person_id: "father",
    relation_type: "father",
    created_at: "",
  },
  {
    id: "r2",
    group_id: "g1",
    source_person_id: "father",
    target_person_id: "uncle",
    relation_type: "sibling",
    created_at: "",
  },
  {
    id: "r3",
    group_id: "g1",
    source_person_id: "uncle",
    target_person_id: "cousin",
    relation_type: "child",
    created_at: "",
  },
];

describe("findPathEdgeIds", () => {
  it("returns shortest path edge ids", () => {
    const path = findPathEdgeIds(relationships, "me", "cousin");
    expect(path.size).toBe(3);
    expect(path.has("r1")).toBe(true);
    expect(path.has("r2")).toBe(true);
    expect(path.has("r3")).toBe(true);
  });

  it("returns empty set when no path", () => {
    const path = findPathEdgeIds(relationships, "me", "unknown");
    expect(path.size).toBe(0);
  });
});
