import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

/**
 * POST /api/webhooks/shotstack-complete?jobId=xxx
 *
 * Called by Shotstack when the final stitched video is ready.
 * The jobId is passed as a query parameter (encoded in the callback URL).
 *
 * Shotstack webhook payload:
 * {
 *   id: string;          // Shotstack render ID
 *   owner: string;
 *   plan: string;
 *   status: "done" | "failed";
 *   error: string | null;
 *   duration: number;    // total video duration in seconds
 *   render_time: number; // how long the render took
 *   url: string;         // public CDN URL of the final MP4
 *   poster: string | null;
 *   thumbnail: string | null;
 *   data: { output: { ... } };
 * }
 */
export async function POST(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');

    if (!jobId) {
      console.error('[Shotstack webhook] Missing jobId in query params');
      return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });
    }

    const body = await request.json();
    console.log('[Shotstack webhook] Received for job', jobId, ':', JSON.stringify(body).slice(0, 300));

    // ── Parse Shotstack payload ────────────────────────────────────────────────
    const isSuccess = body.status === 'done';
    const finalVideoUrl: string | undefined = body.url;
    const errorMessage: string | undefined = body.error ?? 'Shotstack render failed';

    const supabase = await createClient();

    if (isSuccess && finalVideoUrl) {
      // ── Mark job as complete ───────────────────────────────────────────────
      const { data: jobData, error: fetchError } = await supabase
        .from('video_jobs')
        .update({
          status: 'complete',
          final_video_url: finalVideoUrl,
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId)
        .select('property_id')
        .single();

      if (fetchError) {
        console.error('[Shotstack webhook] Failed to mark job complete:', fetchError);
        return NextResponse.json({ error: 'DB update failed' }, { status: 500 });
      }

      // ── Update property ──────────────────────────────────────────────────
      if (jobData?.property_id) {
        await supabase
          .from('properties')
          .update({ video_url: finalVideoUrl })
          .eq('id', jobData.property_id);
      }

      console.log(`[Shotstack webhook] Job ${jobId} complete ✅ — video: ${finalVideoUrl}`);
    } else {
      // ── Mark job as failed ─────────────────────────────────────────────────
      await supabase
        .from('video_jobs')
        .update({
          status: 'failed',
          error_message: errorMessage,
          updated_at: new Date().toISOString(),
        })
        .eq('id', jobId);

      console.error(`[Shotstack webhook] Job ${jobId} failed ❌ — ${errorMessage}`);
    }

    // Always return 200 — Shotstack won't retry but good practice
    return NextResponse.json({ received: true });
  } catch (error: any) {
    console.error('[POST /api/webhooks/shotstack-complete] Unexpected error:', error);
    return NextResponse.json({ received: true, error: error.message });
  }
}
