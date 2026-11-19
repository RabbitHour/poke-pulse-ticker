-- Owner-only audit records are served by authenticated server handlers, never directly to collector accounts.
alter table public.poke_agent_settings add column if not exists last_run_at timestamptz;
create index if not exists poke_agent_reports_created_idx on public.poke_agent_reports(created_at desc);
revoke all on public.site_audits, public.audit_actions from public, anon, authenticated;
-- Existing service-role writes are preserved; legacy command-center now routes to the owner-only screen.
