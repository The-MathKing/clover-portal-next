import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key_for_build', {
  apiVersion: '2023-10-16' as any, // Use a real, stable API version
});

export async function POST(request: Request) {
  try {
    const { priceId } = await request.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe Secret Key is missing in environment variables.' }, { status: 500 });
    }

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

    return NextResponse.json({ sessionId: session.id });
  } catch (err: any) {
    console.error('Error creating Stripe checkout session:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
