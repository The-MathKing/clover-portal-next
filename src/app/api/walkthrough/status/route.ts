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
