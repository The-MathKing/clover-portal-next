import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!stripeSecretKey || !webhookSecret) {
    console.error('❌ Missing Stripe environment variables.');
    return NextResponse.json({ error: 'Webhook configuration error' }, { status: 500 });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables.');
    return NextResponse.json({ error: 'Database configuration error' }, { status: 500 });
  }

  // Initialize clients lazily inside the handler so they do not crash during build-time
  const stripe = new Stripe(stripeSecretKey, {
    apiVersion: '2024-12-18.preview' as any,
  });

  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      webhookSecret
    );
  } catch (err: any) {
    console.error(`❌ Webhook signature verification failed: ${err.message}`);
    return NextResponse.json({ error: `Webhook Error: ${err.message}` }, { status: 400 });
  }

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const userId = session.client_reference_id;

    if (!userId) {
      console.warn('⚠️ Webhook received checkout.session.completed but client_reference_id is missing.');
      return NextResponse.json({ received: true, warning: 'client_reference_id missing' });
    }

    // Determine purchase tier
    let tier: 'free' | 'starter' | 'unlimited' | 'lifetime' = 'unlimited';
    const metaTier = session.metadata?.tier?.toLowerCase();

    if (metaTier === 'starter' || metaTier === 'unlimited' || metaTier === 'lifetime') {
      tier = metaTier as any;
    } else {
      // Guess based on amount paid (in cents)
      const amount = session.amount_total;
      if (amount === 2000) {
        tier = 'starter';
      } else if (amount === 5000) {
        tier = 'unlimited';
      } else if (amount === 10000) {
        tier = 'lifetime';
      }
    }

    console.log(`💰 Stripe checkout completed for user ${userId}. Upgrading to tier: ${tier}`);

    // Update or insert database profile using RLS-bypassing admin client
    const { error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        subscription_tier: tier,
        email: session.customer_details?.email || null,
        updated_at: new Date().toISOString()
      });

    if (error) {
      console.error(`❌ Database update failed for user ${userId}:`, error.message);
      return NextResponse.json({ error: `Database update failed: ${error.message}` }, { status: 500 });
    }

    console.log(`✅ User ${userId} successfully upgraded to ${tier} tier in database.`);
  }

  return NextResponse.json({ received: true });
}
