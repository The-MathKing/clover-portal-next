'use client';
import React, { useState, useEffect } from 'react';
import { Bot, ChevronRight, CheckCircle, Mail, User, Briefcase, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { createClient } from '@/utils/supabase/client';

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  const [formData, setFormData] = useState({ name: '', email: '', business: '', message: '' });
  const supabase = createClient();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (user) {
        setFormData(prev => ({
          ...prev,
          email: user.email || '',
          business: user.user_metadata?.lastAudit?.businessName || prev.business
        }));
      }
    };
    checkUser();
  }, [supabase]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    setErrorMsg('');
    
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        setStatus('success');
      } else {
        const errorData = await res.json().catch(() => null);
        console.error('Failed to submit:', errorData);
        setErrorMsg('Failed to send request. Please try emailing us directly at hello@clovrr.net.');
        setStatus('idle');
      }
    } catch (err) {
      console.error(err);
      setErrorMsg('A network error occurred. Please try emailing us directly at hello@clovrr.net.');
      setStatus('idle');
    }
  };

  return (
    <div className="min-h-screen bg-neutral-950 font-sans selection:bg-emerald-500/30 flex flex-col">
      {/* ── Navigation ── */}
      <nav className="fixed top-0 w-full z-50 bg-neutral-950/80 backdrop-blur-md border-b border-neutral-900">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500 flex items-center justify-center">
              <Bot className="w-5 h-5 text-neutral-950" />
            </div>
            <span className="text-xl font-bold text-white tracking-tight">Clovrr</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-neutral-400">
            <Link href="/" className="hover:text-emerald-400 transition-colors">Back to Home</Link>
          </div>
        </div>
      </nav>

      {/* ── Main Content ── */}
      <main className="flex-1 flex items-center justify-center p-6 pt-32 pb-20 relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-emerald-600/10 blur-[120px] rounded-full pointer-events-none" />

        <div className="w-full max-w-xl relative z-10">
          <div className="text-center mb-10">
            <h1 className="text-4xl md:text-5xl font-extrabold text-white tracking-tight mb-4">
              Book Your AI Audit
            </h1>
            <p className="text-neutral-400 text-lg">
              Find out exactly what Google AI and ChatGPT think of your business, and how we can dominate the recommendations.
            </p>
          </div>

          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 md:p-10 shadow-2xl">
            {status === 'success' ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="text-center py-10"
              >
                <div className="w-20 h-20 bg-emerald-950 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-6">
                  <CheckCircle className="w-10 h-10 text-emerald-400" />
                </div>
                <h2 className="text-2xl font-bold text-white mb-2">Request Received!</h2>
                <p className="text-neutral-400 mb-8">
                  We'll analyze your current AI search footprint and reach out within 24 hours to schedule your live audit.
                </p>
                <Link 
                  href="/"
                  className="inline-flex items-center justify-center px-8 py-3 rounded-full bg-neutral-800 hover:bg-neutral-700 text-white font-medium transition-colors"
                >
                  Return Home
                </Link>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-6">
                {errorMsg && (
                  <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                    {errorMsg}
                  </div>
                )}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-300 ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                      <input 
                        required
                        type="text" 
                        value={formData.name}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        placeholder="John Doe"
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-neutral-600 outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-300 ml-1">Email Address</label>
                    <div className="relative">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                      <input 
                        required
                        type="email" 
                        value={formData.email}
                        onChange={e => setFormData({ ...formData, email: e.target.value })}
                        placeholder="john@example.com"
                        className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-neutral-600 outline-none transition-all"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-300 ml-1">Business Name</label>
                  <div className="relative">
                    <Briefcase className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                    <input 
                      required
                      type="text" 
                      value={formData.business}
                      onChange={e => setFormData({ ...formData, business: e.target.value })}
                      placeholder="Acme Roofing Co."
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-neutral-600 outline-none transition-all"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-semibold text-neutral-300 ml-1">How can we help?</label>
                  <div className="relative">
                    <MessageSquare className="absolute left-4 top-4 w-5 h-5 text-neutral-500" />
                    <textarea 
                      required
                      rows={4}
                      value={formData.message}
                      onChange={e => setFormData({ ...formData, message: e.target.value })}
                      placeholder="Tell us a bit about your current marketing challenges..."
                      className="w-full bg-neutral-950 border border-neutral-800 focus:border-emerald-500 rounded-xl py-3 pl-12 pr-4 text-white placeholder:text-neutral-600 outline-none transition-all resize-none"
                    />
                  </div>
                </div>

                <button 
                  disabled={status === 'submitting'}
                  type="submit"
                  className="w-full flex items-center justify-center gap-2 py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed mt-2"
                >
                  {status === 'submitting' ? (
                    <div className="w-5 h-5 border-2 border-neutral-950/30 border-t-neutral-950 rounded-full animate-spin" />
                  ) : (
                    <>
                      Request Audit
                      <ChevronRight className="w-5 h-5" />
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      </main>
    </div>
  );
}
