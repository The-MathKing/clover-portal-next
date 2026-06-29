import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const { websiteUrl } = await req.json();

    if (!websiteUrl) {
      return NextResponse.json({ error: 'Missing website URL' }, { status: 400 });
    }

    const geminiApiKey = process.env.GEMINI_API_KEY;
    if (!geminiApiKey) {
      return NextResponse.json({ error: 'GEMINI_API_KEY is not configured on the server.' }, { status: 500 });
    }

    // Try to fetch some basic info from the URL to help Gemini
    let siteContext = "";
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 4000);
      
      const urlToFetch = websiteUrl.startsWith('http') ? websiteUrl : `https://${websiteUrl}`;
      const response = await fetch(urlToFetch, { 
        signal: controller.signal,
        headers: { 'User-Agent': 'Mozilla/5.0 (compatible; ClovrrBot/1.0)' }
      });
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const html = await response.text();
        const titleMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
        const descMatch = html.match(/<meta[^>]*name=["']description["'][^>]*content=["']([^"']+)["'][^>]*>/i);
        
        if (titleMatch) siteContext += `Website Title: ${titleMatch[1].trim()}\n`;
        if (descMatch) siteContext += `Website Description: ${descMatch[1].trim()}\n`;
      }
    } catch (e) {
      console.log(`Could not fetch ${websiteUrl} for context, relying solely on Gemini knowledge.`);
    }

    const prompt = `Act as an expert local SEO analyst and sales outreach specialist.
I need to write a personalized outreach email to a business based on their URL: ${websiteUrl}
${siteContext ? `\nHere is some context scraped from their homepage:\n${siteContext}\n` : ''}

First, carefully deduce the following:
1. The exact Business Name (e.g. "The Casita Mexican Grill", not just "Casita")
2. Their specific Industry/Niche (e.g. "Mexican Restaurant", "Plumbing", "Dental Clinic")
3. Their City/Location
4. Two real, hyper-local competitors in that exact city and industry. Do not use massive national chains unless necessary.

Then, generate the following exact email template, replacing the bracketed variables with your deduced information. Do not add any extra text or pleasantries outside the email. Output ONLY the completed email text.

Subject: AI Search Visibility for [Business Name]

Hello,

We recently ran a search visibility analysis for [Industry/Niche] providers in [City]. While competitors such as [Competitor A] and [Competitor B] are frequently being recommended, [Business Name] is currently missing from these AI-generated results.

Often it is just a matter of missing structural data tags that allow AI engines to accurately verify and recommend your services to customers.

We put together a quick diagnostic report that highlights the specific gaps preventing your inclusion. (See attached document).

Would you be open to a brief chat to review it? I am happy to work around your schedule—just let us know what day or time works best for you.

Best regards,

Aryan Padarthi
Clovrr Solutions`;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { 
          temperature: 0.4
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Gemini API Error:", errorText);
      throw new Error(`Failed to authenticate with Gemini API: ${errorText}`);
    }

    const data = await response.json();
    const generatedEmail = data.candidates?.[0]?.content?.parts?.[0]?.text || '';

    if (!generatedEmail) {
        throw new Error("Gemini returned an empty response.");
    }

    return NextResponse.json({ email: generatedEmail.trim() });

  } catch (error: any) {
    console.error("Leading Email API Error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
