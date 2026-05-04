import { describe, expect, it } from "vitest";

describe("schema contract", () => {
  it("contains required table names", async () => {
    const fs = await import("node:fs/promises");
    const sql = await fs.readFile("supabase/migrations/001_init.sql", "utf8");
    ["users", "relationship_groups", "persons", "relationships", "events", "event_participants", "photos", "notes"].forEach((table) => {
      expect(sql).toContain(`create table if not exists ${table}`);
    });
  });
});
