import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * POST /api/webhooks/video-complete
 *
 * Receives PiAPI (Kling) webhook callbacks when a single clip finishes rendering.
 *
 * PiAPI webhook payload:
 * {
 *   task_id: string;
 *   model: "kling";
 *   task_type: "video_generation";
 *   status: "completed" | "failed";
 *   input: { ... };
 *   output: {
 *     works: [{ video: { resource: string } }]  // clip URL when completed
 *   };
 *   error: { code: number; raw_message: string } | null;
 *   meta_data: {
 *     clover_clip_id: string;
 *     clover_job_id: string;
 *   };
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('[Webhook video-complete] Received:', JSON.stringify(body).slice(0, 300));

    // ── 1. Parse PiAPI webhook payload ────────────────────────────────────────
    const externalTaskId: string = body.task_id;
    const isSuccess: boolean = body.status === 'completed';

    // PiAPI video URL lives at output.works[0].video.resource
    const clipUrl: string | undefined = body.output?.works?.[0]?.video?.resource;

    // Our metadata we passed at task creation time
    const cloverClipId: string | undefined = body.meta_data?.clover_clip_id;
    const cloverJobId: string | undefined = body.meta_data?.clover_job_id;

    const errorMessage: string | undefined =
      body.error?.raw_message ?? body.error?.message ?? 'Unknown error from PiAPI';

    if (!externalTaskId && !cloverClipId) {
      console.error('[Webhook] No identifiers found in payload');
      // Return 200 to prevent PiAPI from retrying
      return NextResponse.json({ received: true, warning: 'No identifiers' });
    }

    // ── 2. Supabase client (server-side, bypasses RLS) ────────────────────────
    const supabase = await createClient();

    // ── 3. Look up the clip row ───────────────────────────────────────────────
    let clipQuery = supabase
      .from('video_clips')
      .select('id, job_id, clip_index');

    if (cloverClipId) {
      // Prefer our own ID — most reliable
      clipQuery = clipQuery.eq('id', cloverClipId);
    } else {
      clipQuery = clipQuery.eq('external_clip_id', externalTaskId);
    }

    const { data: clip, error: clipFetchError } = await clipQuery.single();

    if (clipFetchError || !clip) {
      console.error('[Webhook] Clip not found:', { externalTaskId, cloverClipId, clipFetchError });
      return NextResponse.json({ received: true, warning: 'Clip not found' });
    }

    const jobId = clip.job_id ?? cloverJobId;

    // ── 4. Update the clip row ────────────────────────────────────────────────
    const clipUpdate = isSuccess
      ? { status: 'done', clip_url: clipUrl ?? null, error_message: null }
      : { status: 'failed', error_message: errorMessage };

    const { error: clipUpdateError } = await supabase
      .from('video_clips')
      .update(clipUpdate)
      .eq('id', clip.id);

    if (clipUpdateError) {
      console.error('[Webhook] Failed to update clip:', clipUpdateError);
      return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
    }

    console.log(
      `[Webhook] Clip ${clip.clip_index} (${clip.id}) → ${isSuccess ? `done: ${clipUrl}` : `failed: ${errorMessage}`}`
    );

    // ── 5. Count done clips for this job ──────────────────────────────────────
    const { count: doneCount, error: countError } = await supabase
      .from('video_clips')
      .select('*', { count: 'exact', head: true })
      .eq('job_id', jobId)
      .eq('status', 'done');

    if (countError) {
      console.error('[Webhook] Failed to count done clips:', countError);
      return NextResponse.json({ error: 'Count query failed' }, { status: 500 });
    }

    // ── 6. Fetch parent job ───────────────────────────────────────────────────
    const { data: job, error: jobFetchError } = await supabase
      .from('video_jobs')
      .select('id, total_clips, status')
      .eq('id', jobId)
      .single();

    if (jobFetchError || !job) {
      console.error('[Webhook] Parent job not found:', jobId);
      return NextResponse.json({ received: true, warning: 'Job not found' });
    }

    // Update clips_ready on the job
    await supabase
      .from('video_jobs')
      .update({ clips_ready: doneCount, updated_at: new Date().toISOString() })
      .eq('id', jobId);

    // ── 7. Trigger stitching when ALL clips are done ──────────────────────────
    const allDone =
      doneCount !== null &&
      doneCount >= job.total_clips &&
      job.status !== 'stitching' &&
      job.status !== 'complete';

    if (allDone) {
      console.log(`[Webhook] All ${job.total_clips} clips ready for job ${jobId} — triggering Shotstack stitch`);

      await supabase
        .from('video_jobs')
        .update({ status: 'stitching', updated_at: new Date().toISOString() })
        .eq('id', jobId);

      const appUrl =
        process.env.NEXT_PUBLIC_APP_URL ||
        `${request.nextUrl.protocol}//${request.nextUrl.host}`;

      fetch(`${appUrl}/api/walkthrough/stitch`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ jobId }),
      }).catch((err) => {
        console.error('[Webhook] Failed to trigger stitch:', err.message);
      });
    }

    return NextResponse.json({
      received: true,
      clipsReady: doneCount,
      totalClips: job.total_clips,
      stitchTriggered: allDone,
    });
  } catch (error: any) {
    console.error('[POST /api/webhooks/video-complete] Unexpected error:', error);
    // Always 200 — prevent PiAPI from hammering us with retries
    return NextResponse.json({ received: true, error: error.message });
  }
}
