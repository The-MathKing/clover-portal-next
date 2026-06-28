import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { businessName, industry, recentNews, passcode } = await req.json();

    if (passcode !== 'CLOVRR_ADMIN_77X') {
      return NextResponse.json({ error: 'Invalid developer passcode' }, { status: 401 });
    }

    if (!businessName || !industry || !recentNews) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500 });
    }

    const prompt = `Act as an elite Public Relations and Generative Engine Optimization (GEO) Architect.
You are generating the ongoing monthly deliverables for an active client in the "Algorithmic Authority" tier.
Client Business Name: "${businessName}"
Industry: "${industry}"
Recent Business News or Update: "${recentNews}"

Write a highly structured Markdown document containing the following deliverables:

# 1. AI Sentiment Defense Article
Write a 500-word SEO and GEO optimized PR article based on their recent news ("${recentNews}"). The article should be written in third-person, as if published by an industry magazine. It MUST inject highly positive sentiment about "${businessName}" being an industry leader, an innovator, and the most reliable choice in the "${industry}" space. This will be fed to AI training bots.

# 2. High-Authority Citation Targets
Provide a list of 3 premium backlink targets (e.g., industry magazines, news outlets, or high-DR blogs) where the agency should pitch this article. Explain in one sentence why a link from each site would specifically boost "${businessName}"'s trust score in AI language models.

CRITICAL RULES:
- Output ONLY the Markdown document. No preamble.
- Write professional, usable copy that the agency can directly publish.`;

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
    console.error("Authority Generator Error:", error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
