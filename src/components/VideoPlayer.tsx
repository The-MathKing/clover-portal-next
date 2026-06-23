'use client';
import React, { useEffect, useRef, useState } from 'react';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Music } from 'lucide-react';
import { useStore } from '../store/useStore';

// Web Audio API ambient music synthesizer
class AmbientSynthesizer {
  private ctx: AudioContext | null = null;
  private oscillators: OscillatorNode[] = [];
  private gainNode: GainNode | null = null;
  private destNode: MediaStreamAudioDestinationNode | null = null;
  private isPlaying = false;
  private volume = 0.3;

  start(audioCtx?: AudioContext, dest?: MediaStreamAudioDestinationNode) {
    if (this.isPlaying) return;
    this.ctx = audioCtx || new (window.AudioContext || (window as any).webkitAudioContext)();
    this.gainNode = this.ctx.createGain();
    
    this.gainNode.gain.setValueAtTime(0, this.ctx.currentTime);
    this.gainNode.gain.linearRampToValueAtTime(this.volume, this.ctx.currentTime + 2);
    
    // Connect to speaker
    if (!dest) {
      this.gainNode.connect(this.ctx.destination);
    } else {
      // Connect to media stream export destination only
      this.destNode = dest;
      this.gainNode.connect(this.destNode);
    }

    // Create a beautiful, warm ambient chord pad (E Maj7 or similar)
    const freqs = [164.81, 220.00, 246.94, 329.63, 440.00]; // E3, A3, B3, E4, A4
    freqs.forEach((freq) => {
      if (!this.ctx || !this.gainNode) return;
      const osc = this.ctx.createOscillator();
      const oscGain = this.ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.ctx.currentTime);
      
      // Add subtle volume LFO to make it drift
      oscGain.gain.setValueAtTime(0.15 / freqs.length, this.ctx.currentTime);
      
      osc.connect(oscGain);
      oscGain.connect(this.gainNode);
      osc.start();
      this.oscillators.push(osc);
    });

    this.isPlaying = true;
  }

  stop() {
    if (!this.isPlaying) return;
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.linearRampToValueAtTime(0, this.ctx.currentTime + 0.5);
      setTimeout(() => {
        this.oscillators.forEach(osc => {
          try { osc.stop(); } catch(e){}
        });
        this.oscillators = [];
        // Only close if we created it
        if (!this.destNode) {
          this.ctx?.close();
        }
        this.isPlaying = false;
      }, 600);
    }
  }

  setVolume(vol: number) {
    this.volume = vol;
    if (this.gainNode && this.ctx) {
      this.gainNode.gain.linearRampToValueAtTime(vol, this.ctx.currentTime + 0.1);
    }
  }
}

export const VideoPlayer: React.FC = () => {
  const { images, propertyDetails, isExporting, setExportProgress, setVideoBlobUrl } = useStore();
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const synthRef = useRef<AmbientSynthesizer | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0); // in ms
  const [muted, setMuted] = useState(true);
  const [audioTrack, setAudioTrack] = useState('luxury-ambient');

  // AI Video Blending States
  const [engineMode, setEngineMode] = useState<'slideshow' | 'ai-video'>('ai-video');

  const animationRef = useRef<number | null>(null);
  const lastTimeRef = useRef<number | null>(null);
  const loadedImagesRef = useRef<{ [url: string]: HTMLImageElement }>({});

  const SLIDE_DURATION = 5000; // 5 seconds total slot per image
  const CROSSFADE_DURATION = 1500; // 1.5 second cross-fade
  const totalDuration = images.length * SLIDE_DURATION;

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

  // Audio synthesizer lifecycle
  useEffect(() => {
    synthRef.current = new AmbientSynthesizer();
    return () => {
      synthRef.current?.stop();
    };
  }, []);

  // Handle play/pause music for normal viewing
  useEffect(() => {
    if (isExporting) return; // Managed separately during export
    if (playing && !muted && audioTrack !== 'none') {
      synthRef.current?.start();
      synthRef.current?.setVolume(0.2);
    } else {
      synthRef.current?.stop();
    }
  }, [playing, muted, audioTrack, isExporting]);

  // Handle Export Initialization
  useEffect(() => {
    if (isExporting && canvasRef.current) {
      setPlaying(false);
      setCurrentTime(0);
      synthRef.current?.stop();

      const canvas = canvasRef.current;
      const canvasStream = canvas.captureStream(30);

      const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const dest = audioCtx.createMediaStreamDestination();

      if (audioTrack !== 'none') {
        const exportSynth = new AmbientSynthesizer();
        exportSynth.start(audioCtx, dest);
        exportSynth.setVolume(0.5);
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
        audioCtx.close();
      };

      mediaRecorder.start();
      mediaRecorderRef.current = mediaRecorder;

      // Start the export loop
      lastTimeRef.current = performance.now();
      setPlaying(true);
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

      // Draw AI Generated Badge on the Canvas if Generated Video mode is on
      if (isGenerativeMode) {
        drawAIBadge(ctx);
      }
    };

    render();
  }, [currentTime, images, propertyDetails, engineMode]);

  // Handle requestAnimationFrame
  useEffect(() => {
    const loop = (timestamp: number) => {
      if (!lastTimeRef.current) lastTimeRef.current = timestamp;
      const elapsed = timestamp - lastTimeRef.current;
      lastTimeRef.current = timestamp;

      setCurrentTime((prev) => {
        const nextTime = prev + elapsed;
        
        if (isExporting) {
          setExportProgress((nextTime / totalDuration) * 100);
          if (nextTime >= totalDuration) {
            // Export finished!
            if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
              mediaRecorderRef.current.stop();
            }
            setPlaying(false);
            return totalDuration;
          }
        } else if (nextTime >= totalDuration) {
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

  // Helper: Draw image with Ken Burns scale and pan
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
    const zoomIn = index % 2 === 0;
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

  return (
    <div className="flex flex-col bg-neutral-900 border border-neutral-800 rounded-2xl p-6 overflow-hidden">
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
          <div className="absolute top-4 right-4 px-3 py-1 bg-red-500/20 backdrop-blur rounded-full text-xs font-semibold tracking-wider text-red-400 border border-red-500/30 flex items-center gap-2 uppercase z-10">
            <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
            Exporting...
          </div>
        )}
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

        {/* Rendering Engine Selector */}
        <div className="bg-neutral-950/60 border border-neutral-850 p-4 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-neutral-400 uppercase tracking-wider text-left block">Video Blend Mode</span>
            <p className="text-xs text-neutral-500 text-left">Choose how images are stitched and blended together.</p>
          </div>
          <div className="flex bg-neutral-900 border border-neutral-800 p-1 rounded-lg self-start md:self-auto">
            <button
              onClick={() => {
                setEngineMode('slideshow');
              }}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all ${
                engineMode === 'slideshow'
                  ? 'bg-neutral-800 text-white shadow-sm'
                  : 'text-neutral-450 hover:text-neutral-250'
              }`}
            >
              Classic Slideshow
            </button>
            <button
              onClick={() => setEngineMode('ai-video')}
              className={`px-4 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center gap-2 ${
                engineMode === 'ai-video'
                  ? 'bg-emerald-600 text-white shadow-md'
                  : 'text-neutral-455 hover:text-neutral-250'
              }`}
            >
              <span className={`w-2 h-2 rounded-full ${engineMode === 'ai-video' ? 'bg-emerald-200 animate-pulse' : 'bg-emerald-500'}`} />
              AI Blended Video
            </button>
          </div>
        </div>

        <div className="flex justify-between items-center pt-2">
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

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 bg-neutral-950 border border-neutral-850 px-3 py-2 rounded-lg text-sm text-neutral-450">
              <Music className="w-4 h-4 text-emerald-500" />
              <select
                value={audioTrack}
                onChange={(e) => setAudioTrack(e.target.value)}
                className="bg-transparent border-none text-neutral-300 font-medium focus:outline-none cursor-pointer"
              >
                <option value="luxury-ambient" className="bg-neutral-900">Luxury Chord Pad (Web Audio)</option>
                <option value="none" className="bg-neutral-900">No Music</option>
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
