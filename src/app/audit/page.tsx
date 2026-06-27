'use client';
import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Bot, ChevronRight, AlertCircle, CheckCircle, BarChart3, TrendingUp, Trophy, Activity, MessageSquare, Target } from 'lucide-react';
import { motion } from 'framer-motion';
import Link from 'next/link';

type AuditResult = {
  score: number;
  rank: string;
  verdict: string;
  breakdown: {
    brandAuthority: number;
    sentiment: number;
    citationFrequency: number;
    directRecommendation: number;
  };
  competitors: string[];
};

function AuditReportContent() {
  const searchParams = useSearchParams();
  const businessName = searchParams.get('businessName') || '';
  const industry = searchParams.get('industry') || '';

  const [status, setStatus] = useState<'loading' | 'complete' | 'error'>('loading');
  const [result, setResult] = useState<AuditResult | null>(null);

  useEffect(() => {
    if (!businessName || !industry) {
      setStatus('error');
      return;
    }

    const fetchAudit = async () => {
      try {
        const res = await fetch('/api/audit', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ businessName, industry })
        });
        if (!res.ok) throw new Error("Failed to fetch audit");
        const data = await res.json();
        setResult(data);
        setStatus('complete');
      } catch (err) {
        console.error(err);
        setStatus('error');
      }
    };
    fetchAudit();
  }, [businessName, industry]);

  if (status === 'error') {
    return (
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-12 h-12 text-rose-500 mb-4" />
        <h1 className="text-2xl font-bold text-white mb-2">Audit Failed</h1>
        <p className="text-neutral-400 mb-6">We couldn't analyze the AI data for this business. Please try again.</p>
        <Link href="/" className="px-6 py-3 bg-neutral-800 text-white rounded-full hover:bg-neutral-700 transition-colors">
          Return Home
        </Link>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-neutral-950 font-sans selection:bg-emerald-500/30 pb-24">
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

      {/* ── Loading State ── */}
      {status === 'loading' && (
        <div className="pt-40 flex flex-col items-center justify-center min-h-[70vh]">
          <div className="w-24 h-24 relative mb-8">
            <div className="absolute inset-0 border-4 border-emerald-500/20 rounded-full" />
            <div className="absolute inset-0 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin" />
            <Bot className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-emerald-400 animate-pulse" />
          </div>
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center"
          >
            <h1 className="text-3xl font-bold text-white mb-3">Compiling AI Search Report</h1>
            <p className="text-neutral-400 text-lg">Querying Gemini and mapping algorithmic pathways for "{businessName}"...</p>
          </motion.div>
        </div>
      )}

      {/* ── Results State ── */}
      {status === 'complete' && result && (
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="pt-32 px-6 max-w-5xl mx-auto"
        >
          <div className="mb-12 text-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-950/50 border border-emerald-500/30 text-emerald-400 text-xs font-bold uppercase tracking-wider mb-4">
              <BarChart3 className="w-3.5 h-3.5" />
              Live AI Audit Complete
            </div>
            <h1 className="text-4xl md:text-5xl font-extrabold text-white mb-4">
              Report for {businessName}
            </h1>
            <p className="text-xl text-neutral-400">Industry Profile: <span className="text-white font-medium">{industry}</span></p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 mb-12">
            {/* Primary Score Card */}
            <div className="md:col-span-1 bg-neutral-900 border border-neutral-800 rounded-3xl p-8 flex flex-col items-center justify-center text-center relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-b from-transparent to-neutral-950/50" />
              <div className="relative z-10">
                <h3 className="text-lg font-semibold text-neutral-400 mb-6 uppercase tracking-widest">GEO Index Score</h3>
                <div className="inline-block relative mb-6">
                  <svg className="w-48 h-48 transform -rotate-90">
                    <circle cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="16" fill="transparent" className="text-neutral-800" />
                    <circle 
                      cx="96" cy="96" r="80" stroke="currentColor" strokeWidth="16" fill="transparent" 
                      strokeDasharray={502} 
                      strokeDashoffset={502 - (502 * result.score) / 100}
                      className={result.score > 70 ? 'text-emerald-500' : result.score > 40 ? 'text-amber-500' : 'text-rose-500'} 
                      style={{ transition: 'stroke-dashoffset 1.5s ease-out' }}
                    />
                  </svg>
                  <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-5xl font-bold text-white">{result.score}</span>
                    <span className="text-xs text-neutral-500 font-bold uppercase mt-1">out of 100</span>
                  </div>
                </div>
                <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-bold ${
                  result.score > 70 ? 'bg-emerald-950 text-emerald-400' : 
                  result.score > 40 ? 'bg-amber-950 text-amber-400' : 
                  'bg-rose-950 text-rose-400'
                }`}>
                  {result.score > 70 ? <CheckCircle className="w-4 h-4" /> : <AlertCircle className="w-4 h-4" />}
                  {result.score > 70 ? 'Highly Visible' : result.score > 40 ? 'Needs Improvement' : 'Critically Low'}
                </div>
              </div>
            </div>

            {/* Breakdown & Rank Section */}
            <div className="md:col-span-2 space-y-8">
              {/* Verdict & Rank */}
              <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-2xl font-bold text-white">The AI's Verdict</h3>
                  <div className="bg-neutral-950 border border-neutral-800 px-4 py-2 rounded-full flex items-center gap-2">
                    <Trophy className="w-4 h-4 text-emerald-500" />
                    <span className="text-sm font-bold text-neutral-300">Rank: {result.rank}</span>
                  </div>
                </div>
                <p className="text-lg text-neutral-300 leading-relaxed">
                  "{result.verdict}"
                </p>
              </div>

              {/* Metrics Grid */}
              <div className="grid sm:grid-cols-2 gap-4">
                <MetricCard 
                  title="Brand Authority" 
                  value={result.breakdown.brandAuthority} 
                  icon={<Target className="w-5 h-5 text-emerald-400" />} 
                />
                <MetricCard 
                  title="Sentiment Analysis" 
                  value={result.breakdown.sentiment} 
                  icon={<MessageSquare className="w-5 h-5 text-emerald-400" />} 
                />
                <MetricCard 
                  title="Citation Frequency" 
                  value={result.breakdown.citationFrequency} 
                  icon={<Activity className="w-5 h-5 text-emerald-400" />} 
                />
                <MetricCard 
                  title="Direct Recommendation" 
                  value={result.breakdown.directRecommendation} 
                  icon={<TrendingUp className="w-5 h-5 text-emerald-400" />} 
                />
              </div>
            </div>
          </div>

          {/* Competitors & CTA */}
          <div className="grid md:grid-cols-2 gap-8 mb-12">
            <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-8">
              <h3 className="text-xl font-bold text-white mb-6">Who the AI is Recommending Instead</h3>
              <ul className="space-y-4">
                {result.competitors.map((comp, idx) => (
                  <li key={idx} className="flex items-center justify-between p-4 bg-neutral-950 rounded-xl border border-neutral-800">
                    <span className="font-semibold text-neutral-300">{comp}</span>
                    <span className="text-xs text-neutral-500 uppercase tracking-widest font-bold">Rank #{idx + 1}</span>
                  </li>
                ))}
              </ul>
            </div>
            
            <div className="bg-gradient-to-br from-emerald-900/40 to-neutral-900 border border-emerald-500/30 rounded-3xl p-8 flex flex-col justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/20 blur-[50px] rounded-full pointer-events-none" />
              <h3 className="text-3xl font-bold text-white mb-4 relative z-10">Stop losing leads to AI search.</h3>
              <p className="text-neutral-300 mb-8 relative z-10">
                Traditional SEO won't fix this. You need to establish Generative Engine Optimization (GEO) before your competitors take your market share.
              </p>
              <Link 
                href="/contact"
                className="inline-flex items-center justify-center gap-3 px-8 py-5 rounded-full bg-emerald-500 hover:bg-emerald-400 text-neutral-950 font-bold text-lg transition-all shadow-xl shadow-emerald-900/50 relative z-10"
              >
                Fix My AI Score
                <ChevronRight className="w-5 h-5" />
              </Link>
            </div>
          </div>

        </motion.div>
      )}
    </div>
  );
}

function MetricCard({ title, value, icon }: { title: string, value: number, icon: React.ReactNode }) {
  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-5">
      <div className="flex items-center gap-3 mb-4">
        <div className="w-10 h-10 bg-neutral-950 rounded-lg flex items-center justify-center">
          {icon}
        </div>
        <span className="font-semibold text-neutral-300">{title}</span>
      </div>
      <div className="flex items-end justify-between mb-2">
        <span className="text-2xl font-bold text-white">{value}</span>
        <span className="text-xs font-semibold text-neutral-500 uppercase">/ 100</span>
      </div>
      <div className="w-full h-2 bg-neutral-950 rounded-full overflow-hidden">
        <motion.div 
          initial={{ width: 0 }}
          animate={{ width: `${value}%` }}
          transition={{ duration: 1, delay: 0.5 }}
          className={`h-full rounded-full ${
            value > 70 ? 'bg-emerald-500' : value > 40 ? 'bg-amber-500' : 'bg-rose-500'
          }`}
        />
      </div>
    </div>
  );
}

export default function AuditReportPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-neutral-950 flex flex-col items-center justify-center p-6 text-center">
        <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mb-4" />
        <p className="text-neutral-400 font-bold uppercase tracking-widest">Loading...</p>
      </div>
    }>
      <AuditReportContent />
    </Suspense>
  );
}
