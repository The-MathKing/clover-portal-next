'use client';
import React, { useState } from 'react';
import { Sparkles, Wand2, Crown, Zap, GraduationCap, TreePine, Compass, Lock } from 'lucide-react';
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
  const { propertyDetails, generatedScript, setGeneratedScript, voiceProfile, setVoiceProfile, subscriptionTier, setActiveTab } = useStore();
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePreset, setActivePreset] = useState<string | null>(null);
  const [presetAppliedFlash, setPresetAppliedFlash] = useState<string | null>(null);

  const generateScriptWithModifier = (modifier?: string) => {
    setIsGenerating(true);
    setTimeout(() => {
      const address = propertyDetails.address || '124 Bellevue Ave';
      const featuresText = propertyDetails.features && propertyDetails.features.length > 0
        ? `featuring a magnificent ${propertyDetails.features.slice(0, 2).join(' and a ')}`
        : 'boasting incredible modern refinements';
      const desc = propertyDetails.description || 'This estate defines absolute refinement.';

      let script = '';

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
      } else {
        script = `Welcome to an architectural masterpiece. Located at the prestigious address of ${address}, this estate defines ultimate luxury. ${desc} Indulge in state-of-the-art living, ${featuresText}. A truly exceptional lifestyle awaits.`;
      }

      setGeneratedScript(script);
      setIsGenerating(false);
    }, 1500);
  };

  const isFreeUser = subscriptionTier === 'free';

  const handleGenerateScript = () => {
    if (isFreeUser) {
      alert('AI Script Generation requires a paid plan. Please upgrade to use this feature.');
      return;
    }
    setActivePreset(null);
    generateScriptWithModifier();
  };

  const handleApplyPreset = (preset: typeof scriptPresets[0]) => {
    if (isFreeUser) {
      alert('Magic Enhancers require a paid plan. Please upgrade to use this feature.');
      return;
    }
    setActivePreset(preset.id);
    generateScriptWithModifier(preset.prompt);
    setPresetAppliedFlash(preset.id);
    setTimeout(() => setPresetAppliedFlash(null), 1200);
  };

  return (
    <div className="flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl p-6 h-full justify-between" data-tour="script-panel">
      <div className="space-y-6">
        {/* Free User Upgrade Banner */}
        {isFreeUser && (
          <div className="bg-amber-950/30 border border-amber-500/20 rounded-xl p-3 flex items-start gap-3">
            <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-xs font-bold text-amber-300">Free Preview Mode</p>
              <p className="text-[11px] text-amber-400/70 mt-0.5">You can explore the editor, but AI features require a paid plan.</p>
            </div>
          </div>
        )}

        {/* Title */}
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-bold font-heading text-white flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-500" />
            AI Scriptwriter
          </h3>
          <span className="text-xs text-neutral-500 font-medium">BETA</span>
        </div>

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
            <option value="Warm & Inviting">Warm & Inviting</option>
            <option value="Modern & Corporate">Modern & Corporate</option>
            <option value="Luxury & Sophisticated">Luxury & Sophisticated</option>
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

        {/* ✨ AI Script Presets & Magic Enhancers */}
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
    </div>
  );
};
