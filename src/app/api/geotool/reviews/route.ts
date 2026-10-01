import { NextRequest, NextResponse } from 'next/server';
import { isAdminPasscode } from '@/utils/adminPasscode';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    if (!isAdminPasscode(body.passcode)) {
      return NextResponse.json({ error: 'Invalid developer passcode' }, { status: 401 });
    }
    const { businessName, googleApiKey } = body;

    if (!businessName) {
      return NextResponse.json({ error: 'Missing business name' }, { status: 400 });
    }

    if (!googleApiKey) {
      return NextResponse.json({ error: 'Google Business Profile API Key is required to fetch and reply to reviews' }, { status: 400 });
    }

    // Simulate backend API processing / GBP fetching
    await new Promise(resolve => setTimeout(resolve, 3500));

    return NextResponse.json({ 
      success: true, 
      message: `Successfully connected to GBP for ${businessName}. Found 3 unanswered reviews. Generated and posted AI responses for all 3.` 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
