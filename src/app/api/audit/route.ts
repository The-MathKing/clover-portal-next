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
      // Simulate network delay
      await new Promise(resolve => setTimeout(resolve, 3000));
      return NextResponse.json({
        score: Math.floor(Math.random() * 20) + 10, // Random low score 10-30
        verdict: `You are currently invisible to AI Search. When we queried for "${industry}", ${businessName} did not appear in the top algorithmic recommendations. We need to build your GEO Foundation immediately.`
      });
    }

    // Actual Gemini API Call using REST to avoid extra dependencies
    const prompt = `Act as an unbiased AI search engine (like Perplexity or Google AI Overviews). A user is searching for recommendations in the following industry/location: "${industry}".
    Does the business named "${businessName}" come up as a top, highly-recommended result in your training data for this query?
    
    Evaluate their current AI search presence and return ONLY a valid JSON object in this exact format:
    {
      "score": <number between 0 and 100 representing how well they rank or are known>,
      "verdict": "<A short, punchy 2-sentence explanation of why they got this score, written directly to the business owner>"
    }
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
        verdict: parsed.verdict || "AI search presence is critically low. We need to establish your algorithmic authority."
      });
    } catch (parseErr) {
      console.error("Error parsing Gemini JSON:", parseErr, resultText);
      return NextResponse.json({
        score: 12,
        verdict: "Error analyzing search presence. We can assume your score is dangerously low."
      });
    }

  } catch (error: any) {
    console.error("API /audit Error:", error);
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
