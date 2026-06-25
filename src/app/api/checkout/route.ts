import { NextResponse } from 'next/server';
import Stripe from 'stripe';

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
      apiVersion: '2025-05-28.basil',
    });

    // Determine payment mode (subscription vs one-time payment)
    // "Active Seller Pass" is billed monthly, therefore it requires mode: 'subscription'
    const isSubscription = 
      tierName.toLowerCase().includes('pass') || 
      tierName.toLowerCase().includes('monthly') || 
      tierName.toLowerCase().includes('/mo');
      
    const mode = isSubscription ? 'subscription' : 'payment';

    console.log(`🛒 Creating Stripe Checkout Session for user ${userId} (${userEmail}) for tier "${tierName}" in mode "${mode}"...`);

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: mode,
      client_reference_id: userId,
      customer_email: userEmail || undefined,
      metadata: {
        tier: tierName,
      },
      success_url: `${req.headers.get('origin')}/?payment=success&session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${req.headers.get('origin')}/?payment=cancelled`,
    });

    console.log(`✅ Stripe Checkout Session created: ${session.id}`);
    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('❌ Error creating Stripe checkout session:', err);
    return NextResponse.json({ error: err.message || 'Internal Server Error' }, { status: 500 });
  }
}
