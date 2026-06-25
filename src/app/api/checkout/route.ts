import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { priceId, userId, userEmail, tierName } = await req.json();

    if (!priceId || !userId) {
      return NextResponse.json({ error: 'Missing priceId or userId' }, { status: 400 });
    }

    const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
    if (!stripeSecretKey) {
      return NextResponse.json({ error: 'Stripe configuration missing' }, { status: 500 });
    }

    // Determine payment mode
    const isSubscription =
      tierName.toLowerCase().includes('unlimited') ||
      tierName.toLowerCase().includes('monthly') ||
      tierName.toLowerCase().includes('/mo');

    const mode = isSubscription ? 'subscription' : 'payment';
    const origin = req.headers.get('origin') || 'https://clovrr.net';

    console.log(`🛒 Checkout: "${tierName}" | mode: ${mode} | key: ${stripeSecretKey.slice(0, 12)}... | price: ${priceId}`);

    // Build form-encoded body for Stripe REST API
    const params = new URLSearchParams();
    params.append('payment_method_types[]', 'card');
    params.append('line_items[0][price]', priceId);
    params.append('line_items[0][quantity]', '1');
    params.append('mode', mode);
    params.append('client_reference_id', userId);
    params.append('metadata[tier]', tierName);
    params.append('success_url', `${origin}/?payment=success&session_id={CHECKOUT_SESSION_ID}`);
    params.append('cancel_url', `${origin}/?payment=cancelled`);
    if (userEmail) {
      params.append('customer_email', userEmail);
    }

    // Call Stripe REST API directly (bypasses SDK entirely)
    const response = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${stripeSecretKey}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: params.toString(),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('❌ Stripe API error:', JSON.stringify(data));
      return NextResponse.json(
        { error: data?.error?.message || 'Stripe error' },
        { status: response.status }
      );
    }

    console.log(`✅ Session created: ${data.id}`);
    return NextResponse.json({ url: data.url });
  } catch (err: any) {
    console.error('❌ Checkout error:', err?.message);
    return NextResponse.json(
      { error: err.message || 'Internal Server Error' },
      { status: 500 }
    );
  }
}
