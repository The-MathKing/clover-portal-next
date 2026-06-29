'use client';

import { useState } from 'react';
import { ArrowRight, Copy, CheckCircle2, Loader2, Mail } from 'lucide-react';
import { motion } from 'framer-motion';

export default function LeadingEmailPage() {
  const [url, setUrl] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [generatedEmail, setGeneratedEmail] = useState('');
  const [error, setError] = useState('');
  const [copied, setCopied] = useState(false);

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;

    setIsLoading(true);
    setError('');
    setGeneratedEmail('');
    setCopied(false);

    try {
      const res = await fetch('/api/leading-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ websiteUrl: url }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to generate email');
      }

      setGeneratedEmail(data.email);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = () => {
    if (!generatedEmail) return;
    navigator.clipboard.writeText(generatedEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 font-sans p-6 md:p-12">
      <div className="max-w-3xl mx-auto space-y-12">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center justify-center p-3 bg-emerald-500/10 rounded-2xl mb-2">
            <Mail className="w-8 h-8 text-emerald-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-black text-white tracking-tight">
            Leading <span className="text-emerald-500">Email Generator</span>
          </h1>
          <p className="text-lg text-neutral-400 max-w-xl mx-auto">
            Input a business URL and our AI will automatically scrape their site, identify their local competitors, and generate a personalized outreach email.
          </p>
        </div>

        {/* Input Card */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8 shadow-xl relative overflow-hidden"
        >
          {/* Subtle gradient effect */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none" />

          <form onSubmit={handleGenerate} className="space-y-6 relative z-10">
            <div>
              <label htmlFor="url" className="block text-sm font-semibold text-neutral-300 mb-2 uppercase tracking-wider">
                Target Business URL
              </label>
              <input
                id="url"
                type="text"
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                placeholder="https://www.example-business.com"
                className="w-full bg-black border border-neutral-800 rounded-xl px-4 py-4 text-white placeholder-neutral-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 transition-all text-lg"
                required
              />
            </div>

            {error && (
              <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm">
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading || !url}
              className="w-full flex items-center justify-center gap-2 bg-emerald-500 hover:bg-emerald-400 disabled:bg-neutral-800 disabled:text-neutral-500 text-black font-bold py-4 px-8 rounded-xl transition-all shadow-lg hover:shadow-emerald-500/20 active:scale-[0.98]"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Generating Intelligence...
                </>
              ) : (
                <>
                  Generate Outreach Email
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </button>
          </form>
        </motion.div>

        {/* Results Card */}
        {generatedEmail && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-neutral-900 border border-emerald-500/30 rounded-3xl overflow-hidden shadow-2xl"
          >
            <div className="flex items-center justify-between px-6 py-4 bg-black/40 border-b border-neutral-800">
              <h3 className="font-semibold text-white flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                Generated Template
              </h3>
              <button
                onClick={handleCopy}
                className="flex items-center gap-2 text-xs font-semibold px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 transition-colors"
              >
                {copied ? (
                  <><CheckCircle2 className="w-3 h-3 text-emerald-500" /> Copied!</>
                ) : (
                  <><Copy className="w-3 h-3" /> Copy Text</>
                )}
              </button>
            </div>
            <div className="p-6">
              <textarea
                readOnly
                value={generatedEmail}
                className="w-full h-96 bg-transparent border-none text-neutral-200 resize-none focus:outline-none font-medium leading-relaxed"
              />
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
}
