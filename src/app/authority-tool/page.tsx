'use client';

import React, { useState } from 'react';
import { Lock, ShieldCheck, Activity, Globe, MessageSquare, PlayCircle, Key, Server, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

type ModuleState = 'idle' | 'running' | 'success' | 'error';

export default function AuthorityToolPage() {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  // Pro Global Config State
  const [config, setConfig] = useState({
    businessName: '',
    targetKeywords: '',
    aiEngines: 'chatgpt,perplexity,claude',
    prSyndicationToken: '',
    socialScraperKey: ''
  });

  // Module States
  const [volatilityState, setVolatilityState] = useState<ModuleState>('idle');
  const [syndicateState, setSyndicateState] = useState<ModuleState>('idle');
  const [sentimentState, setSentimentState] = useState<ModuleState>('idle');
  const [logs, setLogs] = useState<string[]>([]);

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    if (passcode === 'CLOVRR_ADMIN_77X') {
      setIsAuthenticated(true);
      setAuthError('');
    } else {
      setAuthError('Invalid developer passcode.');
    }
  };

  const addLog = (msg: string) => {
    setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev]);
  };

  const runModule = async (
    endpoint: string, 
    setState: React.Dispatch<React.SetStateAction<ModuleState>>,
    moduleName: string
  ) => {
    if (!config.businessName || !config.targetKeywords) {
      alert("Please fill out the Business Name and Target Keywords first.");
      return;
    }

    setState('running');
    addLog(`Initiating ${moduleName}...`);

    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(config)
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Execution failed');
      }

      setState('success');
      addLog(`Success: ${data.message}`);
    } catch (err: any) {
      setState('error');
      addLog(`Error: ${err.message}`);
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-black text-[#f5f5f5] font-sans flex items-center justify-center">
        <div className="max-w-md w-full mx-auto p-6">
          <div className="bento-box p-10 text-center border-indigo-500/30">
            <div className="w-12 h-12 bg-indigo-500/10 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-5 h-5 text-indigo-500" />
            </div>
            <h1 className="text-2xl font-semibold mb-2 text-white">Authority Dashboard</h1>
            <p className="text-[#a1a1a6] text-sm mb-8">Enter the developer passcode to access the $299/mo Algorithmic Authority Hub.</p>
            
            <form onSubmit={handleAuth} className="space-y-4">
              <input 
                type="password" 
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Passcode" 
                className="w-full bg-black border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-indigo-500 transition-colors"
              />
              {authError && <p className="text-red-400 text-sm">{authError}</p>}
              <button type="submit" className="w-full bg-indigo-500 hover:bg-indigo-400 text-white font-semibold rounded-lg px-4 py-3 transition-colors shadow-[0_0_20px_rgba(99,102,241,0.3)]">
                Initialize Pro Hub
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const renderModuleButton = (state: ModuleState, onClick: () => void, colorClass = "bg-indigo-500 hover:bg-indigo-400 text-white shadow-[0_0_20px_rgba(99,102,241,0.3)]") => {
    if (state === 'running') {
      return (
        <button disabled className="w-full mt-6 py-3 rounded-xl bg-[#222] text-[#a1a1a6] font-semibold flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Executing...
        </button>
      );
    }
    if (state === 'success') {
      return (
        <button disabled className="w-full mt-6 py-3 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/30 font-semibold flex items-center justify-center gap-2">
          <CheckCircle className="w-4 h-4" /> Execution Complete
        </button>
      );
    }
    if (state === 'error') {
      return (
        <button onClick={onClick} className="w-full mt-6 py-3 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-semibold flex items-center justify-center gap-2 transition-colors">
          <AlertCircle className="w-4 h-4" /> Retry Execution
        </button>
      );
    }
    return (
      <button onClick={onClick} className={`w-full mt-6 py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-transform hover:scale-[1.02] ${colorClass}`}>
        <PlayCircle className="w-5 h-5" /> Execute Payload
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#07070a] text-neutral-200 font-sans pb-24 selection:bg-indigo-500/30">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#07070a]/80 backdrop-blur-md border-b border-[#222]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 opacity-90 hover:opacity-100 transition-opacity">
            <Image src="/logo.png" alt="Clovrr Logo" width={24} height={24} className="rounded-md" />
            <span className="font-bold text-white tracking-wide">Clovrr Authority (PRO)</span>
          </Link>
          <div className="px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2 shadow-[0_0_15px_rgba(99,102,241,0.2)]">
            <Server className="w-3 h-3" /> System Online
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-28">
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Column: Global Config */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#111116] border border-[#222] rounded-3xl p-6 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 to-purple-500"></div>
              <div className="flex items-center gap-3 mb-6">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                <h2 className="text-xl font-bold text-white">Pro Configuration</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#a1a1a6] uppercase tracking-wider mb-2">Business Name</label>
                  <input 
                    type="text" 
                    value={config.businessName}
                    onChange={(e) => setConfig({...config, businessName: e.target.value})}
                    className="w-full bg-black border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a1a1a6] uppercase tracking-wider mb-2">Target Keywords (Comma Separated)</label>
                  <input 
                    type="text" 
                    value={config.targetKeywords}
                    onChange={(e) => setConfig({...config, targetKeywords: e.target.value})}
                    placeholder="e.g. best coffee shop, local cafe"
                    className="w-full bg-black border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a1a1a6] uppercase tracking-wider mb-2">Target AI Engines</label>
                  <input 
                    type="text" 
                    value={config.aiEngines}
                    onChange={(e) => setConfig({...config, aiEngines: e.target.value})}
                    className="w-full bg-black border border-[#333] rounded-lg px-4 py-2.5 text-[#a1a1a6] focus:outline-none focus:border-indigo-500 transition-colors text-sm" 
                  />
                </div>
                
                <div className="pt-4 border-t border-[#222]">
                  <label className="block text-xs font-semibold text-[#a1a1a6] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Globe className="w-3 h-3" /> PR Syndication API Token
                  </label>
                  <input 
                    type="password" 
                    value={config.prSyndicationToken}
                    onChange={(e) => setConfig({...config, prSyndicationToken: e.target.value})}
                    className="w-full bg-black border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a1a1a6] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Key className="w-3 h-3" /> Social Scraper API Key
                  </label>
                  <input 
                    type="password" 
                    value={config.socialScraperKey}
                    onChange={(e) => setConfig({...config, socialScraperKey: e.target.value})}
                    className="w-full bg-black border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-indigo-500 transition-colors text-sm font-mono" 
                  />
                </div>
              </div>
            </div>

            {/* Terminal Console */}
            <div className="bg-[#0b0b0e] border border-[#222] rounded-3xl p-6 shadow-xl h-64 flex flex-col">
              <h3 className="text-sm font-bold text-[#a1a1a6] mb-4 uppercase tracking-widest flex items-center gap-2">
                <Server className="w-4 h-4" /> Pro Execution Logs
              </h3>
              <div className="flex-grow overflow-y-auto font-mono text-[11px] text-indigo-200/60 space-y-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#333] [&::-webkit-scrollbar-thumb]:rounded-full pr-2">
                {logs.length === 0 ? (
                  <span className="text-neutral-600">Awaiting Pro execution...</span>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className={log.includes('Error') ? 'text-rose-400' : log.includes('Success') ? 'text-indigo-300' : ''}>
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Execution Modules */}
          <div className="lg:col-span-8 grid md:grid-cols-2 gap-6 content-start">
            
            {/* Module 1: Volatility Monitor */}
            <div className="bg-[#111116] border border-[#222] rounded-3xl p-8 flex flex-col shadow-xl">
              <div className="w-12 h-12 bg-blue-500/10 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Activity className="w-6 h-6 text-blue-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Volatility Monitor</h3>
              <p className="text-[#a1a1a6] text-sm leading-relaxed flex-grow">
                Simulates real-world queries against ChatGPT and Claude APIs to verify the client is actively being recommended. Alerts on drops.
              </p>
              {renderModuleButton(volatilityState, () => runModule('/api/authority/volatility', setVolatilityState, 'Volatility Monitor'), "bg-blue-600 hover:bg-blue-500 text-white shadow-[0_0_20px_rgba(37,99,235,0.3)]")}
            </div>

            {/* Module 2: PR Syndicator */}
            <div className="bg-[#111116] border border-[#222] rounded-3xl p-8 flex flex-col shadow-xl">
              <div className="w-12 h-12 bg-purple-500/10 border border-purple-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Globe className="w-6 h-6 text-purple-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">PR Syndicator</h3>
              <p className="text-[#a1a1a6] text-sm leading-relaxed flex-grow">
                Feeds fresh context to AI engines by pushing AI-generated, optimized press releases directly to high-authority distribution networks.
              </p>
              {renderModuleButton(syndicateState, () => runModule('/api/authority/syndicate', setSyndicateState, 'PR Syndicator'), "bg-purple-600 hover:bg-purple-500 text-white shadow-[0_0_20px_rgba(147,51,234,0.3)]")}
            </div>

            {/* Module 3: Sentiment Engine */}
            <div className="bg-[#111116] border border-[#222] rounded-3xl p-8 flex flex-col shadow-xl md:col-span-2">
              <div className="w-12 h-12 bg-pink-500/10 border border-pink-500/20 rounded-2xl flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6 text-pink-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Sentiment Intelligence</h3>
              <p className="text-[#a1a1a6] text-sm leading-relaxed flex-grow">
                Scrapes mentions of the business across Reddit, Quora, and major forums. Analyzes the conversational sentiment which heavily dictates AI recommendations.
              </p>
              {renderModuleButton(sentimentState, () => runModule('/api/authority/sentiment', setSentimentState, 'Sentiment Engine'), "bg-pink-600 hover:bg-pink-500 text-white shadow-[0_0_20px_rgba(219,39,119,0.3)]")}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
