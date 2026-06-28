'use client';

import React, { useState } from 'react';
import { Lock, FileText, ChevronRight, Loader2, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import ReactMarkdown from 'react-markdown';

export default function ReportGeneratorPage() {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    clientName: '',
    tier: 'GEO Foundation',
    month: 'Month 1'
  });

  const [loading, setLoading] = useState(false);
  const [markdownOutput, setMarkdownOutput] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'CLOVRR_ADMIN_77X') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid developer passcode.');
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/report', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...form, passcode })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to generate report');
      }

      setMarkdownOutput(data.markdown);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const resetGenerator = () => {
    setMarkdownOutput('');
    setForm({ clientName: '', tier: 'GEO Foundation', month: 'Month 1' });
  };

  return (
    <div className="min-h-screen bg-black text-[#f5f5f5] font-sans">
      <nav className="fixed top-0 w-full z-50 nav-blur border-b border-[#222]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 opacity-90 hover:opacity-100 transition-opacity">
            <Image src="/logo.png" alt="Clovrr Logo" width={24} height={24} className="rounded-md" />
            <span className="text-sm font-semibold tracking-wide">Clovrr</span>
          </Link>
          <div className="text-[13px] font-medium text-[#a1a1a6]">
            Internal Reporting Tool
          </div>
        </div>
      </nav>

      <main className="max-w-4xl mx-auto px-6 pt-32 pb-24">
        {!isAuthenticated ? (
          <div className="max-w-md mx-auto mt-20">
            <div className="bento-box p-10 text-center">
              <div className="w-12 h-12 bg-[#2d2d2f] rounded-full flex items-center justify-center mx-auto mb-6">
                <Lock className="w-5 h-5 text-white" />
              </div>
              <h1 className="text-2xl font-semibold mb-2">Restricted Access</h1>
              <p className="text-[#a1a1a6] text-sm mb-8">Enter the developer passcode to access the Progress Report Generator.</p>
              
              <form onSubmit={handleAuth} className="space-y-4">
                <input 
                  type="password" 
                  value={passcode}
                  onChange={(e) => setPasscode(e.target.value)}
                  placeholder="Passcode" 
                  className="w-full bg-black border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                />
                {error && <p className="text-red-400 text-sm">{error}</p>}
                <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg px-4 py-3 transition-colors">
                  Authenticate
                </button>
              </form>
            </div>
          </div>
        ) : !markdownOutput ? (
          <div className="max-w-2xl mx-auto">
            <div className="mb-12">
              <h1 className="text-4xl font-semibold mb-4 flex items-center gap-4">
                <FileText className="w-8 h-8 text-emerald-500" />
                Client Report Generator
              </h1>
              <p className="text-[#a1a1a6]">Instantly generate highly professional, encouraging monthly progress emails for active clients.</p>
            </div>

            <form onSubmit={handleGenerate} className="bento-box p-8 space-y-6">
              
              <div className="space-y-2">
                <label className="text-sm font-medium text-[#a1a1a6]">Client / Business Name</label>
                <input required value={form.clientName} onChange={e => setForm({...form, clientName: e.target.value})} type="text" placeholder="e.g. Acme Roofing" className="w-full bg-black border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" />
              </div>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#a1a1a6]">Subscription Tier</label>
                  <select required value={form.tier} onChange={e => setForm({...form, tier: e.target.value})} className="w-full bg-black border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors">
                    <option value="GEO Foundation">GEO Foundation</option>
                    <option value="Algorithmic Authority">Algorithmic Authority</option>
                  </select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium text-[#a1a1a6]">Billing Month</label>
                  <select required value={form.month} onChange={e => setForm({...form, month: e.target.value})} className="w-full bg-black border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors">
                    <option value="Month 1">Month 1</option>
                    <option value="Month 2">Month 2</option>
                    <option value="Month 3">Month 3</option>
                    <option value="Month 4">Month 4</option>
                    <option value="Month 5">Month 5</option>
                    <option value="Month 6+">Month 6+</option>
                  </select>
                </div>
              </div>

              {error && (
                <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 text-sm">
                  {error}
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg px-4 py-4 transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
              >
                {loading ? (
                  <><Loader2 className="w-5 h-5 animate-spin" /> Generating Email Report...</>
                ) : (
                  <>Generate Email Report <ChevronRight className="w-5 h-5" /></>
                )}
              </button>
            </form>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-700">
            <div className="flex items-center justify-between border-b border-[#222] pb-6">
              <div>
                <h1 className="text-3xl font-semibold mb-2 text-white">Client Report: {form.clientName}</h1>
                <p className="text-[#a1a1a6]">Ready for copy/paste</p>
              </div>
              <button onClick={resetGenerator} className="flex items-center gap-2 px-4 py-2 rounded-full border border-[#333] hover:bg-[#111] transition-colors text-sm font-medium">
                <RefreshCw className="w-4 h-4" /> New Report
              </button>
            </div>

            <div className="bento-box p-10 prose prose-invert prose-emerald max-w-none">
              <ReactMarkdown>{markdownOutput}</ReactMarkdown>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
