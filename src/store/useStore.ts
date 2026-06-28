'use client';
import { create } from 'zustand';

export interface CloverState {
  // Auth state
  isAuthenticated: boolean;
  setAuthenticated: (status: boolean) => void;
  userId: string | null;
  setUserId: (id: string | null) => void;
  userEmail: string | null;
  setUserEmail: (email: string | null) => void;
  
  // Subscription state
  subscriptionTier: 'free' | 'pro' | 'enterprise';
  setSubscriptionTier: (tier: 'free' | 'pro' | 'enterprise') => void;

  // UI state
  showAuthModal: boolean;
  setShowAuthModal: (show: boolean) => void;
}

export const useStore = create<CloverState>((set) => ({
  isAuthenticated: false,
  setAuthenticated: (status) => set({ isAuthenticated: status }),
  
  userId: null,
  setUserId: (id) => set({ userId: id }),
  
  userEmail: null,
  setUserEmail: (email) => set({ userEmail: email }),

  subscriptionTier: 'free',
  setSubscriptionTier: (tier) => set({ subscriptionTier: tier }),

  showAuthModal: false,
  setShowAuthModal: (show) => set({ showAuthModal: show }),
}));
