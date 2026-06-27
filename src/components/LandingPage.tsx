'use client';
import React, { useState } from 'react';
import { Bot, LineChart, Search, ChevronRight, Zap, Target, ShieldCheck, X, Briefcase, Building2, CheckCircle, AlertCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Link from 'next/link';

export const LandingPage: React.FC = () => {
  const [isAuditModalOpen, setAuditModalOpen] = useState(false);
  const [auditForm, setAuditForm] = useState({ businessName: '', industry: '' });
  const [auditStatus, setAuditStatus] = useState<'idle' | 'loading' | 'complete'>('idle');
  const [auditResult, setAuditResult] = useState<{ score: number; verdict: string } | null>(null);

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuditStatus('loading');
    
    try {
      const res = await fetch('/api/audit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(auditForm)
      });
      const data = await res.json();
      setAuditResult(data);
      setAuditStatus('complete');
    } catch (err) {
      console.error(err);
      setAuditResult({ score: 12, verdict: "Error connecting to AI. But we can assume your score is low. Let's fix it." });
      setAuditStatus('complete');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 font-sans selection:bg-emerald-500/30">
      {/* ── Navigation ── */}
      <nav className="fixed top-0 w-full z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-neutral-950" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Clovrr</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
            <a href="#problem" className="hover:text-emerald-400 transition-colors">The Shift</a>
            <a href="#services" className="hover:text-emerald-400 transition-colors">Our Services</a>
            <Link href="/contact" className="px-5 py-2.5 rounded-full bg-white text-neutral-950 hover:bg-neutral-200 transition-colors font-semibold">
              Book Audit
            </Link>
          </div>
        </div>
      </nav>

      {/* ── Hero Section ── */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-emerald-600/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-8"
          >
            <Zap className="w-3.5 h-3.5 fill-emerald-400" />
            Generative Engine Optimization (GEO)
          </motion.div>
          
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-5xl md:text-7xl font-extrabold text-white tracking-tight mb-8 leading-tight"
          >
            Get the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400">Green Light</span> from AI.
          </motion.h1>
          
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="text-lg md:text-xl text-neutral-400 max-w-2xl mx-auto mb-10 leading-relaxed"
          >
            Traditional SEO is dead. We engineer your digital presence so Google AI Overviews, ChatGPT, and Perplexity recommend your business first. Future-proof your revenue with GEO.
          </motion.p>
          
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <button onClick={() => setAuditModalOpen(true)} className="w-full sm:w-auto px-8 py-4 rounded-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-lg transition-all flex items-center justify-center gap-2">
              See What AI Thinks of You
              <ChevronRight className="w-5 h-5" />
            </button>
            <a href="#problem" className="w-full sm:w-auto px-8 py-4 rounded-full bg-neutral-900 border border-neutral-800 hover:bg-neutral-800 text-white font-bold text-lg transition-all flex items-center justify-center">
              Learn About GEO
            </a>
          </motion.div>
        </div>
      </section>

      {/* ── Problem/Solution Section ── */}
      <section id="problem" className="py-24 px-6 bg-neutral-950">
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">The Search Landscape Has Shifted.</h2>
              <div className="w-20 h-1 bg-emerald-500 rounded-full" />
            </div>
            <div className="space-y-6 text-neutral-400 text-lg leading-relaxed">
              <p>
                For the last decade, local businesses fought for the top spot on Google using traditional SEO—stuffing keywords and building backlinks. But the game has fundamentally changed.
              </p>
              <p>
                Your customers are no longer scrolling through 10 blue links; they are asking AI engines directly for recommendations. If your business isn't actively shaping the data that trains these models, you are completely invisible to the next generation of high-intent buyers.
              </p>
            </div>
          </div>
          
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-10 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 blur-[80px] rounded-full pointer-events-none" />
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Bot className="w-8 h-8 text-emerald-400" />
              The GEO Solution
            </h3>
            <p className="text-neutral-300 text-lg leading-relaxed mb-8">
              Welcome to Generative Engine Optimization (GEO). At Clovrr, we don’t just optimize for algorithms; we optimize for answers.
            </p>
            <p className="text-neutral-400 leading-relaxed">
              We restructure your digital footprint, authoritative mentions, and knowledge graphs so that when a customer asks ChatGPT or Google AI for the "best local expert," the AI confidently gives them the green light to choose you.
            </p>
          </div>
        </div>
      </section>

      {/* ── Services Section ── */}
      <section id="services" className="py-24 px-6 border-t border-neutral-900 bg-neutral-950/50">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">How We Build AI Authority</h2>
            <p className="text-neutral-400 text-lg">Our structured 3-tier approach to making your business the undeniable recommendation across all AI search engines.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Tier 1 */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 hover:border-emerald-500/50 transition-colors">
              <div className="w-12 h-12 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-center mb-6">
                <Search className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">1. The AI Readiness Audit</h3>
              <p className="text-neutral-400 leading-relaxed text-sm">
                Are you invisible to the algorithms of tomorrow? We run a comprehensive diagnostic on your brand across ChatGPT, Perplexity, Claude, and Google AI Overviews. We’ll uncover exactly what AI currently thinks of your business, identify critical data gaps, and provide a strategic roadmap to dominate AI-generated recommendations.
              </p>
            </div>

            {/* Tier 2 */}
            <div className="bg-neutral-900 border border-emerald-500/30 rounded-3xl p-8 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-[40px] rounded-full pointer-events-none" />
              <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
                <Target className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">2. The GEO Foundation</h3>
              <p className="text-neutral-400 leading-relaxed text-sm">
                We build the data infrastructure that AI engines trust. This tier completely overhauls your digital presence—from injecting advanced Schema markup and restructuring your site's Q&A architecture, to seeding authoritative answers across the web. We feed the AI the exact structured data it needs to position you as the market leader.
              </p>
            </div>

            {/* Tier 3 */}
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 hover:border-emerald-500/50 transition-colors">
              <div className="w-12 h-12 bg-neutral-950 border border-neutral-800 rounded-xl flex items-center justify-center mb-6">
                <ShieldCheck className="w-6 h-6 text-emerald-400" />
              </div>
              <h3 className="text-xl font-bold text-white mb-3">3. Algorithmic Authority</h3>
              <p className="text-neutral-400 leading-relaxed text-sm">
                AI models learn continuously. We ensure they keep learning good things about you. This ongoing partnership monitors AI search volatility, curates high-authority citations, and actively manages the sentiment of your digital footprint. We don't just secure your spot as the AI's top recommendation—we defend it.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── CTA Section ── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-emerald-950/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        <div className="max-w-3xl mx-auto text-center relative z-10 bg-neutral-900/80 backdrop-blur-xl border border-neutral-800 rounded-[3rem] p-12 md:p-20 shadow-2xl">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
            What is AI telling your customers right now?
          </h2>
          <p className="text-neutral-300 text-lg md:text-xl mb-10 max-w-2xl mx-auto">
            Don't let your competitors control the narrative. Book a live, 1-on-1 demonstration to see exactly how ChatGPT, Perplexity, and Google AI view your business today—and how we can change it tomorrow.
          </p>
          <Link 
            href="/contact"
            className="inline-flex items-center gap-3 px-10 py-5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-lg transition-all shadow-xl shadow-emerald-900/50 hover:scale-105 hover:-translate-y-1"
          >
            Book Your Live AI Audit
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Bot className="w-5 h-5 text-emerald-500" />
            <span className="text-xl font-bold text-white tracking-tight">Clovrr</span>
          </div>
          <p className="text-neutral-500 text-sm">
            © {new Date().getFullYear()} Clovrr Agency. All rights reserved.
          </p>
        </div>
      </footer>

      {/* ── AI Audit Modal ── */}
      <AnimatePresence>
        {isAuditModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }} 
              onClick={() => setAuditModalOpen(false)}
              className="absolute inset-0 bg-neutral-950/80 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-lg bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl overflow-hidden"
            >
              <button 
                onClick={() => setAuditModalOpen(false)}
                className="absolute top-6 right-6 p-2 rounded-full bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {auditStatus === 'idle' && (
                <div>
                  <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
                    <Search className="w-6 h-6 text-emerald-400" />
                  </div>
                  <h2 className="text-2xl font-bold text-white mb-2">Live AI Search Audit</h2>
                  <p className="text-neutral-400 mb-8">Enter your business details below. We'll query Google's Gemini AI to see if you are recommended in your local market.</p>
                  
                  <form onSubmit={handleAuditSubmit} className="space-y-5">
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-neutral-300 ml-1">Business Name</label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                        <input 
                          required
                          type="text" 
                          value={auditForm.businessName}
                          onChange={e => setAuditForm({...auditForm, businessName: e.target.value})}
                          placeholder="e.g. Acme Roofing Co."
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-neutral-600 outline-none transition-all"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-neutral-300 ml-1">Industry & Location</label>
                      <div className="relative">
                        <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                        <input 
                          required
                          type="text" 
                          value={auditForm.industry}
                          onChange={e => setAuditForm({...auditForm, industry: e.target.value})}
                          placeholder="e.g. Roofing in Austin, TX"
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-neutral-600 outline-none transition-all"
                        />
                      </div>
                    </div>
                    
                    <button type="submit" className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-lg transition-all mt-4">
                      Run AI Scan
                      <ChevronRight className="w-5 h-5" />
                    </button>
                  </form>
                </div>
              )}

              {auditStatus === 'loading' && (
                <div className="py-12 text-center flex flex-col items-center">
                  <div className="w-16 h-16 relative mb-6">
                    <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full" />
                    <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
                    <Bot className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-6 h-6 text-emerald-400 animate-pulse" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Querying Gemini AI...</h3>
                  <p className="text-neutral-400">Analyzing search patterns for "{auditForm.industry}"</p>
                </div>
              )}

              {auditStatus === 'complete' && auditResult && (
                <div className="text-center pt-4">
                  <div className="inline-block relative mb-6">
                    <svg className="w-32 h-32 transform -rotate-90">
                      <circle cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" className="text-neutral-800" />
                      <circle 
                        cx="64" cy="64" r="56" stroke="currentColor" strokeWidth="12" fill="transparent" 
                        strokeDasharray={351.8} 
                        strokeDashoffset={351.8 - (351.8 * auditResult.score) / 100}
                        className={auditResult.score > 70 ? 'text-emerald-500' : auditResult.score > 40 ? 'text-amber-500' : 'text-rose-500'} 
                        style={{ transition: 'stroke-dashoffset 1s ease-out' }}
                      />
                    </svg>
                    <div className="absolute inset-0 flex items-center justify-center flex-col">
                      <span className="text-3xl font-bold text-white">{auditResult.score}</span>
                      <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Score</span>
                    </div>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-3">AI Readiness Verdict</h3>
                  <div className={`p-4 rounded-xl border mb-8 text-sm leading-relaxed ${
                    auditResult.score > 70 ? 'bg-emerald-950/30 border-emerald-500/30 text-emerald-200' : 
                    auditResult.score > 40 ? 'bg-amber-950/30 border-amber-500/30 text-amber-200' : 
                    'bg-rose-950/30 border-rose-500/30 text-rose-200'
                  }`}>
                    {auditResult.verdict}
                  </div>
                  
                  <Link 
                    href="/contact"
                    className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-white hover:bg-neutral-200 text-neutral-950 font-bold transition-all"
                  >
                    Fix My AI Score
                    <ChevronRight className="w-5 h-5" />
                  </Link>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
