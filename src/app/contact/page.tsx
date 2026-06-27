'use client';
import React, { useState } from 'react';
import { Bot, ChevronRight, CheckCircle, Mail, User, Briefcase, MessageSquare } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

export default function ContactPage() {
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success'>('idle');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('submitting');
    
    // Simulate network request
    setTimeout(() => {
      setStatus('success');
    }, 1500);
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
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-sm font-semibold text-neutral-300 ml-1">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-neutral-500" />
                      <input 
                        required
                        type="text" 
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
