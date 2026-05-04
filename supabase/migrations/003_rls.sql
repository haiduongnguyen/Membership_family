alter table users enable row level security;
alter table relationship_groups enable row level security;
alter table persons enable row level security;
alter table relationships enable row level security;
alter table events enable row level security;
alter table event_participants enable row level security;
alter table photos enable row level security;
alter table notes enable row level security;

drop policy if exists users_owner on users;
create policy users_owner on users for all using (auth.uid() = id) with check (auth.uid() = id);

drop policy if exists groups_owner on relationship_groups;
create policy groups_owner on relationship_groups for all using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists persons_by_group_owner on persons;
create policy persons_by_group_owner on persons for all
using (exists (select 1 from relationship_groups g where g.id = group_id and g.user_id = auth.uid()))
with check (exists (select 1 from relationship_groups g where g.id = group_id and g.user_id = auth.uid()));

drop policy if exists relationships_by_group_owner on relationships;
create policy relationships_by_group_owner on relationships for all
using (exists (select 1 from relationship_groups g where g.id = group_id and g.user_id = auth.uid()))
with check (exists (select 1 from relationship_groups g where g.id = group_id and g.user_id = auth.uid()));

drop policy if exists events_by_group_owner on events;
create policy events_by_group_owner on events for all
using (exists (select 1 from relationship_groups g where g.id = group_id and g.user_id = auth.uid()))
with check (exists (select 1 from relationship_groups g where g.id = group_id and g.user_id = auth.uid()));

drop policy if exists event_participants_by_event_owner on event_participants;
create policy event_participants_by_event_owner on event_participants for all
using (exists (select 1 from events e join relationship_groups g on g.id = e.group_id where e.id = event_id and g.user_id = auth.uid()))
with check (exists (select 1 from events e join relationship_groups g on g.id = e.group_id where e.id = event_id and g.user_id = auth.uid()));

drop policy if exists photos_by_group_owner on photos;
create policy photos_by_group_owner on photos for all
using (exists (select 1 from relationship_groups g where g.id = group_id and g.user_id = auth.uid()))
with check (exists (select 1 from relationship_groups g where g.id = group_id and g.user_id = auth.uid()));

drop policy if exists notes_by_group_owner on notes;
create policy notes_by_group_owner on notes for all
using (exists (select 1 from relationship_groups g where g.id = group_id and g.user_id = auth.uid()))
with check (exists (select 1 from relationship_groups g where g.id = group_id and g.user_id = auth.uid()));
