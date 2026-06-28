import { NextRequest, NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const { businessName, industry, zipCode, coreService, passcode } = await req.json();

    if (passcode !== 'CLOVRR_ADMIN_77X') {
      return NextResponse.json({ error: 'Invalid developer passcode' }, { status: 401 });
    }

    if (!businessName || !industry || !coreService || !zipCode) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500 });
    }

    const prompt = `Act as an elite Generative Engine Optimization (GEO) Architect.
You are generating the actual deliverables for a new client in the "GEO Foundation" tier.
Client Business Name: "${businessName}"
Industry: "${industry}"
Location / Zip Code: "${zipCode}"
Core Product/Service: "${coreService}"

Write a highly structured technical Markdown document containing the following deliverables:

# 1. Advanced JSON-LD Schema Markup
Provide the exact, valid JSON-LD code block that this specific business should inject into their website header. It MUST include:
- @context and @type (e.g., LocalBusiness, RoofingContractor, etc.)
- Name, address (using the zip code), and the core service provided.

# 2. Site Q&A Restructure (FAQPage Schema Strategy)
Write 5 highly-optimized Frequently Asked Questions AND their answers. The questions should be exactly what people ask AI like ChatGPT (e.g., "Who is the best [industry] in [zipCode]?"). The answers should clearly and directly position "${businessName}" as the ultimate solution for "${coreService}". 

# 3. Directory Consolidation Strategy
Provide a list of 5 high-authority, niche-specific or location-specific directories where this exact type of business MUST be listed for AI crawlers to trust their entity data. Include a brief sentence on why each directory matters for this industry.

CRITICAL RULES:
- Output ONLY the Markdown document. No preamble.
- Write professional, usable copy that the agency can directly hand to the client or implement on their behalf.`;

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
    console.error("Foundation Generator Error:", error);
    return NextResponse.json({ error: error.message || 'An unexpected error occurred' }, { status: 500 });
  }
}
