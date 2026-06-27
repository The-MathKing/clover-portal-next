'use client';
import React, { useEffect, useRef, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  CheckCircle,
  Clock,
  AlertCircle,
  Download,
  Play,
  RotateCcw,
  Video,
  Clapperboard,
  Layers,
  Scissors,
  Loader2,
} from 'lucide-react';

type JobStatus = 'idle' | 'uploading' | 'processing' | 'stitching' | 'complete' | 'failed';

interface StatusResponse {
  jobId: string;
  status: JobStatus;
  clipsReady: number;
  totalClips: number;
  finalVideoUrl: string | null;
  errorMessage: string | null;
}

interface WalkthroughJobStatusProps {
  jobId: string;
  totalClips?: number;
  onReset?: () => void;
  onComplete?: (url: string) => void;
}

// ─── Step definitions ────────────────────────────────────────────────────────
const STEPS: {
  id: JobStatus;
  label: (clipsReady: number, totalClips: number) => string;
  sublabel: string;
  icon: React.ElementType;
}[] = [
  {
    id: 'uploading',
    label: () => 'Uploading Video…',
    sublabel: 'Storing your walkthrough video securely',
    icon: Layers,
  },
  {
    id: 'processing',
    label: () => 'Generating 3D Environment…',
    sublabel: 'Processing Neural Radiance Field (NeRF) / Gaussian Splat',
    icon: Clapperboard,
  },
  {
    id: 'complete',
    label: () => '3D Walkthrough Ready!',
    sublabel: 'Your interactive 3D model is complete',
    icon: CheckCircle,
  },
];

const STEP_ORDER: JobStatus[] = ['uploading', 'processing', 'complete'];

function getStepIndex(status: JobStatus): number {
  return STEP_ORDER.indexOf(status);
}

const POLL_INTERVAL_MS = 3000;

export const WalkthroughJobStatus: React.FC<WalkthroughJobStatusProps> = ({
  jobId,
  totalClips = 0,
  onReset,
  onComplete,
}) => {
  const [status, setStatus] = useState<JobStatus>('processing');
  const [clipsReady, setClipsReady] = useState(0);
  const [finalVideoUrl, setFinalVideoUrl] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ── Poll /api/walkthrough/status ──────────────────────────────────────────
  const poll = useCallback(async () => {
    try {
      const res = await fetch(`/api/walkthrough/status?jobId=${jobId}`);
      if (!res.ok) return;
      const data: StatusResponse = await res.json();

      setStatus(data.status);
      setClipsReady(data.clipsReady);
      if (data.finalVideoUrl) setFinalVideoUrl(data.finalVideoUrl);
      if (data.errorMessage) setErrorMessage(data.errorMessage);

      // Stop polling on terminal states
      if (data.status === 'complete' || data.status === 'failed') {
        if (pollRef.current) clearInterval(pollRef.current);
        if (data.status === 'complete' && data.finalVideoUrl && onComplete) {
          onComplete(data.finalVideoUrl);
        }
      }
    } catch {
      // Silently ignore network errors; polling will retry
    }
  }, [jobId]);

  useEffect(() => {
    poll(); // Immediate first poll
    pollRef.current = setInterval(poll, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [poll]);

  // ── Video player handlers ─────────────────────────────────────────────────
  const handlePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsVideoPlaying(true);
    } else {
      videoRef.current.pause();
      setIsVideoPlaying(false);
    }
  };

  const handleDownload = () => {
    if (!finalVideoUrl) return;
    const a = document.createElement('a');
    a.href = finalVideoUrl;
    a.download = `clover-walkthrough-${jobId.slice(0, 8)}.mp4`;
    a.click();
  };

  const currentStepIndex = getStepIndex(status);
  const progressPct =
    status === 'processing' && totalClips > 0
      ? Math.round((clipsReady / totalClips) * 100)
      : status === 'stitching'
      ? 90
      : status === 'complete'
      ? 100
      : 5;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <span className="w-8 h-8 bg-emerald-950/50 border border-emerald-500/30 rounded-lg flex items-center justify-center">
            <Video className="w-4 h-4 text-emerald-400" />
          </span>
          Generation in Progress
        </h2>
        {status === 'complete' || status === 'failed' ? (
          <button
            onClick={onReset}
            className="flex items-center gap-1.5 text-xs text-neutral-400 hover:text-white transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Start new
          </button>
        ) : null}
      </div>

      {/* ── Progress Steps ─────────────────────────────────────────────────── */}
      <div className="bg-neutral-900/60 border border-neutral-800/60 rounded-2xl p-5 space-y-4">
        {STEPS.map((step, idx) => {
          const isActive = step.id === status;
          const isDone = currentStepIndex > idx || status === 'complete';
          const isPending = currentStepIndex < idx && status !== 'complete';
          const Icon = step.icon;

          return (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: idx * 0.08 }}
              className="flex items-start gap-4"
            >
              {/* Icon / Spinner */}
              <div
                className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-all ${
                  isDone
                    ? 'bg-emerald-950/50 border border-emerald-600/40'
                    : isActive
                    ? 'bg-neutral-800 border border-emerald-500/40'
                    : 'bg-neutral-900 border border-neutral-800'
                }`}
              >
                {isActive && status !== 'complete' ? (
                  <Loader2 className="w-4 h-4 text-emerald-400 animate-spin" />
                ) : isDone ? (
                  <CheckCircle className="w-4 h-4 text-emerald-400" />
                ) : (
                  <Icon className="w-4 h-4 text-neutral-700" />
                )}
              </div>

              {/* Label */}
              <div className="flex-1 pt-0.5">
                <p
                  className={`text-sm font-semibold transition-colors ${
                    isDone
                      ? 'text-emerald-400'
                      : isActive
                      ? 'text-white'
                      : 'text-neutral-600'
                  }`}
                >
                  {step.label(clipsReady, totalClips)}
                </p>
                <p className={`text-xs mt-0.5 ${isActive ? 'text-neutral-400' : 'text-neutral-700'}`}>
                  {step.sublabel}
                </p>

                {/* Clip progress bar (shown only during 'processing') */}
                {isActive && step.id === 'processing' && totalClips > 0 && (
                  <div className="mt-2.5 space-y-1.5">
                    <div className="flex justify-between text-[11px] text-neutral-500">
                      <span>{clipsReady} of {totalClips} clips rendered</span>
                      <span>{progressPct}%</span>
                    </div>
                    <div className="h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                      <motion.div
                        className="h-full bg-gradient-to-r from-emerald-600 to-teal-500 rounded-full"
                        initial={{ width: 0 }}
                        animate={{ width: `${progressPct}%` }}
                        transition={{ duration: 0.5, ease: 'easeOut' }}
                      />
                    </div>
                    {/* Time Estimation */}
                    <div className="flex items-center gap-1.5 pt-1 text-[11px] font-medium text-amber-500/90">
                      <Clock className="w-3.5 h-3.5" />
                      <span>Estimated wait time: ~5-10 minutes. Feel free to close this tab!</span>
                    </div>
                    {/* Mini clip dots */}
                    <div className="flex flex-wrap gap-1 pt-1.5">
                      {Array.from({ length: totalClips }).map((_, i) => (
                        <motion.div
                          key={i}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          transition={{ delay: i * 0.03 }}
                          className={`w-2.5 h-2.5 rounded-sm transition-colors ${
                            i < clipsReady
                              ? 'bg-emerald-500'
                              : i === clipsReady
                              ? 'bg-emerald-800 animate-pulse'
                              : 'bg-neutral-800'
                          }`}
                        />
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Connector line */}
              {idx < STEPS.length - 1 && (
                <div className="absolute left-[2.75rem] mt-9 w-0.5 h-4 bg-neutral-800 -translate-x-1/2" />
              )}
            </motion.div>
          );
        })}
      </div>

      {/* ── Failed State ──────────────────────────────────────────────────── */}
      <AnimatePresence>
        {status === 'failed' && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-start gap-3 px-4 py-4 bg-rose-950/30 border border-rose-800/40 rounded-xl"
          >
            <AlertCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-rose-300">Generation Failed</p>
              <p className="text-xs text-rose-500 mt-0.5">
                {errorMessage || 'An unexpected error occurred. Please try again.'}
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Complete — Video Player ───────────────────────────────────────── */}
      <AnimatePresence>
        {status === 'complete' && finalVideoUrl && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="space-y-4"
          >
            {/* Success badge */}
            <div className="flex items-center gap-2.5 px-4 py-3 bg-emerald-950/30 border border-emerald-600/30 rounded-xl">
              <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-sm font-bold text-emerald-300">Your walkthrough is ready!</p>
                <p className="text-xs text-emerald-600 mt-0.5">
                  {totalClips} clips · ~{totalClips * 3}s · cinematic 3D pan
                </p>
              </div>
            </div>

            {/* 3D Viewer */}
            <div className="relative rounded-2xl overflow-hidden bg-black border border-neutral-800 shadow-2xl shadow-black/60 aspect-video group">
              <iframe
                src={finalVideoUrl}
                className="w-full h-full border-0"
                allow="autoplay; fullscreen; xr-spatial-tracking"
                title="3D Walkthrough Viewer"
              />
            </div>

            {/* View Original link */}
            <motion.a
              whileTap={{ scale: 0.97 }}
              href={finalVideoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full flex items-center justify-center gap-2.5 py-3.5 bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 hover:border-neutral-600 text-white font-semibold rounded-xl transition-all"
            >
              Open Interactive Viewer in New Tab
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Polling indicator ─────────────────────────────────────────────── */}
      {status !== 'complete' && status !== 'failed' && (
        <p className="text-center text-xs text-neutral-700 flex items-center justify-center gap-1.5">
          <span className="w-1.5 h-1.5 bg-emerald-600 rounded-full animate-pulse" />
          Checking for updates every 3 seconds…
        </p>
      )}
    </div>
  );
};
