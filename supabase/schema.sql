-- ============================================
-- JobKit Database Schema
-- Run this in Supabase SQL Editor (supabase.com → your project → SQL Editor)
-- ============================================

-- 1. LINKS TABLE
create table public.links (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  label text not null,
  url text not null,
  category text default 'general',
  icon text,
  created_at timestamptz default now() not null
);

alter table public.links enable row level security;

create policy "Users can manage their own links"
  on public.links for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 2. SNIPPETS TABLE
create table public.snippets (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  title text not null,
  body text not null,
  tags text[] default '{}',
  created_at timestamptz default now() not null
);

alter table public.snippets enable row level security;

create policy "Users can manage their own snippets"
  on public.snippets for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 3. RESUMES TABLE
create table public.resumes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  label text not null,
  role_type text,
  storage_path text not null,
  created_at timestamptz default now() not null
);

alter table public.resumes enable row level security;

create policy "Users can manage their own resumes"
  on public.resumes for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. STORAGE BUCKET FOR RESUMES
insert into storage.buckets (id, name, public)
  values ('resumes', 'resumes', false)
  on conflict (id) do nothing;

create policy "Users can upload their own resumes"
  on storage.objects for insert
  with check (
    bucket_id = 'resumes' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can read their own resumes"
  on storage.objects for select
  using (
    bucket_id = 'resumes' and
    auth.uid()::text = (storage.foldername(name))[1]
  );

create policy "Users can delete their own resumes"
  on storage.objects for delete
  using (
    bucket_id = 'resumes' and
    auth.uid()::text = (storage.foldername(name))[1]
  );
