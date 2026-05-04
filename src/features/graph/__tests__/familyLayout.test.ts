import { describe, expect, it } from "vitest";
import { buildFamilyLayout } from "@/features/graph/layout/familyLayout";

describe("family layout", () => {
  it("returns empty for no people", () => {
    expect(buildFamilyLayout([], [])).toEqual([]);
  });

  it("positions root and child on different rows", () => {
    const people = [
      { id: "p1", full_name: "Root" },
      { id: "p2", full_name: "Child" },
    ] as any;
    const relationships = [
      { source_person_id: "p1", target_person_id: "p2", relation_type: "child" },
    ] as any;

    const points = buildFamilyLayout(people, relationships);
    const p1 = points.find((p) => p.id === "p1");
    const p2 = points.find((p) => p.id === "p2");

    expect(p1).toBeDefined();
    expect(p2).toBeDefined();
    expect((p1?.y ?? 0) < (p2?.y ?? 0)).toBe(true);
  });
});
