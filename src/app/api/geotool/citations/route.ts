import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { businessName, phone, zipCode, yextKey: brightLocalKey, brightLocalSecret } = body;

    if (!businessName || !phone || !zipCode) {
      return NextResponse.json({ error: 'Business Name, Phone, and Zip Code are required for a BrightLocal scan.' }, { status: 400 });
    }

    if (!brightLocalKey || !brightLocalSecret) {
      return NextResponse.json({ error: 'BrightLocal API Key and API Secret are required.' }, { status: 400 });
    }

    // 1. Generate expires timestamp (current time + 1 hour)
    const expires = Math.floor(Date.now() / 1000) + 3600;

    // 2. Generate HMAC-SHA256 signature
    const signatureRaw = crypto
      .createHmac('sha256', brightLocalSecret)
      .update(brightLocalKey + expires)
      .digest('base64');

    // 3. Make the API Request
    // Note: We use a lightweight local-search report endpoint as an example of citation data collection.
    const apiUrl = 'https://tools.brightlocal.com/seo-tools/api/v4/ld/report';
    
    // We construct the payload according to BrightLocal's typical requirements
    const payload = {
      "report-name": `Citation Sync: ${businessName}`,
      "business-names": businessName,
      "postcode": zipCode,
      "telephone": phone,
      "search-terms": "coffee\ncafe\nlocal business", // Generic terms for the API requirement
      "country": "USA"
    };

    const response = await fetch(apiUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'api-key': brightLocalKey,
        'sig': signatureRaw,
        'expires': expires.toString()
      },
      body: JSON.stringify(payload)
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.error_message || data.message || 'BrightLocal API request failed');
    }

    return NextResponse.json({ 
      success: true, 
      message: `Successfully authenticated with BrightLocal API. Job initiated. Report ID: ${data.report_id || 'Pending'}` 
    });

  } catch (error: any) {
    return NextResponse.json({ error: error.message || 'Internal Server Error' }, { status: 500 });
  }
}
