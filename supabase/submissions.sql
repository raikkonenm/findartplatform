-- Run only in the dedicated PRIVATE Supabase project after review.
-- No applicant data is committed here; all tables deny anon/authenticated access.
create table if not exists public.findart_submission_jobs (
  id uuid primary key default gen_random_uuid(),
  fingerprint text not null,
  payload jsonb not null,
  progress jsonb not null default '{}',
  status text not null default 'pending' check (status in ('pending','prepared','sending','complete','review','error')),
  lease_owner uuid,
  lease_until timestamptz,
  error_code text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists findart_submission_pending on public.findart_submission_jobs(status, created_at);
create index if not exists findart_submission_fingerprints on public.findart_submission_jobs(fingerprint, created_at);
create table if not exists public.findart_submission_sources (source_key text primary key, job_id uuid not null references public.findart_submission_jobs(id));
create table if not exists public.findart_submission_cursors (key text primary key, value jsonb not null);
alter table public.findart_submission_jobs enable row level security;
alter table public.findart_submission_sources enable row level security;
alter table public.findart_submission_cursors enable row level security;
revoke all on public.findart_submission_jobs, public.findart_submission_sources, public.findart_submission_cursors from public, anon, authenticated;
grant all on public.findart_submission_jobs, public.findart_submission_sources, public.findart_submission_cursors to service_role;

create or replace function public.findart_submissions_enqueue(p_source_key text, p_fingerprint text, p_payload jsonb)
returns uuid language plpgsql security invoker set search_path = public as $$
declare target uuid;
begin
  -- Serialise equal fingerprints to prevent a form/email race.
  perform pg_advisory_xact_lock(hashtextextended(p_fingerprint, 0));
  select job_id into target from findart_submission_sources where source_key = p_source_key;
  if target is not null then return target; end if;
  -- Exact canonical payload matches merge only within seven days; a later
  -- deliberate resubmission is not suppressed forever.
  select id into target from findart_submission_jobs where fingerprint = p_fingerprint and created_at > now() - interval '7 days' order by created_at desc limit 1;
  if target is null then
    insert into findart_submission_jobs(fingerprint,payload) values(p_fingerprint,p_payload) returning id into target;
  end if;
  insert into findart_submission_sources(source_key,job_id) values(p_source_key,target) on conflict do nothing;
  return target;
end $$;

create or replace function public.findart_submissions_claim(p_owner uuid)
returns jsonb language plpgsql security invoker set search_path = public as $$
declare target findart_submission_jobs;
begin
  select * into target from findart_submission_jobs where status in ('pending','prepared','sending') and (lease_until is null or lease_until < now()) order by created_at limit 1 for update skip locked;
  if target.id is null then return null; end if;
  update findart_submission_jobs set lease_owner=p_owner,lease_until=now()+interval '20 minutes',updated_at=now() where id=target.id returning * into target;
  return to_jsonb(target);
end $$;

create or replace function public.findart_submissions_save(p_id uuid,p_owner uuid,p_progress jsonb,p_status text,p_error_code text default null,p_release boolean default false)
returns boolean language plpgsql security invoker set search_path = public as $$
begin
  update findart_submission_jobs set progress=p_progress,status=p_status,error_code=p_error_code,updated_at=now(),lease_until=case when p_release or p_status in ('complete','review','error') then null else now()+interval '20 minutes' end
    where id=p_id and lease_owner=p_owner and lease_until>now();
  if not found then raise exception 'LEASE_LOST'; end if;
  return true;
end $$;
create or replace function public.findart_submissions_cursor_get(p_key text) returns jsonb language sql security invoker set search_path=public as $$ select value from findart_submission_cursors where key=p_key $$;
create or replace function public.findart_submissions_cursor_put(p_key text,p_value jsonb) returns void language sql security invoker set search_path=public as $$ insert into findart_submission_cursors(key,value) values(p_key,p_value) on conflict(key) do update set value=excluded.value $$;

revoke all on function public.findart_submissions_enqueue(text,text,jsonb),public.findart_submissions_claim(uuid),public.findart_submissions_save(uuid,uuid,jsonb,text,text,boolean),public.findart_submissions_cursor_get(text),public.findart_submissions_cursor_put(text,jsonb) from public,anon,authenticated;
grant execute on function public.findart_submissions_enqueue(text,text,jsonb),public.findart_submissions_claim(uuid),public.findart_submissions_save(uuid,uuid,jsonb,text,text,boolean),public.findart_submissions_cursor_get(text),public.findart_submissions_cursor_put(text,jsonb) to service_role;

insert into storage.buckets(id,name,public,file_size_limit) values('findart-submissions-private','findart-submissions-private',false,50000000) on conflict(id) do nothing;
do $$ begin
  if exists(select 1 from storage.buckets where id='findart-submissions-private' and public) then
    raise exception 'SUBMISSIONS_BUCKET_MUST_BE_PRIVATE';
  end if;
end $$;
-- Do not create public storage policies or public/signed download URLs.
