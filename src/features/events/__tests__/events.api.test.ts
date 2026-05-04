import { describe, expect, it, vi } from "vitest";
import { createEvent, fetchEvents, mapEventsToCalendar, updateEventPhoto } from "@/features/events/api";

function makeClient() {
  return {
    from: vi.fn().mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({
        data: [{ id: "e1", title: "SN", event_date: "2026-01-01", group_id: "g1", recurrence: "yearly", person_id: null, description: null, photo_url: null, created_at: "" }],
        error: null,
      }),
      insert: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      single: vi.fn().mockResolvedValue({
        data: { id: "e1", title: "SN", event_date: "2026-01-01", group_id: "g1", recurrence: "yearly", person_id: null, description: null, photo_url: null, created_at: "" },
        error: null,
      }),
    }),
  } as any;
}

describe("events api", () => {
  it("fetchEvents returns rows", async () => {
    const res = await fetchEvents(makeClient(), "g1");
    expect(res.data.length).toBe(1);
  });

  it("createEvent returns row", async () => {
    const res = await createEvent(makeClient(), "g1", { title: "SN", event_date: "2026-01-01", recurrence: "yearly" });
    expect(res.data?.id).toBe("e1");
  });

  it("updateEventPhoto returns ok", async () => {
    const res = await updateEventPhoto(makeClient(), "e1", "https://x/y.jpg");
    expect(res.ok).toBe(true);
  });

  it("mapEventsToCalendar filters by person", () => {
    const out = mapEventsToCalendar([
      { id: "e1", title: "A", event_date: "2026-01-01", person_id: "p1" },
      { id: "e2", title: "B", event_date: "2026-02-01", person_id: null },
    ] as any, "p1");
    expect(out).toHaveLength(1);
    expect(out[0].id).toBe("e1");
  });
});
