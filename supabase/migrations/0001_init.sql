-- FREQ. initial schema.
-- Not applied in the first vertical slice.
-- Enable RLS before any public traffic. Never expose the service role key.

create extension if not exists "pgcrypto";

create table if not exists artworks (
  id text primary key,
  title text not null,
  hero boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists artwork_versions (
  id uuid primary key default gen_random_uuid(),
  artwork_id text not null references artworks(id) on delete cascade,
  version integer not null,
  archival_path text not null,
  created_at timestamptz not null default now()
);

create table if not exists artwork_regions (
  id text primary key,
  artwork_id text not null references artworks(id) on delete cascade,
  label text not null,
  role text not null,
  polygon jsonb not null,
  meaning text,
  published boolean not null default false
);

create table if not exists experience_nodes (
  id text primary key,
  artwork_id text references artworks(id),
  region_id text references artwork_regions(id),
  kind text not null,
  data jsonb not null default '{}'::jsonb
);

create table if not exists worlds (
  id text primary key,
  node_id text references experience_nodes(id),
  title text not null
);

create table if not exists assets (
  id uuid primary key default gen_random_uuid(),
  kind text not null,
  path text not null,
  artwork_id text references artworks(id)
);

create table if not exists daily_states (
  id uuid primary key default gen_random_uuid(),
  artwork_id text not null references artworks(id),
  day date not null,
  seed bigint not null,
  unique (artwork_id, day)
);

create table if not exists generation_jobs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'draft',
  prompt text,
  output_path text,
  approved boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists collective_memory (
  region_id text primary key,
  visits bigint not null default 0,
  updated_at timestamptz not null default now()
);

create table if not exists analytics_events (
  id uuid primary key default gen_random_uuid(),
  event text not null,
  value double precision,
  created_at timestamptz not null default now()
);

alter table artworks enable row level security;
alter table artwork_versions enable row level security;
alter table artwork_regions enable row level security;
alter table experience_nodes enable row level security;
alter table worlds enable row level security;
alter table assets enable row level security;
alter table daily_states enable row level security;
alter table generation_jobs enable row level security;
alter table collective_memory enable row level security;
alter table analytics_events enable row level security;

insert into collective_memory (region_id, visits)
values
  ('cowl', 0), ('plates', 0), ('forward', 0),
  ('visor', 0), ('horns', 0), ('harness', 0),
  ('crown', 0), ('mask', 0), ('strap', 0)
on conflict (region_id) do nothing;

create or replace function touch_region(p_region text)
returns bigint
language plpgsql
security definer
set search_path = public
as $$
declare
  next_visits bigint;
begin
  if p_region not in (
    'cowl', 'plates', 'forward',
    'visor', 'horns', 'harness',
    'crown', 'mask', 'strap'
  ) then
    raise exception 'unknown region';
  end if;

  insert into collective_memory (region_id, visits)
  values (p_region, 1)
  on conflict (region_id) do update
    set visits = collective_memory.visits + 1,
        updated_at = now()
  returning visits into next_visits;

  return next_visits;
end;
$$;

revoke all on function touch_region(text) from public;

-- Public read of published artwork only; writes stay on the server.
create policy artworks_read on artworks for select using (true);
create policy regions_read on artwork_regions for select using (published = true);
