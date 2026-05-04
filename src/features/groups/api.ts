import type { SupabaseClient } from "@supabase/supabase-js";
import type { RelationshipGroup } from "@/lib/models";

export async function fetchGroups(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from("relationship_groups")
    .select("*")
    .eq("user_id", userId)
    .order("created_at");

  if (error) return { error: error.message, data: [] as RelationshipGroup[] };
  return { data: (data as RelationshipGroup[]) ?? [] };
}

export async function createGroup(
  client: SupabaseClient,
  userId: string,
  name: string,
  groupType: RelationshipGroup["group_type"]
) {
  const { data, error } = await client
    .from("relationship_groups")
    .insert({ user_id: userId, name, group_type: groupType })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: data as RelationshipGroup };
}

export async function renameGroup(
  client: SupabaseClient,
  groupId: string,
  name: string
) {
  const { data, error } = await client
    .from("relationship_groups")
    .update({ name })
    .eq("id", groupId)
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: data as RelationshipGroup };
}

export async function deleteGroup(client: SupabaseClient, groupId: string) {
  const { error } = await client
    .from("relationship_groups")
    .delete()
    .eq("id", groupId);

  if (error) return { error: error.message };
  return { ok: true };
}
