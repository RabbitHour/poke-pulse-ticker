-- Private saved research. No browser may grant subscriptions or write its own quota.
create table if not exists public.customer_research_sessions (
 id uuid primary key default gen_random_uuid(),
 user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check(kind in ('poke','predictor')),
 messages jsonb not null default '[]'::jsonb,
 created_at timestamptz not null default now(),
 expires_at timestamptz not null default now()+interval '30 days'
);
alter table public.customer_research_sessions enable row level security;
revoke all on public.customer_research_sessions from anon, authenticated;
grant select on public.customer_research_sessions to authenticated;
grant all on public.customer_research_sessions to service_role;
create policy "Read own unexpired research" on public.customer_research_sessions for select to authenticated using(user_id=auth.uid() and expires_at>now());
create index if not exists customer_research_owner on public.customer_research_sessions(user_id,created_at desc);
create table if not exists public.customer_research_usage (
 user_id uuid not null references auth.users(id) on delete cascade,
 kind text not null check(kind in ('poke','predictor')),
 day date not null default current_date,
 count integer not null default 0,
 primary key(user_id,kind,day)
);
alter table public.customer_research_usage enable row level security;
revoke all on public.customer_research_usage from anon, authenticated;
grant all on public.customer_research_usage to service_role;
create or replace function public.consume_customer_research(p_user uuid,p_kind text) returns integer
language plpgsql security definer set search_path=public,pg_temp as $$
declare used integer;
begin
 if p_kind not in ('poke','predictor') then raise exception 'Invalid research kind'; end if;
 insert into public.customer_research_usage(user_id,kind,day,count) values(p_user,p_kind,current_date,1)
 on conflict(user_id,kind,day) do update set count=customer_research_usage.count+1 where customer_research_usage.count<200
 returning count into used;
 return coalesce(used,0);
end;
$$;
revoke all on function public.consume_customer_research(uuid,text) from public,anon,authenticated;
grant execute on function public.consume_customer_research(uuid,text) to service_role;
