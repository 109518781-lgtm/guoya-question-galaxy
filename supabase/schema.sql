create extension if not exists pgcrypto;

create table if not exists public.stars (
  id uuid primary key default gen_random_uuid(),
  content text not null,
  source text default 'tablet' not null,
  status text default 'published' not null,
  likes integer default 0 not null,
  featured boolean default false not null,
  created_at timestamptz default now() not null,
  constraint stars_status_check check (status in ('published', 'hidden')),
  constraint stars_source_check check (source in ('tablet', 'xiaohongshu', 'douyin', 'wechat', 'manual')),
  constraint stars_content_length_check check (char_length(trim(content)) between 1 and 120),
  constraint stars_likes_check check (likes >= 0)
);

create index if not exists stars_status_created_at_idx on public.stars (status, created_at desc);
create index if not exists stars_featured_idx on public.stars (featured) where featured = true;

create or replace function public.increment_star_likes(star_id uuid)
returns public.stars
language plpgsql
security definer
set search_path = public
as $$
declare
  updated_star public.stars;
begin
  update public.stars
  set likes = likes + 1
  where id = star_id
    and status = 'published'
  returning * into updated_star;

  if updated_star.id is null then
    raise exception 'star_not_found';
  end if;

  return updated_star;
end;
$$;

grant execute on function public.increment_star_likes(uuid) to anon, authenticated;

alter table public.stars enable row level security;

drop policy if exists "Public can read published stars" on public.stars;
create policy "Public can read published stars"
on public.stars
for select
to anon, authenticated
using (status = 'published');

drop policy if exists "Anyone can submit tablet stars" on public.stars;
create policy "Anyone can submit tablet stars"
on public.stars
for insert
to anon, authenticated
with check (
  source = 'tablet'
  and status = 'published'
  and featured = false
  and likes = 0
);

alter table public.stars replica identity full;

do $$
begin
  if not exists (
    select 1
    from pg_publication_tables
    where pubname = 'supabase_realtime'
      and schemaname = 'public'
      and tablename = 'stars'
  ) then
    alter publication supabase_realtime add table public.stars;
  end if;
end $$;
