-- Run this once in Supabase > SQL Editor > New query > Run.
-- It only adds the new project page fields. It does not touch your existing data.

-- Extra project page fields (safe to run again)
alter table public.projects add column if not exists video_url text not null default '';
alter table public.projects add column if not exists mockups text[] not null default '{}';
alter table public.projects add column if not exists wireframes text[] not null default '{}';
alter table public.projects add column if not exists problem text not null default '';
alter table public.projects add column if not exists approach text not null default '';
alter table public.projects add column if not exists results text not null default '';
alter table public.projects add column if not exists process text not null default '';
alter table public.projects add column if not exists quote text not null default '';
alter table public.projects add column if not exists quote_name text not null default '';
alter table public.projects add column if not exists quote_role text not null default '';
