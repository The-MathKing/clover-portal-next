"use client";

import React from 'react';
import { Search, Target, ShieldCheck, Check, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { loadStripe } from '@stripe/stripe-js';

// Load Stripe outside of a component's render to avoid recreating the object
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || '');

export default function PricingPage() {
  const handleCheckout = async (priceId: string, tierName: string) => {
    if (!process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY) {
      alert("Stripe keys are missing! Check the setup instructions.");
      return;
    }
    
    try {
      const response = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ priceId, tierName }),
      });
      const data = await response.json();
      
      if (data.sessionId) {
        const stripe = await stripePromise;
        if (stripe) {
          await (stripe as any).redirectToCheckout({ sessionId: data.sessionId });
        }
      } else {
        alert(data.error || 'Something went wrong during checkout.');
      }
    } catch (err) {
      console.error('Checkout Error:', err);
      alert('Failed to initiate checkout.');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-white selection:bg-emerald-500/30 selection:text-emerald-200">
      <div className="max-w-7xl mx-auto px-6 py-12 md:py-24">
        
        <Link href="/" className="inline-flex items-center gap-2 text-neutral-400 hover:text-white transition-colors mb-12">
          <ArrowLeft className="w-4 h-4" />
          Back to Home
        </Link>
        
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h1 className="text-4xl md:text-6xl font-black tracking-tight mb-6">
            Pricing & <span className="text-emerald-500">Services</span>
          </h1>
          <p className="text-neutral-400 text-lg md:text-xl leading-relaxed">
            Our structured 3-tier approach to making your business the undeniable recommendation across all AI search engines.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {/* Tier 1 */}
          <div className="glass-panel rounded-3xl p-8 flex flex-col h-full hover:border-neutral-700 hover:-translate-y-2 transition-all duration-300">
            <div className="w-12 h-12 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-center mb-6">
              <Search className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">The AI Readiness Audit</h3>
            <div className="mb-6">
              <span className="text-4xl font-black">Free</span>
            </div>
            <p className="text-neutral-400 leading-relaxed text-sm mb-8 flex-grow">
              Are you invisible to the algorithms of tomorrow? We run a comprehensive diagnostic on your brand across ChatGPT, Perplexity, Claude, and Google AI Overviews.
            </p>
            <ul className="space-y-4 mb-8 text-sm text-neutral-300">
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> AI Competitor Analysis</li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> Generative Overviews Simulation</li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> Actionable GEO Plan</li>
            </ul>
            <Link href="/contact" className="w-full block text-center py-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition-colors">
              Get Free Audit
            </Link>
          </div>

          {/* Tier 2 */}
          <div className="glass-panel-emerald rounded-3xl p-8 flex flex-col h-full relative overflow-hidden shadow-2xl shadow-emerald-900/20 animate-glow-pulse hover:-translate-y-2 transition-transform duration-300">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none" />
            <div className="absolute top-0 inset-x-0 bg-emerald-500 text-neutral-950 text-xs font-bold py-1 text-center uppercase tracking-wider">Most Popular</div>
            
            <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mb-6 mt-4">
              <Target className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">The GEO Foundation</h3>
            <div className="mb-6">
              <span className="text-4xl font-black">$129</span>
              <span className="text-neutral-500 ml-2">/month</span>
            </div>
            <p className="text-neutral-400 leading-relaxed text-sm mb-8 flex-grow">
              We build the data infrastructure that AI engines trust. This tier completely overhauls your digital presence.
            </p>
            <ul className="space-y-4 mb-8 text-sm text-neutral-300">
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> Advanced Schema Markup Injection</li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> Site Q&A Architecture Restructure</li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> Knowledge Graph Seeding</li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> Directory Consolidation</li>
            </ul>
            <button 
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_FOUNDATION_PRICE_ID || 'price_1TnP6fCVfP2wmhsSudX8T4fn', 'The GEO Foundation')}
              className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold transition-all shadow-lg shadow-emerald-500/25"
            >
              Start Foundation
            </button>
          </div>

          {/* Tier 3 */}
          <div className="glass-panel rounded-3xl p-8 flex flex-col h-full hover:border-neutral-700 hover:-translate-y-2 transition-all duration-300">
            <div className="w-12 h-12 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-center mb-6">
              <ShieldCheck className="w-6 h-6 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Algorithmic Authority</h3>
            <div className="mb-6">
              <span className="text-4xl font-black">$299</span>
              <span className="text-neutral-500 ml-2">/month</span>
            </div>
            <p className="text-neutral-400 leading-relaxed text-sm mb-8 flex-grow">
              AI models learn continuously. This ongoing partnership actively manages the sentiment of your digital footprint to defend your spot.
            </p>
            <ul className="space-y-4 mb-8 text-sm text-neutral-300">
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> Everything in Foundation</li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> AI Search Volatility Monitoring</li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> High-Authority Citation Curation</li>
              <li className="flex items-start gap-3"><Check className="w-5 h-5 text-emerald-500 shrink-0" /> Monthly Sentiment Reports</li>
            </ul>
            <button 
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_AUTHORITY_PRICE_ID || 'price_1TnPFwCVfP2wmhsSrcTH5CzD', 'Algorithmic Authority')}
              className="w-full py-4 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-bold transition-colors"
            >
              Subscribe Now
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
