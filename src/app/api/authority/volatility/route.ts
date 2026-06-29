import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessName, targetKeywords, aiEngines } = body;

    if (!businessName || !targetKeywords) {
      return NextResponse.json({ error: 'Business Name and Target Keywords are required' }, { status: 400 });
    }

    // Simulate backend processing / scraping LLMs
    await new Promise(resolve => setTimeout(resolve, 3000));

    return NextResponse.json({ 
      success: true, 
      message: `Checked rankings for "${targetKeywords}" across ${aiEngines}. ${businessName} is currently recommended in 2/3 engines. Volatility is stable.` 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
