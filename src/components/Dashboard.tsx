'use client';
import React from 'react';
import { Plus, Clock, AlertCircle, CheckCircle, Layers, Video, PlayCircle, Star, Sparkles, Check, Zap, Lock, X, TrendingUp, User, LogOut, Image as ImageIcon, ArrowRight } from 'lucide-react';
import { mockProperties } from '../mockData';
import type { Property } from '../mockData';
import { useStore } from '../store/useStore';
import { createClient } from '@/utils/supabase/client';

interface DashboardProps {
  onSelectProperty: (property: Property) => void;
}

export const Dashboard: React.FC<DashboardProps> = ({ onSelectProperty }) => {
  const { 
    setWizardOpen, 
    activeTab, 
    setActiveTab, 
    userProperties, 
    subscriptionTier, 
    setSubscriptionTier,
    userId,
    userEmail
  } = useStore();

  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  const supabase = createClient();

  const handleChooseTier = async (tierName: string) => {
    let priceId = '';
    let mappedTier: 'one_time' | 'pro_5' | 'unlimited' = 'one_time';
    
    if (tierName.toLowerCase().includes('one time') || tierName.toLowerCase().includes('demo')) {
      priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_ONE_TIME || '';
      mappedTier = 'one_time';
    } else if (
      tierName.toLowerCase().includes('5-pack') || 
      tierName.toLowerCase().includes('5 per month') || 
      tierName.toLowerCase().includes('pro 5')
    ) {
      priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_PRO_5 || '';
      mappedTier = 'pro_5';
    } else if (tierName.toLowerCase().includes('unlimited') || tierName.toLowerCase().includes('pro 15')) {
      priceId = process.env.NEXT_PUBLIC_STRIPE_PRICE_UNLIMITED || '';
      mappedTier = 'unlimited';
    }

    if (priceId) {
      try {
        console.log(`Initiating checkout for price: ${priceId}`);
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            priceId,
            userId,
            userEmail,
            tierName,
          }),
        });
        const data = await res.json();
        if (data.url) {
          window.location.href = data.url;
        } else {
          throw new Error(data.error || 'Failed to create checkout session');
        }
      } catch (err: any) {
        console.error("Stripe checkout redirect error:", err);
        alert(`Checkout failed: ${err.message || 'Please try again later.'}`);
      }
    } else {
      alert(`Stripe is not configured. Missing Price ID for tier: ${tierName}. Please add the NEXT_PUBLIC_STRIPE_PRICE_... variables to your .env.local file to enable checkout.`);
    }
  };

  const handleSignOut = async () => {
    setIsProfileOpen(false);
    await supabase.auth.signOut();
  };

  const getStatusBadge = (status: Property['status']) => {
    switch (status) {
      case 'Ready':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-emerald-950/50 text-emerald-400 border border-emerald-800/30">
            <CheckCircle className="w-3.5 h-3.5" />
            Ready
          </span>
        );
      case 'Processing':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-amber-950/50 text-amber-400 border border-amber-800/30">
            <Clock className="w-3.5 h-3.5 animate-pulse" />
            Processing
          </span>
        );
      case 'Needs Images':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-full bg-rose-950/50 text-rose-400 border border-rose-800/30">
            <AlertCircle className="w-3.5 h-3.5" />
            Needs Images
          </span>
        );
    }
  };

  const renderPropertyGrid = (properties: Property[], emptyMessage: string) => {
    if (properties.length === 0) {
      return (
        <div className="py-20 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-neutral-900 border border-neutral-800 rounded-2xl flex items-center justify-center mb-4">
            <Video className="w-8 h-8 text-neutral-600" />
          </div>
          <h3 className="text-xl font-bold text-white mb-2">No Videos Yet</h3>
          <p className="text-neutral-500 mb-6 max-w-md">{emptyMessage}</p>
          <button
            onClick={() => setWizardOpen(true)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-white font-medium border border-neutral-700/50 transition-all"
          >
            <Plus className="w-4 h-4" />
            Create Presentation
          </button>
        </div>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {properties.map((property) => (
          <div
            key={property.id}
            className="group flex flex-col bg-neutral-900/50 border border-neutral-850 hover:border-neutral-800 rounded-xl overflow-hidden shadow-xl transition-all duration-300 hover:-translate-y-1"
          >
            {/* Image Container */}
            <div className="relative aspect-[16/10] overflow-hidden bg-neutral-950">
              <img
                src={property.coverImage}
                alt={property.address}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-neutral-950/80 via-neutral-950/0 to-neutral-950/30" />
              <div className="absolute top-4 left-4">
                {getStatusBadge(property.status)}
              </div>
              <div className="absolute bottom-4 right-4 text-2xl font-bold font-heading text-white drop-shadow-md">
                {property.price}
              </div>
            </div>

            {/* Details Container */}
            <div className="p-6 flex-1 flex flex-col justify-between">
              <div>
                <h3 className="text-lg font-bold text-white mb-1 group-hover:text-emerald-400 transition-colors">
                  {property.address}
                </h3>
                <p className="text-sm text-neutral-400 line-clamp-2 mb-4">
                  {property.description}
                </p>

                {/* Specifications */}
                <div className="flex gap-4 mb-6 text-sm text-neutral-300 border-t border-neutral-850 pt-4">
                  <div className="flex items-center gap-1.5">
                    <span className="text-neutral-400 font-semibold">{property.beds}</span> Beds
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-neutral-400 font-semibold">{property.baths}</span> Baths
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-neutral-400 font-semibold">{property.sqft}</span> Sq Ft
                  </div>
                </div>
              </div>

              {/* Actions */}
              <button
                onClick={() => onSelectProperty(property)}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold border border-neutral-850 hover:bg-neutral-850 hover:border-neutral-700 transition-all text-neutral-200"
              >
                <Video className="w-4 h-4 text-emerald-500" />
                Open Presentation
              </button>
            </div>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans flex flex-col">
      {/* Header */}
      <header className="border-b border-neutral-900 bg-neutral-950/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-650/10 rounded-xl border border-emerald-500/20">
              <Layers className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <span className="text-xl font-bold font-heading tracking-wide">
                CLOVER
              </span>
              <span className="text-xs block text-neutral-400 font-medium tracking-widest uppercase">
                Home Seller Video Engine
              </span>
            </div>
          </div>
          
          {/* Top Navigation Tabs */}
          <nav className="hidden md:flex items-center bg-neutral-900/50 border border-neutral-800 p-1 rounded-xl">
            {(['demo', 'examples', 'my-videos', 'pricing'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-1.5 text-sm font-semibold rounded-lg transition-all capitalize ${
                  activeTab === tab 
                    ? 'bg-neutral-800 text-white shadow-sm' 
                    : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/50'
                }`}
              >
                {tab.replace('-', ' ')}
              </button>
            ))}
          </nav>

          <div className="flex items-center gap-4">
            <button
              onClick={() => setWizardOpen(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-950/30 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Create Presentation</span>
            </button>
            
            {/* Profile Menu */}
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="w-10 h-10 rounded-full bg-neutral-800 border border-neutral-700 flex items-center justify-center hover:bg-neutral-700 transition-colors"
              >
                <User className="w-5 h-5 text-neutral-300" />
              </button>

              {isProfileOpen && (
                <div className="absolute right-0 mt-2 w-64 bg-neutral-900 border border-neutral-800 rounded-xl shadow-2xl overflow-hidden z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="p-4 border-b border-neutral-800">
                    <p className="text-sm font-medium text-white truncate">{userEmail}</p>
                    <p className="text-xs text-emerald-400 mt-1 capitalize font-semibold tracking-wider">
                      Tier: {subscriptionTier.replace('_', ' ')}
                    </p>
                  </div>
                  <div className="p-2">
                    <button
                      onClick={handleSignOut}
                      className="w-full flex items-center gap-2 px-3 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-400/10 rounded-lg transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-10">
        {/* DEMO TAB */}
        {activeTab === 'demo' && (
          <div className="space-y-12">
            <div className="relative overflow-hidden rounded-3xl border border-neutral-800 bg-gradient-to-br from-neutral-900 to-neutral-950 p-10 md:p-16">
              <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-emerald-500/10 blur-[120px] rounded-full pointer-events-none" />
              
              <div className="relative z-10 max-w-2xl">
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
                  <Sparkles className="w-3.5 h-3.5" />
                  Showcase Your Home Like a Pro
                </div>
                <h1 className="text-4xl md:text-6xl font-bold font-heading text-white tracking-tight mb-6 leading-tight">
                  Create a Stunning Video Tour of Your Home.
                </h1>
                <p className="text-neutral-400 text-lg leading-relaxed mb-10">
                  Clover makes it easy for homeowners to sell their homes faster. Instantly transform your listing photos into a cinematic, AI-narrated video tour that catches buyers' eyes on Zillow, Redfin, and MLS.
                </p>

                {/* IMAGES TO VIDEO GRAPHIC */}
                <div className="flex items-center gap-4 mb-10 p-4 bg-neutral-950/50 rounded-2xl border border-neutral-800/50 w-max max-w-full overflow-x-auto">
                  <div className="flex -space-x-4">
                    <div className="w-12 h-12 rounded-lg bg-neutral-800 border-2 border-neutral-900 flex items-center justify-center rotate-[-10deg] shadow-lg"><ImageIcon className="w-5 h-5 text-neutral-400"/></div>
                    <div className="w-12 h-12 rounded-lg bg-neutral-800 border-2 border-neutral-900 flex items-center justify-center -translate-y-2 shadow-lg z-10"><ImageIcon className="w-5 h-5 text-neutral-400"/></div>
                    <div className="w-12 h-12 rounded-lg bg-neutral-800 border-2 border-neutral-900 flex items-center justify-center rotate-[10deg] shadow-lg z-20"><ImageIcon className="w-5 h-5 text-neutral-400"/></div>
                  </div>
                  <div className="flex items-center justify-center px-4">
                    <div className="flex flex-col items-center">
                      <ArrowRight className="w-5 h-5 text-emerald-500 mb-1 animate-pulse" />
                      <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">AI Engine</span>
                    </div>
                  </div>
                  <div className="w-24 h-16 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-800 border-2 border-emerald-500/50 flex flex-col items-center justify-center shadow-lg shadow-emerald-900/40 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                    <Video className="w-6 h-6 text-white mb-1" />
                    <span className="text-[9px] font-bold text-white uppercase tracking-wider">Video Tour</span>
                  </div>
                </div>

                <div className="flex gap-4">
                  <button 
                    onClick={() => setActiveTab('examples')}
                    className="px-6 py-3 bg-white text-black hover:bg-neutral-200 font-bold rounded-xl transition-colors flex items-center gap-2"
                  >
                    <PlayCircle className="w-5 h-5" />
                    View Example Tours
                  </button>
                  <button 
                    onClick={() => setActiveTab('pricing')}
                    className="px-6 py-3 bg-neutral-800 text-white hover:bg-neutral-750 border border-neutral-700 font-bold rounded-xl transition-colors"
                  >
                    View Pricing
                  </button>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {[
                { icon: Video, title: 'Cinematic Ken Burns Tours', desc: 'Smooth, dynamic camera transitions that showcase every room and backyard feature beautifully.' },
                { icon: Sparkles, title: 'AI Narrated Tours', desc: 'Auto-generate professional scripts of your home features and voice them with photorealistic AI narration.' },
                { icon: Zap, title: 'Instant HD Downloads', desc: 'Export your 1080p video tour in seconds, ready to upload directly to Zillow, MLS, or social media.' },
              ].map((feature, i) => (
                <div key={i} className="p-8 rounded-2xl bg-neutral-900 border border-neutral-850">
                  <div className="w-12 h-12 bg-emerald-950/30 border border-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
                    <feature.icon className="w-6 h-6 text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                  <p className="text-neutral-400 leading-relaxed text-sm">{feature.desc}</p>
                </div>
              ))}
            </div>

            {/* Zillow Marketing Stats Section */}
            <div className="mt-16 bg-neutral-900 border border-neutral-850 rounded-3xl p-10 md:p-16 relative overflow-hidden">
              <div className="absolute left-0 bottom-0 w-[400px] h-[400px] bg-emerald-500/5 blur-[100px] rounded-full pointer-events-none" />
              <div className="relative z-10">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold font-heading text-white mb-4">Why Real Estate Video Works</h2>
                  <p className="text-neutral-400 max-w-2xl mx-auto">
                    Listings with video walkthroughs are prioritized by Zillow's algorithm, getting pushed to the top of search results and driving massive engagement.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
                  {/* Stats Text */}
                  <div className="space-y-8">
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-emerald-950/40 rounded-xl flex items-center justify-center shrink-0 border border-emerald-500/20">
                        <TrendingUp className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">400% More Inquiries</h3>
                        <p className="text-neutral-400 leading-relaxed text-sm">
                          According to industry data, real estate listings with video receive four times as many inquiries as those with just photos.
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex gap-4">
                      <div className="w-12 h-12 bg-emerald-950/40 rounded-xl flex items-center justify-center shrink-0 border border-emerald-500/20">
                        <Clock className="w-6 h-6 text-emerald-500" />
                      </div>
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">30% Faster Sales</h3>
                        <p className="text-neutral-400 leading-relaxed text-sm">
                          Homes with video tours spend significantly fewer days on the market, helping you close deals and move on faster.
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Visual Graphs */}
                  <div className="space-y-8 bg-neutral-950 p-8 rounded-2xl border border-neutral-850 shadow-2xl">
                    {/* Graph 1: Views */}
                    <div>
                      <div className="flex justify-between text-sm mb-3">
                        <span className="text-neutral-300 font-semibold uppercase tracking-wider text-xs">Listing Views (First 7 Days)</span>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs text-neutral-500 mb-1.5">
                            <span>Photos Only</span>
                            <span>~250 views</span>
                          </div>
                          <div className="w-full bg-neutral-900 rounded-full h-2.5 overflow-hidden">
                            <div className="bg-neutral-600 h-full rounded-full transition-all duration-1000" style={{ width: '25%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-bold text-emerald-400 mb-1.5">
                            <span>With Clover Video Tour</span>
                            <span>~1,000+ views</span>
                          </div>
                          <div className="w-full bg-neutral-900 rounded-full h-2.5 overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full rounded-full transition-all duration-1000" style={{ width: '100%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="w-full h-px bg-neutral-800"></div>

                    {/* Graph 2: Days on Market */}
                    <div>
                      <div className="flex justify-between text-sm mb-3">
                        <span className="text-neutral-300 font-semibold uppercase tracking-wider text-xs">Average Days on Market</span>
                      </div>
                      <div className="space-y-4">
                        <div>
                          <div className="flex justify-between text-xs text-neutral-500 mb-1.5">
                            <span>Photos Only</span>
                            <span>45 Days</span>
                          </div>
                          <div className="w-full bg-neutral-900 rounded-full h-2.5 overflow-hidden">
                            <div className="bg-neutral-600 h-full rounded-full transition-all duration-1000" style={{ width: '100%' }}></div>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-bold text-emerald-400 mb-1.5">
                            <span>With Clover Video Tour</span>
                            <span>31 Days</span>
                          </div>
                          <div className="w-full bg-neutral-900 rounded-full h-2.5 overflow-hidden">
                            <div className="bg-gradient-to-r from-emerald-600 to-teal-400 h-full rounded-full transition-all duration-1000" style={{ width: '70%' }}></div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* EXAMPLES TAB */}
        {activeTab === 'examples' && (
          <div>
            <div className="mb-8">
              <h2 className="text-3xl font-bold font-heading text-white mb-2">Example Tours</h2>
              <p className="text-neutral-400">Example home tours created by homeowners who sold fast.</p>
            </div>
            {renderPropertyGrid(mockProperties, "No examples found.")}
          </div>
        )}

        {/* MY VIDEOS TAB */}
        {activeTab === 'my-videos' && (
          <div>
            <div className="mb-8 flex justify-between items-end">
              <div>
                <h2 className="text-3xl font-bold font-heading text-white mb-2">My Videos</h2>
                <p className="text-neutral-400">Your personal workspace of generated presentations.</p>
              </div>
              <span className="text-sm font-semibold text-emerald-500 bg-emerald-950/30 px-3 py-1 rounded-lg border border-emerald-500/20">
                {userProperties.length} Tours
              </span>
            </div>
            {renderPropertyGrid(userProperties, "You haven't created any video tours yet. Click 'Create Presentation' to build your first cinematic home tour.")}
          </div>
        )}

        {/* PRICING TAB */}
        {activeTab === 'pricing' && (
          <div className="max-w-5xl mx-auto py-8">
            <div className="text-center mb-16">
              <h2 className="text-4xl font-bold font-heading text-white mb-4">Simple, Transparent Pricing</h2>
              <p className="text-neutral-400 max-w-xl mx-auto">Choose the package that fits your home listing needs. No hidden agency fees.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {[
                { name: 'One Time Pass', price: '$30', billing: 'one-time', desc: 'Perfect to try it out for a single listing.', features: ['1 HD Export included', 'Claude 3.5 & AI Voice Narration', 'Standard Email Support'] },
                { name: '5-Pack', price: '$75', billing: 'one-time', desc: 'Best for standard listings.', features: ['5 HD Exports included', 'Claude 3.5 & AI Voice Narration', 'Priority Support'], popular: true },
                { name: 'Unlimited', price: '$150', billing: '/mo', desc: 'For active agents and flippers.', features: ['Unlimited HD Exports per month', 'Claude 3.5 & AI Voice Narration', 'Priority Support'] }
              ].map((tier, i) => (
                <div key={i} className={`relative p-8 rounded-3xl bg-neutral-900 border ${tier.popular ? 'border-emerald-500' : 'border-neutral-800'} flex flex-col`}>
                  {tier.popular && (
                    <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-emerald-500 text-black px-4 py-1 text-xs font-bold uppercase tracking-wider rounded-full flex items-center gap-1.5">
                      <Star className="w-3.5 h-3.5" /> Most Popular
                    </div>
                  )}
                  <h3 className="text-xl font-bold text-white mb-2">{tier.name}</h3>
                  <p className="text-sm text-neutral-400 mb-6">{tier.desc}</p>
                  <div className="mb-8 flex items-baseline gap-1">
                    <span className="text-4xl font-black text-white">{tier.price}</span>
                    <span className="text-neutral-500 font-semibold text-xs uppercase tracking-wider">
                      {tier.billing === 'one-time' ? 'one-time' : '/mo'}
                    </span>
                  </div>
                  <ul className="space-y-4 mb-8 flex-1">
                    {tier.features.map((f, idx) => (
                      <li key={idx} className="flex items-start gap-3 text-sm text-neutral-300">
                        <Check className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button 
                    onClick={() => handleChooseTier(tier.name)}
                    className={`w-full py-3 rounded-xl font-bold transition-all ${tier.popular ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-neutral-800 hover:bg-neutral-700 text-white'}`}
                  >
                    Choose {tier.name}
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
