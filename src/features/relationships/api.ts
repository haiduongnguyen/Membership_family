import type { SupabaseClient } from "@supabase/supabase-js";
import type { Relationship, RelationType } from "@/lib/models";

export async function fetchRelationships(client: SupabaseClient, groupId: string) {
  const { data, error } = await client
    .from("relationships")
    .select("*")
    .eq("group_id", groupId);

  if (error) return { error: error.message, data: [] as Relationship[] };
  return { data: (data as Relationship[]) ?? [] };
}

export function validateRelationshipInput(input: {
  source_person_id: string;
  target_person_id: string;
  relation_type: RelationType;
}) {
  if (input.source_person_id === input.target_person_id) {
    return { error: "Khong the tao quan he voi chinh minh" };
  }
  return { ok: true };
}

export function relationshipExists(
  relationships: Relationship[],
  sourceId: string,
  targetId: string,
  relationType: RelationType
) {
  return relationships.some(
    (r) =>
      r.source_person_id === sourceId &&
      r.target_person_id === targetId &&
      r.relation_type === relationType
  );
}

export async function createRelationship(
  client: SupabaseClient,
  groupId: string,
  sourceId: string,
  targetId: string,
  relationType: RelationType,
  options?: { id?: string }
) {
  const { data, error } = await client
    .from("relationships")
    .insert({
      ...(options?.id ? { id: options.id } : {}),
      group_id: groupId,
      source_person_id: sourceId,
      target_person_id: targetId,
      relation_type: relationType,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: data as Relationship };
}

export async function deleteRelationship(client: SupabaseClient, relationshipId: string) {
  const { error } = await client.from("relationships").delete().eq("id", relationshipId);
  if (error) return { error: error.message };
  return { ok: true };
}

export async function updateRelationship(
  client: SupabaseClient,
  relationshipId: string,
  input: {
    source_person_id: string;
    target_person_id: string;
    relation_type: RelationType;
  },
) {
  const { data, error } = await client
    .from("relationships")
    .update(input)
    .eq("id", relationshipId)
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: data as Relationship };
}
