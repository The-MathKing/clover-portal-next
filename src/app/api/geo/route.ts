import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/utils/supabase/server';

export async function POST(req: NextRequest) {
  try {
    const { inputType, businessName, industry, zipcode, websiteUrl } = await req.json();

    if (inputType === 'details') {
      if (!businessName || !industry || !zipcode) {
        return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
      }
    } else if (inputType === 'url') {
      if (!websiteUrl) {
        return NextResponse.json({ error: 'Missing website URL' }, { status: 400 });
      }
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500 });
    }

    let prompt = '';
    
    if (inputType === 'url') {
      prompt = `Act as a top-tier Generative Engine Optimization (GEO) expert. 
A business with the website "${websiteUrl}" needs a highly-structured, actionable audit report formatted in Markdown to show them their visibility gaps in AI search. First, deduce their likely industry, business name, and target location from the URL.

The audit MUST contain the following sections:
1. **The AI Search Reality:** Show exactly what ChatGPT or Google AI Overviews says when a user asks for the "Best [their industry] in [their location]". Highlight that a competitor was recommended instead of them.
2. **Technical AI Gaps:** List what is broken with their digital footprint (DO NOT tell them how to fix it). Explicitly state that their website lacks machine-readable structure (like JSON-LD, FAQPage, and LocalBusiness schema) and that AI crawlers cannot extract their key attributes clearly. State they need broad directory consolidation, but do NOT give a specific list of platforms.
3. **Critical AI Hallucination:** Show one major hallucination or error. For example, if an AI engine currently thinks they don't offer a core service (even if they do), highlight that as a critical error costing them money.`;
    } else {
      const fullNiche = `${industry} in ${zipcode}`;
      prompt = `Act as a top-tier Generative Engine Optimization (GEO) expert. 
A business named "${businessName}" operating in the "${fullNiche}" space needs a highly-structured, actionable audit report formatted in Markdown to show them their visibility gaps in AI search.

The audit MUST contain the following sections:
1. **The AI Search Reality:** Show exactly what ChatGPT or Google AI Overviews says when a user asks for the "Best ${industry} in ${zipcode}". Highlight that a competitor was recommended instead of them.
2. **Technical AI Gaps:** List what is broken with their digital footprint (DO NOT tell them how to fix it). Explicitly state that their website lacks machine-readable structure (like JSON-LD, FAQPage, and LocalBusiness schema) and that AI crawlers cannot extract their key attributes clearly. State they need broad directory consolidation, but do NOT give a specific list of platforms.
3. **Critical AI Hallucination:** Show one major hallucination or error. For example, if an AI engine currently thinks they don't offer a core service (even if they do), highlight that as a critical error costing them money.`;
    }

    prompt += `
CRITICAL RULES:
- DO NOT write exact FAQ copy. State they need optimized FAQs, but do not provide the questions or answers.
- DO NOT write any schema code.
- DO NOT list specific directory platforms.
- DO NOT give specific PR angles or outreach strategies.
- Keep the tone professional, urgent, and highly valuable, focusing on the need for infrastructure installation.

OUTPUT FORMAT:
First, output your full, beautifully formatted Markdown audit.
Then, on a new line, write exactly "---DATA---" (without quotes).
Finally, on the next line, output ONLY a valid JSON object matching this exact schema:
{
  "currentScores": [score_chatgpt, score_perplexity, score_claude, score_google_sge],
  "projectedGrowth": [month1, month2, month3, month4, month5, month6],
  "competitorGrowth": [month1, month2, month3, month4, month5, month6]
}
Where scores and growths are arrays of realistic integers. For currentScores, give realistic low scores out of 100 representing their poor AI visibility. For projectedGrowth, show a steady increase up to ~95. For competitorGrowth, keep it relatively flat around ~15.`;

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
    const rawText = data.candidates[0].content.parts[0].text;
    
    const parts = rawText.split('---DATA---');
    const markdownReport = parts[0].trim();
    
    let result = {
        currentScores: [15, 20, 10, 35],
        projectedGrowth: [5, 12, 25, 45, 75, 92],
        competitorGrowth: [15, 16, 15, 14, 15, 13]
    };
    
    if (parts.length > 1) {
        try {
            const jsonStr = parts[1].replace(/```json/g, '').replace(/```/g, '').trim();
            result = JSON.parse(jsonStr);
        } catch (e) {
            console.error("Failed to parse chart JSON from Gemini, falling back to defaults", e);
        }
    }

    // Generate a unique slug for the report URL
    const slug = `${businessName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 8)}`;

    const supabase = await createClient();

    const { error: dbError } = await supabase
      .from('geo_reports')
      .insert({
        slug,
        business_name: businessName,
        industry,
        markdown_report: markdownReport,
        current_scores: result.currentScores,
        projected_growth: result.projectedGrowth,
        competitor_growth: result.competitorGrowth
      });

    if (dbError) {
      console.error("Supabase insert error:", dbError);
      throw new Error("Failed to save report to database.");
    }

    return NextResponse.json({ slug });

  } catch (error: any) {
    console.error("GEO API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
