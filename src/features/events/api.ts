import type { SupabaseClient } from "@supabase/supabase-js";
import type { EventItem } from "@/lib/models";
import type { EventCreateInput } from "@/features/events/schema";

export async function fetchEvents(client: SupabaseClient, groupId: string) {
  const { data, error } = await client
    .from("events")
    .select("*")
    .eq("group_id", groupId)
    .order("event_date");

  if (error) return { error: error.message, data: [] as EventItem[] };
  return { data: (data as EventItem[]) ?? [] };
}

export async function createEvent(
  client: SupabaseClient,
  groupId: string,
  payload: EventCreateInput
) {
  const { data, error } = await client
    .from("events")
    .insert({
      group_id: groupId,
      title: payload.title,
      event_date: payload.event_date,
      recurrence: payload.recurrence,
      person_id: payload.person_id ?? null,
      description: payload.description ?? null,
    })
    .select()
    .single();

  if (error) return { error: error.message };
  return { data: data as EventItem };
}

export async function updateEventPhoto(
  client: SupabaseClient,
  eventId: string,
  photoUrl: string
) {
  const { error } = await client
    .from("events")
    .update({ photo_url: photoUrl })
    .eq("id", eventId);

  if (error) return { error: error.message };
  return { ok: true };
}

export function mapEventsToCalendar(
  events: EventItem[],
  filterPersonId?: string | null
) {
  return events
    .filter((event) => !filterPersonId || event.person_id === filterPersonId)
    .map((event) => ({
      id: event.id,
      title: event.title,
      date: event.event_date,
    }));
}
