'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Lock, Unlock } from 'lucide-react';

export default function GeoGenerator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [passcode, setPasscode] = useState('');
  
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
  const [zipcode, setZipcode] = useState('');
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    // Basic client-side check to prevent accidental submissions,
    // Real security happens on the backend API route.
    if (passcode.trim() === 'CLOVRR_ADMIN_77X') {
      setIsAuthenticated(true);
      setError('');
    } else {
      setError('Invalid developer passcode');
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const finalIndustry = industry === 'other' ? customIndustry : industry;

    try {
      const res = await fetch('/api/geo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, industry: finalIndustry, zipcode, passcode })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate report');
      }

      // Open the generated report in a new tab
      window.open(`/report/${data.slug}`, '_blank');
      
      // Clear form
      setBusinessName('');
      setZipcode('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // ── Locked Screen ──
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center py-20 px-6 font-sans">
        <div className="max-w-md w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-2xl text-center">
          <div className="w-16 h-16 bg-neutral-950 border border-neutral-800 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <Lock className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Developer Access Required</h1>
          <p className="text-neutral-400 mb-8 text-sm">Please enter the developer passcode to access the internal GEO generator tool.</p>
          
          <form onSubmit={handleAuth} className="space-y-4">
            <input 
              type="password" 
              value={passcode}
              onChange={(e) => setPasscode(e.target.value)}
              required 
              autoFocus
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-center text-white focus:outline-none focus:border-emerald-500 transition-colors tracking-widest" 
              placeholder="••••••••••••" 
            />
            {error && (
              <div className="text-rose-500 text-sm font-medium">{error}</div>
            )}
            <button 
              type="submit" 
              className="w-full py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold transition-colors flex items-center justify-center gap-2"
            >
              <Unlock className="w-4 h-4" /> Unlock Generator
            </button>
          </form>
          <div className="mt-6 pt-6 border-t border-neutral-800">
            <Link href="/" className="text-sm text-neutral-500 hover:text-neutral-300">Return to public site</Link>
          </div>
        </div>
      </div>
    );
  }

  // ── Generator Screen ──
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center py-20 px-6 font-sans">
      <div className="max-w-3xl w-full">
        <div className="flex justify-center mb-8">
            <Link href="/" className="flex items-center gap-2">
              <Image src="/logo.png" alt="Clovrr Logo" width={40} height={40} className="rounded-lg" />
            </Link>
        </div>
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 to-teal-400 mb-4 tracking-tight">
            GEO Action Plan Generator
          </h1>
          <p className="text-neutral-400 text-lg max-w-xl mx-auto">
            Generate a custom step-by-step Generative Engine Optimization plan to improve your AI search score.
          </p>
        </div>

        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 mb-8 shadow-xl shadow-emerald-900/20 relative">
          
          <div className="absolute top-4 right-4 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs px-3 py-1 rounded-full flex items-center gap-1.5 font-bold tracking-wider">
            <Unlock className="w-3 h-3" /> ADMIN
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-semibold text-neutral-300 mb-2">Business Name</label>
                <input 
                  type="text" 
                  value={businessName}
                  onChange={(e) => setBusinessName(e.target.value)}
                  required 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
                  placeholder="e.g. Luigi's Pizza" 
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-neutral-300 mb-2">Industry</label>
                <select 
                  value={industry}
                  onChange={(e) => setIndustry(e.target.value)}
                  required 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
                >
                  <option value="">Select Industry...</option>
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
            
            {industry === 'other' && (
              <div className="animate-in fade-in slide-in-from-top-4 duration-300">
                <label className="block text-sm font-semibold text-neutral-300 mb-2">Custom Industry</label>
                <input 
                  type="text" 
                  value={customIndustry}
                  onChange={(e) => setCustomIndustry(e.target.value)}
                  required 
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
                  placeholder="e.g. Exotic Car Rental" 
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-semibold text-neutral-300 mb-2">Zip Code</label>
              <input 
                type="text" 
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value)}
                required 
                className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
                placeholder="e.g. 90210" 
              />
            </div>

            {error && (
              <div className="p-4 bg-rose-500/10 border border-rose-500/50 rounded-xl text-rose-500 font-medium whitespace-pre-wrap">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <>
                  <span>Analyzing AI Overviews...</span>
                  <svg className="animate-spin w-5 h-5 text-neutral-950" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                </>
              ) : (
                'Generate Action Plan'
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
