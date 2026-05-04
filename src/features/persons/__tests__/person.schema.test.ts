import { describe, expect, it } from "vitest";
import { personCreateSchema } from "@/features/persons/schema";

describe("person schema", () => {
  it("rejects empty full_name", () => {
    const parsed = personCreateSchema.safeParse({ full_name: "", relationship_to_user: "" });
    expect(parsed.success).toBe(false);
  });

  it("accepts valid data", () => {
    const parsed = personCreateSchema.safeParse({ full_name: "Nguyen Van A", relationship_to_user: "Con" });
    expect(parsed.success).toBe(true);
  });
});
