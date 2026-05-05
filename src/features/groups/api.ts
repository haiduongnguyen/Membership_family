import type { SupabaseClient } from "@supabase/supabase-js";
import type { RelationType, RelationshipGroup } from "@/lib/models";

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
  groupType: RelationshipGroup["group_type"],
) {
  const { data, error } = await client
    .from("relationship_groups")
    .insert({ user_id: userId, name, group_type: groupType })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: data as RelationshipGroup };
}

export async function createGroupWithRoot(
  client: SupabaseClient,
  userId: string,
  name: string,
  groupType: RelationshipGroup["group_type"],
  rootPersonName: string,
) {
  const group = await createGroup(client, userId, name, groupType);
  if (!group.data) return group;

  const { data: rootPerson, error: rootPersonError } = await client
    .from("persons")
    .insert({
      group_id: group.data.id,
      full_name: rootPersonName,
      relationship_to_user: "Tôi",
      side: "none",
    })
    .select()
    .single();

  if (rootPersonError) return { error: rootPersonError.message };

  const { data: updatedGroup, error: updateGroupError } = await client
    .from("relationship_groups")
    .update({ root_person_id: (rootPerson as { id: string }).id })
    .eq("id", group.data.id)
    .select()
    .single();

  if (updateGroupError) return { error: updateGroupError.message };
  return {
    data: updatedGroup as RelationshipGroup,
    rootPerson: rootPerson as { id: string; full_name: string },
  };
}

export async function createPersonFromAnchor(
  client: SupabaseClient,
  groupId: string,
  anchorPersonId: string,
  fullName: string,
  relationType: RelationType,
) {
  const { data: person, error: personError } = await client
    .from("persons")
    .insert({
      group_id: groupId,
      full_name: fullName,
      relationship_to_user: "",
      side: "none",
    })
    .select()
    .single();

  if (personError) return { error: personError.message };

  const { data: relationship, error: relationshipError } = await client
    .from("relationships")
    .insert({
      group_id: groupId,
      source_person_id: anchorPersonId,
      target_person_id: (person as { id: string }).id,
      relation_type: relationType,
    })
    .select()
    .single();

  if (relationshipError) return { error: relationshipError.message };
  return { data: { person, relationship } };
}

export async function renameGroup(
  client: SupabaseClient,
  groupId: string,
  name: string,
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
