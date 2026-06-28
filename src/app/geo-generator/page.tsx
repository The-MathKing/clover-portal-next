'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';

export default function GeoGenerator() {
  const [inputType, setInputType] = useState<'details' | 'url'>('url');

  const [businessName, setBusinessName] = useState('');
  const [industry, setIndustry] = useState('');
  const [customIndustry, setCustomIndustry] = useState('');
  const [zipcode, setZipcode] = useState('');
  const [websiteUrl, setWebsiteUrl] = useState('');
  
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
        body: JSON.stringify({ 
          inputType,
          businessName: inputType === 'details' ? businessName : undefined, 
          industry: inputType === 'details' ? finalIndustry : undefined, 
          zipcode: inputType === 'details' ? zipcode : undefined,
          websiteUrl: inputType === 'url' ? websiteUrl : undefined
        })
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
      setWebsiteUrl('');
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex flex-col items-center py-20 px-6 font-sans">
      <nav className="fixed top-0 w-full z-50 nav-blur border-b border-[#222]">
        <div className="max-w-7xl mx-auto px-6 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 opacity-90 hover:opacity-100 transition-opacity">
            <Image src="/logo.png" alt="Clovrr Logo" width={24} height={24} className="rounded-md" />
            <span className="text-sm font-semibold tracking-wide text-white">Clovrr</span>
          </Link>
          <Link href="/" className="text-[13px] font-medium text-[#a1a1a6] hover:text-white transition-colors">
            Back to Home
          </Link>
        </div>
      </nav>

      <div className="max-w-3xl w-full mt-10">
        <div className="text-center mb-10">
          <h1 className="text-4xl md:text-5xl font-semibold text-white mb-4 tracking-tight">
            Free AI Visibility Audit
          </h1>
          <p className="text-[#a1a1a6] text-lg max-w-xl mx-auto">
            Find out exactly what ChatGPT thinks about your business right now. It takes 60 seconds and it's completely free.
          </p>
        </div>

        <div className="bento-box p-8 mb-8 relative">
          
          <div className="flex gap-4 border-b border-[#333] mb-8 pb-4">
            <button 
              type="button"
              onClick={() => setInputType('url')}
              className={`pb-2 px-2 text-sm font-semibold transition-colors border-b-2 ${inputType === 'url' ? 'border-emerald-500 text-white' : 'border-transparent text-[#a1a1a6] hover:text-white'}`}
            >
              Use Website URL
            </button>
            <button 
              type="button"
              onClick={() => setInputType('details')}
              className={`pb-2 px-2 text-sm font-semibold transition-colors border-b-2 ${inputType === 'details' ? 'border-emerald-500 text-white' : 'border-transparent text-[#a1a1a6] hover:text-white'}`}
            >
              Enter Details Manually
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {inputType === 'url' ? (
              <div className="animate-in fade-in duration-300">
                <label className="block text-sm font-semibold text-[#a1a1a6] mb-2">Website URL</label>
                <input 
                  type="url" 
                  value={websiteUrl}
                  onChange={(e) => setWebsiteUrl(e.target.value)}
                  required 
                  className="w-full bg-black border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
                  placeholder="https://www.yourbusiness.com" 
                />
              </div>
            ) : (
              <div className="space-y-6 animate-in fade-in duration-300">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-semibold text-[#a1a1a6] mb-2">Business Name</label>
                    <input 
                      type="text" 
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      required 
                      className="w-full bg-black border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
                      placeholder="e.g. Luigi's Pizza" 
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-[#a1a1a6] mb-2">Industry</label>
                    <select 
                      value={industry}
                      onChange={(e) => setIndustry(e.target.value)}
                      required 
                      className="w-full bg-black border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
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
                    <label className="block text-sm font-semibold text-[#a1a1a6] mb-2">Custom Industry</label>
                    <input 
                      type="text" 
                      value={customIndustry}
                      onChange={(e) => setCustomIndustry(e.target.value)}
                      required 
                      className="w-full bg-black border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
                      placeholder="e.g. Exotic Car Rental" 
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-semibold text-[#a1a1a6] mb-2">Zip Code</label>
                  <input 
                    type="text" 
                    value={zipcode}
                    onChange={(e) => setZipcode(e.target.value)}
                    required 
                    className="w-full bg-black border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors" 
                    placeholder="e.g. 90210" 
                  />
                </div>
              </div>
            )}

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-lg text-red-400 font-medium whitespace-pre-wrap text-sm">
                {error}
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black font-semibold text-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed mt-4"
            >
              {loading ? (
                <>
                  <span>Analyzing AI Overviews...</span>
                  <svg className="animate-spin w-5 h-5 text-black" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
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
