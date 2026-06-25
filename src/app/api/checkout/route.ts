import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Force Node.js runtime — prevents Next.js from intercepting fetch,
// which breaks Stripe SDK v22's outbound network calls on Vercel.
export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { priceId, userId, userEmail, tierName } = await req.json();

    if (!priceId || !userId) {
      console.error('❌ Missing priceId or userId in checkout request.');
      return NextResponse.json({ error: 'Missing priceId or userId' }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      console.error('❌ STRIPE_SECRET_KEY environment variable is not defined.');
      return NextResponse.json({ error: 'Stripe configuration missing' }, { status: 500 });
    }

    // Initialize Stripe client
    const stripe = new Stripe(stripeSecretKey, {
      apiVersion: '2026-05-27.dahlia',
    });

    // Determine payment mode (subscription vs one-time payment)
    const isSubscription =
      tierName.toLowerCase().includes('pass') ||
      tierName.toLowerCase().includes('monthly') ||
      tierName.toLowerCase().includes('/mo');

    const mode = isSubscription ? 'subscription' : 'payment';

    console.log(`🛒 Creating checkout for "${tierName}" | mode: ${mode}`);
    console.log(`🔑 Key prefix in use: ${stripeSecretKey.slice(0, 12)}...`);
    console.log(`💰 Price ID: ${priceId}`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{ price: priceId, quantity: 1 }],
      mode: mode,
      client_reference_id: userId,
      customer_email: userEmail || undefined,
      metadata: { tier: tierName },
      success_url: `${req.headers.get('origin')}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/?payment=cancelled`,
    });

    console.log(`✅ Session created: ${session.id}`);
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('❌ Stripe error type   :', err?.type);
    console.error('❌ Stripe error code   :', err?.code);
    console.error('❌ Stripe error message:', err?.message);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
