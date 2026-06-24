'use client';
import React, { useState, useEffect, useRef } from 'react';
import { Sparkles, Square, Volume2, Key, Wand2, Crown, Zap, GraduationCap, TreePine, Compass } from 'lucide-react';
import { useStore } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

// ─── AI Script Preset Modifiers ─────────────────────────────────────────────
const scriptPresets = [
  { id: 'luxurious', label: 'Make it Luxurious', icon: Crown, color: 'amber', prompt: 'luxurious and opulent' },
  { id: 'punchy', label: 'Keep it Punchy', icon: Zap, color: 'cyan', prompt: 'short, punchy, and action-oriented' },
  { id: 'school', label: 'Highlight Schools', icon: GraduationCap, color: 'violet', prompt: 'family-friendly and highlighting nearby top-rated schools' },
  { id: 'nature', label: 'Emphasize Nature', icon: TreePine, color: 'emerald', prompt: 'nature-focused with outdoor living and scenic views' },
  { id: 'adventure', label: 'Lifestyle Focus', icon: Compass, color: 'rose', prompt: 'lifestyle-focused and aspirational' },
];

export const ScriptPanel: React.FC = () => {
  const { propertyDetails, generatedScript, setGeneratedScript, voiceProfile, setVoiceProfile } = useStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [isPlayingTTS, setIsPlayingTTS] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [presetAppliedFlash, setPresetAppliedFlash] = useState<string | null>(null);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioSourceRef = useRef<AudioBufferSourceNode | null>(null);

  // Fetch SpeechSynthesis voices
  useEffect(() => {
    const loadVoices = () => {
      if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
        setAvailableVoices(window.speechSynthesis.getVoices());
      }
    };
    loadVoices();
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  const generateScriptWithModifier = (modifier?: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      const address = propertyDetails.address || '124 Bellevue Ave';
      const featuresText = propertyDetails.features && propertyDetails.features.length > 0 
        ? `featuring a magnificent ${propertyDetails.features.slice(0, 2).join(' and a ')}`
        : 'boasting incredible modern refinements';
      const desc = propertyDetails.description || 'This estate defines absolute refinement.';
      
      let script = '';

      // Apply modifier-specific language
      if (modifier === 'luxurious') {
        script = `Welcome to an unparalleled masterpiece of opulence at ${address}. ${desc} Every meticulously curated detail speaks of extraordinary wealth and taste, ${featuresText}. This is not merely a home — it is a statement of prestige. An invitation to live at the pinnacle of luxury.`;
      } else if (modifier === 'short, punchy, and action-oriented') {
        script = `${address}. Premium location. Stunning design. ${featuresText}. Move-in ready. Don't wait — schedule your private showing today.`;
      } else if (modifier?.includes('school')) {
        script = `Families, take note. ${address} sits in one of the top-rated school districts in the area. ${desc} Beyond the academics, this home is perfect for growing families, ${featuresText}. Your children's future starts at the front door.`;
      } else if (modifier?.includes('nature')) {
        script = `Immerse yourself in nature's embrace at ${address}. ${desc} Floor-to-ceiling windows frame breathtaking views, while the outdoor living spaces blend seamlessly with the landscape, ${featuresText}. Wake up to birdsong and fall asleep under the stars.`;
      } else if (modifier?.includes('lifestyle')) {
        script = `Imagine your perfect day. Morning yoga on the private terrace at ${address}. Afternoon entertaining by the pool. Evening cocktails as the sun sets over your domain. ${desc} This home isn't just four walls — it's the backdrop to your best life, ${featuresText}.`;
      } else if (voiceProfile.includes('Warm')) {
        script = `Welcome home. Step inside ${address}. ${desc} Every corner of this residence is designed to make you feel comfortable yet pampered, ${featuresText}. Come experience the warmth for yourself.`;
      } else if (voiceProfile.includes('Modern')) {
        script = `Introducing a premier real estate asset at ${address}. Offering a strategic layout, ${desc} This modern workspace and living environment is highly optimized for performance, ${featuresText}. Contact us to arrange a showing.`;
      } else { // Luxury
        script = `Welcome to an architectural masterpiece. Located at the prestigious address of ${address}, this estate defines ultimate luxury. ${desc} Indulge in state-of-the-art living, ${featuresText}. A truly exceptional lifestyle awaits.`;
      }
      
      setGeneratedScript(script);
      setIsGenerating(false);
    }, 1500);
  };

  const handleGenerateScript = () => {
    setActivePreset(null);
    generateScriptWithModifier();
  };

  const handleApplyPreset = (preset: typeof scriptPresets[0]) => {
    if (!generatedScript && !propertyDetails.address) {
      // Generate fresh script with the modifier
      setActivePreset(preset.id);
      generateScriptWithModifier(preset.prompt);
    } else {
      // Regenerate with modifier applied
      setActivePreset(preset.id);
      generateScriptWithModifier(preset.prompt);
    }
    // Flash feedback
    setPresetAppliedFlash(preset.id);
    setTimeout(() => setPresetAppliedFlash(null), 1200);
  };

  const stopTTS = () => {
    if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    if (audioSourceRef.current) {
      audioSourceRef.current.stop();
      audioSourceRef.current.disconnect();
      audioSourceRef.current = null;
    }
    setIsPlayingTTS(false);
  };

  const playElevenLabsTTS = async () => {
    // Map profiles to ElevenLabs voice IDs
    let voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Default: Bella (Warm)
    if (voiceProfile.includes('Warm')) voiceId = 'EXAVITQu4vr4xnSDxMaL'; // Bella
    else if (voiceProfile.includes('Modern')) voiceId = 'VR6AewLTigWG4xSOukaG'; // Adam
    else if (voiceProfile.includes('Luxury')) voiceId = 'ThT5KcBeYPX3keUQqHPh'; // Dorothy

    try {
      const response = await fetch('/api/ai/tts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: generatedScript,
          voiceId: voiceId
        })
      });

      if (!response.ok) throw new Error('Failed to fetch from ElevenLabs');
      
      const arrayBuffer = await response.arrayBuffer();
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      }
      
      const audioBuffer = await audioContextRef.current.decodeAudioData(arrayBuffer);
      audioSourceRef.current = audioContextRef.current.createBufferSource();
      audioSourceRef.current.buffer = audioBuffer;
      audioSourceRef.current.connect(audioContextRef.current.destination);
      
      audioSourceRef.current.onended = () => setIsPlayingTTS(false);
      audioSourceRef.current.start();
    } catch (e) {
      console.error(e);
      alert('Error playing ElevenLabs voice. Check API key.');
      setIsPlayingTTS(false);
    }
  };

  const playBrowserTTS = () => {
    const utterance = new SpeechSynthesisUtterance(generatedScript);
    let selectedVoice: SpeechSynthesisVoice | null = null;
    
    if (voiceProfile.includes('Warm')) {
      selectedVoice = availableVoices.find(v => v.name.includes('Google') || v.name.includes('Samantha')) || null;
      utterance.rate = 0.95; utterance.pitch = 1.05;
    } else if (voiceProfile.includes('Modern')) {
      selectedVoice = availableVoices.find(v => v.name.includes('Daniel') || v.name.includes('Male')) || null;
      utterance.rate = 1.05; utterance.pitch = 0.95;
    } else {
      selectedVoice = availableVoices.find(v => v.name.includes('Serena') || v.name.includes('Karen') || v.name.includes('Google UK English Female')) || null;
      utterance.rate = 0.85; utterance.pitch = 1.0;
    }

    if (selectedVoice) utterance.voice = selectedVoice;
    utterance.onend = () => setIsPlayingTTS(false);
    utterance.onerror = () => setIsPlayingTTS(false);

    window.speechSynthesis.speak(utterance);
  };

  const handlePreviewVoiceover = async () => {
    if (!generatedScript) return;

    if (isPlayingTTS) {
      stopTTS();
      return;
    }

    setIsPlayingTTS(true);

    // Try server-side TTS first, if it fails fallback to browser TTS (for demo without keys)
    try {
      await playElevenLabsTTS();
    } catch {
      playBrowserTTS();
    }
  };

  // Clean up speech on unmount
  useEffect(() => {
    return () => {
      stopTTS();
    };
  }, []);

  return (
    <div className="flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl p-6 h-full justify-between" data-tour="script-panel">
      <div className="space-y-6">
        {/* Title */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            AI Scriptwriter
          </h3>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="text-neutral-500 hover:text-emerald-400 transition-colors"
              title="API Settings"
            >
              <Key className="w-4 h-4" />
            </button>
            <span className="text-xs text-neutral-500 font-medium">BETA</span>
          </div>
        </div>

        {/* API Settings Panel removed, now server-side */}

        {/* Tone Selector */}
        <div>
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            Narrator Tone
          </label>
          <select
            value={voiceProfile}
            onChange={(e) => setVoiceProfile(e.target.value)}
            className="w-full bg-neutral-950 border border-neutral-850 focus:border-emerald-500 rounded-lg px-4 py-3 text-sm text-neutral-300 focus:outline-none transition-colors cursor-pointer"
          >
            <option value="Warm & Inviting (Rachel)">Warm & Inviting (Rachel)</option>
            <option value="Modern & Corporate (Adam)">Modern & Corporate (Adam)</option>
            <option value="Luxury & Sophisticated (Dorothy)">Luxury & Sophisticated (Dorothy)</option>
          </select>
        </div>

        {/* Generator Button */}
        <button
          onClick={handleGenerateScript}
          disabled={isGenerating}
          className="w-full flex items-center justify-center gap-2 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 text-white font-semibold rounded-lg shadow-lg shadow-emerald-950/20 transition-all active:scale-[0.98]"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Writing Script...
            </>
          ) : (
            <>
              <Sparkles className="w-4 h-4" />
              Generate Narrative Script
            </>
          )}
        </button>

        {/* ✨ AI Script Presets & Magic Enhancer (NEW) */}
        <div data-tour="ai-presets">
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
            <Wand2 className="w-3.5 h-3.5 text-violet-400" />
            Magic Enhancers
          </label>
          <div className="flex flex-wrap gap-2">
            {scriptPresets.map((preset) => (
              <motion.button
                key={preset.id}
                onClick={() => handleApplyPreset(preset)}
                disabled={isGenerating}
                whileTap={{ scale: 0.95 }}
                className={`relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border disabled:opacity-50 ${
                  activePreset === preset.id
                    ? `bg-${preset.color}-950/30 border-${preset.color}-500/40 text-${preset.color}-400`
                    : 'bg-neutral-950 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                }`}
              >
                <preset.icon className="w-3.5 h-3.5" />
                {preset.label}
                {/* Flash feedback */}
                <AnimatePresence>
                  {presetAppliedFlash === preset.id && (
                    <motion.div
                      initial={{ opacity: 1, scale: 1 }}
                      animate={{ opacity: 0, scale: 1.5 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.8 }}
                      className="absolute inset-0 rounded-lg bg-emerald-500/20 pointer-events-none"
                    />
                  )}
                </AnimatePresence>
              </motion.button>
            ))}
          </div>
        </div>

        {/* Script Output Area */}
        <div>
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
            Narration Script
          </label>
          <textarea
            value={generatedScript}
            onChange={(e) => setGeneratedScript(e.target.value)}
            rows={8}
            placeholder="Click 'Generate Narrative Script' or write your own narration script here..."
            className="w-full bg-neutral-950 border border-neutral-850 focus:border-emerald-500 rounded-lg px-4 py-3 text-sm text-neutral-350 placeholder-neutral-600 focus:outline-none transition-colors resize-none leading-relaxed"
          />
        </div>
      </div>

      {/* Voiceover preview button */}
      <div className="pt-4 border-t border-neutral-850 mt-6">
        <button
          onClick={handlePreviewVoiceover}
          disabled={!generatedScript}
          className={`w-full flex items-center justify-center gap-2 py-3.5 rounded-lg font-semibold transition-all shadow-md ${
            isPlayingTTS 
              ? 'bg-rose-950/30 text-rose-450 border border-rose-800/30 hover:bg-rose-950/50' 
              : 'bg-neutral-800 hover:bg-neutral-750 text-neutral-205 border border-neutral-700/50 disabled:opacity-50'
          }`}
        >
          {isPlayingTTS ? (
            <>
              <Square className="w-4 h-4 fill-rose-500 text-rose-500" />
              Stop Voiceover Preview
            </>
          ) : (
            <>
              <Volume2 className="w-4 h-4 text-emerald-500" />
              Preview AI Voiceover
            </>
          )}
        </button>
      </div>
    </div>
  );
};
