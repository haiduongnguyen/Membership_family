import type { SupabaseClient } from "@supabase/supabase-js";
import type { Person } from "@/lib/models";
import type { PersonCreateInput } from "@/features/persons/schema";

export async function fetchPersons(client: SupabaseClient, groupId: string) {
  const { data, error } = await client
    .from("persons")
    .select("*")
    .eq("group_id", groupId)
    .order("created_at");

  if (error) return { error: error.message, data: [] as Person[] };
  return { data: (data as Person[]) ?? [] };
}

export async function createPerson(
  client: SupabaseClient,
  groupId: string,
  payload: PersonCreateInput
) {
  const { data, error } = await client
    .from("persons")
    .insert({
      group_id: groupId,
      full_name: payload.full_name,
      relationship_to_user: payload.relationship_to_user ?? "",
      side: "none",
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: data as Person };
}

export async function updatePerson(client: SupabaseClient, person: Person) {
  const { error } = await client.from("persons").update(person).eq("id", person.id);
  if (error) return { error: error.message };
  return { ok: true };
}
