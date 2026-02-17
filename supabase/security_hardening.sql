-- ============================================
-- JobKit Security Hardening
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. HARDEN LINKS TABLE
-- Drop existing broad policy
drop policy if exists "Users can manage their own links" on public.links;

-- Create granular policies for better auditability and security
create policy "Users can view their own links"
  on public.links for select
  using (auth.uid() = user_id);

create policy "Users can insert their own links"
  on public.links for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own links"
  on public.links for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own links"
  on public.links for delete
  using (auth.uid() = user_id);

-- Add URL format constraint (basic protection against bad data)
alter table public.links
  add constraint links_url_check check (url ~* '^https?://');

-- 2. HARDEN SNIPPETS TABLE
drop policy if exists "Users can manage their own snippets" on public.snippets;

create policy "Users can view their own snippets"
  on public.snippets for select
  using (auth.uid() = user_id);

create policy "Users can insert their own snippets"
  on public.snippets for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own snippets"
  on public.snippets for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own snippets"
  on public.snippets for delete
  using (auth.uid() = user_id);

-- 3. HARDEN RESUMES TABLE
drop policy if exists "Users can manage their own resumes" on public.resumes;

create policy "Users can view their own resumes"
  on public.resumes for select
  using (auth.uid() = user_id);

create policy "Users can insert their own resumes"
  on public.resumes for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own resumes"
  on public.resumes for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Users can delete their own resumes"
  on public.resumes for delete
  using (auth.uid() = user_id);

-- 4. STORAGE BUCKET SECURITY
-- Ensure storage bucket is private (already done in schema, but good to verify)
update storage.buckets set public = false where id = 'resumes';

-- Policies are already granular in schema.sql, no change needed there.
