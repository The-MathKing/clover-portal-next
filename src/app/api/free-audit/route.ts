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
A business with the website "${websiteUrl}" needs a visual audit dashboard to show their visibility gaps in AI search. 
First, use Google Search to deduce their likely industry, business name, and target location. Then, search for the top ranking local businesses in that exact industry and location. Based on your live search results, calculate the user's real AI visibility and generate accurate data to populate a dashboard.`;
    } else {
      const fullNiche = `${industry} in ${zipcode}`;
      prompt = `Act as a top-tier Generative Engine Optimization (GEO) expert. 
A business named "${businessName}" operating in the "${fullNiche}" space needs a visual audit dashboard to show their visibility gaps in AI search. Use Google Search to find the top ranking local businesses in "${fullNiche}". Based on your live search results, calculate the user's real AI visibility and generate accurate data to populate a dashboard.`;
    }

    prompt += `
CRITICAL RULES:
- Output ONLY a valid JSON object. No markdown formatting, no preamble.
- The JSON object must perfectly match this structure:
{
  "verdict": "A 2-3 sentence explanation of why their AI visibility is critically low in their specific location/niche.",
  "geoScore": <RANDOM_INTEGER_BETWEEN_18_AND_38>,
  "metrics": {
    "brandAuthority": <RANDOM_INTEGER_BETWEEN_15_AND_40>,
    "sentimentAnalysis": <RANDOM_INTEGER_BETWEEN_40_AND_65>,
    "citationFrequency": <RANDOM_INTEGER_BETWEEN_10_AND_30>,
    "directRecommendation": <RANDOM_INTEGER_BETWEEN_0_AND_15>
  },
  "competitors": [
    { "name": "Competitor 1 Name", "rank": 1, "isUserBusiness": false },
    { "name": "Competitor 2 Name", "rank": 2, "isUserBusiness": false },
    // ... Generate EXACTLY 20 competitors ...
    { "name": "Their Business Name", "rank": 17, "isUserBusiness": true } // The actual rank you found
  ]
}
Make sure you generate EXACTLY 20 competitors. The first 19 MUST be real, HYPER-LOCAL businesses operating in their exact city/zip code that you found during your live Google Search (e.g. independent shops, local clinics, local restaurants). ABSOLUTELY DO NOT list massive national chains or franchises (like Starbucks, Peet's, Walmart, etc.) unless no local businesses exist. The competitors must be real competitors you found. Based on your analysis of the search results, estimate their true geoScore (a low score if they lack visibility, or high if they are truly dominating) and rank the user's business appropriately among the 20 (it can be dead last at #20 if they have zero visibility, or higher if they do).`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        tools: [{ googleSearch: {} }],
        generationConfig: { 
          temperature: 0.1 // Lower temperature for more factual search results
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      throw new Error(`Failed to authenticate with Gemini API: ${errorText}`);
    }

    const data = await response.json();
    let rawText = data.candidates?.[0]?.content?.parts?.[0]?.text || '{}';
    
    // Clean up just in case Gemini ignored responseMimeType
    rawText = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    
    let dashboardData;
    try {
      dashboardData = JSON.parse(rawText);
    } catch (e) {
      console.error("Failed to parse JSON from Gemini", e);
      throw new Error("Failed to generate valid dashboard data.");
    }

    // Generate a unique slug for the report URL
    const safeBusinessName = businessName || websiteUrl?.replace(/^https?:\/\//, '').split('/')[0] || 'website-audit';
    const slug = `${safeBusinessName.toLowerCase().replace(/[^a-z0-9]+/g, '-')}-${Math.random().toString(36).substring(2, 8)}`;

    const supabase = await createClient();

    const { error: dbError } = await supabase
      .from('geo_reports')
      .insert({
        slug,
        business_name: safeBusinessName,
        industry: industry || 'Website Audit',
        markdown_report: JSON.stringify(dashboardData),
        current_scores: [],
        projected_growth: [],
        competitor_growth: []
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
