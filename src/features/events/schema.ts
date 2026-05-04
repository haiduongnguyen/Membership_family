import { z } from "zod";

export const eventCreateSchema = z.object({
  title: z.string().min(1, "Tên sự kiện không được rỗng").max(160),
  event_date: z.string().min(1, "Ngày sự kiện không được rỗng"),
  recurrence: z.enum(["once", "monthly", "yearly"]),
  person_id: z.string().nullable().optional(),
  description: z.string().max(500).optional(),
});

export type EventCreateInput = z.infer<typeof eventCreateSchema>;
