import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { clientName, tier, month, passcode } = await req.json();

    if (passcode !== 'CLOVRR_ADMIN_77X') {
      return NextResponse.json({ error: 'Invalid developer passcode' }, { status: 401 });
    }

    if (!clientName || !tier || !month) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500 });
    }

    const prompt = `Act as an elite Generative Engine Optimization (GEO) Agency Owner.
You are writing a monthly progress report email for an active client.
Client Name: "${clientName}"
Subscription Tier: "${tier}"
Month Number: "${month}"

Write a highly professional, encouraging email report formatted in Markdown that the agency can copy/paste and send directly to the client.

The report MUST include:
1. **Subject Line**: A professional, clear subject line indicating the month and their brand name.
2. **Executive Summary**: A 2-sentence summary of the focus this month.
3. **Actions Taken**: Bullet points of what was accomplished this month. If they are in the "GEO Foundation" tier, focus on data infrastructure, schema, and API indexing. If they are in the "Algorithmic Authority" tier, focus on sentiment monitoring, PR indexing, and citation building.
4. **Visibility Chart**: Generate a Markdown table titled "Month-over-Month AI Visibility Score" showing their theoretical share of AI recommendations increasing across ChatGPT, Perplexity, Claude, and Google AI Overviews.
5. **Next Month's Focus**: Briefly state what the agency is focusing on next month to retain their business.

CRITICAL RULES:
- Output ONLY the Markdown document. No preamble.
- Write professional, usable copy that the agency can directly email.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.7 }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      throw new Error(`Failed to authenticate with Gemini API: ${errorText}`);
    }

    const data = await response.json();
    const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!generatedText) {
      throw new Error("Gemini returned an empty response.");
    }

    return NextResponse.json({ markdown: generatedText });
  } catch (error: any) {
    console.error("Report Generator Error:", error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
