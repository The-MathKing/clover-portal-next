-- ─── 3D Walkthrough Video Jobs Migration ─────────────────────────────────────
-- Run this in your Supabase SQL Editor after the base schema (supabase_schema.sql)

-- video_jobs: one row per walkthrough generation job
create table if not exists public.video_jobs (
  id            uuid        default gen_random_uuid() primary key,
  user_id       uuid        references auth.users on delete cascade not null,
  property_id   uuid        references public.properties(id) on delete set null,
  status        text        default 'pending'
                            check (status in ('pending', 'processing', 'stitching', 'complete', 'failed')),
  total_clips   int         default 0,
  clips_ready   int         default 0,
  final_video_url text,
  error_message text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);

-- video_clips: one row per AI-generated 3-second clip within a job
create table if not exists public.video_clips (
  id                uuid        default gen_random_uuid() primary key,
  job_id            uuid        references public.video_jobs(id) on delete cascade not null,
  clip_index        int         not null,          -- order within the final video (0..N-1)
  source_image_url  text        not null,           -- Supabase Storage URL of the uploaded image
  external_clip_id  text,                           -- ID returned by the AI Video API
  clip_url          text,                           -- URL of the rendered clip (set by webhook)
  status            text        default 'pending'
                                check (status in ('pending', 'processing', 'done', 'failed')),
  error_message     text,
  created_at        timestamptz default now()
);

-- Index for fast webhook lookups by external_clip_id
create index if not exists idx_video_clips_external_id
  on public.video_clips(external_clip_id);

-- Index for fast status queries per job
create index if not exists idx_video_clips_job_id
  on public.video_clips(job_id);

-- Index for fast job lookups by user
create index if not exists idx_video_jobs_user_id
  on public.video_jobs(user_id);

-- ─── Row Level Security ───────────────────────────────────────────────────────

alter table public.video_jobs  enable row level security;
alter table public.video_clips enable row level security;

-- video_jobs policies: users manage only their own jobs
create policy "Users can view their own video jobs"
  on public.video_jobs for select
  using (auth.uid() = user_id);

create policy "Users can create their own video jobs"
  on public.video_jobs for insert
  with check (auth.uid() = user_id);

create policy "Users can update their own video jobs"
  on public.video_jobs for update
  using (auth.uid() = user_id);

-- video_clips policies: access is scoped through the parent job
create policy "Users can view clips for their jobs"
  on public.video_clips for select
  using (
    exists (
      select 1 from public.video_jobs
      where public.video_jobs.id = public.video_clips.job_id
        and public.video_jobs.user_id = auth.uid()
    )
  );

create policy "Users can insert clips for their jobs"
  on public.video_clips for insert
  with check (
    exists (
      select 1 from public.video_jobs
      where public.video_jobs.id = public.video_clips.job_id
        and public.video_jobs.user_id = auth.uid()
    )
  );

-- Service-role bypass policy for webhook updates (clips updated server-side)
-- In production, use a service role key for webhook routes that bypass RLS.
-- Alternatively, create a Postgres function with SECURITY DEFINER:

create or replace function public.webhook_update_video_clip(
  p_external_clip_id text,
  p_clip_url         text,
  p_status           text
)
returns void
security definer set search_path = public
language plpgsql as $$
declare
  v_job_id      uuid;
  v_clips_ready int;
  v_total_clips int;
begin
  -- Update the clip
  update public.video_clips
  set    clip_url = p_clip_url,
         status   = p_status
  where  external_clip_id = p_external_clip_id
  returning job_id into v_job_id;

  if v_job_id is null then
    raise exception 'Clip with external_clip_id % not found', p_external_clip_id;
  end if;

  -- Count done clips for this job
  select count(*) into v_clips_ready
  from   public.video_clips
  where  job_id = v_job_id and status = 'done';

  select total_clips into v_total_clips
  from   public.video_jobs
  where  id = v_job_id;

  -- Update the job's clips_ready counter
  update public.video_jobs
  set    clips_ready = v_clips_ready,
         updated_at  = now()
  where  id = v_job_id;

  -- If all clips are done, mark job as 'stitching'
  if v_clips_ready >= v_total_clips then
    update public.video_jobs
    set    status     = 'stitching',
           updated_at = now()
    where  id = v_job_id;
  end if;
end;
$$;
