-- VikKreative admin database. Run this ONCE in Supabase: SQL Editor > New query > paste all > Run.
-- Before running, change the email on the LAST line to the email the client will log in with.

-- 1) Who may edit the site
create table if not exists public.admins (email text primary key);
alter table public.admins enable row level security; -- no policies: nobody can read this table directly

create or replace function public.is_admin() returns boolean
language sql security definer set search_path = '' stable as $$
  select exists (select 1 from public.admins where lower(email) = lower(coalesce(auth.jwt() ->> 'email', '')))
$$;

-- 2) Projects
create table if not exists public.projects (
  id uuid primary key default gen_random_uuid(),
  slug text not null unique,
  title text not null,
  category text not null default '',
  summary text not null default '',
  description text not null default '',
  client text not null default '',
  role text not null default '',
  year text not null default '',
  delivery_time text not null default '',
  tools text[] not null default '{}',
  link text not null default '',
  cover_url text not null default '',
  gallery text[] not null default '{}',
  sort_order int not null default 0,
  published boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
alter table public.projects enable row level security;
drop policy if exists "projects public read" on public.projects;
drop policy if exists "projects admin all" on public.projects;
create policy "projects public read" on public.projects for select using (published = true or public.is_admin());
create policy "projects admin all" on public.projects for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 3) Site text (about, hero, tools, services, process, testimonials) stored as one JSON row
create table if not exists public.site_settings (
  id int primary key default 1 check (id = 1),
  data jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);
alter table public.site_settings enable row level security;
drop policy if exists "site public read" on public.site_settings;
drop policy if exists "site admin all" on public.site_settings;
create policy "site public read" on public.site_settings for select using (true);
create policy "site admin all" on public.site_settings for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- 4) Image storage (public bucket, only the admin can upload or delete)
insert into storage.buckets (id, name, public) values ('portfolio', 'portfolio', true) on conflict (id) do nothing;
drop policy if exists "portfolio public read" on storage.objects;
drop policy if exists "portfolio admin insert" on storage.objects;
drop policy if exists "portfolio admin update" on storage.objects;
drop policy if exists "portfolio admin delete" on storage.objects;
create policy "portfolio public read" on storage.objects for select using (bucket_id = 'portfolio');
create policy "portfolio admin insert" on storage.objects for insert to authenticated with check (bucket_id = 'portfolio' and public.is_admin());
create policy "portfolio admin update" on storage.objects for update to authenticated using (bucket_id = 'portfolio' and public.is_admin());
create policy "portfolio admin delete" on storage.objects for delete to authenticated using (bucket_id = 'portfolio' and public.is_admin());

-- 5) CHANGE THIS EMAIL to the admin login email, then run
insert into public.admins (email) values ('supportdoc11@gmail.com') on conflict do nothing;
