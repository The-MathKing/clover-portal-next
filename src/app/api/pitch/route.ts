import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { businessName, industry, targetAudience, coreService, passcode } = await req.json();

    if (passcode !== 'CLOVRR_ADMIN_77X') {
      return NextResponse.json({ error: 'Invalid developer passcode' }, { status: 401 });
    }

    if (!businessName || !industry || !targetAudience || !coreService) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500 });
    }

    const prompt = `Act as an elite B2B Sales Executive and Generative Engine Optimization (GEO) expert.
You are preparing a 5-slide Marketing Pitch Deck for a sales call with a potential client named "${businessName}". 
They operate in the "${industry}" industry, their target audience is "${targetAudience}", and their core service/product is "${coreService}".

Write a highly-persuasive, punchy, and structured 5-slide pitch deck formatted in Markdown.

The slides MUST be strictly formatted as follows:

# Slide 1: The AI Search Reality
Explain how traditional SEO is dying and how their target audience ("${targetAudience}") is now asking AI engines like ChatGPT, Perplexity, and Google AI Overviews for recommendations.

# Slide 2: The Data Void
Highlight that because they haven't structured their data for AI, their core service ("${coreService}") is currently invisible to these AI models. Their competitors are being recommended instead.

# Slide 3: The Clovrr GEO Solution
Explain how our 3-step Generative Engine Optimization (GEO) framework (AI Audit, Knowledge Graphing, Authority Locking) solves this problem by directly injecting their brand into the AI's training data pipeline.

# Slide 4: Projected Growth & Defense
Show them a theoretical projection of how becoming the "Default AI Recommendation" will capture high-intent leads that their competitors are currently stealing.

# Slide 5: The Investment
Present the two simple tiers:
- GEO Foundation: $129/mo (Data Infrastructure, Schema, Q&A Restructure)
- Algorithmic Authority: $299/mo (Foundation + Sentiment Defense, Volatility Monitoring, High-Authority Citations)

CRITICAL RULES:
- Use bullet points for easy reading during a live Zoom presentation.
- Keep the tone authoritative, modern, and urgent.
- Do not use cheesy sales jargon. Make it sound like a premium tech infrastructure pitch.
- Output ONLY the Markdown presentation.`;

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
    console.error("Pitch Generator Error:", error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
