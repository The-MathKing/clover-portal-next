import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessName, websiteUrl, cmsToken } = body;

    if (!businessName || !websiteUrl) {
      return NextResponse.json({ error: 'Missing required business info' }, { status: 400 });
    }

    if (!cmsToken) {
      return NextResponse.json({ error: 'CMS Webhook Token is required to inject schema' }, { status: 400 });
    }

    // Simulate backend API processing / Gemini processing
    await new Promise(resolve => setTimeout(resolve, 2500));

    return NextResponse.json({ 
      success: true, 
      message: `Successfully generated and injected JSON-LD Schema (LocalBusiness, FAQ) into ${websiteUrl} using the provided CMS webhook.` 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
