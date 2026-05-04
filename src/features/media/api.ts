import type { SupabaseClient } from "@supabase/supabase-js";

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export function validateImageFile(file: File) {
  if (!ALLOWED_TYPES.includes(file.type)) {
    return { error: "Dinh dang anh khong ho tro" };
  }
  if (file.size > MAX_FILE_SIZE) {
    return { error: "Anh vuot qua gioi han 5MB" };
  }
  return { ok: true };
}

export async function uploadImage(
  client: SupabaseClient,
  bucket: string,
  path: string,
  file: File
) {
  const validation = validateImageFile(file);
  if ("error" in validation) return validation;

  const { error } = await client.storage.from(bucket).upload(path, file, { upsert: true });
  if (error) return { error: error.message };

  const { data } = client.storage.from(bucket).getPublicUrl(path);
  return { publicUrl: data.publicUrl };
}

export async function uploadPersonAvatar(
  client: SupabaseClient,
  personId: string,
  file: File
) {
  const path = `avatars/${personId}-${Date.now()}-${file.name}`;
  return uploadImage(client, "relationship-media", path, file);
}

export async function uploadEventImage(
  client: SupabaseClient,
  eventId: string,
  file: File
) {
  const path = `events/${eventId}-${Date.now()}-${file.name}`;
  return uploadImage(client, "relationship-media", path, file);
}
