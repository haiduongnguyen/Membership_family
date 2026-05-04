import { describe, expect, it } from "vitest";
import { eventCreateSchema } from "@/features/events/schema";

describe("event schema", () => {
  it("rejects empty title", () => {
    const parsed = eventCreateSchema.safeParse({ title: "", event_date: "2026-01-01", recurrence: "yearly" });
    expect(parsed.success).toBe(false);
  });

  it("accepts valid payload", () => {
    const parsed = eventCreateSchema.safeParse({ title: "Sinh nhat", event_date: "2026-01-01", recurrence: "yearly" });
    expect(parsed.success).toBe(true);
  });
});
