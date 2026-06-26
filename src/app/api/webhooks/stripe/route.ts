import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import crypto from 'crypto';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

// Map tier names to generation credits
function getGenerationCredits(tierName: string): number {
  const t = tierName.toLowerCase();
  if (t.includes('one time') || t.includes('demo') || t.includes('one-time')) return 1;
  if (t.includes('5-pack') || t.includes('5 per month') || t.includes('pro 5') || t.includes('5-pack')) return 5;
  if (t.includes('unlimited') || t.includes('pro 15')) return 999;
  // Fallback: guess by name
  return 1;
}

function getSubscriptionTier(tierName: string): string {
  const t = tierName.toLowerCase();
  if (t.includes('unlimited')) return 'unlimited';
  if (t.includes('5-pack') || t.includes('pro')) return 'starter';
  return 'starter';
}

// Verify Stripe webhook signature manually (no SDK needed)
function verifyStripeSignature(
  payload: string,
  signatureHeader: string,
  secret: string,
  tolerance: number = 300
): boolean {
  const elements = signatureHeader.split(',');
  const timestamp = elements.find(e => e.startsWith('t='))?.slice(2);
  const signatures = elements
    .filter(e => e.startsWith('v1='))
    .map(e => e.slice(3));

  if (!timestamp || signatures.length === 0) return false;

  const signedPayload = `${timestamp}.${payload}`;
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(signedPayload, 'utf8')
    .digest('hex');

  const isValid = signatures.some(sig => {
    try {
      return crypto.timingSafeEqual(
        Buffer.from(expectedSignature, 'hex'),
        Buffer.from(sig, 'hex')
      );
    } catch {
      return false;
    }
  });

  // Check timestamp tolerance
  const now = Math.floor(Date.now() / 1000);
  if (Math.abs(now - parseInt(timestamp)) > tolerance) return false;

  return isValid;
}

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature') || '';

  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!webhookSecret) {
    console.error('❌ Missing STRIPE_WEBHOOK_SECRET.');
    return NextResponse.json({ error: 'Webhook configuration error' }, { status: 500 });
  }

  if (!supabaseUrl || !supabaseServiceKey) {
    console.error('❌ Missing Supabase environment variables.');
    return NextResponse.json({ error: 'Database configuration error' }, { status: 500 });
  }

  // Verify signature
  if (!verifyStripeSignature(body, signature, webhookSecret)) {
    console.error('❌ Webhook signature verification failed.');
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 });
  }

  const event = JSON.parse(body);
  const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

  // Handle checkout.session.completed event
  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const userId = session.client_reference_id;

    if (!userId) {
      console.warn('⚠️ checkout.session.completed but client_reference_id is missing.');
      return NextResponse.json({ received: true, warning: 'client_reference_id missing' });
    }

    const tierName = session.metadata?.tier || 'One Time Pass';
    const credits = getGenerationCredits(tierName);
    const tier = getSubscriptionTier(tierName);
    const stripeCustomerId = session.customer || null;

    console.log(`💰 Checkout completed for user ${userId}. Tier: "${tierName}" → credits: ${credits}, subscription: ${tier}`);

    // Fetch current generations_remaining so we can ADD to it (stacking purchases)
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('generations_remaining')
      .eq('id', userId)
      .single();

    const currentGenerations = profile?.generations_remaining ?? 0;
    const newGenerations = tier === 'unlimited' ? 999 : currentGenerations + credits;

    // Update profile
    const { error } = await supabaseAdmin
      .from('profiles')
      .upsert({
        id: userId,
        subscription_tier: tier,
        generations_remaining: newGenerations,
        stripe_customer_id: stripeCustomerId,
        email: session.customer_details?.email || null,
        updated_at: new Date().toISOString(),
      });

    if (error) {
      console.error(`❌ Database update failed for user ${userId}:`, error.message);
      return NextResponse.json({ error: `Database update failed: ${error.message}` }, { status: 500 });
    }

    console.log(`✅ User ${userId} upgraded to "${tier}" with ${newGenerations} generations.`);
  }

  return NextResponse.json({ received: true });
}
