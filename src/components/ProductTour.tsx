'use client';
import React, { useState, useEffect, useRef } from 'react';
import { X, ChevronRight, ChevronLeft, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useStore } from '../store/useStore';

interface TourStep {
  targetSelector: string;
  title: string;
  description: string;
  position: 'top' | 'bottom' | 'left' | 'right';
}

const tourSteps: TourStep[] = [
  {
    targetSelector: '[data-tour="video-player"]',
    title: '🎬 Cinematic Preview',
    description: 'This is your real-time video preview canvas. Watch your listing photos come alive with Ken Burns effects, crossfades, and AI-powered liquid blending.',
    position: 'bottom',
  },
  {
    targetSelector: '[data-tour="export-button"]',
    title: '🎥 Export Your Tour',
    description: 'When you\'re happy with the preview, click here to export a full HD 1080p video file with audio, ready to upload to Zillow, MLS, or social media.',
    position: 'bottom',
  },
];

export const ProductTour: React.FC = () => {
  const { hasSeenTour, setHasSeenTour, isTourActive, setTourActive } = useStore();
  const [currentStep, setCurrentStep] = useState(0);
  const [tooltipPos, setTooltipPos] = useState({ top: 0, left: 0 });
  const [highlightRect, setHighlightRect] = useState({ top: 0, left: 0, width: 0, height: 0 });
  const tooltipRef = useRef<HTMLDivElement>(null);

  // Auto-start is disabled based on user request. Tour is now started manually via a button in the header.
  useEffect(() => {
    if (!hasSeenTour) {
      setHasSeenTour(true);
    }
  }, [hasSeenTour, setHasSeenTour]);

  // Position tooltip near the target element
  useEffect(() => {
    if (!isTourActive) return;

    const step = tourSteps[currentStep];
    const el = document.querySelector(step.targetSelector);
    
    if (!el) {
      // If element not found, show centered
      setTooltipPos({ top: window.innerHeight / 2 - 100, left: window.innerWidth / 2 - 175 });
      setHighlightRect({ top: 0, left: 0, width: 0, height: 0 });
      return;
    }

    const rect = el.getBoundingClientRect();
    setHighlightRect({
      top: rect.top - 6,
      left: rect.left - 6,
      width: rect.width + 12,
      height: rect.height + 12,
    });

    let top = 0;
    let left = 0;
    const tooltipWidth = Math.min(350, window.innerWidth - 32);
    const tooltipHeight = 200;

    switch (step.position) {
      case 'bottom':
        top = rect.bottom + 16;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'top':
        top = rect.top - tooltipHeight - 16;
        left = rect.left + rect.width / 2 - tooltipWidth / 2;
        break;
      case 'left':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.left - tooltipWidth - 16;
        break;
      case 'right':
        top = rect.top + rect.height / 2 - tooltipHeight / 2;
        left = rect.right + 16;
        break;
    }

    // Clamp to viewport
    top = Math.max(16, Math.min(top, window.innerHeight - tooltipHeight - 16));
    left = Math.max(16, Math.min(left, window.innerWidth - tooltipWidth - 16));

    setTooltipPos({ top, left });

    // Scroll element into view if needed
    el.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [isTourActive, currentStep]);

  const handleNext = () => {
    if (currentStep < tourSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      handleClose();
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setTourActive(false);
    setHasSeenTour(true);
    setCurrentStep(0);
  };

  if (!isTourActive) return null;

  const step = tourSteps[currentStep];

  return (
    <div className="fixed inset-0 z-[200]">
      {/* Backdrop overlay with spotlight cutout */}
      <div className="absolute inset-0 bg-black/70 backdrop-blur-[2px]" onClick={handleClose} />
      
      {/* Spotlight highlight on target element */}
      {highlightRect.width > 0 && (
        <div
          className="absolute rounded-xl border-2 border-emerald-500/60 shadow-[0_0_30px_rgba(16,185,129,0.3)] z-[201] pointer-events-none transition-all duration-300"
          style={{
            top: highlightRect.top,
            left: highlightRect.left,
            width: highlightRect.width,
            height: highlightRect.height,
          }}
        >
          {/* Inner glow pulse */}
          <div className="absolute inset-0 rounded-xl bg-emerald-500/5 animate-pulse" />
        </div>
      )}

      {/* Tooltip card */}
      <motion.div
        ref={tooltipRef}
        key={currentStep}
        initial={{ opacity: 0, scale: 0.9, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 10 }}
        transition={{ duration: 0.25 }}
        className="absolute z-[202] w-[350px] max-w-[calc(100vw-32px)] bg-neutral-900 border border-neutral-700 rounded-2xl shadow-2xl shadow-black/60 overflow-hidden"
        style={{ top: tooltipPos.top, left: tooltipPos.left }}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 pt-5 pb-2">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-emerald-500" />
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider">
              Step {currentStep + 1} of {tourSteps.length}
            </span>
          </div>
          <button
            onClick={handleClose}
            className="p-1 rounded-lg hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 pb-3">
          <h3 className="text-lg font-bold text-white mb-2">{step.title}</h3>
          <p className="text-sm text-neutral-400 leading-relaxed">{step.description}</p>
        </div>

        {/* Progress bar */}
        <div className="px-5 pb-3">
          <div className="w-full h-1 bg-neutral-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-emerald-500 rounded-full transition-all duration-300"
              style={{ width: `${((currentStep + 1) / tourSteps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Navigation */}
        <div className="flex items-center justify-between px-5 pb-5">
          <button
            onClick={handleClose}
            className="text-xs text-neutral-500 hover:text-neutral-300 font-medium transition-colors"
          >
            Skip Tour
          </button>
          <div className="flex items-center gap-2">
            {currentStep > 0 && (
              <button
                onClick={handlePrev}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-sm font-medium transition-colors"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
                Back
              </button>
            )}
            <button
              onClick={handleNext}
              className="flex items-center gap-1 px-4 py-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-bold transition-all shadow-lg shadow-emerald-900/30"
            >
              {currentStep === tourSteps.length - 1 ? 'Finish' : 'Next'}
              {currentStep < tourSteps.length - 1 && <ChevronRight className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
