'use client';
import React, { useState, useEffect } from 'react';
import { Bot, LineChart, Search, ChevronRight, Zap, Target, ShieldCheck, X, Briefcase, Building2, CheckCircle, AlertCircle, MapPin, UserCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Login } from './Login';
import { useStore } from '../store/useStore';
import { createClient } from '@/utils/supabase/client';

export const LandingPage: React.FC = () => {
  const router = useRouter();
  const { showAuthModal, setShowAuthModal, isAuthenticated, setAuthenticated, userId, setUserId } = useStore();
  const [isAuditModalOpen, setAuditModalOpen] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
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

  const handleAuditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const finalIndustry = auditForm.industry === 'other' ? auditForm.customIndustry : auditForm.industry;
    if (auditForm.businessName && finalIndustry && auditForm.zipcode) {
      // Save details to user_metadata if logged in
      if (isAuthenticated) {
        await supabase.auth.updateUser({
          data: {
            lastAudit: { businessName: auditForm.businessName, industry: auditForm.industry, zipcode: auditForm.zipcode, customIndustry: auditForm.customIndustry }
          }
        });
      }

      const query = new URLSearchParams({
        businessName: auditForm.businessName,
        industry: `${finalIndustry} in ${auditForm.zipcode}`
      }).toString();
      router.push(`/audit?${query}`);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 font-sans selection:bg-emerald-500/30">
      {/* ── Navigation ── */}
      <nav className="fixed top-0 w-full z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Clovrr Logo" width={32} height={32} className="w-8 h-8 rounded-lg" />
            <span className="text-xl font-bold text-white tracking-tight">Clovrr</span>
          </div>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
            <a href="#problem" className="hover:text-emerald-400 transition-colors">The Shift</a>
            <Link href="/pricing" className="hover:text-emerald-400 transition-colors">Pricing & Services</Link>
            
            {isAuthenticated ? (
              <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-neutral-900 border border-neutral-800 text-neutral-300">
                <UserCircle className="w-4 h-4 text-emerald-400" />
                <span className="truncate max-w-[150px]">{userEmail}</span>
                <button 
                  onClick={async () => await supabase.auth.signOut()}
                  className="ml-2 text-neutral-500 hover:text-white text-xs uppercase"
                >
                  Log out
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

            <Link href="/contact" className="px-6 py-2 rounded-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold transition-all text-sm">
              Get Free Audit
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
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-neutral-950/80 backdrop-blur-md"
          >
            <Login />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Hero Section ── */}
      <section className="relative pt-40 pb-20 px-6 overflow-hidden min-h-[90vh] flex items-center justify-center">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-emerald-600/30 via-transparent to-transparent blur-[120px] rounded-full pointer-events-none animate-slow-pan" />
        <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none" />
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-8 animate-float shadow-[0_0_15px_rgba(16,185,129,0.2)]"
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
            Get the <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-emerald-600 animate-slow-pan bg-[length:200%_auto]">Green Light</span> from AI.
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
      <section id="problem" className="py-24 px-6 relative">
        <div className="absolute top-0 w-full h-[1px] bg-gradient-to-r from-transparent via-neutral-800 to-transparent" />
        <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-16 items-center relative z-10">
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">The Search Landscape Has Shifted.</h2>
              <div className="w-20 h-1 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-full shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
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
          
          <div className="glass-panel-emerald rounded-3xl p-10 relative overflow-hidden group hover:-translate-y-2 transition-all duration-500">
            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/20 blur-[80px] rounded-full pointer-events-none group-hover:bg-emerald-500/30 transition-colors duration-500" />
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <Bot className="w-8 h-8 text-emerald-400 drop-shadow-[0_0_10px_rgba(16,185,129,0.8)]" />
              The GEO Solution
            </h3>
            <p className="text-neutral-300 text-lg leading-relaxed mb-8">
              Welcome to Generative Engine Optimization (GEO). At Clovrr, we don’t just optimize for algorithms; we optimize for answers.
            </p>
            <p className="text-neutral-400 leading-relaxed relative z-10">
              We restructure your digital footprint, authoritative mentions, and knowledge graphs so that when a customer asks ChatGPT or Google AI for the "best local expert," the AI confidently gives them the green light to choose you.
            </p>
          </div>
        </div>
      </section>

      {/* ── Services Section Moved to /pricing ── */}

      {/* ── CTA Section ── */}
      <section className="py-32 px-6 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neutral-950 to-emerald-950/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl h-[400px] bg-emerald-500/10 blur-[100px] rounded-full pointer-events-none animate-slow-pan" />
        
        <div className="max-w-3xl mx-auto text-center relative z-10 glass-panel rounded-[3rem] p-12 md:p-20 shadow-2xl animate-glow-pulse">
          <h2 className="text-3xl md:text-5xl font-extrabold text-white mb-6 tracking-tight">
            Ready to claim your spot?
          </h2>
          <p className="text-neutral-400 text-xl mb-10 max-w-2xl mx-auto">
            Stop losing high-ticket jobs to competitors who optimized for AI search. Let's build your GEO foundation today.
          </p>
          <Link href="/contact" className="inline-flex items-center justify-center gap-3 px-10 py-5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-lg transition-all shadow-[0_0_30px_rgba(16,185,129,0.4)] hover:shadow-[0_0_50px_rgba(16,185,129,0.6)] hover:-translate-y-1 mx-auto">
            Get Your Free AI Audit
            <ChevronRight className="w-5 h-5" />
          </Link>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="flex items-center gap-2">
            <Image src="/logo.png" alt="Clovrr Logo" width={24} height={24} className="w-6 h-6 rounded-md" />
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

              {/* Simplified Modal logic: Only the form */}
              <div>
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center justify-center mb-6">
                  <Search className="w-6 h-6 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Free AI Search Audit</h2>
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
                    <label className="text-sm font-semibold text-neutral-300 ml-1">Industry</label>
                    <div className="relative">
                      <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                      <select 
                        required
                        value={auditForm.industry}
                        onChange={e => setAuditForm({...auditForm, industry: e.target.value})}
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl py-3 pl-12 pr-4 text-white appearance-none outline-none transition-all"
                      >
                        <option value="Restaurant / Cafe">Restaurant / Cafe</option>
                        <option value="Retail Store">Retail Store</option>
                        <option value="Dental Clinic">Dental Clinic</option>
                        <option value="Medical Clinic">Medical Clinic</option>
                        <option value="Law Firm">Law Firm</option>
                        <option value="Accounting / Finance">Accounting / Finance</option>
                        <option value="HVAC">HVAC</option>
                        <option value="Roofing">Roofing</option>
                        <option value="Plumbing">Plumbing</option>
                        <option value="Electrician">Electrician</option>
                        <option value="Landscaping">Landscaping</option>
                        <option value="Cleaning Services">Cleaning Services</option>
                        <option value="Real Estate">Real Estate</option>
                        <option value="Auto Repair / Dealership">Auto Repair / Dealership</option>
                        <option value="Gym / Fitness">Gym / Fitness</option>
                        <option value="Salon / Spa">Salon / Spa</option>
                        <option value="Pet Services">Pet Services</option>
                        <option value="other">Custom / Other</option>
                      </select>
                    </div>
                  </div>

                  {auditForm.industry === 'other' && (
                    <div className="space-y-2">
                      <label className="text-sm font-semibold text-neutral-300 ml-1">Custom Industry</label>
                      <div className="relative">
                        <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                        <input 
                          required
                          type="text" 
                          value={auditForm.customIndustry}
                          onChange={e => setAuditForm({...auditForm, customIndustry: e.target.value})}
                          placeholder="e.g. Landscaping"
                          className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-neutral-600 outline-none transition-all"
                        />
                      </div>
                    </div>
                  )}

                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-300 ml-1">Zip Code</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                      <input 
                        required
                        type="text" 
                        value={auditForm.zipcode}
                        onChange={e => setAuditForm({...auditForm, zipcode: e.target.value})}
                        placeholder="e.g. 90210"
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
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
