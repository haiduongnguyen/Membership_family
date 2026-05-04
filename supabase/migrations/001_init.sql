create extension if not exists "pgcrypto";

create table if not exists users (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null unique,
  display_name text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists relationship_groups (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  group_type text not null check (group_type in ('family','company','friends','clan','other')),
  created_at timestamptz not null default now()
);

create table if not exists persons (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references relationship_groups(id) on delete cascade,
  full_name text not null,
  avatar_url text,
  birth_date date,
  phone text,
  address text,
  occupation text,
  relationship_to_user text,
  side text check (side in ('paternal','maternal','none')) default 'none',
  generation_level int,
  is_deceased boolean not null default false,
  notes text,
  created_at timestamptz not null default now()
);

create table if not exists relationships (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references relationship_groups(id) on delete cascade,
  source_person_id uuid not null references persons(id) on delete cascade,
  target_person_id uuid not null references persons(id) on delete cascade,
  relation_type text not null,
  created_at timestamptz not null default now(),
  constraint no_self_relation check (source_person_id <> target_person_id)
);

create table if not exists events (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references relationship_groups(id) on delete cascade,
  person_id uuid references persons(id) on delete set null,
  title text not null,
  event_date date not null,
  recurrence text not null default 'once' check (recurrence in ('once','monthly','yearly')),
  description text,
  photo_url text,
  created_at timestamptz not null default now()
);

create table if not exists event_participants (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references events(id) on delete cascade,
  person_id uuid not null references persons(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique(event_id, person_id)
);

create table if not exists photos (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references relationship_groups(id) on delete cascade,
  person_id uuid references persons(id) on delete set null,
  event_id uuid references events(id) on delete set null,
  photo_url text not null,
  caption text,
  created_at timestamptz not null default now()
);

create table if not exists notes (
  id uuid primary key default gen_random_uuid(),
  group_id uuid not null references relationship_groups(id) on delete cascade,
  person_id uuid references persons(id) on delete cascade,
  body text not null,
  created_at timestamptz not null default now()
);
