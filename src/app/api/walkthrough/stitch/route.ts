import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * POST /api/walkthrough/stitch
 *
 * Called internally (by the webhook handler) once all clips are done.
 * Builds a Shotstack timeline from the ordered clip URLs and kicks off a render.
 * Shotstack calls /api/webhooks/shotstack-complete when the final MP4 is ready.
 *
 * Body: { jobId: string }
 */
export async function POST(request: NextRequest) {
  try {
    const { jobId } = await request.json();

    if (!jobId) {
      return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
    }

    const supabase = await createClient();

    // ── 1. Fetch the job ──────────────────────────────────────────────────────
    const { data: job, error: jobError } = await supabase
      .from('video_jobs')
      .select('id, user_id, status, total_clips')
      .eq('id', jobId)
      .single();

    if (jobError || !job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.status === 'complete') {
      return NextResponse.json({ ok: true, message: 'Already complete' });
    }

    // ── 2. Fetch all done clips in order ──────────────────────────────────────
    const { data: clips, error: clipsError } = await supabase
      .from('video_clips')
      .select('clip_index, clip_url, status')
      .eq('job_id', jobId)
      .eq('status', 'done')
      .order('clip_index', { ascending: true });

    if (clipsError || !clips || clips.length === 0) {
      console.error('[Stitch] No done clips found for job:', jobId);
      await supabase
        .from('video_jobs')
        .update({ status: 'failed', error_message: 'No completed clips found for stitching' })
        .eq('id', jobId);
      return NextResponse.json({ error: 'No clips to stitch' }, { status: 422 });
    }

    const clipUrls = clips.map((c) => c.clip_url).filter(Boolean) as string[];
    const clipDuration = 5; // seconds — must match CLIP_DURATION_SECONDS in create/route.ts

    // ── 3. Build Shotstack timeline ───────────────────────────────────────────
    // Each clip is placed sequentially on the timeline: clip 0 starts at 0s,
    // clip 1 starts at 5s, clip 2 at 10s, etc.
    const shotstackClips = clipUrls.map((url, index) => ({
      asset: {
        type: 'video',
        src: url,
        trim: 0,         // start playing from the beginning of each clip
      },
      start: index * clipDuration,
      length: clipDuration,
      transition: {
        in: 'fade',      // smooth fade between clips
        out: 'fade',
      },
    }));

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://clovrr.net';
    const shotstackApiKey = process.env.SHOTSTACK_API_KEY;

    if (!shotstackApiKey) {
      console.error('[Stitch] SHOTSTACK_API_KEY not set');
      await supabase
        .from('video_jobs')
        .update({ status: 'failed', error_message: 'Shotstack API key not configured' })
        .eq('id', jobId);
      return NextResponse.json({ error: 'Stitch service not configured' }, { status: 500 });
    }

    // ── 4. Call Shotstack render API ──────────────────────────────────────────
    console.log(`[Stitch] Sending ${clipUrls.length} clips to Shotstack for job ${jobId}`);

    const shotstackBody = {
      timeline: {
        background: '#000000',
        tracks: [
          {
            clips: shotstackClips,
          },
        ],
      },
      output: {
        format: 'mp4',
        resolution: '1080',       // 1920×1080 output
        aspectRatio: '16:9',
        fps: 30,
        quality: 'high',
      },
      // Shotstack calls this URL when the render is complete.
      // We encode the jobId as a query param so the webhook can look it up.
      callback: `${appUrl}/api/webhooks/shotstack-complete?jobId=${jobId}`,
    };

    const shotstackRes = await fetch('https://api.shotstack.io/edit/v1/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': shotstackApiKey,
      },
      body: JSON.stringify(shotstackBody),
    });

    if (!shotstackRes.ok) {
      const errText = await shotstackRes.text();
      throw new Error(`Shotstack error ${shotstackRes.status}: ${errText}`);
    }

    const shotstackResult = await shotstackRes.json();
    // Shotstack response: { success: true, message: "Created", response: { id: "render_id", message: "..." } }
    const renderId = shotstackResult?.response?.id ?? null;

    console.log(`[Stitch] Shotstack render queued. Render ID: ${renderId}`);

    // Keep job as 'stitching' — the shotstack-complete webhook will mark it done
    await supabase
      .from('video_jobs')
      .update({ updated_at: new Date().toISOString() })
      .eq('id', jobId);

    return NextResponse.json({ ok: true, jobId, renderId });
  } catch (error: any) {
    console.error('[POST /api/walkthrough/stitch] Unexpected error:', error);

    // Mark job as failed
    try {
      const body = await (request.json().catch(() => ({})) as any);
      if (body?.jobId) {
        const supabase = await createClient();
        await supabase
          .from('video_jobs')
          .update({ status: 'failed', error_message: error.message })
          .eq('id', body.jobId);
      }
    } catch (_) {
      // Silently ignore secondary failure
    }

    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
