import { NextResponse } from 'next/server';
import { Resend } from 'resend';

// Initialize Resend with the API key from environment variables
const resend = new Resend(process.env.RESEND_API_KEY || 're_mock_key');
const receivingEmail = process.env.LEAD_EMAIL || 'aryan.r.padarthi@gmail.com';

export async function POST(req: Request) {
  try {
    const { name, email, business, message } = await req.json();

    if (!name || !email || !business) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Check if the API key is actually set, otherwise mock success
    if (!process.env.RESEND_API_KEY) {
      console.log('No RESEND_API_KEY found. Simulating email send for lead:', { name, email, business });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      return NextResponse.json({ success: true, mock: true });
    }

    const data = await resend.emails.send({
      from: 'Clovrr Leads <onboarding@resend.dev>', // Using Resend's default testing domain since clovrr.net is unverified
      to: receivingEmail,
      subject: `🚨 New AI Audit Lead: ${business}`,
      html: `
        <h2>New AI Audit Lead</h2>
        <p><strong>Name:</strong> ${name}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Business:</strong> ${business}</p>
        <p><strong>Message:</strong></p>
        <blockquote>${message || 'No message provided.'}</blockquote>
      `,
    });

    if (data.error) {
      console.error('Resend Error:', data.error);
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 });
    }

    return NextResponse.json({ success: true, data });
  } catch (error) {
    console.error('Contact API Error:', error);
    return NextResponse.json(
      { error: 'Internal Server Error' },
      { status: 500 }
    );
  }
}
