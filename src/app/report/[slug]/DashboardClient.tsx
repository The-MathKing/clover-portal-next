'use client';
import React from 'react';
import { Target, MessageSquare, Activity, TrendingUp, Trophy, AlertCircle, BarChart3, ChevronRight } from 'lucide-react';
import Link from 'next/link';

interface Competitor {
  name: string;
  rank: number;
}

interface DashboardData {
  verdict: string;
  geoScore: number;
  metrics: {
    brandAuthority: number;
    sentimentAnalysis: number;
    citationFrequency: number;
    directRecommendation: number;
  };
  competitors: Competitor[];
}

interface DashboardClientProps {
  data: DashboardData | null;
  businessName: string;
  industry: string;
}

export default function DashboardClient({ data, businessName, industry }: DashboardClientProps) {
  
  if (!data) {
    return (
      <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center text-white font-sans">
        <div className="text-center">
          <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold mb-2">Legacy Report Format</h1>
          <p className="text-[#a1a1a6]">This report uses an older formatting system that is no longer supported.</p>
        </div>
      </div>
    );
  }

  // Radial Chart Math
  const radius = 60;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (data.geoScore / 100) * circumference;

  const getScoreColor = (score: number) => {
    if (score < 30) return 'text-rose-500 bg-rose-500';
    if (score < 60) return 'text-amber-500 bg-amber-500';
    return 'text-emerald-500 bg-emerald-500';
  };
  
  const getScoreStroke = (score: number) => {
    if (score < 30) return '#f43f5e';
    if (score < 60) return '#f59e0b';
    return '#10b981';
  };

  const getScoreBg = (score: number) => {
    if (score < 30) return 'bg-rose-500/10 border-rose-500/20 text-rose-400';
    if (score < 60) return 'bg-amber-500/10 border-amber-500/20 text-amber-400';
    return 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400';
  };

  const MetricCard = ({ title, score, icon: Icon }: { title: string, score: number, icon: any }) => (
    <div className="bg-[#151515] border border-[#222] rounded-2xl p-6">
      <div className="flex items-center gap-3 mb-6">
        <Icon className={`w-5 h-5 ${getScoreColor(score).split(' ')[0]}`} />
        <span className="font-semibold text-neutral-200">{title}</span>
      </div>
      <div className="flex items-end gap-2 mb-2">
        <span className="text-3xl font-bold text-white leading-none">{score}</span>
        <span className="text-xs text-neutral-500 mb-1">/ 100</span>
      </div>
      <div className="h-2 w-full bg-[#222] rounded-full overflow-hidden">
        <div 
          className={`h-full rounded-full ${getScoreColor(score).split(' ')[1]}`} 
          style={{ width: `${score}%` }}
        />
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 font-sans pb-24">
      
      {/* Header */}
      <div className="pt-20 pb-12 px-6 text-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 text-emerald-400 text-[10px] font-bold tracking-widest uppercase mb-6 shadow-[0_0_10px_rgba(16,185,129,0.2)]">
          <BarChart3 className="w-3 h-3" /> Live AI Audit Complete
        </div>
        <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-4">
          Report for {businessName}
        </h1>
        <p className="text-[#a1a1a6] font-medium text-lg">
          Industry Profile: <span className="text-white">{industry}</span>
        </p>
      </div>

      <div className="max-w-5xl mx-auto px-6">
        
        {/* Main Dashboard Grid */}
        <div className="grid md:grid-cols-12 gap-6 mb-12">
          
          {/* Left: Geo Score */}
          <div className="md:col-span-4 bg-[#151515] border border-[#222] rounded-3xl p-8 flex flex-col items-center justify-center text-center shadow-2xl relative overflow-hidden">
            <h2 className="text-sm font-bold tracking-widest text-[#a1a1a6] mb-8 uppercase">GEO Index Score</h2>
            
            <div className="relative w-48 h-48 mb-8 flex items-center justify-center">
              <svg className="absolute inset-0 transform -rotate-90 w-full h-full">
                <circle cx="96" cy="96" r="70" stroke="#222" strokeWidth="16" fill="transparent" />
                <circle 
                  cx="96" 
                  cy="96" 
                  r="70" 
                  stroke={getScoreStroke(data.geoScore)} 
                  strokeWidth="16" 
                  fill="transparent" 
                  strokeDasharray={circumference} 
                  strokeDashoffset={offset} 
                  strokeLinecap="round" 
                  className="transition-all duration-1000 ease-out"
                />
              </svg>
              <div className="flex flex-col items-center justify-center">
                <span className="text-5xl font-black text-white">{data.geoScore}</span>
                <span className="text-xs text-neutral-500 font-medium uppercase tracking-widest mt-1">Out of 100</span>
              </div>
            </div>

            <div className={`px-4 py-2 rounded-full border text-sm font-bold flex items-center gap-2 ${getScoreBg(data.geoScore)}`}>
              <AlertCircle className="w-4 h-4" /> 
              {data.geoScore < 30 ? 'Critically Low' : data.geoScore < 60 ? 'Needs Improvement' : 'Excellent'}
            </div>
          </div>

          {/* Right Column */}
          <div className="md:col-span-8 flex flex-col gap-6">
            
            {/* Verdict Box */}
            <div className="bg-[#151515] border border-[#222] rounded-3xl p-8 shadow-2xl">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-white">The AI's Verdict</h2>
                <div className="px-3 py-1 rounded-full bg-[#222] text-[#a1a1a6] text-xs font-bold flex items-center gap-1.5 border border-[#333]">
                  <Trophy className="w-3 h-3 text-emerald-400" /> Rank: #{data.competitors.length} out of {data.competitors.length}
                </div>
              </div>
              <p className="text-[#a1a1a6] leading-relaxed text-lg">"{data.verdict}"</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-2 gap-6 flex-grow">
              <MetricCard title="Brand Authority" score={data.metrics.brandAuthority} icon={Target} />
              <MetricCard title="Sentiment Analysis" score={data.metrics.sentimentAnalysis} icon={MessageSquare} />
              <MetricCard title="Citation Frequency" score={data.metrics.citationFrequency} icon={Activity} />
              <MetricCard title="Direct Recommendation" score={data.metrics.directRecommendation} icon={TrendingUp} />
            </div>

          </div>
        </div>

        {/* Competitors List */}
        <div className="mt-16">
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-white mb-2">Your Direct Competitors</h2>
            <p className="text-[#a1a1a6]">Who AI recommends specifically for your niche</p>
          </div>

          <div className="bg-[#151515] border border-[#222] rounded-3xl p-6 md:p-8 space-y-4 max-h-[450px] overflow-y-auto [&::-webkit-scrollbar]:w-2 [&::-webkit-scrollbar-track]:bg-transparent [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-thumb]:bg-emerald-500/30 hover:[&::-webkit-scrollbar-thumb]:bg-emerald-500/80 [&::-webkit-scrollbar-thumb]:rounded-full pr-2">
            {data.competitors.map((comp, i) => {
              // Check if this is the user's business (usually the last one as per prompt)
              const isUser = comp.name.toLowerCase().includes(businessName.toLowerCase()) || i === data.competitors.length - 1;

              return (
                <div 
                  key={i} 
                  className={`flex justify-between items-center p-5 rounded-2xl border transition-colors ${isUser ? 'bg-emerald-500/10 border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.1)]' : 'bg-[#0a0a0a] border-[#222]'}`}
                >
                  <span className={`font-semibold text-lg ${isUser ? 'text-emerald-400' : 'text-white'}`}>
                    {comp.name}
                  </span>
                  <span className={`text-sm font-bold tracking-widest uppercase ${isUser ? 'text-emerald-500' : 'text-[#a1a1a6]'}`}>
                    Rank #{comp.rank}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <h3 className="text-2xl font-bold text-white mb-6">Want to beat these competitors?</h3>
          <Link href="/contact" className="inline-flex items-center justify-center px-10 py-5 rounded-full bg-emerald-500 text-black font-semibold text-lg hover:scale-105 transition-transform shadow-[0_0_40px_rgba(16,185,129,0.3)] gap-2">
            Claim Your Spot <ChevronRight className="w-5 h-5" />
          </Link>
        </div>

      </div>
    </div>
  );
}
