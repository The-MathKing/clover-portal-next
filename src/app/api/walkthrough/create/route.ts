import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

const CINEMATIC_PROMPT =
  'Cinematic slow continuous pan right, realistic 3D architectural rendering, 4k, smooth motion, real estate walkthrough, professional lighting, photo-realistic.';

const MAX_IMAGES = 20;

// Kling via PiAPI: minimum duration is 5 seconds per clip.
// 20 clips × 5s = ~100 second walkthrough video.
const CLIP_DURATION_SECONDS = '5';

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

    // ── 2. Parse multipart form data ──────────────────────────────────────────
    const formData = await request.formData();
    const propertyId = formData.get('propertyId') as string | null;
    const rawImages = formData.getAll('images');

    if (!rawImages || rawImages.length === 0) {
      return NextResponse.json({ error: 'No images provided' }, { status: 400 });
    }

    if (rawImages.length > MAX_IMAGES) {
      return NextResponse.json(
        { error: `Maximum ${MAX_IMAGES} images allowed` },
        { status: 400 }
      );
    }

    const totalClips = rawImages.length;

    // ── 3. Create video_jobs row (status: processing) ─────────────────────────
    const { data: job, error: jobError } = await supabase
      .from('video_jobs')
      .insert({
        user_id: user.id,
        property_id: propertyId || null,
        status: 'processing',
        total_clips: totalClips,
        clips_ready: 0,
      })
      .select()
      .single();

    if (jobError || !job) {
      console.error('Failed to create video job:', jobError);
      return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }

    const jobId = job.id;

    // ── 4. Upload each image to Supabase Storage (if File) ─────────────────────────
    const imageUploadPromises = rawImages.map(async (rawImg, index) => {
      if (typeof rawImg === 'string') {
        return { index, url: rawImg };
      }

      const file = rawImg as File;
      const ext = file.name.split('.').pop() || 'jpg';
      const storagePath = `walkthrough/${jobId}/${index}.${ext}`;
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: true,
        });

      if (uploadError) {
        throw new Error(`Failed to upload image ${index}: ${uploadError.message}`);
      }

      const { data: publicUrlData } = supabase.storage
        .from('media')
        .getPublicUrl(storagePath);

      return { index, url: publicUrlData.publicUrl };
    });

    let uploadedImages: { index: number; url: string }[];
    try {
      uploadedImages = await Promise.all(imageUploadPromises);
    } catch (uploadErr: any) {
      console.error('Image upload failed:', uploadErr);
      await supabase
        .from('video_jobs')
        .update({ status: 'failed', error_message: uploadErr.message })
        .eq('id', jobId);
      return NextResponse.json({ error: 'Image upload failed' }, { status: 500 });
    }

    // ── 5. Insert video_clips rows ─────────────────────────────────────────────
    const clipRows = uploadedImages.map(({ index, url }) => ({
      job_id: jobId,
      clip_index: index,
      source_image_url: url,
      status: 'pending',
    }));

    const { data: clips, error: clipsError } = await supabase
      .from('video_clips')
      .insert(clipRows)
      .select();

    if (clipsError || !clips) {
      console.error('Failed to insert video_clips:', clipsError);
      await supabase
        .from('video_jobs')
        .update({ status: 'failed', error_message: 'Failed to create clip records' })
        .eq('id', jobId);
      return NextResponse.json({ error: 'Failed to create clip records' }, { status: 500 });
    }

    // ── 6. Fire PiAPI (Kling) requests per clip — non-blocking ────────────────
    const videoApiKey = process.env.VIDEO_AI_API_KEY;
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || `${request.nextUrl.protocol}//${request.nextUrl.host}`;
    const webhookUrl = `${appUrl}/api/webhooks/video-complete`;

    if (!videoApiKey) {
      console.warn('[Walkthrough] VIDEO_AI_API_KEY not set — skipping clip generation.');
    } else {
      // Await so Vercel does not freeze the lambda environment before fetch completes
      await fireKlingRequests({ supabase, clips, uploadedImages, videoApiKey, webhookUrl, jobId });

      // Safety Net: Check if ALL clips failed instantly (e.g. PiAPI returns 402 Insufficient Funds)
      const { data: failedClips } = await supabase
        .from('video_clips')
        .select('id, error_message')
        .eq('job_id', jobId)
        .eq('status', 'failed');

      if (failedClips && failedClips.length === totalClips && totalClips > 0) {
        console.error(`[Walkthrough] All clips failed for job ${jobId}. Failing job.`);
        await supabase
          .from('video_jobs')
          .update({ 
            status: 'failed', 
            error_message: failedClips[0].error_message || 'PiAPI generation failed instantly.' 
          })
          .eq('id', jobId);
      }
    }

    return NextResponse.json({ jobId, totalClips }, { status: 201 });
  } catch (error: any) {
    console.error('[POST /api/walkthrough/create] Unexpected error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}

// ─── Fire Kling clip generation via PiAPI ────────────────────────────────────
async function fireKlingRequests({
  supabase,
  clips,
  uploadedImages,
  videoApiKey,
  webhookUrl,
  jobId,
}: {
  supabase: any;
  clips: any[];
  uploadedImages: { index: number; url: string }[];
  videoApiKey: string;
  webhookUrl: string;
  jobId: string;
}) {
  await Promise.allSettled(
    clips.map(async (clip) => {
      const image = uploadedImages.find((img) => img.index === clip.clip_index);
      if (!image) return;

      try {
        // ── PiAPI — Kling v3 Image-to-Video (1080p via "pro" mode) ──────────
        // Docs: https://piapi.ai/docs/kling-api
        const res = await fetch('https://api.piapi.ai/api/v1/task', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'X-API-Key': videoApiKey,
          },
          body: JSON.stringify({
            model: 'kling',
            task_type: 'video_generation',
            input: {
              prompt: CINEMATIC_PROMPT,
              image_url: image.url,
              negative_prompt: 'blurry, shaky cam, low quality, distorted, watermark, text',
              cfg_scale: 0.5,
              duration: CLIP_DURATION_SECONDS, // "5" = minimum; results in ~100s total video
              aspect_ratio: '16:9',
              model_name: 'kling-v3',   // Kling 3.0 — best quality
              mode: 'pro',              // "pro" mode = 1080p output
            },
            config: {
              webhook_config: {
                // PiAPI will POST to this URL when the clip is done
                endpoint: webhookUrl,
                secret: '',            // optional HMAC secret — add if you want signature verification
              },
            },
            // Pass our internal IDs as metadata so the webhook can look up the right row
            // PiAPI echoes these back in the webhook payload
            metadata: {
              clover_clip_id: clip.id,
              clover_job_id: jobId,
            },
          }),
        });

        if (!res.ok) {
          const errText = await res.text();
          throw new Error(`PiAPI error ${res.status}: ${errText}`);
        }

        const apiResponse = await res.json();

        // PiAPI returns: { code: 200, data: { task_id: "...", status: "pending" } }
        const externalClipId = apiResponse?.data?.task_id ?? null;

        if (!externalClipId) {
          throw new Error(`PiAPI returned no task_id: ${JSON.stringify(apiResponse)}`);
        }

        await supabase
          .from('video_clips')
          .update({ external_clip_id: externalClipId, status: 'processing' })
          .eq('id', clip.id);

        console.log(`[Clip ${clip.clip_index}] PiAPI task created: ${externalClipId}`);
      } catch (err: any) {
        console.error(`[Clip ${clip.clip_index}] Generation request failed:`, err.message);
        await supabase
          .from('video_clips')
          .update({ status: 'failed', error_message: err.message })
          .eq('id', clip.id);
      }
    })
  );
}
