-- Only the server function, after verified owner UUID authorization, can access these tables.
create table public.poke_agent_settings (id integer primary key check (id=1), enabled boolean not null default false, updated_at timestamptz not null default now());
insert into public.poke_agent_settings(id) values (1);
create table public.poke_agent_reports (id uuid primary key default gen_random_uuid(), created_at timestamptz not null default now(), report jsonb not null);
alter table public.poke_agent_settings enable row level security;
alter table public.poke_agent_reports enable row level security;
revoke all on public.poke_agent_settings, public.poke_agent_reports from public, anon, authenticated;
grant select, update on public.poke_agent_settings to service_role;
grant select, insert on public.poke_agent_reports to service_role;
-- No public/client policies. Scheduling is configured separately and starts paused.
