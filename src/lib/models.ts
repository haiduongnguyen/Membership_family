export type GroupType = "family" | "company" | "friends" | "clan" | "other";

export type RelationType =
  | "self"
  | "father"
  | "mother"
  | "sibling"
  | "grandparent"
  | "uncle_aunt"
  | "cousin"
  | "spouse"
  | "child"
  | "friend"
  | "colleague"
  | "manager"
  | "employee";

export type RecurrenceType = "once" | "monthly" | "yearly";

export interface RelationshipGroup {
  id: string;
  user_id: string;
  name: string;
  group_type: GroupType;
  created_at: string;
}

export interface AppUser {
  id: string;
  email: string;
  display_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface Person {
  id: string;
  group_id: string;
  full_name: string;
  avatar_url: string | null;
  birth_date: string | null;
  phone: string | null;
  address: string | null;
  occupation: string | null;
  relationship_to_user: string | null;
  side: "paternal" | "maternal" | "none" | null;
  generation_level: number | null;
  is_deceased: boolean;
  notes: string | null;
  created_at: string;
}

export interface Relationship {
  id: string;
  group_id: string;
  source_person_id: string;
  target_person_id: string;
  relation_type: RelationType;
  created_at: string;
}

export interface EventItem {
  id: string;
  group_id: string;
  person_id: string | null;
  title: string;
  event_date: string;
  recurrence: RecurrenceType;
  description: string | null;
  photo_url: string | null;
  created_at: string;
}
