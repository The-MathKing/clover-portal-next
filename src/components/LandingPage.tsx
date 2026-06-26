'use client';
import React, { useState, useRef, useEffect } from 'react';
import { Sparkles, Play, Pause, ChevronRight, TrendingUp, Clock, DollarSign, Eye, Home, Mic, Music, Clover, Plus, PlayCircle, Video, Zap, Star, Check, User, LogOut } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

// ─── Before/After Comparison Slider ─────────────────────────────────────────
const BeforeAfterVisualizer: React.FC = () => {
  const [sliderPos, setSliderPos] = useState(50);
  const containerRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef(false);
  const [kenBurnsOffset, setKenBurnsOffset] = useState(0);

  useEffect(() => {
    let frame: number;
    const animate = () => {
      setKenBurnsOffset(prev => (prev + 0.15) % 360);
      frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, []);

  const handleMove = (clientX: number) => {
    if (!containerRef.current || !isDragging.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
    setSliderPos((x / rect.width) * 100);
  };

  return (
    <div className="relative">
      <div className="text-center mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/30 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Eye className="w-3.5 h-3.5" />
          Interactive Demo
        </div>
        <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">See the Difference</h2>
        <p className="text-neutral-400 max-w-xl mx-auto">Drag the slider to compare a static listing photo vs. a dynamic Clover cinematic video tour.</p>
      </div>

      <div 
        ref={containerRef}
        className="relative w-full aspect-video rounded-2xl overflow-hidden cursor-col-resize border border-neutral-800 shadow-2xl shadow-black/50"
        onMouseDown={() => isDragging.current = true}
        onMouseUp={() => isDragging.current = false}
        onMouseLeave={() => isDragging.current = false}
        onMouseMove={(e) => handleMove(e.clientX)}
        onTouchStart={() => isDragging.current = true}
        onTouchEnd={() => isDragging.current = false}
        onTouchMove={(e) => handleMove(e.touches[0].clientX)}
      >
        {/* "After" - Dynamic Video Side (full behind) */}
        <div className="absolute inset-0 overflow-hidden">
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
            alt="Dynamic video tour"
            className="w-full h-full object-cover transition-transform duration-[3000ms] ease-linear"
            style={{
              transform: `scale(1.15) translateX(${Math.sin(kenBurnsOffset * 0.017) * 2}%) translateY(${Math.cos(kenBurnsOffset * 0.013) * 1.5}%)`,
            }}
          />
          {/* Cinematic overlay effects */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/20" />
          <div className="absolute bottom-6 left-6 right-6">
            <div className="flex items-center gap-2 mb-2">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[10px] font-bold text-emerald-400 uppercase tracking-widest">AI Generated Video Tour</span>
            </div>
            <p className="text-white font-bold text-lg">124 Bellevue Ave, Newport RI</p>
            <p className="text-emerald-400 text-xs font-semibold uppercase tracking-wider">Exclusive Tour • $2,450,000 • 5 Beds • 4.5 Baths</p>
          </div>
          {/* Animated waveform bars */}
          <div className="absolute top-6 right-6 flex items-end gap-0.5 h-5">
            {[...Array(12)].map((_, i) => (
              <div
                key={i}
                className="w-1 bg-emerald-400/70 rounded-full"
                style={{
                  height: `${30 + Math.sin((kenBurnsOffset * 0.05) + i * 0.8) * 70}%`,
                  transition: 'height 150ms ease',
                }}
              />
            ))}
          </div>
          <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-emerald-500/30">
            <span className="text-xs font-bold text-white">🎬 WITH CLOVER</span>
          </div>
        </div>

        {/* "Before" - Static Photo Side (clipped) */}
        <div 
          className="absolute inset-0 overflow-hidden"
          style={{ clipPath: `inset(0 ${100 - sliderPos}% 0 0)` }}
        >
          <img
            src="https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?auto=format&fit=crop&w=1200&q=80"
            alt="Static photo listing"
            className="w-full h-full object-cover grayscale brightness-75"
          />
          <div className="absolute inset-0 bg-neutral-900/30" />
          <div className="absolute top-6 left-6 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-1.5 border border-neutral-600/30">
            <span className="text-xs font-bold text-neutral-300">📷 PHOTOS ONLY</span>
          </div>
        </div>

        {/* Slider Handle */}
        <div 
          className="absolute top-0 bottom-0 z-10"
          style={{ left: `${sliderPos}%` }}
        >
          <div className="absolute inset-y-0 -translate-x-1/2 w-1 bg-white/90 shadow-lg shadow-white/30" />
          <div className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2 w-10 h-10 bg-white rounded-full shadow-xl shadow-black/50 flex items-center justify-center border-2 border-white">
            <div className="flex items-center gap-0.5 text-neutral-800">
              <ChevronRight className="w-3 h-3 rotate-180" />
              <ChevronRight className="w-3 h-3" />
            </div>
          </div>
        </div>
        
        {/* Interactive invisible slider */}
        <input
          type="range"
          min="0"
          max="100"
          value={sliderPos}
          onChange={(e) => setSliderPos(Number(e.target.value))}
          className="absolute inset-0 z-20 w-full h-full opacity-0 cursor-ew-resize m-0 p-0"
        />
      </div>
    </div>
  );
};


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
        <p className="text-neutral-400 max-w-xl mx-auto">Enter your home&apos;s listing price to see the estimated impact of a Clover video tour.</p>
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
              <span className="text-xl font-bold tracking-wide">CLOVER</span>
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
        {/* Section 1: Before/After Visualizer */}
        <section id="demo">
          <BeforeAfterVisualizer />
        </section>



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
