import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * GET /api/walkthrough/status?jobId=xxx
 *
 * Polled by the frontend every ~3 seconds to track generation progress.
 * Returns the current job status, clip progress, and final video URL.
 */
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
    }

    const supabase = await createClient();

    // ── Auth guard ─────────────────────────────────────────────────────────────
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── Fetch the job (scoped to the authenticated user) ─────────────────────
    const { data: job, error: jobError } = await supabase
      .from('video_jobs')
      .select('id, status, total_clips, clips_ready, final_video_url, error_message, updated_at')
      .eq('id', jobId)
      .eq('user_id', user.id)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // ── Active Polling Fallback (if webhooks fail) ─────────────────────────
    if (job.status === 'processing') {
      const { data: clips } = await supabase
        .from('video_clips')
        .select('id, external_clip_id, status')
        .eq('job_id', jobId)
        .eq('status', 'processing');

      if (clips && clips.length > 0) {
        const videoApiKey = process.env.VIDEO_AI_API_KEY;
        if (videoApiKey) {
          let updatedCount = 0;
          await Promise.allSettled(clips.map(async (clip) => {
            if (!clip.external_clip_id) return;
            try {
              const res = await fetch(`https://api.piapi.ai/api/v1/task/${clip.external_clip_id}`, {
                headers: { 'X-API-Key': videoApiKey }
              });
              const data = await res.json();
              const payload = data.data || data;
              if (payload.status === 'completed') {
                const clipUrl = payload.output?.works?.[0]?.video?.resource || payload.output?.video?.url || payload.output?.works?.[0]?.url;
                await supabase.from('video_clips').update({ status: 'done', clip_url: clipUrl }).eq('id', clip.id);
                updatedCount++;
              } else if (payload.status === 'failed') {
                await supabase.from('video_clips').update({ status: 'failed', error_message: 'Failed via PiAPI' }).eq('id', clip.id);
                updatedCount++;
              }
            } catch (err) {
              console.error('Polling error for clip', clip.id, err);
            }
          }));

          if (updatedCount > 0) {
            // Recalculate job status
            const { count: doneCount } = await supabase.from('video_clips').select('*', { count: 'exact', head: true }).eq('job_id', jobId).eq('status', 'done');
            if (doneCount !== null) {
              job.clips_ready = doneCount;
              await supabase.from('video_jobs').update({ clips_ready: doneCount }).eq('id', jobId);
              if (doneCount >= job.total_clips) {
                job.status = 'stitching';
                await supabase.from('video_jobs').update({ status: 'stitching' }).eq('id', jobId);
                
                // Trigger stitch
                const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;
                fetch(`${appUrl}/api/walkthrough/stitch`, {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ jobId }),
                }).catch(console.error);
              }
            }
          }
        }
      }
    }

    return NextResponse.json({
      jobId: job.id,
      status: job.status,                          // pending | processing | stitching | complete | failed
      clipsReady: job.clips_ready ?? 0,
      totalClips: job.total_clips ?? 0,
      finalVideoUrl: job.final_video_url ?? null,
      errorMessage: job.error_message ?? null,
      updatedAt: job.updated_at,
    });
  } catch (error: any) {
    console.error('[GET /api/walkthrough/status] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
