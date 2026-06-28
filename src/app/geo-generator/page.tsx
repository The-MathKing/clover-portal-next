'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function GeoGenerator() {
  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    const finalIndustry = industry === 'other' ? customIndustry : industry;

    try {
      const res = await fetch('/api/geo', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ businessName, industry: finalIndustry, zipcode })
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

        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 mb-8 shadow-xl shadow-emerald-900/20">
          <form onSubmit={handleSubmit} className="space-y-6">
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
              <div className="p-4 bg-rose-500/10 border border-rose-500/50 rounded-xl text-rose-500 font-medium">
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
