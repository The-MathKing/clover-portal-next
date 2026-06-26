'use client';
import React, { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, X, ImageIcon, Sparkles, AlertCircle, GripVertical } from 'lucide-react';
import { useStore } from '../store/useStore';

const MAX_IMAGES = 20;
const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

interface PreviewFile {
  id: string;
  file: File;
  previewUrl: string;
}

interface WalkthroughUploaderProps {
  propertyId?: string;
  onJobCreated: (jobId: string, totalClips: number) => void;
}

export const WalkthroughUploader: React.FC<WalkthroughUploaderProps> = ({
  propertyId,
  onJobCreated,
}) => {
  const { isAuthenticated, setShowAuthModal } = useStore();
  const [files, setFiles] = useState<PreviewFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── File helpers ─────────────────────────────────────────────────────────────
  const addFiles = useCallback((incoming: File[]) => {
    setError(null);
    const valid = incoming.filter((f) => {
      if (!ACCEPTED_TYPES.includes(f.type)) {
        setError(`"${f.name}" is not a supported image format (JPEG, PNG, WebP).`);
        return false;
      }
      return true;
    });

    setFiles((prev) => {
      const combined = [
        ...prev,
        ...valid.map((file) => ({
          id: `${file.name}-${file.size}-${Date.now()}-${Math.random()}`,
          file,
          previewUrl: URL.createObjectURL(file),
        })),
      ];
      if (combined.length > MAX_IMAGES) {
        setError(`Maximum ${MAX_IMAGES} images. Only the first ${MAX_IMAGES} were kept.`);
        return combined.slice(0, MAX_IMAGES);
      }
      return combined;
    });
  }, []);

  const removeFile = (id: string) => {
    setFiles((prev) => {
      const removed = prev.find((f) => f.id === id);
      if (removed) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((f) => f.id !== id);
    });
  };

  // ── Drag & drop ──────────────────────────────────────────────────────────────
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };
  const handleDragLeave = () => setIsDragging(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    addFiles(Array.from(e.dataTransfer.files));
  };
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(Array.from(e.target.files));
    e.target.value = '';
  };

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!isAuthenticated) {
      setShowAuthModal(true);
      return;
    }
    if (files.length === 0) {
      setError('Please upload at least one image.');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const formData = new FormData();
      if (propertyId) formData.append('propertyId', propertyId);
      files.forEach((f) => formData.append('images', f.file));

      const res = await fetch('/api/walkthrough/create', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to start walkthrough generation.');
      }

      // Clean up object URLs
      files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
      setFiles([]);

      onJobCreated(data.jobId, data.totalClips);
    } catch (err: any) {
      setError(err.message || 'Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const slotsRemaining = MAX_IMAGES - files.length;

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h2 className="text-xl font-bold text-white flex items-center gap-2.5">
          <span className="w-8 h-8 bg-emerald-950/50 border border-emerald-500/30 rounded-lg flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-emerald-400" />
          </span>
          3D Walkthrough Generator
        </h2>
        <p className="text-sm text-neutral-400 mt-1.5">
          Upload up to {MAX_IMAGES} property photos. Our AI will animate each into a 3-second
          cinematic clip and stitch them into one seamless walkthrough video.
        </p>
      </div>

      {/* Drop zone */}
      <motion.div
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()}
        animate={{
          borderColor: isDragging ? 'rgb(52 211 153)' : 'rgb(38 38 38)',
          backgroundColor: isDragging ? 'rgb(6 78 59 / 0.15)' : 'rgb(10 10 10 / 0.4)',
        }}
        transition={{ duration: 0.15 }}
        className="relative border-2 border-dashed rounded-2xl p-8 cursor-pointer flex flex-col items-center justify-center gap-3 group hover:border-emerald-500/50 hover:bg-emerald-950/5 transition-colors min-h-[160px]"
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/jpg,image/png,image/webp"
          className="hidden"
          onChange={handleFileInput}
        />
        <motion.div
          animate={{ scale: isDragging ? 1.15 : 1 }}
          className="w-12 h-12 bg-neutral-900 border border-neutral-800 rounded-xl flex items-center justify-center group-hover:border-emerald-800/50 transition-colors"
        >
          <Upload className="w-5 h-5 text-neutral-500 group-hover:text-emerald-500 transition-colors" />
        </motion.div>
        <div className="text-center">
          <p className="text-sm font-semibold text-neutral-300">
            {isDragging ? 'Drop images here…' : 'Drag & drop images'}
          </p>
          <p className="text-xs text-neutral-500 mt-0.5">
            or <span className="text-emerald-500 underline underline-offset-2">browse files</span> · JPEG, PNG, WebP · up to {MAX_IMAGES} images
          </p>
        </div>
        {slotsRemaining < MAX_IMAGES && (
          <span className="absolute top-3 right-3 text-[11px] font-semibold text-neutral-500 bg-neutral-900 border border-neutral-800 px-2 py-0.5 rounded-full">
            {slotsRemaining} slots left
          </span>
        )}
      </motion.div>

      {/* Error Banner */}
      <AnimatePresence>
        {error && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="flex items-center gap-2.5 px-4 py-3 bg-rose-950/30 border border-rose-800/40 rounded-xl text-sm text-rose-400"
          >
            <AlertCircle className="w-4 h-4 shrink-0" />
            {error}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Image Preview Grid */}
      <AnimatePresence>
        {files.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
          >
            <div className="flex items-center justify-between mb-3">
              <p className="text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                {files.length} {files.length === 1 ? 'image' : 'images'} selected
              </p>
              <button
                onClick={() => {
                  files.forEach((f) => URL.revokeObjectURL(f.previewUrl));
                  setFiles([]);
                }}
                className="text-xs text-neutral-500 hover:text-rose-400 transition-colors"
              >
                Clear all
              </button>
            </div>

            <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 gap-2">
              <AnimatePresence>
                {files.map((f, index) => (
                  <motion.div
                    key={f.id}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.7 }}
                    transition={{ duration: 0.2 }}
                    className="relative group aspect-square rounded-xl overflow-hidden border border-neutral-800 bg-neutral-900"
                  >
                    {/* Clip index badge */}
                    <div className="absolute top-1 left-1 z-10 w-5 h-5 bg-black/70 backdrop-blur-sm rounded-md flex items-center justify-center">
                      <span className="text-[10px] font-bold text-white">{index + 1}</span>
                    </div>

                    {/* Image */}
                    <img
                      src={f.previewUrl}
                      alt={f.file.name}
                      className="w-full h-full object-cover"
                    />

                    {/* Hover overlay */}
                    <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          removeFile(f.id);
                        }}
                        className="w-7 h-7 bg-rose-600 hover:bg-rose-500 rounded-full flex items-center justify-center transition-colors"
                      >
                        <X className="w-3.5 h-3.5 text-white" />
                      </button>
                    </div>
                  </motion.div>
                ))}

                {/* Add more slot */}
                {files.length < MAX_IMAGES && (
                  <motion.button
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    onClick={() => fileInputRef.current?.click()}
                    className="aspect-square rounded-xl border-2 border-dashed border-neutral-800 hover:border-emerald-600/50 flex items-center justify-center transition-colors group/add"
                  >
                    <ImageIcon className="w-5 h-5 text-neutral-700 group-hover/add:text-emerald-600 transition-colors" />
                  </motion.button>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Generate Button */}
      <motion.button
        onClick={handleSubmit}
        disabled={files.length === 0 || isSubmitting}
        whileTap={{ scale: 0.98 }}
        className={`w-full flex items-center justify-center gap-3 py-4 rounded-2xl font-bold text-base transition-all shadow-lg ${
          files.length === 0
            ? 'bg-neutral-900 border border-neutral-800 text-neutral-600 cursor-not-allowed'
            : isSubmitting
            ? 'bg-emerald-700 text-white cursor-wait'
            : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-emerald-950/40 hover:shadow-emerald-900/50 hover:shadow-xl'
        }`}
      >
        {isSubmitting ? (
          <>
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            Uploading Images…
          </>
        ) : (
          <>
            <Sparkles className="w-5 h-5" />
            Generate 3D Walkthrough
            {files.length > 0 && (
              <span className="ml-1 px-2.5 py-0.5 bg-white/20 rounded-full text-sm font-semibold">
                {files.length} {files.length === 1 ? 'clip' : 'clips'}
              </span>
            )}
          </>
        )}
      </motion.button>

      {files.length > 0 && !isSubmitting && (
        <p className="text-center text-xs text-neutral-600">
          ~{files.length * 3}s of footage · estimated generation time:{' '}
          <span className="text-neutral-400">{Math.ceil(files.length * 1.5)} – {files.length * 3} minutes</span>
        </p>
      )}
    </div>
  );
};
