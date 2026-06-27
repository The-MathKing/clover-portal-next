import { NextResponse } from 'next/server';
import Stripe from 'stripe';

// Initialize Stripe with the secret key
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || 'dummy_key_for_build', {
  apiVersion: '2026-06-24.dahlia', // Use a recent stable API version
});

export async function POST(request: Request) {
  try {
    const { priceId, tierName } = await request.json();

    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json({ error: 'Stripe Secret Key is missing in environment variables.' }, { status: 500 });
    }

    // Since this is a template and we don't have actual price IDs from your Stripe dashboard yet,
    // we'll dynamically create a price-data object on the fly for demonstration purposes.
    // In production, you would pass the actual `price_xxxxxx` ID from Stripe instead of this.
    
    let unitAmount = 0;
    if (priceId === 'price_foundation') {
      unitAmount = 49900; // $499.00 in cents
    } else if (priceId === 'price_authority') {
      unitAmount = 99900; // $999.00 in cents
    } else {
      return NextResponse.json({ error: 'Invalid price ID' }, { status: 400 });
    }

    // Create a Stripe Checkout Session
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: tierName,
              description: 'Clovrr Generative Engine Optimization Services',
            },
            unit_amount: unitAmount,
            // You can make this recurring by adding: recurring: { interval: 'month' } for the $999 tier
            ...(priceId === 'price_authority' ? { recurring: { interval: 'month' } } : {})
          },
          quantity: 1,
        },
      ],
      mode: priceId === 'price_authority' ? 'subscription' : 'payment',
      success_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/?success=true`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/pricing?canceled=true`,
    });

    return NextResponse.json({ sessionId: session.id });
  } catch (err: any) {
    console.error('Error creating Stripe checkout session:', err);
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
