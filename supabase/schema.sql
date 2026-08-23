-- Visitor recommendations: pending by default, shown only when approved.
-- Run this once in the Supabase SQL editor. Safe to run again.

create table if not exists public.recommendations (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  name text not null,
  role text,
  rel text,
  year text,
  contact text,
  quote text not null,
  photo_path text,
  approved boolean not null default false
);

alter table public.recommendations enable row level security;

-- Visitors can only INSERT rows that are pending. They can never
-- update, delete, or read pending rows. There are no policies for
-- update or delete, so both are denied.
drop policy if exists "anyone can submit a pending review" on public.recommendations;
create policy "anyone can submit a pending review"
  on public.recommendations for insert
  to anon
  with check (approved = false);

drop policy if exists "only approved reviews are visible" on public.recommendations;
create policy "only approved reviews are visible"
  on public.recommendations for select
  to anon
  using (approved = true);

-- The photo bucket. Public read, anonymous upload into pending/ only.
insert into storage.buckets (id, name, public)
  values ('recs', 'recs', true)
  on conflict (id) do nothing;

drop policy if exists "recs are public" on storage.objects;
create policy "recs are public"
  on storage.objects for select
  using (bucket_id = 'recs');

drop policy if exists "anyone can upload a pending photo" on storage.objects;
create policy "anyone can upload a pending photo"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'recs' and (storage.foldername(name))[1] = 'pending');

-- To approve a review: Table editor -> recommendations -> set
-- approved = true on the row. Nothing else is needed.
