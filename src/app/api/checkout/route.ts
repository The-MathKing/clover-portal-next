import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// We initialize Stripe inside the handler to prevent Next.js caching empty env variables

export async function POST(request: Request) {
  try {
    const { priceId } = await request.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe Secret Key is missing in environment variables.' }, { status: 500 });
    }

    const secretKey = process.env.STRIPE_SECRET_KEY.trim();
    if (!secretKey.startsWith('sk_')) {
      return NextResponse.json({ error: 'Invalid Stripe Secret Key format (must start with sk_)' }, { status: 500 });
    }

    const stripe = new Stripe(secretKey, {
      apiVersion: '2024-04-10' as any, 
    });

    if (!priceId || !priceId.startsWith('price_')) {
      return NextResponse.json({ error: 'Invalid price ID format' }, { status: 400 });
    }

    // Create a Stripe Checkout Session using the exact Price ID from the Stripe Dashboard
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId, // Uses the real Price ID passed from the frontend env variable
          quantity: 1,
        },
      ],
      mode: 'subscription', // Since both your $129 and $299 tiers are monthly subscriptions
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/pricing?canceled=true`,
    });

    return NextResponse.json({ url: session.url });
  } catch (err: any) {
    console.error('Error creating Stripe checkout session:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
