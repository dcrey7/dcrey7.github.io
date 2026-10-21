-- Visitor recommendations: pending by default, shown only when approved.
-- Run this once in the Supabase SQL editor of a NEW project. Safe to run again.
--
-- STATUS 2026-10-22: the old project (tzahyhzkxhedcuobalkr) is gone, and the
-- form on the site is switched off (SUPA.open = false in js/data.js).
--
-- Privacy rules this file enforces:
--   1. Visitors (the anon role) can INSERT a pending row and nothing else on
--      the table. They cannot read it back, change it or delete it.
--   2. The public reads approved rows only through the view
--      public.recommendations_public, which has NO contact column. The
--      contact (LinkedIn or email) is for the owner only.
--   3. Photos land in a PRIVATE bucket under pending/. Nobody can list or
--      read pending photos. Only files the owner moves to approved/ are
--      readable.
--
-- Abuse: the anon key is public, so anyone can script inserts. Before you
-- switch the form back on, add at least one of these:
--   - Cloudflare Turnstile on the form, checked by a Pages Function that
--     then inserts with a server-side key (the best option), or
--   - Supabase's built-in CAPTCHA support plus a rate limit at the edge
--     (a Cloudflare rate limiting rule on the Supabase calls).
-- The length checks below stop the worst payloads, not floods.

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

-- keep every field a sane size
alter table public.recommendations drop constraint if exists rec_sizes;
alter table public.recommendations add constraint rec_sizes check (
  char_length(name) <= 120
  and char_length(coalesce(role, '')) <= 160
  and char_length(coalesce(rel, '')) <= 80
  and char_length(coalesce(year, '')) <= 20
  and char_length(coalesce(contact, '')) <= 200
  and char_length(quote) <= 2000
  and char_length(coalesce(photo_path, '')) <= 200
);

alter table public.recommendations enable row level security;

-- anon may insert, and only pending rows. No select, update or delete.
revoke all on public.recommendations from anon;
grant insert on public.recommendations to anon;

drop policy if exists "anyone can submit a pending review" on public.recommendations;
create policy "anyone can submit a pending review"
  on public.recommendations for insert
  to anon
  with check (
    approved = false
    and (photo_path is null or photo_path like 'pending/%')
  );

-- the old policy let anon read approved rows from the table itself,
-- contact column included. It is gone; the view below replaces it.
drop policy if exists "only approved reviews are visible" on public.recommendations;

-- The public view: approved rows, no contact column. It runs with the
-- owner's rights (security_invoker = false), so it does not need a select
-- policy on the table; the WHERE clause is the filter.
create or replace view public.recommendations_public
  with (security_invoker = false) as
  select id, created_at, name, role, rel, year, quote, photo_path
  from public.recommendations
  where approved = true;

revoke all on public.recommendations_public from anon, authenticated;
grant select on public.recommendations_public to anon;

-- The photo bucket: PRIVATE, small images only.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
  values ('recs', 'recs', false, 2097152,
          array['image/jpeg', 'image/png', 'image/webp'])
  on conflict (id) do update
    set public = false,
        file_size_limit = excluded.file_size_limit,
        allowed_mime_types = excluded.allowed_mime_types;

-- the old policy made every file (pending ones too) readable and listable
drop policy if exists "recs are public" on storage.objects;

drop policy if exists "approved recs are readable" on storage.objects;
create policy "approved recs are readable"
  on storage.objects for select
  to anon
  using (bucket_id = 'recs' and (storage.foldername(name))[1] = 'approved');

drop policy if exists "anyone can upload a pending photo" on storage.objects;
create policy "anyone can upload a pending photo"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'recs' and (storage.foldername(name))[1] = 'pending');

-- To approve a review:
--   1. Table editor -> recommendations -> set approved = true on the row.
--   2. If it has a photo, move the file from pending/ to approved/ in the
--      Storage browser, and update photo_path to match.
-- Delete rows you do not approve within 6 months (the privacy notice on
-- /legal promises this), and their pending photos with them.
-- The site reads approved rows from recommendations_public, never from
-- the table. Photos are fetched with the anon key from
-- /storage/v1/object/authenticated/recs/approved/<file>.
