'use client';
import React, { useState, useEffect } from 'react';
import { Bot, LineChart, Search, ChevronRight, Zap, Target, ShieldCheck, X, Briefcase, Building2, CheckCircle, AlertCircle, MapPin, UserCircle, Globe, Smartphone, Lock } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Login } from './Login';
import ParticleNetwork from './ParticleNetwork';
import { useStore } from '../store/useStore';
import { createClient } from '@/utils/supabase/client';

export const LandingPage: React.FC = () => {
  const router = useRouter();
  const { showAuthModal, setShowAuthModal, isAuthenticated, setAuthenticated, userId, setUserId, userEmail, setUserEmail } = useStore();
  const [isAuditModalOpen, setAuditModalOpen] = useState(false);
  const [auditForm, setAuditForm] = useState({ businessName: '', industry: 'Roofing', zipcode: '', customIndustry: '' });
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setAuthenticated(true);
        setUserId(user.id);
        setUserEmail(user.email ?? null);
        if (user.user_metadata?.lastAudit) {
          setAuditForm({ ...auditForm, ...user.user_metadata.lastAudit });
        }
      } else {
        setAuthenticated(false);
      }
    };
    
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        setAuthenticated(true);
        setUserId(session.user.id);
        setUserEmail(session.user.email ?? null);
      } else {
        setAuthenticated(false);
        setUserId(null);
        setUserEmail(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  return (
    <div className="min-h-screen bg-black font-sans text-[#f5f5f5] selection:bg-white/20">
      {/* ── Minimalist Apple-Style Navigation ── */}
      <nav className="fixed top-0 w-full z-50 nav-blur transition-all duration-300">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <div className="flex items-center gap-3 opacity-90 hover:opacity-100 transition-opacity cursor-pointer" onClick={() => window.scrollTo(0, 0)}>
            <Image src="/logo.png" alt="Clovrr Logo" width={24} height={24} className="rounded-md" />
            <span className="text-sm font-semibold tracking-wide">Clovrr</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#a1a1a6]">
            <a href="#problem" className="hover:text-white transition-colors">The Shift</a>
            <Link href="/pricing" className="hover:text-white transition-colors">Pricing</Link>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-2 text-white">
                <span className="truncate max-w-[150px] opacity-70">{userEmail}</span>
                <button 
                  onClick={async () => await supabase.auth.signOut()}
                  className="ml-2 text-[#a1a1a6] hover:text-white transition-colors"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <button 
                onClick={() => setShowAuthModal(true)}
                className="hover:text-white transition-colors"
              >
                Sign In
              </button>
            )}

            <Link href="/contact" className="px-4 py-1.5 rounded-full bg-emerald-500 text-black font-semibold hover:bg-emerald-400 hover:scale-105 transition-all">
              Book Audit
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Auth Modal ── */}
      <AnimatePresence>
        {showAuthModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-2xl"
          >
            <Login />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero Section (Pro Aesthetic) ── */}
      <section className="relative h-screen min-h-[800px] w-full overflow-hidden flex items-center justify-center">
        {/* Subtle background particles to keep the AI feel without overwhelming */}
        <div className="absolute inset-0 opacity-30">
          <ParticleNetwork />
        </div>
        
        <div className="max-w-5xl mx-auto text-center relative z-10 px-6 mt-16">
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
          >
            <h1 className="text-6xl md:text-8xl lg:text-[110px] font-semibold tracking-tighter mb-6 leading-[1.05] text-white">
              Pro. <br className="md:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-200">Engineered.</span>
            </h1>
            
            <p className="text-xl md:text-2xl text-[#a1a1a6] max-w-2xl mx-auto mb-12 font-medium tracking-tight">
              Dominate the AI Search revolution. We optimize your brand so ChatGPT, Perplexity, and Google AI Overviews recommend you first.
            </p>
            
            <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
              <Link href="/free-audit" className="px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-lg hover:scale-105 transition-all flex items-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.3)]">
                Start AI Audit
                <ChevronRight className="w-4 h-4" />
              </Link>
              <Link href="/pricing" className="px-8 py-4 rounded-full bg-[#1d1d1f] hover:bg-[#2d2d2f] text-white font-semibold text-lg transition-colors">
                View Pricing
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ── Problem/Solution Bento Box Section ── */}
      <section id="problem" className="py-32 px-6 bg-black relative">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-4xl md:text-6xl font-semibold tracking-tight text-white mb-6">The rules have changed.</h2>
            <p className="text-xl text-[#a1a1a6] max-w-3xl mx-auto">
              Your customers are no longer scrolling through 10 blue links. They are asking AI engines directly for recommendations.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Bento Box 1: The Old Way */}
            <div className="bento-box p-10 flex flex-col justify-between md:col-span-2 lg:col-span-1 min-h-[300px]">
              <div>
                <Search className="w-10 h-10 text-[#a1a1a6] mb-6" />
                <h3 className="text-2xl font-semibold text-white mb-4">Traditional SEO is dying.</h3>
                <p className="text-[#a1a1a6] leading-relaxed">
                  Stuffing keywords and buying backlinks used to work. Now, AI engines skip the middleman and summarize answers directly.
                </p>
              </div>
            </div>

            {/* Bento Box 2: The New Reality (Highlight) */}
            <div className="bento-box-highlight p-10 flex flex-col justify-between md:col-span-2 min-h-[300px]">
              <div>
                <Bot className="w-10 h-10 text-white mb-6" />
                <h3 className="text-3xl md:text-4xl font-semibold text-white mb-4 tracking-tight">The AI Reality</h3>
                <p className="text-[#a1a1a6] text-lg leading-relaxed max-w-lg">
                  If your business isn't actively shaping the raw data that trains models like ChatGPT and Gemini, you are completely invisible to the next generation of high-intent buyers.
                </p>
              </div>
              <div className="mt-8 flex gap-3">
                <div className="px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-md border border-white/10">ChatGPT</div>
                <div className="px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-md border border-white/10">Perplexity</div>
                <div className="px-4 py-2 rounded-full bg-white/10 text-white text-sm font-medium backdrop-blur-md border border-white/10">Google AI</div>
              </div>
            </div>

            {/* Bento Box 3: Solution Step 1 */}
            <div className="bento-box p-10">
              <div className="w-12 h-12 bg-white rounded-2xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-black" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">1. AI Audit</h4>
              <p className="text-[#a1a1a6] text-sm leading-relaxed">
                We simulate queries across all major LLMs to see if they recommend your business, or worse, hallucinate wrong information.
              </p>
            </div>

            {/* Bento Box 4: Solution Step 2 */}
            <div className="bento-box p-10">
              <div className="w-12 h-12 bg-[#2d2d2f] rounded-2xl flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">2. Knowledge Graphing</h4>
              <p className="text-[#a1a1a6] text-sm leading-relaxed">
                We inject complex Schema Markup and Semantic structured data directly into your site, giving AI engines the raw facts they crave.
              </p>
            </div>

            {/* Bento Box 5: Solution Step 3 */}
            <div className="bento-box p-10">
              <div className="w-12 h-12 bg-[#2d2d2f] rounded-2xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-xl font-semibold text-white mb-3">3. Authority Locking</h4>
              <p className="text-[#a1a1a6] text-sm leading-relaxed">
                We monitor your sentiment continuously, defending your top-spot recommendation against competitors and volatile algorithmic updates.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── Invisible to AI Section (Bento Approach) ── */}
      <section className="py-32 px-6 border-t border-[#222]">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-5xl md:text-7xl font-semibold tracking-tighter text-white mb-8">
            Are you invisible?
          </h2>
          <p className="text-xl text-[#a1a1a6] mb-12 max-w-2xl mx-auto">
            Find out exactly what ChatGPT thinks about your business right now. It takes 60 seconds and it's completely free.
          </p>
          <Link href="/free-audit" className="inline-flex items-center justify-center px-10 py-5 rounded-full bg-white text-black font-semibold text-xl hover:scale-105 transition-transform shadow-[0_0_40px_rgba(255,255,255,0.15)]">
            Generate Free Audit
          </Link>
        </div>
      </section>


    </div>
  );
};
