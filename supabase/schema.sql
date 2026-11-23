-- SMART-ANHS database. Run once in Supabase: SQL Editor > New query > paste > Run.
-- Safe to re-run: objects are created only if missing, policies are replaced.

-- 1. Profiles: one row per signed-in person, with a role -------------------------
create table if not exists public.profiles (
  id         uuid primary key references auth.users(id) on delete cascade,
  email      text,
  full_name  text,
  role       text not null default 'viewer'
             check (role in ('admin','school_head','teacher','staff','viewer')),
  created_at timestamptz not null default now()
);

-- Role lookup used by every policy. (Named my_role because current_role is reserved in SQL.)
create or replace function public.my_role()
returns text language sql stable security definer set search_path = public as $$
  select role from public.profiles where id = auth.uid()
$$;

-- When a user is created in Supabase Auth, give them a profile.
-- The very first user becomes 'admin'; everyone after that starts as 'viewer'.
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, role)
  values (new.id, new.email,
          case when exists (select 1 from public.profiles) then 'viewer' else 'admin' end)
  on conflict (id) do nothing;
  return new;
end $$;
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- 2. App state: the whole school workspace saved as one JSON document ----------
create table if not exists public.app_state (
  id         int primary key check (id = 1),
  data       jsonb not null default '{}'::jsonb,
  version    int not null default 0,
  updated_at timestamptz not null default now(),
  updated_by uuid references auth.users(id)
);
insert into public.app_state (id) values (1) on conflict (id) do nothing;

-- Every save bumps the version (the app uses it to detect "someone else saved first").
create or replace function public.app_state_touch()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  new.version    := old.version + 1;
  new.updated_at := now();
  new.updated_by := auth.uid();
  insert into public.audit_log (user_id, email, action, detail)
  values (auth.uid(), (select email from public.profiles where id = auth.uid()),
          'state_saved', jsonb_build_object('version', new.version));
  return new;
end $$;

-- 3. Files stored in Google Drive (this table only remembers WHERE they are) ----
create table if not exists public.files (
  id            uuid primary key default gen_random_uuid(),
  drive_file_id text not null unique,
  name          text not null,
  mime_type     text,
  size_bytes    bigint,
  module        text not null default 'General',
  category      text,
  note          text,
  uploaded_by   uuid references auth.users(id),
  uploader      text,
  uploaded_at   timestamptz not null default now()
);
create index if not exists files_uploaded_at_idx on public.files (uploaded_at desc);

-- 4. Audit log (who did what). Only admins can read it. -------------------------
create table if not exists public.audit_log (
  id      bigserial primary key,
  at      timestamptz not null default now(),
  user_id uuid,
  email   text,
  action  text not null,
  detail  jsonb
);

drop trigger if exists app_state_touch_trg on public.app_state;
create trigger app_state_touch_trg before update on public.app_state
  for each row execute function public.app_state_touch();

-- 5. Row Level Security: this is what actually protects the data ---------------
alter table public.profiles  enable row level security;
alter table public.app_state enable row level security;
alter table public.files     enable row level security;
alter table public.audit_log enable row level security;

-- Signed-out visitors get nothing.
revoke all on public.profiles, public.app_state, public.files, public.audit_log from anon;

drop policy if exists "profiles read own or admin" on public.profiles;
create policy "profiles read own or admin" on public.profiles
  for select to authenticated using (id = auth.uid() or public.my_role() = 'admin');

drop policy if exists "profiles admin update" on public.profiles;
create policy "profiles admin update" on public.profiles
  for update to authenticated using (public.my_role() = 'admin') with check (public.my_role() = 'admin');

drop policy if exists "state read signed-in" on public.app_state;
create policy "state read signed-in" on public.app_state
  for select to authenticated using (true);

drop policy if exists "state write editors" on public.app_state;
create policy "state write editors" on public.app_state
  for update to authenticated
  using (public.my_role() in ('admin','school_head'))
  with check (public.my_role() in ('admin','school_head'));

-- Files: any signed-in person can list them. Uploads, downloads and deletes go through
-- the 'drive' Edge Function (it uses the service key), so there are no client write policies.
drop policy if exists "files read signed-in" on public.files;
create policy "files read signed-in" on public.files
  for select to authenticated using (true);

drop policy if exists "audit read admin" on public.audit_log;
create policy "audit read admin" on public.audit_log
  for select to authenticated using (public.my_role() = 'admin');

-- 6. Table permissions for the Data API -----------------------------------------
-- Needed when the project was created with "Grant API access to new tables automatically" OFF.
-- Harmless if it was ON. Row Level Security above still decides which rows each person can touch.
grant usage on schema public to anon, authenticated, service_role;
grant select, update on public.profiles  to authenticated;
grant select, update on public.app_state to authenticated;
grant select         on public.files     to authenticated;
grant select         on public.audit_log to authenticated;
grant all on public.profiles, public.app_state, public.files, public.audit_log to service_role;
grant usage, select on all sequences in schema public to service_role;
grant execute on function public.my_role() to authenticated, service_role;

-- To promote someone later (run in the SQL Editor), for example:
--   update public.profiles set role = 'school_head' where email = 'principal@school.edu.ph';
-- Roles: admin (everything), school_head (edit data, upload, delete files),
--        teacher / staff (read, upload files), viewer (read only).
