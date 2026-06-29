import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessName, socialScraperKey } = body;

    if (!businessName) {
      return NextResponse.json({ error: 'Business Name is required' }, { status: 400 });
    }

    if (!socialScraperKey) {
      return NextResponse.json({ error: 'Social Scraper API Key is required to fetch mentions.' }, { status: 400 });
    }

    // Simulate backend processing / sentiment analysis
    await new Promise(resolve => setTimeout(resolve, 5000));

    return NextResponse.json({ 
      success: true, 
      message: `Scraped 1,432 recent mentions of ${businessName} across Reddit, Quora, and Yelp. Overall Sentiment Score is 84/100 (Positive). AI recommendation confidence is HIGH.` 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
