'use client';

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
    <div className="min-h-screen bg-black text-[#f5f5f5] selection:bg-white/20 font-sans">
      {/* ── Minimalist Apple-Style Navigation ── */}
      <nav className="fixed top-0 w-full z-50 nav-blur transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 opacity-90 hover:opacity-100 transition-opacity">
            <div className="w-5 h-5 bg-white rounded-md flex items-center justify-center">
              <span className="text-black font-black text-[10px] tracking-tighter">C</span>
            </div>
            <span className="text-sm font-semibold tracking-wide">Clovrr</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#a1a1a6]">
            <Link href="/" className="hover:text-white transition-colors">Overview</Link>
            <Link href="/pricing" className="text-white">Pricing</Link>
            <Link href="/contact" className="px-4 py-1.5 rounded-full bg-white text-black font-semibold hover:scale-105 transition-transform">
              Book Audit
            </Link>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-32 md:py-48">
        
        <div className="text-center max-w-3xl mx-auto mb-24">
          <h1 className="text-5xl md:text-7xl font-semibold tracking-tighter mb-6 text-white">
            Pricing.
          </h1>
          <p className="text-xl md:text-2xl text-[#a1a1a6] tracking-tight">
            Our structured 3-tier approach to making your business the undeniable recommendation across all AI search engines.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-6 max-w-6xl mx-auto">
          {/* Tier 1 */}
          <div className="bento-box p-10 flex flex-col h-full">
            <div className="w-12 h-12 bg-[#2d2d2f] rounded-2xl flex items-center justify-center mb-8">
              <Search className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">AI Readiness Audit</h3>
            <div className="mb-8">
              <span className="text-5xl font-semibold tracking-tighter text-white">Free</span>
            </div>
            <p className="text-[#a1a1a6] text-sm leading-relaxed mb-8 flex-grow">
              Are you invisible to the algorithms of tomorrow? We run a comprehensive diagnostic on your brand across ChatGPT, Perplexity, Claude, and Google AI Overviews.
            </p>
            <ul className="space-y-4 mb-10 text-sm font-medium text-[#f5f5f5]">
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-[#a1a1a6]" /> AI Competitor Analysis</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-[#a1a1a6]" /> Overviews Simulation</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-[#a1a1a6]" /> Actionable GEO Plan</li>
            </ul>
            <Link href="/contact" className="w-full py-4 rounded-full bg-[#1d1d1f] hover:bg-[#2d2d2f] text-white font-semibold text-center transition-colors">
              Get Free Audit
            </Link>
          </div>

          {/* Tier 2 */}
          <div className="bento-box-highlight p-10 flex flex-col h-full relative overflow-hidden">
            <div className="absolute top-0 inset-x-0 flex justify-center mt-4">
              <div className="bg-white text-black text-[10px] font-bold px-3 py-1 rounded-full tracking-widest uppercase">
                Most Popular
              </div>
            </div>
            
            <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-8 mt-6">
              <Target className="w-6 h-6 text-black" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">GEO Foundation</h3>
            <div className="mb-8 flex items-baseline gap-1">
              <span className="text-5xl font-semibold tracking-tighter text-white">$129</span>
              <span className="text-[#a1a1a6] text-sm">/mo</span>
            </div>
            <p className="text-[#a1a1a6] text-sm leading-relaxed mb-8 flex-grow">
              We build the data infrastructure that AI engines trust. This tier completely overhauls your digital presence.
            </p>
            <ul className="space-y-4 mb-10 text-sm font-medium text-[#f5f5f5]">
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-white" /> Advanced Schema Markup</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-white" /> Site Q&A Restructure</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-white" /> Knowledge Graph Seeding</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-white" /> Directory Consolidation</li>
            </ul>
            <button 
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_FOUNDATION_PRICE_ID || 'price_1TnP6fCVfP2wmhsSudX8T4fn', 'The GEO Foundation')}
              className="w-full py-4 rounded-full bg-white hover:bg-neutral-200 text-black font-semibold transition-colors shadow-[0_0_20px_rgba(255,255,255,0.1)]"
            >
              Start Foundation
            </button>
          </div>

          {/* Tier 3 */}
          <div className="bento-box p-10 flex flex-col h-full">
            <div className="w-12 h-12 bg-[#2d2d2f] rounded-2xl flex items-center justify-center mb-8">
              <ShieldCheck className="w-6 h-6 text-white" />
            </div>
            <h3 className="text-2xl font-semibold text-white mb-2">Algorithmic Authority</h3>
            <div className="mb-8 flex items-baseline gap-1">
              <span className="text-5xl font-semibold tracking-tighter text-white">$299</span>
              <span className="text-[#a1a1a6] text-sm">/mo</span>
            </div>
            <p className="text-[#a1a1a6] text-sm leading-relaxed mb-8 flex-grow">
              AI models learn continuously. This ongoing partnership actively manages the sentiment of your footprint to defend your spot.
            </p>
            <ul className="space-y-4 mb-10 text-sm font-medium text-[#f5f5f5]">
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-[#a1a1a6]" /> Everything in Foundation</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-[#a1a1a6]" /> Volatility Monitoring</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-[#a1a1a6]" /> High-Authority Citations</li>
              <li className="flex items-center gap-3"><Check className="w-4 h-4 text-[#a1a1a6]" /> Sentiment Reports</li>
            </ul>
            <button 
              onClick={() => handleCheckout(process.env.NEXT_PUBLIC_STRIPE_AUTHORITY_PRICE_ID || 'price_1TnPFwCVfP2wmhsSrcTH5CzD', 'Algorithmic Authority')}
              className="w-full py-4 rounded-full bg-[#1d1d1f] hover:bg-[#2d2d2f] text-white font-semibold transition-colors"
            >
              Subscribe Now
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
