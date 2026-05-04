import { z } from "zod";

export const personCreateSchema = z.object({
  full_name: z.string().min(1, "Tên không được rỗng").max(120),
  relationship_to_user: z.string().max(120).optional().default(""),
});

export type PersonCreateInput = z.infer<typeof personCreateSchema>;
