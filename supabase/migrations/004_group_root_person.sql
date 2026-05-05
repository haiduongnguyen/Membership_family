alter table public.relationship_groups
  add column if not exists root_person_id uuid;

do $$
begin
  if not exists (
    select 1
    from pg_constraint
    where conname = 'relationship_groups_root_person_id_fkey'
      and conrelid = 'public.relationship_groups'::regclass
  ) then
    alter table public.relationship_groups
      add constraint relationship_groups_root_person_id_fkey
      foreign key (root_person_id)
      references public.persons(id)
      on delete set null;
  end if;
end $$;

create index if not exists idx_relationship_groups_root_person_id
  on public.relationship_groups(root_person_id);
