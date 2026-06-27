import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { businessName, industry } = await req.json();

    if (!businessName || !industry) {
      return NextResponse.json({ error: 'Missing businessName or industry' }, { status: 400 });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;

    // Fallback if API key is not configured
    if (!geminiApiKey) {
      console.warn("No GEMINI_API_KEY provided. Returning mock response.");
      await new Promise(resolve => setTimeout(resolve, 3000));
      return NextResponse.json({
        score: Math.floor(Math.random() * 20) + 10,
        rank: "Not Listed in Top 10",
        verdict: `You are currently invisible to AI Search. When we queried for "${industry}", ${businessName} did not appear in the top algorithmic recommendations. We need to build your GEO Foundation immediately.`,
        breakdown: {
          brandAuthority: Math.floor(Math.random() * 30) + 10,
          sentiment: Math.floor(Math.random() * 50) + 20,
          citationFrequency: Math.floor(Math.random() * 20) + 5,
          directRecommendation: Math.floor(Math.random() * 15) + 5
        },
        competitors: [
          "Local Expert Pros", 
          "Top Tier Services", 
          "Premier Regional Solutions",
          "Elite Area Specialists",
          "Next Gen Local",
          "Advanced Precision Group",
          "Pinnacle Neighborhood Services",
          "Metro Trusted Partners",
          "Summit Reliable Co.",
          "Citywide Recommended"
        ]
      });
    }

    // Actual Gemini API Call
    const prompt = `Act as an unbiased AI search engine (like Perplexity or Google AI Overviews). A user is searching for recommendations in the following industry/location: "${industry}".
    IMPORTANT CONTEXT: If the location includes a 5-digit number, assume it is a United States Zip Code (e.g., 75002 is Allen, Texas, NOT Paris, France). Do not hallucinate European locations for US zip codes.
    
    Does the business named "${businessName}" come up as a top, highly-recommended result in your training data for this query?
    
    Evaluate their current AI search presence and return ONLY a valid JSON object in this exact format:
    {
      "score": <number between 0 and 100 representing how well they rank or are known>,
      "rank": "<Where they rank on the list of AI-recommended businesses, e.g. '#4 out of 15', 'Not Listed'>",
      "verdict": "<A short, punchy 2-sentence explanation of why they got this score, written directly to the business owner>",
      "breakdown": {
        "brandAuthority": <score 0-100>,
        "sentiment": <score 0-100>,
        "citationFrequency": <score 0-100>,
        "directRecommendation": <score 0-100>
      },
      "competitors": [
        "<Competitor 1 Name>", 
        "<Competitor 2 Name>", 
        "<Competitor 3 Name>",
        "<Competitor 4 Name>",
        "<Competitor 5 Name>",
        "<Competitor 6 Name>",
        "<Competitor 7 Name>",
        "<Competitor 8 Name>",
        "<Competitor 9 Name>",
        "<Competitor 10 Name>"
      ]
    }
    Make sure to provide a robust list of exactly 10 real competitor businesses in that exact US area. If you can't find 10, generate highly realistic-sounding local competitors for that specific US city/zipcode.
    Make sure the response is purely JSON without any markdown formatting like \`\`\`json.`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        contents: [{
          parts: [{ text: prompt }]
        }],
        generationConfig: {
          responseMimeType: "application/json"
        }
      })
    });

    if (!response.ok) {
      const err = await response.text();
      console.error("Gemini API Error:", err);
      throw new Error("Failed to fetch from Gemini");
    }

    const data = await response.json();
    const resultText = data.candidates?.[0]?.content?.parts?.[0]?.text;
    
    if (!resultText) {
      throw new Error("Empty response from Gemini");
    }

    try {
      const parsed = JSON.parse(resultText);
      return NextResponse.json({
        score: parsed.score || 15,
        rank: parsed.rank || "Not Listed",
        verdict: parsed.verdict || "AI search presence is critically low. We need to establish your algorithmic authority.",
        breakdown: parsed.breakdown || {
          brandAuthority: 10,
          sentiment: 20,
          citationFrequency: 5,
          directRecommendation: 2
        },
        competitors: parsed.competitors || [
          "Unknown Competitor 1", 
          "Unknown Competitor 2", 
          "Unknown Competitor 3",
          "Unknown Competitor 4",
          "Unknown Competitor 5",
          "Unknown Competitor 6",
          "Unknown Competitor 7",
          "Unknown Competitor 8",
          "Unknown Competitor 9",
          "Unknown Competitor 10"
        ]
      });
    } catch (parseErr) {
      console.error("Error parsing Gemini JSON:", parseErr, resultText);
      throw new Error("Invalid JSON from Gemini");
    }

  } catch (error: any) {
    console.error("API /audit Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
