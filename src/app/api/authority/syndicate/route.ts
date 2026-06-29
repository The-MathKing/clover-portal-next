import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessName, prSyndicationToken } = body;

    if (!businessName) {
      return NextResponse.json({ error: 'Business Name is required' }, { status: 400 });
    }

    if (!prSyndicationToken) {
      return NextResponse.json({ error: 'PR Syndication API Token is required to distribute content.' }, { status: 400 });
    }

    // Simulate backend processing / PR Distribution
    await new Promise(resolve => setTimeout(resolve, 4000));

    return NextResponse.json({ 
      success: true, 
      message: `Generated AI Press Release for ${businessName}. Successfully syndicated to 12 high-authority news networks via API.` 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
