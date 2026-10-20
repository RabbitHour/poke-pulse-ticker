create table public.market_catalog_groups (
  group_id integer primary key,
  name text not null,
  singles jsonb not null default '[]'::jsonb,
  sealed jsonb not null default '[]'::jsonb,
  singles_count integer not null default 0,
  sealed_count integer not null default 0,
  source_updated text,
  refreshed_at timestamptz not null default now()
);
alter table public.market_catalog_groups enable row level security;
grant all on public.market_catalog_groups to service_role;

create table public.market_index_snapshots (
  id bigint generated always as identity primary key,
  captured_at timestamptz not null default now(),
  market_type text not null check (market_type in ('raw','graded','sealed')),
  value numeric not null check (value > 0),
  change_pct numeric,
  constituents integer not null default 0,
  source text not null,
  meta jsonb not null default '{}'::jsonb
);
create index market_index_snapshots_type_time on public.market_index_snapshots (market_type, captured_at desc);
alter table public.market_index_snapshots enable row level security;
create policy "Anyone can read market index snapshots"
  on public.market_index_snapshots for select
  to anon, authenticated
  using (true);
grant select on public.market_index_snapshots to anon, authenticated;
grant all on public.market_index_snapshots to service_role;