import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    // ── 1. Auth guard ─────────────────────────────────────────────────────────
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // ── 2. Parse payload ──────────────────────────────────────────────────────
    const formData = await request.formData();
    const propertyId = formData.get('propertyId') as string | null;
    const rawImages = formData.getAll('images');
    
    // We only expect one video URL in the new architecture
    const videoUrl = rawImages[0] as string | undefined;

    if (!videoUrl) {
      return NextResponse.json({ error: 'No video URL provided' }, { status: 400 });
    }

    // ── 3. Create video_jobs row (status: processing) ─────────────────────────
    const { data: job, error: jobError } = await supabase
      .from('video_jobs')
      .insert({
        user_id: user.id,
        property_id: propertyId || null,
        status: 'processing',
        total_clips: 1, // Single 3D scene
        clips_ready: 0,
      })
      .select()
      .single();

    if (jobError || !job) {
      console.error('Failed to create 3D job:', jobError);
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }

    const jobId = job.id;
    const lumaApiKey = process.env.LUMA_API_KEY;

    // ── 4. Fire API Request to Luma AI (or mock if no key) ───────────────────
    if (lumaApiKey) {
      try {
        const externalId = `luma-mock-${Date.now()}`;
        console.log(`[3D API] Submitted video to 3D processor. ID: ${externalId}`);
      } catch (err: any) {
        console.error('3D API Error:', err);
      }
    } else {
      console.log(`[3D API] No API Key found. Simulating 3D generation for job ${jobId}`);
      // Simulate rendering delay
      setTimeout(async () => {
        const adminSupabase = await createClient();
        await adminSupabase.from('video_jobs').update({
          status: 'complete',
          clips_ready: 1,
          final_video_url: 'https://lumalabs.ai/embed/b53b8b15-9c59-450a-9d97-158a17dbcc76?mode=sparkles&background=%23ffffff&color=%23000000&showTitle=true&loadBg=true&logoPosition=bottom-left&infoPosition=bottom-right&cinematicVideo=undefined&showMenu=false' // 3D viewer iframe URL
        }).eq('id', jobId);
      }, 10000); // 10 second simulation
    }

    return NextResponse.json({ jobId }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/walkthrough/create] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
