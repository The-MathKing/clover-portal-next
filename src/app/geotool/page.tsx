'use client';

import React, { useState } from 'react';
import { Lock, Settings, Database, MessageSquare, MapPin, PlayCircle, Key, Server, Link as LinkIcon, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

type ModuleState = 'idle' | 'running' | 'success' | 'error';

export default function GeoToolPage() {
  const [passcode, setPasscode] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');

  // Global Config State
  const [config, setConfig] = useState({
    businessName: '',
    websiteUrl: '',
    googleApiKey: '',
    cmsToken: '',
    yextKey: ''
  });

  // Module States
  const [schemaState, setSchemaState] = useState<ModuleState>('idle');
  const [reviewState, setReviewState] = useState<ModuleState>('idle');
  const [citationState, setCitationState] = useState<ModuleState>('idle');
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
    if (!config.businessName || !config.websiteUrl) {
      alert("Please fill out the Business Name and Website URL in the Global Config first.");
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
          <div className="bento-box p-10 text-center">
            <div className="w-12 h-12 bg-[#2d2d2f] rounded-full flex items-center justify-center mx-auto mb-6">
              <Lock className="w-5 h-5 text-emerald-500" />
            </div>
            <h1 className="text-2xl font-semibold mb-2 text-white">Active Automation Hub</h1>
            <p className="text-[#a1a1a6] text-sm mb-8">Enter the developer passcode to access the /geotool execution environment.</p>
            
            <form onSubmit={handleAuth} className="space-y-4">
              <input 
                type="password" 
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                placeholder="Passcode" 
                className="w-full bg-black border border-[#333] rounded-lg px-4 py-3 text-white focus:outline-none focus:border-emerald-500 transition-colors"
              />
              {authError && <p className="text-red-400 text-sm">{authError}</p>}
              <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-400 text-black font-semibold rounded-lg px-4 py-3 transition-colors shadow-[0_0_20px_rgba(16,185,129,0.2)]">
                Initialize Hub
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  const renderModuleButton = (state: ModuleState, onClick: () => void) => {
    if (state === 'running') {
      return (
        <button disabled className="w-full mt-6 py-3 rounded-xl bg-[#222] text-[#a1a1a6] font-semibold flex items-center justify-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Executing...
        </button>
      );
    }
    if (state === 'success') {
      return (
        <button disabled className="w-full mt-6 py-3 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-semibold flex items-center justify-center gap-2">
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
      <button onClick={onClick} className="w-full mt-6 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-black font-bold flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(16,185,129,0.2)] transition-transform hover:scale-[1.02]">
        <PlayCircle className="w-5 h-5" /> Execute Payload
      </button>
    );
  };

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-neutral-200 font-sans pb-24">
      {/* Navigation */}
      <nav className="fixed top-0 w-full z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-[#222]">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 opacity-90 hover:opacity-100 transition-opacity">
            <Image src="/logo.png" alt="Clovrr Logo" width={24} height={24} className="rounded-md" />
            <span className="font-bold text-white tracking-wide">Clovrr GEOTool</span>
          </Link>
          <div className="px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-bold uppercase tracking-widest flex items-center gap-2">
            <Server className="w-3 h-3" /> System Online
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-6 pt-28">
        
        <div className="grid lg:grid-cols-12 gap-8">
          
          {/* Left Column: Global Config */}
          <div className="lg:col-span-4 space-y-8">
            <div className="bg-[#151515] border border-[#222] rounded-3xl p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-6">
                <Settings className="w-5 h-5 text-emerald-500" />
                <h2 className="text-xl font-bold text-white">Global Configuration</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-[#a1a1a6] uppercase tracking-wider mb-2">Business Name</label>
                  <input 
                    type="text" 
                    value={config.businessName}
                    onChange={(e) => setConfig({...config, businessName: e.target.value})}
                    className="w-full bg-black border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors text-sm" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a1a1a6] uppercase tracking-wider mb-2">Website URL</label>
                  <input 
                    type="url" 
                    value={config.websiteUrl}
                    onChange={(e) => setConfig({...config, websiteUrl: e.target.value})}
                    className="w-full bg-black border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors text-sm" 
                  />
                </div>
                
                <div className="pt-4 border-t border-[#222]">
                  <label className="block text-xs font-semibold text-[#a1a1a6] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Key className="w-3 h-3" /> GBP API Key
                  </label>
                  <input 
                    type="password" 
                    value={config.googleApiKey}
                    onChange={(e) => setConfig({...config, googleApiKey: e.target.value})}
                    className="w-full bg-black border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors text-sm font-mono" 
                    placeholder="ya29.a0A..."
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a1a1a6] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <LinkIcon className="w-3 h-3" /> CMS Webhook Token
                  </label>
                  <input 
                    type="password" 
                    value={config.cmsToken}
                    onChange={(e) => setConfig({...config, cmsToken: e.target.value})}
                    className="w-full bg-black border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors text-sm font-mono" 
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-[#a1a1a6] uppercase tracking-wider mb-2 flex items-center gap-2">
                    <Database className="w-3 h-3" /> Directory API Key
                  </label>
                  <input 
                    type="password" 
                    value={config.yextKey}
                    onChange={(e) => setConfig({...config, yextKey: e.target.value})}
                    className="w-full bg-black border border-[#333] rounded-lg px-4 py-2.5 text-white focus:outline-none focus:border-emerald-500 transition-colors text-sm font-mono" 
                  />
                </div>
              </div>
            </div>

            {/* Terminal Console */}
            <div className="bg-[#0f0f10] border border-[#222] rounded-3xl p-6 shadow-xl h-64 flex flex-col">
              <h3 className="text-sm font-bold text-[#a1a1a6] mb-4 uppercase tracking-widest flex items-center gap-2">
                <Server className="w-4 h-4" /> Execution Logs
              </h3>
              <div className="flex-grow overflow-y-auto font-mono text-[11px] text-neutral-400 space-y-2 [&::-webkit-scrollbar]:w-1.5 [&::-webkit-scrollbar-thumb]:bg-[#333] [&::-webkit-scrollbar-thumb]:rounded-full pr-2">
                {logs.length === 0 ? (
                  <span className="text-neutral-600">Awaiting execution...</span>
                ) : (
                  logs.map((log, i) => (
                    <div key={i} className={log.includes('Error') ? 'text-rose-400' : log.includes('Success') ? 'text-emerald-400' : ''}>
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column: Execution Modules */}
          <div className="lg:col-span-8 grid md:grid-cols-2 gap-6 content-start">
            
            {/* Module 1: Schema Injector */}
            <div className="bg-[#151515] border border-[#222] rounded-3xl p-8 flex flex-col shadow-xl">
              <div className="w-12 h-12 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-center justify-center mb-6">
                <Database className="w-6 h-6 text-indigo-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Schema Injector</h3>
              <p className="text-[#a1a1a6] text-sm leading-relaxed flex-grow">
                Uses AI to crawl the provided Website URL, generate optimal JSON-LD structured data, and attempts to push it directly via the CMS Webhook.
              </p>
              {renderModuleButton(schemaState, () => runModule('/api/geotool/schema', setSchemaState, 'Schema Injector'))}
            </div>

            {/* Module 2: Review Engine */}
            <div className="bg-[#151515] border border-[#222] rounded-3xl p-8 flex flex-col shadow-xl">
              <div className="w-12 h-12 bg-amber-500/10 border border-amber-500/20 rounded-2xl flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6 text-amber-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Review Engine</h3>
              <p className="text-[#a1a1a6] text-sm leading-relaxed flex-grow">
                Connects to the Google Business Profile API to fetch unanswered reviews. Generates policy-compliant AI responses and posts them automatically.
              </p>
              {renderModuleButton(reviewState, () => runModule('/api/geotool/reviews', setReviewState, 'Review Engine'))}
            </div>

            {/* Module 3: Citation Broadcaster */}
            <div className="bg-[#151515] border border-[#222] rounded-3xl p-8 flex flex-col shadow-xl md:col-span-2">
              <div className="w-12 h-12 bg-cyan-500/10 border border-cyan-500/20 rounded-2xl flex items-center justify-center mb-6">
                <MapPin className="w-6 h-6 text-cyan-400" />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">Citation Broadcaster</h3>
              <p className="text-[#a1a1a6] text-sm leading-relaxed flex-grow">
                Aligns NAP (Name, Address, Phone) data across 50+ tier-1 directories via external API integrations to build algorithmic authority.
              </p>
              {renderModuleButton(citationState, () => runModule('/api/geotool/citations', setCitationState, 'Citation Broadcaster'))}
            </div>

          </div>
        </div>
      </main>
    </div>
  );
}
