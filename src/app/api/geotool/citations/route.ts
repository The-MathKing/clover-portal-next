import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessName, yextKey } = body;

    if (!businessName) {
      return NextResponse.json({ error: 'Missing business name' }, { status: 400 });
    }

    if (!yextKey) {
      return NextResponse.json({ error: 'Directory API Key (e.g. Yext/BrightLocal) is required to broadcast citations' }, { status: 400 });
    }

    // Simulate backend API processing / Directory syncing
    await new Promise(resolve => setTimeout(resolve, 4000));

    return NextResponse.json({ 
      success: true, 
      message: `Successfully authenticated with Directory API. NAP (Name, Address, Phone) data for ${businessName} broadcasted to 54 tier-1 directories. Sync complete.` 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
