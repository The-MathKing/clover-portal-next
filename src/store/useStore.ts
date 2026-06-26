'use client';
import { create } from 'zustand';

export interface PropertyImage {
  id: string;
  url: string;
  file?: File;
}

export interface PropertyDetails {
  address: string;
  price: string;
  beds: string;
  baths: string;
  sqft: string;
  description: string;
  features: string[];
}

export type TransitionStyle = 'crossfade' | 'ken-burns-in' | 'ken-burns-out' | 'pan-left' | 'pan-right';

export type RenderingStep =
  | 'analyzing'
  | 'generating-script'
  | 'rendering-video'
  | 'complete';

// ─── Walkthrough Video Job Types ────────────────────────────────────────────
export type WalkthroughJobStatus =
  | 'idle'
  | 'uploading'
  | 'processing'
  | 'stitching'
  | 'complete'
  | 'failed';

export interface WalkthroughJob {
  jobId: string;
  status: WalkthroughJobStatus;
  clipsReady: number;
  totalClips: number;
  finalVideoUrl: string | null;
}

export interface CloverState {
  // Property Data
  propertyDetails: PropertyDetails;
  setPropertyDetails: (details: Partial<PropertyDetails>) => void;

  // Images
  images: PropertyImage[];
  setImages: (images: PropertyImage[]) => void;
  addImage: (image: PropertyImage) => void;
  reorderImages: (startIndex: number, endIndex: number) => void;

  // AI Script & Voice Tone (ElevenLabs removed — will be re-added later)
  generatedScript: string;
  setGeneratedScript: (script: string) => void;
  voiceProfile: string;
  setVoiceProfile: (profile: string) => void;

  // Editor Settings
  engineMode: 'slideshow' | 'ai-video';
  setEngineMode: (mode: 'slideshow' | 'ai-video') => void;
  generativeJobId: string | null;
  setGenerativeJobId: (id: string | null) => void;

  // Transition & Speed Controls
  transitionStyle: TransitionStyle;
  setTransitionStyle: (style: TransitionStyle) => void;
  slideDuration: number; // in seconds
  setSlideDuration: (duration: number) => void;
  crossfadeDuration: number; // in seconds
  setCrossfadeDuration: (duration: number) => void;

  // Rendering Progress
  renderingStep: RenderingStep | null;
  setRenderingStep: (step: RenderingStep | null) => void;

  // Product Tour
  hasSeenTour: boolean;
  setHasSeenTour: (seen: boolean) => void;
  isTourActive: boolean;
  setTourActive: (active: boolean) => void;

  // UI State
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
  isWizardOpen: boolean;
  setWizardOpen: (isOpen: boolean) => void;
  isExporting: boolean;
  setExporting: (isExporting: boolean) => void;
  exportProgress: number;
  setExportProgress: (progress: number) => void;
  videoBlobUrl: string | null;
  setVideoBlobUrl: (url: string | null) => void;
  isAuthenticated: boolean;
  setAuthenticated: (auth: boolean) => void;
  userId: string | null;
  setUserId: (id: string | null) => void;
  userEmail: string | null;
  setUserEmail: (email: string | null) => void;
  subscriptionTier: 'free' | 'starter' | 'unlimited' | 'lifetime';
  setSubscriptionTier: (tier: 'free' | 'starter' | 'unlimited' | 'lifetime') => void;
  generationsRemaining: number;
  setGenerationsRemaining: (count: number) => void;
  activeTab: 'home' | 'examples' | 'my-videos' | 'pricing' | 'walkthrough';
  setActiveTab: (tab: 'home' | 'examples' | 'my-videos' | 'pricing' | 'walkthrough') => void;
  userProperties: any[];
  setProperties: (properties: any[]) => void;
  addPropertyToList: (property: any) => void;
  updateProperty: (id: string, updates: any) => void;
  activePropertyId: string | null;
  setActivePropertyId: (id: string | null) => void;

  // ─── 3D Walkthrough Video Job State ─────────────────────────────────────
  walkthroughJob: WalkthroughJob | null;
  setWalkthroughJob: (job: WalkthroughJob | null) => void;
  updateWalkthroughJob: (updates: Partial<WalkthroughJob>) => void;
}

const defaultProperty: PropertyDetails = {
  address: '',
  price: '',
  beds: '',
  baths: '',
  sqft: '',
  description: '',
  features: [],
};

export const useStore = create<CloverState>((set) => ({
  propertyDetails: defaultProperty,
  setPropertyDetails: (details) =>
    set((state) => ({
      propertyDetails: { ...state.propertyDetails, ...details },
    })),

  images: [],
  setImages: (images) => set({ images }),
  addImage: (image) => set((state) => ({ images: [...state.images, image] })),
  reorderImages: (startIndex, endIndex) =>
    set((state) => {
      const result = Array.from(state.images);
      const [removed] = result.splice(startIndex, 1);
      result.splice(endIndex, 0, removed);
      return { images: result };
    }),

  generatedScript: '',
  setGeneratedScript: (script) => set({ generatedScript: script }),

  voiceProfile: 'Warm & Inviting',
  setVoiceProfile: (profile) => set({ voiceProfile: profile }),

  engineMode: 'ai-video',
  setEngineMode: (mode) => set({ engineMode: mode }),
  generativeJobId: null,
  setGenerativeJobId: (id) => set({ generativeJobId: id }),

  // Transition & Speed Controls
  transitionStyle: 'crossfade',
  setTransitionStyle: (style) => set({ transitionStyle: style }),
  slideDuration: 5,
  setSlideDuration: (duration) => set({ slideDuration: duration }),
  crossfadeDuration: 1.5,
  setCrossfadeDuration: (duration) => set({ crossfadeDuration: duration }),

  // Rendering Progress
  renderingStep: null,
  setRenderingStep: (step) => set({ renderingStep: step }),

  // Product Tour
  hasSeenTour: typeof window !== 'undefined' ? localStorage.getItem('cloverTourSeen') === 'true' : false,
  setHasSeenTour: (seen) => {
    if (typeof window !== 'undefined') localStorage.setItem('cloverTourSeen', seen.toString());
    set({ hasSeenTour: seen });
  },
  isTourActive: false,
  setTourActive: (active) => set({ isTourActive: active }),

  showAuthModal: false,
  setShowAuthModal: (show) => set({ showAuthModal: show }),

  isWizardOpen: false,
  setWizardOpen: (isOpen) => set({ isWizardOpen: isOpen }),

  isExporting: false,
  setExporting: (isExporting) => set({ isExporting }),
  exportProgress: 0,
  setExportProgress: (progress) => set({ exportProgress: progress }),
  videoBlobUrl: null,
  setVideoBlobUrl: (url) => set({ videoBlobUrl: url }),

  isAuthenticated: typeof window !== 'undefined' ? localStorage.getItem('cloverAuth') === 'true' : false,
  setAuthenticated: (auth) => {
    if (typeof window !== 'undefined') localStorage.setItem('cloverAuth', auth.toString());
    set({ isAuthenticated: auth });
  },

  userId: null,
  setUserId: (id) => set({ userId: id }),

  userEmail: null,
  setUserEmail: (email) => set({ userEmail: email }),

  subscriptionTier: 'free',
  setSubscriptionTier: (tier) => set({ subscriptionTier: tier }),

  generationsRemaining: 0,
  setGenerationsRemaining: (count) => set({ generationsRemaining: count }),

  activeTab: 'home',
  setActiveTab: (tab) => set({ activeTab: tab }),

  userProperties: [],
  setProperties: (properties) => set({ userProperties: properties }),
  addPropertyToList: (property) => set((state) => ({
    userProperties: [property, ...state.userProperties]
  })),
  updateProperty: (id, updates) => set((state) => ({
    userProperties: state.userProperties.map(p => p.id === id ? { ...p, ...updates } : p)
  })),

  activePropertyId: null,
  setActivePropertyId: (id) => set({ activePropertyId: id }),

  // ─── 3D Walkthrough Video Job State ─────────────────────────────────────
  walkthroughJob: null,
  setWalkthroughJob: (job) => set({ walkthroughJob: job }),
  updateWalkthroughJob: (updates) =>
    set((state) => ({
      walkthroughJob: state.walkthroughJob
        ? { ...state.walkthroughJob, ...updates }
        : null,
    })),
}));
