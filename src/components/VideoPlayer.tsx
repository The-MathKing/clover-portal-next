'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Music, Sliders, Check, Loader2 } from 'lucide-react';
import { useStore } from '../store/useStore';
import type { TransitionStyle, RenderingStep } from '../store/useStore';
import { motion, AnimatePresence } from 'framer-motion';

// ─── Audio Track Library ─────────────────────────────────────────────────────
// All tracks are royalty-free (Mixkit / Pixabay CC0 licensed)
export const AUDIO_TRACKS = [
  {
    id: 'none',
    label: 'No Music',
    description: 'Silent',
    emoji: '🔇',
    url: null,
  },
  {
    id: 'luxury-piano',
    label: 'Luxury Piano',
    description: 'Elegant & upscale',
    emoji: '🎹',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3',
  },
  {
    id: 'warm-acoustic',
    label: 'Warm Acoustic',
    description: 'Inviting & homey',
    emoji: '🎸',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-2.mp3',
  },
  {
    id: 'modern-ambient',
    label: 'Modern Ambient',
    description: 'Contemporary & clean',
    emoji: '✨',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-3.mp3',
  },
  {
    id: 'cinematic-strings',
    label: 'Cinematic Strings',
    description: 'Dramatic & inspiring',
    emoji: '🎻',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-4.mp3',
  },
  {
    id: 'upbeat-family',
    label: 'Upbeat & Bright',
    description: 'Fun & family-friendly',
    emoji: '🌟',
    url: 'https://www.soundhelix.com/examples/mp3/SoundHelix-Song-5.mp3',
  },
];

// ─── Rendering Progress Tracker ─────────────────────────────────────────────
const renderingSteps: { key: RenderingStep; label: string; icon: string }[] = [
  { key: 'analyzing', label: 'Analyzing listing details', icon: '🔍' },
  { key: 'generating-script', label: 'Generating script with AI', icon: '✍️' },
  { key: 'rendering-video', label: 'Rendering HD video stream', icon: '🎬' },
  { key: 'complete', label: 'Export complete!', icon: '✅' },
];

const RenderingProgress: React.FC<{ currentStep: RenderingStep | null; progress: number }> = ({ currentStep, progress }) => {
  if (!currentStep) return null;

  const currentIdx = renderingSteps.findIndex(s => s.key === currentStep);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="absolute inset-0 z-20 bg-neutral-950/90 backdrop-blur-sm flex flex-col items-center justify-center p-8"
    >
      <div className="w-full max-w-sm space-y-4">
        <div className="text-center mb-6">
          <div className="text-2xl mb-2">🎬</div>
          <h3 className="text-lg font-bold text-white">Creating Your Video Tour</h3>
          <p className="text-xs text-neutral-400 mt-1">{Math.round(progress)}% complete</p>
        </div>

        {/* Progress bar */}
        <div className="w-full h-2 bg-neutral-800 rounded-full overflow-hidden mb-6">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-600 to-teal-400 rounded-full"
            initial={{ width: '0%' }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.3 }}
          />
        </div>

        {/* Step-by-step progress */}
        <div className="space-y-3">
          {renderingSteps.map((step, i) => {
            const isComplete = i < currentIdx;
            const isCurrent = i === currentIdx;
            const isPending = i > currentIdx;

            return (
              <motion.div
                key={step.key}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-xl transition-all ${
                  isCurrent ? 'bg-emerald-950/30 border border-emerald-500/30' : 
                  isComplete ? 'bg-neutral-900/50' : 'opacity-40'
                }`}
              >
                <div className="w-6 h-6 flex items-center justify-center">
                  {isComplete ? (
                    <Check className="w-4 h-4 text-emerald-500" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                  ) : (
                    <span className="text-sm">{step.icon}</span>
                  )}
                </div>
                <span className={`text-sm font-medium ${
                  isCurrent ? 'text-emerald-400' : isComplete ? 'text-neutral-400' : 'text-neutral-500'
                }`}>
                  {step.label}
                </span>
              </motion.div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
};


// ─── Main Video Player Component ────────────────────────────────────────────
export const VideoPlayer: React.FC = () => {
  const { 
    images, propertyDetails, isExporting, setExporting, setExportProgress, setVideoBlobUrl, subscriptionTier,
    transitionStyle, setTransitionStyle, slideDuration, setSlideDuration, crossfadeDuration, setCrossfadeDuration,
    renderingStep, setRenderingStep, engineMode, setEngineMode
  } = useStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const audioElemRef = useRef<HTMLAudioElement | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const [playing, setPlaying] = useState(true);
  const [currentTime, setCurrentTime] = useState(0); // in ms
  const [muted, setMuted] = useState(true);
  const [audioTrack, setAudioTrack] = useState('luxury-piano');
  const [showTransitionControls, setShowTransitionControls] = useState(false);

  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const loadedImagesRef = useRef<{ [url: string]: HTMLImageElement }>({});

  const SLIDE_DURATION = slideDuration * 1000;
  const CROSSFADE_DURATION = crossfadeDuration * 1000;
  const totalDuration = images.length * SLIDE_DURATION;

  const selectedTrack = AUDIO_TRACKS.find((t) => t.id === audioTrack) ?? AUDIO_TRACKS[0];

  // Preload all images
  useEffect(() => {
    images.forEach((img) => {
      if (!loadedImagesRef.current[img.url]) {
        const htmlImg = new Image();
        htmlImg.src = img.url;
        htmlImg.onload = () => {
          loadedImagesRef.current[img.url] = htmlImg;
        };
      }
    });
  }, [images]);

  // Initialise / swap audio element when track changes
  useEffect(() => {
    // Clean up previous element
    if (audioElemRef.current) {
      audioElemRef.current.pause();
      audioElemRef.current.src = '';
    }
    if (!selectedTrack.url) {
      audioElemRef.current = null;
      return;
    }
    const audio = new Audio(selectedTrack.url);
    audio.loop = true;
    audio.volume = 0.25;
    audio.crossOrigin = 'anonymous';
    audioElemRef.current = audio;
  }, [audioTrack]);

  // Play / pause the audio element in sync with the presentation
  useEffect(() => {
    if (isExporting) return; // Handled separately during export
    const audio = audioElemRef.current;
    if (!audio) return;
    if (playing && !muted) {
      audio.play().catch(() => {/* autoplay blocked — user must interact first */});
    } else {
      audio.pause();
    }
  }, [playing, muted, isExporting]);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      audioElemRef.current?.pause();
    };
  }, []);

  // Simulate rendering progress steps during export
  useEffect(() => {
    if (!isExporting) {
      setRenderingStep(null);
      return;
    }

    // Simulate step-by-step rendering progress
    setRenderingStep('analyzing');
    const timers = [
      setTimeout(() => setRenderingStep('generating-script'), 800),
      setTimeout(() => setRenderingStep('rendering-video'), 2500),
    ];

    return () => timers.forEach(clearTimeout);
  }, [isExporting, setRenderingStep]);

  // Handle Export Initialization
  useEffect(() => {
    if (isExporting && canvasRef.current) {
      setPlaying(false);
      setCurrentTime(0);
      // Stop preview audio
      if (audioElemRef.current) {
        audioElemRef.current.pause();
        audioElemRef.current.currentTime = 0;
      }

      const canvas = canvasRef.current;
      let canvasStream: MediaStream;

      try {
        if ((canvas as any).captureStream) {
          canvasStream = (canvas as any).captureStream(30);
        } else if ((canvas as any).mozCaptureStream) {
          canvasStream = (canvas as any).mozCaptureStream(30);
        } else {
          throw new Error('captureStream is not supported in this browser.');
        }
      } catch (err) {
        console.error(err);
        alert('Video export is not supported in this browser. Please use Chrome or Edge.');
        setExporting(false);
        return;
      }

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const dest = audioCtx.createMediaStreamDestination();

      // Route the selected audio track into the export stream
      if (selectedTrack.url && audioElemRef.current) {
        const source = audioCtx.createMediaElementSource(audioElemRef.current);
        const gainNode = audioCtx.createGain();
        gainNode.gain.value = 0.4;
        source.connect(gainNode);
        gainNode.connect(dest);
        // Also connect to speakers so the user hears it during export
        gainNode.connect(audioCtx.destination);
        audioElemRef.current.play().catch(() => {});
      }

      // Create a unified stream with explicit track merging for cross-browser support
      const combinedTracks = [
        ...canvasStream.getVideoTracks(),
        ...dest.stream.getAudioTracks()
      ];
      const combinedStream = new MediaStream(combinedTracks);

      const chunks: BlobPart[] = [];
      
      // Determine the best supported MIME type
      let mimeType = '';
      if (MediaRecorder.isTypeSupported('video/webm;codecs=vp8,opus')) {
        mimeType = 'video/webm;codecs=vp8,opus';
      } else if (MediaRecorder.isTypeSupported('video/webm')) {
        mimeType = 'video/webm';
      } else if (MediaRecorder.isTypeSupported('video/mp4')) {
        mimeType = 'video/mp4'; // Fallback for Safari
      }

      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(combinedStream, options);

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunks.push(e.data);
      };

      mediaRecorder.onstop = () => {
        // Use the resolved mimeType, or default to video/webm
        const finalMimeType = mimeType || 'video/webm';
        const blob = new Blob(chunks, { type: finalMimeType });
        const url = URL.createObjectURL(blob);
        setVideoBlobUrl(url);
        setRenderingStep('complete');
        audioCtx.close();
      };

      try {
        mediaRecorder.start();
        mediaRecorderRef.current = mediaRecorder;

        // Start the export loop
        lastTimeRef.current = performance.now();
        setPlaying(true);
      } catch (err) {
        console.error("Failed to start MediaRecorder:", err);
        alert("Failed to start video rendering. Please try using a different browser.");
        setExporting(false);
      }
    }
  }, [isExporting, audioTrack]);

  // Animation Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (images.length === 0) {
        ctx.fillStyle = '#171717';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.fillStyle = '#6b7280';
        ctx.font = '20px Outfit, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('No images uploaded yet', canvas.width / 2, canvas.height / 2);
        return;
      }

      const slideTime = currentTime % SLIDE_DURATION;
      const currentIdx = Math.floor(currentTime / SLIDE_DURATION) % images.length;
      const nextIdx = (currentIdx + 1) % images.length;

      const currentImgObj = images[currentIdx];
      const nextImgObj = images[nextIdx];

      const currentImg = loadedImagesRef.current[currentImgObj?.url];
      const nextImg = loadedImagesRef.current[nextImgObj?.url];

      const isGenerativeMode = engineMode === 'ai-video';
      const useLiquidMorph = engineMode === 'ai-video';

      const isCrossFading = slideTime > (SLIDE_DURATION - CROSSFADE_DURATION);

      if (currentImg) {
        ctx.save();
        if (useLiquidMorph && isCrossFading) {
          let transitionProgress = (slideTime - (SLIDE_DURATION - CROSSFADE_DURATION)) / CROSSFADE_DURATION;
          transitionProgress = transitionProgress * transitionProgress * (3 - 2 * transitionProgress);
          
          const displacementFilter = document.getElementById('ai-liquid-morph-displacement');
          const turbulenceFilter = document.getElementById('ai-liquid-morph-noise');
          if (displacementFilter || turbulenceFilter) {
            const scaleVal = Math.sin(transitionProgress * Math.PI) * 75;
            displacementFilter?.setAttribute('scale', scaleVal.toString());
            const freqVal = 0.015 + Math.sin(transitionProgress * Math.PI) * 0.015;
            turbulenceFilter?.setAttribute('baseFrequency', freqVal.toString());
          }
          ctx.filter = 'url(#ai-liquid-morph)';
          ctx.globalAlpha = 1 - transitionProgress;
        } else if (useLiquidMorph) {
          // Reset filter scale when not crossfading
          const displacementFilter = document.getElementById('ai-liquid-morph-displacement');
          displacementFilter?.setAttribute('scale', '0');
        }
        
        drawKenBurnsImage(ctx, canvas, currentImg, slideTime, SLIDE_DURATION, currentIdx, isGenerativeMode);
        ctx.restore();
      }

      if (isCrossFading && nextImg) {
        let transitionProgress = (slideTime - (SLIDE_DURATION - CROSSFADE_DURATION)) / CROSSFADE_DURATION;
        transitionProgress = transitionProgress * transitionProgress * (3 - 2 * transitionProgress);
        
        ctx.save();
        if (useLiquidMorph) {
          ctx.filter = 'url(#ai-liquid-morph)';
        }
        ctx.globalAlpha = transitionProgress;
        drawKenBurnsImage(ctx, canvas, nextImg, slideTime - (SLIDE_DURATION - CROSSFADE_DURATION), CROSSFADE_DURATION, nextIdx, isGenerativeMode);
        ctx.restore();
      }

      // Draw text overlay (without liquid filter!)
      ctx.save();
      const textIdx = isCrossFading && (slideTime - (SLIDE_DURATION - CROSSFADE_DURATION) > CROSSFADE_DURATION / 2) ? nextIdx : currentIdx;
      drawTextOverlay(ctx, canvas, propertyDetails, textIdx);
      ctx.restore();



      // Draw Free Tier Watermark
      if (subscriptionTier === 'free') {
        ctx.save();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
        ctx.font = 'bold 28px Inter, system-ui, sans-serif';
        ctx.textAlign = 'right';
        ctx.textBaseline = 'bottom';
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 4;
        ctx.fillText('Made with Clovrr - Sell Your Home Fast', canvas.width - 30, canvas.height - 30);
        ctx.restore();
      }
    };

    render();
  }, [currentTime, images, propertyDetails, engineMode, SLIDE_DURATION, CROSSFADE_DURATION]);

  // Handle requestAnimationFrame
  useEffect(() => {
    const loop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const elapsed = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      setCurrentTime((prev) => {
        const nextTime = prev + elapsed;
        
        if (!isExporting && nextTime >= totalDuration) {
          return 0; // Loop presentation in normal mode
        }
        
        return nextTime;
      });

      if (playing) {
        animationRef.current = requestAnimationFrame(loop);
      }
    };

    if (playing) {
      animationRef.current = requestAnimationFrame(loop);
    } else {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
      lastTimeRef.current = null;
    }

    return () => {
      if (animationRef.current) cancelAnimationFrame(animationRef.current);
    };
  }, [playing, totalDuration, isExporting]);

  // Handle export progress tracking (decoupled from the animation loop setter to avoid anti-patterns)
  useEffect(() => {
    if (isExporting && totalDuration > 0) {
      setExportProgress((currentTime / totalDuration) * 100);
      if (currentTime >= totalDuration) {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        setPlaying(false);
      }
    }
  }, [currentTime, isExporting, totalDuration, setExportProgress]);

  // Helper: Draw image with Ken Burns scale and pan (respects transition style)
  const drawKenBurnsImage = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    img: HTMLImageElement,
    time: number,
    duration: number,
    index: number,
    isGenerativeMode = false
  ) => {
    const progress = time / duration;
    
    // Determine zoom/pan direction based on transitionStyle
    let zoomIn = index % 2 === 0;
    let panDirection: 'none' | 'left' | 'right' = 'none';

    switch (transitionStyle) {
      case 'ken-burns-in':
        zoomIn = true;
        break;
      case 'ken-burns-out':
        zoomIn = false;
        break;
      case 'pan-left':
        panDirection = 'left';
        break;
      case 'pan-right':
        panDirection = 'right';
        break;
      case 'crossfade':
      default:
        // Use alternating zoom for crossfade
        break;
    }
    
    const startScale = zoomIn ? 1.05 : 1.2;
    const endScale = zoomIn ? 1.2 : 1.05;
    
    // Add extra smooth movement in Generative AI mode
    let currentScale = startScale + (endScale - startScale) * progress;
    let rotation = 0;
    let extraX = 0;
    let extraY = 0;

    if (isGenerativeMode) {
      // Continuous camera drift / parallax simulation
      // Subtle sine wave rotation: -0.6 to +0.6 degrees
      rotation = Math.sin((currentTime / 1000) * 0.4) * 0.01; // in radians
      // Subtle 3D-like zoom wiggle
      currentScale += Math.cos((currentTime / 1000) * 0.3) * 0.02;
      // Extra slow horizontal/vertical drift
      extraX = Math.sin((currentTime / 1000) * 0.25) * 12;
      extraY = Math.cos((currentTime / 1000) * 0.18) * 8;
    }

    // Apply pan direction
    if (panDirection === 'left') {
      extraX = -progress * 60;
    } else if (panDirection === 'right') {
      extraX = progress * 60;
    }

    const startX = zoomIn ? 0 : -35;
    const endX = zoomIn ? -35 : 0;
    const currentX = startX + (endX - startX) * progress + extraX;

    const imgWidth = img.width;
    const imgHeight = img.height;
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;

    const scaleX = canvasWidth / imgWidth;
    const scaleY = canvasHeight / imgHeight;
    const baseScale = Math.max(scaleX, scaleY);

    const w = imgWidth * baseScale * currentScale;
    const h = imgHeight * baseScale * currentScale;
    const x = (canvasWidth - w) / 2 + currentX;
    const y = (canvasHeight - h) / 2 + extraY;

    if (rotation !== 0) {
      ctx.translate(canvasWidth / 2, canvasHeight / 2);
      ctx.rotate(rotation);
      ctx.translate(-canvasWidth / 2, -canvasHeight / 2);
    }

    ctx.drawImage(img, x, y, w, h);
  };

  // Helper: Draw glowing AI watermark/badge
  const drawAIBadge = (ctx: CanvasRenderingContext2D) => {
    ctx.save();
    
    // Draw badge background
    const x = 40;
    const y = 40;
    const w = 155;
    const h = 30;
    const r = 6;

    ctx.beginPath();
    ctx.roundRect ? ctx.roundRect(x, y, w, h, r) : ctx.rect(x, y, w, h);
    ctx.closePath();

    ctx.fillStyle = 'rgba(10, 10, 10, 0.75)'; 
    ctx.fill();
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = 'rgba(16, 185, 129, 0.6)'; // Emerald border
    ctx.stroke();

    // Pulse dot
    ctx.beginPath();
    const dotAlpha = 0.5 + Math.sin(Date.now() / 150) * 0.5;
    ctx.arc(x + 18, y + 15, 4, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(16, 185, 129, ${dotAlpha})`;
    ctx.fill();
    
    // Core dot
    ctx.beginPath();
    ctx.arc(x + 18, y + 15, 2, 0, Math.PI * 2);
    ctx.fillStyle = '#10b981';
    ctx.fill();

    // Text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 9px Inter, system-ui, sans-serif';
    ctx.textAlign = 'left';
    ctx.textBaseline = 'middle';
    ctx.fillText('AI GENERATED VIDEO', x + 30, y + 15);

    ctx.restore();
  };

  // Helper: Draw cinematic text overlays
  const drawTextOverlay = (
    ctx: CanvasRenderingContext2D,
    canvas: HTMLCanvasElement,
    details: typeof propertyDetails,
    slideIndex: number
  ) => {
    const address = details.address || 'Premium Listing';
    const features = details.features || [];
    
    const gradient = ctx.createLinearGradient(0, canvas.height - 180, 0, canvas.height);
    gradient.addColorStop(0, 'rgba(0,0,0,0)');
    gradient.addColorStop(1, 'rgba(0,0,0,0.85)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, canvas.height - 180, canvas.width, 180);

    ctx.textAlign = 'left';
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 28px Outfit, sans-serif';
    ctx.fillText(address, 48, canvas.height - 70);

    ctx.fillStyle = '#059669'; // Emerald
    ctx.font = 'semibold 16px Inter, sans-serif';
    
    let subtitleText = '';
    if (slideIndex === 0) {
      subtitleText = `Exclusive Tour • ${details.price || ''} • ${details.beds || '0'} Beds • ${details.baths || '0'} Baths`;
    } else if (features[slideIndex - 1]) {
      subtitleText = `Feature Highlight • ${features[slideIndex - 1]}`;
    } else {
      subtitleText = `Luxury Residence Details`;
    }
    
    ctx.fillText(subtitleText.toUpperCase(), 48, canvas.height - 110);
  };

  const handleTimelineChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (isExporting) return;
    const nextPercentage = parseFloat(e.target.value);
    setCurrentTime((nextPercentage / 100) * totalDuration);
  };

  const isAudioActive = playing && !muted && audioTrack !== 'none';

  return (
    <div className="flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl p-6 overflow-hidden" data-tour="video-player">
      {/* Hidden SVG for displacement filter */}
      <svg style={{ position: 'absolute', width: 0, height: 0, pointerEvents: 'none' }} width="0" height="0">
        <defs>
          <filter id="ai-liquid-morph">
            <feTurbulence
              id="ai-liquid-morph-noise"
              type="fractalNoise"
              baseFrequency="0.02"
              numOctaves="2"
              result="noise"
              seed="1"
            />
            <feDisplacementMap
              id="ai-liquid-morph-displacement"
              in="SourceGraphic"
              in2="noise"
              scale="0"
              xChannelSelector="R"
              yChannelSelector="G"
              result="warp"
            />
          </filter>
        </defs>
      </svg>

      <div className="relative aspect-video w-full bg-black rounded-xl overflow-hidden shadow-2xl border border-neutral-850">
        <canvas
          ref={canvasRef}
          width={1280}
          height={720}
          className="w-full h-full object-contain"
        />
        
        {isExporting && (
          <>
            <div className="absolute top-4 right-4 px-3 py-1 bg-red-500/20 backdrop-blur rounded-full text-xs font-semibold tracking-wider text-red-400 border border-red-500/30 flex items-center gap-2 uppercase z-10">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              Exporting...
            </div>
            {/* Rendering Progress Overlay */}
            <RenderingProgress currentStep={renderingStep} progress={useStore.getState().exportProgress} />
          </>
        )}

        {/* Audio Visualizer overlay (bottom right corner) */}
        {/* Audio playing indicator */}
        <AnimatePresence>
          {isAudioActive && (
            <motion.div
              initial={{ opacity: 0, y: 5 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 5 }}
              className="absolute bottom-4 right-4 z-10 bg-black/60 backdrop-blur-sm rounded-lg px-3 py-2 border border-emerald-500/20 flex items-center gap-2"
            >
              <Volume2 className="w-3 h-3 text-emerald-500" />
              <span className="text-[11px] font-semibold text-emerald-400">
                {selectedTrack.emoji} {selectedTrack.label}
              </span>
              <div className="flex items-end gap-[2px] h-4 ml-1">
                {[40, 70, 50, 90, 60, 80, 45, 65].map((h, i) => (
                  <div
                    key={i}
                    className="w-[3px] rounded-full bg-emerald-500/70"
                    style={{
                      height: `${h}%`,
                      animation: `pulse ${0.6 + i * 0.1}s ease-in-out infinite alternate`,
                    }}
                  />
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <div className={`mt-6 space-y-4 ${isExporting ? 'opacity-50 pointer-events-none' : ''}`}>
        <div className="flex items-center gap-4">
          <span className="text-xs font-semibold text-neutral-400 select-none">
            {new Date(currentTime).toISOString().substr(14, 5)}
          </span>
          <input
            type="range"
            min="0"
            max="100"
            step="0.1"
            value={totalDuration > 0 ? (currentTime / totalDuration) * 100 : 0}
            onChange={handleTimelineChange}
            className="flex-1 h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
          <span className="text-xs font-semibold text-neutral-400 select-none">
            {new Date(totalDuration).toISOString().substr(14, 5)}
          </span>
        </div>



        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pt-2">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setPlaying(!playing)}
              className="p-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl shadow-lg transition-transform active:scale-95"
            >
              {playing ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
            </button>
            <button
              onClick={() => setCurrentTime(0)}
              className="p-3 bg-neutral-800 hover:bg-neutral-750 border border-neutral-700/50 text-neutral-300 hover:text-white rounded-xl transition-all"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
            {/* Audio Track Selector */}
            <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-850 px-3 py-2 rounded-lg text-sm text-neutral-450 flex-1 sm:flex-none overflow-hidden">
              <Music className="w-4 h-4 shrink-0 text-emerald-500" />
              <select
                value={audioTrack}
                onChange={(e) => setAudioTrack(e.target.value)}
                className="bg-transparent border-none text-neutral-300 font-medium focus:outline-none cursor-pointer truncate w-full"
              >
                {AUDIO_TRACKS.map((track) => (
                  <option key={track.id} value={track.id} className="bg-neutral-900">
                    {track.emoji} {track.label} — {track.description}
                  </option>
                ))}
              </select>
            </div>

            <button
              onClick={() => setMuted(!muted)}
              disabled={audioTrack === 'none'}
              className="p-3 bg-neutral-800 hover:bg-neutral-750 border border-neutral-700/50 text-neutral-300 hover:text-white rounded-xl transition-all disabled:opacity-50"
            >
              {muted || audioTrack === 'none' ? <VolumeX className="w-4 h-4 text-rose-450" /> : <Volume2 className="w-4 h-4 text-emerald-450" />}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
