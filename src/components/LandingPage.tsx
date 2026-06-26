'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Play, Pause, ChevronRight, TrendingUp, Clock, DollarSign, Eye, Home, Mic, Music, Clover, Plus, PlayCircle, Video, Zap, Star, Check, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

// Slider removed by request


// ─── Animated Listing Performance Calculator ────────────────────────────────
const AnimatedCounter: React.FC<{ value: number; prefix?: string; suffix?: string; duration?: number }> = ({ value, prefix = '', suffix = '', duration = 1500 }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const [hasAnimated, setHasAnimated] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          const startTime = performance.now();
          const animate = (currentTime: number) => {
            const elapsed = currentTime - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
            setDisplayValue(Math.round(eased * value));
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        }
      },
      { threshold: 0.5 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, duration, hasAnimated]);

  return <span ref={ref}>{prefix}{displayValue.toLocaleString()}{suffix}</span>;
};

const PerformanceCalculator: React.FC = () => {
  const [listingPrice, setListingPrice] = useState(450000);
  
  const viewsBoost = Math.round(250 + (listingPrice / 1000000) * 40);
  const daysReduction = Math.round(45 - (Math.min(listingPrice, 5000000) / 5000000) * 20);
  const extraInquiries = Math.round(12 + (listingPrice / 1000000) * 15);
  const potentialValueAdd = Math.round(listingPrice * 0.012);

  return (
    <div>
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-950/30 border border-cyan-500/20 text-cyan-400 text-xs font-bold uppercase tracking-wider mb-4">
          <TrendingUp className="w-3.5 h-3.5" />
          ROI Calculator
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">What&apos;s Your Listing Worth?</h2>
        <p className="text-neutral-400 max-w-xl mx-auto">Enter your home&apos;s listing price to see the estimated impact of a Clovrr video tour.</p>
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6 md:p-8 space-y-8">
        {/* Price Input */}
        <div>
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-3">Your Listing Price</label>
          <div className="relative">
            <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-emerald-500" />
            <input
              type="text"
              value={listingPrice.toLocaleString()}
              onChange={(e) => {
                const num = parseInt(e.target.value.replace(/[^0-9]/g, ''), 10);
                if (!isNaN(num)) setListingPrice(num);
              }}
              className="w-full pl-12 pr-4 py-4 bg-neutral-950 border border-neutral-700 rounded-xl text-2xl font-bold text-white focus:outline-none focus:border-emerald-500 transition-colors"
            />
          </div>
          <input
            type="range"
            min="100000"
            max="5000000"
            step="50000"
            value={listingPrice}
            onChange={(e) => setListingPrice(parseInt(e.target.value))}
            className="w-full mt-4 h-2 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <div className="flex justify-between text-xs text-neutral-500 mt-1">
            <span>$100K</span>
            <span>$5M</span>
          </div>
        </div>

        {/* Results Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { label: 'Estimated Views Boost', value: viewsBoost, suffix: '%', icon: Eye, color: 'emerald', description: 'More eyes on your listing in the first 7 days' },
            { label: 'Days on Market', value: daysReduction, suffix: ' days', icon: Clock, color: 'cyan', description: `Reduced from avg 45 days` },
            { label: 'Extra Buyer Inquiries', value: extraInquiries, prefix: '+', suffix: '', icon: TrendingUp, color: 'violet', description: 'Additional interested buyers' },
            { label: 'Potential Value Add', value: potentialValueAdd, prefix: '$', suffix: '', icon: DollarSign, color: 'amber', description: 'From faster sale at asking price' },
          ].map((stat, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1, duration: 0.4 }}
              className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 group hover:border-neutral-700 transition-all"
            >
              <div className="flex items-center gap-3 mb-3">
                <div className={`w-10 h-10 rounded-lg bg-${stat.color}-950/40 border border-${stat.color}-500/20 flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 text-${stat.color}-500`} />
                </div>
                <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">{stat.label}</span>
              </div>
              <div className="text-3xl font-black text-white mb-1">
                <AnimatedCounter value={stat.value} prefix={stat.prefix} suffix={stat.suffix} />
              </div>
              <p className="text-xs text-neutral-500">{stat.description}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── Main Landing Page Component ────────────────────────────────────────────
export const LandingPage: React.FC = () => {
  const { setShowAuthModal, setWizardOpen, isAuthenticated } = useStore();

  const handleGetStarted = () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
    } else {
      setWizardOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans">
      {/* Minimal top bar */}
      <header className="border-b border-neutral-900 bg-neutral-950/90 backdrop-blur sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-650/10 rounded-xl border border-emerald-500/20">
              <Clover className="w-6 h-6 text-emerald-500" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-wide">CLOVRR</span>
              <span className="text-xs block text-neutral-400 font-medium tracking-widest uppercase">Home Seller Video Engine</span>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowAuthModal(true)}
              className="px-4 py-2 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-white text-sm font-medium transition-colors"
            >
              Log In
            </button>
            <button
              onClick={handleGetStarted}
              className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-medium shadow-lg shadow-emerald-950/30 transition-all hover:scale-[1.02]"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Get Started</span>
            </button>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute right-0 top-0 w-[600px] h-[600px] bg-emerald-500/8 blur-[150px] rounded-full pointer-events-none" />
        <div className="absolute left-0 bottom-0 w-[400px] h-[400px] bg-violet-500/5 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-7xl mx-auto px-6 py-20 md:py-28">
          <div className="max-w-3xl mx-auto text-center mb-16">
            <motion.div 
              initial={{ opacity: 0, y: 20 }} 
              animate={{ opacity: 1, y: 0 }} 
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-6">
                <Sparkles className="w-3.5 h-3.5" />
                AI-Powered Home Video Tours
              </div>
              <h1 className="text-5xl md:text-7xl font-bold tracking-tight mb-6 leading-[1.1]">
                Sell Your Home{' '}
                <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">Faster</span>
                {' '}with Cinematic Video.
              </h1>
              <p className="text-neutral-400 text-lg md:text-xl leading-relaxed mb-10 max-w-2xl mx-auto">
                Transform your listing photos into stunning, AI-narrated video tours that captivate buyers on Zillow, Redfin, and MLS — in under 60 seconds.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button
                  onClick={handleGetStarted}
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-xl shadow-emerald-900/40 transition-all hover:-translate-y-1"
                >
                  <Plus className="w-5 h-5" />
                  Create Free Tour
                </button>
                <a
                  href="#demo"
                  className="flex items-center justify-center gap-2 px-8 py-4 rounded-xl bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white font-bold transition-all hover:-translate-y-1"
                >
                  <PlayCircle className="w-5 h-5" />
                  Watch Demo
                </a>
              </div>
            </motion.div>
          </div>

          {/* Quick stats row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-2xl mx-auto mb-20">
            {[
              { stat: '4x', label: 'More inquiries' },
              { stat: '30%', label: 'Faster sales' },
              { stat: '60s', label: 'Tour creation' },
            ].map((item, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="text-3xl md:text-4xl font-black text-white mb-1">{item.stat}</div>
                <div className="text-xs text-neutral-500 font-semibold uppercase tracking-wider">{item.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Interactive Sections */}
      <div className="max-w-6xl mx-auto px-6 space-y-24 pb-24">
        {/* Section 3: Performance Calculator */}
        <section>
          <PerformanceCalculator />
        </section>

        {/* Feature cards */}
        <section>
          <div className="text-center mb-8">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">Everything You Need</h2>
            <p className="text-neutral-400 max-w-xl mx-auto">Professional video tours without the professional price tag.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Video, title: 'Cinematic Ken Burns Tours', desc: 'Smooth, dynamic camera transitions that showcase every room beautifully.' },
              { icon: Music, title: 'Royalty-Free Music', desc: 'Select from a curated list of background music tracks to set the perfect mood.' },
              { icon: Zap, title: 'Instant HD Downloads', desc: 'Export your 1080p video tour in seconds, ready for Zillow, MLS, or social media.' },
            ].map((feature, i) => (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, duration: 0.4 }}
                className="p-8 rounded-2xl bg-neutral-900 border border-neutral-800 hover:border-neutral-700 transition-all group"
              >
                <div className="w-12 h-12 bg-emerald-950/30 border border-emerald-500/20 rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                  <feature.icon className="w-6 h-6 text-emerald-500" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">{feature.title}</h3>
                <p className="text-neutral-400 leading-relaxed text-sm">{feature.desc}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section className="text-center bg-gradient-to-br from-neutral-900 to-neutral-950 border border-neutral-800 rounded-3xl p-12 md:p-16 relative overflow-hidden">
          <div className="absolute right-0 top-0 w-[400px] h-[400px] bg-emerald-500/8 blur-[120px] rounded-full pointer-events-none" />
          <div className="relative z-10">
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-4">Ready to Sell Faster?</h2>
            <p className="text-neutral-400 max-w-lg mx-auto mb-8">Create your first video tour in under a minute. No credit card required for free tier.</p>
            <button
              onClick={handleGetStarted}
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold shadow-xl shadow-emerald-900/40 transition-all hover:-translate-y-1"
            >
              <Plus className="w-5 h-5" />
              Create Your Free Tour
            </button>
          </div>
        </section>
      </div>
    </div>
  );
};
